"""Notes on objects that tell Housekeeper what to expect: offline on purpose, seasonal, a spare, keep.

Stored by Housekeeper only; Home Assistant stays untouched. A mark of an object hides the
"not available" findings of that object (of a device: of its entities; of an integration or app: its
"not loaded" and "app stopped" findings, and while it is down also the outages of its devices and
entities), never a broken reference.
"Keep" also blocks every cleanup step on the object; the label ``housekeeper_keep`` does the same. A mark with a review date that has passed no
longer hides anything; the finding comes back as due.
A mark can carry a time window (fixed hours, or while the sun is below the horizon): it hides only
inside that window, plus a grace period after it, so a device that is on by day is watched by day.
"""

from __future__ import annotations

from datetime import UTC, datetime, time, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import KEEP_LABEL, MARKS_STORAGE_KEY, STORAGE_VERSION
from .ignored import REASON_LIMIT, VIAS, due

SAVE_DELAY = 10
KINDS = ("expected_offline", "seasonal", "spare", "keep", "replaced")
HIDING_KINDS = ("expected_offline", "seasonal", "spare", "replaced")  # "keep" hides nothing
OBJECT_TYPES = ("entity", "device", "config_entry", "app")
KINDS_OF = {  # what an integration or an app can be marked as; "keep" and "replaced" need an entity or device
    "config_entry": ("expected_offline", "seasonal", "spare"),
    "app": ("expected_offline", "seasonal", "spare"),
}
WINDOW_MODES = ("time", "sun")
GRACE_DEFAULT = 30  # minutes a window keeps hiding after it ended: a device needs time to come back
GRACE_MAX = 120
ITEM_LIMIT = 2000
TARGET_LIMIT = 255


def mark_key(object_type: str, object_id: str) -> str:
    return f"{object_type}:{object_id}"


def _text(value: dict[str, Any], name: str) -> str | None:
    return value[name] if isinstance(value.get(name), str) else None


def _clock(value: Any) -> str | None:
    """``"HH:MM"`` as is, anything else None."""
    if not isinstance(value, str):
        return None
    try:
        return time.fromisoformat(value).strftime("%H:%M") if len(value) == 5 else None
    except ValueError:
        return None


def clean_window(value: Any) -> dict[str, str] | None:
    """A valid window as stored, or None (no window)."""
    if not isinstance(value, dict):
        return None
    if value.get("mode") == "sun":
        return {"mode": "sun"}
    start, end = _clock(value.get("from")), _clock(value.get("to"))
    if value.get("mode") == "time" and start and end and start != end:
        return {"mode": "time", "from": start, "to": end}
    return None


def clean_grace(value: Any) -> int:
    """Minutes of grace, within bounds; the default for anything else."""
    if isinstance(value, int) and not isinstance(value, bool):
        return min(max(value, 0), GRACE_MAX)
    return GRACE_DEFAULT


def window_active(
    mark: dict[str, Any], local_now: datetime, sun: tuple[bool, datetime] | None = None
) -> bool:
    """Whether the mark hides right now: always without a window, else inside it or its grace.

    ``local_now`` is the time in the Home Assistant time zone. ``sun`` is ``(below horizon, since)``
    of ``sun.sun``; without it a sun window is not active, so the finding stays visible.
    """
    window = mark.get("window")
    if not window:
        return True
    grace = timedelta(minutes=clean_grace(mark.get("grace")))
    if window["mode"] == "sun":
        if sun is None:
            return False
        below, since = sun
        return below or local_now - since < grace
    start, end = time.fromisoformat(window["from"]), time.fromisoformat(window["to"])
    day = local_now.replace(hour=0, minute=0, second=0, microsecond=0)
    # The window of today and of yesterday (it may run past midnight), each plus its grace.
    for base in (day, day - timedelta(days=1)):
        opens = base.replace(hour=start.hour, minute=start.minute)
        closes = base.replace(hour=end.hour, minute=end.minute)
        if closes <= opens:
            closes += timedelta(days=1)
        if opens <= local_now < closes + grace:
            return True
    return False


def counts_from(
    mark: dict[str, Any], local_now: datetime, sun: tuple[bool, datetime] | None = None
) -> datetime | None:
    """When an outage of the marked object starts to count: the end of the window plus its grace.

    None without a window, while the window hides, or when the end is unknown. An outage that began
    in the night is not a day old in the morning; it is as old as the time since it matters.
    """
    window = mark.get("window")
    if not window or window_active(mark, local_now, sun):
        return None
    grace = timedelta(minutes=clean_grace(mark.get("grace")))
    if window["mode"] == "sun":
        return sun[1] + grace if sun else None
    end = time.fromisoformat(window["to"])
    day = local_now.replace(hour=0, minute=0, second=0, microsecond=0)
    ended = [
        e
        for base in (day, day - timedelta(days=1))
        if (e := base.replace(hour=end.hour, minute=end.minute)) <= local_now
    ]
    return max(ended) + grace if ended else None


def _clean(value: Any) -> dict[str, Any] | None:
    if not isinstance(value, dict) or value.get("kind") not in KINDS:
        return None
    return {
        "kind": value["kind"],
        "at": _text(value, "at") or "",
        "reason": str(value.get("reason") or "")[:REASON_LIMIT],
        "until": _text(value, "until"),
        "target": (_text(value, "target") or "")[:TARGET_LIMIT] or None,
        "by": _text(value, "by"),
        "via": value["via"] if value.get("via") in VIAS else None,
        "window": clean_window(value.get("window")),
        "grace": clean_grace(value.get("grace")),
    }


class MarkStore:
    """One mark per entity or device."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, MARKS_STORAGE_KEY)
        self.items: dict[str, dict[str, Any]] = {}

    async def async_load(self) -> None:
        """Load the marks; anything of an unknown shape is dropped."""
        data = await self._store.async_load()
        if not isinstance(data, dict) or not isinstance(data.get("items"), dict):
            return
        cleaned = ((key, _clean(value)) for key, value in data["items"].items())
        self.items = {
            key: item
            for key, item in cleaned
            if isinstance(key, str) and key.split(":", 1)[0] in OBJECT_TYPES and item is not None
        }

    def set(
        self,
        key: str,
        kind: str,
        now: datetime,
        *,
        reason: str = "",
        until: datetime | None = None,
        target: str | None = None,
        by: str | None = None,
        window: dict[str, Any] | None = None,
        grace: int = GRACE_DEFAULT,
        via: str | None = None,
    ) -> bool:
        """Record a mark; False when the kind is unknown, the window is invalid or the store is full."""
        if window is not None and clean_window(window) is None:
            return False
        if kind not in KINDS or (key not in self.items and len(self.items) >= ITEM_LIMIT):
            return False
        self.items[key] = {
            "kind": kind,
            "at": now.isoformat(),
            "reason": reason.strip()[:REASON_LIMIT],
            "until": until.isoformat() if until else None,
            "target": (target or "")[:TARGET_LIMIT] or None,
            "by": by,
            "via": via,
            "window": clean_window(window),
            "grace": clean_grace(grace),
        }
        self._save()
        return True

    def restore(self, key: str, entry: dict[str, Any] | None) -> None:
        """Put a mark back exactly as it was, or take it away when there was none."""
        if entry is None:
            self.items.pop(key, None)
        elif (cleaned := _clean(entry)) is not None:
            self.items[key] = cleaned
        self._save()

    def clear(self, key: str) -> bool:
        if self.items.pop(key, None) is None:
            return False
        self._save()
        return True

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"items": self.items}, SAVE_DELAY)


def apply_marks(
    objects: list[dict[str, Any]],
    findings: list[dict[str, Any]],
    marks: dict[str, dict[str, Any]],
    now: datetime | None = None,
    sun: tuple[bool, datetime] | None = None,
) -> None:
    """Put the marks on the objects and let them hide or revive "not available" findings.

    Call it after the ignore flags of the findings are set: a finding that is hidden already stays so.
    A mark with a window hides only inside it (``sun``: see ``window_active``); outside, the finding
    stays visible and carries ``mark_outside_window``.
    """
    now = now or datetime.now(UTC)
    local_now = dt_util.as_local(now)
    device_of: dict[str, str | None] = {}
    entry_of: dict[str, list[str]] = {}
    devices: dict[str, dict[str, Any]] = {}
    for item in objects:
        item.pop("mark", None)
        item.pop("mark_due", None)
        item.pop("marked_keep", None)
        if item["object_type"] == "entity":
            device_of[item["object_id"]] = item.get("device_id")
            entry_of[f"entity:{item['object_id']}"] = [item.get("config_entry_id") or ""]
        elif item["object_type"] == "device":
            devices[item["object_id"]] = item
            entry_of[f"device:{item['object_id']}"] = item.get("config_entry_ids") or []
        if KEEP_LABEL in (
            item.get("labels") or []
        ):  # the label is a "keep" mark made in Home Assistant
            item["marked_keep"] = True
        mark = marks.get(mark_key(item["object_type"], item["object_id"]))
        if mark is None:
            continue
        item["mark"] = mark
        if due(mark, now):
            item["mark_due"] = True
        elif mark["kind"] == "keep":
            item["marked_keep"] = True
    for item in objects:  # an entity of a device that is to be kept is kept as well
        device = devices.get(item.get("device_id") or "")
        if item["object_type"] == "entity" and device and device.get("marked_keep"):
            item["marked_keep"] = True
    # An integration that is down, and the app it hangs on: their marks cover the outages below them.
    down = {
        f["object_id"]
        for f in findings
        if f.get("rule_id") in ("config_entry.not_loaded", "config_entry.reauth")
    }
    app_of = {
        f["affected_object"]: f["object_id"]
        for f in findings
        if f.get("rule_id") == "app.stopped_in_use" and f.get("affected_object")
    }

    def above(key: str) -> tuple[str, ...]:
        entries = [e for e in entry_of.get(key, []) if e in down]
        return (
            *(mark_key("config_entry", e) for e in entries),
            *(mark_key("app", app_of[e]) for e in entries if e in app_of),
        )

    for finding in findings:
        finding.pop("mark", None)
        finding.pop("mark_outside_window", None)
        if finding.get("rule_id") in ("config_entry.not_loaded", "config_entry.reauth"):
            keys = (mark_key("config_entry", finding["object_id"]),)
        elif finding.get("rule_id") == "device.down":
            key = mark_key("device", finding["object_id"])
            keys = (key, *above(key))
        elif finding.get("rule_id") == "app.stopped_in_use":
            keys = (
                mark_key("app", finding["object_id"]),
                mark_key("config_entry", finding.get("affected_object") or ""),
            )
        elif finding["classification"] in ("unavailable", "unknown", "stale"):
            entity_id = finding["object_id"]
            keys = (
                mark_key("entity", entity_id),
                mark_key("device", device_of.get(entity_id) or ""),
                *above(mark_key("entity", entity_id)),
            )
        else:
            continue
        for key in keys:
            mark = marks.get(key)
            if mark is None or mark["kind"] not in HIDING_KINDS:
                continue
            if due(mark, now):
                finding["resurfaced"] = bool(finding.get("resurfaced")) or not finding["ignored"]
            elif not window_active(mark, local_now, sun):
                finding["mark_outside_window"] = True
            elif not finding["ignored"]:
                finding["ignored_by"], finding["ignored"], finding["mark"] = "mark", True, mark
                break
