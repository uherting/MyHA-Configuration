"""Persistent first-seen observations for diagnoses."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_VERSION

SAVE_DELAY = 10  # seconds; coalesces writes and is flushed when Home Assistant stops


class ObservationStore:
    """Remember when Housekeeper first observed a classification."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._items: dict[str, dict[str, str]] = {}

    async def async_load(self) -> None:
        """Load observations."""
        data = await self._store.async_load()
        if isinstance(data, dict) and isinstance(data.get("items"), dict):
            self._items = data["items"]

    async def async_update(self, classifications: dict[str, str], observed_at: datetime) -> None:
        """Update classification periods and persist changed data."""
        timestamp = observed_at.isoformat()
        changed = False
        active_ids = set(classifications)

        for object_id, classification in classifications.items():
            previous = self._items.get(object_id)
            if previous is None or previous.get("classification") != classification:
                item = {"classification": classification, "since": timestamp}
                # Without a value now, but with one before: that is what makes "unknown" a problem.
                if (
                    previous is not None
                    and classification in ("unknown", "unavailable")
                    and (previous.get("classification") == "active" or previous.get("had_value"))
                ):
                    item["had_value"] = True
                self._items[object_id] = item
                changed = True

        for object_id in set(self._items) - active_ids:
            del self._items[object_id]
            changed = True

        if changed:
            self._store.async_delay_save(lambda: {"items": self._items}, SAVE_DELAY)

    def had_value(self, object_id: str) -> bool:
        """Whether the object had a value before it lost it; false for one never seen working."""
        item = self._items.get(object_id)
        return bool(item and item.get("had_value"))

    def since(self, object_id: str, classification: str) -> str | None:
        """Return the start of the current continuously observed classification."""
        item = self._items.get(object_id)
        if item and item.get("classification") == classification:
            return item.get("since")
        return None
