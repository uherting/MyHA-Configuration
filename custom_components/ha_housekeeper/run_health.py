"""Judge automation and script runs from the daily numbers and the configuration.

A clean run is not proof that an automation did its job: nothing here says an automation works,
only where the numbers or the configuration give a reason to look. Every finding carries the
numbers it rests on; thresholds are named constants.
"""

from __future__ import annotations

import re
import statistics
from datetime import UTC, date, datetime, timedelta
from typing import Any

from . import conflicts
from .config_changes import before_after
from .const import IGNORE_LABEL
from .payloads import RunsResult
from .runs import (
    ALREADY,
    CONDITION,
    DUR_MAX,
    DUR_N,
    DUR_SUM,
    ERROR,
    FIELDS,
    MAXED,
    OK,
    RUNS,
    STOPPED,
    run_key,
)

WINDOW_DAYS = 7
TREND_DAYS = 30  # the run history of the detail page
BASELINE_DAYS = 28  # the days before the window that give an automation its own normal
MIN_BASELINE_DAYS = 7
FAIL_MIN_ERRORS = 3
FAIL_MIN_RATE = 0.2
FAIL_RED_RATE = 0.5
OVERLAP_MIN = 3
NEVER_OK_MIN_RUNS = 5
IDLE_MIN_RUNS = 20
IDLE_SHARE = 0.9
BURST_FACTOR = 5
BURST_MIN_PER_DAY = 100
LONG_FACTOR = 10
LONG_MIN_MS = 60_000
LONG_WAIT_SECONDS = 300
UPDATE_LOOKBACK_DAYS = 14
UPDATE_MIN_RUNS = 10
UPDATE_MIN_INCREASE = 0.2
UPDATE_MIN_ERRORS = 3
LIMIT = 300  # rows sent to the panel; the total stays exact
# Every limit a finding is judged by, for the panel and for anyone reading the reply.
THRESHOLDS = {
    "window_days": WINDOW_DAYS,
    "baseline_days": BASELINE_DAYS,
    "min_baseline_days": MIN_BASELINE_DAYS,
    "failing_min_errors": FAIL_MIN_ERRORS,
    "failing_min_rate": FAIL_MIN_RATE,
    "failing_red_rate": FAIL_RED_RATE,
    "overlap_min": OVERLAP_MIN,
    "never_ok_min_runs": NEVER_OK_MIN_RUNS,
    "no_effect_min_runs": IDLE_MIN_RUNS,
    "no_effect_share": IDLE_SHARE,
    "burst_factor": BURST_FACTOR,
    "burst_min_per_day": BURST_MIN_PER_DAY,
    "long_run_factor": LONG_FACTOR,
    "long_run_min_ms": LONG_MIN_MS,
    "long_wait_seconds": LONG_WAIT_SECONDS,
    "after_update_lookback_days": UPDATE_LOOKBACK_DAYS,
    "after_update_min_runs": UPDATE_MIN_RUNS,
    "after_update_min_increase": UPDATE_MIN_INCREASE,
    "after_update_min_errors": UPDATE_MIN_ERRORS,
    **{f"conflicts_{name}": value for name, value in conflicts.THRESHOLDS.items()},
}

_CLOCK = re.compile(r"^\s*(?:(\d+):)?(\d+):(\d+(?:\.\d+)?)\s*$")


def _sum(days: list[dict[str, Any]]) -> list[int]:
    total = [0] * FIELDS
    for entry in days:
        for index, value in enumerate(entry["c"]):
            if index == DUR_MAX:
                total[index] = max(total[index], value)
            else:
                total[index] += value
    return total


def _span(days: dict[str, Any], today: date, first: int, last: int) -> list[dict[str, Any]]:
    """Entries for the days ``first`` to ``last`` days ago (0 = today), both inclusive."""
    out = []
    for back in range(first, last + 1):
        entry = days.get((today - timedelta(days=back)).isoformat())
        if entry is not None:
            out.append(entry)
    return out


def _seconds(value: Any) -> float | None:
    """Seconds of a ``delay`` or ``timeout`` value; templates and unknown forms give None."""
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        match = _CLOCK.match(value)
        if match:
            return int(match[1] or 0) * 3600 + int(match[2]) * 60 + float(match[3])
        return None
    if isinstance(value, dict):
        try:
            return (
                float(value.get("days", 0)) * 86400
                + float(value.get("hours", 0)) * 3600
                + float(value.get("minutes", 0)) * 60
                + float(value.get("seconds", 0))
                + float(value.get("milliseconds", 0)) / 1000
            )
        except (TypeError, ValueError):
            return None
    return None


def static_traits(actions: Any) -> dict[str, Any]:
    """Find long waits, waits without timeout and ``continue_on_error`` in an action tree."""
    found: dict[str, Any] = {"long_wait": 0.0, "unbounded": 0, "continue_on_error": 0}

    def walk(node: Any) -> None:
        if isinstance(node, list):
            for child in node:
                walk(child)
            return
        if not isinstance(node, dict):
            return
        if "delay" in node:
            seconds = _seconds(node["delay"])
            if seconds is not None:
                found["long_wait"] = max(found["long_wait"], seconds)
        if "wait_template" in node or "wait_for_trigger" in node:
            if node.get("timeout") is None:
                found["unbounded"] += 1
            else:
                seconds = _seconds(node["timeout"])
                if seconds is not None:
                    found["long_wait"] = max(found["long_wait"], seconds)
        if node.get("continue_on_error") is True:
            found["continue_on_error"] += 1
        for value in node.values():
            walk(value)

    walk(actions)
    return found


def _finding(kind: str, level: str, **fields: Any) -> dict[str, Any]:
    return {"kind": kind, "level": level, **fields}


def _failing(total: list[int], steps: dict[str, int]) -> dict[str, Any] | None:
    runs, errors = total[RUNS], total[ERROR]
    if errors < FAIL_MIN_ERRORS or not runs or errors / runs < FAIL_MIN_RATE:
        return None
    level = "red" if errors / runs >= FAIL_RED_RATE else "warn"
    top = max(steps.items(), key=lambda kv: kv[1]) if steps else None
    repeated = top is not None and top[1] >= FAIL_MIN_ERRORS
    return _finding(
        "failing",
        level,
        errors=errors,
        runs=runs,
        step=top[0] if repeated else None,
        step_count=top[1] if repeated else None,
    )


def _burst(window: list[dict[str, Any]], baseline: list[dict[str, Any]]) -> dict[str, Any] | None:
    if len(baseline) < MIN_BASELINE_DAYS or not window:
        return None
    normal = statistics.median(entry["c"][RUNS] for entry in baseline)
    per_day = sum(entry["c"][RUNS] for entry in window) / WINDOW_DAYS
    if per_day < BURST_MIN_PER_DAY or per_day < BURST_FACTOR * max(normal, 1):
        return None
    return _finding("burst", "warn", per_day=round(per_day), normal=round(normal))


def _long_runs(
    window: list[dict[str, Any]], baseline: list[dict[str, Any]]
) -> dict[str, Any] | None:
    means = [e["c"][DUR_SUM] / e["c"][DUR_N] for e in baseline if e["c"][DUR_N]]
    longest = max((e["c"][DUR_MAX] for e in window), default=0)
    if len(means) < MIN_BASELINE_DAYS or longest < LONG_MIN_MS:
        return None
    normal = statistics.median(means)
    if longest < LONG_FACTOR * max(normal, 1):
        return None
    return _finding("long_run", "warn", longest_ms=longest, normal_ms=round(normal))


def _after_update(
    days: dict[str, Any], today: date, updates: list[dict[str, Any]]
) -> dict[str, Any] | None:
    """Compare the error rate in the week before and after the latest recent update."""
    for update in sorted(updates, key=lambda e: e["at"], reverse=True):
        try:
            moment = datetime.fromisoformat(update["at"])
        except ValueError:
            continue
        when = moment.astimezone(UTC).date()
        if (today - when).days > UPDATE_LOOKBACK_DAYS or when > today:
            continue
        before = _sum(
            [
                days[d]
                for d in _iso_days(when - timedelta(days=WINDOW_DAYS), when - timedelta(days=1))
                if d in days
            ]
        )
        after = _sum(
            [
                days[d]
                for d in _iso_days(
                    when + timedelta(days=1), min(today, when + timedelta(days=WINDOW_DAYS))
                )
                if d in days
            ]
        )
        if before[RUNS] < UPDATE_MIN_RUNS or after[RUNS] < UPDATE_MIN_RUNS:
            return None
        rate_before = before[ERROR] / before[RUNS]
        rate_after = after[ERROR] / after[RUNS]
        if after[ERROR] >= UPDATE_MIN_ERRORS and rate_after - rate_before >= UPDATE_MIN_INCREASE:
            return _finding(
                "after_update",
                "warn",
                event=update["kind"],
                domain=update.get("domain"),
                to=update.get("to"),
                at=update["at"],
                rate_before=round(rate_before * 100),
                rate_after=round(rate_after * 100),
            )
        return None
    return None


def _guard_stops(window: list[dict[str, Any]], actions: Any) -> int:
    """Aborted runs that stopped at a ``condition`` or ``stop`` of the actions: they ended on purpose."""
    count = 0
    for entry in window:
        for step, runs in (entry.get("a") or {}).items():
            node, found = actions, False
            for part in step.split("/")[1:]:
                try:
                    node = node[int(part)] if isinstance(node, list) else node[part]
                except (KeyError, IndexError, ValueError, TypeError):
                    node = None
                    break
                found = found or (isinstance(node, dict) and "condition" in node)
            if found or (isinstance(node, dict) and "stop" in node):
                count += runs
    return count


def _iso_days(first: date, last: date) -> list[str]:
    return [(first + timedelta(days=n)).isoformat() for n in range((last - first).days + 1)]


def evaluate(
    items: dict[str, dict[str, Any]],
    objects: list[dict[str, Any]],
    actions: dict[str, Any],
    ignored: set[str],
    updates: list[dict[str, Any]],
    now: datetime,
    since: str | None,
    changes: dict[str, dict[str, Any]] | None = None,
) -> RunsResult:
    """Rate every automation and script that has numbers or a structural reason to look.

    ``actions`` maps an entity id to its action tree for the static checks.
    """
    today = now.astimezone(UTC).date()
    rows: list[dict[str, Any]] = []
    left_out = 0
    for obj in objects:
        if obj["object_type"] not in ("automation", "script"):
            continue
        if obj["object_id"] in ignored:
            left_out += 1
            continue
        entity_id = obj["object_id"]
        stored = items.get(run_key(obj)) or {}
        days = stored.get("days") or {}
        window = _span(days, today, 0, WINDOW_DAYS - 1)
        baseline = _span(days, today, WINDOW_DAYS, WINDOW_DAYS + BASELINE_DAYS - 1)
        total = _sum(window)
        guards = min(_guard_stops(window, actions.get(entity_id)), total[STOPPED])
        total[STOPPED] -= guards
        total[CONDITION] += guards
        steps: dict[str, int] = {}
        for entry in window:
            for step, count in (entry.get("s") or {}).items():
                steps[step] = steps.get(step, 0) + count
        findings = []
        if failing := _failing(total, steps):
            findings.append(failing)
        if total[ALREADY] + total[MAXED] >= OVERLAP_MIN:
            findings.append(
                _finding(
                    "overlap",
                    "warn",
                    already=total[ALREADY],
                    maxed=total[MAXED],
                    mode=obj.get("mode"),
                    max=obj.get("max"),
                )
            )
        ended_badly = total[RUNS] - total[OK] - total[CONDITION]
        if total[OK] == 0 and ended_badly >= NEVER_OK_MIN_RUNS:
            findings.append(_finding("never_ok", "red", runs=total[RUNS]))
        elif total[RUNS] >= IDLE_MIN_RUNS and total[CONDITION] / total[RUNS] >= IDLE_SHARE:
            findings.append(
                _finding("no_effect", "info", conditions=total[CONDITION], runs=total[RUNS])
            )
        if burst := _burst(window, baseline):
            findings.append(burst)
        if long_run := _long_runs(window, baseline):
            findings.append(long_run)
        if update := _after_update(days, today, updates):
            findings.append(update)
        traits = static_traits(actions.get(entity_id))
        if traits["long_wait"] >= LONG_WAIT_SECONDS:
            findings.append(_finding("long_wait", "info", seconds=round(traits["long_wait"])))
        if traits["unbounded"]:
            findings.append(_finding("wait_no_timeout", "info", count=traits["unbounded"]))
        if traits["continue_on_error"]:
            findings.append(
                _finding("continue_on_error", "info", count=traits["continue_on_error"])
            )
        if not total[RUNS] and not findings:
            continue
        rows.append(
            {
                "object_type": obj["object_type"],
                "entity_id": entity_id,
                "name": obj.get("name") or entity_id,
                "status": obj.get("status"),
                "runs": total[RUNS],
                "ok": total[OK],
                "errors": total[ERROR],
                "conditions": total[CONDITION],
                "mean_ms": round(total[DUR_SUM] / total[DUR_N]) if total[DUR_N] else None,
                "max_ms": total[DUR_MAX] or None,
                "per_day": [
                    (days.get((today - timedelta(days=back)).isoformat()) or {"c": [0] * FIELDS})[
                        "c"
                    ][RUNS]
                    for back in range(WINDOW_DAYS - 1, -1, -1)
                ],
                "per_day_30": [
                    (days.get((today - timedelta(days=back)).isoformat()) or {"c": [0] * FIELDS})[
                        "c"
                    ][RUNS]
                    for back in range(TREND_DAYS - 1, -1, -1)
                ],
                "lower_bound": any(entry.get("lo") for entry in window),
                "change": before_after(
                    days,
                    ((changes or {}).get(f"{obj['object_type']}.{entity_id}") or {}).get("at"),
                    today,
                ),
                "findings": findings,
            }
        )
    weight = {"red": 0, "warn": 1, "info": 2}
    rows.sort(
        key=lambda r: (
            min((weight[f["level"]] for f in r["findings"]), default=3),
            -len(r["findings"]),
            -r["errors"],
            -r["runs"],
            r["name"],
        )
    )
    return {
        "window_days": WINDOW_DAYS,
        "since": since,
        "total": len(rows),
        "excluded": {"ignored": left_out},
        "items": rows[:LIMIT],
    }


async def report(scanner: Any, snapshot: dict[str, Any] | None = None) -> RunsResult:
    """Collect the newest runs, then rate everything; reads traces and the snapshot only.

    With a ``snapshot`` (the scan that has just built it) nothing is collected or awaited: the
    runs are those the daily collection kept.
    """
    if snapshot is None:
        await scanner.runs.async_collect()
        snapshot = await scanner.async_get_snapshot()
    ignored = {f["object_id"] for f in snapshot.get("findings", []) if f.get("ignored")} | {
        item["object_id"]
        for item in snapshot["objects"]
        if item["object_type"] == "entity" and IGNORE_LABEL in (item.get("labels") or [])
    }
    actions = {}
    autos = []
    for obj in snapshot["objects"]:
        if obj["object_type"] in ("automation", "script"):
            details = scanner.get_details(obj["object_type"], obj["object_id"]) or {}
            actions[obj["object_id"]] = details.get("actions")
            if obj["object_type"] == "automation" and obj["object_id"] not in ignored:
                autos.append(
                    {
                        **{k: obj.get(k) for k in ("name", "status", "source")},
                        "entity_id": obj["object_id"],
                        "run_key": run_key(obj),
                        "triggers": details.get("triggers"),
                        "conditions": details.get("conditions"),
                        "actions": details.get("actions"),
                    }
                )
    updates = [e for e in scanner.events.events if e["kind"] in ("ha_version", "entry_version")]
    result = evaluate(
        scanner.runs.items,
        snapshot["objects"],
        actions,
        ignored,
        updates,
        datetime.now(UTC),
        scanner.runs.since,
        scanner.config_changes.items,
    )
    found = conflicts.find(
        [a for a in autos if a["source"] != "state_fallback"],
        snapshot["edges"],
        scanner.runs.items,
        datetime.now(UTC).date(),
    )
    now = datetime.now(UTC)
    for item in found["items"]:
        if info := scanner.ignored.info(item["key"], now):
            item["ignored"] = True
            item["decision"] = {k: info[k] for k in ("kind", "reason", "until")}
    found["known"] = sum(1 for item in found["items"] if item.get("ignored"))
    found["total"] -= found["known"]
    return {**result, "conflicts": found, "thresholds": THRESHOLDS}
