"""How often an integration entry was in a failed setup state, counted from the scans.

Home Assistant keeps no history of setup errors, retries or failed unloads, and reading logs is not
a stable source. So after each finished scan the state of every entry is looked at, and the moment
an entry enters one of the failing states is noted as an episode (the same state seen again at the
next scan is the same episode). The result is as fine as the scan interval: a failure that came
and went between two scans is not seen. Only entry ids, states and times are kept, for 60 days.

Retries are counted too: Home Assistant counts the failed attempts of an entry in ``_tries`` (reset
when the entry loads). The growth of that number between two scans is added to the day's attempts.
The attribute is internal, so a missing or odd value is skipped and nothing is counted.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import ENTRY_STATES_STORAGE_KEY, STORAGE_VERSION

SAVE_DELAY = 30
RECENT_HOURS = 48
RECENT_MAX = 600
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
                if isinstance(item.get("attempts"), dict) and isinstance(item.get("since"), str):
                    self.items[key]["attempts"] = {
                        d: c
                        for d, c in item["attempts"].items()
                        if isinstance(d, str) and isinstance(c, int)
                    }
                    self.items[key]["since"] = item["since"]
                    if isinstance(item.get("tries"), int):
                        self.items[key]["tries"] = item["tries"]
                    self.items[key]["recent"] = [
                        r
                        for r in item.get("recent", [])
                        if isinstance(r, list) and len(r) == 2 and isinstance(r[1], int)
                    ][-RECENT_MAX:]

    def record(
        self, states: dict[str, str], now: datetime, tries: dict[str, int] | None = None
    ) -> None:
        """Note the current state of every entry (``entry_id`` -> state value).

        ``tries`` maps an entry id to Home Assistant's count of failed setup attempts.
        """
        horizon = (now - timedelta(days=KEEP_DAYS)).isoformat()
        day_horizon = horizon[:10]
        for entry_id, state in states.items():
            item = self.items.setdefault(entry_id, {"episodes": [], "state": None})
            n = (tries or {}).get(entry_id)
            if isinstance(n, int) and not isinstance(n, bool) and n >= 0:
                last = item.get("tries")
                item.setdefault("since", now.isoformat())
                # A lower number than before means the entry loaded or Home Assistant restarted.
                grown = n - last if isinstance(last, int) and n >= last else n
                if grown:
                    day = item.setdefault("attempts", {})
                    key = now.date().isoformat()
                    day[key] = day.get(key, 0) + grown
                    item.setdefault("recent", []).append([now.isoformat(), grown])
                item["tries"] = n
            item["attempts"] = {
                d: c for d, c in item.get("attempts", {}).items() if d >= day_horizon
            }
            recent_horizon = (now - timedelta(hours=RECENT_HOURS)).isoformat()
            item["recent"] = [r for r in item.get("recent", []) if r[0] >= recent_horizon][
                -RECENT_MAX:
            ]
            failing = state if state in FAILING else None
            if failing and item["state"] != failing:
                item["episodes"].append([now.isoformat(), failing])
                del item["episodes"][:-EPISODES_MAX]
            item["state"] = failing
            item["episodes"] = [e for e in item["episodes"] if e[0] >= horizon]
        for entry_id in [
            k
            for k, i in self.items.items()
            if k not in states or not (i["episodes"] or i["state"] or i.get("attempts"))
        ]:
            del self.items[entry_id]
        self._store.async_delay_save(lambda: {"items": self.items}, SAVE_DELAY)

    def attempts_since(self, entry_id: str, since: datetime) -> int:
        """Failed setup attempts counted since ``since`` (at most ``RECENT_HOURS`` back)."""
        item = self.items.get(entry_id) or {}
        return sum(n for t, n in item.get("recent", []) if t >= since.isoformat())

    def summary(self, entry_id: str, now: datetime, days: int = 7) -> dict[str, Any] | None:
        """Episodes of the last ``days`` days, the last one and the failing state now; None if none."""
        item = self.items.get(entry_id)
        if not item:
            return None
        since = (now - timedelta(days=days)).isoformat()
        recent = [e for e in item["episodes"] if e[0] >= since]
        attempts = sum(c for d, c in item.get("attempts", {}).items() if d >= since[:10])
        if not recent and not item["state"] and not attempts:
            return None
        return {
            "count": len(recent),
            "days": days,
            "last": recent[-1][0] if recent else None,
            "state": item["state"],
            "attempts": attempts if item.get("since") else None,
            "attempts_since": item.get("since") if attempts else None,
        }
