"""Notification History: keep and show the notifications sent by Home Assistant."""
from __future__ import annotations

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.service import async_register_admin_service
from homeassistant.helpers.typing import ConfigType

from .const import (
    CONF_LOGBOOK,
    CONF_MAX_COUNT,
    CONF_MAX_DAYS,
    CONF_TARGETS,
    DEFAULT_MAX_COUNT,
    DEFAULT_MAX_DAYS,
    DOMAIN,
    SIGNAL_UPDATED,
)
from .frontend import async_register_frontend
from .manager import HistoryManager
from .store import HistoryStore
from . import websocket

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)
SERVICE_CLEAR = "clear"


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """WebSocket commands and the clear service exist once, whatever the entry state.

    Clearing deletes every user's history, so the service is admin only.
    """
    websocket.async_register(hass)

    async def clear(call: ServiceCall) -> None:
        manager: HistoryManager | None = hass.data.get(DOMAIN)
        if manager is None:
            return
        manager.store.clear(call.data.get("target"))
        await manager.store.async_save()
        async_dispatcher_send(hass, SIGNAL_UPDATED, None)

    async_register_admin_service(
        hass, DOMAIN, SERVICE_CLEAR, clear, schema=vol.Schema({vol.Optional("target"): cv.string})
    )
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    options = entry.options
    store = HistoryStore(
        hass,
        int(options.get(CONF_MAX_DAYS, DEFAULT_MAX_DAYS)),
        int(options.get(CONF_MAX_COUNT, DEFAULT_MAX_COUNT)),
    )
    await store.async_load()
    store.purge()
    manager = HistoryManager(hass, store, list(options.get(CONF_TARGETS, [])), bool(options.get(CONF_LOGBOOK)))
    hass.data[DOMAIN] = manager
    await manager.async_start()
    await async_register_frontend(hass)
    entry.async_on_unload(entry.add_update_listener(_async_options_updated))
    return True


async def _async_options_updated(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    manager: HistoryManager | None = hass.data.pop(DOMAIN, None)
    if manager is not None:
        await manager.async_stop()
    return True


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Deleting the integration deletes its history."""
    await HistoryStore(hass, DEFAULT_MAX_DAYS, DEFAULT_MAX_COUNT).async_remove()
