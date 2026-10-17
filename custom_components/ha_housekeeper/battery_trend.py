"""When a battery will probably reach the low limit, from the daily means of its statistics.

Only the long-term statistics of working battery sensors are read (daily means over about a month),
never single states. The number is an estimate by a straight line through the days since the last
replacement (a jump up of 15 points or more) and is shown as such. With too few days, a flat or a
rising curve nothing is promised. Grouping puts batteries that run low within the same fortnight
together, so several changes can be done in one round.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

DAY = 86400.0
WINDOW_DAYS = 35
MIN_POINTS = 7
REPLACED_JUMP = 15.0  # a rise this big between two days means the battery was changed
FLAT = 0.03  # percent per day: a slower fall counts as stable
FAR = 90  # days: a line through five weeks says nothing about what is further away
GROUP_DAYS = 14
MAX_ROWS = 200
REPLACED_DAYS = 21  # a jump this recent is offered as a replacement


def estimate(
    points: list[tuple[float, float]],
    limit: float,
    jump: float = REPLACED_JUMP,
    flat: float = FLAT,
) -> dict[str, Any] | None:
    """``points`` are (time, daily mean) oldest first, in percent unless ``jump`` and ``flat`` are scaled.

    None when too little is known.
    """
    start = 0
    for index in range(1, len(points)):
        if points[index][1] - points[index - 1][1] >= jump:
            start = index
    points = points[start:]
    if len(points) < MIN_POINTS:
        return None
    xs = [(t - points[0][0]) / DAY for t, _ in points]
    ys = [v for _, v in points]
    n = len(points)
    mean_x, mean_y = sum(xs) / n, sum(ys) / n
    spread = sum((x - mean_x) ** 2 for x in xs)
    if spread == 0:
        return None
    slope = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys, strict=True)) / spread
    level = ys[-1]
    digits = 1 if jump >= 1 else 3
    base = {"level": round(level, digits), "slope": round(slope, 4), "points": n}
    if level <= limit:
        return {**base, "state": "low", "days_left": 0}
    if slope > -flat:
        return {**base, "state": "stable", "days_left": None}
    days = (level - limit) / -slope
    if days > FAR:
        return {**base, "state": "far", "days_left": None}
    return {**base, "state": "falling", "days_left": round(days)}


def detect_replacement(
    points: list[tuple[float, float]], now: datetime, jump: float = REPLACED_JUMP
) -> dict[str, Any] | None:
    """The latest rise of ``jump`` points or more between two daily means, when it is recent."""
    found = None
    for index in range(1, len(points)):
        if points[index][1] - points[index - 1][1] >= jump:
            found = (points[index][0], points[index - 1][1], points[index][1])
    if found is None:
        return None
    day = datetime.fromtimestamp(found[0], UTC).date()
    if (now.date() - day).days > REPLACED_DAYS:
        return None
    return {"day": day.isoformat(), "from": round(found[1]), "to": round(found[2])}


def build(
    series: dict[str, list[tuple[float, float]]],
    names: dict[str, str],
    limit: float,
    now: datetime | None = None,
) -> dict[str, Any]:
    """Rows with an estimate, soonest first, and the groups of batteries that run low together."""
    now = now or datetime.now(UTC)
    rows = []
    replaced = []
    for entity_id, points in series.items():
        change = detect_replacement(points, now)
        if change:
            replaced.append(
                {"entity_id": entity_id, "name": names.get(entity_id, entity_id), **change}
            )
        found = estimate(points, limit)
        if found is None:
            continue
        rows.append({"entity_id": entity_id, "name": names.get(entity_id, entity_id), **found})
    rows.sort(key=lambda r: (r["days_left"] is None, r["days_left"] or 0, r["name"]))
    groups: dict[int, list[str]] = {}
    for row in rows:
        if row["days_left"] is not None:
            groups.setdefault(row["days_left"] // GROUP_DAYS, []).append(row["entity_id"])
    return {
        "limit": limit,
        "rows": rows[:MAX_ROWS],
        "groups": [
            {
                "from_days": slot * GROUP_DAYS,
                "to_days": (slot + 1) * GROUP_DAYS - 1,
                "entity_ids": ids,
            }
            for slot, ids in sorted(groups.items())
        ],
        "unknown": len(series) - len(rows),
        "replaced": sorted(replaced, key=lambda r: (r["day"], r["entity_id"]), reverse=True),
        "computed_at": now.isoformat(),
    }


def read_series(
    hass: Any, entity_ids: list[str], start: float, end: float
) -> dict[str, list[tuple[float, float]]]:
    """Blocking (recorder executor): daily mean percent per entity."""
    from homeassistant.components.recorder.statistics import statistics_during_period

    raw = statistics_during_period(
        hass,
        datetime.fromtimestamp(start, UTC),
        datetime.fromtimestamp(end, UTC),
        set(entity_ids),
        "day",
        None,
        {"mean"},
    )
    result: dict[str, list[tuple[float, float]]] = {}
    for entity_id, rows in raw.items():
        points = [
            (float(row["start"]), float(row["mean"]))
            for row in rows
            if row.get("mean") is not None and row.get("start") is not None
        ]
        if points:
            result[entity_id] = sorted(points)
    return result
