"""WebSocket commands for storage and system, and for system access and data flow. Read-only."""

from __future__ import annotations

import asyncio
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .access import access_report
from .const import DOMAIN
from .hacs import hacs_repositories
from .inventory import InventoryScanner
from .open_flows import open_flows
from .sensitive_fields import sensitive_fields
from .system_usage import system_light, system_usage
from .ws_common import _versioned, with_scanner

SYSTEM_TIMEOUT = 90  # seconds; the Supervisor's disk walk and the size of www can take a while
LIGHT_TIMEOUT = 20  # the Supervisor's host info and a short CPU sample
ACCESS_TIMEOUT = 45  # the Supervisor answers for every app


def _used_card_types(scanner: InventoryScanner) -> set[str] | None:
    """The ``custom:`` card types of all dashboards read in the last scan; None without a scan."""
    snapshot = scanner.snapshot
    if snapshot is None:
        return None
    return {
        card_type
        for item in snapshot["objects"]
        if item["object_type"] == "dashboard"
        for card_type in (item.get("health") or {}).get("custom_types", [])
    }


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/system_usage",
        vol.Optional("fresh", default=False): bool,
        vol.Optional("quick", default=False): bool,
    }
)
@websocket_api.async_response
@with_scanner
async def websocket_system_usage(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Disk, memory, CPU and the largest consumers of space. Read-only."""
    try:
        async with asyncio.timeout(SYSTEM_TIMEOUT):
            result = await system_usage(hass, _used_card_types(scanner), msg["fresh"], msg["quick"])
        result["history"] = scanner.load.series()
    except Exception as err:
        connection.send_error(msg["id"], "system_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/system_light"})
@websocket_api.async_response
@with_scanner
async def websocket_system_light(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Disk, memory and CPU for the overview, without the slow folder walk. Read-only."""
    try:
        async with asyncio.timeout(LIGHT_TIMEOUT):
            result = await system_light(hass)
    except Exception as err:
        connection.send_error(msg["id"], "system_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/starts"})
@websocket_api.async_response
@with_scanner
async def websocket_starts(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """How long the last starts of Home Assistant took, and each integration's set-up time. Read-only."""
    connection.send_result(msg["id"], _versioned(scanner.starts.report()))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/access"})
@websocket_api.async_response
@with_scanner
async def websocket_access(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """System access and data flow of the integrations, rights of the apps. Read-only."""
    try:
        async with asyncio.timeout(ACCESS_TIMEOUT):
            result = await access_report(
                hass,
                [
                    {**item, **(scanner.get_details("automation", item["object_id"]) or {})}
                    for item in (scanner.snapshot or {}).get("objects", [])
                    if item["object_type"] == "automation"
                ],
            )
    except Exception as err:
        connection.send_error(msg["id"], "access_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/sensitive_fields"})
@websocket_api.async_response
@with_scanner
async def websocket_sensitive_fields(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Which config entries hold credentials, of what kind and whether set, and the accounts.
    Never a value."""
    connection.send_result(msg["id"], _versioned(await sensitive_fields(hass)))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/open_flows"})
@callback
def websocket_open_flows(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """The discoveries and set-up requests that wait in Home Assistant. Read-only."""
    connection.send_result(msg["id"], _versioned({"flows": open_flows(hass)}))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/hacs_repositories"})
@callback
def websocket_hacs_repositories(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Every installed HACS repository with its versions and whether HACS removed it. Read-only."""
    rows = hacs_repositories(hass)
    connection.send_result(
        msg["id"], _versioned({"available": rows is not None, "repositories": rows or []})
    )


@callback
def async_register(hass: HomeAssistant) -> None:
    """Register the storage, access and credential-overview commands."""
    websocket_api.async_register_command(hass, websocket_system_usage)
    websocket_api.async_register_command(hass, websocket_system_light)
    websocket_api.async_register_command(hass, websocket_starts)
    websocket_api.async_register_command(hass, websocket_access)
    websocket_api.async_register_command(hass, websocket_sensitive_fields)
    websocket_api.async_register_command(hass, websocket_open_flows)
    websocket_api.async_register_command(hass, websocket_hacs_repositories)
