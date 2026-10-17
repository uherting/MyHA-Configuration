"""The button that starts a scan, for dashboards."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, NAME, SIGNAL_SCAN_COMPLETE, SIGNAL_SCAN_STARTED
from .scan_trigger import ScanRefused


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Create the scan button."""
    async_add_entities([ScanButton(entry)])


class ScanButton(ButtonEntity):
    """Starts a scan; not available while one runs or while a plan is working."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_translation_key = "scan"
    _attr_icon = "mdi:magnify-scan"

    def __init__(self, entry: ConfigEntry) -> None:
        self._attr_unique_id = f"{entry.entry_id}_scan"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)}, name=NAME, entry_type=DeviceEntryType.SERVICE
        )

    async def async_added_to_hass(self) -> None:
        self._update()
        for signal in (SIGNAL_SCAN_STARTED, SIGNAL_SCAN_COMPLETE):
            self.async_on_remove(async_dispatcher_connect(self.hass, signal, self._handle_update))

    @callback
    def _handle_update(self) -> None:
        self._update()
        self.async_write_ha_state()

    def _update(self) -> None:
        scanner = self.hass.data.get(DOMAIN, {}).get("scanner")
        self._attr_available = (
            scanner is not None and not scanner.status["running"] and not scanner.cleanup.running
        )

    async def async_press(self) -> None:
        scanner = self.hass.data.get(DOMAIN, {}).get("scanner")
        if scanner is None:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="not_loaded")
        try:
            await scanner.async_request_scan(False)
        except ScanRefused as err:
            raise ServiceValidationError(
                translation_domain=DOMAIN, translation_key=err.reason
            ) from err
