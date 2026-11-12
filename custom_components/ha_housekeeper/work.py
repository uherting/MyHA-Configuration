"""Findings someone has started to fix: "In work".

Not a decision: nothing is hidden. A finding goes in when the person begins a way on the Fix page, stays
while it is open and is dropped when it is gone (fixed) or the person gives up. Without progress for
``STALE_DAYS`` it goes back to open and keeps the note when it was started. A scan that could not read a
source drops nothing.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_VERSION, WORK_STORAGE_KEY

SAVE_DELAY = 10
ITEM_LIMIT = 2000
STALE_DAYS = 7


def _aware(value: Any) -> bool:
    """Whether ``value`` is a time with a zone: what the store writes, and the only kind it can compare."""
    try:
        return isinstance(value, str) and datetime.fromisoformat(value).tzinfo is not None
    except ValueError:
        return False


class WorkStore:
    """Remember which findings were started, when, and when they last moved."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, WORK_STORAGE_KEY)
        self._items: dict[str, dict[str, Any]] = {}

    async def async_load(self) -> None:
        """Load the entries; anything of an unknown shape is dropped."""
        data = await self._store.async_load()
        if not isinstance(data, dict) or not isinstance(data.get("items"), dict):
            return
        for key, item in data["items"].items():
            if (
                isinstance(key, str)
                and isinstance(item, dict)
                and _aware(item.get("started_at"))
                and _aware(item.get("progress_at"))
            ):
                self._items[key] = {
                    "started_at": item["started_at"],
                    "progress_at": item["progress_at"],
                    "expired": item.get("expired") is True,
                }

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"items": self._items}, SAVE_DELAY)

    def start(self, key: str, now: datetime) -> bool:
        """Note a step on the way; begins the work, or goes on with it after it had expired."""
        item = self._items.get(key)
        if item is None and len(self._items) >= ITEM_LIMIT:
            return False
        stamp = now.isoformat()
        if item is None or item["expired"]:
            self._items[key] = {"started_at": stamp, "progress_at": stamp, "expired": False}
        else:
            item["progress_at"] = stamp
        self._save()
        return True

    def clear(self, key: str) -> None:
        """The person gives up, or the note about an expired start is no longer needed."""
        if self._items.pop(key, None) is not None:
            self._save()

    def update(self, keys: set[str], now: datetime, *, complete: bool) -> None:
        """After a full scan: drop what is gone (with ``complete``), let what stood still expire."""
        changed = False
        if complete:
            for key in self._items.keys() - keys:
                del self._items[key]
                changed = True
        for item in self._items.values():
            if not item["expired"] and now - datetime.fromisoformat(
                item["progress_at"]
            ) > timedelta(days=STALE_DAYS):
                item["expired"] = True
                changed = True
        if changed:
            self._save()

    def get(self, key: str) -> dict[str, Any] | None:
        return self._items.get(key)
