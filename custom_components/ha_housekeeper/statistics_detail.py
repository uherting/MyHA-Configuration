"""What the recorder still holds for one statistic, and what is known about where it came from.

Only reads. Runs when a row of the orphaned statistics is opened, never during a scan, and shares
cache and lock with the other recorder queries.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant

from .meter import recorder_ready
from .payloads import StatisticDetailResult
from .queries import cached_query

CACHE_SECONDS = 120


def _span(session: Any, table: Any, column: Any, where: Any) -> dict[str, Any]:
    from sqlalchemy import func, select

    count, first, last = session.execute(
        select(func.count(table.id), func.min(column), func.max(column)).where(where)
    ).one()
    return {
        "rows": int(count or 0),
        "first": float(first) if first is not None else None,
        "last": float(last) if last is not None else None,
    }


def query_detail(hass: HomeAssistant, statistic_id: str) -> dict[str, Any]:
    """Blocking: the statistics metadata and the rows in the three tables that carry this ID."""
    from homeassistant.components.recorder.db_schema import (
        States,
        StatesMeta,
        Statistics,
        StatisticsMeta,
        StatisticsShortTerm,
    )
    from homeassistant.components.recorder.util import session_scope
    from sqlalchemy import select

    empty = {"rows": 0, "first": None, "last": None}
    with session_scope(hass=hass, read_only=True) as session:
        meta_row = session.execute(
            select(StatisticsMeta).where(StatisticsMeta.statistic_id == statistic_id)
        ).scalar_one_or_none()
        meta = None
        tables = {"statistics": dict(empty), "short_term": dict(empty), "states": dict(empty)}
        if meta_row is not None:
            meta = {
                "source": meta_row.source,
                "unit": meta_row.unit_of_measurement,
                "unit_class": getattr(meta_row, "unit_class", None),
                "has_sum": bool(meta_row.has_sum),
                "has_mean": bool(
                    getattr(meta_row, "has_mean", None)
                    if getattr(meta_row, "has_mean", None) is not None
                    else getattr(meta_row, "mean_type", 0)
                ),
            }
            tables["statistics"] = _span(
                session, Statistics, Statistics.start_ts, Statistics.metadata_id == meta_row.id
            )
            tables["short_term"] = _span(
                session,
                StatisticsShortTerm,
                StatisticsShortTerm.start_ts,
                StatisticsShortTerm.metadata_id == meta_row.id,
            )
        state_meta = session.execute(
            select(StatesMeta.metadata_id).where(StatesMeta.entity_id == statistic_id)
        ).scalar_one_or_none()
        if state_meta is not None:
            tables["states"] = _span(
                session, States, States.last_updated_ts, States.metadata_id == state_meta
            )
    return {"meta": meta, "tables": tables}


def origin(hass: HomeAssistant, statistic_id: str) -> dict[str, Any]:
    """What the entity registry remembers of a removed entity: its integration and when it went."""
    from homeassistant.helpers import entity_registry as er

    for deleted in er.async_get(hass).deleted_entities.values():
        if deleted.entity_id != statistic_id:
            continue
        entry_id = getattr(deleted, "config_entry_id", None)
        gone = entry_id is not None and hass.config_entries.async_get_entry(entry_id) is None
        return {
            "kind": "integration_removed" if gone else "entity_removed",
            "platform": deleted.platform,
            "since": getattr(deleted, "orphaned_timestamp", None),
        }
    return {"kind": "unknown", "platform": None, "since": None}


async def statistic_detail(
    hass: HomeAssistant, statistic_id: str, *, refresh: bool = False
) -> StatisticDetailResult:
    """The metadata, the rows per table and the origin of one statistic."""
    if not recorder_ready(hass):
        return {"available": False, "busy": False, "meta": None, "tables": {}, "origin": {}}
    found = await cached_query(
        hass,
        f"statdetail:{statistic_id}",
        CACHE_SECONDS,
        lambda: query_detail(hass, statistic_id),
        refresh=refresh,
    )
    if found.busy:
        return {"available": True, "busy": True, "meta": None, "tables": {}, "origin": {}}
    return {
        "available": True,
        "busy": False,
        "meta": found.raw["meta"],
        "tables": found.raw["tables"],
        "origin": origin(hass, statistic_id),
    }
