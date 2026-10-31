"""WebSocket commands that read the recorder database: load, health, statistics, counters."""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from . import counter_repair, entity_space
from .const import DOMAIN
from .db_health import database_first, db_health, recorder_retention, start_check
from .entity_recorder import entity_recorder
from .inventory import InventoryScanner
from .maintenance import recorder_costs
from .meter import recorder_ready
from .queries import cached_query
from .reliability import WINDOWS as RELIABILITY_WINDOWS
from .reliability import reliability
from .statistics_last import statistics_last
from .storms import WINDOWS as STORMS_WINDOWS
from .storms import mark_excluded, storms
from .ws_common import (
    RELIABILITY_TIMEOUT,
    STATISTICS_LAST_IDS,
    _versioned,
    with_scanner,
)


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/recorder_costs", vol.Optional("refresh", default=False): bool}
)
@websocket_api.async_response
@with_scanner
async def websocket_recorder_costs(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Rank the entities that fill the recorder database. Read-only."""
    try:
        snapshot = await scanner.async_get_snapshot()
        result = await recorder_costs(hass, snapshot, refresh=msg["refresh"], store=scanner.replies)
    except Exception as err:
        connection.send_error(msg["id"], "recorder_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/reliability",
        vol.Optional("window_days", default=7): vol.In(RELIABILITY_WINDOWS),
        vol.Optional("refresh", default=False): bool,
        vol.Optional("compare", default=False): bool,
        vol.Optional("cached_only", default=False): bool,
    }
)
@websocket_api.async_response
@with_scanner
async def websocket_reliability(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Availability and shared outages per config entry. Read-only; kept for five minutes."""
    try:
        snapshot = await scanner.async_get_snapshot()
        async with asyncio.timeout(RELIABILITY_TIMEOUT):
            result = await reliability(
                hass,
                snapshot,
                window_days=msg["window_days"],
                refresh=msg["refresh"],
                compare=msg["compare"],
                store=scanner.replies,
                cached_only=msg["cached_only"],
            )
    except Exception as err:
        connection.send_error(msg["id"], "reliability_failed", f"{type(err).__name__}: {err}")
        return
    now = datetime.now(UTC)
    for row in result.get("entries", []):
        row["setup"] = scanner.entry_states.summary(row["entry_id"], now)
    result["keep_days"] = keep_days(hass)
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/db_health",
        vol.Optional("refresh", default=False): bool,
        vol.Optional("check", default=False): bool,
    }
)
@websocket_api.async_response
@with_scanner
async def websocket_db_health(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Database size, statistics and recorder gaps. Read-only; kept for ten minutes."""
    if msg["check"]:
        start_check(hass, scanner.events)  # runs on in the background; the reply shows it
    try:
        snapshot = await scanner.async_get_snapshot()
        async with asyncio.timeout(RELIABILITY_TIMEOUT):
            result = await db_health(
                hass, snapshot, scanner.events, refresh=msg["refresh"], store=scanner.replies
            )
    except Exception as err:
        connection.send_error(msg["id"], "db_health_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/statistics_last",
        vol.Optional("ids"): vol.All([str], vol.Length(max=STATISTICS_LAST_IDS)),
        vol.Optional("refresh", default=False): bool,
    }
)
@websocket_api.async_response
@with_scanner
async def websocket_statistics_last(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """When statistics last received a value (the orphaned ones by default). Read-only; kept for ten minutes."""
    try:
        snapshot = await scanner.async_get_snapshot()
        async with asyncio.timeout(RELIABILITY_TIMEOUT):
            result = await statistics_last(hass, snapshot, msg.get("ids"), refresh=msg["refresh"])
    except Exception as err:
        connection.send_error(msg["id"], "statistics_last_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/database_first"})
@websocket_api.async_response
async def websocket_database_first(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """The start of the oldest data in the recorder. Read-only; kept for an hour."""
    try:
        async with asyncio.timeout(RELIABILITY_TIMEOUT):
            result = await database_first(hass)
    except Exception as err:
        connection.send_error(msg["id"], "database_first_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/entity_recorder",
        vol.Required("entity_id"): vol.All(str, vol.Length(max=255)),
    }
)
@websocket_api.async_response
async def websocket_entity_recorder(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Rows and time span of one entity in the recorder tables. Read-only; kept for two minutes."""
    try:
        async with asyncio.timeout(RELIABILITY_TIMEOUT):
            result = await entity_recorder(hass, msg["entity_id"])
    except Exception as err:
        connection.send_error(msg["id"], "entity_recorder_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/entity_space",
        vol.Optional("start", default=False): bool,
        vol.Optional("stop", default=False): bool,
    }
)
@websocket_api.async_response
@with_scanner
async def websocket_entity_space(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """The space per entity in states and attributes, measured on request in the background. Read-only."""
    try:
        if msg["stop"]:
            entity_space.stop(hass)
        elif msg["start"]:
            await entity_space.start(hass, scanner.replies)
        result = entity_space.status(hass, scanner.replies)
    except Exception as err:
        connection.send_error(msg["id"], "entity_space_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/entity_attributes",
        vol.Required("entity_id"): vol.All(str, vol.Length(max=255)),
    }
)
@websocket_api.async_response
async def websocket_entity_attributes(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """The attributes of one entity by the space they take. Read-only; kept for five minutes."""
    try:
        async with asyncio.timeout(RELIABILITY_TIMEOUT):
            result = await entity_space.entity_attributes(hass, msg["entity_id"])
    except Exception as err:
        connection.send_error(msg["id"], "entity_attributes_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/range_series",
        vol.Required("statistic_id"): str,
        vol.Required("from"): vol.Coerce(float),
        vol.Required("to"): vol.Coerce(float),
    }
)
@websocket_api.async_response
async def websocket_range_series(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """The readings of one counter or measurement in a window, for picking a range. Read-only."""
    start, end = msg["from"], msg["to"]
    if not recorder_ready(hass):
        connection.send_result(msg["id"], _versioned({"error": "no_recorder", "points": []}))
        return
    if not start < end <= start + counter_repair.SERIES_MAX_DAYS * 86400:
        connection.send_error(msg["id"], "invalid_format", "invalid window")
        return
    try:
        async with asyncio.timeout(RELIABILITY_TIMEOUT):
            found = await counter_repair.series(hass, msg["statistic_id"], start, end)
    except Exception as err:
        connection.send_error(msg["id"], "range_series_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], _versioned(found))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/counter_scan",
        vol.Optional("statistic_id"): str,
        vol.Optional("days", default=counter_repair.SCAN_DAYS): vol.All(
            int, vol.Range(min=1, max=3650)
        ),
        vol.Optional("refresh", default=False): bool,
    }
)
@websocket_api.async_response
@with_scanner
async def websocket_counter_scan(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Counters whose readings broke the order and came back (a sensor glitch). Read-only."""
    if not recorder_ready(hass) or not counter_repair.schema_ok():
        connection.send_result(
            msg["id"], _versioned({"available": False, "busy": False, "items": [], "checked": 0})
        )
        return
    wanted = [msg["statistic_id"]] if msg.get("statistic_id") else None
    days = msg["days"]
    name = f"counter_scan:{wanted[0] if wanted else '*'}:{days}"
    try:
        async with asyncio.timeout(RELIABILITY_TIMEOUT):
            found = await cached_query(
                hass,
                name,
                counter_repair.CACHE_SECONDS,
                lambda: counter_repair.scan_blocking(hass, wanted, days, counter_repair.MAX_SPAN),
                refresh=msg["refresh"],
            )
    except Exception as err:
        connection.send_error(msg["id"], "counter_scan_failed", f"{type(err).__name__}: {err}")
        return
    if found.busy:
        result: dict[str, Any] = {"available": True, "busy": True, "items": [], "checked": 0}
    else:
        items = []
        for item in found.raw["items"]:
            state = hass.states.get(item["statistic_id"])
            items.append({**item, "name": (state.name if state else None) or item["statistic_id"]})
        result = {
            "available": True,
            "busy": False,
            "items": items,
            "checked": found.raw["checked"],
            "cached": found.cached,
        }
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/storms",
        vol.Optional("window_days", default=1): vol.In(STORMS_WINDOWS),
        vol.Optional("refresh", default=False): bool,
    }
)
@websocket_api.async_response
@with_scanner
async def websocket_storms(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Recorder load per entity, integration and event type. Read-only; kept for ten minutes."""
    try:
        snapshot = await scanner.async_get_snapshot()
        async with asyncio.timeout(RELIABILITY_TIMEOUT):
            result = await storms(
                hass,
                snapshot,
                window_days=msg["window_days"],
                refresh=msg["refresh"],
                store=scanner.replies,
            )
    except Exception as err:
        connection.send_error(msg["id"], "storms_failed", f"{type(err).__name__}: {err}")
        return
    reply = mark_excluded(hass, dict(result))
    reply["keep_days"] = keep_days(hass)
    connection.send_result(msg["id"], _versioned(reply))


def keep_days(hass: HomeAssistant) -> int | None:
    """How many days the recorder keeps states; None without a recorder or with its purge off."""
    try:
        retention = recorder_retention(hass)
    except Exception:  # no recorder instance: the window stands as asked
        return None
    return retention["keep_days"] if retention["auto_purge"] is not False else None


def auto_purge(hass: HomeAssistant) -> bool | None:
    """Whether the recorder purges old data by itself; None when that is unknown."""
    try:
        return recorder_retention(hass)["auto_purge"]
    except Exception:  # no recorder instance
        return None


def async_register(hass: HomeAssistant) -> None:
    """Register the commands of this part."""
    websocket_api.async_register_command(hass, websocket_recorder_costs)
    websocket_api.async_register_command(hass, websocket_reliability)
    websocket_api.async_register_command(hass, websocket_storms)
    websocket_api.async_register_command(hass, websocket_db_health)
    websocket_api.async_register_command(hass, websocket_statistics_last)
    websocket_api.async_register_command(hass, websocket_database_first)
    websocket_api.async_register_command(hass, websocket_entity_recorder)
    websocket_api.async_register_command(hass, websocket_entity_space)
    websocket_api.async_register_command(hass, websocket_entity_attributes)
    websocket_api.async_register_command(hass, websocket_counter_scan)
    websocket_api.async_register_command(hass, websocket_range_series)
