"""How often an integration entry was in a failed setup state, counted from the scans.

Home Assistant keeps no history of setup errors, retries or failed unloads, and reading logs is not
a stable source. So after each finished scan the state of every entry is looked at, and the moment
an entry enters one of the failing states is noted as an episode (the same state seen again at the
next scan is the same episode). The result is as fine as the scan interval: a failure that came
and went between two scans is not seen. Only entry ids, states and times are kept, for 60 days.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import ENTRY_STATES_STORAGE_KEY, STORAGE_VERSION

SAVE_DELAY = 30
KEEP_DAYS = 60
EPISODES_MAX = 50
FAILING = frozenset({"setup_error", "setup_retry", "failed_unload", "migration_error"})


class EntryStateHistory:
    """Episodes per config entry."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, ENTRY_STATES_STORAGE_KEY)
        self.items: dict[str, dict[str, Any]] = {}

    async def async_load(self) -> None:
        data = await self._store.async_load()
        items = data.get("items") if isinstance(data, dict) else None
        for key, item in items.items() if isinstance(items, dict) else ():
            if (
                isinstance(key, str)
                and isinstance(item, dict)
                and isinstance(item.get("episodes"), list)
            ):
                self.items[key] = {
                    "episodes": [
                        e for e in item["episodes"] if isinstance(e, list) and len(e) == 2
                    ][-EPISODES_MAX:],
                    "state": item.get("state") if item.get("state") in FAILING else None,
                }

    def record(self, states: dict[str, str], now: datetime) -> None:
        """Note the current state of every entry (``entry_id`` -> state value)."""
        horizon = (now - timedelta(days=KEEP_DAYS)).isoformat()
        for entry_id, state in states.items():
            item = self.items.setdefault(entry_id, {"episodes": [], "state": None})
            failing = state if state in FAILING else None
            if failing and item["state"] != failing:
                item["episodes"].append([now.isoformat(), failing])
                del item["episodes"][:-EPISODES_MAX]
            item["state"] = failing
            item["episodes"] = [e for e in item["episodes"] if e[0] >= horizon]
        for entry_id in [
            k for k, i in self.items.items() if k not in states or not (i["episodes"] or i["state"])
        ]:
            del self.items[entry_id]
        self._store.async_delay_save(lambda: {"items": self.items}, SAVE_DELAY)

    def summary(self, entry_id: str, now: datetime, days: int = 7) -> dict[str, Any] | None:
        """Episodes of the last ``days`` days, the last one and the failing state now; None if none."""
        item = self.items.get(entry_id)
        if not item:
            return None
        since = (now - timedelta(days=days)).isoformat()
        recent = [e for e in item["episodes"] if e[0] >= since]
        if not recent and not item["state"]:
            return None
        return {
            "count": len(recent),
            "days": days,
            "last": recent[-1][0] if recent else None,
            "state": item["state"],
        }
