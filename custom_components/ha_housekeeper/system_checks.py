"""Levels of the system and the integrations for the central log: numbers only, no names.

Both are plain functions on plain data, so the thresholds can be tested without Home Assistant.
The log writes a change down only when the level of a check differs from the last look.
"""

from __future__ import annotations

from typing import Any

DISK_NOTE_PERCENT, DISK_PROBLEM_PERCENT = 80.0, 90.0  # used space of the data disk
RAM_NOTE_PERCENT, RAM_PROBLEM_PERCENT = 85.0, 95.0
HYSTERESIS_PERCENT = (
    2.0  # a level is left only this far below its threshold, so a value at the edge does not flap
)
FAILING_PROBLEM = frozenset({"setup_error", "migration_error", "failed_unload"})
FAILING_NOTE = frozenset({"setup_retry"})


def _level(percent: float | None, note: float, problem: float, last: str | None = None) -> str:
    """The level of a used share; ``last`` is the level written down before, which holds a little longer."""
    if percent is None:
        return "unknown"
    level = "problem" if percent >= problem else "note" if percent >= note else "ok"
    if last == "problem" and level != "problem" and percent >= problem - HYSTERESIS_PERCENT:
        return "problem"
    if last in ("problem", "note") and level == "ok" and percent >= note - HYSTERESIS_PERCENT:
        return "note"
    return level


def system_checks(
    disk: dict[str, Any], memory: dict[str, Any], levels: dict[str, str] | None = None
) -> list[dict[str, Any]]:
    """Free disk space and memory; a part that could not be read is ``unknown``.

    ``levels`` are the levels the log wrote down last ("area/check"); a value that hovers at a threshold
    keeps its level until it is clearly below it.
    """
    ram = (memory or {}).get("ram") or {}
    last = levels or {}
    return [
        {
            "id": "disk",
            "level": _level(
                disk.get("percent"),
                DISK_NOTE_PERCENT,
                DISK_PROBLEM_PERCENT,
                last.get("system/disk"),
            ),
            "values": {
                "used_percent": disk.get("percent"),
                "free_bytes": disk.get("free"),
                "limit_percent": DISK_PROBLEM_PERCENT,
            },
        },
        {
            "id": "memory",
            "level": _level(
                ram.get("percent"), RAM_NOTE_PERCENT, RAM_PROBLEM_PERCENT, last.get("system/memory")
            ),
            "values": {"used_percent": ram.get("percent"), "limit_percent": RAM_PROBLEM_PERCENT},
        },
    ]


def service_checks(states: dict[str, str]) -> list[dict[str, Any]]:
    """The integration entries whose setup failed: errors are a problem, retries a hint."""
    values = list(states.values())
    errors = sum(state in FAILING_PROBLEM for state in values)
    retrying = sum(state in FAILING_NOTE for state in values)
    return [
        {
            "id": "setup",
            "level": "problem" if errors else "note" if retrying else "ok",
            "values": {"errors": errors, "retrying": retrying, "entries": len(values)},
        }
    ]


def goal_checks(evaluated: dict[str, Any]) -> list[dict[str, Any]]:
    """The goals the person set, as checks: met is ``ok``, missed a hint; unknown or off are left out.

    Left out, so a goal whose figure is not known yet does not look like a change when it becomes known.
    """
    return [
        {
            "id": goal["id"],
            "level": "ok" if goal["state"] == "met" else "note",
            "values": {"value": goal["value"], "limit": goal["limit"]},
        }
        for goal in evaluated.get("goals", [])
        if goal["state"] in ("met", "missed") and goal.get("value") is not None
    ]


def scan_check(report: dict[str, Any]) -> list[dict[str, Any]]:
    """Whether the scans run: a failed or overdue scan is a hint, one that needs repair a problem."""
    state = report.get("state")
    if state not in ("ok", "failed", "stale"):
        return []
    level = (
        "ok"
        if state == "ok"
        else "problem"
        if report.get("needs_repair") or state == "stale"
        else "note"
    )
    return [
        {
            "id": "scan",
            "level": level,
            "values": {"failures": report.get("consecutive_failures") or 0},
        }
    ]
