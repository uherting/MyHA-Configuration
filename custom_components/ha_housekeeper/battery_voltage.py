"""Batteries that report volts instead of a percentage.

A voltage alone does not say how full a battery is: a coin cell, two AA cells and a lithium cell all
read about 3 V when new but run empty at different values. So the type is guessed from the highest
daily mean in the last weeks (the "full" voltage) and shown with the guess, so a wrong guess is
visible. The limit comes from that type; the forecast is the same straight line as for percent
batteries, scaled to the voltage range. Only the long-term statistics are read.
"""

from __future__ import annotations

import re
from typing import Any

from .battery_trend import estimate

UNITS = {"V": 1.0, "mV": 0.001}
# (lowest full voltage, below this full voltage, key, limit in volts)
TYPES: tuple[tuple[float, float, str, float], ...] = (
    (0.9, 1.75, "cell15", 1.1),  # one AA/AAA, alkaline or NiMH
    (2.2, 3.45, "coin3", 2.5),  # CR2032 and similar, or two AA in series; a dying one peaks lower
    (3.45, 4.45, "lithium", 3.4),  # one lithium-ion cell
    (4.45, 5.4, "cells3", 3.6),  # three AA/AAA in series
    (5.4, 7.0, "cells4", 4.8),  # four AA/AAA in series
    (7.0, 10.5, "block9", 6.5),  # 9 V block
    (10.5, 15.0, "lead12", 11.8),  # 12 V lead-acid or LiFePO4 pack
)
# Coin cells you name yourself: (volts, percent) from a new cell at rest down to empty.
# The nominal 3.0 V is the plateau (about 70 %), not "full"; a smaller cell sags earlier under load.
# Approximations from typical discharge curves, not measurements of your sensors.
CURVES: dict[str, tuple[tuple[float, float], ...]] = {
    "CR2450": ((3.20, 100.0), (3.00, 70.0), (2.75, 20.0), (2.20, 0.0)),
    "CR2032": ((3.20, 100.0), (3.00, 70.0), (2.75, 20.0), (2.30, 0.0)),
    "CR2016": ((3.15, 100.0), (2.95, 70.0), (2.80, 20.0), (2.40, 0.0)),
}
JUMP_SHARE = 0.07  # a rise by this share of the full voltage between two days means a new battery
FLAT_SHARE = 0.000375  # share of the usable range per day below which the curve counts as stable
NAME_HINTS = ("batter", "akku", "accu")


def is_voltage_battery(item: dict[str, Any]) -> bool:
    """A working sensor in volts that is a battery: by device class, or a voltage named like one."""
    if (
        not item["object_id"].startswith("sensor.")
        or item.get("status") != "active"
        or item.get("unit") not in UNITS
    ):
        return False
    if item.get("device_class") == "battery":
        return True
    text = f"{item.get('name', '')} {item['object_id']}".lower()
    return item.get("device_class") == "voltage" and any(hint in text for hint in NAME_HINTS)


def curve_for(text: str | None) -> tuple[str, tuple[tuple[float, float], ...]] | None:
    """The curve of a named coin cell ("CR2032", "2× CR2450"), or None."""
    found = re.search(r"CR\s*-?\s*(2450|2032|2016)", text or "", re.IGNORECASE)
    return (f"CR{found.group(1)}", CURVES[f"CR{found.group(1)}"]) if found else None


def percent_at(curve: tuple[tuple[float, float], ...], volts: float) -> float:
    """Percent for a voltage: straight between the points, 100 above the first, 0 below the last."""
    if volts >= curve[0][0]:
        return 100.0
    for (v_hi, p_hi), (v_lo, p_lo) in zip(curve, curve[1:], strict=False):
        if volts >= v_lo:
            return p_lo + (p_hi - p_lo) * (volts - v_lo) / (v_hi - v_lo)
    return 0.0


def volts_at(curve: tuple[tuple[float, float], ...], percent: float) -> float:
    """The voltage at which a cell reaches ``percent`` (the inverse of ``percent_at``)."""
    if percent >= 100.0:
        return curve[0][0]
    for (v_hi, p_hi), (v_lo, p_lo) in zip(curve, curve[1:], strict=False):
        if percent >= p_lo:
            return v_lo + (v_hi - v_lo) * (percent - p_lo) / (p_hi - p_lo)
    return curve[-1][0]


def guess_type(full_volts: float) -> tuple[str, float] | None:
    for low, high, key, limit in TYPES:
        if low <= full_volts < high:
            return key, limit
    return None


def build(
    series: dict[str, list[tuple[float, float]]],
    names: dict[str, str],
    scale: dict[str, float],
    types: dict[str, str] | None = None,
    limit_percent: float = 20.0,
) -> dict[str, Any]:
    """Rows with a guessed type, the limit and the forecast; low ones first, then the soonest.

    A sensor with a coin cell of yours (``types``) gets its percent from the curve of that cell and
    its limit at ``limit_percent``; any other keeps the guess and its fixed limit.
    """
    rows = []
    for entity_id, raw in series.items():
        factor = scale.get(entity_id, 1.0)
        points = [(t, v * factor) for t, v in raw]
        if not points:
            continue
        full = max(v for _, v in points)
        named = curve_for((types or {}).get(entity_id))
        kind = guess_type(full)
        if named is not None:
            kind = ("coin3", volts_at(named[1], limit_percent))
        if kind is None:
            continue
        key, limit = kind
        found = estimate(
            points, limit, jump=JUMP_SHARE * full, flat=FLAT_SHARE * max(full - limit, 0.1)
        )
        if found is None:
            continue
        rows.append(
            {
                "entity_id": entity_id,
                "name": names.get(entity_id, entity_id),
                "type": key,
                "limit": round(limit, 3),
                **found,
            }
        )
        if named is not None:
            rows[-1]["percent"] = round(percent_at(named[1], found["level"]))
            rows[-1]["cell"] = named[0]
    rows.sort(
        key=lambda r: (
            r["state"] != "low",
            r["days_left"] is None,
            r["days_left"] or 0,
            r["name"],
        )
    )
    return {"rows": rows, "unknown": len(series) - len(rows)}
