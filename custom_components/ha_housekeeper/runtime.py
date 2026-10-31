"""The config entry of Housekeeper and the scanner it carries as its runtime data."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .inventory import InventoryScanner

type HousekeeperConfigEntry = ConfigEntry[InventoryScanner]


def loaded_scanner(hass: HomeAssistant) -> InventoryScanner | None:
    """The scanner of the loaded entry, or None while none is loaded (also during set-up and unload)."""
    entries: list[HousekeeperConfigEntry] = hass.config_entries.async_loaded_entries(DOMAIN)
    return entries[0].runtime_data if entries else None
