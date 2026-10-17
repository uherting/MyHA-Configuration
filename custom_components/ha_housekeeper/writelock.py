"""One slot for everything that changes Home Assistant: a plan, an undo, a recorder purge, a reload from the maintenance window.

The event loop runs one piece of code at a time, so checking and taking the slot in one step is
enough; nobody waits. Whoever finds it taken gets ``WriteBusy`` at once and tells the person to
try again. ``write_holder`` names who has it, for the status and for the error text.
"""

from __future__ import annotations

from homeassistant.core import HomeAssistant

from .const import DOMAIN

KEY = "write_holder"


class WriteBusy(Exception):
    """The slot is taken; ``holder`` says by what."""

    def __init__(self, holder: str) -> None:
        super().__init__(holder)
        self.holder = holder


def write_holder(hass: HomeAssistant) -> str | None:
    """Who holds the slot right now: ``plan``, ``undo``, ``purge`` or None."""
    return hass.data.get(DOMAIN, {}).get(KEY)


def acquire_write(hass: HomeAssistant, who: str) -> None:
    """Take the slot or raise ``WriteBusy``."""
    store = hass.data.setdefault(DOMAIN, {})
    if store.get(KEY):
        raise WriteBusy(store[KEY])
    store[KEY] = who


def release_write(hass: HomeAssistant, who: str) -> None:
    """Give the slot back; a holder that is not the caller is left alone."""
    store = hass.data.get(DOMAIN, {})
    if store.get(KEY) == who:
        store[KEY] = None
