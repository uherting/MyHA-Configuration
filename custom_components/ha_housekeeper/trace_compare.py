"""Compare two runs of one automation by their structure.

Runs are read from Home Assistant's own trace buffer, on request, in memory. Only paths, results and
times are looked at; variables are never read out, and nothing of the comparison is kept.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant

from .coverage import markers
from .runs import _parse

SLOW_FACTOR = 2.0
SLOW_MIN_MS = 1000
CRITERION_WAIT = timedelta(minutes=6)  # a criterion is checked within 5 minutes of a run
LIST_LIMIT = 30
UPDATE_KINDS = ("ha_version", "entry_version")


def _iso(value: Any) -> str | None:
    parsed = _parse(value)
    return parsed.isoformat() if parsed else None


async def list_runs(hass: HomeAssistant, key: str) -> list[dict[str, Any]]:
    """The runs Home Assistant still has of one automation, newest first (short heads only)."""
    from homeassistant.components.trace.util import async_list_traces  # noqa: PLC0415

    heads = await async_list_traces(hass, "automation", key.split(".", 1)[1])
    runs = []
    for head in heads:
        if head.get("not_triggered") or head.get("state") != "stopped":
            continue
        stamps = head.get("timestamp") or {}
        start, finish = _parse(stamps.get("start")), _parse(stamps.get("finish"))
        runs.append(
            {
                "run_id": head["run_id"],
                "start": start.isoformat() if start else None,
                "duration_ms": int((finish - start).total_seconds() * 1000)
                if start and finish
                else None,
                "execution": head.get("script_execution"),
                "last_step": head.get("last_step"),
                "trigger": head.get("trigger"),
            }
        )
    runs.sort(key=lambda r: r["start"] or "", reverse=True)
    return runs[:LIST_LIMIT]


def summarize(extended: dict[str, Any]) -> dict[str, Any]:
    """The structural summary of one extended trace: no variables, no payloads."""
    found = markers((extended.get("trace") or {}).keys())
    stamps = extended.get("timestamp") or {}
    start, finish = _parse(stamps.get("start")), _parse(stamps.get("finish"))
    return {
        "run_id": extended.get("run_id"),
        "start": start.isoformat() if start else None,
        "duration_ms": int((finish - start).total_seconds() * 1000) if start and finish else None,
        "execution": extended.get("script_execution"),
        "last_step": extended.get("last_step"),
        "trigger": extended.get("trigger"),
        "triggers": sorted(m for m in found if m.startswith("trigger/")),
        "branches": sorted(m for m in found if not m.startswith("trigger/")),
        "steps": len(extended.get("trace") or {}),
    }


def differences(older: dict[str, Any], newer: dict[str, Any]) -> list[dict[str, Any]]:
    """What differs between two summaries, in a fixed order."""
    found: list[dict[str, Any]] = []
    if older["triggers"] != newer["triggers"]:
        found.append({"kind": "trigger", "a": older["triggers"], "b": newer["triggers"]})
    only_a = sorted(set(older["branches"]) - set(newer["branches"]))
    only_b = sorted(set(newer["branches"]) - set(older["branches"]))
    if only_a or only_b:
        found.append({"kind": "branch", "only_a": only_a, "only_b": only_b})
    if older["execution"] != newer["execution"]:
        found.append({"kind": "execution", "a": older["execution"], "b": newer["execution"]})
    if older["last_step"] != newer["last_step"]:
        found.append({"kind": "last_step", "a": older["last_step"], "b": newer["last_step"]})
    a, b = older["duration_ms"], newer["duration_ms"]
    if a and b and max(a, b) >= SLOW_MIN_MS and max(a, b) / max(1, min(a, b)) >= SLOW_FACTOR:
        found.append(
            {"kind": "duration", "a": a, "b": b, "factor": round(max(a, b) / min(a, b), 1)}
        )
    return found


def _outcome(recent: list[dict[str, Any]], start: str | None) -> bool | None:
    """Whether a criterion of the automation was reached after the run that began at ``start``."""
    began = _parse(start)
    if began is None:
        return None
    for entry in recent:
        at = _parse(entry.get("at"))
        if at is not None and began <= at <= began + CRITERION_WAIT:
            return bool(entry.get("ok"))
    return None


async def compare(
    hass: HomeAssistant,
    key: str,
    run_a: str,
    run_b: str,
    events: list[dict[str, Any]],
    recent: list[dict[str, Any]],
) -> dict[str, Any] | None:
    """Compare two runs; ``None`` when one of them is gone from the buffer."""
    from homeassistant.components.trace.util import async_get_trace  # noqa: PLC0415

    try:
        first = summarize(await async_get_trace(hass, key, run_a))
        second = summarize(await async_get_trace(hass, key, run_b))
    except Exception:  # noqa: BLE001 - evicted from the buffer meanwhile
        return None
    older, newer = sorted((first, second), key=lambda s: s["start"] or "")
    low, high = _parse(older["start"]), _parse(newer["start"])
    updates = [
        {k: e.get(k) for k in ("kind", "domain", "to", "at")}
        for e in events
        if e.get("kind") in UPDATE_KINDS
        and low is not None
        and high is not None
        and low <= (_parse(e.get("at")) or datetime.min.replace(tzinfo=low.tzinfo)) <= high
    ]
    return {
        "older": older,
        "newer": newer,
        "differences": differences(older, newer),
        "updates_between": updates[:5],
        "criterion": {
            "older": _outcome(recent, older["start"]),
            "newer": _outcome(recent, newer["start"]),
        },
    }
