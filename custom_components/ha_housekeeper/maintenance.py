"""Maintenance assistant: what the recorder costs, and a preflight before Home Assistant updates.

Everything here only reads Home Assistant and writes nothing. What happens after an update is the
job of the watch (``watch.py``).
"""

from __future__ import annotations

import os
import time
from datetime import UTC, datetime
from typing import Any

from homeassistant.const import __version__ as HA_VERSION
from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir

from .meter import recorder_ready
from .queries import ReplyStore, cached_query, kept_reply

COST_LIMIT = 40  # entities listed per ranking; totals stay exact
USAGE_RELATIONS = frozenset(
    {"TRIGGERS_ON", "USES_AS_CONDITION", "TARGETS", "REFERENCES", "SHOWS", "INCLUDES"}
)  # what counts as "used"; device and area links do not
SUGGEST_MIN_PER_DAY = 100  # states per day from which an unused entity is worth excluding
COST_CACHE_SECONDS = 300  # the ranking is expensive on a large database, so it is kept briefly
DAY = 86400
REPAIRS_KEPT = 200  # open repairs kept per scan
BAD_ENTRY_STATES = {"setup_error", "setup_retry", "failed_unload", "migration_error"}


def _query_costs(hass: HomeAssistant, limit: int) -> dict[str, Any]:
    """Blocking: row counts per entity from the recorder database."""
    from homeassistant.components.recorder import get_instance
    from homeassistant.components.recorder.db_schema import (
        States,
        StatesMeta,
        Statistics,
        StatisticsMeta,
    )
    from homeassistant.components.recorder.util import session_scope
    from sqlalchemy import case, func, select

    instance = get_instance(hass)
    started = time.monotonic()
    now = time.time()
    with session_scope(hass=hass, read_only=True) as session:
        total, first, last = session.execute(
            select(
                func.count(States.state_id),
                func.min(States.last_updated_ts),
                func.max(States.last_updated_ts),
            )
        ).one()
        states = session.execute(
            select(
                StatesMeta.entity_id,
                func.count(States.state_id),
                func.min(States.last_updated_ts),
                func.max(States.last_updated_ts),
            )
            .join(StatesMeta, States.metadata_id == StatesMeta.metadata_id)
            .group_by(States.metadata_id, StatesMeta.entity_id)
            .order_by(func.count(States.state_id).desc())
            .limit(limit)
        ).all()
        # One pass over the rows of the last 7 days gives both windows for every entity.
        last_day = func.sum(case((States.last_updated_ts >= now - DAY, 1), else_=0))
        recent = {
            row[0]: (row[1], int(row[2] or 0))
            for row in session.execute(
                select(StatesMeta.entity_id, func.count(States.state_id), last_day)
                .join(StatesMeta, States.metadata_id == StatesMeta.metadata_id)
                .where(States.last_updated_ts >= now - 7 * DAY)
                .group_by(States.metadata_id, StatesMeta.entity_id)
            ).all()
        }
        # Entities that are noisy right now but small overall are listed too.
        listed = {row[0] for row in states}
        loud = sorted(recent, key=lambda entity_id: recent[entity_id][1], reverse=True)[:limit]
        extra = [entity_id for entity_id in loud if entity_id not in listed]
        if extra:
            states = [
                *states,
                *session.execute(
                    select(
                        StatesMeta.entity_id,
                        func.count(States.state_id),
                        func.min(States.last_updated_ts),
                        func.max(States.last_updated_ts),
                    )
                    .join(StatesMeta, States.metadata_id == StatesMeta.metadata_id)
                    .where(StatesMeta.entity_id.in_(extra))
                    .group_by(States.metadata_id, StatesMeta.entity_id)
                ).all(),
            ]
        stat_total = session.execute(select(func.count(Statistics.id))).scalar() or 0
        stat_rows = session.execute(
            select(StatisticsMeta.statistic_id, func.count(Statistics.id))
            .join(StatisticsMeta, Statistics.metadata_id == StatisticsMeta.id)
            .group_by(Statistics.metadata_id, StatisticsMeta.statistic_id)
            .order_by(func.count(Statistics.id).desc())
            .limit(limit)
        ).all()
    size = None
    try:
        if instance.dialect_name == "sqlite":
            path = instance.engine.url.database
            size = os.path.getsize(path) if path else None
    except Exception:
        size = None
    return {
        "total_states": total or 0,
        "first": first,
        "last": last,
        "states": [(row[0], row[1], row[2], row[3]) for row in states],
        "recent": recent,
        "took_ms": round((time.monotonic() - started) * 1000),
        "statistics_total": stat_total,
        "statistics": [(row[0], row[1]) for row in stat_rows],
        "size_bytes": size,
        "keep_days": getattr(instance, "keep_days", None),
        "recorded": getattr(instance, "entity_filter", None),
    }


def rank_costs(raw: dict[str, Any], snapshot: dict[str, Any]) -> dict[str, Any]:
    """Join the database counts with the inventory: what each heavy entity is used for."""
    entities = {
        item["object_id"]: item for item in snapshot["objects"] if item["object_type"] == "entity"
    }
    used: dict[str, int] = {}
    for edge in snapshot["edges"]:
        if (
            edge["target"].startswith("entity:")
            and edge["relation"] in USAGE_RELATIONS
            and edge.get("confidence", "certain") == "certain"
        ):
            used[edge["target"][7:]] = used.get(edge["target"][7:], 0) + 1
    total = raw["total_states"] or 0
    entity_filter = raw.get("recorded")
    recent = raw.get("recent")
    items = []
    for entity_id, count, first, last in raw["states"]:
        span_days = max(((last or 0) - (first or 0)) / 86400, 1.0)
        item = entities.get(entity_id)
        per_day = round(count / span_days, 1)
        week, day = (recent or {}).get(entity_id, (0, 0))
        # The current rate decides what is worth excluding; the long-term average only informs.
        # Without the windows (older callers) the average has to do.
        current = float(day) if recent is not None else per_day
        uses = used.get(entity_id, 0)
        has_statistics = bool(item and item.get("has_statistics"))
        items.append(
            {
                "entity_id": entity_id,
                "name": (item or {}).get("name") or entity_id,
                "states": count,
                "per_day": per_day,
                "per_day_avg": per_day,
                "states_24h": day,
                "states_7d": week,
                "per_day_7d": round(week / 7, 1),
                "share": round(count / total * 100, 1) if total else 0.0,
                "used": uses,
                "has_statistics": has_statistics,
                "known": item is not None,
                "excluded": bool(entity_filter) and not entity_filter(entity_id),
                "suggest_exclude": item is not None
                and uses == 0
                and not has_statistics
                and current >= SUGGEST_MIN_PER_DAY,
            }
        )
    return {
        "available": True,
        "total_states": total,
        "first": raw["first"],
        "last": raw["last"],
        "size_bytes": raw["size_bytes"],
        "keep_days": raw["keep_days"],
        "took_ms": raw.get("took_ms"),
        "cached": bool(raw.get("cached")),
        "statistics_total": raw["statistics_total"],
        "entities": items,
        "statistics": [
            {"statistic_id": sid, "rows": count, "known": sid in entities}
            for sid, count in raw["statistics"]
        ],
        "limit": COST_LIMIT,
    }


async def recorder_costs(
    hass: HomeAssistant,
    snapshot: dict[str, Any],
    *,
    refresh: bool = False,
    store: ReplyStore | None = None,
) -> dict[str, Any]:
    """The entities that fill the recorder database, with a hint where excluding is safe.

    The database counts are kept for a few minutes; ``refresh`` calculates them again. The last
    result is also kept in the reply store, so the view opens with it at once (``stale`` once it
    is old) instead of waiting for the query.
    """
    if not recorder_ready(hass):
        return {"available": False, "entities": [], "statistics": []}
    now = time.time()
    kept = None if refresh else kept_reply(store, "costs", now, COST_CACHE_SECONDS)
    if kept is not None:
        return kept
    found = await cached_query(
        hass,
        "costs",
        COST_CACHE_SECONDS,
        lambda: _query_costs(hass, COST_LIMIT),
        refresh=refresh,
    )
    if found.busy:
        held = kept_reply(store, "costs", now, COST_CACHE_SECONDS, stale=True)
        if held is not None:
            return held
        return {"available": True, "busy": True, "entities": [], "statistics": []}
    reply = {
        **rank_costs({**found.raw, "cached": True} if found.cached else found.raw, snapshot),
        "computed_at": now,
        "stale": False,
        "age_seconds": 0,
    }
    if store is not None:
        store.keep("costs", reply)
    return reply


async def _backup_state(hass: HomeAssistant) -> dict[str, Any]:
    """Whether backups are set up, and when the newest one was made."""
    try:
        from homeassistant.components.backup import async_get_manager

        manager = async_get_manager(hass)
    except Exception:
        return {"available": False}
    result: dict[str, Any] = {
        "available": True,
        "configured": bool(manager.config.data.create_backup.agent_ids),
        "newest": None,
        "age_hours": None,
    }
    try:
        backups, _ = await manager.async_get_backups()
        dates = [
            b.date
            for b in backups.values()
            if getattr(b, "date", None)
            # Housekeeper's own configuration-only copy before a plan is not the regular backup.
            and (getattr(b, "extra_metadata", None) or {}).get("housekeeper_scope") != "config"
        ]
        if dates:
            newest = max(dates)
            result["newest"] = newest
            result["age_hours"] = round(
                (datetime.now(UTC) - datetime.fromisoformat(newest)).total_seconds() / 3600, 1
            )
    except Exception:
        result["newest"] = None
    return result


def _repairs(hass: HomeAssistant) -> list[dict[str, Any]]:
    registry = ir.async_get(hass)
    return sorted(
        (
            {
                "issue_id": issue.issue_id,
                "domain": issue.domain,
                "severity": str(getattr(issue.severity, "value", issue.severity)),
            }
            for issue in registry.issues.values()
            # The registry also holds persisted issues that no integration raises right now.
            if issue.active and not issue.dismissed_version and issue.domain != "ha_housekeeper"
        ),
        key=lambda i: (i["domain"], i["issue_id"]),
    )


def repair_keys(hass: HomeAssistant) -> list[str]:
    """The open repairs as ``domain:issue_id``; what a scan stores so that a watch can tell new ones."""
    return [f"{item['domain']}:{item['issue_id']}" for item in _repairs(hass)][:REPAIRS_KEPT]


def _failed_entries(hass: HomeAssistant) -> list[dict[str, Any]]:
    return sorted(
        (
            {"entry_id": entry.entry_id, "domain": entry.domain, "title": entry.title}
            for entry in hass.config_entries.async_entries()
            if getattr(entry.state, "value", str(entry.state)) in BAD_ENTRY_STATES
        ),
        key=lambda e: (e["domain"], e["entry_id"]),
    )


def _pending_updates(hass: HomeAssistant) -> list[dict[str, Any]]:
    result = []
    for state in hass.states.async_all("update"):
        if state.state == "on":
            result.append(
                {
                    "entity_id": state.entity_id,
                    "name": state.attributes.get("friendly_name") or state.entity_id,
                    "installed": state.attributes.get("installed_version"),
                    "latest": state.attributes.get("latest_version"),
                }
            )
    return sorted(result, key=lambda u: u["entity_id"])


def broken_findings(snapshot: dict[str, Any]) -> list[dict[str, Any]]:
    """Automations and other objects with references to things that no longer exist."""
    return sorted(
        (
            {"key": f["key"], "object_id": f["object_id"], "name": f.get("name") or f["object_id"]}
            for f in snapshot["findings"]
            if f["classification"] == "broken_reference" and not f["ignored"]
        ),
        key=lambda f: f["key"],
    )


async def collect_preflight(hass: HomeAssistant, snapshot: dict[str, Any]) -> dict[str, Any]:
    """The state of the installation that matters right before or after an update."""
    return {
        "at": datetime.now(UTC).isoformat(),
        "ha_version": HA_VERSION,
        "backup": await _backup_state(hass),
        "repairs": _repairs(hass),
        "failed_entries": _failed_entries(hass),
        "pending_updates": _pending_updates(hass),
        "broken": broken_findings(snapshot),
    }


def judge_preflight(state: dict[str, Any]) -> list[dict[str, Any]]:
    """Turn the collected state into go / look-first / stop items for the person."""
    checks = []
    backup = state["backup"]
    if not backup.get("available"):
        level = "warn"
    elif not backup.get("configured") or backup.get("newest") is None:
        level = "red"
    else:
        level = "ok" if (backup.get("age_hours") or 0) <= 48 else "warn"
    checks.append({"check": "backup", "level": level})
    for key in ("repairs", "failed_entries", "broken"):
        count = len(state[key])
        checks.append({"check": key, "level": "ok" if not count else "warn", "count": count})
    return checks


async def preflight_report(hass: HomeAssistant, snapshot: dict[str, Any]) -> dict[str, Any]:
    """The state right before an update and its judgement; the time after belongs to the watch."""
    state = await collect_preflight(hass, snapshot)
    return {"state": state, "checks": judge_preflight(state)}
