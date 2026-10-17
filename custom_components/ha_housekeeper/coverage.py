"""Which triggers and branches of an automation ever ran, counted from the structure of its traces.

Off by default. When the person switches it on, the collector reads each finished run's trace in
memory (Home Assistant keeps it with its variables), takes only the *paths* the run passed (which
trigger fired, which ``choose``, ``default``, ``then`` or ``else`` branch ran) and the run time, and
throws the rest away. Variables, payloads, trigger data and action data are never kept.
"""

from __future__ import annotations

import logging
import re
from datetime import UTC, datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import COVERAGE_STORAGE_KEY, STORAGE_VERSION
from .runs import _parse

_LOGGER = logging.getLogger(__name__)

SAVE_DELAY = 300
MAX_PER_COLLECTION = 40  # traces read in one go
MAX_PATHS = 100  # distinct paths kept per automation
MAX_ITEMS = 500
SEEN_CAP = 200
MIN_RUNS = 10  # runs before "never reached" is said
MIN_DAYS = 7  # days of observation before "never reached" is said
BRANCH = re.compile(r"(?:^|/)(?:choose/\d+/sequence|default|then|else)(?=/|$)")
THRESHOLDS = {"min_runs": MIN_RUNS, "min_days": MIN_DAYS}


def markers(paths: Any) -> set[str]:
    """The trigger and branch markers among the paths of one trace (everything else is dropped)."""
    found: set[str] = set()
    for path in paths:
        if not isinstance(path, str):
            continue
        if path.startswith("trigger/"):
            found.add("/".join(path.split("/")[:2]))
        for match in BRANCH.finditer(path):
            found.add(path[: match.end()])
    return found


def expected(triggers: Any, actions: Any) -> list[dict[str, str]]:
    """Every trigger and branch the configuration contains, in Home Assistant's path notation."""
    result = [{"id": f"trigger/{i}", "kind": "trigger"} for i in range(len(triggers or []))]

    def walk(steps: Any, prefix: str) -> None:
        if not isinstance(steps, list):
            return
        for index, step in enumerate(steps):
            if not isinstance(step, dict):
                continue
            base = f"{prefix}/{index}"
            options = step.get("choose")
            if isinstance(options, list):
                for number, option in enumerate(options):
                    branch = f"{base}/choose/{number}/sequence"
                    result.append({"id": branch, "kind": "choose"})
                    walk(
                        (option or {}).get("sequence") if isinstance(option, dict) else None, branch
                    )
                if "default" in step:
                    result.append({"id": f"{base}/default", "kind": "default"})
                    walk(step["default"], f"{base}/default")
            if "if" in step:
                result.append({"id": f"{base}/then", "kind": "then"})
                walk(step.get("then"), f"{base}/then")
                if "else" in step:
                    result.append({"id": f"{base}/else", "kind": "else"})
                    walk(step.get("else"), f"{base}/else")

    walk(actions, "action")
    return result


def trigger_label(trigger: Any) -> str:
    """A short name for a trigger in the configuration, for the panel."""
    if not isinstance(trigger, dict):
        return ""
    kind = trigger.get("trigger") or trigger.get("platform") or ""
    target = trigger.get("entity_id") or trigger.get("at") or trigger.get("event_type") or ""
    if isinstance(target, list):
        target = ", ".join(str(t) for t in target[:2])
    return f"{kind}: {target}".strip(": ")[:80]


class CoverageStore:
    """Counters of triggers and branches per automation."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, COVERAGE_STORAGE_KEY)
        self.enabled = False
        self.items: dict[str, dict[str, Any]] = {}

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if not isinstance(data, dict):
            return
        self.enabled = data.get("enabled") is True
        items = data.get("items")
        for key, item in items.items() if isinstance(items, dict) else ():
            if (
                isinstance(key, str)
                and isinstance(item, dict)
                and isinstance(item.get("paths"), dict)
            ):
                self.items[key] = {
                    "since": item.get("since") if _parse(item.get("since")) else None,
                    "runs": item["runs"] if isinstance(item.get("runs"), int) else 0,
                    "paths": {
                        k: v
                        for k, v in item["paths"].items()
                        if isinstance(k, str) and isinstance(v, dict)
                    },
                    "seen": [r for r in item.get("seen", []) if isinstance(r, str)][-SEEN_CAP:],
                }

    def _data(self) -> dict[str, Any]:
        return {"enabled": self.enabled, "items": self.items}

    def set_enabled(self, enabled: bool, *, clear: bool = False) -> None:
        self.enabled = enabled
        if clear:
            self.items = {}
        self._store.async_delay_save(self._data, SAVE_DELAY)

    async def async_collect(self, present: set[str] | None = None) -> int:
        """Read the finished runs not seen yet and count their markers; returns how many."""
        if not self.enabled:
            return 0
        from homeassistant.components.trace.util import (  # noqa: PLC0415
            async_get_trace,
            async_list_traces,
        )

        try:
            heads = await async_list_traces(self._hass, "automation", None)
        except Exception:
            _LOGGER.debug("Trace heads unavailable", exc_info=True)
            return 0
        counted = 0
        for head in heads:
            key = f"automation.{head.get('item_id')}"
            run_id = head.get("run_id")
            item = self.items.get(key)
            if (
                head.get("state") != "stopped"
                or head.get("not_triggered")
                or not run_id
                or not head.get("item_id")
                or (item is not None and run_id in item["seen"])
            ):
                continue
            if counted >= MAX_PER_COLLECTION:
                break
            if item is None and len(self.items) >= MAX_ITEMS:
                continue
            try:
                trace = await async_get_trace(self._hass, key, run_id)
            except Exception:
                continue
            item = self.items.setdefault(
                key,
                {"since": datetime.now(UTC).isoformat(), "runs": 0, "paths": {}, "seen": []},
            )
            self._count(item, markers((trace.get("trace") or {}).keys()), head)
            item["seen"].append(run_id)
            del item["seen"][:-SEEN_CAP]
            counted += 1
        if present is not None:
            for key in [k for k in self.items if k not in present]:
                del self.items[key]
        if counted:
            self._store.async_delay_save(self._data, SAVE_DELAY)
        return counted

    @staticmethod
    def _count(item: dict[str, Any], found: set[str], head: dict[str, Any]) -> None:
        item["runs"] += 1
        stamps = head.get("timestamp") or {}
        start, finish = _parse(stamps.get("start")), _parse(stamps.get("finish"))
        millis = int((finish - start).total_seconds() * 1000) if start and finish else None
        paths = item["paths"]
        for marker in found:
            if marker not in paths and len(paths) >= MAX_PATHS:
                continue
            entry = paths.setdefault(marker, {"n": 0, "ms": 0, "max": 0, "timed": 0})
            entry["n"] += 1
            if millis is not None and millis >= 0:
                entry["ms"] += millis
                entry["max"] = max(entry["max"], millis)
                entry["timed"] += 1

    def view(
        self, key: str, triggers: Any, actions: Any, now: datetime | None = None
    ) -> dict[str, Any]:
        """What the panel shows for one automation: counts per trigger and branch, and never reached."""
        item = self.items.get(key)
        labels = [trigger_label(t) for t in triggers or []]
        rows = []
        for entry in expected(triggers, actions):
            seen = (item or {}).get("paths", {}).get(entry["id"]) or {}
            rows.append(
                {
                    **entry,
                    "label": labels[int(entry["id"].split("/")[1])]
                    if entry["kind"] == "trigger"
                    else "",
                    "count": seen.get("n", 0),
                    "mean_ms": round(seen["ms"] / seen["timed"]) if seen.get("timed") else None,
                    "max_ms": seen.get("max") or None,
                }
            )
        since = _parse((item or {}).get("since"))
        days = ((now or datetime.now(UTC)) - since).days if since else 0
        runs = (item or {}).get("runs", 0)
        ready = runs >= MIN_RUNS and days >= MIN_DAYS
        return {
            "enabled": self.enabled,
            "runs": runs,
            "since": (item or {}).get("since"),
            "ready": ready,
            "rows": rows,
            "never": [r["id"] for r in rows if ready and not r["count"]],
            "thresholds": THRESHOLDS,
        }
