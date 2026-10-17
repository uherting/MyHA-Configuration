"""What the WebSocket commands share: the loaded scanner, the API version mark, time limits."""

from __future__ import annotations

import functools
import inspect
from collections.abc import Callable
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .const import API_SCHEMA, DOMAIN
from .inventory import InventoryScanner

BACKUP_HEALTH_TIMEOUT = 20  # seconds; a cloud backup target can answer slowly
RUNS_TIMEOUT = 20
EXPOSURE_TIMEOUT = 20  # seconds
STATISTICS_LAST_IDS = 50
RELIABILITY_TIMEOUT = 120  # seconds; the recorder query is slow on a large database


def _scanner(hass: HomeAssistant) -> InventoryScanner | None:
    """Return the configured scanner, or None while the entry is not loaded."""
    return hass.data.get(DOMAIN, {}).get("scanner")


def with_scanner(handler: Callable[..., Any]) -> Callable[..., Any]:
    """Hand a command the loaded scanner; while the entry is not loaded, answer ``not_loaded``."""

    def loaded(
        hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
    ) -> InventoryScanner | None:
        scanner = _scanner(hass)
        if scanner is None:
            connection.send_error(msg["id"], "not_loaded", "HA Housekeeper is not loaded")
        return scanner

    if inspect.iscoroutinefunction(handler):

        @functools.wraps(handler)
        async def run_async(
            hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
        ) -> None:
            if (scanner := loaded(hass, connection, msg)) is not None:
                await handler(hass, connection, msg, scanner)

        return run_async

    @functools.wraps(handler)
    def run(
        hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
    ) -> None:
        if (scanner := loaded(hass, connection, msg)) is not None:
            handler(hass, connection, msg, scanner)

    return run


def scanner_plans(hass: HomeAssistant) -> list[dict[str, Any]]:
    """The plans of the journal, or none while the entry is not loaded."""
    scanner = _scanner(hass)
    return scanner.journal.plans if scanner else []


def _versioned(result: dict[str, Any]) -> dict[str, Any]:
    """Mark a reply with the version of the API contract.

    Fields may be added without a new version; renaming or removing one needs ``API_SCHEMA`` to
    be raised. A copy is sent so cached snapshots never carry the marker.
    """
    return {**result, "schema": API_SCHEMA}
