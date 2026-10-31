"""One way to run the expensive recorder queries: cached, never twice at once, not cut short by a client.

A query runs as its own task. A client that gives up (the websocket timeout) only stops waiting; the
task keeps the lock until its executor job has really finished, so a second query can never start
on top of a slow first one. Every query kind shares one lock, so two different kinds do not read the
recorder at the same time either.
"""

from __future__ import annotations

import asyncio
import re
import time
from collections.abc import Callable
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DOMAIN, REPLIES_STORAGE_KEY, STORAGE_VERSION

REPLY_KEY = re.compile(r"^[a-z_]{1,20}(:\d{1,2}){0,2}$")
REPLY_SAVE_DELAY = 30  # seconds
CACHE_MAX = 200  # cached answers kept; per-entity queries would otherwise add one per entity opened


class QueryResult:
    """What ``cached_query`` found: the raw rows, whether they came from the cache, or ``busy``."""

    __slots__ = ("busy", "cached", "raw")

    def __init__(self, raw: Any, *, cached: bool, busy: bool) -> None:
        self.raw = raw
        self.cached = cached
        self.busy = busy


def _consume(task: asyncio.Task[Any]) -> None:
    """Read the outcome so a task nobody waits for any more does not log an unretrieved error."""
    if not task.cancelled():
        task.exception()


async def cached_query(
    hass: HomeAssistant,
    name: str,
    ttl: float,
    job: Callable[[], Any],
    *,
    refresh: bool = False,
) -> QueryResult:
    """Run ``job`` (a blocking function, in the recorder executor) unless a fresh result exists.

    ``refresh`` asks for a new run but joins one that is already running. When another kind of query
    holds the lock, the last result is handed out, or ``busy`` when there is none.
    """
    from homeassistant.components.recorder import get_instance

    store = hass.data.setdefault(DOMAIN, {})
    cache: dict[str, tuple[float, Any]] = store.setdefault("query_cache", {})
    inflight: dict[str, asyncio.Task[Any]] = store.setdefault("query_inflight", {})
    lock: asyncio.Lock = store.setdefault("reliability_lock", asyncio.Lock())
    kept = cache.get(name)
    if kept and not refresh and time.monotonic() - kept[0] < ttl:
        return QueryResult(kept[1], cached=True, busy=False)
    task = inflight.get(name)
    if task is not None and task.done():
        # Finished, but its done callback has not cleared it yet.
        del inflight[name]
        task = None
    if task is None:
        if lock.locked():
            if kept:
                return QueryResult(kept[1], cached=True, busy=False)
            return QueryResult(None, cached=False, busy=True)

        async def run() -> Any:
            async with lock:
                raw = await get_instance(hass).async_add_executor_job(job)
                cache[name] = (time.monotonic(), raw)
                for old in sorted(cache, key=lambda key: cache[key][0])[: len(cache) - CACHE_MAX]:
                    del cache[old]
                return raw

        def finished(done: asyncio.Task[Any]) -> None:
            _consume(done)
            if inflight.get(name) is done:
                del inflight[name]

        # The task may start running at once; it is entered before the callback can fire.
        task = hass.async_create_task(run(), name=f"ha_housekeeper query {name}")
        inflight[name] = task
        task.add_done_callback(finished)
    return QueryResult(await asyncio.shield(task), cached=False, busy=False)


class ReplyStore:
    """The last finished reply of each slow view, so a view never opens empty.

    The key names the view and its window, for example ``reliability:7:0`` or ``storms:1``. A reply
    carries ``computed_at``; how old it may be before it counts as stale is up to the view.
    """

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, REPLIES_STORAGE_KEY)
        self.replies: dict[str, dict[str, Any]] = {}

    async def async_load(self) -> None:
        """Load the replies; anything that is not a reply of the known shape is dropped."""
        data = await self._store.async_load()
        if not isinstance(data, dict) or not isinstance(data.get("replies"), dict):
            return
        self.replies = {
            key: reply
            for key, reply in data["replies"].items()
            if isinstance(key, str)
            and REPLY_KEY.match(key)
            and isinstance(reply, dict)
            and isinstance(reply.get("computed_at"), int | float)
            and not isinstance(reply.get("computed_at"), bool)
        }

    def keep(self, key: str, reply: dict[str, Any]) -> None:
        self.replies[key] = reply
        self._store.async_delay_save(lambda: {"replies": self.replies}, REPLY_SAVE_DELAY)

    def clear(self) -> None:
        """Forget every kept reply; the views compute them again on their next visit."""
        if self.replies:
            self.replies = {}
            self._store.async_delay_save(lambda: {"replies": self.replies}, REPLY_SAVE_DELAY)


DAY = 86400
DAY_KEEP = 24 * 3600  # a finished day is read again after this long (a purge from outside)


def pieces(start: float, end: float, oldest: float) -> list[tuple[float, float, bool]]:
    """Cut ``[start, end]`` into finished UTC days that may be kept and the live rest around them.

    A day counts only when it lies wholly inside the window, has ended and is not older than
    ``oldest`` (rows the recorder purges next); everything else stays one live piece per stretch.
    """
    today = end // DAY * DAY
    day = -(-start // DAY) * DAY
    found: list[tuple[float, float, bool]] = []
    live_from = start
    while day + DAY <= today:
        if day >= oldest:
            if live_from < day:
                found.append((live_from, day, False))
            found.append((day, day + DAY, True))
            live_from = day + DAY
        day += DAY
    if live_from < end or not found:
        found.append((live_from, end, False))
    return found


class DayCache:
    """The results of finished days per query kind, beside the cached answers.

    They sit in the same ``query_cache``, so whatever clears it after a purge clears these too. They
    are read and written only by a job that holds the shared query lock.
    """

    def __init__(self, hass: HomeAssistant, kind: str) -> None:
        from homeassistant.components.recorder import get_instance

        self._cache: dict[str, tuple[float, Any]] = hass.data.setdefault(DOMAIN, {}).setdefault(
            "query_cache", {}
        )
        self._kind = kind
        keep = getattr(get_instance(hass), "keep_days", None)
        # One day of margin: the nightly purge may already have thinned the oldest day.
        self.oldest = (
            time.time() - (keep - 1) * DAY
            if isinstance(keep, int) and not isinstance(keep, bool)
            else float("inf")
        )

    def get(self, day: float) -> Any:
        kept = self._cache.get(f"day:{self._kind}:{int(day)}")
        if kept is None or time.monotonic() - kept[0] >= DAY_KEEP:
            return None
        return kept[1]

    def put(self, day: float, data: Any) -> None:
        self._cache[f"day:{self._kind}:{int(day)}"] = (time.monotonic(), data)


# How old a kept reply may get before the background renews it, per view kind.
REFRESH_AGE = {
    "reliability": 30 * 60,
    "storms": 30 * 60,
    "costs": 24 * 3600,  # a ranking over the whole database; it moves slowly
    "db_health": 3 * 3600,
}
REFRESH_TICK = 5 * 60  # the background looks this often and renews one view at most


def next_reply(replies: dict[str, dict[str, Any]], now: float) -> str | None:
    """The kept reply the background renews next: the most overdue one, or None.

    A reply counts as due one tick before its age is reached, so it never gets older than that age.
    """
    due, most = None, -1.0
    for key, reply in replies.items():
        limit = REFRESH_AGE.get(key.split(":")[0])
        if limit is None:
            continue
        over = now - reply["computed_at"] - (limit - REFRESH_TICK)
        if over >= 0 and over > most:
            due, most = key, over
    return due


def kept_reply(
    store: ReplyStore | None, key: str, now: float, ttl: float, *, stale: bool | None = None
) -> dict[str, Any] | None:
    """The kept reply with its age; ``stale`` once it is older than ``ttl`` (or as forced)."""
    kept = store.replies.get(key) if store is not None else None
    if kept is None:
        return None
    age = max(0, round(now - kept["computed_at"]))
    return {
        **kept,
        "cached": True,
        "stale": age >= ttl if stale is None else stale,
        "age_seconds": age,
    }
