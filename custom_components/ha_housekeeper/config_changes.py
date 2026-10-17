"""When the configuration of an automation or script changed, and how its runs looked before and after.

Only a short fingerprint of triggers, conditions and actions is kept (never the content). The
first time a fingerprint is seen it is a starting point, not a change: a change is known only from
the second different fingerprint on, with the time of the scan that saw it. The comparison reads
the daily run counters that ``runs.py`` keeps.
"""

from __future__ import annotations

import hashlib
import json
from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import CHANGES_STORAGE_KEY, STORAGE_VERSION
from .runs import ERROR, RUNS

SAVE_DELAY = 10
BEFORE_DAYS = 7
MIN_RUNS = 3  # fewer runs on a side say too little
FIELDS = ("triggers", "conditions", "actions")


def fingerprint(item: dict[str, Any]) -> str:
    """A short hash of what an automation or script does; changes with its configuration only."""
    text = json.dumps({k: item.get(k) for k in FIELDS}, sort_keys=True, default=str)
    return hashlib.sha1(text.encode(), usedforsecurity=False).hexdigest()[:12]


class ChangeStore:
    """The last fingerprint of each automation and script and when it last changed."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, CHANGES_STORAGE_KEY)
        self.items: dict[str, dict[str, Any]] = {}

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if isinstance(data, dict) and isinstance(data.get("items"), dict):
            for key, value in data["items"].items():
                if isinstance(value, dict) and isinstance(value.get("hash"), str):
                    at = value.get("at")
                    self.items[str(key)] = {
                        "hash": value["hash"],
                        "at": at if isinstance(at, str) else None,
                    }

    def update(self, hashes: dict[str, str], observed_at: datetime) -> None:
        """Take the fingerprints of this scan; forget objects that are gone."""
        changed = False
        for key, value in hashes.items():
            known = self.items.get(key)
            if known is None:
                self.items[key] = {"hash": value, "at": None}
                changed = True
            elif known["hash"] != value:
                self.items[key] = {"hash": value, "at": observed_at.isoformat()}
                changed = True
        for key in set(self.items) - set(hashes):
            del self.items[key]
            changed = True
        if changed:
            self._store.async_delay_save(lambda: {"items": self.items}, SAVE_DELAY)


def before_after(days: dict[str, Any], at: str | None, today: date) -> dict[str, Any] | None:
    """Runs and errors in the week before the change day and from the day after it until today.

    The day of the change itself is left out, because it holds runs of both versions.
    None without a known change, or when a side has too few runs to say anything.
    """
    if not at:
        return None
    try:
        day = datetime.fromisoformat(at).date()
    except ValueError:
        return None

    def total(first: date, last: date) -> dict[str, int]:
        runs = errors = n = 0
        current = first
        while current <= last:
            entry = days.get(current.isoformat())
            if entry:
                runs += entry["c"][RUNS]
                errors += entry["c"][ERROR]
            n += 1
            current += timedelta(days=1)
        return {"runs": runs, "errors": errors, "days": n}

    before = total(day - timedelta(days=BEFORE_DAYS), day - timedelta(days=1))
    after = total(day + timedelta(days=1), today)
    if after["days"] < 1 or before["runs"] < MIN_RUNS or after["runs"] < MIN_RUNS:
        return None
    return {"at": at, "before": before, "after": after}
