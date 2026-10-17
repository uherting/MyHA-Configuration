"""When a statistic last received a value: one grouped read of the long-term statistics.

Only reads. The query runs when the list of orphaned statistics or the details of an entity are
opened, never during a scan, and shares cache and lock with the other recorder queries.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant

from .meter import recorder_ready
from .payloads import StatisticsLastResult
from .queries import cached_query

CACHE_SECONDS = 600


def query_last(hass: HomeAssistant) -> dict[str, float]:
    """Blocking: the start of the newest hourly row of every recorder statistic."""
    from homeassistant.components.recorder.db_schema import Statistics, StatisticsMeta
    from homeassistant.components.recorder.util import session_scope
    from sqlalchemy import func, select

    with session_scope(hass=hass, read_only=True) as session:
        latest = (
            select(Statistics.metadata_id, func.max(Statistics.start_ts).label("last"))
            .group_by(Statistics.metadata_id)
            .subquery()
        )
        rows = session.execute(
            select(StatisticsMeta.statistic_id, latest.c.last)
            .join(latest, latest.c.metadata_id == StatisticsMeta.id)
            .where(StatisticsMeta.source == "recorder")
        ).all()
    return {statistic_id: float(last) for statistic_id, last in rows if last is not None}


def query_span(hass: HomeAssistant) -> dict[str, tuple[float, int]]:
    """Blocking: the start of the oldest hourly row and the number of hourly rows per recorder statistic."""
    from homeassistant.components.recorder.db_schema import Statistics, StatisticsMeta
    from homeassistant.components.recorder.util import session_scope
    from sqlalchemy import func, select

    with session_scope(hass=hass, read_only=True) as session:
        span = (
            select(
                Statistics.metadata_id,
                func.min(Statistics.start_ts).label("first"),
                func.count(Statistics.id).label("rows"),
            )
            .group_by(Statistics.metadata_id)
            .subquery()
        )
        rows = session.execute(
            select(StatisticsMeta.statistic_id, span.c.first, span.c.rows)
            .join(span, span.c.metadata_id == StatisticsMeta.id)
            .where(StatisticsMeta.source == "recorder")
        ).all()
    return {sid: (float(first), int(count)) for sid, first, count in rows if first is not None}


async def statistics_last(
    hass: HomeAssistant,
    snapshot: dict[str, Any],
    ids: list[str] | None = None,
    *,
    refresh: bool = False,
) -> StatisticsLastResult:
    """Last and first hourly value per statistic (epoch seconds, ``None`` when it has no row) and the number of hourly rows.

    Without ``ids`` the orphaned statistics of the snapshot are answered.
    """
    if not recorder_ready(hass):
        return {"available": False, "busy": False, "last": {}, "first": {}, "rows": {}}
    found = await cached_query(
        hass, "statistics_last", CACHE_SECONDS, lambda: query_last(hass), refresh=refresh
    )
    spans = await cached_query(
        hass, "statistics_span", CACHE_SECONDS, lambda: query_span(hass), refresh=refresh
    )
    if found.busy or spans.busy:
        return {"available": True, "busy": True, "last": {}, "first": {}, "rows": {}}
    if ids is None:
        ids = [item["statistic_id"] for item in snapshot.get("orphaned_statistics", [])]
    return {
        "available": True,
        "busy": False,
        "last": {statistic_id: found.raw.get(statistic_id) for statistic_id in ids},
        "first": {
            statistic_id: (spans.raw.get(statistic_id) or (None, 0))[0] for statistic_id in ids
        },
        "rows": {
            statistic_id: (spans.raw.get(statistic_id) or (None, 0))[1] for statistic_id in ids
        },
    }
