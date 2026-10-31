"""The button that starts a scan, for dashboards."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, NAME
from .runtime import HousekeeperConfigEntry
from .scan_trigger import ScanRefused

# Push only: Home Assistant never polls these entities, so updates need no limit.
PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant, entry: HousekeeperConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Create the scan button."""
    async_add_entities([ScanButton(entry)])


class ScanButton(ButtonEntity):
    """Starts a scan. It stays available while one runs: Housekeeper would see its own button as
    failing, and a press then joins the running scan or says why none can start (issue 35)."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_translation_key = "scan"

    def __init__(self, entry: HousekeeperConfigEntry) -> None:
        self._attr_unique_id = f"{entry.entry_id}_scan"
        self.scanner = entry.runtime_data
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)}, name=NAME, entry_type=DeviceEntryType.SERVICE
        )

    async def async_press(self) -> None:
        try:
            await self.scanner.async_request_scan(False)
        except ScanRefused as err:
            raise ServiceValidationError(
                translation_domain=DOMAIN, translation_key=err.reason
            ) from err
