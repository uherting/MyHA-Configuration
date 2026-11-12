"""When Housekeeper first saw each finding.

Findings of the first scan have no time ("before tracking"): they are not new, whenever somebody
looks. Later ones carry the time of the scan that found them. An entry goes away with its finding,
so one that comes back is new again; a scan that could not read a source drops nothing.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import FIRST_SEEN_STORAGE_KEY, STORAGE_VERSION

SAVE_DELAY = 10
ITEM_LIMIT = 20000


class FirstSeenStore:
    """Remember the scan that first found each finding."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, FIRST_SEEN_STORAGE_KEY)
        self._items: dict[str, str] = {}
        self._tracking = (
            False  # false until a scan has been seen: what it finds is "before tracking"
        )

    async def async_load(self) -> None:
        """Load the times; anything of an unknown shape is dropped."""
        data = await self._store.async_load()
        if isinstance(data, dict) and isinstance(data.get("items"), dict):
            self._items = {
                key: at
                for key, at in data["items"].items()
                if isinstance(key, str) and isinstance(at, str)
            }
            self._tracking = True

    def update(self, keys: set[str], now: datetime, *, complete: bool) -> None:
        """Note the findings of a full scan; with ``complete`` the ones that are gone are forgotten."""
        stamp = now.isoformat() if self._tracking else ""
        changed = not self._tracking
        for key in keys - self._items.keys():
            if len(self._items) >= ITEM_LIMIT:
                break
            self._items[key] = stamp
            changed = True
        if complete:
            for key in self._items.keys() - keys:
                del self._items[key]
                changed = True
        self._tracking = True
        if changed:
            self._store.async_delay_save(lambda: {"items": self._items}, SAVE_DELAY)

    def get(self, key: str) -> str | None:
        """When the finding was first seen; None when that was before tracking or is not known."""
        return self._items.get(key) or None
