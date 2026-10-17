"""Success criteria: what an automation is supposed to achieve, defined by the person.

A run without an error is not a run that did its job. A ``state`` criterion names target entities,
the state they should have and a time limit: when the automation fires, Housekeeper looks once after
that time (and, if asked, once more after a hold time) and counts "reached" or "missed" per day. A
``call`` criterion names a service (a notification, a script): it is reached when this very run
called it within the time limit, matched by the context of the run and never by the clock. Nothing is
guessed: without a criterion nothing is watched. Only counters and the time of the last outcomes are
kept, never the states.
"""

from __future__ import annotations

import re
import secrets
from collections.abc import Callable
from datetime import UTC, date, datetime, timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers.event import async_call_later
from homeassistant.helpers.storage import Store

from .const import CRITERIA_STORAGE_KEY, STORAGE_VERSION

MAX_CRITERIA = 50
MAX_TARGETS = 5
WITHIN_MAX = 300  # seconds
HOLD_MAX = 300
STATE_MAX = 100
RECENT = 20  # last outcomes kept per automation
RETENTION_DAYS = 60
MAX_PENDING = 100
WINDOW_DAYS = 7
MISSED_MIN = 3  # missed outcomes in the window before it is a finding
MISSED_RATE = 0.5
SAVE_DELAY = 300
TYPES = ("state", "call")
ID = re.compile(r"^[a-z0-9_-]{1,32}$")
ENTITY = re.compile(r"^[a-z0-9_]+\.[a-z0-9_]+$")
AUTOMATION = re.compile(r"^automation\.[a-z0-9_]+$")
THRESHOLDS = {
    "max_criteria": MAX_CRITERIA,
    "max_targets": MAX_TARGETS,
    "within_max_seconds": WITHIN_MAX,
    "hold_max_seconds": HOLD_MAX,
    "missed_min": MISSED_MIN,
    "missed_rate": MISSED_RATE,
}


def validate(criteria: Any) -> list[dict[str, Any]]:
    """The cleaned criteria of one automation, or ``ValueError`` saying what is wrong."""
    if not isinstance(criteria, list):
        raise ValueError("criteria must be a list")
    clean = []
    used: set[str] = set()
    for entry in criteria:
        if not isinstance(entry, dict):
            raise ValueError("a criterion must be an object")
        kind = entry.get("type", "state")
        if kind not in TYPES:
            raise ValueError("a criterion is a state or a call")
        within, hold = entry.get("within"), entry.get("hold", 0)
        if isinstance(within, bool) or not isinstance(within, int) or not 1 <= within <= WITHIN_MAX:
            raise ValueError(f"the time limit is 1 to {WITHIN_MAX} seconds")
        extra: dict[str, Any]
        if kind == "call":
            service = entry.get("service")
            if not isinstance(service, str) or not ENTITY.match(service):
                raise ValueError("a call criterion needs a service like notify.phone")
            extra, hold = {"service": service, "targets": []}, 0
        else:
            targets = entry.get("targets")
            if not isinstance(targets, list) or not 1 <= len(targets) <= MAX_TARGETS:
                raise ValueError(f"a criterion needs 1 to {MAX_TARGETS} targets")
            cleaned_targets = []
            for target in targets:
                entity_id = target.get("entity_id") if isinstance(target, dict) else None
                state = target.get("state") if isinstance(target, dict) else None
                if not isinstance(entity_id, str) or not ENTITY.match(entity_id):
                    raise ValueError("a target needs an entity ID")
                if not isinstance(state, str) or not 1 <= len(state) <= STATE_MAX:
                    raise ValueError("a target needs the expected state")
                cleaned_targets.append({"entity_id": entity_id, "state": state})
            extra = {"targets": cleaned_targets}
            if isinstance(hold, bool) or not isinstance(hold, int) or not 0 <= hold <= HOLD_MAX:
                raise ValueError(f"the hold time is 0 to {HOLD_MAX} seconds")
        ident = entry.get("id")
        if not isinstance(ident, str) or not ID.match(ident) or ident in used:
            ident = secrets.token_hex(3)
        used.add(ident)
        clean.append(
            {
                "id": ident,
                "type": kind,
                **extra,
                "within": within,
                "hold": hold,
            }
        )
    return clean


class CriteriaStore:
    """The criteria, their daily outcomes and the timers that check them."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, CRITERIA_STORAGE_KEY)
        self.items: dict[str, list[dict[str, Any]]] = {}
        self.days: dict[str, dict[str, list[int]]] = {}
        self.recent: dict[str, list[dict[str, Any]]] = {}
        self._pending: dict[int, CALLBACK_TYPE] = {}
        self._watches: dict[str, list[dict[str, Any]]] = {}  # context ID -> open call checks
        self._counter = 0

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if not isinstance(data, dict):
            return
        items = data.get("items")
        for entity_id, criteria in items.items() if isinstance(items, dict) else ():
            try:
                if AUTOMATION.match(entity_id):
                    self.items[entity_id] = validate(criteria)
            except (ValueError, TypeError):
                continue
        days = data.get("days")
        for entity_id, per_day in days.items() if isinstance(days, dict) else ():
            if isinstance(per_day, dict):
                self.days[entity_id] = {
                    day: counts
                    for day, counts in per_day.items()
                    if isinstance(counts, list)
                    and len(counts) == 2
                    and all(isinstance(n, int) and n >= 0 for n in counts)
                }
        recent = data.get("recent")
        for entity_id, entries in recent.items() if isinstance(recent, dict) else ():
            if isinstance(entries, list):
                self.recent[entity_id] = [
                    e for e in entries if isinstance(e, dict) and isinstance(e.get("at"), str)
                ][-RECENT:]

    def _data(self) -> dict[str, Any]:
        return {"items": self.items, "days": self.days, "recent": self.recent}

    def _save(self) -> None:
        self._store.async_delay_save(self._data, SAVE_DELAY)

    @property
    def total(self) -> int:
        return sum(len(criteria) for criteria in self.items.values())

    def set(self, entity_id: str, criteria: Any) -> list[dict[str, Any]]:
        """Replace the criteria of one automation; an empty list removes them."""
        if not AUTOMATION.match(entity_id):
            raise ValueError("an automation entity ID is needed")
        clean = validate(criteria)
        if self.total - len(self.items.get(entity_id, [])) + len(clean) > MAX_CRITERIA:
            raise ValueError(f"at most {MAX_CRITERIA} criteria")
        if clean:
            self.items[entity_id] = clean
        else:  # without criteria the outcomes mean nothing any more
            for part in (self.items, self.days, self.recent):
                part.pop(entity_id, None)
        self._save()
        return clean

    # -- watching -----------------------------------------------------------------------------

    def _reached(self, targets: list[dict[str, str]], since: datetime | None = None) -> bool:
        for target in targets:
            state = self._hass.states.get(target["entity_id"])
            if state is None or state.state != target["state"]:
                return False
            if since is not None and state.last_changed > since:
                return False
        return True

    @property
    def watching(self) -> bool:
        """Whether a call criterion is waiting for a service call (the listeners do nothing else)."""
        return bool(self._watches)

    def start(self, entity_id: str, context_id: str | None = None) -> None:
        """An automation fired: look at each of its criteria after the time limit."""
        for criterion in self.items.get(entity_id, []):
            if len(self._pending) >= MAX_PENDING:
                return
            if criterion.get("type") == "call":
                watch = {"service": criterion["service"], "hit": False, "context": context_id}
                if context_id:
                    self._watches.setdefault(context_id, []).append(watch)
                self._later(
                    criterion["within"],
                    lambda now, c=criterion, w=watch: self._finish(entity_id, c, w),
                )
                continue
            self._later(criterion["within"], lambda now, c=criterion: self._first(entity_id, c))

    def saw(self, service: str, *contexts: str | None) -> None:
        """A service was called (or a script started) in one of these contexts."""
        for context_id in contexts:
            for watch in self._watches.get(context_id or "", []):
                if watch["service"] == service:
                    watch["hit"] = True

    def _finish(self, entity_id: str, criterion: dict[str, Any], watch: dict[str, Any]) -> None:
        context_id = watch["context"]
        if context_id in self._watches:
            self._watches[context_id] = [w for w in self._watches[context_id] if w is not watch]
            if not self._watches[context_id]:
                del self._watches[context_id]
        if entity_id in self.items:
            self._record(entity_id, criterion["id"], ok=watch["hit"])

    def _later(self, seconds: int, action: Callable[[datetime], None]) -> None:
        self._counter += 1
        key = self._counter

        @callback
        def fire(now: datetime) -> None:
            self._pending.pop(key, None)
            action(now)

        self._pending[key] = async_call_later(self._hass, seconds, fire)

    def _first(self, entity_id: str, criterion: dict[str, Any]) -> None:
        if entity_id not in self.items:
            return
        checked = datetime.now(UTC)
        if not self._reached(criterion["targets"]):
            self._record(entity_id, criterion["id"], ok=False)
        elif criterion["hold"] <= 0:
            self._record(entity_id, criterion["id"], ok=True)
        else:
            self._later(
                criterion["hold"],
                lambda now: self._record(
                    entity_id,
                    criterion["id"],
                    ok=self._reached(criterion["targets"], since=checked),
                ),
            )

    def _record(self, entity_id: str, criterion_id: str, *, ok: bool) -> None:
        now = datetime.now(UTC)
        counts = self.days.setdefault(entity_id, {}).setdefault(now.date().isoformat(), [0, 0])
        counts[0 if ok else 1] += 1
        recent = self.recent.setdefault(entity_id, [])
        recent.append({"at": now.isoformat(), "ok": ok, "crit": criterion_id})
        del recent[:-RECENT]
        self._prune(now.date())
        self._save()

    def _prune(self, today: date) -> None:
        limit = (today - timedelta(days=RETENTION_DAYS)).isoformat()
        for per_day in self.days.values():
            for day in [d for d in per_day if d < limit]:
                del per_day[day]
        for entity_id in [e for e, per_day in self.days.items() if not per_day]:
            del self.days[entity_id]

    def cancel_all(self) -> None:
        """Drop the timers that are still waiting (the integration is unloading)."""
        for cancel in self._pending.values():
            cancel()
        self._pending.clear()
        self._watches.clear()

    # -- numbers ------------------------------------------------------------------------------

    def stats(self, entity_id: str, today: date) -> dict[str, int]:
        """Reached and missed outcomes of the last ``WINDOW_DAYS`` days."""
        first = (today - timedelta(days=WINDOW_DAYS - 1)).isoformat()
        ok = missed = 0
        for day, counts in (self.days.get(entity_id) or {}).items():
            if day >= first:
                ok += counts[0]
                missed += counts[1]
        return {"ok": ok, "missed": missed}

    def alerts(self, today: date) -> list[dict[str, Any]]:
        """Automations whose criteria were missed again and again in the window."""
        found = []
        for entity_id in self.items:
            numbers = self.stats(entity_id, today)
            total = numbers["ok"] + numbers["missed"]
            if numbers["missed"] >= MISSED_MIN and numbers["missed"] / total >= MISSED_RATE:
                found.append({"entity_id": entity_id, **numbers})
        return sorted(found, key=lambda a: (-a["missed"], a["entity_id"]))

    def findings(self, today: date, known: set[str]) -> list[dict[str, Any]]:
        """The alerts as findings of the automations that still exist."""
        return [
            {
                "rule_id": "automation.goal_missed",
                "object_id": alert["entity_id"],
                "classification": "problem",
                "confidence": 0.8,
                "first_detected_at": None,
                "evidence": [
                    {
                        "kind": "goal_missed",
                        "source": "criteria",
                        "missed": alert["missed"],
                        "reached": alert["ok"],
                        "window_days": WINDOW_DAYS,
                    }
                ],
            }
            for alert in self.alerts(today)
            if alert["entity_id"] in known
        ]

    def view(self, entity_id: str, today: date) -> dict[str, Any]:
        """What the panel shows for one automation."""
        return {
            "entity_id": entity_id,
            "criteria": self.items.get(entity_id, []),
            "stats": self.stats(entity_id, today),
            "recent": self.recent.get(entity_id, []),
            "days": self.days.get(entity_id, {}),
        }


@callback
def async_listen(hass: HomeAssistant, store: CriteriaStore) -> CALLBACK_TYPE:
    """Start the checks whenever an automation with criteria fires, and see its service calls."""

    @callback
    def fired(event: Event) -> None:
        entity_id = event.data.get("entity_id")
        if isinstance(entity_id, str) and entity_id in store.items:
            store.start(entity_id, event.context.id)

    @callback
    def called(event: Event) -> None:
        data = event.data
        if event.event_type == "script_started":
            name = data.get("entity_id")
        else:
            name = f"{data.get('domain')}.{data.get('service')}"
        if isinstance(name, str):
            store.saw(name, event.context.id, event.context.parent_id)

    @callback
    def open_checks(_data: Any) -> bool:
        return store.watching

    stops = [
        hass.bus.async_listen("automation_triggered", fired),
        hass.bus.async_listen("call_service", called, event_filter=open_checks),
        hass.bus.async_listen("script_started", called, event_filter=open_checks),
    ]

    @callback
    def stop() -> None:
        for unsub in stops:
            unsub()

    return stop
