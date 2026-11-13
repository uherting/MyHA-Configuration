"""What the dashboard card "backup" shows: how old the newest backup is, whether a copy lies off the device, the week.

Everything comes from the backup report each scan reads anyway (``backup_health``); the card asks nothing new and sets no
limit of its own: the age limit, the copy off the device and the size are the checks of the backup protection in the
panel. Red is only for a missing protection (no backup at all, or every copy on this device); an old backup, a failed run
or an odd size is a hint.
"""

from __future__ import annotations

from datetime import UTC, date, datetime, timedelta
from typing import Any, Final

DAYS: Final = 7  # the strip
STATES: Final = ("ok", "warn", "bad", "unclear")


def _check(report: dict[str, Any], check_id: str) -> dict[str, Any] | None:
    return next((c for c in report.get("checks") or [] if c.get("id") == check_id), None)


def _day(value: Any, zone: Any) -> date | None:
    try:
        return datetime.fromisoformat(str(value)).astimezone(zone).date()
    except ValueError:
        return None


def backup_view(report: dict[str, Any] | None, now: datetime) -> dict[str, Any]:
    """The verdict of the card, the figures behind it and a strip of the last days; empty before the first report.

    ``report`` is what ``backup_health.evaluate`` returned, ``now`` is local time (the strip counts local days).
    ``state`` is ``ok``, ``warn``, ``bad`` or ``unclear``; it is ``unclear`` while Home Assistant's backup manager cannot
    be read and when the person says the backups are made outside Home Assistant.
    """
    if report is None:
        return {}
    external = _check(report, "external")
    newest = _check(report, "newest")
    if not report.get("available") or external or newest is None or newest["level"] == "unknown":
        return {"state": "unclear", "outside": bool(external)}
    listing = [b for b in report.get("backups") or [] if not b.get("own") and not b.get("partial")]
    targets = _check(report, "targets")
    last_run = _check(report, "last_run")
    size = _check(report, "size")
    remote_age = _check(report, "remote_age")
    remote = (targets or {}).get("values", {}).get("remote") or []
    attested = bool((targets or {}).get("values", {}).get("at"))
    external_copy: bool | None = (
        (bool(remote) or attested) if targets and targets["level"] != "unknown" else None
    )
    days: dict[date, str] = {}
    for item in listing:
        day = _day(item.get("date"), now.tzinfo or UTC)
        if day is not None:
            # A day with a copy that did not reach every target counts as failed, unless another backup that day did.
            failed = bool(item.get("failed_agents"))
            days[day] = "ok" if days.get(day) == "ok" or not failed else "failed"
    today = now.date()
    strip = [days.get(today - timedelta(days=offset), "none") for offset in range(DAYS - 1, -1, -1)]
    values = newest.get("values") or {}
    no_backup = values.get("age_hours") is None
    state = "ok"
    if no_backup or external_copy is False:
        state = "bad"
    elif (
        newest["level"] != "ok"
        or (last_run and last_run["level"] == "problem")
        or (size and size["level"] == "note")
        or (remote_age and remote_age["level"] != "ok")
        or "failed" in strip
    ):
        state = "warn"
    return {
        "state": state,
        "outside": False,
        "newest_at": values.get("date"),
        "age_hours": values.get("age_hours"),
        "limit_hours": values.get("limit_hours") if not no_backup else None,
        "external_copy": external_copy,
        "external_count": len(remote) if remote else None,
        "size": next((b["size"] for b in listing if b.get("size")), None),
        "size_unusual": None
        if size is None or size["level"] == "unknown"
        else size["level"] == "note",
        "failed_days": strip.count("failed"),
        "last_run_failed": bool(last_run and last_run["level"] == "problem"),
        "encrypted": next((b["protected"] for b in listing), None),
        "history": strip,
    }
