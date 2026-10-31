"""Recorder load: which entities, integrations and event types write the most.

Only reads the recorder; nothing is stored and Housekeeper never changes the recorder
configuration. The query is the expensive part, so it shares the lock of the reliability query,
is kept for a few minutes and is cut into small steps: one count per entity, one count with
attribute sizes for the last day, the peak hour of only the loudest entities, and the event types.

A row without a new state value is an attribute-only update: Home Assistant stores
``last_changed_ts`` only when the state value did not change. Truly identical updates are not
written at all, so "identical updates" cannot be measured; "updates without a new state" can.
"""

from __future__ import annotations

import time
from typing import Any

from homeassistant.core import HomeAssistant

from .cleanup import USAGE_RELATIONS
from .const import IGNORE_LABEL
from .maintenance import exclusion_suggested, usage_counts
from .meter import recorder_ready
from .payloads import StormsResult
from .queries import DayCache, ReplyStore, cached_query, kept_reply, pieces
from .reliability import entry_info

DAY = 86400
WINDOWS = (1, 7, 30)  # days; the finished days of a long window come from the day cache
CACHE_SECONDS = 600
PEAK_ENTITIES = 30  # entities whose peak hour is measured
EVENT_TYPES = 15
TABLE_LIMIT = 100
STORM_PEAK_ROWS = 3600  # rows in the busiest hour
STORM_ROWS_PER_DAY = 50000
FLOOD_ATTR_BYTES = 4096  # mean attribute length of a row
FLOOD_MIN_ROWS_PER_DAY = 1000
NO_NEW_STATE_SHARE = 0.8
NO_NEW_STATE_MIN_ROWS_PER_DAY = 1000
SHARE_PERCENT = 25
SHARE_MIN_ROWS_PER_DAY = 10000
EVENT_BURST = 100000
CHAIN_DEPTH = 3
ROW_OVERHEAD = 100  # bytes a row costs besides its attributes (state text, timestamps, indexes): a rough weight
STATE_CHANGED = "state_changed"
THRESHOLDS = {
    "storm_peak_rows": STORM_PEAK_ROWS,
    "storm_rows_per_day": STORM_ROWS_PER_DAY,
    "flood_attr_bytes": FLOOD_ATTR_BYTES,
    "flood_min_rows_per_day": FLOOD_MIN_ROWS_PER_DAY,
    "no_new_state_share": NO_NEW_STATE_SHARE,
    "no_new_state_min_rows_per_day": NO_NEW_STATE_MIN_ROWS_PER_DAY,
    "share_percent": SHARE_PERCENT,
    "share_min_rows_per_day": SHARE_MIN_ROWS_PER_DAY,
    "event_burst": EVENT_BURST,
    "chain_depth": CHAIN_DEPTH,
}


def query_storms(
    hass: HomeAssistant, start: float, end: float, days: DayCache | None = None
) -> dict[str, Any]:
    """Blocking: row counts per entity and the busiest event types in [start, end].

    With ``days`` the counts of finished days are taken from it (or read once and put there),
    including each entity's busiest hour of that day; only the rest of the window is read.
    """
    from homeassistant.components.recorder.db_schema import StateAttributes, States
    from homeassistant.components.recorder.util import session_scope
    from sqlalchemy import Integer, cast, func, select

    started = time.monotonic()
    entities: dict[str, dict[str, Any]] = {}
    events: dict[str, int] = {}
    ids: dict[int, str] = {}
    peaks: dict[str, int] = {}
    live: list[tuple[float, float, bool]] = []
    day_start = max(start, end - DAY)
    bucket = cast(States.last_updated_ts / 3600, Integer)
    with session_scope(hass=hass, read_only=True) as session:
        for begin, finish, keep in (
            pieces(start, end, days.oldest) if days else [(start, end, False)]
        ):
            last = finish >= end
            part = days.get(begin) if keep and days else None
            if part is None:
                part = _count_piece(session, begin, finish, last=last, peaks=keep)
                if keep and days:
                    days.put(begin, part)
            if not keep:
                live.append((begin, finish, last))
            for metadata_id, (entity_id, rows, attr_rows) in part["entities"].items():
                ids[metadata_id] = entity_id
                entity = entities.setdefault(entity_id, {"rows": 0, "attr_rows": 0})
                entity["rows"] += rows
                entity["attr_rows"] += attr_rows
            for event_type, count in part["events"].items():
                events[event_type] = events.get(event_type, 0) + count
            for entity_id, peak in (part.get("peaks") or {}).items():
                peaks[entity_id] = max(peaks.get(entity_id, 0), peak)
        # The attribute length is read over the last day only; it is the costly join.
        for metadata_id, rows, size in session.execute(
            select(
                States.metadata_id,
                func.count(),
                func.sum(func.length(StateAttributes.shared_attrs)),
            )
            .outerjoin(StateAttributes, States.attributes_id == StateAttributes.attributes_id)
            .where(States.last_updated_ts >= day_start, States.last_updated_ts <= end)
            .group_by(States.metadata_id)
        ).all():
            entity = entities.get(ids.get(metadata_id, ""))
            if entity is not None:
                entity["day_rows"] = int(rows)
                entity["day_bytes"] = int(size or 0)
        loudest = sorted(ids, key=lambda i: entities[ids[i]]["rows"], reverse=True)[:PEAK_ENTITIES]
        for metadata_id in loudest:
            if ids[metadata_id] in peaks:
                entities[ids[metadata_id]]["peak_hour"] = peaks[ids[metadata_id]]
        if loudest:
            # Day borders are hour borders, so the busiest hour of a kept day and of the rest compare.
            for begin, finish, last in live:
                for metadata_id, count in session.execute(
                    select(States.metadata_id, func.count())
                    .where(
                        States.metadata_id.in_(loudest),
                        States.last_updated_ts >= begin,
                        States.last_updated_ts <= finish
                        if last
                        else States.last_updated_ts < finish,
                    )
                    .group_by(States.metadata_id, bucket)
                ).all():
                    entity = entities[ids[metadata_id]]
                    entity["peak_hour"] = max(entity.get("peak_hour", 0), int(count))
    return {
        "start": start,
        "end": end,
        "entities": entities,
        "events": events,
        "took_ms": round((time.monotonic() - started) * 1000),
    }


def _count_piece(
    session: Any, start: float, end: float, *, last: bool, peaks: bool
) -> dict[str, Any]:
    """Blocking: rows per entity and per event type in [start, end), with ``last`` also at ``end``.

    With ``peaks`` the busiest hour of every entity is counted as well (for a day that is kept).
    """
    from homeassistant.components.recorder.db_schema import (
        Events,
        EventTypes,
        States,
        StatesMeta,
    )
    from sqlalchemy import Integer, case, cast, func, select

    upto = States.last_updated_ts <= end if last else States.last_updated_ts < end
    no_new_state = func.sum(case((States.last_changed_ts.is_not(None), 1), else_=0))
    found: dict[str, Any] = {"entities": {}, "events": {}}
    for metadata_id, entity_id, rows, attr_rows in session.execute(
        select(States.metadata_id, StatesMeta.entity_id, func.count(), no_new_state)
        .join(StatesMeta, States.metadata_id == StatesMeta.metadata_id)
        .where(States.last_updated_ts >= start, upto)
        .group_by(States.metadata_id, StatesMeta.entity_id)
    ).all():
        found["entities"][metadata_id] = (entity_id, int(rows), int(attr_rows or 0))
    if peaks:
        bucket = cast(States.last_updated_ts / 3600, Integer)
        hourly = (
            select(States.metadata_id.label("mid"), func.count().label("n"))
            .where(States.last_updated_ts >= start, upto)
            .group_by(States.metadata_id, bucket)
            .subquery()
        )
        found["peaks"] = {
            found["entities"][mid][0]: int(n)
            for mid, n in session.execute(
                select(hourly.c.mid, func.max(hourly.c.n)).group_by(hourly.c.mid)
            ).all()
            if mid in found["entities"]
        }
    fired = Events.time_fired_ts <= end if last else Events.time_fired_ts < end
    for event_type, count in session.execute(
        select(EventTypes.event_type, func.count())
        .select_from(Events)
        .join(EventTypes, Events.event_type_id == EventTypes.event_type_id)
        .where(Events.time_fired_ts >= start, fired)
        .group_by(EventTypes.event_type)
    ).all():
        if event_type:
            found["events"][event_type] = int(count)
    return found


def followers(edges: list[dict[str, Any]], key: str, depth: int = CHAIN_DEPTH) -> dict[str, int]:
    """Count what depends on ``key`` through certain usage edges, up to ``depth`` steps, by type."""
    by_target: dict[str, list[str]] = {}
    for edge in edges:
        if (
            edge.get("relation") in USAGE_RELATIONS
            and edge.get("confidence", "certain") == "certain"
        ):
            by_target.setdefault(edge["target"], []).append(edge["source"])
    seen = {key}
    frontier = [key]
    for _ in range(depth):
        nxt = []
        for node in frontier:
            for source in by_target.get(node, ()):
                if source not in seen:
                    seen.add(source)
                    nxt.append(source)
        frontier = nxt
    counts: dict[str, int] = {}
    for node in seen - {key}:
        kind = node.split(":", 1)[0]
        counts[kind] = counts.get(kind, 0) + 1
    return counts


def evaluate_storms(
    raw: dict[str, Any],
    entities: dict[str, dict[str, Any]],
    entries: dict[str, dict[str, Any]],
    edges: list[dict[str, Any]],
    ignored: set[str],
    window_days: int,
) -> dict[str, Any]:
    """Judge the counts. ``entities`` maps entity_id to name, config entry and platform."""
    counts = raw["entities"]
    used = usage_counts(edges)
    days = max(window_days, 1)
    total_rows = sum(item["rows"] for item in counts.values())
    known_bytes = sum(item.get("day_bytes", 0) for item in counts.values())
    known_rows = sum(item.get("day_rows", 0) for item in counts.values())
    mean_all = known_bytes / known_rows if known_rows else 0.0
    rows_list: list[dict[str, Any]] = []
    groups: dict[str, dict[str, Any]] = {}
    for entity_id, item in counts.items():
        if entity_id in ignored:
            continue
        info = entities.get(entity_id, {})
        rows = item["rows"]
        day_rows = item.get("day_rows", 0)
        mean_len = item.get("day_bytes", 0) / day_rows if day_rows else None
        row = {
            "entity_id": entity_id,
            "name": info.get("name"),
            "entry_id": info.get("config_entry_id"),
            "rows": rows,
            "per_day": round(rows / days),
            "no_new_state": round(item["attr_rows"] / rows, 3) if rows else 0.0,
            "attr_bytes": round(mean_len) if mean_len is not None else None,
            "peak_hour": item.get("peak_hour"),
            "rows_24h": day_rows,
            "used": used.get(entity_id, 0),
            "has_statistics": bool(info.get("has_statistics")),
            "suggest_exclude": exclusion_suggested(
                known=entity_id in entities,
                uses=used.get(entity_id, 0),
                has_statistics=bool(info.get("has_statistics")),
                rate=day_rows,
            ),
        }
        rows_list.append(row)
        entry = entries.get(info.get("config_entry_id") or "")
        platform = info.get("platform") or entity_id.split(".", 1)[0]
        group_key = info.get("config_entry_id") or f"platform:{platform}"
        group = groups.setdefault(
            group_key,
            {
                "entry_id": info.get("config_entry_id"),
                "title": (entry or {}).get("title") or platform,
                "domain": (entry or {}).get("domain") or platform,
                "rows": 0,
                "load": 0.0,
                "entities": 0,
            },
        )
        group["rows"] += rows
        group["entities"] += 1
        group["load"] += rows * ((mean_len if mean_len is not None else mean_all) + ROW_OVERHEAD)
    rows_list.sort(key=lambda r: r["rows"], reverse=True)
    total_load = sum(g["load"] for g in groups.values())
    integrations = []
    for group in sorted(groups.values(), key=lambda g: g["load"], reverse=True)[:20]:
        integrations.append(
            {
                "entry_id": group["entry_id"],
                "title": group["title"],
                "domain": group["domain"],
                "entities": group["entities"],
                "rows": group["rows"],
                "per_day": round(group["rows"] / days),
                "row_share": round(100 * group["rows"] / total_rows, 1) if total_rows else 0.0,
                "load_share": round(100 * group["load"] / total_load, 1) if total_load else 0.0,
            }
        )
    findings: list[dict[str, Any]] = []
    for row in rows_list:
        entity_id = row["entity_id"]
        found: list[dict[str, Any]] = []

        peak = row["peak_hour"] or 0
        if peak >= STORM_PEAK_ROWS or row["per_day"] >= STORM_ROWS_PER_DAY:
            found.append(
                dict(kind="storm", per_day=row["per_day"], peak_hour=peak, rows=row["rows"])
            )
        day_rows = counts[entity_id].get("day_rows", 0)
        if (
            row["attr_bytes"] is not None
            and row["attr_bytes"] >= FLOOD_ATTR_BYTES
            and day_rows >= FLOOD_MIN_ROWS_PER_DAY
        ):
            found.append(
                dict(kind="attribute_flood", per_day=day_rows, attr_bytes=row["attr_bytes"])
            )
        if (
            row["no_new_state"] >= NO_NEW_STATE_SHARE
            and row["per_day"] >= NO_NEW_STATE_MIN_ROWS_PER_DAY
        ):
            found.append(
                dict(
                    kind="no_new_state",
                    per_day=row["per_day"],
                    share=round(100 * row["no_new_state"]),
                )
            )
        if found:
            chain = followers(edges, f"entity:{entity_id}")
            base = {
                "entity_id": entity_id,
                "name": row["name"],
                "window_days": days,
                "followers": chain,
            }
            findings.extend({**base, **item} for item in found)
    for group in integrations:
        if group["load_share"] >= SHARE_PERCENT and group["per_day"] >= SHARE_MIN_ROWS_PER_DAY:
            findings.append(
                {
                    "kind": "integration_share",
                    "entry_id": group["entry_id"],
                    "title": group["title"],
                    "window_days": days,
                    "per_day": group["per_day"],
                    "load_share": group["load_share"],
                    "row_share": group["row_share"],
                }
            )
    event_list = sorted(raw["events"].items(), key=lambda kv: kv[1], reverse=True)
    event_total = sum(count for _, count in event_list)
    for event_type, count in event_list:
        if event_type != STATE_CHANGED and count >= EVENT_BURST:
            findings.append(
                {
                    "kind": "event_burst",
                    "event_type": event_type,
                    "count": count,
                    "window_days": days,
                }
            )
    order = {
        "storm": 0,
        "attribute_flood": 1,
        "no_new_state": 2,
        "integration_share": 3,
        "event_burst": 4,
    }
    findings.sort(key=lambda f: (order[f["kind"]], -(f.get("per_day") or f.get("count") or 0)))
    return {
        "window_days": days,
        "total_rows": total_rows,
        "per_day": round(total_rows / days),
        "entity_count": len(rows_list),
        "excluded": {"ignored": sum(1 for entity_id in counts if entity_id in ignored)},
        "entities": rows_list[:TABLE_LIMIT],
        "integrations": integrations,
        "events": [{"type": t, "count": c} for t, c in event_list[:EVENT_TYPES]],
        "event_total": event_total,
        "state_changed_events": raw["events"].get(STATE_CHANGED, 0),
        "findings": findings,
        "took_ms": raw.get("took_ms"),
    }


def mark_excluded(hass: HomeAssistant, result: dict[str, Any]) -> dict[str, Any]:
    """Say per entity whether the recorder's filter keeps it out, as it stands now.

    Done on every answer and not in the kept reply, so it is right after a restart too. Without a
    filter, or when it cannot be read, the rows stay as they are.
    """
    entities = result.get("entities")
    if not entities:
        return result
    try:
        from homeassistant.components.recorder import get_instance

        entity_filter = getattr(get_instance(hass), "entity_filter", None)
        if entity_filter is None:
            return result
        marked = [{**row, "excluded": not entity_filter(row["entity_id"])} for row in entities]
    except Exception:
        return result
    return {**result, "entities": marked}


async def storms(
    hass: HomeAssistant,
    snapshot: dict[str, Any],
    *,
    window_days: int = 1,
    refresh: bool = False,
    store: ReplyStore | None = None,
) -> StormsResult:
    """Recorder load per entity, integration and event type for the last day or week."""
    if not recorder_ready(hass):
        return {"available": False, "findings": []}
    now = time.time()
    key = f"storms:{window_days}"
    kept = None if refresh else kept_reply(store, key, now, CACHE_SECONDS)
    if kept is not None:
        return kept  # type: ignore[return-value]
    days = DayCache(hass, "storms")
    found = await cached_query(
        hass,
        key,
        CACHE_SECONDS,
        lambda: query_storms(hass, now - window_days * DAY, now, days),
        refresh=refresh,
    )
    if found.busy:
        held = kept_reply(store, key, now, CACHE_SECONDS, stale=True)
        if held is not None:
            return held  # type: ignore[return-value]
        return {"available": True, "busy": True, "findings": [], "window_days": window_days}
    info = {
        item["object_id"]: {
            "name": item.get("name"),
            "config_entry_id": item.get("config_entry_id"),
            "platform": item.get("platform"),
            "has_statistics": item.get("has_statistics"),
        }
        for item in snapshot["objects"]
        if item["object_type"] == "entity"
    }
    ignored = {f["object_id"] for f in snapshot.get("findings", []) if f.get("ignored")} | {
        item["object_id"]
        for item in snapshot["objects"]
        if item["object_type"] == "entity"
        and (IGNORE_LABEL in (item.get("labels") or []) or item.get("excepted"))
    }
    result = evaluate_storms(
        found.raw, info, await entry_info(hass), snapshot.get("edges", []), ignored, window_days
    )
    reply = {
        "available": True,
        "busy": False,
        "cached": found.cached,
        "stale": False,
        "age_seconds": 0,
        "computed_at": now,
        "thresholds": THRESHOLDS,
        **result,
    }
    if store is not None:
        store.keep(key, reply)
    return reply  # type: ignore[return-value]
