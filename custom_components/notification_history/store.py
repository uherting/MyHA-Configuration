"""Persistent history, kept in .storage/notification_history."""
from __future__ import annotations

import time
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DOMAIN, STATUS_REPLACED, STATUS_SENT

STORAGE_VERSION = 1
SAVE_DELAY = 10


class HistoryStore:
    """Records sorted oldest first, with an index by id."""

    def __init__(self, hass: HomeAssistant, max_days: int, max_count: int) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, DOMAIN)
        self.max_days = max_days
        self.max_count = max_count
        self.records: list[dict[str, Any]] = []
        self._by_id: dict[str, dict[str, Any]] = {}
        self.backfilled = False

    async def async_load(self) -> None:
        data = await self._store.async_load() or {}
        self.records = sorted(data.get("records", []), key=lambda r: r["ts"])
        self._by_id = {r["id"]: r for r in self.records}
        self.backfilled = bool(data.get("backfilled"))

    def _data(self) -> dict[str, Any]:
        return {"backfilled": self.backfilled, "records": self.records}

    def schedule_save(self) -> None:
        self._store.async_delay_save(self._data, SAVE_DELAY)

    async def async_save(self) -> None:
        await self._store.async_save(self._data())

    async def async_remove(self) -> None:
        await self._store.async_remove()

    def get(self, record_id: str) -> dict[str, Any] | None:
        return self._by_id.get(record_id)

    def add(self, record: dict[str, Any]) -> list[dict[str, Any]]:
        """Add a record; return it plus any record it replaced (same target and tag).

        Already known ids (backfill overlapping live events) are ignored.
        """
        if record["id"] in self._by_id:
            return []
        changed = [record]
        if record.get("tag"):
            for old in self.records:
                if (
                    old["target"] == record["target"]
                    and old.get("tag") == record["tag"]
                    and old["status"] == STATUS_SENT
                    and old["ts"] <= record["ts"]
                ):
                    old["status"] = STATUS_REPLACED
                    changed.append(old)
        self.records.append(record)
        if len(self.records) > 1 and self.records[-2]["ts"] > record["ts"]:
            self.records.sort(key=lambda r: r["ts"])
        self._by_id[record["id"]] = record
        return changed

    def latest(self, target: str | None, tag: str | None, since: float = 0) -> dict[str, Any] | None:
        """Most recent record for a target (any target if None) and tag."""
        for record in reversed(self.records):
            if record["ts"] < since:
                break
            if (target is None or record["target"] == target) and (tag is None or record.get("tag") == tag):
                return record
        return None

    def purge(self, now: float | None = None) -> bool:
        """Drop records older than max_days, then the oldest beyond max_count."""
        cutoff = (now or time.time()) - self.max_days * 86400
        keep = [r for r in self.records if r["ts"] >= cutoff][-self.max_count :] if self.max_count > 0 else []
        if len(keep) == len(self.records):
            return False
        self.records = keep
        self._by_id = {r["id"]: r for r in keep}
        return True

    def clear(self, target: str | None = None) -> None:
        self.records = [r for r in self.records if target is not None and r["target"] != target]
        self._by_id = {r["id"]: r for r in self.records}
