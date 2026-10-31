"""One switch per group of repair hints, so each group can be turned off or on."""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, NAME
from .hints import HINT_KEYS
from .runtime import HousekeeperConfigEntry

# The switch only changes what Housekeeper shows and keeps the value itself.
PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant, entry: HousekeeperConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Create the switches of the repair hints."""
    async_add_entities([HintSwitch(entry, key) for key in HINT_KEYS])


class HintSwitch(SwitchEntity):
    """Whether Home Assistant shows the repair hint of one group."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(self, entry: HousekeeperConfigEntry, key: str) -> None:
        self._key = key
        self._attr_unique_id = f"{entry.entry_id}_hint_{key}"
        self._attr_translation_key = f"hint_{key}"
        self.scanner = entry.runtime_data
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)}, name=NAME, entry_type=DeviceEntryType.SERVICE
        )

    @property
    def is_on(self) -> bool:
        return self._key in self.scanner.hints.enabled

    async def async_turn_on(self, **kwargs: Any) -> None:
        self._set(True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        self._set(False)

    def _set(self, on: bool) -> None:
        self.scanner.hints.set(self._key, on)
        self.scanner.sync_hints()
        self.async_write_ha_state()
