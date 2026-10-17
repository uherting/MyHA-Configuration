"""Housekeeper's own safety backups: list them, suggest which ones can go, delete them.

Housekeeper makes a backup before risky plans, named "Housekeeper <plan>" and marked in its
metadata. Home Assistant does not delete those by itself. Only backups with that mark are ever
listed or deleted, never the person's regular ones. A backup is protected while its plan is still
watched and while it is the newest one that still allows an undo.
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime
from typing import Any

from homeassistant.core import HomeAssistant

from .cleanup import plan_summary

KEEP_LAST = 3
VERIFY_PAUSE = 2.0  # seconds between two looks at the backup list after a backup was made
KEEP_DAYS = 14
MAX_DAYS = 3650
MAX_LAST = 100
# Plans after which only the backup brings back what was deleted or merged.
BACKUP_ONLY_KINDS = frozenset({"purge_statistics", "trim_history", "migrate_meter"})


def _iso(value: Any) -> str | None:
    if isinstance(value, datetime):
        return value.astimezone(UTC).isoformat()
    return value if isinstance(value, str) else None


def _parse(value: Any) -> datetime | None:
    try:
        parsed = datetime.fromisoformat(value) if isinstance(value, str) else None
    except ValueError:
        return None
    return parsed if parsed is None or parsed.tzinfo else parsed.replace(tzinfo=UTC)


async def _read(hass: HomeAssistant) -> tuple[Any, dict[str, Any]] | None:
    """The backup manager and its backups, or None when they cannot be read."""
    try:
        from homeassistant.components.backup import async_get_manager

        manager = async_get_manager(hass)
        backups, _ = await manager.async_get_backups()
    except Exception:  # noqa: BLE001 - without a backup manager there is nothing to list
        return None
    return manager, backups


async def verify_backup(
    hass: HomeAssistant, name: str, with_database: bool, attempts: int = 3
) -> str | None:
    """Whether the backup just made is really there: None when it is (or cannot be looked at), else why not.

    Looks for the Housekeeper backup of this name in the manager's list and wants a size above zero in
    at least one place and, when the plan writes into the recorder, the database inside. The list is
    read again a little later because an agent may need a moment to report a finished upload.
    """
    why = "missing"
    for attempt in range(attempts):
        read = await _read(hass)
        if read is None:
            return None  # a manager that cannot be read cannot be held against the backup
        found = [b for b in read[1].values() if _own(b) and getattr(b, "name", None) == name]
        if found:
            backup = found[0]
            sizes = [
                getattr(s, "size", None) for s in (getattr(backup, "agents", None) or {}).values()
            ]
            if not any(isinstance(size, int) and size > 0 for size in sizes):
                why = "empty"
            elif with_database and not getattr(backup, "database_included", False):
                why = "without_database"
            else:
                return None
        if attempt + 1 < attempts:
            await asyncio.sleep(VERIFY_PAUSE)
    return why


def _own(backup: Any) -> bool:
    return (getattr(backup, "extra_metadata", None) or {}).get("housekeeper") is True


def build_rows(
    backups: dict[str, Any],
    plans: list[dict[str, Any]],
    now: datetime,
    keep_last: int,
    keep_days: int,
) -> list[dict[str, Any]]:
    """One row per Housekeeper backup, newest first, with protection and the rule's suggestion."""
    by_prefix = {p["plan_id"][:8]: p for p in plans if isinstance(p.get("plan_id"), str)}
    own = sorted(
        (b for b in backups.values() if _own(b)),
        key=lambda b: _iso(getattr(b, "date", None)) or "",
        reverse=True,
    )
    rows: list[dict[str, Any]] = []
    undo_taken = False
    for index, backup in enumerate(own):
        name = str(getattr(backup, "name", "") or "")
        plan = by_prefix.get(name.removeprefix("Housekeeper ").strip())
        agents = getattr(backup, "agents", None) or {}
        sizes = [getattr(s, "size", None) for s in agents.values()]
        date = _parse(_iso(getattr(backup, "date", None)))
        age_days = (now - date).days if date else None
        protected = None
        done_kinds: list[str] = []
        if plan is not None:
            summary = plan_summary(plan)
            done_kinds = sorted(
                {
                    a["kind"]
                    for a in plan.get("actions", [])
                    if (a.get("result") or {}).get("state") == "done"
                }
            )
            if summary["followup"] == "watching":
                protected = "watching"
            elif not undo_taken and summary["undoable"] and plan.get("status") != "undone":
                protected = "undo"
                undo_taken = True
        only_return = bool(BACKUP_ONLY_KINDS & set(done_kinds))
        rows.append(
            {
                "backup_id": getattr(backup, "backup_id", None),
                "name": name,
                "date": _iso(getattr(backup, "date", None)),
                "age_days": age_days,
                "size": next((s for s in sizes if isinstance(s, int)), None),
                "agents": sorted(agents),
                "with_database": bool(getattr(backup, "database_included", False)),
                "plan_id": plan["plan_id"] if plan else None,
                "plan_status": plan.get("status") if plan else None,
                "plan_kinds": done_kinds,
                "protected": protected,
                "only_return": only_return,
                "suggested": protected is None
                and index >= keep_last
                and age_days is not None
                and age_days >= keep_days,
            }
        )
    return rows


async def list_backups(
    hass: HomeAssistant,
    plans: list[dict[str, Any]],
    now: datetime,
    keep_last: int = KEEP_LAST,
    keep_days: int = KEEP_DAYS,
) -> dict[str, Any]:
    """The list for the panel."""
    read = await _read(hass)
    if read is None:
        return {"available": False, "rows": []}
    rows = build_rows(read[1], plans, now, keep_last, keep_days)
    sizes = [r["size"] or 0 for r in rows]
    picked = [r for r in rows if r["suggested"]]
    return {
        "available": True,
        "rows": rows,
        "keep_last": keep_last,
        "keep_days": keep_days,
        "total": {"count": len(rows), "bytes": sum(sizes)},
        "suggested": {"count": len(picked), "bytes": sum(r["size"] or 0 for r in picked)},
    }


async def delete_backup(hass: HomeAssistant, backup_id: str) -> str | None:
    """Delete one Housekeeper backup from all places. None when it is gone, else the reason."""
    read = await _read(hass)
    if read is None:
        return "backup_unavailable"
    manager, backups = read
    backup = backups.get(backup_id)
    if backup is None:
        return None
    if not _own(backup):
        return "not_housekeeper_backup"
    try:
        errors = await manager.async_delete_backup(backup_id)
    except Exception:  # noqa: BLE001 - reported as one reason, the log has the detail
        return "delete_failed"
    return "delete_failed" if errors else None


async def backup_exists(hass: HomeAssistant, backup_id: str) -> bool | None:
    """Whether the backup is still there; None when the manager cannot be read."""
    read = await _read(hass)
    return None if read is None else backup_id in read[1]
