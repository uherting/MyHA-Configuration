"""Counter glitches: find a short wrong reading of a meter and repair what it left in the recorder.

A counter (``total`` or ``total_increasing``) must never fall. When a sensor reports a wrong value
for a while, Home Assistant treats a drop of more than 10 % as a reset: the value that comes back
is then counted as new consumption, and the cumulated ``sum`` carries that error from then on.

The repair touches the three recorder tables that hold the reading:

* ``states``: the raw values (the history graph). Only values outside the good range are replaced.
* ``statistics_short_term``: the 5-minute rows (the more-info graph).
* ``statistics``: the hourly rows (dashboards, Energy).

In the two statistics tables the ``state`` of the wrong rows is replaced and the ``sum`` is rebuilt:
rows between the last good row ``b`` and the first good row ``e`` get ``sum_b + (state - state_b)``,
every row from ``e`` on loses the offset ``(sum_e - sum_b) - (state_e - state_b)``, which is exactly
what the glitch added (zero for a ``total`` sensor, whose sum simply follows the readings).

The functions up to ``build_changes`` are pure; the ones below read and write the recorder. The
write runs as a recorder task, so it is serialised with the recorder's own compile and writes.
"""

from __future__ import annotations

import hashlib
import json
from bisect import bisect_right
from collections.abc import Callable
from typing import Any

from homeassistant.core import HomeAssistant

MAX_SPAN = 48 * 3600  # seconds; a wrong reading that lasts longer is treated as a real change
MIN_DEPTH = 0.001  # relative to the level; smaller wobble is noise, not a glitch
MAX_ROWS = 5000  # rows one repair may rewrite; more is refused, never cut
SCAN_DAYS = 365
SCAN_IDS = 400
CACHE_SECONDS = 300
MODES = ("hold", "interpolate")
RANGE_MODES = ("hold", "interpolate", "fixed")
RANGE_MAX_SPAN = 31 * 86400  # seconds; a longer range is refused
RANGE_LOOKBACK = 7 * 86400  # rows loaded before the range, to find the good reading in front of it
SLOT = {"short_term": 300, "long_term": 3600}
REF = {"short_term": 0, "long_term": 3300}  # where in its slot a row's state was last read
PREVIEW_POINTS = 120
SERIES_POINTS = 300
SERIES_MAX_DAYS = 366
SPIKE_FENCE = (
    3.0  # spreads beyond the 1 % / 99 % readings; a spike must lie outside everything normal
)
SPIKE_MIN_POINTS = 30
EPS = 1e-9


def tolerance(lo: float, hi: float) -> float:
    return max(EPS, 1e-6 * max(abs(lo), abs(hi)))


def fmt(value: float) -> str:
    return format(value, ".12g")


# -- finding ---------------------------------------------------------------------------------


def _non_decreasing(values: list[float]) -> set[int]:
    """Indices of one longest non-decreasing subsequence (the readings that can be trusted)."""
    tails: list[float] = []
    tail_index: list[int] = []
    prev = [-1] * len(values)
    for i, value in enumerate(values):
        k = bisect_right(tails, value)
        if k == len(tails):
            tails.append(value)
            tail_index.append(i)
        else:
            tails[k] = value
            tail_index[k] = i
        prev[i] = tail_index[k - 1] if k else -1
    good: set[int] = set()
    i = tail_index[-1] if tail_index else -1
    while i != -1:
        good.add(i)
        i = prev[i]
    return good


def find_runs(
    points: list[tuple[float, float]], max_span: float = MAX_SPAN, min_depth: float = MIN_DEPTH
) -> list[dict[str, Any]]:
    """Runs of readings that break the order and come back: bounded by good readings on both sides.

    A reading that stays low (a reset, a replaced meter) is never a run: it is longer than
    ``max_span``, or the series simply ends in it.
    """
    if len(points) < 3:
        return []
    good = _non_decreasing([value for _, value in points])
    runs: list[dict[str, Any]] = []
    i = 0
    while i < len(points):
        if i in good:
            i += 1
            continue
        j = i
        while j + 1 < len(points) and j + 1 not in good:
            j += 1
        if i > 0 and j + 1 < len(points) and points[j + 1][0] - points[i - 1][0] <= max_span:
            gb, ga = points[i - 1][1], points[j + 1][1]
            tol = tolerance(gb, ga)
            bad = [v for _, v in points[i : j + 1] if v < gb - tol or v > ga + tol]
            depth = max([gb - min(bad, default=gb), max(bad, default=ga) - ga, 0.0])
            if bad and depth > max(min_depth * max(abs(gb), abs(ga)), EPS):
                outside = [t for t, v in points[i : j + 1] if v < gb - tol or v > ga + tol]
                runs.append(
                    {
                        "b_ts": points[i - 1][0],
                        "a_ts": points[j + 1][0],
                        "gb": gb,
                        "ga": ga,
                        "first": outside[0],
                        "last": outside[-1],
                        "low": min(bad),
                        "high": max(bad),
                        "count": len(bad),
                    }
                )
        i = j + 1
    return runs


def ref_points(rows: list[dict[str, Any]], table: str) -> list[tuple[float, float]]:
    return [(row["ts"] + REF[table], row["state"]) for row in rows if row.get("state") is not None]


def merge_runs(by_table: dict[str, list[dict[str, Any]]]) -> list[dict[str, Any]]:
    """Runs of every table that overlap in time become one finding."""
    runs = sorted(
        ((table, run) for table, found in by_table.items() for run in found),
        key=lambda item: item[1]["b_ts"],
    )
    findings: list[dict[str, Any]] = []
    for table, run in runs:
        current = findings[-1] if findings else None
        if current is None or run["b_ts"] > current["end"]:
            findings.append(
                {
                    "start": run["b_ts"],
                    "end": run["a_ts"],
                    "lo": run["gb"],
                    "hi": run["ga"],
                    "bad_first": run["first"],
                    "bad_last": run["last"],
                    "low": run["low"],
                    "high": run["high"],
                    "count": {table: run["count"]},
                    "bracket": (run["b_ts"], run["gb"], run["a_ts"], run["ga"]),
                }
            )
            continue
        current["end"] = max(current["end"], run["a_ts"])
        current["lo"] = min(current["lo"], run["gb"])
        current["hi"] = max(current["hi"], run["ga"])
        current["bad_first"] = min(current["bad_first"], run["first"])
        current["bad_last"] = max(current["bad_last"], run["last"])
        current["low"] = min(current["low"], run["low"])
        current["high"] = max(current["high"], run["high"])
        current["count"][table] = current["count"].get(table, 0) + run["count"]
        narrowest = current["bracket"]
        if run["a_ts"] - run["b_ts"] < narrowest[2] - narrowest[0]:
            current["bracket"] = (run["b_ts"], run["gb"], run["a_ts"], run["ga"])
    for finding in findings:
        finding["bracket"] = list(finding["bracket"])
    return findings


def analyse(
    short_rows: list[dict[str, Any]],
    long_rows: list[dict[str, Any]],
    max_span: float = MAX_SPAN,
) -> list[dict[str, Any]]:
    """Findings of one counter from its 5-minute and hourly rows (``ts``, ``state``, ``sum``)."""
    return merge_runs(
        {
            "short_term": find_runs(ref_points(short_rows, "short_term"), max_span),
            "long_term": find_runs(ref_points(long_rows, "long_term"), max_span),
        }
    )


def find_spikes(
    points: list[tuple[float, float]], max_span: float = MAX_SPAN
) -> list[dict[str, Any]]:
    """Runs of a measurement far outside everything the sensor normally reports, that come back.

    The band is the range between the 5 % and the 95 % reading, widened by ten times its
    width on both sides, so a value inside what the sensor does now and then (a pulse of a power
    sensor, rain) is never a spike. Like for counters, a run needs a reading inside the band on
    both sides and must be over within ``max_span``; one that stays out (a defect, a new unit) is
    left alone. A constant series has no band and is skipped.
    """
    if len(points) < SPIKE_MIN_POINTS:
        return []
    values = sorted(v for _, v in points)
    last = len(values) - 1
    q_low, q_high = values[round(0.05 * last)], values[round(0.95 * last)]
    spread = q_high - q_low
    if spread <= EPS:
        return []
    low, high = q_low - SPIKE_FENCE * spread, q_high + SPIKE_FENCE * spread
    out = [not low <= v <= high for _, v in points]
    runs: list[dict[str, Any]] = []
    i = 0
    while i < len(points):
        if not out[i]:
            i += 1
            continue
        j = i
        while j + 1 < len(points) and out[j + 1]:
            j += 1
        if i > 0 and j + 1 < len(points) and points[j + 1][0] - points[i - 1][0] <= max_span:
            bad = [v for _, v in points[i : j + 1]]
            runs.append(
                {
                    "b_ts": points[i - 1][0],
                    "a_ts": points[j + 1][0],
                    "gb": points[i - 1][1],
                    "ga": points[j + 1][1],
                    "first": points[i][0],
                    "last": points[j][0],
                    "low": min(bad),
                    "high": max(bad),
                    "count": len(bad),
                }
            )
        i = j + 1
    return runs


def mean_points(rows: list[dict[str, Any]], table: str) -> list[tuple[float, float]]:
    return [
        (row["ts"] + SLOT[table] / 2, row["mean"]) for row in rows if row.get("mean") is not None
    ]


def suggest_range(finding: dict[str, Any]) -> dict[str, float]:
    """The period to clean for a finding: whole rows of the coarsest table that saw it."""
    pad = SLOT["long_term"] / 2 if "long_term" in finding["count"] else SLOT["short_term"] / 2
    return {"from": finding["bad_first"] - pad, "to": finding["bad_last"] + pad - 1}


# -- changes ---------------------------------------------------------------------------------


def fixed_value(finding: dict[str, Any], ts: float, mode: str) -> float:
    if mode == "fixed":
        return finding["fixed"]
    b_ts, gb, a_ts, ga = finding["bracket"]
    if mode == "interpolate" and a_ts > b_ts:
        share = min(1.0, max(0.0, (ts - b_ts) / (a_ts - b_ts)))
        return gb + (ga - gb) * share
    return gb


def _is_good(finding: dict[str, Any], value: float) -> bool:
    tol = tolerance(finding["lo"], finding["hi"])
    return finding["lo"] - tol <= value <= finding["hi"] + tol


def stats_changes(
    rows: list[dict[str, Any]], table: str, findings: list[dict[str, Any]], mode: str
) -> dict[str, Any]:
    """New ``state``/``sum`` for the wrong rows of one statistics table, and the sum offsets.

    ``skipped`` lists the findings this table cannot repair on its own (no good row before or after
    in its retention); the other tables are still repaired.
    """
    ref = REF[table]
    ordered = sorted(rows, key=lambda row: row["ts"])
    new: dict[int, dict[str, Any]] = {}
    tails: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []
    shift = 0.0  # what the earlier findings already take off every later row
    for index, finding in enumerate(findings):
        before = [r for r in ordered if r["ts"] + ref < finding["bad_first"]]
        after = [r for r in ordered if r["ts"] + ref > finding["bad_last"]]
        b = before[-1] if before else None
        e = after[0] if after else None
        reason = None
        if b is None or e is None:
            reason = "no_before" if b is None else "no_after"
        elif b.get("state") is None or e.get("state") is None:
            reason = "no_state"
        elif b.get("sum") is None or e.get("sum") is None:
            reason = "no_sum"
        elif b["state"] > e["state"] + tolerance(b["state"], e["state"]):
            reason = "bracket_not_good"
        if reason:
            skipped.append({"finding": index, "reason": reason})
            continue
        for row in ordered:
            ts = row["ts"] + ref
            if not (b["ts"] + ref < ts < e["ts"] + ref) or row.get("state") is None:
                continue
            state = row["state"]
            tol = tolerance(b["state"], e["state"])
            if not (b["state"] - tol <= state <= e["state"] + tol):
                state = min(max(fixed_value(finding, ts, mode), b["state"]), e["state"])
            total = (b["sum"] - shift) + (state - b["state"])
            new[row["id"]] = {"state": state, "sum": total}
        offset = (e["sum"] - b["sum"]) - (e["state"] - b["state"])
        if abs(offset) > tolerance(b["sum"], e["sum"]):
            tails.append({"from": e["ts"], "offset": offset, "probe": e["id"]})
            shift += offset
    by_id = {row["id"]: row for row in rows}
    changed = [
        {
            "id": row_id,
            "old": [by_id[row_id].get("state"), by_id[row_id].get("sum")],
            "new": [values["state"], values["sum"]],
        }
        for row_id, values in new.items()
        if by_id[row_id].get("state") != values["state"]
        or abs((by_id[row_id].get("sum") or 0.0) - values["sum"]) > EPS
    ]
    return {"cols": ["state", "sum"], "rows": changed, "tails": tails, "skipped": skipped}


def state_changes(
    rows: list[dict[str, Any]], findings: list[dict[str, Any]], mode: str
) -> list[dict[str, Any]]:
    """The raw state rows inside a finding whose value lies outside the good range."""
    changed = []
    for row in rows:
        for finding in findings:
            if not (finding["start"] < row["ts"] < finding["end"]):
                continue
            try:
                value = float(row["state"])
            except (TypeError, ValueError):
                break
            if not _is_good(finding, value):
                changed.append(
                    {
                        "id": row["id"],
                        "old": row["state"],
                        "new": fmt(fixed_value(finding, row["ts"], mode)),
                    }
                )
            break
    return changed


def build_changes(
    findings: list[dict[str, Any]],
    short_rows: list[dict[str, Any]],
    long_rows: list[dict[str, Any]],
    state_rows: list[dict[str, Any]],
    mode: str,
) -> dict[str, Any]:
    changes = {
        "states": state_changes(state_rows, findings, mode),
        "short_term": stats_changes(short_rows, "short_term", findings, mode),
        "long_term": stats_changes(long_rows, "long_term", findings, mode),
    }
    changes["counts"] = {
        "states": len(changes["states"]),
        "short_term": len(changes["short_term"]["rows"]),
        "long_term": len(changes["long_term"]["rows"]),
        "tail_short_term": _tail_rows(short_rows, changes["short_term"]["tails"]),
        "tail_long_term": _tail_rows(long_rows, changes["long_term"]["tails"]),
    }
    return changes


def _tail_rows(rows: list[dict[str, Any]], tails: list[dict[str, Any]]) -> int:
    if not tails:
        return 0
    first = min(tail["from"] for tail in tails)
    return sum(1 for row in rows if row["ts"] >= first and row.get("sum") is not None)


def fingerprint(findings: list[dict[str, Any]], counts: dict[str, int], mode: str) -> str:
    """Changes when the data under the preview changed.

    The ``tail_*`` counts are left out: a running counter gets a new row every few minutes, and
    the backup before a plan takes minutes, so they would differ almost every time. The tail is
    read afresh when the plan writes, and it is shifted as a whole, so a longer tail is harmless.
    """
    counts = {name: value for name, value in counts.items() if not name.startswith("tail_")}
    shape = [
        [
            round(f["start"]),
            round(f["end"]),
            round(f["lo"], 6),
            round(f["hi"], 6),
            round(f["low"], 6),
            round(f["high"], 6),
        ]
        for f in findings
    ]
    text = json.dumps([shape, sorted(counts.items()), mode], sort_keys=True)
    return hashlib.sha256(text.encode()).hexdigest()[:16]


def preview_series(
    finding: dict[str, Any],
    short_rows: list[dict[str, Any]],
    long_rows: list[dict[str, Any]],
    mode: str,
) -> list[list[float]]:
    """``[ts, original, repaired]`` around one finding from the finest table that covers it."""
    for table, rows in (("short_term", short_rows), ("long_term", long_rows)):
        ref = REF[table]
        span = SLOT[table] * 2
        window = [
            r
            for r in rows
            if r.get("state") is not None
            and finding["start"] - span <= r["ts"] + ref <= finding["end"] + span
        ]
        if len(window) >= 3:
            step = max(1, len(window) // PREVIEW_POINTS)
            return [
                [
                    r["ts"] + ref,
                    r["state"],
                    r["state"]
                    if _is_good(finding, r["state"])
                    else fixed_value(finding, r["ts"] + ref, mode),
                ]
                for r in window[::step]
            ]
    return []


def public_finding(finding: dict[str, Any]) -> dict[str, Any]:
    return {
        "start": finding["start"],
        "end": finding["end"],
        "bad_first": finding["bad_first"],
        "bad_last": finding["bad_last"],
        "low": finding["low"],
        "high": finding["high"],
        "good_before": finding["lo"],
        "good_after": finding["hi"],
        "rows": finding["count"],
    }


# -- a range the person picked ---------------------------------------------------------------


def range_bracket(
    sources: list[list[tuple[float, float]]], start: float, end: float
) -> list[float] | None:
    """The last good reading before and the first after the range, from the finest source with both."""
    for points in sources:
        before = [p for p in points if p[0] < start]
        after = [p for p in points if p[0] > end]
        if before and after:
            return [before[-1][0], before[-1][1], after[0][0], after[0][1]]
    return None


def _same_all(old: list[float | None], new: list[float | None]) -> bool:
    return all(
        (a is None and b is None)
        or (a is not None and b is not None and abs(a - b) <= max(1e-9, 1e-9 * max(abs(a), abs(b))))
        for a, b in zip(old, new, strict=True)
    )


def measurement_changes(
    short_rows: list[dict[str, Any]],
    long_rows: list[dict[str, Any]],
    state_rows: list[dict[str, Any]],
    finding: dict[str, Any],
    mode: str,
) -> dict[str, Any]:
    """Replace the readings of a measurement inside the range.

    The 5-minute rows get the replacement value. An hourly row is rebuilt from its (corrected)
    5-minute rows; where those are gone it gets the replacement value instead and is counted as an
    estimate, because its mean, minimum and maximum cannot be recomputed.
    """
    start, end = finding["bad_first"], finding["bad_last"]
    cols = ["mean", "min", "max"]
    new_short: dict[int, list[float | None]] = {}
    short_block: list[dict[str, Any]] = []
    for row in short_rows:
        if row["ts"] + SLOT["short_term"] <= start or row["ts"] > end or row.get("mean") is None:
            continue
        value = fixed_value(finding, row["ts"] + SLOT["short_term"] / 2, mode)
        new_short[row["id"]] = [value, value, value]
        old = [row["mean"], row["min"], row["max"]]
        if not _same_all(old, new_short[row["id"]]):
            short_block.append({"id": row["id"], "old": old, "new": new_short[row["id"]]})
    current: dict[int, list[float | None]] = {
        row["id"]: new_short.get(row["id"], [row["mean"], row["min"], row["max"]])
        for row in short_rows
    }
    long_block: list[dict[str, Any]] = []
    estimated = 0
    for row in long_rows:
        if row["ts"] + SLOT["long_term"] <= start or row["ts"] > end or row.get("mean") is None:
            continue
        inside = [
            current[r["id"]]
            for r in short_rows
            if row["ts"] <= r["ts"] < row["ts"] + SLOT["long_term"]
            and current[r["id"]][0] is not None
        ]
        if len(inside) >= SLOT["long_term"] // SLOT["short_term"] - 2:
            means = [v[0] for v in inside]
            lows = [v[1] for v in inside if v[1] is not None]
            highs = [v[2] for v in inside if v[2] is not None]
            new = [sum(means) / len(means), min(lows or means), max(highs or means)]
        else:
            value = fixed_value(finding, row["ts"] + SLOT["long_term"] / 2, mode)
            new = [value, value, value]
            estimated += 1
        old = [row["mean"], row["min"], row["max"]]
        if not _same_all(old, new):
            long_block.append({"id": row["id"], "old": old, "new": new})
    states = []
    for row in state_rows:
        try:
            number = float(row["state"])
        except (TypeError, ValueError):
            continue
        value = fixed_value(finding, row["ts"], mode)
        if abs(number - value) > max(1e-9, 1e-9 * abs(number)):
            states.append({"id": row["id"], "old": row["state"], "new": fmt(value)})
    block = {"cols": cols, "tails": [], "skipped": []}
    changes = {
        "states": states,
        "short_term": {**block, "rows": short_block},
        "long_term": {**block, "rows": long_block},
    }
    changes["counts"] = {
        "states": len(states),
        "short_term": len(short_block),
        "long_term": len(long_block),
        "tail_short_term": 0,
        "tail_long_term": 0,
        "estimated_long_term": estimated,
    }
    return changes


def range_detail(
    changes: dict[str, Any],
    state_rows: list[dict[str, Any]],
    short_rows: list[dict[str, Any]],
    long_rows: list[dict[str, Any]],
    limit: int = 60,
) -> dict[str, Any]:
    """The first rows of every table with the time, the old and the new value."""
    times = {
        "states": {r["id"]: r["ts"] for r in state_rows},
        "short_term": {r["id"]: r["ts"] for r in short_rows},
        "long_term": {r["id"]: r["ts"] for r in long_rows},
    }
    detail: dict[str, Any] = {
        "states": [
            [times["states"].get(r["id"]), r["old"], r["new"]] for r in changes["states"][:limit]
        ]
    }
    for table in ("short_term", "long_term"):
        block = changes[table]
        detail[table] = {
            "cols": block["cols"],
            "rows": [
                [times[table].get(r["id"]), r["old"], r["new"]] for r in block["rows"][:limit]
            ],
            "tails": [{"from": t["from"], "offset": t["offset"]} for t in block["tails"]],
        }
    return detail


def range_series(
    finding: dict[str, Any],
    changes: dict[str, Any],
    state_rows: list[dict[str, Any]],
    short_rows: list[dict[str, Any]],
    long_rows: list[dict[str, Any]],
    counter: bool,
) -> list[list[float]]:
    """``[ts, original, repaired]`` around the range from the finest table that has rows there."""
    start, end = finding["bad_first"], finding["bad_last"]
    pad = max((end - start) / 2, 3 * 3600)
    key = "state" if counter else "mean"
    new_state = {r["id"]: r["new"] for r in changes["states"]}
    points: list[list[float]] = []
    for row in state_rows:
        try:
            number = float(row["state"])
        except (TypeError, ValueError):
            continue
        points.append([row["ts"], number, float(new_state.get(row["id"], row["state"]))])
    if len(points) >= 3 and finding.get("bracket"):
        b_ts, gb, a_ts, ga = finding["bracket"]
        points = [[b_ts, gb, gb], *points, [a_ts, ga, ga]]
    if len(points) < 3:
        for table, rows in (("short_term", short_rows), ("long_term", long_rows)):
            new = {r["id"]: r["new"] for r in changes[table]["rows"]}
            window = [
                r for r in rows if r.get(key) is not None and start - pad <= r["ts"] <= end + pad
            ]
            if len(window) >= 3:
                points = [
                    [
                        r["ts"] + SLOT[table] / 2,
                        r[key],
                        new[r["id"]][0] if r["id"] in new else r[key],
                    ]
                    for r in window
                ]
                break
    step = max(1, len(points) // PREVIEW_POINTS)
    return points[::step]


# -- recorder --------------------------------------------------------------------------------


def schema_ok() -> bool:
    """The tables and columns this module writes exist as it expects them."""
    try:
        from homeassistant.components.recorder.db_schema import (
            States,
            StatesMeta,
            Statistics,
            StatisticsMeta,
            StatisticsShortTerm,
        )
        from homeassistant.components.recorder.tasks import RecorderTask  # noqa: F401
    except Exception:
        return False
    needs = {
        States: ("state_id", "state", "metadata_id", "last_updated_ts"),
        StatesMeta: ("metadata_id", "entity_id"),
        Statistics: ("id", "metadata_id", "start_ts", "state", "sum"),
        StatisticsShortTerm: ("id", "metadata_id", "start_ts", "state", "sum"),
        StatisticsMeta: ("id", "statistic_id", "source", "has_sum"),
    }
    return all(hasattr(model, name) for model, names in needs.items() for name in names)


def _models() -> dict[str, Any]:
    from homeassistant.components.recorder.db_schema import (
        States,
        StatesMeta,
        Statistics,
        StatisticsMeta,
        StatisticsShortTerm,
    )

    return {
        "states": States,
        "states_meta": StatesMeta,
        "short_term": StatisticsShortTerm,
        "long_term": Statistics,
        "meta": StatisticsMeta,
    }


def _load_stats(
    session: Any, table: str, meta_id: int, since: float | None, measure: bool = False
) -> list[dict]:
    from sqlalchemy import select

    model = _models()[table]
    columns = [model.id, model.start_ts, model.state, model.sum]
    if measure:
        columns += [model.mean, model.min, model.max]
    query = select(*columns).where(model.metadata_id == meta_id)
    if since is not None:
        query = query.where(model.start_ts >= since)
    rows = []
    for row in session.execute(query.order_by(model.start_ts)).all():
        item = {"id": row.id, "ts": row.start_ts, "state": row.state, "sum": row.sum}
        if measure:
            item.update(mean=row.mean, min=row.min, max=row.max)
        rows.append(item)
    return rows


def _load_states(
    session: Any, entity_id: str, start: float, end: float, limit: int | None = None
) -> list[dict]:
    from sqlalchemy import select

    models = _models()
    states, meta = models["states"], models["states_meta"]
    query = (
        select(states.state_id, states.state, states.last_updated_ts)
        .join(meta, states.metadata_id == meta.metadata_id)
        .where(meta.entity_id == entity_id)
        .where(states.last_updated_ts > start, states.last_updated_ts < end)
        .order_by(states.last_updated_ts)
    )
    if limit:
        query = query.limit(limit)
    return [
        {"id": row.state_id, "state": row.state, "ts": row.last_updated_ts}
        for row in session.execute(query).all()
    ]


def _meta(session: Any, statistic_id: str) -> tuple[int, str | None] | None:
    """The metadata ID and unit of a recorder statistic that holds a sum, or None."""
    from sqlalchemy import select

    meta = _models()["meta"]
    row = session.execute(
        select(meta.id, meta.unit_of_measurement, meta.has_sum, meta.source).where(
            meta.statistic_id == statistic_id
        )
    ).first()
    if row is None or not row.has_sum or row.source != "recorder":
        return None
    return row.id, row.unit_of_measurement


def _meta_any(session: Any, statistic_id: str) -> tuple[int, str | None, bool, bool] | None:
    """Metadata ID, unit and whether it holds a sum or an arithmetic mean, for a recorder statistic.

    A circular mean (an angle such as the wind direction) cannot be rebuilt by averaging: refused.
    """
    from sqlalchemy import select

    meta = _models()["meta"]
    kind = getattr(meta, "mean_type", None)
    columns = [meta.id, meta.unit_of_measurement, meta.has_sum, meta.has_mean, meta.source]
    row = session.execute(
        select(*columns, *([kind] if kind is not None else [])).where(
            meta.statistic_id == statistic_id
        )
    ).first()
    if row is None or row.source != "recorder":
        return None
    mean_type = int(row.mean_type) if kind is not None and row.mean_type is not None else None
    has_mean = bool(row.has_mean) if mean_type is None else mean_type == 1
    if not (row.has_sum or has_mean):
        return None
    return row.id, row.unit_of_measurement, bool(row.has_sum), has_mean


def _state_edge(
    session: Any, entity_id: str, ts: float, before: bool
) -> tuple[float, float] | None:
    """The nearest numeric raw reading before or after ``ts`` as ``(time, value)``."""
    from sqlalchemy import select

    models = _models()
    states, meta = models["states"], models["states_meta"]
    query = (
        select(states.state, states.last_updated_ts)
        .join(meta, states.metadata_id == meta.metadata_id)
        .where(meta.entity_id == entity_id)
    )
    if before:
        query = query.where(states.last_updated_ts < ts).order_by(states.last_updated_ts.desc())
    else:
        query = query.where(states.last_updated_ts > ts).order_by(states.last_updated_ts)
    for row in session.execute(query.limit(20)).all():
        try:
            return row.last_updated_ts, float(row.state)
        except (TypeError, ValueError):
            continue
    return None


def _prepare_range(
    session: Any, statistic_id: str, mode: str, rng: dict[str, Any]
) -> tuple[dict[str, Any], dict[str, Any] | None]:
    """What cleaning one range of a counter or a measurement would change."""
    import time

    start, end = float(rng["from"]), float(rng["to"])
    fixed = rng.get("fixed") if mode == "fixed" else None
    info = _meta_any(session, statistic_id)
    if info is None:
        return {"error": "no_range_statistics"}, None
    meta_id, unit, counter, _ = info
    if (
        not start < end
        or end - start > RANGE_MAX_SPAN
        or end > time.time() + 60
        or (mode == "fixed" and fixed is None)
    ):
        return {"error": "bad_range"}, None
    measure = not counter
    since = start - RANGE_LOOKBACK
    short_rows = _load_stats(session, "short_term", meta_id, since, measure)
    long_rows = _load_stats(session, "long_term", meta_id, since, measure)
    state_rows = _load_states(session, statistic_id, start - 1e-6, end + 1e-6, MAX_ROWS + 1)
    sources: list[list[tuple[float, float]]] = []
    before = _state_edge(session, statistic_id, start, True)
    after = _state_edge(session, statistic_id, end, False)
    if before and after:
        sources.append([before, after])
    for table, rows in (("short_term", short_rows), ("long_term", long_rows)):
        if counter:
            sources.append(ref_points(rows, table))
        else:
            sources.append(
                [
                    (r["ts"] + SLOT[table] / 2, r["mean"])
                    for r in rows
                    if r.get("mean") is not None
                    and (r["ts"] + SLOT[table] <= start or r["ts"] > end)
                ]
            )
    bracket = range_bracket(sources, start, end)
    values = []
    for row in state_rows:
        try:
            values.append(float(row["state"]))
        except (TypeError, ValueError):
            continue
    finding: dict[str, Any] = {
        "start": bracket[0] if bracket else start,
        "end": bracket[2] if bracket else end,
        "lo": bracket[1] if bracket else None,
        "hi": bracket[3] if bracket else None,
        "bad_first": start,
        "bad_last": end,
        "low": min(values) if values else None,
        "high": max(values) if values else None,
        "count": {},
        "bracket": bracket,
        "fixed": fixed,
    }
    base: dict[str, Any] = {
        "kind": "counter" if counter else "measurement",
        "unit": unit,
        "mode": mode,
        "range": {"from": start, "to": end, "fixed": fixed},
        "bracket": bracket,
        "findings": [],
    }
    if bracket is None and (counter or mode != "fixed"):
        return {**base, "error": "no_bracket"}, None
    if counter and bracket[1] > bracket[3] + tolerance(bracket[1], bracket[3]):
        return {**base, "error": "bracket_not_good"}, None
    if counter and mode == "fixed":
        tol = tolerance(bracket[1], bracket[3])
        if not bracket[1] - tol <= fixed <= bracket[3] + tol:
            return {**base, "error": "fixed_outside"}, None
    if counter:
        changes = build_changes([finding], short_rows, long_rows, state_rows, mode)
    else:
        changes = measurement_changes(short_rows, long_rows, state_rows, finding, mode)
    counts = changes["counts"]
    total = sum(counts[t] for t in ("states", "short_term", "long_term"))
    checksum = round(
        sum(
            v
            for block in (changes["short_term"]["rows"], changes["long_term"]["rows"])
            for row in block
            for v in row["old"]
            if v is not None
        ),
        6,
    )
    available = {
        "states": len(state_rows),
        "short_term": sum(
            1 for r in short_rows if r["ts"] + SLOT["short_term"] > start and r["ts"] <= end
        ),
        "long_term": sum(
            1 for r in long_rows if r["ts"] + SLOT["long_term"] > start and r["ts"] <= end
        ),
    }
    error = None
    if len(state_rows) > MAX_ROWS or total > MAX_ROWS:
        error = "too_many_rows"
    elif total == 0:
        error = "nothing_found"
    shape = [round(start), round(end), mode, fixed, sorted(counts.items()), checksum]
    result = {
        **base,
        "low": finding["low"],
        "high": finding["high"],
        "available": available,
        "counts": counts,
        "skipped": {
            t: changes[t]["skipped"] for t in ("short_term", "long_term") if changes[t]["skipped"]
        },
        "detail": range_detail(changes, state_rows, short_rows, long_rows),
        "series": range_series(finding, changes, state_rows, short_rows, long_rows, counter),
        "fingerprint": hashlib.sha256(json.dumps(shape).encode()).hexdigest()[:16],
        "error": error,
    }
    return result, {"meta_id": meta_id, "changes": changes, "counter": counter}


def _gather(
    session: Any, statistic_id: str, since: float | None, max_span: float
) -> dict[str, Any] | None:
    meta = _meta(session, statistic_id)
    if meta is None:
        return None
    meta_id, unit = meta
    short_rows = _load_stats(session, "short_term", meta_id, since)
    long_rows = _load_stats(session, "long_term", meta_id, since)
    return {
        "meta_id": meta_id,
        "unit": unit,
        "short": short_rows,
        "long": long_rows,
        "findings": analyse(short_rows, long_rows, max_span),
    }


def _gather_measure(
    session: Any, statistic_id: str, since: float | None, max_span: float
) -> dict[str, Any] | None:
    info = _meta_any(session, statistic_id)
    if info is None or info[2]:
        return None
    meta_id, unit = info[0], info[1]
    short_rows = _load_stats(session, "short_term", meta_id, since, True)
    long_rows = _load_stats(session, "long_term", meta_id, since, True)
    findings = merge_runs(
        {
            "short_term": find_spikes(mean_points(short_rows, "short_term"), max_span),
            "long_term": find_spikes(mean_points(long_rows, "long_term"), max_span),
        }
    )
    return {"unit": unit, "findings": findings}


def scan_blocking(
    hass: HomeAssistant, statistic_ids: list[str] | None, days: int | None, max_span: float
) -> dict[str, Any]:
    """Blocking: counters with glitches and measurements with spikes (statistics of the recorder)."""
    from datetime import UTC, datetime, timedelta

    from homeassistant.components.recorder.util import session_scope
    from sqlalchemy import select

    meta = _models()["meta"]
    since = (datetime.now(UTC) - timedelta(days=days)).timestamp() if days else None
    items: list[dict[str, Any]] = []
    checked = 0
    with session_scope(hass=hass, read_only=True) as session:
        if statistic_ids is None:
            statistic_ids = list(
                session.execute(
                    select(meta.statistic_id)
                    .where(meta.source == "recorder")
                    .order_by(meta.statistic_id)
                    .limit(SCAN_IDS * 2)
                ).scalars()
            )
        for statistic_id in statistic_ids:
            data = _gather(session, statistic_id, since, max_span)
            kind = "counter"
            if data is None:
                data = _gather_measure(session, statistic_id, since, max_span)
                kind = "measurement"
            if data is None:
                continue
            checked += 1
            if data["findings"]:
                items.append(
                    {
                        "statistic_id": statistic_id,
                        "unit": data["unit"],
                        "kind": kind,
                        "findings": [
                            {**public_finding(f), "suggest": suggest_range(f)}
                            for f in data["findings"]
                        ],
                    }
                )
    return {"items": items, "checked": checked}


def series_blocking(
    hass: HomeAssistant, statistic_id: str, start: float, end: float
) -> dict[str, Any]:
    """Blocking: the readings of one sensor in a window, for the chart where a range is picked.

    Five-minute rows when the window is short and they exist, otherwise the hourly rows.
    """
    from homeassistant.components.recorder.util import session_scope

    with session_scope(hass=hass, read_only=True) as session:
        info = _meta_any(session, statistic_id)
        if info is None:
            return {"error": "no_range_statistics", "points": []}
        meta_id, unit, counter, _ = info
        key = "state" if counter else "mean"
        points: list[list[float]] = []
        table = "long_term"
        for table in ("short_term", "long_term"):
            if table == "short_term" and end - start > 10 * 86400:
                continue
            rows = _load_stats(session, table, meta_id, start - SLOT[table], not counter)
            points = [
                [r["ts"] + SLOT[table] / 2, r[key]]
                for r in rows
                if r.get(key) is not None and r["ts"] <= end
            ]
            if len(points) >= 10:
                break
    step = max(1, len(points) // SERIES_POINTS)
    return {
        "error": None,
        "kind": "counter" if counter else "measurement",
        "unit": unit,
        "table": table,
        "points": points[::step],
    }


def prepare_blocking(
    hass: HomeAssistant,
    statistic_id: str,
    mode: str,
    max_span: float,
    rng: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Blocking: what a repair of this counter would change, without writing anything."""
    from homeassistant.components.recorder.util import session_scope

    with session_scope(hass=hass, read_only=True) as session:
        if rng:
            return _prepare_range(session, statistic_id, mode, rng)[0]
        return _prepare(session, statistic_id, mode, max_span)[0]


def _prepare(
    session: Any, statistic_id: str, mode: str, max_span: float
) -> tuple[dict[str, Any], dict[str, Any] | None]:
    data = _gather(session, statistic_id, None, max_span)
    if data is None:
        return {"error": "no_counter_statistics", "findings": []}, None
    findings = data["findings"]
    if not findings:
        return {"error": "nothing_found", "findings": [], "unit": data["unit"]}, None
    state_rows = _load_states(
        session,
        statistic_id,
        min(f["start"] for f in findings),
        max(f["end"] for f in findings),
    )
    changes = build_changes(findings, data["short"], data["long"], state_rows, mode)
    total = sum(changes["counts"][t] for t in ("states", "short_term", "long_term"))
    result: dict[str, Any] = {
        "findings": [
            {
                **public_finding(f),
                "series": preview_series(f, data["short"], data["long"], mode),
            }
            for f in findings
        ],
        "counts": changes["counts"],
        "skipped": {
            t: changes[t]["skipped"] for t in ("short_term", "long_term") if changes[t]["skipped"]
        },
        "unit": data["unit"],
        "mode": mode,
        "fingerprint": fingerprint(findings, changes["counts"], mode),
        "error": "too_many_rows" if total > MAX_ROWS else None,
    }
    return result, {**data, "changes": changes}


def apply_blocking(
    instance: Any,
    statistic_id: str,
    mode: str,
    max_span: float,
    expected: str,
    rng: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """In the recorder thread: check the preview still holds, write, read back, return the undo."""
    from homeassistant.components.recorder.util import session_scope
    from sqlalchemy import select, update

    models = _models()
    with session_scope(session=instance.get_session()) as session:
        if rng:
            preview, data = _prepare_range(session, statistic_id, mode, rng)
        else:
            preview, data = _prepare(session, statistic_id, mode, max_span)
        if data is None or preview.get("error"):
            return {"error": preview.get("error") or "nothing_found"}
        if preview["fingerprint"] != expected:
            return {"error": "counter_changed"}
        changes, meta_id = data["changes"], data["meta_id"]
        written: dict[str, Any] = {"statistic_id": statistic_id, "mode": mode, "tables": {}}
        for table in ("short_term", "long_term"):
            model = models[table]
            block = changes[table]
            for tail in block["tails"]:
                session.execute(
                    update(model)
                    .where(
                        model.metadata_id == meta_id,
                        model.start_ts >= tail["from"],
                        model.sum.is_not(None),
                    )
                    .values(sum=model.sum - tail["offset"])
                )
            if block["rows"]:
                session.execute(
                    update(model),
                    [
                        {"id": row["id"], **dict(zip(block["cols"], row["new"], strict=True))}
                        for row in block["rows"]
                    ],
                )
            session.flush()
            written["tables"][table] = {
                "cols": block["cols"],
                "rows": block["rows"],
                "tails": [
                    {
                        **tail,
                        "after": session.execute(
                            select(model.sum).where(model.id == tail["probe"])
                        ).scalar(),
                    }
                    for tail in block["tails"]
                ],
            }
        if changes["states"]:
            session.execute(
                update(models["states"]),
                [{"state_id": row["id"], "state": row["new"]} for row in changes["states"]],
            )
        written["states"] = changes["states"]
        # Read it back before committing: what the series says now must be clean.
        if rng:
            session.flush()
            clean = (
                _prepare_range(session, statistic_id, mode, rng)[0].get("error") == "nothing_found"
            )
        else:
            after = _gather(session, statistic_id, None, max_span)
            clean = after is not None and not after["findings"]
        if not clean:
            session.rollback()
            return {"error": "verify_failed"}
        written["counts"] = changes["counts"]
        written["fingerprint"] = expected
    return written


def undo_blocking(instance: Any, written: dict[str, Any]) -> str:
    """In the recorder thread: put the old values back, row by row, where the row is still as left.

    A row somebody changed afterwards is not touched. ``written`` loses what was put back, so a
    second try only sees the rest. Result: ``undone``, ``conflict_partial`` (some rows put back,
    some changed since), ``conflict_changed`` (nothing could be put back) or ``conflict_gone``.
    """
    from homeassistant.components.recorder.util import session_scope
    from sqlalchemy import select, update

    models = _models()
    restored = skipped = 0
    remaining: dict[str, Any] = {"tables": {}}
    with session_scope(session=instance.get_session()) as session:
        meta = _meta_any(session, written["statistic_id"])
        if meta is None:
            return "conflict_gone"
        for table in ("short_term", "long_term"):
            model = models[table]
            block = written["tables"].get(table) or {}
            cols = block.get("cols") or ["state", "sum"]
            rows = block.get("rows", [])
            current = {}
            if rows:
                current = {
                    r[0]: tuple(r[1:])
                    for r in session.execute(
                        select(model.id, *[getattr(model, c) for c in cols]).where(
                            model.id.in_([row["id"] for row in rows])
                        )
                    ).all()
                }
            fine = [
                row
                for row in rows
                if (now := current.get(row["id"])) is not None
                and all(_same(a, b) for a, b in zip(now, row["new"], strict=True))
            ]
            kept = [row for row in rows if row not in fine]
            tails_fine, tails_kept = [], []
            for tail in block.get("tails", []):
                probe = session.execute(select(model.sum).where(model.id == tail["probe"])).scalar()
                (
                    tails_fine if probe is not None and _same(probe, tail["after"]) else tails_kept
                ).append(tail)
            for tail in tails_fine:
                session.execute(
                    update(model)
                    .where(
                        model.metadata_id == meta[0],
                        model.start_ts >= tail["from"],
                        model.sum.is_not(None),
                    )
                    .values(sum=model.sum + tail["offset"])
                )
            if fine:
                session.execute(
                    update(model),
                    [{"id": row["id"], **dict(zip(cols, row["old"], strict=True))} for row in fine],
                )
            restored += len(fine) + len(tails_fine)
            skipped += len(kept) + len(tails_kept)
            remaining["tables"][table] = {"cols": cols, "rows": kept, "tails": tails_kept}
        states = written.get("states") or []
        fine_states, kept_states = [], []
        if states:
            model = models["states"]
            current_states = {
                r.state_id: r.state
                for r in session.execute(
                    select(model.state_id, model.state).where(
                        model.state_id.in_([row["id"] for row in states])
                    )
                ).all()
            }
            for row in states:
                (
                    fine_states if current_states.get(row["id"]) == row["new"] else kept_states
                ).append(row)
            if fine_states:
                session.execute(
                    update(model),
                    [{"state_id": row["id"], "state": row["old"]} for row in fine_states],
                )
        restored += len(fine_states)
        skipped += len(kept_states)
        remaining["states"] = kept_states
    written["tables"] = remaining["tables"]
    written["states"] = remaining["states"]
    if not skipped:
        return "undone"
    return "conflict_partial" if restored else "conflict_changed"


def _same(a: float | None, b: float | None) -> bool:
    if a is None or b is None:
        return a is b
    return abs(a - b) <= max(1e-6, 1e-9 * max(abs(a), abs(b)))


async def run_in_recorder(hass: HomeAssistant, work: Callable[[Any], Any]) -> Any:
    """Run ``work(instance)`` as a recorder task and wait for its result."""
    import asyncio
    from dataclasses import dataclass

    from homeassistant.components.recorder import get_instance
    from homeassistant.components.recorder.tasks import RecorderTask

    instance = get_instance(hass)
    future: asyncio.Future[Any] = hass.loop.create_future()

    def finish(value: Any, error: BaseException | None) -> None:
        if future.done():
            return
        if error is not None:
            future.set_exception(error)
        else:
            future.set_result(value)

    @dataclass(slots=True)
    class RepairTask(RecorderTask):
        def run(self, instance: Any) -> None:  # runs in the recorder thread
            try:
                value = work(instance)
            except BaseException as err:  # noqa: BLE001 - handed to the waiting coroutine
                hass.loop.call_soon_threadsafe(finish, None, err)
            else:
                hass.loop.call_soon_threadsafe(finish, value, None)

    instance.queue_task(RepairTask())
    try:
        return await future
    finally:
        await instance.async_block_till_done()


async def prepare(
    hass: HomeAssistant,
    statistic_id: str,
    mode: str = "hold",
    max_span: float = MAX_SPAN,
    rng: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """What a repair of this counter would change; ``error`` says why it cannot run.

    With ``rng`` (``from``, ``to``, optionally ``fixed``) the range is cleaned that the person
    picked, for a counter or a measurement, instead of what the detection found.
    """
    from homeassistant.components.recorder import get_instance

    if mode not in (RANGE_MODES if rng else MODES):
        return {"error": "nothing_to_do", "findings": []}
    if not schema_ok():
        return {"error": "schema_unknown", "findings": []}
    return await get_instance(hass).async_add_executor_job(
        prepare_blocking, hass, statistic_id, mode, max_span, rng
    )


async def series(
    hass: HomeAssistant, statistic_id: str, start: float, end: float
) -> dict[str, Any]:
    from homeassistant.components.recorder import get_instance

    if not schema_ok():
        return {"error": "schema_unknown", "points": []}
    return await get_instance(hass).async_add_executor_job(
        series_blocking, hass, statistic_id, start, end
    )


async def apply(
    hass: HomeAssistant,
    statistic_id: str,
    mode: str,
    expected: str,
    max_span: float = MAX_SPAN,
    rng: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Write the repair in the recorder thread; ``error`` is set when nothing was written."""
    if not schema_ok():
        return {"error": "schema_unknown"}
    return await run_in_recorder(
        hass,
        lambda instance: apply_blocking(instance, statistic_id, mode, max_span, expected, rng),
    )


async def undo(hass: HomeAssistant, written: dict[str, Any]) -> str:
    if not schema_ok():
        return "conflict_unrestorable"
    return await run_in_recorder(hass, lambda instance: undo_blocking(instance, written))
