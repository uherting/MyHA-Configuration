"""Housekeeper's own event log: what Home Assistant does not keep.

Home Assistant forgets when it was updated or restarted, and it holds only a handful of traces per
automation. This small store keeps those facts so later views can show them: version changes,
restarts and plan runs. It holds ids, versions, times and numbers only, never names of people,
variables, payloads or error texts.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any, cast

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import EVENTS_STORAGE_KEY, STORAGE_VERSION

# Seconds; coalesces writes, and Home Assistant flushes the store when it stops. It has to stay well below the
# five minutes of the heartbeat: every beat delays a pending write, so a longer delay would never write at all
# while Home Assistant runs, and a crash would leave the state of the last clean stop.
SAVE_DELAY = 30
SIZE_DAYS = 120  # daily database sizes kept for the growth hint
MAX_EVENTS = 5000  # starts, updates, plans and purges
MAX_CHECK_EVENTS = (
    2000  # changes of checks have a cap of their own: a flapping check must not push out a restart
)
EVENT_KINDS = (
    "ha_version",
    "os_version",
    "supervisor_version",
    "entry_version",
    "start",
    "plan",
    "purge",
    "check_change",
)
UPDATE_KINDS = {
    "ha_version": "core",
    "os_version": "os",
    "supervisor_version": "supervisor",
    "entry_version": "integration",
}
SYSTEM_KINDS = (("os", "os_version"), ("supervisor", "supervisor_version"))
INTEGRITY_STATES = ("ok", "damaged", "failed")
LIST_LIMIT = 200  # events sent to the panel
CHECK_DAYS = 90  # how long a change of a check is kept
CHECK_LEVELS = ("ok", "note", "problem", "unknown", "running")
_SEVERITY = {"ok": 0, "running": 0, "unknown": 1, "note": 2, "problem": 3}
FLAP_WINDOW = timedelta(hours=3)  # this many changes of one check in this time is "flapping"
FLAP_CHANGES = 4
GAP_SECONDS = 300  # a restart after at least this long without a heartbeat is a gap in the record
CAUSE_KEYS = 8
START_NEAR = timedelta(
    minutes=10
)  # an update this close to a start is the reason for it; a change this soon follows it
DISMISS_REASONS = ("backup_running", "restart", "maintenance", "test", "expected", "other")


def capped(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """The newest events of each class: changes of checks and everything else are counted apart."""
    kept: list[dict[str, Any]] = []
    checks = others = 0
    for event in reversed(events):
        if event["kind"] == "check_change":
            checks += 1
            if checks > MAX_CHECK_EVENTS:
                continue
        else:
            others += 1
            if others > MAX_EVENTS:
                continue
        kept.append(event)
    kept.reverse()
    return kept


def _parse(value: Any) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=UTC)


def _stamp(value: Any) -> datetime:
    """The time of a stored event, whose ``at`` was checked when the log was loaded."""
    return cast(datetime, _parse(value))


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
        # The last level of each check ("area/check"), so only a change is written down.
        self.levels: dict[str, str] = {}
        self.backup_since: str | None = None  # when the backup that runs now began
        self.log_since: str | None = None  # since when changes of checks are written down
        # Changes the person marked as a false alarm: id ("at|area|check") -> reason.
        self.dismissed: dict[str, str] = {}
        self._first_check_pending = False  # set at a start, cleared by the first look of any check

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if not isinstance(data, dict):
            return
        events = data.get("events")
        if isinstance(events, list):
            self.events = capped(
                [
                    e
                    for e in events
                    if isinstance(e, dict) and e.get("kind") in EVENT_KINDS and _parse(e.get("at"))
                ]
            )
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
        levels = data.get("levels")
        if isinstance(levels, dict):
            self.levels = {
                str(key): level
                for key, level in levels.items()
                if isinstance(level, str) and level in CHECK_LEVELS
            }
        dismissed = data.get("dismissed")
        if isinstance(dismissed, dict):
            self.dismissed = {
                str(key): reason for key, reason in dismissed.items() if reason in DISMISS_REASONS
            }
        if _parse(data.get("log_since")):
            self.log_since = data["log_since"]
        if _parse(data.get("backup_since")):
            self.backup_since = data["backup_since"]
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
            "levels": self.levels,
            "backup_since": self.backup_since,
            "log_since": self.log_since,
            "dismissed": self.dismissed,
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
        self.observe_checks(
            "database", [{"id": "integrity", "level": "ok" if state == "ok" else "problem"}], now
        )
        self._save()

    def record(self, kind: str, now: datetime, **fields: Any) -> None:
        """Append one event; the oldest of its class fall out beyond the cap."""
        if kind not in EVENT_KINDS:
            raise ValueError(kind)
        self.events.append({"at": now.isoformat(), "kind": kind, **fields})
        self.events = capped(self.events)
        self._save()

    def record_change(
        self, area: str, check: str, old: str, new: str, now: datetime, **cause: Any
    ) -> None:
        """A check changed its level; ``cause`` holds the numbers behind it, never texts or names."""
        self.levels[f"{area}/{check}"] = new
        fields: dict[str, Any] = {"area": area, "check": check, "from": old, "to": new}
        if cause:
            fields["cause"] = cause
        horizon = (now - timedelta(days=CHECK_DAYS)).isoformat()
        self.events = [e for e in self.events if e["kind"] != "check_change" or e["at"] >= horizon]
        self.record("check_change", now, **fields)
        known = {change_id(e) for e in self.events if e["kind"] == "check_change"}
        self.dismissed = {key: why for key, why in self.dismissed.items() if key in known}

    def _note_first_check(self, now: datetime) -> None:
        """How long after the start the first check looked; written onto the start line, once."""
        if not self._first_check_pending:
            return
        self._first_check_pending = False
        for event in reversed(self.events):
            if event["kind"] == "start":
                began = _parse(event.get("at"))
                if began is not None and "first_check_seconds" not in event:
                    event["first_check_seconds"] = max(0, int((now - began).total_seconds()))
                    self._save()
                return

    def observe_checks(self, area: str, checks: list[dict[str, Any]], now: datetime) -> None:
        """Write down the checks of one area whose level differs from the last time.

        The first sight of a check only remembers its level; it is no change.
        """
        if self.log_since is None:
            self.log_since = now.isoformat()
        self._note_first_check(now)
        for item in checks:
            level = item.get("level")
            if level not in CHECK_LEVELS:
                continue
            key = f"{area}/{item['id']}"
            old = self.levels.get(key)
            if old is None:
                self.levels[key] = level
                self._save()
            elif old != level:
                self.record_change(area, item["id"], old, level, now, **_cause(item))

    def forget_checks(self, area: str, current: list[dict[str, Any]]) -> None:
        """Drop the last level of the checks of ``area`` that are not among ``current`` any more.

        For an area whose checks come and go (the goals): one that was deleted or switched off must not
        keep showing its last level, and when it comes back its first look is no change.
        """
        keep = {f"{area}/{item['id']}" for item in current}
        gone = [key for key in self.levels if key.startswith(f"{area}/") and key not in keep]
        for key in gone:
            del self.levels[key]
        if gone:
            self._save()

    def observe_findings(
        self, area: str, findings: list[dict[str, Any]], now: datetime, keep: tuple[str, ...] = ()
    ) -> None:
        """Like ``observe_checks`` for a list of findings: a kind that is gone counts as ``ok``."""
        found = {
            str(f["kind"]): "problem" if f.get("level") == "problem" else "note" for f in findings
        }
        known = {
            key.split("/", 1)[1]
            for key in self.levels
            if key.startswith(f"{area}/") and key.split("/", 1)[1] not in keep
        }
        self.observe_checks(
            area,
            [{"id": kind, "level": found.get(kind, "ok")} for kind in sorted(known | set(found))],
            now,
        )

    def observe_backup_run(self, running: bool | None, now: datetime) -> None:
        """Write down when a backup begins and ends, with its duration; ``None`` is not known."""
        if running is None:
            return
        began = _parse(self.backup_since)
        if running and began is None:
            self.backup_since = now.isoformat()
            self.record_change("backup", "run", "ok", "running", now)
        elif not running and began is not None:
            self.backup_since = None
            self.record_change(
                "backup",
                "run",
                "running",
                "ok",
                now,
                seconds=max(0, int((now - began).total_seconds())),
            )

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
        self._first_check_pending = True
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
        self.events = capped(self.events)
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

    def check_log(
        self,
        now: datetime,
        days: int = 7,
        limit: int = LIST_LIMIT,
        config: dict[str, dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        return check_log(
            self.events, self.levels, now, days, limit, self.log_since, self.dismissed, config
        )

    def mark(self, change: str, reason: str | None) -> bool:
        """Mark a change as a false alarm (``reason``) or take the mark away (``None``)."""
        if reason is not None and reason not in DISMISS_REASONS:
            raise ValueError(reason)
        if not any(e["kind"] == "check_change" and change_id(e) == change for e in self.events):
            return False
        if reason is None:
            self.dismissed.pop(change, None)
        else:
            self.dismissed[change] = reason
        self._save()
        return True

    def flapping(self, now: datetime) -> list[str]:
        """The checks that changed at least ``FLAP_CHANGES`` times lately, false alarms not counted."""
        return flapping(self.events, self.dismissed, now)

    def recent(self, limit: int = LIST_LIMIT, skip: tuple[str, ...] = ()) -> list[dict[str, Any]]:
        """The newest events first; the kinds in ``skip`` are left out before the limit counts."""
        if not skip:
            return list(reversed(self.events[-limit:]))
        return [e for e in reversed(self.events) if e["kind"] not in skip][:limit]


def _cause(item: dict[str, Any]) -> dict[str, Any]:
    """The numbers behind a level; text and lists are left out (a list only as its length)."""
    cause: dict[str, Any] = {}
    for key, value in (item.get("values") or {}).items():
        if isinstance(value, (bool, int, float)):
            cause[key] = value
        elif isinstance(value, list):
            cause[f"{key}_count"] = len(value)
        if len(cause) >= CAUSE_KEYS:
            break
    return cause


def change_id(event: dict[str, Any]) -> str:
    return f"{event['at']}|{event['area']}|{event['check']}"


def flapping(events: list[dict[str, Any]], dismissed: dict[str, str], now: datetime) -> list[str]:
    """Checks with at least ``FLAP_CHANGES`` changes within ``FLAP_WINDOW`` up to now."""
    counts: dict[str, int] = {}
    for event in _changes(events):
        if change_id(event) in dismissed or now - _stamp(event["at"]) > FLAP_WINDOW:
            continue
        key = f"{event['area']}/{event['check']}"
        counts[key] = counts.get(key, 0) + 1
    return sorted(key for key, count in counts.items() if count >= FLAP_CHANGES)


def _changes(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(
        (e for e in events if e["kind"] == "check_change" and _parse(e["at"])),
        key=lambda e: e["at"],
    )


def check_log(
    events: list[dict[str, Any]],
    levels: dict[str, str],
    now: datetime,
    days: int = 7,
    limit: int = LIST_LIMIT,
    log_since: str | None = None,
    dismissed: dict[str, str] | None = None,
    config: dict[str, dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """The changes of the checks, the restarts and gaps, a strip per area and a summary."""
    changes = _changes(events)
    dismissed = dismissed or {}
    since = now - timedelta(days=days)
    flaps: dict[int, int] = {}
    lasted: dict[int, int] = {}
    by_key: dict[str, list[int]] = {}
    for index, event in enumerate(changes):
        if change_id(event) not in dismissed:  # a false alarm is no part of "flapping"
            by_key.setdefault(f"{event['area']}/{event['check']}", []).append(index)
    for indexes in by_key.values():
        stamps = [
            _stamp(changes[i]["at"]) for i in indexes
        ]  # parsed once; the changes are in time order
        first = 0  # the oldest change still within the flap window
        for position, index in enumerate(indexes):
            at = stamps[position]
            while at - stamps[first] > FLAP_WINDOW:
                first += 1
            if position - first + 1 >= FLAP_CHANGES:
                flaps[index] = position - first + 1
            if changes[index]["to"] in ("problem", "note") and position + 1 < len(indexes):
                lasted[index] = int((stamps[position + 1] - at).total_seconds())
    entries: list[dict[str, Any]] = []
    runs = [i for i, e in enumerate(changes) if e["area"] == "backup" and e["check"] == "run"]
    run_end: dict[
        int, int
    ] = {}  # a backup run: the change that started it -> the one that ended it
    for position, index in enumerate(runs):
        following = runs[position + 1] if position + 1 < len(runs) else None
        if (
            changes[index]["to"] == "running"
            and following is not None
            and changes[following]["from"] == "running"
        ):
            run_end[index] = following
    ended = {end for begin, end in run_end.items() if _stamp(changes[begin]["at"]) >= since}
    for index, event in enumerate(changes):
        if _stamp(event["at"]) < since or index in ended:
            continue
        is_run = event["area"] == "backup" and event["check"] == "run"
        if is_run and event["to"] == "running":  # start and end of one backup are one line
            end = changes[run_end[index]] if index in run_end else None
            entry = {"at": event["at"], "kind": "backup_run", "id": change_id(event)}
            if end is not None:
                entry["ended"] = end["at"]
                entry["seconds"] = int((_stamp(end["at"]) - _stamp(event["at"])).total_seconds())
            entries.append(entry)
            continue
        entry = {key: event[key] for key in ("at", "area", "check", "from", "to") if key in event}
        entry["kind"] = "change"
        entry["id"] = change_id(event)
        if entry["id"] in dismissed:
            entry["dismissed"] = dismissed[entry["id"]]
        if event.get("cause"):
            entry["cause"] = event["cause"]
        if index in flaps:
            entry["flaps"] = flaps[index]
        if index in lasted:
            entry["lasted_seconds"] = lasted[index]
        entries.append(entry)
    gaps = []
    updates = []
    merged: set[int] = set()  # updates that a start line takes in: one line for update and restart
    for event in events:
        what = UPDATE_KINDS.get(event["kind"])
        moment = _parse(event.get("at"))
        if what is None or moment is None or moment < since:
            continue
        updates.append(
            (
                moment,
                {
                    "at": event["at"],
                    "kind": "update",
                    "what": what,
                    "from": event.get("from"),
                    "to": event.get("to"),
                    **({"domain": event["domain"]} if event.get("domain") else {}),
                },
            )
        )
    for event in events:
        moment = _parse(event.get("at"))
        if event["kind"] != "start" or moment is None or moment < since:
            continue
        down = int(event.get("down_seconds") or 0)
        taken = [u for at, u in updates if abs(at - moment) <= START_NEAR and id(u) not in merged]
        merged.update(id(u) for u in taken)
        after: dict[str, int] = {}
        for change in changes:  # what turned bad right after the start (false alarms not counted)
            at = _stamp(change["at"])
            if (
                moment <= at <= moment + START_NEAR
                and change["to"] in ("problem", "note")
                and change_id(change) not in dismissed
            ):
                after[change["to"]] = after.get(change["to"], 0) + 1
        entries.append(
            {
                "at": event["at"],
                "kind": "start",
                "down_seconds": down,
                "gap": down >= GAP_SECONDS,
                "reason": "update" if taken else "crash" if event.get("unclean") else "restart",
                **({"updates": taken} if taken else {}),
                **({"after": after} if after else {}),
                **(
                    {"first_check_seconds": event["first_check_seconds"]}
                    if isinstance(event.get("first_check_seconds"), int)
                    else {}
                ),
                **({"unclean": True} if event.get("unclean") else {}),
            }
        )
        if down >= GAP_SECONDS:
            gaps.append((moment - timedelta(seconds=down), moment))
    entries.extend(u for _, u in updates if id(u) not in merged)
    for key, item in (config or {}).items():  # when an automation or script was last edited
        moment = _parse(item.get("at"))
        if moment is not None and moment >= since:
            entries.append({"at": item["at"], "kind": "config", "area": "config", "key": key})
    begun = _parse(log_since)
    if begun is not None and begun > since:
        gaps.append((since, begun))  # before the first look nothing is known
    entries.sort(key=lambda e: e["at"], reverse=True)
    shown = [e for e in changes if _stamp(e["at"]) >= since]
    problems = [
        e
        for e in shown
        if e["to"] == "problem"
        and change_id(e) not in dismissed
        and not (e["area"] == "backup" and e["check"] == "run")
    ]
    recurring: dict[str, Any] = {}
    week = now - timedelta(days=7)
    for event in changes:
        if (
            event["to"] == "problem"
            and change_id(event) not in dismissed
            and _stamp(event["at"]) >= week
        ):
            key = f"{event['area']}/{event['check']}"
            recurring[key] = recurring.get(key, 0) + 1
    return {
        "days": days,
        "entries": entries[:limit],
        "total": len(entries),
        "strips": _strips(changes, levels, gaps, now, days),
        "summary": {
            "changes": len(shown),
            "problems": len(problems),
            "flapping": len(
                {
                    f"{changes[i]['area']}/{changes[i]['check']}"
                    for i in flaps
                    if _stamp(changes[i]["at"]) >= since
                }
            ),
            "restarts": sum(1 for e in entries if e["kind"] == "start" and not e.get("updates")),
            "updates": sum(
                1
                for e in entries
                if e["kind"] == "update" or (e["kind"] == "start" and e.get("updates"))
            ),
            "longest_problem_seconds": max(
                (
                    lasted[i]
                    for i in lasted
                    if _stamp(changes[i]["at"]) >= since and changes[i]["to"] == "problem"
                ),
                default=0,
            ),
        },
        "recurring": [
            {"area": key.split("/")[0], "check": key.split("/")[1], "count": count}
            for key, count in sorted(recurring.items(), key=lambda kv: -kv[1])
            if count >= 3
        ],
        "retention_days": CHECK_DAYS,
        "max_events": MAX_CHECK_EVENTS,
    }


def _strips(
    changes: list[dict[str, Any]],
    levels: dict[str, str],
    gaps: list[tuple[datetime, datetime]],
    now: datetime,
    days: int,
) -> list[dict[str, Any]]:
    """Per area the worst level over the window as consecutive segments; ``none`` where nothing ran."""
    start = now - timedelta(days=days)
    span = (now - start).total_seconds()
    areas: dict[str, dict[str, str]] = {}
    for key, level in levels.items():
        area, check = key.split("/", 1)
        if area == "backup" and check == "run":
            continue
        areas.setdefault(area, {})[check] = level
    strips = []
    for area, current in sorted(areas.items()):
        mine = [e for e in changes if e["area"] == area and e["check"] != "run"]
        state = {}
        for check in current:
            first = next(
                (e for e in mine if e["check"] == check and _stamp(e["at"]) >= start), None
            )
            state[check] = first["from"] if first else current[check]
        points = [(max(_stamp(e["at"]), start), e) for e in mine if _stamp(e["at"]) >= start]
        marks = [(start, None)] + points + [(now, None)]
        segments: list[dict[str, Any]] = []
        for (left, event), (right, _) in zip(marks, marks[1:], strict=False):
            if event is not None:
                state[event["check"]] = event["to"]
            worst = max(state.values(), key=lambda lv: _SEVERITY.get(lv, 0), default="ok")
            cuts = sorted({left, right} | {t for g in gaps for t in g if left < t < right})
            for a, b in zip(cuts, cuts[1:], strict=False):
                inside = any(g0 <= a and b <= g1 for g0, g1 in gaps)
                _add(segments, "none" if inside else worst, (b - a).total_seconds() / span)
        strips.append({"area": area, "segments": segments})
    return strips


def _add(segments: list[dict[str, Any]], level: str, share: float) -> None:
    if share <= 0:
        return
    if segments and segments[-1]["level"] == level:
        segments[-1]["share"] += share
    else:
        segments.append({"level": level, "share": share})
