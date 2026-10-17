"""The load of the system over the last days: disk, memory, CPU and swap in percent.

One sample every five minutes (taken by the heartbeat), kept for seven days in the store, so the
tiles of the storage page can draw a line. Nothing here reads more than what the page shows.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import LOAD_STORAGE_KEY, STORAGE_VERSION

SAVE_DELAY = 30
KEEP_SECONDS = 7 * 24 * 3600
SAMPLE_SECONDS = 300
MAX_POINTS = 100  # what the panel gets: the samples grouped to at most this many
FIELDS = ("disk", "ram", "cpu", "swap")


def _percent(value: Any) -> float | None:
    if isinstance(value, bool) or not isinstance(value, int | float):
        return None
    return round(float(value), 1) if 0 <= value <= 100 else None


class LoadStore:
    """Samples ``[epoch seconds, disk, ram, cpu, swap]`` (a part that is unknown is ``None``)."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, LOAD_STORAGE_KEY)
        self.samples: list[list[float | None]] = []

    async def async_load(self) -> None:
        """Load the store; anything of an unknown shape is dropped."""
        data = await self._store.async_load()
        rows = data.get("samples") if isinstance(data, dict) else None
        if not isinstance(rows, list):
            return
        for row in rows:
            if (
                isinstance(row, list)
                and len(row) == 5
                and isinstance(row[0], int | float)
                and not isinstance(row[0], bool)
            ):
                self.samples.append([float(row[0]), *(_percent(v) for v in row[1:])])
        self.samples.sort(key=lambda row: row[0])

    def record(self, now: float, values: dict[str, Any]) -> bool:
        """Add one sample; one that comes sooner than a sample's width after the last is ignored."""
        if self.samples and now - self.samples[-1][0] < SAMPLE_SECONDS * 0.8:
            return False
        row = [now, *(_percent(values.get(name)) for name in FIELDS)]
        if all(v is None for v in row[1:]):
            return False
        self.samples.append(row)
        cut = now - KEEP_SECONDS
        while self.samples and self.samples[0][0] < cut:
            self.samples.pop(0)
        self._store.async_delay_save(lambda: {"samples": self.samples}, SAVE_DELAY)
        return True

    def series(self) -> dict[str, Any]:
        """The samples as at most ``MAX_POINTS`` points: the mean of each group, and the CPU peak.

        ``points`` rows are ``[epoch seconds, disk, ram, cpu, swap, cpu peak]``.
        """
        rows = self.samples
        if not rows:
            return {"points": [], "span": 0}
        group = max(1, -(-len(rows) // MAX_POINTS))
        points: list[list[float | None]] = []
        for start in range(0, len(rows), group):
            chunk = rows[start : start + group]
            means: list[float | None] = []
            for column in range(1, 5):
                known = [r[column] for r in chunk if r[column] is not None]
                means.append(round(sum(known) / len(known), 1) if known else None)
            cpus = [r[3] for r in chunk if r[3] is not None]
            points.append([chunk[-1][0], *means, max(cpus) if cpus else None])
        return {"points": points, "span": round(rows[-1][0] - rows[0][0])}
