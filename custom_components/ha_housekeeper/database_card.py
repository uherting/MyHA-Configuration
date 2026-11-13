"""What the dashboard card "database" shows: how big the database is, whether it grows and what the recorder keeps.

The simple variant: everything comes from what each scan reads anyway (the sizes of the files and the daily sizes
Housekeeper has noted), never from a query of the recorder tables, so a scan pays nothing for it. Which entities write
the most is on the database page of the panel. "Grows fast" and "journal large" are the rules of that page.
"""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any, Final

from .db_health import (
    GROWTH_FACTOR,
    GROWTH_MIN_BYTES,
    WAL_BYTES,
    WAL_SHARE,
    growth,
)

HISTORY_MAX: Final = 90  # daily sizes in the line
CHANGE_DAYS: Final = 30  # the change the card names is that of the last month, or of what is known


def database_view(
    database: dict[str, Any] | None, sizes: dict[str, int], today: date
) -> dict[str, Any]:
    """The size (files and journal), the change of the last month, the line of daily sizes and the two hints.

    ``database`` is what a scan keeps in ``meta.database``; without a recorder or a size the answer is empty.
    """
    if not database or database.get("db_bytes") is None:
        return {}
    db = int(database["db_bytes"])
    wal = database.get("wal_bytes")
    ordered = sorted((day, int(size)) for day, size in sizes.items())[-HISTORY_MAX:]
    grown = growth(sizes, today)
    fast = bool(
        grown.get("known")
        and grown["recent_bytes"] >= GROWTH_MIN_BYTES
        and grown.get("base_bytes") is not None
        and grown["recent_bytes"] >= GROWTH_FACTOR * max(grown["base_bytes"], 1)
    )
    change_bytes = change_days = None
    if len(ordered) >= 2:
        last_day = date.fromisoformat(ordered[-1][0])
        wanted = (last_day - timedelta(days=CHANGE_DAYS)).isoformat()
        base = next((item for item in ordered if item[0] >= wanted), ordered[0])
        change_bytes = ordered[-1][1] - base[1]
        change_days = (last_day - date.fromisoformat(base[0])).days
    return {
        "state": db + int(wal or 0),
        "wal_bytes": None if wal is None else int(wal),
        "wal_large": bool(db and wal is not None and (wal >= WAL_BYTES or wal >= WAL_SHARE * db)),
        "growing_fast": fast,
        "per_day": grown.get("per_day") if grown.get("known") else None,
        "change_bytes": change_bytes,
        "change_days": change_days,
        "history": [size for _, size in ordered],
        "keep_days": database.get("keep_days"),
        "dialect": database.get("dialect") or None,
        "estimated": bool(database.get("estimated")),
    }
