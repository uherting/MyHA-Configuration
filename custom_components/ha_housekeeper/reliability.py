"""Integration reliability: how available each config entry's entities were, and shared outages.

Everything here only reads Home Assistant (the recorder, the registries, the config entries).
The recorder query is the expensive part: it never runs twice at the same time, and the last
finished reply is kept (also on disk), so the view opens at once with the last numbers while a
new calculation runs. A regular background run keeps that reply from getting old.
"""

from __future__ import annotations

import time
from datetime import UTC, datetime, tzinfo
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import IGNORE_LABEL
from .meter import recorder_ready
from .payloads import ReliabilityResult
from .queries import ReplyStore, cached_query, kept_reply

DAY = 86400
WINDOWS = (1, 7)  # days
CACHE_SECONDS = 300
MEMBER_LIMIT = 15  # entities with downtime listed per config entry
CHUNK = 500  # entities per second-pass query
SHARED_SHARE = 80  # percent of an entry's entities that must be down together
SHARED_MIN_ENTITIES = 3
SHARED_MIN_SECONDS = 300
PERMANENT_SHARE = 0.99  # share of the observed time spent unavailable
CLOUD_CLASSES = {"cloud_polling", "cloud_push"}
UNSTABLE_MIN_EPISODES = 3
UNSTABLE_PER_DAY = 0.5
FLAPPING_PER_DAY = 1.5
PATTERN_MIN_EPISODES = 4
PATTERN_SHARE = 0.6
PATTERN_MIN_DAYS = 3
PATTERN_MIN_WINDOW_DAYS = 6
UNSTABLE_LIMIT = 30
STABILITY_LIMIT = 500  # entities whose stability the detail pages can name
THRESHOLDS = {
    "shared_share_percent": SHARED_SHARE,
    "shared_min_entities": SHARED_MIN_ENTITIES,
    "shared_min_seconds": SHARED_MIN_SECONDS,
    "permanent_share": PERMANENT_SHARE,
    "unstable_min_episodes": UNSTABLE_MIN_EPISODES,
    "unstable_per_day": UNSTABLE_PER_DAY,
    "flapping_per_day": FLAPPING_PER_DAY,
}


def query_runs(hass: HomeAssistant, start: float, end: float) -> dict[str, Any]:
    """Blocking: the unavailable intervals per entity in [start, end].

    Two passes: first find the entities that had any unavailable row at all, then read the rows
    of only those entities with a window function. That is several times faster than running
    the window function over every row of the window.
    """
    from homeassistant.components.recorder.db_schema import States, StatesMeta
    from homeassistant.components.recorder.util import session_scope
    from sqlalchemy import case, func, select

    started = time.monotonic()
    seen: dict[str, float] = {}
    intervals: dict[str, list[tuple[float, float]]] = {}
    with session_scope(hass=hass, read_only=True) as session:
        down = func.sum(case((States.state == "unavailable", 1), else_=0))
        rows = session.execute(
            select(
                States.metadata_id,
                StatesMeta.entity_id,
                func.min(States.last_updated_ts),
                down,
            )
            .join(StatesMeta, States.metadata_id == StatesMeta.metadata_id)
            .where(States.last_updated_ts >= start, States.last_updated_ts <= end)
            .group_by(States.metadata_id, StatesMeta.entity_id)
        ).all()
        affected: dict[int, str] = {}
        for metadata_id, entity_id, first, count in rows:
            seen[entity_id] = float(first)
            if count:
                affected[metadata_id] = entity_id
        ids = list(affected)
        for offset in range(0, len(ids), CHUNK):
            part = ids[offset : offset + CHUNK]
            nxt = (
                func.lead(States.last_updated_ts)
                .over(partition_by=States.metadata_id, order_by=States.last_updated_ts)
                .label("nxt")
            )
            inner = (
                select(States.metadata_id, States.last_updated_ts.label("ts"), States.state, nxt)
                .where(
                    States.metadata_id.in_(part),
                    States.last_updated_ts >= start,
                    States.last_updated_ts <= end,
                )
                .subquery()
            )
            for metadata_id, ts, nxt_ts in session.execute(
                select(inner.c.metadata_id, inner.c.ts, inner.c.nxt).where(
                    inner.c.state == "unavailable"
                )
            ).all():
                intervals.setdefault(affected[metadata_id], []).append(
                    (float(ts), float(nxt_ts if nxt_ts is not None else end))
                )
    return {
        "start": start,
        "end": end,
        "seen": seen,
        "intervals": intervals,
        "took_ms": round((time.monotonic() - started) * 1000),
    }


def _merge(intervals: list[tuple[float, float]]) -> list[tuple[float, float]]:
    merged: list[list[float]] = []
    for begin, finish in sorted(intervals):
        if merged and begin <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], finish)
        else:
            merged.append([begin, finish])
    return [(a, b) for a, b in merged]


def shared_outages(
    members: list[list[tuple[float, float]]],
    *,
    share: int = SHARED_SHARE,
    min_entities: int = SHARED_MIN_ENTITIES,
    min_seconds: float = SHARED_MIN_SECONDS,
) -> list[tuple[float, float]]:
    """Periods in which at least ``share`` percent of the members were down together."""
    total = len(members)
    if total < min_entities:
        return []
    events: list[tuple[float, int]] = []
    for intervals in members:
        for begin, finish in intervals:
            if finish > begin:
                events.append((begin, 1))
                events.append((finish, -1))
    # An interval that ends exactly when another begins must not count as an overlap.
    events.sort(key=lambda e: (e[0], e[1]))
    result: list[tuple[float, float]] = []
    active = 0
    since: float | None = None
    for moment, step in events:
        active += step
        if since is None and active * 100 >= share * total:
            since = moment
        elif since is not None and active * 100 < share * total:
            if moment - since >= min_seconds:
                result.append((since, moment))
            since = None
    return result


def compute(
    runs: dict[str, Any],
    entities: list[dict[str, Any]],
    entries: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    """Join the recorder intervals with the registries into one row per config entry.

    ``entities`` carries ``entity_id``, ``config_entry_id`` and ``status`` (the inventory's);
    ``entries`` maps an entry id to ``title``, ``domain``, ``state``, ``reauth`` and ``iot_class``.
    """
    start, end = runs["start"], runs["end"]
    window = max(end - start, 1.0)
    per_entry: dict[str, list[dict[str, Any]]] = {}
    for item in entities:
        if item.get("config_entry_id") in entries:
            per_entry.setdefault(item["config_entry_id"], []).append(item)
    rows = []
    periods: dict[str, list[tuple[float, float]]] = {}
    known = sum(len(members) for members in per_entry.values())
    with_data = 0
    observed_sum = 0.0
    for entry_id, members in per_entry.items():
        info = entries[entry_id]
        counted: list[list[tuple[float, float]]] = []
        observed_total = down_total = 0.0
        permanent = 0
        last_single: tuple[float, float] | None = None
        affected: list[dict[str, Any]] = []
        for item in members:
            entity_id = item["entity_id"]
            first = runs["seen"].get(entity_id)
            if first is None:
                # No state change in the window: down the whole time if it is down now.
                if item.get("status") == "unavailable":
                    permanent += 1
                continue
            merged = _merge(
                [
                    (max(a, start), min(b, end))
                    for a, b in runs["intervals"].get(entity_id, [])
                    if min(b, end) > max(a, start)
                ]
            )
            observed = end - first
            down = sum(b - a for a, b in merged)
            if observed <= 0:
                continue
            if down >= observed * PERMANENT_SHARE and observed >= window * 0.95:
                permanent += 1
                continue
            counted.append(merged)
            observed_total += observed
            with_data += 1
            observed_sum += min(observed, window)
            down_total += down
            if down > 0:
                affected.append(
                    {
                        "entity_id": entity_id,
                        "name": item.get("name") or entity_id,
                        "availability": round(100 * (1 - down / observed), 2),
                    }
                )
            if merged and (last_single is None or merged[-1][1] > last_single[1]):
                last_single = merged[-1]
        if not counted and not permanent:
            continue
        outages = shared_outages(counted)
        periods[entry_id] = outages
        layer = None
        if outages:
            layer = "cloud" if info.get("iot_class") in CLOUD_CLASSES else "local"
        last = outages[-1] if outages else last_single
        rows.append(
            {
                "entry_id": entry_id,
                "title": info.get("title") or entry_id,
                "domain": info.get("domain"),
                "state": info.get("state"),
                "reauth": bool(info.get("reauth")),
                "entities": len(counted),
                "permanent": permanent,
                "availability": (
                    round(100 * (1 - down_total / observed_total), 2) if observed_total else None
                ),
                "shared_outages": len(outages),
                "longest_outage": round(max((b - a for a, b in outages), default=0)),
                "layer": layer,
                "affected_total": len(affected),
                "affected": sorted(affected, key=lambda m: (m["availability"], m["entity_id"]))[
                    :MEMBER_LIMIT
                ],
                "last_disruption": (
                    {"end": last[1], "seconds": round(last[1] - last[0]), "shared": bool(outages)}
                    if last
                    else None
                ),
            }
        )
    rows.sort(key=lambda r: (r["availability"] is None, r["availability"] or 0, r["title"]))
    return {
        "entries": rows,
        "outage_periods": periods,
        "start": start,
        "end": end,
        "window_days": round(window / DAY),
        "coverage": {
            "known": known,
            "with_data": with_data,
            "observed_share": round(100 * observed_sum / (with_data * window))
            if with_data
            else None,
        },
        "took_ms": runs.get("took_ms"),
    }


def _pattern_hour(starts: list[float], zone: tzinfo) -> int | None:
    """The first hour of the two-hour band that holds most episode starts, if they cluster."""
    if len(starts) < PATTERN_MIN_EPISODES:
        return None
    local = [datetime.fromtimestamp(ts, UTC).astimezone(zone) for ts in starts]
    best_hour, best = None, []
    for hour in range(24):
        inside = [moment for moment in local if moment.hour in (hour, (hour + 1) % 24)]
        if len(inside) > len(best):
            best_hour, best = hour, inside
    if len(best) < PATTERN_SHARE * len(local) or len({m.date() for m in best}) < PATTERN_MIN_DAYS:
        return None
    return best_hour


def flapping(
    runs: dict[str, Any],
    entities: list[dict[str, Any]],
    outage_periods: dict[str, list[tuple[float, float]]],
    used: dict[str, int],
    ignored: set[str],
    zone: tzinfo = UTC,
) -> dict[str, Any]:
    """Entities that keep failing and coming back, worst first.

    An episode inside a shared outage of the entity's config entry belongs to the integration
    and is not counted here. Entities that are down all the time, disabled or ignored are left out.
    """
    start, end = runs["start"], runs["end"]
    window = max(end - start, 1.0)
    days = window / DAY
    items = []
    excluded = {"ignored": 0, "disabled": 0, "permanent": 0}
    for item in entities:
        entity_id = item["entity_id"]
        first = runs["seen"].get(entity_id)
        if first is None:
            continue
        if entity_id in ignored:
            excluded["ignored"] += 1
            continue
        if item.get("status") == "disabled":
            excluded["disabled"] += 1
            continue
        merged = _merge(
            [
                (max(a, start), min(b, end))
                for a, b in runs["intervals"].get(entity_id, [])
                if min(b, end) > max(a, start)
            ]
        )
        observed = end - first
        down = sum(b - a for a, b in merged)
        if observed <= 0:
            continue
        if down >= observed * PERMANENT_SHARE and observed >= window * 0.95:
            excluded["permanent"] += 1
            continue
        shared = outage_periods.get(item.get("config_entry_id"), [])
        episodes = [
            (a, b)
            for a, b in merged
            if not any(a < other_end and b > other_start for other_start, other_end in shared)
        ]
        rate = len(episodes) / days
        if len(episodes) < UNSTABLE_MIN_EPISODES or rate < UNSTABLE_PER_DAY:
            continue
        total = sum(b - a for a, b in episodes)
        followers = used.get(entity_id, 0)
        items.append(
            {
                "entity_id": entity_id,
                "name": item.get("name") or entity_id,
                "entry_id": item.get("config_entry_id"),
                "episodes": len(episodes),
                "per_day": round(rate, 1),
                "total_seconds": round(total),
                "mean_seconds": round(total / len(episodes)),
                "level": "flapping" if rate >= FLAPPING_PER_DAY else "unstable",
                "pattern_hour": _pattern_hour([a for a, _ in episodes], zone)
                if days >= PATTERN_MIN_WINDOW_DAYS
                else None,
                "used": followers,
                "_rank": rate * (1 + followers),
            }
        )
    items.sort(key=lambda i: (-i["_rank"], i["entity_id"]))
    for entry in items:
        del entry["_rank"]
    kept = ("level", "episodes", "per_day", "total_seconds", "mean_seconds", "pattern_hour", "used")
    return {
        "items": items[:UNSTABLE_LIMIT],
        "total": len(items),
        "excluded": excluded,
        "entities": {i["entity_id"]: {k: i[k] for k in kept} for i in items[:STABILITY_LIMIT]},
    }


async def entry_info(hass: HomeAssistant) -> dict[str, dict[str, Any]]:
    from homeassistant.loader import async_get_integrations

    entries = hass.config_entries.async_entries()
    integrations = await async_get_integrations(hass, {entry.domain for entry in entries})
    reauth = {
        flow["context"].get("entry_id")
        for flow in hass.config_entries.flow.async_progress()
        if flow["context"].get("source") == "reauth"
    }
    info = {}
    for entry in entries:
        integration = integrations.get(entry.domain)
        info[entry.entry_id] = {
            "title": entry.title,
            "domain": entry.domain,
            "state": getattr(entry.state, "value", str(entry.state)),
            "reauth": entry.entry_id in reauth,
            "iot_class": getattr(integration, "iot_class", None)
            if integration and not isinstance(integration, Exception)
            else None,
        }
    return info


def reply_key(window_days: int, compare: bool) -> str:
    return f"reliability:{window_days}:{int(compare)}"


async def reliability(
    hass: HomeAssistant,
    snapshot: dict[str, Any],
    *,
    window_days: int = 7,
    refresh: bool = False,
    compare: bool = False,
    store: ReplyStore | None = None,
    cached_only: bool = False,
) -> ReliabilityResult | dict[str, Any]:
    """Availability and shared outages per config entry for the last day or week.

    With ``compare`` the period just before is read as well (a second query) and each row carries
    the availability of that period and the difference in percentage points.
    """
    if not recorder_ready(hass):
        return {"available": False, "entries": []}
    now = time.time()
    key = reply_key(window_days, compare)
    if cached_only:
        # Only what was calculated before, however old: a detail page never starts the recorder query.
        held = kept_reply(store, key, now, CACHE_SECONDS)
        if held is None:
            return {
                "available": True,
                "busy": False,
                "missing": True,
                "entries": [],
                "window_days": window_days,
            }
        return held
    kept = None if refresh else kept_reply(store, key, now, CACHE_SECONDS)
    if kept is not None:
        # An old reply is handed out at once; the caller asks again with ``refresh`` for new numbers.
        return kept
    found = await cached_query(
        hass,
        f"reliability:{window_days}",
        CACHE_SECONDS,
        lambda: query_runs(hass, now - window_days * DAY, now),
        refresh=refresh,
    )
    if found.busy:
        held = kept_reply(store, key, now, CACHE_SECONDS, stale=True)
        if held is not None:
            return held
        return {"available": True, "busy": True, "entries": [], "window_days": window_days}
    entities = [
        {
            "entity_id": item["object_id"],
            "name": item.get("name"),
            "config_entry_id": item.get("config_entry_id"),
            "status": item.get("status"),
        }
        for item in snapshot["objects"]
        if item["object_type"] == "entity"
    ]
    entries = await entry_info(hass)
    result = compute(found.raw, entities, entries)
    periods = result.pop("outage_periods")
    used: dict[str, int] = {}
    for edge in snapshot.get("edges", []):
        target = edge["target"]
        if target.startswith("entity:") and edge.get("confidence", "certain") == "certain":
            used[target[7:]] = used.get(target[7:], 0) + 1
    ignored = {f["object_id"] for f in snapshot.get("findings", []) if f.get("ignored")} | {
        item["object_id"]
        for item in snapshot["objects"]
        if item["object_type"] == "entity" and IGNORE_LABEL in (item.get("labels") or [])
    }
    unstable = flapping(
        found.raw, entities, periods, used, ignored, dt_util.get_default_time_zone()
    )
    for item in unstable["items"]:
        item["entry_title"] = (entries.get(item["entry_id"]) or {}).get("title")
    comparison = {"requested": compare, "available": False}
    if compare:
        before = await cached_query(
            hass,
            f"reliability:{window_days}:before",
            CACHE_SECONDS,
            lambda: query_runs(hass, now - 2 * window_days * DAY, now - window_days * DAY),
            refresh=refresh,
        )
        if not before.busy:
            earlier = {
                row["entry_id"]: row["availability"]
                for row in compute(before.raw, entities, entries)["entries"]
            }
            for row in result["entries"]:
                old = earlier.get(row["entry_id"])
                row["previous_availability"] = old
                row["delta"] = (
                    round(row["availability"] - old, 2)
                    if old is not None and row["availability"] is not None
                    else None
                )
            comparison["available"] = True
    reply = {
        "available": True,
        "busy": False,
        "cached": found.cached,
        "stale": False,
        "age_seconds": 0,
        "computed_at": now,
        "unstable": unstable,
        "thresholds": THRESHOLDS,
        "comparison": comparison,
        **result,
    }
    if store is not None:
        store.keep(key, reply)
    return reply
