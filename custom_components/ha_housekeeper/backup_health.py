"""Backup protection: is the backup strategy sound, not only does a backup exist.

Everything here only reads Home Assistant's backup manager. The one thing Housekeeper writes is a
small record of facts only the person can know: the emergency kit is stored safely, a restore
was tried, and the backups are made outside Home Assistant (e.g. of a Docker volume or the host). Housekeeper never restores, creates or deletes a backup here.

``collect`` reads the manager; ``evaluate`` judges the result and needs no manager, so every
threshold can be tested with plain data. Levels are ``ok``, ``note``, ``problem`` and ``unknown``;
the panel adds the words, so the backend sends only numbers and ids.
"""

from __future__ import annotations

import statistics
from datetime import UTC, date, datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import ATTEST_STORAGE_KEY, STORAGE_VERSION
from .system_usage import disk_usage

# The newest backup may be this old before it is a problem, by the configured schedule.
SCHEDULE_LIMIT_HOURS = {"daily": 36, "custom_days": 8 * 24}
NO_SCHEDULE_NOTE_HOURS = 7 * 24  # without a schedule only a hint, nothing is expected
ATTEMPT_GRACE_SECONDS = 3600  # an attempt newer than the last success by this much has failed
SIZE_BASELINE = 5  # backups before the newest that set the expected size
SIZE_LOW, SIZE_HIGH = 0.5, 2.0
RESTORE_TEST_DAYS = 180
LOCAL_SUFFIX = ".local"  # agent ids such as backup.local or hassio.local; anything else is remote
MAX_PLANS_CHECKED = 5
BACKUP_LIST_MAX = 20  # the newest backups the report lists in detail
SPACE_FACTOR = 1.5  # a guess: the next backup needs about this much room, measured on the last one
OWN_BACKUPS_NOTE = 10  # Housekeeper's own backups: this many ...
OWN_BACKUPS_BYTES = 5 * 1024**3  # ... or this much space in total is a hint to clean up
PLAN_BACKUP_WINDOW_SECONDS = 2 * 3600  # the backup started up to this long before it was recorded
ATTEST_KINDS = ("targets", "emergency_kit", "restore_test", "encryption", "external")
_SEVERITY = {"ok": 0, "unknown": 1, "note": 2, "problem": 3}


def _parse(value: Any) -> datetime | None:
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=UTC)
    if not isinstance(value, str) or not value:
        return None
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=UTC)


def _iso(value: Any) -> str | None:
    parsed = _parse(value)
    return parsed.isoformat() if parsed else None


def _is_local(agent_id: str) -> bool:
    return agent_id.endswith(LOCAL_SUFFIX)


def _names(items: Any) -> list[str]:
    """Names of apps or folders; HA hands over objects with a ``name``, a ``folder`` or a plain string."""
    names = []
    for item in items or []:
        value = (
            item
            if isinstance(item, str)
            else getattr(item, "name", None)
            or getattr(item, "value", None)
            or getattr(item, "slug", None)
        )
        if value:
            names.append(str(value))
    return sorted(names)


async def collect(hass: HomeAssistant) -> dict[str, Any]:
    """Read the backup manager into plain data; any single missing field becomes ``None``."""
    try:
        from homeassistant.components.backup import async_get_manager

        manager = async_get_manager(hass)
    except Exception:
        return {"available": False}
    state: dict[str, Any] = {"available": True, "backups": [], "agent_errors": []}
    try:
        # A backup in progress has its start recorded but not yet its end; that is no failure.
        manager_state = getattr(manager, "state", None)
        state["running"] = (
            None
            if manager_state is None
            else str(getattr(manager_state, "value", manager_state)) != "idle"
        )
    except Exception:  # noqa: BLE001 - without the figure an unfinished attempt counts as before
        state["running"] = None
    try:
        data = manager.config.data
        create = data.create_backup
        retention = data.retention
        schedule = data.schedule
        state["config"] = {
            "agent_ids": sorted(getattr(create, "agent_ids", None) or []),
            "encrypted": bool(getattr(create, "password", None)),
            "copies": getattr(retention, "copies", None),
            "days": getattr(retention, "days", None),
            "recurrence": str(
                getattr(getattr(schedule, "recurrence", None), "value", None) or "never"
            ),
            "include_database": getattr(create, "include_database", None),
            "last_attempted": _iso(getattr(data, "last_attempted_automatic_backup", None)),
            "last_completed": _iso(getattr(data, "last_completed_automatic_backup", None)),
        }
    except Exception:
        state["config"] = None
    try:
        backups, agent_errors = await manager.async_get_backups()
        state["agent_errors"] = sorted(str(agent) for agent in (agent_errors or {}))
        for backup in backups.values():
            agents = getattr(backup, "agents", None) or {}
            sizes = [getattr(status, "size", None) for status in agents.values()]
            state["backups"].append(
                {
                    "date": _iso(getattr(backup, "date", None)),
                    "size": next((size for size in sizes if isinstance(size, int)), None),
                    "agents": sorted(agents),
                    "failed_agents": sorted(getattr(backup, "failed_agent_ids", None) or []),
                    "protected": any(
                        getattr(status, "protected", False) for status in agents.values()
                    ),
                    "automatic": getattr(backup, "with_automatic_settings", None),
                    # App-only backups (e.g. before an app update) do not contain Home Assistant.
                    "ha_included": getattr(backup, "homeassistant_included", None),
                    # Housekeeper's own safety copy before a plan: configuration only, no regular backup.
                    "own": (getattr(backup, "extra_metadata", None) or {}).get("housekeeper")
                    is True,
                    "partial": (getattr(backup, "extra_metadata", None) or {}).get(
                        "housekeeper_scope"
                    )
                    == "config",
                    "id": str(getattr(backup, "backup_id", "") or "") or None,
                    "name": getattr(backup, "name", None),
                    "version": getattr(backup, "homeassistant_version", None),
                    "database": getattr(backup, "database_included", None),
                    "apps": _names(getattr(backup, "addons", None)),
                    "folders": _names(getattr(backup, "folders", None)),
                    "failed_apps": _names(getattr(backup, "failed_addons", None)),
                    "failed_folders": _names(getattr(backup, "failed_folders", None)),
                    "agent_sizes": {
                        str(agent): getattr(status, "size", None)
                        for agent, status in agents.items()
                        if isinstance(getattr(status, "size", None), int)
                    },
                }
            )
    except Exception:
        state["backups"] = None
    try:
        usage = await hass.async_add_executor_job(disk_usage, hass.config.config_dir)
        state["disk_free"] = usage.get("free")
    except Exception:  # noqa: BLE001 - without the figure the check about room says "unknown"
        state["disk_free"] = None
    return state


def _check(check_id: str, level: str, **values: Any) -> dict[str, Any]:
    return {"id": check_id, "level": level, "values": values}


def _age_hours(then: datetime | None, now: datetime) -> float | None:
    return None if then is None else round((now - then).total_seconds() / 3600, 1)


def _setup_check(
    config: dict[str, Any] | None, backups: list[dict[str, Any]] | None
) -> dict[str, Any]:
    if config is None:
        return _check("setup", "unknown")
    agents = config["agent_ids"]
    if not agents and not backups:
        return _check("setup", "problem", agents=[], recurrence=config["recurrence"])
    level = "ok" if agents else "note"
    return _check("setup", level, agents=agents, recurrence=config["recurrence"])


def _newest_check(
    config: dict[str, Any] | None, backups: list[dict[str, Any]], now: datetime
) -> dict[str, Any]:
    dated = [item for item in backups if _parse(item["date"])]
    if not dated:
        return _check("newest", "problem", count=len(backups), age_hours=None, limit_hours=None)
    newest = max(dated, key=lambda item: _parse(item["date"]))
    age = _age_hours(_parse(newest["date"]), now)
    recurrence = config["recurrence"] if config else "never"
    limit = SCHEDULE_LIMIT_HOURS.get(recurrence)
    if limit is not None:
        level = "ok" if age <= limit else "problem"
    else:
        level = "ok" if age <= NO_SCHEDULE_NOTE_HOURS else "note"
    return _check(
        "newest",
        level,
        age_hours=age,
        limit_hours=limit or NO_SCHEDULE_NOTE_HOURS,
        date=newest["date"],
        recurrence=recurrence,
    )


def _last_run_check(
    config: dict[str, Any] | None,
    newest: dict[str, Any] | None,
    agent_errors: list[str],
    running: bool | None = None,
) -> dict[str, Any]:
    if config is None:
        return _check("last_run", "unknown")
    attempted, completed = _parse(config["last_attempted"]), _parse(config["last_completed"])
    failed_agents = sorted(set(newest["failed_agents"] if newest else []) | set(agent_errors))
    failed_attempt = (
        not running
        and attempted is not None
        and (completed is None or (attempted - completed).total_seconds() > ATTEMPT_GRACE_SECONDS)
    )
    values = {
        "attempted": config["last_attempted"],
        "completed": config["last_completed"],
        "failed_agents": failed_agents,
    }
    if failed_attempt or failed_agents:
        return _check("last_run", "problem", failed_attempt=failed_attempt, **values)
    if attempted is None and completed is None:
        return _check("last_run", "unknown", failed_attempt=False, **values)
    return _check("last_run", "ok", failed_attempt=False, **values)


def _targets_check(newest: dict[str, Any] | None, recorded: str | None) -> dict[str, Any]:
    if newest is None:
        return _check("targets", "unknown")
    local = [agent for agent in newest["agents"] if _is_local(agent)]
    remote = [agent for agent in newest["agents"] if not _is_local(agent)]
    at = _iso(recorded)
    return _check("targets", "ok" if remote or at else "note", local=local, remote=remote, at=at)


def _size_check(backups: list[dict[str, Any]]) -> dict[str, Any]:
    sized = sorted(
        (item for item in backups if _parse(item["date"]) and item["size"]),
        key=lambda item: _parse(item["date"]),
        reverse=True,
    )
    if len(sized) < 2:
        return _check("size", "unknown", count=len(sized))
    newest, baseline = sized[0], sized[1 : 1 + SIZE_BASELINE]
    expected = statistics.median(item["size"] for item in baseline)
    if not expected:
        return _check("size", "unknown", count=len(sized))
    ratio = (
        newest["size"] / expected
    )  # judged unrounded, so 0.499 is not rounded into the allowed range
    level = "ok" if SIZE_LOW <= ratio <= SIZE_HIGH else "note"
    return _check(
        "size",
        level,
        size=newest["size"],
        expected=int(expected),
        ratio=round(ratio, 2),
        baseline=len(baseline),
    )


def _retention_check(
    config: dict[str, Any] | None, backups: list[dict[str, Any]], now: datetime
) -> dict[str, Any]:
    if config is None:
        return _check("retention", "unknown")
    dates = [d for d in (_parse(item["date"]) for item in backups) if d]
    oldest_days = round((now - min(dates)).total_seconds() / 86400, 1) if dates else None
    limited = config["copies"] is not None or config["days"] is not None
    return _check(
        "retention",
        "ok" if limited else "note",
        copies=config["copies"],
        days=config["days"],
        count=len(backups),
        oldest_days=oldest_days,
    )


def _encryption_check(
    config: dict[str, Any] | None, newest: dict[str, Any] | None, recorded: str | None
) -> dict[str, Any]:
    if config is None:
        return _check("encryption", "unknown")
    protected = None if newest is None else newest["protected"]
    sound = config["encrypted"] and protected is not False
    # Someone who keeps backups unencrypted on purpose can say so; the line then stays quiet.
    at = None if sound else _iso(recorded)
    return _check(
        "encryption",
        "ok" if sound or at else "note",
        configured=config["encrypted"],
        newest_protected=protected,
        at=at,
    )


def _content_check(config: dict[str, Any] | None, newest: dict[str, Any] | None) -> dict[str, Any]:
    """What the newest backup holds: failed apps or folders are a problem, a missing database a hint."""
    if newest is None:
        return _check("content", "unknown")
    failed = sorted(set(newest.get("failed_apps") or []) | set(newest.get("failed_folders") or []))
    database = newest.get("database")
    if failed:
        return _check("content", "problem", failed=failed, database=database)
    if database is False:
        return _check(
            "content", "note", database=False, scheduled=(config or {}).get("include_database")
        )
    if database is None:
        return _check("content", "unknown")
    return _check(
        "content",
        "ok",
        database=True,
        apps=len(newest.get("apps") or []),
        folders=len(newest.get("folders") or []),
    )


def _remote_age_check(
    config: dict[str, Any] | None, backups: list[dict[str, Any]], now: datetime
) -> dict[str, Any] | None:
    """The newest copy on each external target against the same limit as the newest backup."""
    newest_on: dict[str, datetime] = {}
    for item in backups:
        when = _parse(item["date"])
        if when is None:
            continue
        for agent in item.get("agents") or []:
            if not _is_local(agent):
                newest_on[agent] = max(newest_on.get(agent, when), when)
    if not newest_on:
        return None
    limit = SCHEDULE_LIMIT_HOURS.get(config["recurrence"] if config else "never")
    limit = limit or NO_SCHEDULE_NOTE_HOURS
    rows = [
        {"agent": agent, "age_hours": _age_hours(when, now)}
        for agent, when in sorted(newest_on.items())
    ]
    stale = [row["agent"] for row in rows if row["age_hours"] > limit]
    return _check(
        "remote_age", "note" if stale else "ok", agents=rows, stale=stale, limit_hours=limit
    )


def _space_check(newest: dict[str, Any] | None, free: int | None) -> dict[str, Any] | None:
    """Whether the next backup fits on the local target; only asked when the newest one is kept there."""
    if newest is None or not any(_is_local(agent) for agent in newest.get("agents") or []):
        return None
    size = newest.get("size")
    if not size or free is None:
        return _check("space", "unknown")
    need = int(size * SPACE_FACTOR)
    level = "problem" if free < size else "note" if free < need else "ok"
    return _check("space", level, free=free, size=size, need=need)


def _attest_check(
    check_id: str, recorded: str | None, now: datetime, max_days: int | None
) -> dict[str, Any]:
    at = _parse(recorded)
    if at is None:
        return _check(check_id, "note", at=None, age_days=None)
    age = (now - at).days
    level = "note" if max_days is not None and age > max_days else "ok"
    return _check(check_id, level, at=recorded, age_days=age)


def _plans_check(
    plans: list[dict[str, Any]], backups: list[dict[str, Any]]
) -> dict[str, Any] | None:
    dates = [d for d in (_parse(item["date"]) for item in backups) if d]
    checked = missing = 0
    for plan in plans[:MAX_PLANS_CHECKED]:
        recorded = _parse(plan.get("at"))
        if recorded is None:
            continue
        checked += 1
        if not any(
            0 <= (recorded - d).total_seconds() <= PLAN_BACKUP_WINDOW_SECONDS for d in dates
        ):
            missing += 1
    if not checked:
        return None
    return _check("plan_backups", "ok" if not missing else "note", checked=checked, missing=missing)


def _own_check(backups: list[dict[str, Any]]) -> dict[str, Any] | None:
    """Housekeeper's safety copies pile up: Home Assistant's retention does not remove them."""
    own = [item for item in backups if item.get("own")]
    size = sum(item["size"] for item in own if isinstance(item.get("size"), int))
    if len(own) < OWN_BACKUPS_NOTE and size < OWN_BACKUPS_BYTES:
        return None
    return _check("own_backups", "note", count=len(own), size=size)


def evaluate(
    state: dict[str, Any], now: datetime, attest: dict[str, Any], plans: list[dict[str, Any]]
) -> dict[str, Any]:
    """Judge the collected state. ``plans`` are executed plans that recorded a backup (newest first)."""
    if not state.get("available"):
        return {"available": False, "checks": [], "backups": [], "overall": "unknown"}
    config, backups = state.get("config"), state.get("backups")
    selected = (
        [item for item in backups if item.get("ha_included") is not False]
        if backups is not None
        else None
    )
    # Housekeeper's own safety copies before a plan say nothing about the backup strategy, whatever
    # they hold: they count for space, the plans and the clean-up only.
    strategy = [item for item in selected if not item.get("own")] if selected is not None else None
    # Backups made outside Home Assistant are out of sight: everything about Home Assistant's own
    # backups is left out, only what concerns Housekeeper's safety copies and the restore stays.
    external = _iso(attest.get("external"))
    checks = [_check("external", "ok", at=external) if external else _setup_check(config, strategy)]
    if selected is None:
        if not external:
            checks.append(_check("newest", "unknown"))
        listing: list[dict[str, Any]] = []
        everything: list[dict[str, Any]] = []
    elif external:
        everything = sorted(selected, key=lambda item: item["date"] or "", reverse=True)
        listing = [item for item in everything if not item.get("own")]
        if (
            space_check := _space_check(
                everything[0] if everything else None, state.get("disk_free")
            )
        ) is not None:
            checks.append(space_check)
    else:
        # HA marks its scheduled backups True and its manual backups False; backups made by other
        # tools (e.g. Google Drive Backup) have None and count too. The Supervisor's app-update
        # backups hold no Home Assistant (``ha_included`` False) and are left out.
        everything = sorted(selected, key=lambda item: item["date"] or "", reverse=True)
        listing = [item for item in everything if not item.get("own")]
        newest = listing[0] if listing and listing[0]["date"] else None
        checks.append(_newest_check(config, listing, now))
        checks.append(
            _last_run_check(config, newest, state.get("agent_errors") or [], state.get("running"))
        )
        checks.append(_targets_check(newest, attest.get("targets")))
        checks.append(_size_check(listing))
        checks.append(_retention_check(config, listing, now))
        checks.append(_encryption_check(config, newest, attest.get("encryption")))
        checks.append(_content_check(config, newest))
        if (remote_check := _remote_age_check(config, listing, now)) is not None:
            checks.append(remote_check)
        if (space_check := _space_check(newest, state.get("disk_free"))) is not None:
            checks.append(space_check)
    if not external:
        checks.append(_attest_check("emergency_kit", attest.get("emergency_kit"), now, None))
    checks.append(_attest_check("restore_test", attest.get("restore_test"), now, RESTORE_TEST_DAYS))
    if selected is not None and (plan_check := _plans_check(plans, everything)):
        checks.append(plan_check)
    if selected is not None and (own_check := _own_check(everything)):
        checks.append(own_check)
    overall = max((item["level"] for item in checks), key=_SEVERITY.__getitem__, default="unknown")
    counts = {level: sum(1 for item in checks if item["level"] == level) for level in _SEVERITY}
    return {
        "available": True,
        "checks": checks,
        "overall": overall,
        "counts": counts,
        "backups": [
            {
                "date": item["date"],
                "size": item["size"],
                "agents": item["agents"],
                "protected": item["protected"],
                "automatic": item["automatic"],
                "failed_agents": item["failed_agents"],
                "own": bool(item.get("own")),
                "partial": bool(item.get("partial")),
                "id": item.get("id"),
                "name": item.get("name"),
                "version": item.get("version"),
                "database": item.get("database"),
                "ha_included": item.get("ha_included"),
                "apps": item.get("apps") or [],
                "folders": item.get("folders") or [],
                "failed_apps": item.get("failed_apps") or [],
                "failed_folders": item.get("failed_folders") or [],
                "agent_sizes": item.get("agent_sizes") or {},
            }
            for item in everything[:BACKUP_LIST_MAX]
        ],
        "backup_count": len(listing),
        "own_count": sum(1 for item in everything if item.get("own")),
        "attest": {kind: attest.get(kind) for kind in ATTEST_KINDS},
    }


def executed_plan_backups(journal_plans: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """The recorded backup time of executed plans, newest first (journal order)."""
    return [
        {"id": plan.get("plan_id"), "at": plan["backup"].get("at")}
        for plan in journal_plans
        if isinstance(plan.get("backup"), dict) and plan.get("executed")
    ]


class AttestStore:
    """Housekeeper's own record of what only the person can confirm."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, ATTEST_STORAGE_KEY)
        self.record: dict[str, str | None] = {kind: None for kind in ATTEST_KINDS}

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if isinstance(data, dict):
            for kind in ATTEST_KINDS:
                if _parse(data.get(kind)):
                    self.record[kind] = data[kind]

    def set(self, kind: str, day: date | None = None) -> None:
        if kind not in ATTEST_KINDS:
            raise ValueError(kind)
        stamp = datetime.combine(day, datetime.min.time(), tzinfo=UTC) if day else datetime.now(UTC)
        self.record[kind] = stamp.isoformat()
        self._store.async_delay_save(lambda: dict(self.record), 1)

    def clear(self, kind: str) -> None:
        if kind not in ATTEST_KINDS:
            raise ValueError(kind)
        self.record[kind] = None
        self._store.async_delay_save(lambda: dict(self.record), 1)


async def backup_health(
    hass: HomeAssistant, attest: AttestStore, journal_plans: list[dict[str, Any]]
) -> dict[str, Any]:
    """The full report for the panel."""
    state = await collect(hass)
    return evaluate(state, datetime.now(UTC), attest.record, executed_plan_backups(journal_plans))
