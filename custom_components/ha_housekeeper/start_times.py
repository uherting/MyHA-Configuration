"""How long each start of Home Assistant took, and how long each integration needed to set up.

One record per start, taken when the warm-up after "started" is over. The time of each integration
is Home Assistant's own measurement (``async_get_setup_timings``, the figures behind "Integration
startup time" in the repairs menu); integrations with several entries are set up in parallel, so the
figure is the longest of them, and the figures do not add up to the start.
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STARTS_STORAGE_KEY, STORAGE_VERSION

try:
    from homeassistant.setup import async_get_setup_timings
except (
    ImportError
):  # pragma: no cover - older Home Assistant: the start is recorded without per-integration times
    async_get_setup_timings = None  # type: ignore[assignment]

SAVE_DELAY = 10
MAX_STARTS = 200
MAX_ITEMS = 80  # integrations kept per start: the slowest, and every one that did not load


def process_started() -> float | None:
    """When the Home Assistant process started (epoch seconds), read from /proc; None where it cannot be."""
    try:
        with open("/proc/self/stat", encoding="utf-8") as stat:
            # Field 22 is the start in clock ticks after boot; the name in field 2 may hold spaces.
            ticks = int(stat.read().rsplit(")", 1)[1].split()[19])
        with open("/proc/stat", encoding="utf-8") as stat:
            boot = next(int(line.split()[1]) for line in stat if line.startswith("btime"))
        return boot + ticks / os.sysconf("SC_CLK_TCK")
    except (OSError, ValueError, IndexError, StopIteration):
        return None


def integration_rows(hass: HomeAssistant) -> list[dict[str, Any]]:
    """Every integration with its setup time and the state of its entries, slowest first."""
    timings = dict(async_get_setup_timings(hass)) if async_get_setup_timings else {}
    entries: dict[str, list[Any]] = {}
    for entry in hass.config_entries.async_entries():
        entries.setdefault(entry.domain, []).append(entry)
    rows = []
    for domain in sorted(set(timings) | set(entries)):
        mine = entries.get(domain, [])
        # One state per integration: "loaded" only when every entry is; else the first that is not.
        failed = next((e for e in mine if e.state.value != "loaded"), None)
        bad = failed.state.value if failed else None
        row: dict[str, Any] = {"domain": domain, "seconds": round(float(timings.get(domain, 0)), 2)}
        if mine:
            row["state"] = bad or "loaded"
            row["entries"] = len(mine)
            # Why the first entry that did not load did not: the integration's own message.
            reason = getattr(failed, "reason", None)
            if reason:
                row["reason"] = str(reason)[:200]
            if len(mine) == 1 and mine[0].title:
                row["title"] = str(mine[0].title)
        rows.append(row)
    rows.sort(key=lambda r: r["seconds"], reverse=True)
    kept = rows[:MAX_ITEMS]
    kept += [r for r in rows[MAX_ITEMS:] if r.get("state") not in (None, "loaded", "not_loaded")]
    return kept


class StartStore:
    """The starts of the last days, newest last."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STARTS_STORAGE_KEY)
        self.starts: list[dict[str, Any]] = []

    async def async_load(self) -> None:
        """Load the store; a record of an unknown shape is dropped."""
        data = await self._store.async_load()
        rows = data.get("starts") if isinstance(data, dict) else None
        if not isinstance(rows, list):
            return
        self.starts = [
            r
            for r in rows
            if isinstance(r, dict)
            and isinstance(r.get("at"), str)
            and isinstance(r.get("items"), list)
        ][-MAX_STARTS:]

    def record(
        self,
        now: datetime,
        version: str | None,
        boot_seconds: float | None,
        loaded_seconds: float | None,
        boot_from: str,
        items: list[dict[str, Any]],
        retention_days: int,
        down_seconds: int | None = None,
        unclean: bool = False,
    ) -> None:
        """Add the record of this start; starts older than the retention fall out."""
        before = self.starts[-1] if self.starts else None
        self.starts.append(
            {
                "at": now.isoformat(),
                "version": version,
                "boot_s": None if boot_seconds is None else round(boot_seconds, 1),
                "loaded_s": None if loaded_seconds is None else round(loaded_seconds, 1),
                "boot_from": boot_from,  # "process", or "housekeeper" when the process start is unknown
                "update": bool(before and version and before.get("version") not in (None, version)),
                "items": items,
                # How long Home Assistant had been down before, and whether the stop before never announced itself.
                **({"down_s": int(down_seconds)} if down_seconds is not None else {}),
                **({"unclean": True} if unclean else {}),
            }
        )
        cut = (now - timedelta(days=max(1, retention_days))).isoformat()
        self.starts = [s for s in self.starts if s["at"] >= cut][-MAX_STARTS:]
        self._store.async_delay_save(lambda: {"starts": self.starts}, SAVE_DELAY)

    def report(self) -> dict[str, Any]:
        """The starts, newest first."""
        return {"starts": list(reversed(self.starts))}
