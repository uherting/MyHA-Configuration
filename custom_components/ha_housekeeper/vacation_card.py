"""What the dashboard card "vacation mode" shows: whether the mode is on, how many failures it holds back, the grace period.

Pure display of what the exceptions already know (``vacation_meta`` of every scan). The card has no switch: the switch
belongs to the helper or the calendar the person chose. "Since" and "until" are not known here; when the switch is a
calendar, the card reads them from that calendar's own attributes.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Final

STATES: Final = ("off", "on", "after", "unset")


def _parse(value: Any) -> datetime | None:
    try:
        return datetime.fromisoformat(str(value))
    except ValueError:
        return None


def vacation_view(meta: dict[str, Any] | None, now: datetime) -> dict[str, Any]:
    """The state (``on``, ``after`` the vacation while the grace period runs, ``off``, ``unset`` without a switch)."""
    if not meta:
        return {"state": "unset"}
    # The grace period runs from the end of the mode, whether or not a failure is held back in it.
    ends = [_parse(meta.get("after_until"))]
    ended = _parse(meta.get("ended_at"))
    if ended is not None and isinstance(meta.get("grace_hours"), int | float):
        ends.append(ended + timedelta(hours=meta["grace_hours"]))
    until = max((e for e in ends if e is not None), default=None)
    if meta.get("active"):
        state = "on"
    elif until is not None and until > now:
        state = "after"
    else:
        state = "off"
    return {
        "state": state,
        "entity": meta.get("entity"),
        "held": meta.get("held") or 0,
        "rules": meta.get("rules") or 0,
        "grace_hours": meta.get("grace_hours"),
        "after_until": until.isoformat() if until is not None and state == "after" else None,
        "ended_at": meta.get("ended_at"),
        "missing": bool(meta.get("missing")),
    }
