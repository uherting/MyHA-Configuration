"""One number per counted group of repair hints: the hint appears only above it."""

from __future__ import annotations

from homeassistant.components.number import NumberEntity, NumberMode
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, NAME
from .hints import COUNTED, MINIMUM_LIMIT
from .runtime import HousekeeperConfigEntry

# The number only changes what Housekeeper shows and keeps the value itself.
PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant, entry: HousekeeperConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Create the minimum of each counted group."""
    async_add_entities([HintMinimum(entry, key) for key in COUNTED])


class HintMinimum(NumberEntity):
    """How many findings a group may have before its repair hint appears; 0 shows it from one."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_entity_category = EntityCategory.CONFIG
    _attr_mode = NumberMode.BOX
    _attr_native_min_value = 0
    _attr_native_max_value = MINIMUM_LIMIT
    _attr_native_step = 1

    def __init__(self, entry: HousekeeperConfigEntry, key: str) -> None:
        self._key = key
        self._attr_unique_id = f"{entry.entry_id}_hint_min_{key}"
        self._attr_translation_key = f"hint_min_{key}"
        self.scanner = entry.runtime_data
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)}, name=NAME, entry_type=DeviceEntryType.SERVICE
        )

    @property
    def native_value(self) -> float:
        return float(self.scanner.hints.minimum.get(self._key, 0))

    async def async_set_native_value(self, value: float) -> None:
        self.scanner.hints.set_minimum(self._key, int(value))
        self.scanner.sync_hints()
        self.async_write_ha_state()
