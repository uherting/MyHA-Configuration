"""Which entities fill the states and their attributes, and which attributes of one entity do.

Only reads. The ranking over all entities runs when the user asks for it, in the background and in
small steps: first the ``states`` table by ranges of ``state_id``, then ``state_attributes`` by
ranges of ``attributes_id``. Every step takes the shared query lock on its own, so the other views
keep answering while it runs, and it can be stopped between two steps.

Home Assistant stores each combination of attributes once and the states point at it. So an entity
pays for each distinct attribute row it uses, not for every state; a row used by several entities is
split between them. No database tells what a single row costs on disk, so the measured lengths are
spread over the size the database reports for each table: an estimate whose sum is the table.

The breakdown of one entity reads only its own attribute rows (the newest ones up to a limit) and
cuts them into keys: how much each key takes, and how often its value changes. A key that changes
makes a new row each time, and that row carries every other key again.
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from dataclasses import dataclass, field
from typing import Any

from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .db_health import TABLES_SECONDS, TABLES_SECONDS_SERVER, database_files, table_sizes
from .meter import recorder_ready
from .queries import ReplyStore, cached_query

_LOGGER = logging.getLogger(__name__)
REPLY_KEY = "entity_space"
STEP_SECONDS = 2.0  # a step aims at this long; its range grows or shrinks to get there
PAUSE = 0.5  # seconds between two steps, so a view can take the lock
STATES_STEP = 200_000  # state ids of the first step
ATTRS_STEP = 20_000  # attribute ids of the first step
STATES_ROW_BYTES = (
    100  # what a state row costs besides its state text (ids, times, indexes): a rough weight
)
ATTRS_ROW_BYTES = 40  # and an attribute row besides its text (id, hash, index)
ENTITY_LIMIT = 500  # entities kept in the result
SHOWN_DURING_RUN = 20  # entities sent while the measurement runs
VARIANT_LIMIT = 2000  # attribute rows of one entity that are cut into keys
VARIANT_CHUNK = 200
KEY_LIMIT = 30
DRIVER_SHARE = 0.5  # a key whose value changes in this share of the rows drives new rows
ATTRS_CACHE_SECONDS = 300


@dataclass
class SpaceRun:
    """One measurement: where it stands and what it has counted so far."""

    started: float
    tables: dict[str, int]
    estimated: bool
    names: dict[int, str]
    states_range: tuple[int, int] | None
    attrs_range: tuple[int, int] | None
    phase: str = "states"
    cursor: int = 0
    stop: bool = False
    task: asyncio.Task[Any] | None = None
    states: dict[int, list[int]] = field(default_factory=dict)  # metadata_id: [rows, chars]
    attrs: dict[int, list[float]] = field(
        default_factory=dict
    )  # metadata_id: [rows, chars, shared]
    loose_states: list[int] = field(default_factory=lambda: [0, 0])  # rows without an entity
    loose_attrs: list[int] = field(default_factory=lambda: [0, 0])  # attribute rows no state uses

    def share(self) -> float:
        """How much is read, 0 to 1: both tables count half."""

        def part(span: tuple[int, int] | None) -> float:
            if span is None or self.cursor > span[1]:
                return 1.0
            return max(0.0, (self.cursor - span[0]) / (span[1] - span[0] + 1))

        if self.phase == "states":
            return part(self.states_range) / 2
        if self.phase == "attrs":
            return 0.5 + part(self.attrs_range) / 2
        return 1.0


def _run(hass: HomeAssistant) -> SpaceRun | None:
    return hass.data.get(DOMAIN, {}).get("space_run")


def running(hass: HomeAssistant) -> bool:
    run = _run(hass)
    return run is not None and run.task is not None and not run.task.done()


def query_start(hass: HomeAssistant) -> dict[str, Any]:
    """Blocking: the ranges of both tables and the entity of every metadata id."""
    from homeassistant.components.recorder.db_schema import StateAttributes, States, StatesMeta
    from homeassistant.components.recorder.util import session_scope
    from sqlalchemy import func, select

    with session_scope(hass=hass, read_only=True) as session:
        states = session.execute(select(func.min(States.state_id), func.max(States.state_id))).one()
        attrs = session.execute(
            select(func.min(StateAttributes.attributes_id), func.max(StateAttributes.attributes_id))
        ).one()
        names = {
            int(mid): str(entity_id)
            for mid, entity_id in session.execute(
                select(StatesMeta.metadata_id, StatesMeta.entity_id)
            ).all()
            if entity_id
        }

    def span(row: Any) -> tuple[int, int] | None:
        return (int(row[0]), int(row[1])) if row[0] is not None else None

    return {"states": span(states), "attrs": span(attrs), "names": names}


def query_states(hass: HomeAssistant, low: int, high: int) -> list[tuple[int | None, int, int]]:
    """Blocking: rows and the length of the state text per metadata id for ``low <= state_id < high``."""
    from homeassistant.components.recorder.db_schema import States
    from homeassistant.components.recorder.util import session_scope
    from sqlalchemy import func, select

    with session_scope(hass=hass, read_only=True) as session:
        return [
            (mid, int(rows), int(chars or 0))
            for mid, rows, chars in session.execute(
                select(States.metadata_id, func.count(), func.sum(func.length(States.state)))
                .where(States.state_id >= low, States.state_id < high)
                .group_by(States.metadata_id)
            ).all()
        ]


def query_attrs(
    hass: HomeAssistant, low: int, high: int
) -> tuple[dict[int, int], dict[int, list[int]]]:
    """Blocking: for ``low <= attributes_id < high`` the length of each attribute row and the
    metadata ids of the states that use it."""
    from homeassistant.components.recorder.db_schema import StateAttributes, States
    from homeassistant.components.recorder.util import session_scope
    from sqlalchemy import func, select

    users: dict[int, list[int]] = {}
    with session_scope(hass=hass, read_only=True) as session:
        lengths = {
            int(aid): int(chars or 0)
            for aid, chars in session.execute(
                select(
                    StateAttributes.attributes_id, func.length(StateAttributes.shared_attrs)
                ).where(StateAttributes.attributes_id >= low, StateAttributes.attributes_id < high)
            ).all()
        }
        for aid, mid in session.execute(
            select(States.attributes_id, States.metadata_id)
            .where(States.attributes_id >= low, States.attributes_id < high)
            .group_by(States.attributes_id, States.metadata_id)
        ).all():
            if mid is not None:
                users.setdefault(int(aid), []).append(int(mid))
    return lengths, users


def add_states(run: SpaceRun, rows: list[tuple[int | None, int, int]]) -> None:
    for mid, count, chars in rows:
        if mid is None or mid not in run.names:
            run.loose_states[0] += count
            run.loose_states[1] += chars
            continue
        found = run.states.setdefault(mid, [0, 0])
        found[0] += count
        found[1] += chars


def add_attrs(run: SpaceRun, lengths: dict[int, int], users: dict[int, list[int]]) -> None:
    """A row used by several entities is split between them; a row nobody uses stays loose."""
    for aid, chars in lengths.items():
        mids = [mid for mid in users.get(aid, []) if mid in run.names]
        if not mids:
            run.loose_attrs[0] += 1
            run.loose_attrs[1] += chars
            continue
        for mid in mids:
            found = run.attrs.setdefault(mid, [0.0, 0.0, 0.0])
            found[0] += 1 / len(mids)
            found[1] += chars / len(mids)
            if len(mids) > 1:
                found[2] += 1


def build(run: SpaceRun, limit: int) -> dict[str, Any]:
    """The ranking from what is counted: lengths spread over the reported table sizes."""
    states_weight = {
        mid: rows * STATES_ROW_BYTES + chars for mid, (rows, chars) in run.states.items()
    }
    attrs_weight = {
        mid: rows * ATTRS_ROW_BYTES + chars for mid, (rows, chars, _) in run.attrs.items()
    }
    loose_states = run.loose_states[0] * STATES_ROW_BYTES + run.loose_states[1]
    loose_attrs = run.loose_attrs[0] * ATTRS_ROW_BYTES + run.loose_attrs[1]

    def scale(weights: dict[int, float], loose: float, table: str) -> float:
        total = sum(weights.values()) + loose
        size = run.tables.get(table)
        return size / total if size and total else 1.0

    to_states = scale(states_weight, loose_states, "states")
    to_attrs = scale(attrs_weight, loose_attrs, "state_attributes")
    entities = []
    for mid in set(run.states) | set(run.attrs):
        states_bytes = round(states_weight.get(mid, 0) * to_states)
        attrs_bytes = round(attrs_weight.get(mid, 0) * to_attrs)
        entities.append(
            {
                "entity_id": run.names[mid],
                "rows": run.states.get(mid, [0])[0],
                "states_bytes": states_bytes,
                "variants": round(run.attrs.get(mid, [0.0])[0]),
                "shared": round(run.attrs.get(mid, [0.0, 0.0, 0.0])[2]),
                "attrs_bytes": attrs_bytes,
                "bytes": states_bytes + attrs_bytes,
            }
        )
    entities.sort(key=lambda e: (e["bytes"], e["entity_id"]), reverse=True)
    return {
        "entities": entities[:limit],
        "entities_total": len(entities),
        "loose_states_bytes": round(loose_states * to_states),
        "loose_attrs_bytes": round(loose_attrs * to_attrs),
        "loose_attrs_rows": run.loose_attrs[0],
        "states_table": run.tables.get("states"),
        "attrs_table": run.tables.get("state_attributes"),
        "scaled": bool(run.tables.get("states") and run.tables.get("state_attributes")),
        "estimated": run.estimated,
    }


async def _step(hass: HomeAssistant, job: Any) -> tuple[Any, float]:
    """One step under the shared lock, in the recorder executor; returns its result and duration."""
    from homeassistant.components.recorder import get_instance

    lock: asyncio.Lock = hass.data.setdefault(DOMAIN, {}).setdefault(
        "reliability_lock", asyncio.Lock()
    )
    async with lock:
        began = time.monotonic()
        found = await get_instance(hass).async_add_executor_job(job)
        return found, time.monotonic() - began


def _next_step(step: int, took: float) -> int:
    return max(1000, int(step * min(2.0, max(0.5, STEP_SECONDS / max(took, 0.01)))))


async def _measure(hass: HomeAssistant, run: SpaceRun, store: ReplyStore) -> None:
    """Read both tables step by step; a stop or an error keeps what was read as a partial result."""
    state = "done"
    try:
        for phase, span, step, read in (
            ("states", run.states_range, STATES_STEP, _read_states),
            ("attrs", run.attrs_range, ATTRS_STEP, _read_attrs),
        ):
            run.phase = phase
            if span is None:
                continue
            run.cursor = span[0]
            while run.cursor <= span[1] and not run.stop:
                low, high = run.cursor, min(run.cursor + step, span[1] + 1)
                took = await read(hass, run, low, high)
                run.cursor = high
                step = _next_step(step, took)
                await asyncio.sleep(PAUSE)
            if run.stop:
                state = "stopped"
                break
    except Exception:
        state = "failed"
        _LOGGER.warning("Measuring the space of the entities did not finish", exc_info=True)
    share = run.share() if state != "done" else 1.0
    run.phase = "done"
    store.keep(
        REPLY_KEY,
        {
            **build(run, ENTITY_LIMIT),
            "computed_at": time.time(),
            "took_ms": round((time.time() - run.started) * 1000),
            "state": state,
            "read_share": round(share, 3),
        },
    )


async def _read_states(hass: HomeAssistant, run: SpaceRun, low: int, high: int) -> float:
    rows, took = await _step(hass, lambda: query_states(hass, low, high))
    add_states(run, rows)
    return took


async def _read_attrs(hass: HomeAssistant, run: SpaceRun, low: int, high: int) -> float:
    (lengths, users), took = await _step(hass, lambda: query_attrs(hass, low, high))
    add_attrs(run, lengths, users)
    return took


async def start(hass: HomeAssistant, store: ReplyStore) -> bool:
    """Start a measurement in the background; False when none can run or one already does."""
    if not recorder_ready(hass) or running(hass):
        return False
    from homeassistant.components.recorder import get_instance

    files = await get_instance(hass).async_add_executor_job(
        lambda: database_files(hass, server=False)
    )
    dialect = str(files.get("dialect") or "")
    tables = await cached_query(
        hass,
        "db_tables",
        TABLES_SECONDS.get(dialect, TABLES_SECONDS_SERVER),
        lambda: {"at": time.time(), "tables": table_sizes(hass, dialect)},
    )
    found, _ = await _step(hass, lambda: query_start(hass))
    if running(hass):
        return False
    run = SpaceRun(
        started=time.time(),
        tables={t["name"]: t["bytes"] for t in (tables.raw or {}).get("tables") or []},
        estimated=dialect == "mysql",
        names=found["names"],
        states_range=found["states"],
        attrs_range=found["attrs"],
    )
    hass.data.setdefault(DOMAIN, {})["space_run"] = run
    run.task = hass.async_create_background_task(
        _measure(hass, run, store), "ha_housekeeper_entity_space"
    )
    return True


def stop(hass: HomeAssistant) -> None:
    """Stop after the current step; what is read so far is kept."""
    run = _run(hass)
    if run is not None:
        run.stop = True


def status(hass: HomeAssistant, store: ReplyStore) -> dict[str, Any]:
    """The running measurement with its interim ranking, and the last finished one."""
    run = _run(hass)
    reply: dict[str, Any] = {
        "available": recorder_ready(hass),
        "running": running(hass),
        "result": store.replies.get(REPLY_KEY),
    }
    if run is not None and reply["running"]:
        share = run.share()
        elapsed = time.time() - run.started
        reply["progress"] = {
            "share": round(share, 3),
            "phase": run.phase,
            "stopping": run.stop,
            "elapsed": round(elapsed),
            "left": round(elapsed / share - elapsed) if share >= 0.05 else None,
        }
        reply["interim"] = build(run, SHOWN_DURING_RUN)
    return reply


def query_variants(hass: HomeAssistant, entity_id: str) -> dict[str, Any]:
    """Blocking: the newest attribute rows of one entity, cut into keys."""
    from homeassistant.components.recorder.db_schema import StateAttributes, States, StatesMeta
    from homeassistant.components.recorder.util import session_scope
    from sqlalchemy import func, select

    with session_scope(hass=hass, read_only=True) as session:
        mid = session.execute(
            select(StatesMeta.metadata_id).where(StatesMeta.entity_id == entity_id)
        ).scalar()
        if mid is None:
            return {"found": False}
        total = int(
            session.execute(
                select(func.count(func.distinct(States.attributes_id))).where(
                    States.metadata_id == mid
                )
            ).scalar()
            or 0
        )
        ids = sorted(
            int(aid)
            for (aid,) in session.execute(
                select(States.attributes_id)
                .where(States.metadata_id == mid, States.attributes_id.is_not(None))
                .group_by(States.attributes_id)
                .order_by(States.attributes_id.desc())
                .limit(VARIANT_LIMIT)
            ).all()
        )
        cut = KeyCut()
        for at in range(0, len(ids), VARIANT_CHUNK):
            chunk = ids[at : at + VARIANT_CHUNK]
            texts = dict(
                session.execute(
                    select(StateAttributes.attributes_id, StateAttributes.shared_attrs).where(
                        StateAttributes.attributes_id.in_(chunk)
                    )
                ).all()
            )
            for aid in chunk:
                cut.add(texts.get(aid))
    return {"found": True, "total": total, **cut.result()}


class KeyCut:
    """Attribute rows in the order they were made, cut into keys one by one (only the previous row is kept)."""

    def __init__(self) -> None:
        self.rows = 0
        self.chars = 0
        self.keys: dict[str, list[int]] = {}  # key: [chars, rows with it, changes, changes alone]
        self._last: dict[str, str] | None = None

    def add(self, text: str | None) -> None:
        try:
            attrs = json.loads(text) if text else None
        except ValueError:
            return
        if not isinstance(attrs, dict):
            return
        parts = {
            str(key): json.dumps(value, ensure_ascii=False, separators=(",", ":"), default=str)
            for key, value in attrs.items()
        }
        self.rows += 1
        for key, value in parts.items():
            size = len(json.dumps(key, ensure_ascii=False)) + 1 + len(value) + 1
            found = self.keys.setdefault(key, [0, 0, 0, 0])
            found[0] += size
            found[1] += 1
            self.chars += size
        if self._last is not None:
            changed = [
                key for key in set(parts) | set(self._last) if parts.get(key) != self._last.get(key)
            ]
            for key in changed:
                found = self.keys.setdefault(key, [0, 0, 0, 0])
                found[2] += 1
                if len(changed) == 1:
                    found[3] += 1
        self._last = parts

    def result(self) -> dict[str, Any]:
        steps = max(self.rows - 1, 1)
        keys = [
            {
                "key": key,
                "chars": chars,
                "share": round(chars / self.chars, 4) if self.chars else 0.0,
                "rows": rows,
                "changes": changes,
                "alone": alone,
                "driver": self.rows > 1 and changes / steps >= DRIVER_SHARE,
            }
            for key, (chars, rows, changes, alone) in self.keys.items()
        ]
        keys.sort(key=lambda k: (k["chars"], k["key"]), reverse=True)
        rest = keys[KEY_LIMIT:]
        return {
            "read": self.rows,
            "chars": self.chars,
            "keys": keys[:KEY_LIMIT],
            "rest": {"keys": len(rest), "chars": sum(k["chars"] for k in rest)},
        }


async def entity_attributes(hass: HomeAssistant, entity_id: str) -> dict[str, Any]:
    """The attributes of one entity by the space they take; with the measured space when there is one."""
    if not recorder_ready(hass):
        return {"available": False, "busy": False}
    found = await cached_query(
        hass,
        f"entity_attrs:{entity_id}",
        ATTRS_CACHE_SECONDS,
        lambda: query_variants(hass, entity_id),
    )
    if found.busy:
        return {"available": True, "busy": True}
    return {"available": True, "busy": False, "entity_id": entity_id, **found.raw}
