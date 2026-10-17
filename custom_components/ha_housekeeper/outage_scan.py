"""Scans that follow outages, so the levels by duration are met without a scan every few minutes.

An entity that goes ``unavailable`` or ``unknown``, or a config entry that stops loading, plans one
scan for when the outage reaches the first level. A scan that still sees outages plans the next one
for the moment the next level is reached. Such a scan updates findings, levels and panel but is not
a point of the history: the "last scan" that changes are compared with stays where it was. Between
two of these scans lies at least the first threshold and twenty times the length of the last scan.
Only ids, statuses and times are looked at, never names or texts.
"""

from __future__ import annotations

from collections.abc import Callable
from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Any

from homeassistant.const import EVENT_STATE_CHANGED
from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.event import async_track_point_in_utc_time
from homeassistant.util import dt as dt_util

from .scan_trigger import SCAN_MIN_GAP, ScanRefused

if TYPE_CHECKING:
    from .inventory import InventoryScanner

try:  # the signal exists in every supported version; without it only entities are followed
    from homeassistant.config_entries import SIGNAL_CONFIG_ENTRY_CHANGED, ConfigEntryChange
except ImportError:  # pragma: no cover
    SIGNAL_CONFIG_ENTRY_CHANGED = None  # type: ignore[assignment]
    ConfigEntryChange = None  # type: ignore[assignment,misc]

BAD_STATES = frozenset({"unavailable", "unknown"})
BAD_STATUSES = frozenset({"unavailable", "unknown", "problem", "stopped"})
RECOVERY_DELAY = timedelta(seconds=60)  # a scan after a recovery lets the finding go
RETRY_DELAY = timedelta(seconds=60)  # a plan or the start was in the way
SCAN_LENGTH_FACTOR = 20  # a scan is not followed by another within this many scan lengths


@callback
def state_filter(data: Any) -> bool:
    """Whether a state change is worth a look: an entity went bad, or came back from it."""
    new = data.get("new_state")
    if new is None:
        return False
    old = data.get("old_state")
    if new.state in BAD_STATES:
        return old is None or old.state != new.state
    return old is not None and old.state in BAD_STATES


def outage_start(observed: str | None, last_changed: str | None) -> tuple[str | None, str]:
    """Since when an entity is in its state: the earlier of what Housekeeper saw and what HA kept.

    After a restart Home Assistant starts every placeholder state at the start time, so the first
    observation is the earlier one there; for an outage Housekeeper never saw, ``last_changed`` is.
    """
    seen = _parse(observed)
    kept = _parse(last_changed)
    if seen is None and kept is None:
        return None, "first_housekeeper_observation"
    if kept is not None and (seen is None or kept < seen):
        return kept.isoformat(), "home_assistant"
    return observed, "first_housekeeper_observation"


def next_due(
    objects: list[dict[str, Any]], now: datetime, info: timedelta, low: timedelta
) -> datetime | None:
    """The next moment an outage in the objects reaches the first or the second level."""
    soonest: datetime | None = None
    for item in objects:
        if item.get("status") not in BAD_STATUSES:
            continue
        since = _parse(item.get("status_since"))
        if since is None:
            continue
        for level in (info, low):
            moment = since + level
            if moment > now and (soonest is None or moment < soonest):
                soonest = moment
    return soonest


def plan_time(
    wanted: datetime, now: datetime, last_run: datetime | None, gap: timedelta
) -> datetime:
    """When to scan: as wanted, but not before the pause after the last such scan is over."""
    allowed = now if last_run is None else last_run + gap
    return max(wanted, allowed, now)


def _parse(value: Any) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=dt_util.UTC)


class OutageScans:
    """Plans the scans that follow outages; one at a time."""

    def __init__(self, hass: HomeAssistant, scanner: InventoryScanner) -> None:
        self._hass = hass
        self._scanner = scanner
        self._cancel: CALLBACK_TYPE | None = None
        self._due: datetime | None = None
        self._last_run: datetime | None = None
        self._started = False

    @property
    def due(self) -> datetime | None:
        return self._due

    def start(self) -> Callable[[], None]:
        """Listen for outages; the returned function stops it all."""
        self._started = True
        unsubs = [self._hass.bus.async_listen(EVENT_STATE_CHANGED, self._state, state_filter)]
        if SIGNAL_CONFIG_ENTRY_CHANGED is not None:
            unsubs.append(
                async_dispatcher_connect(self._hass, SIGNAL_CONFIG_ENTRY_CHANGED, self._entry)
            )

        def stop() -> None:
            self._started = False
            for unsub in unsubs:
                unsub()
            self._clear()

        return stop

    @callback
    def _state(self, event: Any) -> None:
        new = event.data["new_state"]
        self._note(recovered=new.state not in BAD_STATES)

    @callback
    def _entry(self, change: Any, entry: Any) -> None:
        if ConfigEntryChange is None or change != ConfigEntryChange.UPDATED:
            return
        loaded = getattr(entry.state, "value", str(entry.state)) == "loaded"
        self._note(recovered=loaded)

    def _note(self, *, recovered: bool) -> None:
        """Something went bad or came back: a scan is due after the first threshold or soon."""
        if self._scanner.warming_up or self._scanner.paused:
            return  # the scan at the end of the warm-up looks at everything
        now = dt_util.utcnow()
        self._plan(now + (RECOVERY_DELAY if recovered else self._info()))

    def after_scan(self, snapshot: dict[str, Any]) -> None:
        """A scan ended: plan the next one for the next level of an outage that is still open."""
        due = next_due(snapshot["objects"], dt_util.utcnow(), self._info(), self._low())
        if due is not None:
            self._plan(due)

    def _info(self) -> timedelta:
        return timedelta(minutes=self._scanner.outage_info_minutes)

    def _low(self) -> timedelta:
        return timedelta(hours=self._scanner.outage_low_hours)

    def _gap(self) -> timedelta:
        scan = timedelta(seconds=self._scanner.last_scan_seconds * SCAN_LENGTH_FACTOR)
        return max(self._info(), scan, timedelta(seconds=SCAN_MIN_GAP))

    def _plan(self, wanted: datetime) -> None:
        if not self._started:
            return
        now = dt_util.utcnow()
        when = plan_time(wanted, now, self._last_run, self._gap())
        if self._due is not None and self._due <= when:
            return  # one that is planned sooner covers it
        self._clear()
        self._due = when
        self._cancel = async_track_point_in_utc_time(self._hass, self._fire, when)

    def _clear(self) -> None:
        if self._cancel is not None:
            self._cancel()
        self._cancel, self._due = None, None

    async def _fire(self, _: datetime) -> None:
        self._cancel, self._due = None, None
        try:
            await self._scanner.async_request_scan(record=False)
        except ScanRefused:  # a plan or the start is in the way: try again soon
            self._plan(dt_util.utcnow() + RETRY_DELAY)
            return
        self._last_run = dt_util.utcnow()
