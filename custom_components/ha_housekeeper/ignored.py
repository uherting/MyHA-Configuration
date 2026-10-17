"""Decisions about findings: hidden, deliberately kept, or put off until later.

Stored by Housekeeper only; Home Assistant objects stay untouched. Each entry says what was decided
(``kind``), why (``reason``), until when (``until``, optional) and by whom. An entry whose time has
passed no longer hides the finding; it stays so the finding can be shown as due again.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import IGNORED_STORAGE_KEY, STORAGE_VERSION

SAVE_DELAY = 10
KINDS = ("ignore", "keep", "snooze")
REASON_LIMIT = 200  # characters
ITEM_LIMIT = 5000


def _clean(value: Any) -> dict[str, Any] | None:
    """One stored entry in its known shape; an older entry was just the time it was hidden."""
    if isinstance(value, str):
        return {"kind": "ignore", "at": value, "reason": "", "until": None, "by": None}
    if not isinstance(value, dict) or value.get("kind") not in KINDS:
        return None
    until = value.get("until")
    by = value.get("by")
    return {
        "kind": value["kind"],
        "at": value["at"] if isinstance(value.get("at"), str) else "",
        "reason": str(value.get("reason") or "")[:REASON_LIMIT],
        "until": until if isinstance(until, str) else None,
        "by": by if isinstance(by, str) else None,
    }


def due(entry: dict[str, Any], now: datetime) -> bool:
    """Whether the time of an entry has passed."""
    if not entry["until"]:
        return False
    try:
        return datetime.fromisoformat(entry["until"]) <= now
    except ValueError:
        return True


class IgnoreStore:
    """Remember which findings are hidden, kept or put off, and why."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, IGNORED_STORAGE_KEY)
        self._items: dict[str, dict[str, Any]] = {}

    async def async_load(self) -> None:
        """Load the decisions; anything of an unknown shape is dropped."""
        data = await self._store.async_load()
        if isinstance(data, dict) and isinstance(data.get("items"), dict):
            cleaned = ((key, _clean(value)) for key, value in data["items"].items())
            self._items = {
                key: entry for key, entry in cleaned if isinstance(key, str) and entry is not None
            }

    def is_ignored(self, key: str, now: datetime | None = None) -> bool:
        """Whether a decision hides this finding right now."""
        entry = self._items.get(key)
        return entry is not None and not due(entry, now or datetime.now(UTC))

    def info(self, key: str, now: datetime | None = None) -> dict[str, Any] | None:
        """The decision for a finding that it is hidden by, or None."""
        return self._items[key] if self.is_ignored(key, now) else None

    def is_due(self, key: str, now: datetime | None = None) -> bool:
        """Whether a decision ran out, so the finding is back and wants a new look."""
        entry = self._items.get(key)
        return entry is not None and due(entry, now or datetime.now(UTC))

    def decide(
        self,
        key: str,
        kind: str,
        now: datetime,
        *,
        reason: str = "",
        until: datetime | None = None,
        by: str | None = None,
    ) -> bool:
        """Record a decision; False when the store is full."""
        if kind not in KINDS or (key not in self._items and len(self._items) >= ITEM_LIMIT):
            return False
        self._items[key] = {
            "kind": kind,
            "at": now.isoformat(),
            "reason": reason.strip()[:REASON_LIMIT],
            "until": until.isoformat() if until else None,
            "by": by,
        }
        self._save()
        return True

    def set_ignored(self, key: str, ignored: bool, now: datetime) -> None:
        """Hide a finding for good or show it again."""
        if ignored:
            self.decide(key, "ignore", now)
        elif self._items.pop(key, None) is not None:
            self._save()

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"items": self._items}, SAVE_DELAY)
