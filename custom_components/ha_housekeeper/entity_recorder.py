"""What the recorder holds for one entity: raw states, short-term and long-term statistics.

Only reads. The counts run when the user asks on the details page, never during a scan, and share
cache and lock with the other recorder queries. Every table is read through its metadata id.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant

from .db_health import recorder_retention
from .meter import recorder_ready
from .queries import cached_query

CACHE_SECONDS = 120


def query_entity(hass: HomeAssistant, entity_id: str) -> dict[str, Any]:
    """Blocking: rows, first and last time (epoch seconds) per table for one entity."""
    from homeassistant.components.recorder.db_schema import (
        States,
        StatesMeta,
        Statistics,
        StatisticsMeta,
        StatisticsShortTerm,
    )
    from homeassistant.components.recorder.util import session_scope
    from sqlalchemy import func, select

    def span(rows: int | None, first: float | None, last: float | None) -> dict[str, Any]:
        return {
            "rows": int(rows or 0),
            "first": float(first) if first is not None else None,
            "last": float(last) if last is not None else None,
        }

    with session_scope(hass=hass, read_only=True) as session:
        state_id = session.execute(
            select(StatesMeta.metadata_id).where(StatesMeta.entity_id == entity_id)
        ).scalar()
        states = span(0, None, None)
        if state_id is not None:
            states = span(
                *session.execute(
                    select(
                        func.count(States.state_id),
                        func.min(States.last_updated_ts),
                        func.max(States.last_updated_ts),
                    ).where(States.metadata_id == state_id)
                ).one()
            )
        stat_id = session.execute(
            select(StatisticsMeta.id).where(
                StatisticsMeta.statistic_id == entity_id, StatisticsMeta.source == "recorder"
            )
        ).scalar()
        short = long = span(0, None, None)
        if stat_id is not None:
            short, long = (
                span(
                    *session.execute(
                        select(func.count(t.id), func.min(t.start_ts), func.max(t.start_ts)).where(
                            t.metadata_id == stat_id
                        )
                    ).one()
                )
                for t in (StatisticsShortTerm, Statistics)
            )
    return {"states": states, "short": short, "long": long}


async def entity_recorder(hass: HomeAssistant, entity_id: str) -> dict[str, Any]:
    """The recorder contents of one entity, with the retention the recorder is set to."""
    if not recorder_ready(hass):
        return {"available": False, "busy": False}
    found = await cached_query(
        hass,
        f"entity_recorder:{entity_id}",
        CACHE_SECONDS,
        lambda: query_entity(hass, entity_id),
    )
    if found.busy:
        return {"available": True, "busy": True}
    return {
        "available": True,
        "busy": False,
        **found.raw,
        "keep_days": recorder_retention(hass)["keep_days"],
    }
