"""What the dashboard card "start time" shows: how long the last start took against the usual, and who held it up.

The figures are the ones of the start page in the panel (``start_times``): the time from the start of the process to
"started", and the rule for "slower than usual" is the same, a start that took more than a quarter longer than the mean
of the starts before it.
"""

from __future__ import annotations

from typing import Any, Final

HISTORY_MAX: Final = 30  # starts in the strip
SLOWEST_MAX: Final = 10  # integrations named
SLOWER_FACTOR: Final = 1.25  # as on the start page of the panel
SLOWER_MIN_STARTS: Final = 2  # starts before the last one that say what is usual


def start_view(starts: list[dict[str, Any]]) -> dict[str, Any]:
    """The last start, what is usual, the strip of the last starts and the slowest integrations of the last one.

    ``starts`` is the list of the store, oldest first. Without a start the answer is empty.
    """
    timed = [s for s in starts if isinstance(s.get("boot_s"), int | float)]
    if not timed:
        return {}
    last = timed[-1]
    seconds = float(last["boot_s"])
    before = [float(s["boot_s"]) for s in timed[:-1]]
    usual = sum(before) / len(before) if before else None
    slower = (
        len(before) >= SLOWER_MIN_STARTS and usual is not None and seconds > usual * SLOWER_FACTOR
    )
    slowest = [
        {
            "name": item.get("title") or item.get("domain") or "",
            "seconds": float(item["seconds"]),
            "state": item.get("state") or "loaded",
        }
        for item in last.get("items") or []
        if isinstance(item.get("seconds"), int | float)
        and (item["seconds"] >= 1 or item.get("state") not in (None, "loaded", "not_loaded"))
    ]
    return {
        "state": round(seconds, 1),
        "started_at": last["at"],
        "update": bool(last.get("update")),
        "usual_seconds": None if usual is None else round(usual, 1),
        "change_percent": None if not usual else round((seconds / usual - 1) * 100),
        "slower": slower,
        "history": [round(float(s["boot_s"]), 1) for s in timed[-HISTORY_MAX:]],
        "slowest": slowest[:SLOWEST_MAX],
    }
