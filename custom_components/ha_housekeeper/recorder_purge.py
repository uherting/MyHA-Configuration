"""Delete the recorder data of statistic IDs that were judged as orphaned.

Used by the plan action ``purge_statistics``, which judges, backs up and verifies. This module only
deletes the statistics (long-term and short-term) and optionally the recorded states, under the
shared recorder query lock.
"""

from __future__ import annotations

import asyncio
from typing import Any

from homeassistant.core import HomeAssistant

from .const import DOMAIN

MAX_IDS = 50
QUERY_WAIT = 30  # seconds to wait for a running recorder query before giving up
PURGE_WAIT = 600  # seconds one purge_entities may take for all its batches


async def _settle(instance: Any, remaining: Any) -> int | None:
    """Wait until ``purge_entities`` has deleted everything; returns the rows still left.

    The recorder deletes in batches of a few thousand rows and queues the next batch behind
    whoever waits, so one ``async_block_till_done`` only covers the first batch. Each round waits
    for one more and counts again (``remaining`` is an async count, None when it cannot count). It
    stops when nothing is left, when a round deletes nothing or after ``PURGE_WAIT`` seconds.
    """
    left: int | None = None
    try:
        async with asyncio.timeout(PURGE_WAIT):
            while True:
                await instance.async_block_till_done()
                now = await remaining()
                if not now or now == left:
                    return now
                left = now
    except TimeoutError:
        return left


async def statistics_left(hass: HomeAssistant, statistic_ids: list[str]) -> set[str]:
    """The statistic IDs among ``statistic_ids`` that the recorder still knows."""
    from homeassistant.components.recorder import get_instance
    from homeassistant.components.recorder.statistics import get_metadata

    wanted = set(statistic_ids)
    return await get_instance(hass).async_add_executor_job(
        lambda: set(get_metadata(hass, statistic_ids=wanted))
    )


async def delete_statistics(
    hass: HomeAssistant, statistic_ids: list[str], *, states: bool
) -> tuple[list[str], list[dict[str, str]], str | None]:
    """Delete the statistics (and optionally the states) of IDs already judged as orphaned.

    Waits up to ``QUERY_WAIT`` seconds for the shared recorder query lock and holds it while it
    deletes, so no slow query reads the tables in between. Returns the IDs gone, the IDs still
    there, and ``recorder_busy`` when the lock stayed taken (nothing was deleted then).
    """
    from homeassistant.components.recorder import get_instance

    store = hass.data.setdefault(DOMAIN, {})
    lock: asyncio.Lock = store.setdefault("reliability_lock", asyncio.Lock())
    try:
        async with asyncio.timeout(QUERY_WAIT):
            await lock.acquire()
    except TimeoutError:
        return [], [], "recorder_busy"
    try:
        instance = get_instance(hass)
        instance.async_clear_statistics(statistic_ids)
        await instance.async_block_till_done()
        states_left: dict[str, dict[str, Any]] = {}
        if states:
            await hass.services.async_call(
                "recorder", "purge_entities", {"entity_id": statistic_ids}, blocking=True
            )

            async def remaining() -> int | None:
                nonlocal states_left
                # keep_days 0: every state row of these IDs counts
                found = await count_older(hass, statistic_ids, 0, locked=True)
                states_left = found or {}
                return None if found is None else sum(v["rows"] for v in found.values())

            await _settle(instance, remaining)
        left = await statistics_left(hass, statistic_ids)
    finally:
        lock.release()
    removed = [sid for sid in statistic_ids if sid not in left]
    if removed:
        store.get("query_cache", {}).clear()  # cost and statistics answers are out of date now
    return (
        removed,
        [{"id": sid, "reason": "still_there"} for sid in statistic_ids if sid in left]
        + [
            {"id": sid, "reason": "states_left"}
            for sid in statistic_ids
            if sid not in left and (states_left.get(sid) or {}).get("rows")
        ],
        None,
    )


HISTORY_IDS = 500  # IDs counted in one plan; the rest are simply not counted


def _count_history(hass: HomeAssistant, ids: list[str]) -> dict[str, dict[str, int]]:
    """Blocking: state rows and statistics rows (long and short term) per entity or statistic ID."""
    from homeassistant.components.recorder.db_schema import (
        States,
        StatesMeta,
        Statistics,
        StatisticsMeta,
        StatisticsShortTerm,
    )
    from homeassistant.components.recorder.util import session_scope
    from sqlalchemy import func, select

    rows = {i: {"states": 0, "statistics": 0} for i in ids}
    with session_scope(hass=hass, read_only=True) as session:
        for entity_id, count in session.execute(
            select(StatesMeta.entity_id, func.count(States.state_id))
            .join(StatesMeta, States.metadata_id == StatesMeta.metadata_id)
            .where(StatesMeta.entity_id.in_(ids))
            .group_by(StatesMeta.entity_id)
        ).all():
            rows[entity_id]["states"] = int(count)
        for table in (Statistics, StatisticsShortTerm):
            for statistic_id, count in session.execute(
                select(StatisticsMeta.statistic_id, func.count(table.id))
                .join(StatisticsMeta, table.metadata_id == StatisticsMeta.id)
                .where(StatisticsMeta.statistic_id.in_(ids))
                .group_by(StatisticsMeta.statistic_id)
            ).all():
                rows[statistic_id]["statistics"] += int(count)
    return rows


async def count_history(hass: HomeAssistant, ids: list[str]) -> dict[str, dict[str, int]] | None:
    """Exact row counts the recorder holds for ``ids``; None when they cannot be counted."""
    from homeassistant.components.recorder import get_instance

    wanted = list(dict.fromkeys(ids))[:HISTORY_IDS]
    if not wanted:
        return {}
    try:
        return await get_instance(hass).async_add_executor_job(_count_history, hass, wanted)
    except Exception:  # noqa: BLE001 - the plan is complete without the numbers
        return None


TRIM_MAX_DAYS = 3650
TRIM_IDS = 200


def _count_older(hass: HomeAssistant, ids: list[str], keep_days: int) -> dict[str, dict[str, Any]]:
    """Blocking: state rows older than ``keep_days`` days per entity, with the oldest time."""
    from datetime import UTC, datetime, timedelta

    from homeassistant.components.recorder.db_schema import States, StatesMeta
    from homeassistant.components.recorder.util import session_scope
    from sqlalchemy import func, select

    cutoff = (datetime.now(UTC) - timedelta(days=keep_days)).timestamp()
    found: dict[str, dict[str, Any]] = {i: {"rows": 0, "oldest": None} for i in ids}
    with session_scope(hass=hass, read_only=True) as session:
        for entity_id, rows, oldest in session.execute(
            select(
                StatesMeta.entity_id, func.count(States.state_id), func.min(States.last_updated_ts)
            )
            .join(StatesMeta, States.metadata_id == StatesMeta.metadata_id)
            .where(StatesMeta.entity_id.in_(ids), States.last_updated_ts < cutoff)
            .group_by(StatesMeta.entity_id)
        ).all():
            found[entity_id] = {"rows": int(rows), "oldest": float(oldest)}
    return found


async def count_older(
    hass: HomeAssistant, ids: list[str], keep_days: int, *, locked: bool = False
) -> dict[str, dict[str, Any]] | None:
    """State rows that ``trim_history`` would delete; None when they cannot be counted.

    Takes the shared recorder query lock like every slow query (``locked`` when the caller holds
    it already); a lock that stays taken for ``QUERY_WAIT`` seconds counts as "cannot count".
    """
    from homeassistant.components.recorder import get_instance

    wanted = list(dict.fromkeys(ids))[:TRIM_IDS]
    if not wanted:
        return {}
    lock: asyncio.Lock = hass.data.setdefault(DOMAIN, {}).setdefault(
        "reliability_lock", asyncio.Lock()
    )
    if not locked:
        try:
            async with asyncio.timeout(QUERY_WAIT):
                await lock.acquire()
        except TimeoutError:
            return None
    try:
        return await get_instance(hass).async_add_executor_job(
            _count_older, hass, wanted, keep_days
        )
    except Exception:  # noqa: BLE001 - without the count the plan cannot judge, it says so
        return None
    finally:
        if not locked:
            lock.release()


async def trim_states(
    hass: HomeAssistant, entity_id: str, keep_days: int
) -> tuple[int | None, str | None]:
    """Delete the state rows of one entity older than ``keep_days`` days; statistics stay.

    Holds the shared recorder query lock until the recorder has deleted every batch. Returns the
    rows left that are still too old (None when they cannot be counted) and ``recorder_busy`` when
    the lock stayed taken (nothing was deleted).
    """
    from homeassistant.components.recorder import get_instance

    store = hass.data.setdefault(DOMAIN, {})
    lock: asyncio.Lock = store.setdefault("reliability_lock", asyncio.Lock())
    try:
        async with asyncio.timeout(QUERY_WAIT):
            await lock.acquire()
    except TimeoutError:
        return None, "recorder_busy"
    try:
        await hass.services.async_call(
            "recorder",
            "purge_entities",
            {"entity_id": [entity_id], "keep_days": keep_days},
            blocking=True,
        )

        async def remaining() -> int | None:
            found = await count_older(hass, [entity_id], keep_days, locked=True)
            return None if found is None else found[entity_id]["rows"]

        left = await _settle(get_instance(hass), remaining)
    finally:
        lock.release()
    store.get("query_cache", {}).clear()
    return left, None


# -- trimming beyond "states older than X days": statistics, and a stretch of states ----------

TRIM_TABLES = ("states", "short_term", "long_term")
DELETE_BATCH = 2000  # state rows deleted per round of a range


def _trim_window(
    keep_days: int | None, rng: dict[str, Any] | None
) -> tuple[float | None, float | None]:
    """The half-open window ``[start, end)`` in epoch seconds a trim removes (start None: none)."""
    from datetime import UTC, datetime, timedelta

    if rng:
        return float(rng["from"]), float(rng["to"])
    cutoff = (datetime.now(UTC) - timedelta(days=keep_days or 0)).timestamp()
    return None, cutoff


def _count_trim(
    hass: HomeAssistant,
    entity_id: str,
    keep_days: int | None,
    rng: dict[str, Any] | None,
    tables: list[str],
) -> dict[str, dict[str, Any]]:
    """Blocking: rows each chosen table would lose, with the oldest and the newest time."""
    from homeassistant.components.recorder.db_schema import (
        States,
        StatesMeta,
        Statistics,
        StatisticsMeta,
        StatisticsShortTerm,
    )
    from homeassistant.components.recorder.util import session_scope
    from sqlalchemy import func, select

    start, end = _trim_window(keep_days, rng)
    found: dict[str, dict[str, Any]] = {
        t: {"rows": 0, "oldest": None, "newest": None} for t in tables
    }
    with session_scope(hass=hass, read_only=True) as session:
        if "states" in found:
            meta = session.execute(
                select(StatesMeta.metadata_id).where(StatesMeta.entity_id == entity_id)
            ).scalar()
            if meta is not None:
                where = [States.metadata_id == meta, States.last_updated_ts < end]
                if start is not None:
                    where.append(States.last_updated_ts >= start)
                rows, oldest, newest = session.execute(
                    select(
                        func.count(States.state_id),
                        func.min(States.last_updated_ts),
                        func.max(States.last_updated_ts),
                    ).where(*where)
                ).one()
                found["states"] = {
                    "rows": int(rows or 0),
                    "oldest": None if oldest is None else float(oldest),
                    "newest": None if newest is None else float(newest),
                }
        stat_meta = session.execute(
            select(StatisticsMeta.id).where(
                StatisticsMeta.statistic_id == entity_id, StatisticsMeta.source == "recorder"
            )
        ).scalar()
        for name, model in (("short_term", StatisticsShortTerm), ("long_term", Statistics)):
            if name not in found or stat_meta is None:
                continue
            rows, oldest, newest = session.execute(
                select(
                    func.count(model.id), func.min(model.start_ts), func.max(model.start_ts)
                ).where(model.metadata_id == stat_meta, model.start_ts < end)
            ).one()
            found[name] = {
                "rows": int(rows or 0),
                "oldest": None if oldest is None else float(oldest),
                "newest": None if newest is None else float(newest),
            }
    return found


async def count_trim(
    hass: HomeAssistant,
    entity_id: str,
    keep_days: int | None,
    rng: dict[str, Any] | None,
    tables: list[str],
    *,
    locked: bool = False,
) -> dict[str, Any] | None:
    """What a trim of ``tables`` would delete: ``{"rows", "oldest", "tables": {...}}``.

    ``rows`` is the sum over the chosen tables and ``oldest`` the earliest time among them. None
    when it cannot be counted (lock taken for ``QUERY_WAIT`` seconds, recorder not ready).
    """
    from homeassistant.components.recorder import get_instance

    lock: asyncio.Lock = hass.data.setdefault(DOMAIN, {}).setdefault(
        "reliability_lock", asyncio.Lock()
    )
    if not locked:
        try:
            async with asyncio.timeout(QUERY_WAIT):
                await lock.acquire()
        except TimeoutError:
            return None
    try:
        per_table = await get_instance(hass).async_add_executor_job(
            _count_trim, hass, entity_id, keep_days, rng, list(tables)
        )
    except Exception:  # noqa: BLE001 - without the count the plan cannot judge, it says so
        return None
    finally:
        if not locked:
            lock.release()
    oldest = [v["oldest"] for v in per_table.values() if v["oldest"] is not None]
    return {
        "rows": sum(v["rows"] for v in per_table.values()),
        "oldest": min(oldest) if oldest else None,
        "tables": per_table,
    }


def _delete_trim(
    instance: Any,
    entity_id: str,
    keep_days: int | None,
    rng: dict[str, Any] | None,
    tables: list[str],
) -> dict[str, int]:
    """In the recorder thread: delete the rows of the chosen tables; returns rows deleted per table.

    A stretch of states first lets the rows that point at it (``old_state_id``) forget it, as the
    recorder's own purge does, then deletes in batches so no transaction grows without bound.
    """
    from homeassistant.components.recorder.db_schema import (
        States,
        StatesMeta,
        Statistics,
        StatisticsMeta,
        StatisticsShortTerm,
    )
    from homeassistant.components.recorder.util import session_scope
    from sqlalchemy import delete, select, update

    start, end = _trim_window(keep_days, rng)
    deleted = dict.fromkeys(tables, 0)
    with session_scope(session=instance.get_session()) as session:
        stat_meta = session.execute(
            select(StatisticsMeta.id).where(
                StatisticsMeta.statistic_id == entity_id, StatisticsMeta.source == "recorder"
            )
        ).scalar()
        for name, model in (("short_term", StatisticsShortTerm), ("long_term", Statistics)):
            if name in deleted and stat_meta is not None:
                result = session.execute(
                    delete(model).where(model.metadata_id == stat_meta, model.start_ts < end)
                )
                deleted[name] = int(result.rowcount or 0)
        meta = session.execute(
            select(StatesMeta.metadata_id).where(StatesMeta.entity_id == entity_id)
        ).scalar()
        if "states" in deleted and meta is not None:
            where = [States.metadata_id == meta, States.last_updated_ts < end]
            if start is not None:
                where.append(States.last_updated_ts >= start)
            while True:
                ids = list(
                    session.execute(
                        select(States.state_id).where(*where).limit(DELETE_BATCH)
                    ).scalars()
                )
                if not ids:
                    break
                session.execute(
                    update(States).where(States.old_state_id.in_(ids)).values(old_state_id=None)
                )
                session.execute(delete(States).where(States.state_id.in_(ids)))
                deleted["states"] += len(ids)
                session.commit()
    return deleted


async def trim_extra(
    hass: HomeAssistant,
    entity_id: str,
    keep_days: int | None,
    rng: dict[str, Any] | None,
    tables: list[str],
) -> tuple[dict[str, int] | None, str | None]:
    """Delete statistics older than ``keep_days`` and/or a stretch of states, as a recorder task.

    Returns the rows deleted per table and ``recorder_busy`` when the shared recorder query lock
    stayed taken (nothing was deleted then).
    """
    from .counter_repair import run_in_recorder

    store = hass.data.setdefault(DOMAIN, {})
    lock: asyncio.Lock = store.setdefault("reliability_lock", asyncio.Lock())
    try:
        async with asyncio.timeout(QUERY_WAIT):
            await lock.acquire()
    except TimeoutError:
        return None, "recorder_busy"
    try:
        deleted = await run_in_recorder(
            hass, lambda instance: _delete_trim(instance, entity_id, keep_days, rng, tables)
        )
    finally:
        lock.release()
    store.get("query_cache", {}).clear()
    return deleted, None
