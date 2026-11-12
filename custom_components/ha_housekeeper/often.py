"""The suggestions for marks that were answered "no thanks": which objects are not asked about again.

Kept on the server, so every browser knows them (it was the browser's own storage before). A "no
thanks" holds for ``QUIET_DAYS``; after that the object may be suggested again.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Final

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import OFTEN_STORAGE_KEY, STORAGE_VERSION

SAVE_DELAY = 10
QUIET_DAYS: Final = 180
ITEM_LIMIT: Final = 5000
TYPES: Final = ("entity", "device")


def _key(value: Any) -> str | None:
    """A key ``entity:<id>`` or ``device:<id>``, or None."""
    if not isinstance(value, str) or len(value) > 255:
        return None
    kind, _, ident = value.partition(":")
    return value if kind in TYPES and ident else None


def _time(value: Any) -> datetime | None:
    try:
        return datetime.fromisoformat(value) if isinstance(value, str) else None
    except ValueError:
        return None


class OftenStore:
    """The objects that were declined, with the time of the answer."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, OFTEN_STORAGE_KEY)
        self._items: dict[str, str] = {}

    async def async_load(self) -> None:
        """Load the answers; anything of an unknown shape is dropped."""
        data = await self._store.async_load()
        items = data.get("items") if isinstance(data, dict) else None
        if isinstance(items, dict):
            self._items = {
                key: at for raw, at in items.items() if (key := _key(raw)) and _time(at) is not None
            }

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"items": self._items}, SAVE_DELAY)

    def skip(self, answers: dict[str, str], now: datetime) -> None:
        """Remember "no thanks" for these keys, each with the time of the answer (not in the future).

        Answers that no longer hold are dropped first, so they do not use up the room for new ones.
        """
        self._items = self.view(now)
        for raw, at in answers.items():
            when = _time(at)
            key = _key(raw)
            if (
                key
                and when is not None
                and when.tzinfo
                and (key in self._items or len(self._items) < ITEM_LIMIT)
            ):
                self._items[key] = min(when, now).isoformat()
        self._save()

    def unskip(self, keys: list[str]) -> None:
        """Ask about these again."""
        for raw in keys:
            self._items.pop(raw, None)
        self._save()

    def view(self, now: datetime) -> dict[str, str]:
        """The answers that still hold."""
        cutoff = now - timedelta(days=QUIET_DAYS)
        return {k: at for k, at in self._items.items() if (_time(at) or cutoff) > cutoff}
