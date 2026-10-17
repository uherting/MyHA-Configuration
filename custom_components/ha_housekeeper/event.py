"""The latest transition of a home function as a Home Assistant event entity."""

from __future__ import annotations

from homeassistant.components.event import EventEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, NAME, SIGNAL_MONITOR_EVENT

EVENT_TYPES = [
    "beeintraechtigt",
    "pruefung_unvollstaendig",
    "pruefung_wieder_moeglich",
    "wieder_unauffaellig",
]


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Create the single event entity for all monitored functions."""
    async_add_entities([MonitorEvent(entry)])


class MonitorEvent(EventEntity):
    """Event data contains only a function ID, name, time and reason code."""

    _attr_has_entity_name = True
    _attr_name = "Hausfunktionen"
    _attr_event_types = EVENT_TYPES
    _attr_should_poll = False

    def __init__(self, entry: ConfigEntry) -> None:
        self._attr_unique_id = f"{entry.entry_id}_monitor_event"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)}, name=NAME, entry_type=DeviceEntryType.SERVICE
        )

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(
            async_dispatcher_connect(self.hass, SIGNAL_MONITOR_EVENT, self._handle_event)
        )

    @callback
    def _handle_event(self, kind: str, payload: dict) -> None:
        self._trigger_event(kind, payload)
        self.async_write_ha_state()
