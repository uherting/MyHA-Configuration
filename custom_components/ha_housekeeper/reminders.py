"""Maintenance reminders you write yourself: a filter, a descaling, a battery change.

Housekeeper keeps the name, the interval, the day it is due and the days it was done (newest
first, the last few), and says when the next one is due. It changes nothing in Home Assistant and keeps this apart from the findings.
"""

from __future__ import annotations

import secrets
from datetime import date, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import REMINDERS_STORAGE_KEY, STORAGE_VERSION

SAVE_DELAY = 5
MAX_ITEMS = 100
NAME_MAX = 80
NOTE_MAX = 200
INTERVAL_MAX = 3650
SOON_DAYS = 14
HISTORY_MAX = 20


class ReminderError(Exception):
    """The input was not accepted; the message names the field."""


def _day(value: Any) -> date | None:
    try:
        return date.fromisoformat(value) if isinstance(value, str) else None
    except ValueError:
        return None


class ReminderStore:
    """The list of reminders."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, REMINDERS_STORAGE_KEY)
        self.items: list[dict[str, Any]] = []

    async def async_load(self) -> None:
        data = await self._store.async_load()
        items = data.get("items") if isinstance(data, dict) else None
        for item in items if isinstance(items, list) else ():
            if not (
                isinstance(item, dict)
                and isinstance(item.get("id"), str)
                and isinstance(item.get("name"), str)
                and isinstance(item.get("interval_days"), int)
            ):
                continue
            interval = min(max(item["interval_days"], 1), INTERVAL_MAX)
            history = sorted(
                {
                    d
                    for d in (item["history"] if isinstance(item.get("history"), list) else [])
                    if _day(d)
                }
                | ({item["last_done"]} if _day(item.get("last_done")) else set()),
                reverse=True,
            )[:HISTORY_MAX]
            due = item.get("due") if _day(item.get("due")) else None
            if due is None and history:  # stored before "due" existed
                due = (date.fromisoformat(history[0]) + timedelta(days=interval)).isoformat()
            if due is None:
                continue
            self.items.append(
                {
                    "id": item["id"],
                    "name": item["name"][:NAME_MAX],
                    "interval_days": interval,
                    "due": due,
                    "history": history,
                    "note": str(item.get("note") or "")[:NOTE_MAX],
                }
            )
        del self.items[MAX_ITEMS:]

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"items": self.items}, SAVE_DELAY)

    def upsert(
        self,
        item_id: str | None,
        name: str,
        interval_days: int,
        due: str,
        note: str,
    ) -> str:
        name = name.strip()
        if not name or len(name) > NAME_MAX:
            raise ReminderError("name")
        if not 1 <= interval_days <= INTERVAL_MAX:
            raise ReminderError("interval_days")
        if _day(due) is None:
            raise ReminderError("due")
        if len(note) > NOTE_MAX:
            raise ReminderError("note")
        if item_id is None:
            if len(self.items) >= MAX_ITEMS:
                raise ReminderError("too_many")
            item_id = secrets.token_hex(6)
            self.items.append({"id": item_id, "history": []})  # type: ignore[typeddict-item]
        item = next((i for i in self.items if i["id"] == item_id), None)
        if item is None:
            raise ReminderError("not_found")
        item.update(name=name, interval_days=interval_days, due=due, note=note)
        self._save()
        return item_id

    @staticmethod
    def _finish(item: dict[str, Any], day: date) -> None:
        """Enter ``day`` in the history and start the next round from it."""
        history = {*item["history"], day.isoformat()}
        item["history"] = sorted(history, reverse=True)[:HISTORY_MAX]
        item["due"] = (day + timedelta(days=item["interval_days"])).isoformat()

    def done(self, item_id: str, today: date) -> None:
        item = next((i for i in self.items if i["id"] == item_id), None)
        if item is None:
            raise ReminderError("not_found")
        self._finish(item, today)
        self._save()

    def done_matching(self, names: list[str], day: str, today: date) -> int:
        """Finish every reminder whose name contains one of ``names`` on ``day``; how many changed."""
        done = _day(day)
        wanted = [n.lower() for n in names if n]
        if done is None or done > today or not wanted:
            return 0
        changed = 0
        for item in self.items:
            if any(n in item["name"].lower() for n in wanted):
                self._finish(item, done)
                changed += 1
        if changed:
            self._save()
        return changed

    def delete_history(self, item_id: str, day: str) -> None:
        item = next((i for i in self.items if i["id"] == item_id), None)
        if item is None or day not in item["history"]:
            raise ReminderError("not_found")
        item["history"].remove(day)
        self._save()

    def delete(self, item_id: str) -> None:
        before = len(self.items)
        self.items = [i for i in self.items if i["id"] != item_id]
        if len(self.items) == before:
            raise ReminderError("not_found")
        self._save()

    def view(self, today: date) -> list[dict[str, Any]]:
        """Every reminder with its due day and state (``due``, ``soon`` or ``ok``), soonest first."""
        rows = []
        for item in self.items:
            due = date.fromisoformat(item["due"])
            left = (due - today).days
            rows.append(
                {
                    **item,
                    "last_done": item["history"][0] if item["history"] else None,
                    "days_left": left,
                    "state": "due" if left <= 0 else "soon" if left <= SOON_DAYS else "ok",
                }
            )
        rows.sort(key=lambda r: (r["days_left"], r["name"].casefold()))
        return rows
