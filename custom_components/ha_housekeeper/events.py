"""Housekeeper's own event log: what Home Assistant does not keep.

Home Assistant forgets when it was updated or restarted, and it holds only a handful of traces per
automation. This small store keeps those facts so later views can show them: version changes,
restarts and plan runs. It holds ids, versions, times and numbers only, never names of people,
variables, payloads or error texts.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import EVENTS_STORAGE_KEY, STORAGE_VERSION

SAVE_DELAY = 300  # seconds; coalesces writes, Home Assistant flushes the store when it stops
SIZE_DAYS = 120  # daily database sizes kept for the growth hint
MAX_EVENTS = 5000
EVENT_KINDS = (
    "ha_version",
    "os_version",
    "supervisor_version",
    "entry_version",
    "start",
    "plan",
    "purge",
)
SYSTEM_KINDS = (("os", "os_version"), ("supervisor", "supervisor_version"))
INTEGRITY_STATES = ("ok", "damaged", "failed")
LIST_LIMIT = 200  # events sent to the panel


def _parse(value: Any) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=UTC)


def detect(
    previous: dict[str, Any] | None,
    ha_version: str,
    custom_versions: dict[str, str],
    now: datetime,
    system: dict[str, str] | None = None,
) -> list[dict[str, Any]]:
    """Return the version changes since ``previous`` (None = first observation, no events)."""
    if not previous:
        return []
    found: list[dict[str, Any]] = []
    stamp = now.isoformat()
    if previous.get("ha") and previous["ha"] != ha_version:
        found.append({"at": stamp, "kind": "ha_version", "from": previous["ha"], "to": ha_version})
    for key, kind in SYSTEM_KINDS:
        version = (system or {}).get(key)
        if version and previous.get(key) and previous[key] != version:
            found.append({"at": stamp, "kind": kind, "from": previous[key], "to": version})
    known = previous.get("entries") or {}
    for domain, version in sorted(custom_versions.items()):
        if domain in known and known[domain] != version:
            found.append(
                {
                    "at": stamp,
                    "kind": "entry_version",
                    "domain": domain,
                    "from": known[domain],
                    "to": version,
                }
            )
    return found


class EventLog:
    """Persistent, bounded log of events."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, EVENTS_STORAGE_KEY)
        self.events: list[dict[str, Any]] = []
        self.versions: dict[str, Any] = {}
        self.heartbeat: str | None = None
        self.sizes: dict[str, int] = {}
        self.integrity: dict[str, Any] | None = None  # the last full database check
        # False while Home Assistant runs, True once it announced its stop; None before the first start.
        self.clean_stop: bool | None = None

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if not isinstance(data, dict):
            return
        events = data.get("events")
        if isinstance(events, list):
            self.events = [
                e
                for e in events
                if isinstance(e, dict) and e.get("kind") in EVENT_KINDS and _parse(e.get("at"))
            ][-MAX_EVENTS:]
        versions = data.get("versions")
        if isinstance(versions, dict):
            self.versions = versions
        if _parse(data.get("heartbeat")):
            self.heartbeat = data["heartbeat"]
        sizes = data.get("sizes")
        if isinstance(sizes, dict):
            self.sizes = {
                str(day): int(size)
                for day, size in sizes.items()
                if isinstance(size, int) and not isinstance(size, bool) and size >= 0
            }
            self._trim_sizes()
        if isinstance(data.get("clean_stop"), bool):
            self.clean_stop = data["clean_stop"]
        integrity = data.get("integrity")
        if (
            isinstance(integrity, dict)
            and integrity.get("state") in INTEGRITY_STATES
            and _parse(integrity.get("at"))
        ):
            self.integrity = {
                "at": integrity["at"],
                "state": integrity["state"],
                "lines": [str(x) for x in integrity.get("lines", [])][:10],
            }

    def _save(self) -> None:
        self._store.async_delay_save(self._data, SAVE_DELAY)

    def _data(self) -> dict[str, Any]:
        return {
            "events": self.events,
            "versions": self.versions,
            "heartbeat": self.heartbeat,
            "sizes": self.sizes,
            "integrity": self.integrity,
            "clean_stop": self.clean_stop,
        }

    def _trim_sizes(self) -> None:
        for day in sorted(self.sizes)[:-SIZE_DAYS]:
            del self.sizes[day]

    def record_size(self, day: str, size: int) -> None:
        """The database size of one day (the last sample of the day wins); a number, nothing else."""
        if self.sizes.get(day) == size:
            return
        self.sizes[day] = int(size)
        self._trim_sizes()
        self._save()

    def record_integrity(self, now: datetime, state: str, lines: list[str]) -> None:
        """The result of the last full database check; only the last one is kept."""
        self.integrity = {"at": now.isoformat(), "state": state, "lines": lines[:10]}
        self._save()

    def record(self, kind: str, now: datetime, **fields: Any) -> None:
        """Append one event; the oldest fall out beyond the cap."""
        if kind not in EVENT_KINDS:
            raise ValueError(kind)
        self.events.append({"at": now.isoformat(), "kind": kind, **fields})
        del self.events[:-MAX_EVENTS]
        self._save()

    def record_start(self, now: datetime) -> None:
        """Home Assistant started; the last heartbeat tells for how long it had been down."""
        last = _parse(self.heartbeat)
        fields: dict[str, Any] = {}
        if last is not None and last <= now:
            fields["down_seconds"] = int((now - last).total_seconds())
        if self.clean_stop is False:
            fields["unclean"] = (
                True  # the last run never announced its stop: crash, power cut, kill
            )
        self.clean_stop = False
        self.record("start", now, **fields)
        self.beat(now)

    def mark_clean_stop(self) -> None:
        """Home Assistant is stopping on purpose; a start without this mark follows a crash."""
        self.clean_stop = True
        self._save()

    def beat(self, now: datetime) -> None:
        self.heartbeat = now.isoformat()
        self._save()

    def observe(
        self,
        ha_version: str,
        custom_versions: dict[str, str],
        now: datetime,
        system: dict[str, str] | None = None,
    ) -> list[dict[str, Any]]:
        """Compare the installed versions with the last observation, log and return the changes.

        ``system`` holds the OS and Supervisor versions when they could be read; one that could not
        keeps its last known version, so a failed read is no change.
        """
        old = self.versions
        found = detect(old, ha_version, custom_versions, now, system)
        self.events.extend(found)
        del self.events[:-MAX_EVENTS]
        self.versions = {"ha": ha_version, "entries": dict(custom_versions)}
        for key, _ in SYSTEM_KINDS:
            version = (system or {}).get(key) or old.get(key)
            if isinstance(version, str) and version:
                self.versions[key] = version
        self._save()
        return found

    def last_start(self, before: datetime, within: timedelta) -> datetime | None:
        """The latest logged restart not after ``before`` and at most ``within`` earlier."""
        for event in reversed(self.events):
            moment = _parse(event.get("at"))
            if event["kind"] == "start" and moment is not None and moment <= before:
                return moment if before - moment <= within else None
        return None

    def recent(self, limit: int = LIST_LIMIT) -> list[dict[str, Any]]:
        return list(reversed(self.events[-limit:]))
