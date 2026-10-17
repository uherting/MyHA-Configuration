"""Automation and script runs, counted once and kept as daily numbers.

Home Assistant keeps only a few traces per automation, so the collector reads their short heads
now and then and counts every finished run exactly once. It stores counters per day, the structural
step where a run failed, and nothing else: no variables, payloads, trigger data or error texts.
The extended trace, which carries variables, is never read.
"""

from __future__ import annotations

import logging
from collections.abc import Collection
from datetime import UTC, datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import RUNS_STORAGE_KEY, STORAGE_VERSION

_LOGGER = logging.getLogger(__name__)

SAVE_DELAY = 300
RETENTION_DAYS = 60
SEEN_KEEP = 20  # run ids remembered per automation at least, so a run is counted once
SEEN_CAP = 500  # and at most, however large a trace bucket is configured
DEFAULT_BUCKET = 5  # Home Assistant keeps this many run traces per automation unless configured
MAX_STEPS_PER_DAY = 10
DOMAINS = ("automation", "script")

# Positions in the daily counter list.
RUNS, OK, CONDITION, ERROR, STOPPED, ALREADY, MAXED, DUR_SUM, DUR_MAX, DUR_N = range(10)
FIELDS = 10

_OUTCOME = {
    "finished": OK,
    "failed_conditions": CONDITION,
    "error": ERROR,
    "aborted": STOPPED,
    "cancelled": STOPPED,
    "failed_single": ALREADY,
    "failed_max_runs": MAXED,
}


def run_key(obj: dict[str, Any]) -> str:
    """Key of an automation or script in the run store (automations by their unique id)."""
    if obj["object_type"] == "automation" and obj.get("automation_id"):
        return f"automation.{obj['automation_id']}"
    return obj["object_id"]


def _parse(value: Any) -> datetime | None:
    """Trace times are datetimes in memory and ISO strings once restored from disk."""
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=UTC)
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=UTC)


def aggregate(
    item: dict[str, Any], heads: list[dict[str, Any]], bucket: int, *, baseline: bool = False
) -> int:
    """Count the finished, not yet seen runs of one automation into ``item``; return how many.

    ``heads`` are short trace heads of the runs bucket. A run that is still running is left for
    the next collection. When the bucket is full of runs never seen before, older runs may have
    been evicted unseen, so the day is marked as a lower bound. With ``baseline`` the runs that are
    already there are only remembered, not counted: the first collection is a starting point.
    """
    seen = item.setdefault("seen", [])
    known_before = bool(seen)
    days = item.setdefault("days", {})
    fresh = [
        h
        for h in heads
        if h.get("state") == "stopped" and h.get("run_id") and h["run_id"] not in seen
    ]
    fresh.sort(key=lambda h: str((h.get("timestamp") or {}).get("start")))
    # The ids of a whole bucket must stay known, or its older runs would count again at every collection.
    keep = min(max(SEEN_KEEP, 2 * max(bucket, len(heads))), SEEN_CAP)
    if baseline:
        seen.extend(head["run_id"] for head in fresh)
        del seen[:-keep]
        return 0
    counted = 0
    for head in fresh:
        timestamps = head.get("timestamp") or {}
        start = _parse(timestamps.get("start"))
        if start is None:
            continue
        day = days.setdefault(start.date().isoformat(), {"c": [0] * FIELDS})
        counters = day["c"]
        counters[RUNS] += 1
        outcome = _OUTCOME.get(head.get("script_execution"))
        if outcome is not None:
            counters[outcome] += 1
        if head.get("script_execution") == "finished":
            finish = _parse(timestamps.get("finish"))
            if finish is not None and finish >= start:
                millis = int((finish - start).total_seconds() * 1000)
                counters[DUR_SUM] += millis
                counters[DUR_MAX] = max(counters[DUR_MAX], millis)
                counters[DUR_N] += 1
        step = head.get("last_step")
        if head.get("script_execution") in ("error", "failed_conditions") and isinstance(step, str):
            steps = day.setdefault("s", {})
            if step in steps or len(steps) < MAX_STEPS_PER_DAY:
                steps[step] = steps.get(step, 0) + 1
        seen.append(head["run_id"])
        counted += 1
    if known_before and counted and len(fresh) >= bucket and len(fresh) == len(heads):
        # Every trace in a full bucket was new: runs between two collections may be missing.
        last = days.get(
            (_parse((fresh[-1].get("timestamp") or {}).get("start")) or datetime.now(UTC))
            .date()
            .isoformat()
        )
        if last is not None:
            last["lo"] = 1
    del seen[:-keep]
    return counted


def prune(items: dict[str, dict[str, Any]], now: datetime, present: Collection[str] = ()) -> bool:
    """Drop days beyond the retention and automations without any day left.

    An automation that still has traces (``present``) is kept without a day: its run ids matter.

    Returns whether anything was removed, so the caller knows the store has to be saved.
    """
    cutoff = (now - timedelta(days=RETENTION_DAYS)).date().isoformat()
    changed = False
    for key in list(items):
        days = items[key].get("days", {})
        for day in [d for d in days if d < cutoff]:
            del days[day]
            changed = True
        if not days and key not in present:
            del items[key]
            changed = True
    return changed


class RunStore:
    """Persistent daily run counters per automation or script."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, RUNS_STORAGE_KEY)
        self.items: dict[str, dict[str, Any]] = {}
        self.since: str | None = None

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if not isinstance(data, dict):
            return
        if _parse(data.get("since")):
            self.since = data["since"]
        items = data.get("items")
        if isinstance(items, dict):
            for key, item in items.items():
                clean = _clean_item(item)
                if isinstance(key, str) and clean is not None:
                    self.items[key] = clean

    def _data(self) -> dict[str, Any]:
        return {"since": self.since, "items": self.items}

    def errors_since(self, key: str, day: str) -> int:
        """Runs that ended in an error on ``day`` (an ISO date) or later."""
        days = (self.items.get(key) or {}).get("days") or {}
        return sum(counters["c"][ERROR] for d, counters in days.items() if d >= day)

    async def async_collect(self, now: datetime | None = None) -> int:
        """Read the trace heads of all automations and scripts and count new runs."""
        from homeassistant.components.trace.util import async_list_traces  # noqa: PLC0415

        now = now or datetime.now(UTC)
        grouped: dict[str, list[dict[str, Any]]] = {}
        listed = False
        for domain in DOMAINS:
            try:
                heads = await async_list_traces(self._hass, domain, None)
            except Exception:
                _LOGGER.debug("Trace heads of %s unavailable", domain, exc_info=True)
                continue
            listed = True
            for head in heads:
                if head.get("not_triggered") or not head.get("item_id"):
                    continue
                grouped.setdefault(f"{domain}.{head['item_id']}", []).append(head)
        # The first collection that could read the traces is the starting point: what is there is not counted.
        baseline = self.since is None and listed
        total = 0
        for key, heads in grouped.items():
            total += aggregate(
                self.items.setdefault(key, {}),
                heads,
                _bucket_size(self._hass, key),
                baseline=baseline,
            )
        if baseline:
            self.since = now.isoformat()
        pruned = prune(self.items, now, grouped.keys())
        if total or baseline or pruned:
            self._store.async_delay_save(self._data, SAVE_DELAY)
        return total


def _bucket_size(hass: HomeAssistant, key: str) -> int:
    try:
        return int(hass.data["trace"][key].runs.size_limit)
    except Exception:
        return DEFAULT_BUCKET


def _clean_item(item: Any) -> dict[str, Any] | None:
    """Keep only well-formed days and run ids from a stored automation."""
    if not isinstance(item, dict):
        return None
    days: dict[str, Any] = {}
    stored_days = item.get("days")
    for day, entry in stored_days.items() if isinstance(stored_days, dict) else ():
        counters = entry.get("c") if isinstance(entry, dict) else None
        if (
            _parse(day)
            and isinstance(counters, list)
            and len(counters) == FIELDS
            and all(isinstance(n, int) and n >= 0 for n in counters)
        ):
            clean: dict[str, Any] = {"c": counters}
            steps = entry.get("s")
            if isinstance(steps, dict):
                clean["s"] = {
                    k: v for k, v in steps.items() if isinstance(k, str) and isinstance(v, int)
                }
            if entry.get("lo"):
                clean["lo"] = 1
            days[day] = clean
    stored_seen = item.get("seen")
    seen = [
        r for r in (stored_seen if isinstance(stored_seen, list) else []) if isinstance(r, str)
    ][-SEEN_CAP:]
    return {"days": days, "seen": seen}
