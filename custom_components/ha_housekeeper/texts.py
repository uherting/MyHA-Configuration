"""The language of what Housekeeper writes on its own: notifications and logbook entries.

A new language is one more entry in each table that is picked with `pick`; English is the fallback.
"""

from __future__ import annotations

from homeassistant.core import HomeAssistant


def language_of(hass: HomeAssistant) -> str:
    """The language Home Assistant speaks, without the region: de_AT and de-AT become de."""
    return str(hass.config.language).lower().replace("_", "-").split("-")[0]


def pick[T](hass: HomeAssistant, table: dict[str, T]) -> T:
    """The entry of the language of Home Assistant, else the English one."""
    return table.get(language_of(hass), table["en"])
