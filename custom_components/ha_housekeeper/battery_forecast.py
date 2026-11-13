"""The forecast of working batteries: which of them run low when, from their daily statistics.

One function serves the battery page of the panel and the daily job that feeds the dashboard card, so both
say the same. It reads the long-term statistics only (a query that is light compared with one over the states)
and shares its short-lived result with every caller.
"""

from __future__ import annotations

import asyncio
import time
from datetime import UTC, datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant

from . import battery_trend, battery_voltage
from .battery_care import noted_types
from .battery_kind import excluded
from .queries import cached_query

CACHE_SECONDS = 600
TIMEOUT = 120  # seconds; the recorder query is slow on a large database


async def battery_forecast(
    hass: HomeAssistant,
    scanner: Any,
    snapshot: dict[str, Any],
    *,
    refresh: bool = False,
    timeout: float = TIMEOUT,
) -> dict[str, Any]:
    """Rows with a forecast for percent and voltage batteries, the groups that run low together and the types.

    ``available`` is False without a recorder, ``busy`` True while another recorder query holds the lock and no
    earlier result is at hand; both come with no rows. Errors of the query are raised.
    """
    if not snapshot["meta"].get("recorder_available"):
        return {"available": False, "rows": [], "groups": []}
    limit = snapshot["meta"].get("low_battery_percent") or 20
    names = {
        o["object_id"]: o["name"]
        for o in snapshot["objects"]
        if o["object_type"] == "entity"
        and o.get("device_class") == "battery"
        and not excluded(o)
        and o["object_id"].startswith("sensor.")
        and o.get("status") == "active"
        and o.get("has_statistics")
        and o.get("unit") in (None, "", "%")
    }
    volts = {
        o["object_id"]: o
        for o in snapshot["objects"]
        if o["object_type"] == "entity"
        and o.get("has_statistics")
        and not excluded(o)
        and battery_voltage.is_voltage_battery(o)
    }
    wanted = sorted({*names, *volts})
    now = time.time()
    async with asyncio.timeout(timeout):
        found = await cached_query(
            hass,
            "battery_trend",
            CACHE_SECONDS,
            lambda: battery_trend.read_series(
                hass, wanted, now - battery_trend.WINDOW_DAYS * 86400, now
            ),
            refresh=refresh,
        )
    if found.busy:
        return {"available": True, "busy": True, "rows": [], "groups": []}
    # What was read while another query held the lock may be a day old: it is dated as it is.
    read_at = datetime.now(UTC) - timedelta(seconds=found.age)
    result = battery_trend.build(
        {k: v for k, v in found.raw.items() if k in names}, names, limit, read_at
    )
    types = {**noted_types(snapshot["objects"], wanted), **scanner.batteries.types}
    voltage = battery_voltage.build(
        {k: v for k, v in found.raw.items() if k in volts},
        {k: o["name"] for k, o in volts.items()},
        {k: battery_voltage.UNITS[o["unit"]] for k, o in volts.items()},
        types,
        limit,
    )
    result["replaced"] = scanner.batteries.open_replacements(result["replaced"])
    return {
        "available": True,
        "busy": False,
        **result,
        "voltage": voltage,
        "types": types,
        "custom_types": scanner.batteries.custom_types,
    }
