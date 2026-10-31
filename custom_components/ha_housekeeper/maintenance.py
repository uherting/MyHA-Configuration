"""Maintenance assistant: what the recorder costs, and a preflight before Home Assistant updates.

Everything here only reads Home Assistant and writes nothing. What happens after an update is the
job of the watch (``watch.py``).
"""

from __future__ import annotations

import asyncio
import os
import time
from datetime import UTC, datetime
from typing import Any

from homeassistant.const import __version__ as HA_VERSION
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import issue_registry as ir

from .hacs import blocked_repository_ids
from .meter import recorder_ready
from .queries import ReplyStore, cached_query, kept_reply
from .system_usage import disk_usage
from .watch import UPDATE_ENTITIES

COST_LIMIT = 40  # entities listed per ranking; totals stay exact
USAGE_RELATIONS = frozenset(
    {"TRIGGERS_ON", "USES_AS_CONDITION", "TARGETS", "REFERENCES", "SHOWS", "INCLUDES"}
)  # what counts as "used"; device and area links do not
SUGGEST_MIN_PER_DAY = 100  # states per day from which an unused entity is worth excluding
COST_CACHE_SECONDS = 300  # the ranking is expensive on a large database, so it is kept briefly
DAY = 86400
REPAIRS_KEPT = 200  # open repairs kept per scan
BAD_ENTRY_STATES = {"setup_error", "setup_retry", "failed_unload", "migration_error"}
GIB = 1024**3
DISK_WARN_BYTES = 3 * GIB  # a guess: below this an update or a backup may no longer fit
DISK_STOP_BYTES = 1 * GIB
UPDATE_GROUPS = ("system", "app", "hacs", "device")
CONFIG_CHECK_TIMEOUT = 60  # seconds; the check loads and validates every configuration file
CONFIG_TEXT_LIMIT = 4000


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


def usage_counts(edges: list[dict[str, Any]]) -> dict[str, int]:
    """How many automations, scripts or dashboards use each entity, over certain usage edges."""
    used: dict[str, int] = {}
    for edge in edges:
        if (
            edge["target"].startswith("entity:")
            and edge["relation"] in USAGE_RELATIONS
            and edge.get("confidence", "certain") == "certain"
        ):
            used[edge["target"][7:]] = used.get(edge["target"][7:], 0) + 1
    return used


def exclusion_suggested(*, known: bool, uses: int, has_statistics: bool, rate: float) -> bool:
    """Whether excluding an entity from the recorder is worth suggesting: the one rule of both views.

    ``rate`` is what the entity writes now (rows in the last 24 hours); an entity that something uses
    or that feeds statistics is never suggested.
    """
    return known and uses == 0 and not has_statistics and rate >= SUGGEST_MIN_PER_DAY


def rank_costs(raw: dict[str, Any], snapshot: dict[str, Any]) -> dict[str, Any]:
    """Join the database counts with the inventory: what each heavy entity is used for."""
    entities = {
        item["object_id"]: item for item in snapshot["objects"] if item["object_type"] == "entity"
    }
    used = usage_counts(snapshot["edges"])
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
                "suggest_exclude": exclusion_suggested(
                    known=item is not None, uses=uses, has_statistics=has_statistics, rate=current
                ),
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


def _backup_state(report: dict[str, Any] | None) -> dict[str, Any]:
    """The backup row of the preflight, read from the report of the backup protection.

    The protection judges the age against the schedule; the preflight does not judge it again, so
    the two can never disagree. Only the checks that say whether a backup can be relied on count.
    """
    if not report or not report.get("available"):
        return {"available": False}
    checks = {c["id"]: c for c in report.get("checks") or []}
    if "external" in checks:  # made outside Home Assistant: nothing here can tell its age
        return {"available": True, "level": "external"}
    severity = {"ok": 0, "unknown": 1, "note": 2, "problem": 3}
    worst = max(
        (checks[i]["level"] for i in ("setup", "newest", "last_run") if i in checks),
        key=lambda level: severity.get(level, 1),
        default="unknown",
    )
    newest = (checks.get("newest") or {}).get("values") or {}
    return {
        "available": True,
        "level": worst,
        "age_hours": newest.get("age_hours"),
        "limit_hours": newest.get("limit_hours"),
        "recurrence": newest.get("recurrence"),
    }


async def free_space(hass: HomeAssistant) -> dict[str, Any]:
    """Free and total bytes of the file system of the configuration directory; empty if unreadable."""
    return await hass.async_add_executor_job(disk_usage, hass.config.config_dir)


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


async def repair_details(hass: HomeAssistant) -> dict[str, dict[str, Any]]:
    """What the person can read about each open repair, by its ``domain:issue_id``.

    Home Assistant keeps no title in the issue itself, only a translation key and placeholders; the
    title is looked up in the translations of the integration in the language of Home Assistant. Without
    one the entry has no title and the panel shows the id.
    """
    from homeassistant.helpers.translation import async_get_translations

    registry = ir.async_get(hass)
    out: dict[str, dict[str, Any]] = {}
    texts: dict[str, dict[str, str]] = {}
    for issue in registry.issues.values():
        if not issue.active or issue.dismissed_version or issue.domain == "ha_housekeeper":
            continue
        if issue.domain not in texts:
            try:
                texts[issue.domain] = await async_get_translations(
                    hass, hass.config.language, "issues", [issue.domain]
                )
            except Exception:
                texts[issue.domain] = {}
        title = None
        if issue.translation_key:
            raw = texts[issue.domain].get(
                f"component.{issue.domain}.issues.{issue.translation_key}.title"
            )
            if raw:
                title = raw
                for name, value in (issue.translation_placeholders or {}).items():
                    title = title.replace("{" + str(name) + "}", str(value))
        out[f"{issue.domain}:{issue.issue_id}"] = {
            "title": title,
            "fixable": bool(issue.is_fixable),
            "severity": str(getattr(issue.severity, "value", issue.severity)),
            "url": issue.learn_more_url,
        }
    return out


def _failed_entries(hass: HomeAssistant) -> list[dict[str, Any]]:
    return sorted(
        (
            {"entry_id": entry.entry_id, "domain": entry.domain, "title": entry.title}
            for entry in hass.config_entries.async_entries()
            if getattr(entry.state, "value", str(entry.state)) in BAD_ENTRY_STATES
        ),
        key=lambda e: (e["domain"], e["entry_id"]),
    )


def update_group(entity_id: str, platform: str | None) -> str:
    """Where an update belongs: the system itself, an app, a HACS repository or a device."""
    if entity_id in UPDATE_ENTITIES:
        return "system"
    return {"hassio": "app", "hacs": "hacs", "marketplace": "hacs"}.get(platform or "", "device")


def _text_attr(value: Any) -> str | None:
    return value if isinstance(value, str) and value else None


def pending_updates(hass: HomeAssistant) -> list[dict[str, Any]]:
    """Every update entity that offers an update, grouped and in the order the page shows them."""
    registry = er.async_get(hass)
    blocked = blocked_repository_ids(hass)
    result = []
    for state in hass.states.async_all("update"):
        if state.state != "on":
            continue
        attrs = state.attributes
        entry = registry.async_get(state.entity_id)
        platform = entry.platform if entry else None
        name = _text_attr(attrs.get("title")) or _text_attr(attrs.get("friendly_name"))
        group = update_group(state.entity_id, platform)
        result.append(
            {
                "entity_id": state.entity_id,
                "name": name or state.entity_id,
                "installed": attrs.get("installed_version"),
                "latest": attrs.get("latest_version"),
                "group": group,
                "release_url": _text_attr(attrs.get("release_url")),
                "release_summary": _text_attr(attrs.get("release_summary")),
                "picture": _text_attr(attrs.get("entity_picture")),
                "auto_update": attrs.get("auto_update") is True,
                "in_progress": bool(attrs.get("in_progress")),
                "blocked": group == "hacs" and bool(entry and entry.unique_id in blocked),
            }
        )
    return sorted(
        result, key=lambda u: (UPDATE_GROUPS.index(u["group"]), u["name"].lower(), u["entity_id"])
    )


def update_counts(updates: list[dict[str, Any]]) -> dict[str, int]:
    """How many updates there are in total, per group and how many HACS cannot install."""
    return {
        "total": len(updates),
        **{group: sum(1 for u in updates if u["group"] == group) for group in UPDATE_GROUPS},
        "blocked": sum(1 for u in updates if u["blocked"]),
    }


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


async def collect_preflight(
    hass: HomeAssistant, snapshot: dict[str, Any], backup: dict[str, Any] | None = None
) -> dict[str, Any]:
    """The state of the installation that matters right before an update."""
    return {
        "at": datetime.now(UTC).isoformat(),
        "ha_version": HA_VERSION,
        "backup": _backup_state(backup),
        "disk": await free_space(hass),
        "repairs": _repairs(hass),
        "failed_entries": _failed_entries(hass),
        "updates": pending_updates(hass),
        "broken": broken_findings(snapshot),
    }


def judge_preflight(state: dict[str, Any]) -> list[dict[str, Any]]:
    """Turn the collected state into the lines of the page: ``ok``, ``info``, ``warn`` or ``red``."""
    checks = []
    backup = state["backup"]
    if not backup.get("available"):
        level = "warn"
    else:
        level = {"ok": "ok", "problem": "red", "external": "info"}.get(backup.get("level"), "warn")
    checks.append({"check": "backup", "level": level})
    free = (state.get("disk") or {}).get("free")
    if free is not None:
        checks.append(
            {
                "check": "disk",
                "level": "red"
                if free < DISK_STOP_BYTES
                else "warn"
                if free < DISK_WARN_BYTES
                else "ok",
            }
        )
    system_pending = any(u["group"] == "system" for u in state.get("updates") or [])
    for key in ("repairs", "failed_entries", "broken"):
        count = len(state[key])
        # Integrations that cannot start are the one thing that turns a system update into a stop.
        bad = "red" if key == "failed_entries" and system_pending else "warn"
        checks.append({"check": key, "level": "ok" if not count else bad, "count": count})
    return checks


def preflight_verdict(checks: list[dict[str, Any]]) -> str:
    """``stop`` when a line is red, ``look`` when one is yellow, else ``ready``."""
    levels = {c["level"] for c in checks}
    return "stop" if "red" in levels else "look" if "warn" in levels else "ready"


async def preflight_report(
    hass: HomeAssistant, snapshot: dict[str, Any], backup: dict[str, Any] | None = None
) -> dict[str, Any]:
    """The state right before an update and its judgement; the time after belongs to the watch."""
    state = await collect_preflight(hass, snapshot, backup)
    checks = judge_preflight(state)
    return {
        "state": state,
        "checks": checks,
        "verdict": preflight_verdict(checks),
        "counts": update_counts(state["updates"]),
    }


async def check_configuration(hass: HomeAssistant) -> dict[str, Any]:
    """Home Assistant's own configuration check, the one behind "Check configuration". Reads only.

    It is not cheap (every file is loaded), so it runs when the person asks and never by itself.
    """
    from homeassistant.helpers.check_config import async_check_ha_config_file

    started = time.monotonic()
    async with asyncio.timeout(CONFIG_CHECK_TIMEOUT):
        result = await async_check_ha_config_file(hass)

    def clip(text: Any) -> str | None:
        return str(text)[:CONFIG_TEXT_LIMIT] if text else None

    return {
        "valid": not result.errors,
        "errors": clip(result.error_str),
        "warnings": clip(result.warning_str),
        "took_ms": round((time.monotonic() - started) * 1000),
        "at": datetime.now(UTC).isoformat(),
    }
