"""Which battery sensors are not a battery you change: storage, vehicle, a device's own pack.

Home Assistant gives every charge level the device class ``battery``. Housekeeper cares for cells
you replace, so a sensor is only proposed as "no replaceable battery" when its device also reports
power, energy, current, charging or a plug, or is a mower or a vacuum. The proposal is a hint: it
stays out of the counts until you confirm it or say it is a battery after all.
"""

from __future__ import annotations

from typing import Any

KINDS = ("device", "storage", "vehicle", "other")
KEEP = "keep"  # "it is a battery after all": never proposed again
ALL_KINDS = (*KINDS, KEEP)
SIGNAL_CLASSES = frozenset(
    {"power", "energy", "energy_storage", "current", "battery_charging", "plug"}
)
SIGNAL_DOMAINS = frozenset({"lawn_mower", "vacuum"})
NOTES_PLATFORM = "battery_notes"
CHARGING = frozenset({"battery_charging", "plug"})


def excluded(item: dict[str, Any]) -> bool:
    """True when the sensor does not count as a replaceable battery (confirmed or proposed).

    The sensors of Battery Notes (level copy, low flag, last change) repeat the real battery sensor;
    only its battery type is of use (battery_care.noted_types), so they never count.
    """
    if item.get("platform") == NOTES_PLATFORM:
        return True
    kind = item.get("battery_kind")
    return kind in KINDS or (kind is None and bool(item.get("battery_suggest")))


def _guess(signals: set[str]) -> str:
    if signals & SIGNAL_DOMAINS:
        return "device"
    if "energy_storage" in signals or ("energy" in signals and not signals & CHARGING):
        return "storage"
    return "other"


def apply_battery_kinds(objects: list[dict[str, Any]], kinds: dict[str, str]) -> None:
    """Set ``battery_kind`` (your choice) and ``battery_suggest`` (the proposal) on battery sensors."""
    signals: dict[str, set[str]] = {}
    for item in objects:
        if item["object_type"] != "entity" or not item.get("device_id"):
            continue
        found = signals.setdefault(item["device_id"], set())
        if item.get("device_class") in SIGNAL_CLASSES:
            found.add(item["device_class"])
        domain = item["object_id"].partition(".")[0]
        if domain in SIGNAL_DOMAINS:
            found.add(domain)
    for item in objects:
        if item["object_type"] != "entity":
            continue
        # A volt sensor named like a battery has the class voltage; once you decided about it, it counts too.
        if item.get("device_class") != "battery" and item["object_id"] not in kinds:
            continue
        item.pop("battery_kind", None)
        item.pop("battery_suggest", None)
        if kind := kinds.get(item["object_id"]):
            item["battery_kind"] = kind
        elif found := signals.get(item.get("device_id") or ""):
            item["battery_suggest"] = {"kind": _guess(found), "signals": sorted(found)}
