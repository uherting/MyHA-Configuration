"""Exception rules: objects of an area, label, integration, domain, device or entity are left out.

Stored by Housekeeper only; Home Assistant stays untouched. A rule names areas, labels,
integrations, domains, devices or entities (one or more of them) and an action: ``hide`` hides
every finding of the matching objects, ``delay`` holds back only the findings about an outage until
it lasted ``days`` days. An entity counts with its own area, or the one of its device when it has
none, and with its own labels and those of its device. A finding of a matching object that is
hidden by a rule cannot be shown again one by one: what the object is decides.

A config entry that is not loaded (a printer's integration while the printer is off) is covered by
rules for its integration only, as it has no area, labels or entities of its own.

A rule applies ``always`` or only ``vacation``: while the entity chosen as the vacation switch is
``on``. The outage of an object that a vacation rule covers counts from the end of the vacation;
the grace period (hours) then holds the finding back unless a delay rule of its own says how long.

The switch can be a calendar. Without a keyword every running event counts as vacation; with one,
only an event whose title contains it, found by asking the calendar for the events of this moment
(a calendar shows just one running event in its attributes, so that alone could miss it).
Until a switch has been chosen, a helper with a name like ``urlaubsmodus`` or ``vacation_mode`` is only
suggested in the panel; it counts once the user has saved it.
"""

from __future__ import annotations

import secrets
from datetime import datetime, timedelta
from typing import Any, NamedTuple

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.storage import Store

from .const import EXCEPTIONS_STORAGE_KEY, STORAGE_VERSION

SAVE_DELAY = 5
KINDS = ("area", "label", "integration", "domain", "device", "entity")
ACTIONS = ("hide", "delay")
SCOPES = ("always", "vacation")
ITEM_LIMIT = 100
TARGET_LIMIT = 200
TARGET_LENGTH = 255
NOTE_MAX = 200
DAYS_MAX = 365
DAYS_DEFAULT = 7
GRACE_DEFAULT = (
    24  # hours a finding is held back after the vacation, without a delay rule of its own
)
GRACE_MAX = 720
GERMAN_NAMES = ("urlaubsmodus", "urlaub")  # helpers offered as the vacation switch, in this order
ENGLISH_NAMES = ("vacation_mode", "vacation", "holiday_mode", "holiday")
KEYWORD_MAX = 60
AVAILABILITY = frozenset({"unavailable", "unknown", "stale"})  # what a delay rule holds back


class Traits(NamedTuple):
    """What a rule can look at: area, labels, integrations, domain, device and entity."""

    area: str | None
    labels: frozenset[str]
    platforms: frozenset[str] = frozenset()
    domain: str | None = None
    device_id: str | None = None
    entity_id: str | None = None


class Vacation(NamedTuple):
    """Whether the vacation switch is on, when it went off last, and the grace period."""

    active: bool = False
    ended_at: datetime | None = None
    grace_hours: int = GRACE_DEFAULT


def clean_rule(raw: Any) -> dict[str, Any] | None:
    """One rule in its known shape, or None when it cannot be one."""
    if not isinstance(raw, dict) or raw.get("kind") not in KINDS:
        return None
    targets = raw.get("targets")
    if not isinstance(targets, list):
        return None
    clean = list(
        dict.fromkeys(t for t in targets if isinstance(t, str) and 0 < len(t) <= TARGET_LENGTH)
    )
    if not clean or len(clean) > TARGET_LIMIT:
        return None
    scope = raw.get("scope") if raw.get("scope") in SCOPES else "always"
    # A vacation rule only keeps quiet: how long to wait is for the rules that always apply.
    action = raw.get("action") if raw.get("action") in ACTIONS and scope == "always" else "hide"
    days = raw.get("days")
    days = (
        min(max(days, 1), DAYS_MAX)
        if isinstance(days, int) and not isinstance(days, bool)
        else DAYS_DEFAULT
    )
    rule_id = raw.get("id")
    return {
        "id": rule_id
        if isinstance(rule_id, str) and 0 < len(rule_id) <= 40
        else secrets.token_hex(4),
        "kind": raw["kind"],
        "targets": clean,
        "action": action,
        "days": days if action == "delay" else None,
        "scope": scope,
        "enabled": raw.get("enabled") is not False,
        "note": str(raw.get("note") or "").strip()[:NOTE_MAX],
    }


def traits(hass: HomeAssistant, object_type: str, object_id: str) -> Traits | None:
    """What counts for an entity or a device; None for anything else."""
    devices = dr.async_get(hass)
    if object_type == "device":
        device = devices.async_get(object_id)
        if device is None:
            return None
        entries = (hass.config_entries.async_get_entry(i) for i in device.config_entries)
        return Traits(
            device.area_id,
            frozenset(device.labels),
            frozenset(e.domain for e in entries if e is not None),
            None,
            device.id,
            None,
        )
    if object_type != "entity":
        return None
    entry = er.async_get(hass).async_get(object_id)
    if entry is None:
        return None
    device = devices.async_get(entry.device_id) if entry.device_id else None
    area = entry.area_id or (device.area_id if device is not None else None)
    return Traits(
        area,
        frozenset(entry.labels) | frozenset(device.labels if device is not None else ()),
        frozenset({entry.platform}),
        entry.entity_id.partition(".")[0],
        entry.device_id,
        entry.entity_id,
    )


def entry_traits(hass: HomeAssistant, entry_id: str) -> Traits | None:
    """What counts for a config entry: only its integration, as it has no area or labels."""
    entry = hass.config_entries.async_get_entry(entry_id)
    if entry is None:
        return None
    return Traits(None, frozenset(), frozenset({entry.domain}))


def matches(rule: dict[str, Any], found: Traits) -> bool:
    """Whether an enabled rule covers an object; its scope is looked at by ``verdict``."""
    if not rule["enabled"]:
        return False
    targets, kind = rule["targets"], rule["kind"]
    if kind == "area":
        return found.area is not None and found.area in targets
    if kind == "integration":
        return not found.platforms.isdisjoint(targets)
    if kind == "domain":
        return found.domain is not None and found.domain in targets
    if kind == "device":
        return found.device_id is not None and found.device_id in targets
    if kind == "entity":
        return found.entity_id is not None and found.entity_id in targets
    return not found.labels.isdisjoint(targets)


def _since(finding: dict[str, Any]) -> datetime | None:
    try:
        return datetime.fromisoformat(finding["first_detected_at"])
    except (KeyError, TypeError, ValueError):
        return None


def is_outage(finding: dict[str, Any]) -> bool:
    """Whether a finding is about an object that is not reachable, which a delay can wait for."""
    return finding.get("classification") in AVAILABILITY or finding.get("rule_id") in (
        "device.down",
        "config_entry.not_loaded",
    )


def verdict(
    rules: list[dict[str, Any]],
    found: Traits,
    finding: dict[str, Any],
    now: datetime,
    vacation: Vacation = Vacation(),  # noqa: B008
) -> dict[str, Any] | None:
    """What the rules do with one finding of an object with these traits.

    ``state`` is ``hide`` (hidden), ``hold`` (an outage not yet old enough, with the moment it is,
    in ``until``) or ``due`` (a delay has passed, so the finding shows with a note). ``phase`` says
    ``vacation`` while the vacation switch is on, ``after`` for what the end of a vacation holds
    back, else None. ``hide`` beats ``delay``; of several delays the longest counts.
    """
    hits = [rule for rule in rules if matches(rule, found)]
    live = [rule for rule in hits if rule["scope"] == "always" or vacation.active]
    for rule in live:
        if rule["action"] == "hide":
            return _result("hide", rule, None, vacation)
    since = _since(finding)
    if since is None or not is_outage(finding):
        return None
    delays = [rule for rule in hits if rule["action"] == "delay"]
    ended = vacation.ended_at
    covered = (
        not vacation.active and ended is not None and any(r["scope"] == "vacation" for r in hits)
    )
    if covered and ended is not None and since < ended:  # the vacation swallowed the start of it
        if delays:
            rule = max(delays, key=lambda r: r["days"])
            until = ended + timedelta(days=rule["days"])
            return _result("hold" if now < until else "due", rule, until, vacation, "after")
        until = ended + timedelta(hours=vacation.grace_hours)
        if now < until:
            return _result("hold", None, until, vacation, "after")
        return None
    live_delays = [rule for rule in live if rule["action"] == "delay"]
    if not live_delays:
        return None
    rule = max(live_delays, key=lambda r: r["days"])
    until = since + timedelta(days=rule["days"])
    return _result("hold" if now < until else "due", rule, until, vacation)


def _result(
    state: str,
    rule: dict[str, Any] | None,
    until: datetime | None,
    vacation: Vacation,
    phase: str | None = None,
) -> dict[str, Any]:
    if phase is None and rule is not None and rule["scope"] == "vacation" and vacation.active:
        phase = "vacation"
    brief = (
        {k: rule[k] for k in ("id", "kind", "targets", "action", "days", "scope")}
        if rule is not None
        else {
            "id": None,
            "kind": None,
            "targets": [],
            "action": "delay",
            "days": None,
            "scope": "vacation",
        }
    )
    return {
        "state": state,
        "rule": brief,
        "until": until.isoformat() if until else None,
        "phase": phase,
    }


def preview(
    hass: HomeAssistant,
    rule: dict[str, Any] | list[dict[str, Any]],
    snapshot: dict[str, Any],
    now: datetime,
    vacation: Vacation = Vacation(),  # noqa: B008
    others: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """What a rule, or the rules made from one form, do to the findings of the last scan; ``overlap`` names the other rules on the same objects.

    A vacation rule is looked at as if the vacation were on, so its effect can be seen before it is.
    """
    names = {i["object_id"]: i["name"] for i in snapshot.get("objects", []) if i.get("name")}
    counts = {"hide": 0, "hold": 0, "due": 0}
    objects: set[str] = set()
    overlap: set[str] = set()
    important: list[dict[str, str]] = []
    drafts = rule if isinstance(rule, list) else [rule]
    own = {r["id"] for r in drafts}
    on = (
        Vacation(True, vacation.ended_at, vacation.grace_hours)
        if drafts[0]["scope"] == "vacation"
        else vacation
    )
    for finding in snapshot.get("findings", []):
        if finding.get("ignored_by") not in (None, "rule"):
            continue
        object_id = finding["object_id"]
        found = traits(hass, "entity" if "." in object_id else "device", object_id)
        result = verdict(drafts, found, finding, now, on) if found is not None else None
        if result is None:
            continue
        counts[result["state"]] += 1
        objects.add(object_id)
        overlap.update(r["id"] for r in others or [] if r["id"] not in own and matches(r, found))
        if result["state"] != "due" and finding.get("impact") == "high" and len(important) < 5:
            important.append({"object_id": object_id, "name": names.get(object_id, object_id)})
    return {**counts, "objects": len(objects), "important": important, "overlap": sorted(overlap)}


class ExceptionStore:
    """The exception rules and the settings of the vacation mode."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, EXCEPTIONS_STORAGE_KEY)
        self.rules: list[dict[str, Any]] = []
        self._entity: str | None = None
        self._chosen = False  # whether the switch was chosen (or left empty) by the user
        self.keyword = ""  # for a calendar: the word an event title must contain
        self._keyword_hit: bool | None = None  # whether such an event runs now; None until asked
        self.grace_hours = GRACE_DEFAULT
        self.was_active = False
        self.ended_at: datetime | None = None

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if not isinstance(data, dict):
            return
        items = data.get("rules")
        cleaned = (clean_rule(item) for item in items) if isinstance(items, list) else ()
        self.rules = [rule for rule in cleaned if rule is not None][:ITEM_LIMIT]
        vac = data.get("vacation")
        if isinstance(vac, dict):
            self._entity = vac["entity"] if isinstance(vac.get("entity"), str) else None
            # Older data has no "chosen": a stored entity was chosen, an empty one is taken as never chosen.
            self._chosen = vac.get("chosen") is True or (
                "chosen" not in vac and self._entity is not None
            )
            keyword = vac.get("keyword")
            self.keyword = keyword.strip()[:KEYWORD_MAX] if isinstance(keyword, str) else ""
            grace = vac.get("grace_hours")
            self.grace_hours = (
                min(max(grace, 0), GRACE_MAX) if isinstance(grace, int) else GRACE_DEFAULT
            )
            self.was_active = vac.get("was_active") is True
            try:
                self.ended_at = datetime.fromisoformat(vac["ended_at"])
            except (KeyError, TypeError, ValueError):
                self.ended_at = None

    def _save(self) -> None:
        self._store.async_delay_save(self._data, SAVE_DELAY)

    def _data(self) -> dict[str, Any]:
        return {
            "rules": self.rules,
            "vacation": {
                "entity": self._entity,
                "chosen": self._chosen,
                "keyword": self.keyword,
                "grace_hours": self.grace_hours,
                "was_active": self.was_active,
                "ended_at": self.ended_at.isoformat() if self.ended_at else None,
            },
        }

    def set_rules(self, raw: list[Any]) -> str | None:
        """Replace all rules; the reason it failed, or None."""
        if len(raw) > ITEM_LIMIT:
            return "too_many"
        cleaned = [clean_rule(item) for item in raw]
        if any(rule is None for rule in cleaned):
            return "invalid"
        self.rules = [rule for rule in cleaned if rule is not None]
        self._save()
        return None

    @property
    def entity(self) -> str | None:
        """The vacation switch chosen by the user."""
        return self._entity

    def suggestion(self) -> str | None:
        """A helper that looks like a vacation switch, offered while none was chosen; never used unasked."""
        if self._chosen:
            return None
        german = str(self.hass.config.language).startswith("de")
        names = GERMAN_NAMES + ENGLISH_NAMES if german else ENGLISH_NAMES + GERMAN_NAMES
        return next(
            (f"input_boolean.{n}" for n in names if self.hass.states.get(f"input_boolean.{n}")),
            None,
        )

    def set_vacation(
        self, entity: str | None, grace_hours: int, now: datetime, keyword: str = ""
    ) -> str | None:
        """Choose the vacation switch and the grace period; the reason it failed, or None."""
        if entity is not None and (
            "." not in entity or len(entity) > TARGET_LENGTH or not 0 <= grace_hours <= GRACE_MAX
        ):
            return "invalid"
        self._entity = entity or None
        self._chosen = True
        self.keyword = keyword.strip()[:KEYWORD_MAX]
        self._keyword_hit = None
        self.grace_hours = grace_hours
        self.was_active = False
        self.sync(now)
        return None

    def _calendar_keyword(self) -> str:
        """The keyword to look for, or "" when the switch is no calendar or takes every event."""
        entity = self.entity
        return self.keyword.casefold() if entity and entity.startswith("calendar.") else ""

    def needs_calendar(self) -> bool:
        """Whether the calendar has to be asked for the events of this moment."""
        return bool(self._calendar_keyword())

    async def async_refresh_calendar(self, now: datetime) -> None:
        """Ask the calendar which events run now and note whether one of them has the keyword."""
        word, entity = self._calendar_keyword(), self.entity
        if not word or entity is None:
            self._keyword_hit = None
            return
        state = self.hass.states.get(entity)
        if state is None or state.state != "on":
            self._keyword_hit = False
            return
        try:
            result = await self.hass.services.async_call(
                "calendar",
                "get_events",
                {
                    "entity_id": entity,
                    "start_date_time": now,
                    "end_date_time": now + timedelta(seconds=1),
                },
                blocking=True,
                return_response=True,
            )
            events = (result or {}).get(entity, {}).get("events", [])
            self._keyword_hit = any(
                word in str(event.get("summary") or "").casefold() for event in events
            )
        except Exception:  # the calendar cannot be asked: the title it shows may still tell
            self._keyword_hit = None

    def switch_state(self) -> str | None:
        """The state of the vacation switch, or None when none is chosen or it is missing.

        A calendar with a keyword reads "off" while it has events but none with the keyword.
        """
        entity = self.entity
        state = self.hass.states.get(entity) if entity else None
        if state is None:
            return None
        word = self._calendar_keyword()
        if word and state.state == "on":
            hit = self._keyword_hit
            if hit is None:  # not asked yet, or the calendar could not be asked: the shown title
                hit = word in str(state.attributes.get("message") or "").casefold()
            return "on" if hit else "off"
        return state.state

    def active(self) -> bool:
        """Whether the vacation is on; a switch that is missing or has no state counts as off."""
        return self.switch_state() == "on"

    def sync(self, now: datetime) -> bool:
        """Note that the vacation began or ended; True when that changed."""
        if self.switch_state() in (None, "unavailable", "unknown"):
            return False  # no news: a switch that blinks must not look like the end of a vacation
        active = self.active()
        if active == self.was_active:
            return False
        self.was_active = active
        if not active:
            self.ended_at = now
        self._save()
        return True

    def vacation(self) -> Vacation:
        return Vacation(self.active(), self.ended_at, self.grace_hours)
