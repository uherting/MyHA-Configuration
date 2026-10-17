"""The protection mode: a server-side limit on what Housekeeper may change.

The WebSocket commands that confirm, start or undo a plan check the mode themselves, so hiding a
button in the panel is not what keeps the limit. A new install starts in
``read_only`` and changes are released on purpose; an install that already scanned before the
mode existed keeps ``full``, which is how it always worked. Making a plan (a dry run) and every view are allowed in any mode.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import PROTECTION_STORAGE_KEY, STORAGE_KEY, STORAGE_VERSION

# From the strictest: nothing may change, only disabling, anything with a backup, anything at all.
MODES = ("read_only", "quarantine", "confirmed", "full")
DEFAULT_MODE = "read_only"
LEGACY_MODE = "full"
QUARANTINE_KINDS = frozenset({"disable_entity", "disable_device"})
IRREVERSIBLE_KINDS = frozenset({"purge_statistics", "trim_history", "delete_backup"})
# Rewrites rows of the recorder database: only in the mode that allows anything.
RECORDER_WRITE_KINDS = frozenset({"repair_counter", "repair_range"})


def allows(mode: str, action: dict[str, Any]) -> bool:
    """Whether ``mode`` lets this plan action run."""
    rank = MODES.index(mode)
    if action["kind"] in QUARANTINE_KINDS:
        return rank >= 1
    if action["kind"] in IRREVERSIBLE_KINDS | RECORDER_WRITE_KINDS or action.get("recorder"):
        return rank >= 3
    return rank >= 2


def allows_undo(mode: str, actions: list[dict[str, Any]]) -> bool:
    """Undo puts things back, so it is allowed wherever the action itself could run, or the mode
    lets at least quarantine steps through and the steps are only that."""
    rank = MODES.index(mode)
    if rank == 0:
        return False
    return rank >= 2 or all(a["kind"] in QUARANTINE_KINDS for a in actions)


class ProtectionStore:
    """The chosen mode."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, PROTECTION_STORAGE_KEY)
        self._hass = hass
        self.mode = DEFAULT_MODE

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if isinstance(data, dict) and data.get("mode") in MODES:
            self.mode = data["mode"]
            return
        # No mode chosen yet. An install that already has scan data predates the mode and keeps
        # working as before; anything else starts read-only. Saved now so a restart cannot flip it.
        seen = await Store(self._hass, STORAGE_VERSION, STORAGE_KEY).async_load()
        self.mode = LEGACY_MODE if seen is not None else DEFAULT_MODE
        self._store.async_delay_save(lambda: {"mode": self.mode}, 0)

    def set_mode(self, mode: str) -> None:
        if mode not in MODES:
            raise ValueError(mode)
        self.mode = mode
        self._store.async_delay_save(lambda: {"mode": self.mode}, 2)
