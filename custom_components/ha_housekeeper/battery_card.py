"""The batteries for the dashboard card: the weakest, the next round of changes by room and what to buy.

The levels and flags come from the scan, the forecast ("about 5 days left") from the daily read of the statistics
(``battery_forecast``). Without a forecast the card still lists the weakest by level and says it follows.
"""

from __future__ import annotations

import re
from datetime import UTC, date, datetime, timedelta
from typing import Any, Final

from homeassistant.util import dt as dt_util

from .battery_kind import excluded
from .hygiene import battery_level

ROUND_DAYS: Final = 14  # what runs low within this many days belongs to the next round of changes
WEAKEST_MAX: Final = 10
ROUND_MAX: Final = 30
SHOP_MAX: Final = 20
# A rechargeable battery is charged, not bought; the words are compared in lower case.
_NO_PURCHASE: Final = {"rechargeable", "akku", "accu", "wiederaufladbar", "rechargeable battery"}

# What the forecast of a row says about itself.
ESTIMATE: Final = "estimate"  # a line through the days since the last change
STABLE: Final = "stable"  # hardly any use, or further away than the line can tell
FEW_DATA: Final = "few_data"  # less than a week of daily means, or none
PENDING: Final = "pending"  # the forecast is not read yet
LOW: Final = "low"

_COUNT = re.compile(r"^\s*(\d+)\s*[×x]\s*(.+?)\s*$", re.IGNORECASE)


def parse_type(value: str | None) -> tuple[str, int] | None:
    """The cell and the number of cells of a battery type: ``"2× AA"`` is two AA, ``"CR2032"`` is one CR2032."""
    text = (value or "").strip()
    if not text:
        return None
    found = _COUNT.match(text)
    # "0× AA" is still a battery to buy: at least one cell.
    return (found.group(2), max(1, int(found.group(1)))) if found else (text, 1)


def _names(snapshot: dict[str, Any]) -> tuple[dict[str, str], dict[str, dict[str, Any]]]:
    areas = {o["object_id"]: o["name"] for o in snapshot["objects"] if o["object_type"] == "area"}
    devices = {o["object_id"]: o for o in snapshot["objects"] if o["object_type"] == "device"}
    return areas, devices


def _forecast_rows(forecast: dict[str, Any] | None) -> dict[str, dict[str, Any]]:
    """The forecast rows by entity: the percent batteries and the voltage ones."""
    if not forecast or not forecast.get("available") or forecast.get("busy"):
        return {}
    rows = {r["entity_id"]: r for r in forecast.get("rows") or []}
    for row in (forecast.get("voltage") or {}).get("rows") or []:
        rows.setdefault(row["entity_id"], row)
    return rows


def battery_items(
    snapshot: dict[str, Any],
    types: dict[str, str],
    forecast: dict[str, Any] | None,
    elapsed_days: int,
) -> list[dict[str, Any]]:
    """One row per working battery: name, room, type, level, flag and what the forecast says.

    ``elapsed_days`` is how long ago the forecast was read: the days it counted down have passed since.
    """
    areas, devices = _names(snapshot)
    rows = _forecast_rows(forecast)
    pending = forecast is None or bool(forecast.get("busy"))  # not read yet, or not now: it follows
    limit = snapshot["meta"].get("low_battery_percent") or 20
    items: list[dict[str, Any]] = []
    for o in snapshot["objects"]:
        if o["object_type"] != "entity" or excluded(o):
            continue
        # A volt sensor named like a battery has the class voltage; the forecast lists it, so the card does.
        if o.get("device_class") != "battery" and o["object_id"] not in rows:
            continue
        level, flagged = battery_level(o)
        found = rows.get(o["object_id"])
        percent = level if level is not None else (found or {}).get("percent")
        if level is None and not flagged and found is None:
            continue
        device = devices.get(o.get("device_id") or "") or {}
        area = areas.get(o.get("area_id") or device.get("area_id") or "", "")
        low = (
            flagged
            or (percent is not None and percent <= limit)
            or (found or {}).get("state") == "low"
        )
        days = found.get("days_left") if found else None
        if low:
            days = 0  # due now, whatever an older forecast said
        elif days is not None:
            days = max(0, days - elapsed_days)
        if low:
            quality = LOW
        elif pending:
            quality = PENDING
        elif found is None:
            quality = FEW_DATA
        elif found.get("state") in ("stable", "far"):
            quality = STABLE
        else:
            quality = ESTIMATE
        items.append(
            {
                "entity_id": o["object_id"],
                "name": device.get("name") or o["name"],
                "area": area,
                "type": types.get(o["object_id"]) or "",
                "percent": None if percent is None else round(percent),
                "low": bool(low),
                "days_left": days,
                "quality": quality,
                "_device": o.get("device_id") or None,
            }
        )
    return _one_per_device(items)


def _one_per_device(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """A device with a percent sensor and a "battery low" flag is one battery, not two.

    Zigbee devices often have both. The row of the percent sensor stands for the device; the flag
    makes it low, the soonest forecast counts, and the first battery type that is set is the type.
    """
    merged: list[dict[str, Any]] = []
    by_device: dict[str, dict[str, Any]] = {}
    for item in items:
        device = item.pop("_device", None)
        if device is None:
            merged.append(item)
            continue
        first = by_device.get(device)
        if first is None:
            by_device[device] = item
            merged.append(item)
            continue
        if first["percent"] is None and item["percent"] is not None:
            # The one with a level stands for the device; the other's facts move into it.
            item["low"] = item["low"] or first["low"]
            item["type"] = item["type"] or first["type"]
            item["days_left"] = _soonest(item["days_left"], first["days_left"])
            if first["low"]:
                item["quality"] = LOW
            merged[merged.index(first)] = item
            by_device[device] = item
            continue
        first["low"] = first["low"] or item["low"]
        first["type"] = first["type"] or item["type"]
        first["days_left"] = _soonest(first["days_left"], item["days_left"])
        if first["low"]:
            first["quality"] = LOW
    return merged


def _soonest(first: int | None, second: int | None) -> int | None:
    found = [d for d in (first, second) if d is not None]
    return min(found) if found else None


def _order(item: dict[str, Any]) -> tuple[Any, ...]:
    # Low ones first, then the soonest empty, then the lowest level; what has no forecast sorts by level.
    return (
        not item["low"],
        item["days_left"] is None,
        item["days_left"] if item["days_left"] is not None else 0,
        item["percent"] if item["percent"] is not None else 101,
        item["name"],
    )


def shopping_list(items: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[str]]:
    """What to buy for these batteries: [{type, count, names}] by cell, and the names whose type is not known.

    A type like ``2× AA`` counts two cells for that device; a rechargeable battery is left out.
    """
    wanted: dict[str, dict[str, Any]] = {}
    unknown: list[str] = []
    for item in items:
        parsed = parse_type(item["type"])
        if parsed is None:
            unknown.append(item["name"])
            continue
        cell, count = parsed
        if " ".join(cell.split()).casefold() in _NO_PURCHASE:
            continue
        # "CR2032", "cr2032" and "CR 2032" are the same cell: the first spelling names it.
        key = re.sub(r"[\s\-]+", "", cell).casefold()
        entry = wanted.setdefault(key, {"type": cell, "count": 0, "names": []})
        entry["count"] += count
        entry["names"].append(item["name"])
    return sorted(wanted.values(), key=lambda e: (-e["count"], e["type"]))[:SHOP_MAX], unknown


def battery_overview(
    snapshot: dict[str, Any],
    types: dict[str, str],
    forecast: dict[str, Any] | None,
    forecast_at: datetime | None,
    now: datetime | None = None,
) -> dict[str, Any]:
    """The numbers of the card: the weakest, the round of the next days, the shopping list and the first change."""
    now = now or datetime.now(UTC)
    # The days of the person, not of UTC: in other zones a day would start at 01:00 or the day before.
    today = dt_util.as_local(now).date()
    elapsed = (today - dt_util.as_local(forecast_at).date()).days if forecast_at else 0
    items = battery_items(snapshot, types, forecast, elapsed)
    items.sort(key=_order)
    due = [
        i
        for i in items
        if i["low"] or (i["days_left"] is not None and i["days_left"] <= ROUND_DAYS)
    ]
    shopping, unknown = shopping_list(due)
    soonest = [i["days_left"] for i in items if i["days_left"] is not None]
    # ``days_left`` is already shortened by the days since the forecast, so it counts from today.
    base: date = today
    first = dt_util.start_of_local_day(base + timedelta(days=min(soonest))) if soonest else None
    levels = [i["percent"] for i in items if i["percent"] is not None]
    return {
        "lowest": min(levels) if levels else None,
        "weakest": items[:WEAKEST_MAX],
        "round": due[:ROUND_MAX],
        "round_days": ROUND_DAYS,
        "shopping": shopping,
        "unknown_type": unknown,
        "total": len(items),
        "low": sum(1 for i in items if i["low"]),
        "first_change": first,
        "forecast_at": forecast_at.isoformat() if forecast_at else None,
    }
