"""User-defined important functions, evaluated from the last inventory scan.

Only direct, explicitly selected objects affect a function. A scan gap is never
treated as a repair, and a normal entity state such as ``off`` is not a fault.
"""

from __future__ import annotations

import secrets
from datetime import UTC, datetime, timedelta
from math import isfinite
from typing import Any

from homeassistant.components import persistent_notification
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    DEFAULT_HISTORY_DAYS,
    DOMAIN,
    MONITOR_STORAGE_KEY,
    PANEL_URL,
    SIGNAL_MONITOR_DEFINITIONS,
    SIGNAL_MONITOR_EVENT,
    STORAGE_VERSION,
)
from .scan_health import stale_after
from .texts import pick

SAVE_DELAY = 5
MAX_ITEMS = 30
MAX_MEMBERS = 12
NAME_MAX = 80
DESCRIPTION_MAX = 240
MAX_RULES = 3
MAX_HISTORY = 300
HISTORY_STATES = frozenset({"ok", "problem", "unverified"})
HISTORY_KINDS = HISTORY_STATES | {"created", "edited", "enabled", "disabled", "flapping"}
# This many state changes within this window become one "flapping" entry, which later changes extend.
FLAP_CHANGES = 4
FLAP_WINDOW = timedelta(hours=3)
HISTORY_LISTS = ("added", "removed", "changed", "fields")
RULE_LIMITS = {
    "freshness": (1, 720),
    "min_value": (-1_000_000_000, 1_000_000_000),
    "unavailable_for": (1, 1440),
}
MEMBER_TYPES = frozenset(
    {"entity", "device", "automation", "config_entry", "scene", "script", "app"}
)
AUTOMATION_RULES = frozenset(
    {"automation.blocked", "automation.dead_actions", "automation.dead_condition"}
)
STATE_OK = "ok"
STATE_PROBLEM = "problem"
STATE_UNVERIFIED = "unverified"
STATE_DISABLED = "disabled"
MANUAL_STALE_AFTER = timedelta(days=7)
EVENT_NAME = f"{DOMAIN}_monitor"
REASONS_DE = {
    "missing": "Objekt fehlt",
    "disabled": "deaktiviert",
    "orphaned": "verwaist",
    "unavailable": "nicht verfügbar",
    "problem": "Integration nicht geladen",
    "source_unread": "Quelle nicht gelesen",
    "scan_unverified": "Scan nicht verlässlich",
    "automation.blocked": "Automation blockiert",
    "automation.dead_actions": "Automationsaktion mit defektem Verweis",
    "automation.dead_condition": "Automationsbedingung mit defektem Verweis",
    "broken_reference": "Defekter Verweis",
    "stopped": "App gestoppt",
    "rule_stale": "Wert nicht rechtzeitig aktualisiert",
    "rule_below_min": "Mindestwert unterschritten",
    "rule_unavailable_long": "Zu lange nicht verfügbar",
    "rule_waiting": "Wartezeit läuft",
    "rule_no_value": "Kein numerischer Wert",
    "rule_no_timestamp": "Aktualisierungszeit unbekannt",
}
REASONS_EN = {
    "missing": "object missing",
    "disabled": "disabled",
    "orphaned": "orphaned",
    "unavailable": "unavailable",
    "problem": "integration not loaded",
    "source_unread": "source unread",
    "scan_unverified": "scan not reliable",
    "automation.blocked": "automation blocked",
    "automation.dead_actions": "automation action has a broken reference",
    "automation.dead_condition": "automation condition has a broken reference",
    "broken_reference": "broken reference",
    "stopped": "app stopped",
    "rule_stale": "value not updated in time",
    "rule_below_min": "below minimum value",
    "rule_unavailable_long": "unavailable for too long",
    "rule_waiting": "grace period running",
    "rule_no_value": "no numeric value",
    "rule_no_timestamp": "update time unknown",
}
MONITOR_REASONS = {"de": REASONS_DE, "en": REASONS_EN}
MONITOR_TEXTS = {
    "de": {
        "uncertain_open": "Prüfung unvollständig; letzter bestätigter Defekt ({last_reason}) bleibt ungeklärt.",
        "uncertain": "Prüfung unvollständig.",
        "impaired": "Wichtige Funktion beeinträchtigt: {reason}",
        "link": "Hausfunktionen öffnen",
    },
    "en": {
        "uncertain_open": "Check incomplete; the last confirmed fault ({last_reason}) remains unresolved.",
        "uncertain": "Check incomplete.",
        "impaired": "Important function impaired: {reason}",
        "link": "Open home functions",
    },
}


AVAILABILITY_DAYS = 30
_DAY_RANK = {"ok": 1, "unverified": 2, "flapping": 3, "problem": 4}


def _segments(entries: list[dict[str, Any]], now: datetime) -> list[tuple[datetime, datetime, str]]:
    """The stretches of time in which the function had one known state, from the dated entries (oldest first).

    Disabled periods, the time after an edit of the members and the time before the first evaluation have no
    state and are left out, so they count neither for nor against the function.
    """
    timeline: list[tuple[datetime, str | None]] = []
    for entry in entries:
        at, kind = _time(entry["at"]), entry["kind"]
        if at is None:
            continue
        if kind in HISTORY_STATES:
            timeline.append((at, kind))
        elif kind == "flapping" and (until := _time(entry.get("until"))):
            timeline += [(at, "flapping"), (until, entry["state"])]
        elif kind in ("created", "enabled", "disabled") or (
            kind == "edited"
            and (entry.get("added") or entry.get("removed") or entry.get("changed"))
        ):
            timeline.append((at, None))
    segments: list[tuple[datetime, datetime, str]] = []
    for index, (begin, state) in enumerate(timeline):
        end = timeline[index + 1][0] if index + 1 < len(timeline) else now
        end = min(end, now)
        if state is None or end <= begin:
            continue
        if segments and segments[-1][2] == state and segments[-1][1] == begin:
            segments[-1] = (segments[-1][0], end, state)
        else:
            segments.append((begin, end, state))
    return segments


def availability(
    entries: list[dict[str, Any]], now: datetime, days: int = AVAILABILITY_DAYS
) -> dict[str, Any]:
    """How long the function was in which state during the last `days`, and how it went day by day."""
    start = now - timedelta(days=days)
    seconds = {"ok": 0.0, "problem": 0.0, "unverified": 0.0, "flapping": 0.0}
    clipped: list[tuple[datetime, datetime, str]] = []
    for begin, end, state in _segments(entries, now):
        begin = max(begin, start)
        if end > begin:
            clipped.append((begin, end, state))
            seconds[state] += (end - begin).total_seconds()
    observed = sum(seconds.values())
    problems = [
        (end - begin).total_seconds() for begin, end, state in clipped if state == "problem"
    ]
    worst: dict[str, str] = {}
    for begin, end, state in clipped:
        day = dt_util.as_local(begin).date()
        last = dt_util.as_local(end - timedelta(microseconds=1)).date()
        while day <= last:
            if _DAY_RANK[state] > _DAY_RANK.get(worst.get(day.isoformat(), ""), 0):
                worst[day.isoformat()] = state
            day += timedelta(days=1)
    first = dt_util.as_local(start).date()
    return {
        "window_days": days,
        "since": clipped[0][0].isoformat() if clipped else None,
        "observed_seconds": round(observed),
        "ok_seconds": round(seconds["ok"]),
        "problem_seconds": round(seconds["problem"]),
        "unknown_seconds": round(seconds["unverified"]),
        "unstable_seconds": round(seconds["flapping"]),
        "incidents": len(problems),
        "longest_seconds": round(max(problems, default=0)),
        "days": [
            {"date": (day := (first + timedelta(days=i)).isoformat()), "state": worst.get(day)}
            for i in range((dt_util.as_local(now).date() - first).days + 1)
        ],
    }


class MonitorError(Exception):
    """A definition is invalid; the message names the field."""


def _time(value: Any) -> datetime | None:
    try:
        return datetime.fromisoformat(value) if isinstance(value, str) else None
    except ValueError:
        return None


def _source(member_type: str) -> str:
    if member_type in {"automation", "script", "scene"}:
        return "automations"
    return "apps" if member_type == "app" else "registry"


def _member_state(
    member: dict[str, Any],
    objects: dict[str, dict[str, Any]],
    findings: dict[str, list[dict[str, Any]]],
    coverage: dict[str, str],
    now: datetime,
) -> dict[str, Any]:
    key = member["object_key"]
    kind, _ = key.split(":", 1)
    item = objects.get(key)
    rules = member.get("rules", [])
    source_state = coverage.get(_source(kind), "unknown")
    if item is None:
        state = STATE_PROBLEM if source_state == "checked" else STATE_UNVERIFIED
        reason = "missing" if state == STATE_PROBLEM else "source_unread"
    elif source_state in {"skipped", "unknown", "absent"}:
        state, reason = STATE_UNVERIFIED, "source_unread"
    else:
        status = item.get("status")
        bad = {
            "entity": {"disabled", "orphaned", "unavailable"},
            "device": {"disabled"},
            "automation": {"disabled", "unavailable"},
            "config_entry": {"disabled", "problem"},
            "scene": {"unavailable"},
            "script": {"unavailable"},
            "app": {"stopped"},
        }[kind]
        uncertain = {
            "entity": {"unknown"},
            "device": {"empty"},
            "automation": {"unknown"},
            "config_entry": {"ignored"},
            "scene": {"unknown"},
            "script": {"unknown"},
            "app": {"unknown"},
        }[kind]
        grace = next((rule["value"] for rule in rules if rule["kind"] == "unavailable_for"), None)
        if kind == "entity" and status == "unavailable" and grace is not None:
            since = _time(item.get("status_since"))
            if since is None:
                state, reason = STATE_UNVERIFIED, "rule_no_timestamp"
            elif now - since >= timedelta(minutes=grace):
                state, reason = STATE_PROBLEM, "rule_unavailable_long"
            else:
                state, reason = STATE_UNVERIFIED, "rule_waiting"
        elif status in bad:
            state, reason = STATE_PROBLEM, str(status)
        elif status in uncertain or status != "active":
            state, reason = STATE_UNVERIFIED, str(status or "status_unknown")
        else:
            state, reason = STATE_OK, "active"
        if kind == "entity" and state == STATE_OK:
            for rule in rules:
                if rule["kind"] == "freshness":
                    updated = _time(item.get("last_updated"))
                    if updated is None:
                        state, reason = STATE_UNVERIFIED, "rule_no_timestamp"
                    elif now - updated > timedelta(hours=rule["value"]):
                        state, reason = STATE_PROBLEM, "rule_stale"
                elif rule["kind"] == "min_value":
                    try:
                        value = float(item.get("state"))
                    except (TypeError, ValueError):
                        state, reason = STATE_UNVERIFIED, "rule_no_value"
                    else:
                        if not isfinite(value):
                            state, reason = STATE_UNVERIFIED, "rule_no_value"
                        elif value < rule["value"]:
                            state, reason = STATE_PROBLEM, "rule_below_min"
                if state == STATE_PROBLEM:
                    break
        if kind in {"automation", "script", "scene"} and state == STATE_OK:
            broken = next(
                (
                    finding
                    for finding in findings.get(key, ())
                    if not finding.get("ignored")
                    and not finding.get("runtime_created")
                    and (
                        finding.get("classification") == "broken_reference"
                        or kind == "automation"
                        and finding.get("rule_id") in AUTOMATION_RULES
                    )
                ),
                None,
            )
            if broken is not None:
                state, reason = (
                    STATE_PROBLEM,
                    str(broken["rule_id"] if kind == "automation" else "broken_reference"),
                )
    return {
        "object_key": key,
        "state": state,
        "reason": reason,
        "required": member["required"],
        "rules": rules,
    }


def evaluate(
    definition: dict[str, Any],
    snapshot: dict[str, Any] | None,
    health: dict[str, Any] | None,
    now: datetime,
) -> dict[str, Any]:
    """Evaluate one function without changing the stored definition or incident."""
    meta = (snapshot or {}).get("meta") or {}
    scanned_at = meta.get("scanned_at")
    if definition.get("enabled") is False:
        return {
            "id": definition["id"],
            "name": definition["name"],
            "description": definition["description"],
            "notify": definition["notify"],
            "enabled": False,
            "members": [
                {
                    "object_key": member["object_key"],
                    "state": STATE_DISABLED,
                    "reason": "disabled",
                    "required": member["required"],
                    "rules": member.get("rules", []),
                }
                for member in definition["members"]
            ],
            "state": STATE_DISABLED,
            "reason": "disabled",
            "reason_key": None,
            "scanned_at": scanned_at,
            "fully_verified": False,
        }
    limit = stale_after(int((health or {}).get("interval_hours") or 0)) or MANUAL_STALE_AFTER
    scanned = _time(scanned_at)
    stale = scanned is None or now - scanned > limit
    scan_unreliable = meta.get("preliminary") or (health or {}).get("state") in {
        "failed",
        "stale",
        "preliminary",
    }
    if not snapshot or stale or scan_unreliable:
        members = [
            {
                "object_key": m["object_key"],
                "state": STATE_UNVERIFIED,
                "reason": "scan_unverified",
                "required": m["required"],
                "rules": m.get("rules", []),
            }
            for m in definition["members"]
        ]
    else:
        objects = {f"{o['object_type']}:{o['object_id']}": o for o in snapshot.get("objects", ())}
        findings: dict[str, list[dict[str, Any]]] = {}
        for finding in snapshot.get("findings", ()):
            key = f"{str(finding.get('rule_id', '')).split('.')[0]}:{finding.get('object_id')}"
            findings.setdefault(key, []).append(finding)
        coverage = {item["source"]: item["state"] for item in meta.get("coverage", ())}
        members = [
            _member_state(m, objects, findings, coverage, now) for m in definition["members"]
        ]
    required = [m for m in members if m["required"]]
    if any(m["state"] == STATE_PROBLEM for m in required):
        state = STATE_PROBLEM
    elif not required or any(m["state"] == STATE_UNVERIFIED for m in required):
        state = STATE_UNVERIFIED
    else:
        state = STATE_OK
    reason = next((m for m in required if m["state"] == state), None)
    return {
        "id": definition["id"],
        "name": definition["name"],
        "description": definition["description"],
        "notify": definition["notify"],
        "enabled": definition.get("enabled", True),
        "members": members,
        "state": state,
        "reason": reason["reason"] if reason else "no_required_members",
        "reason_key": reason["object_key"] if reason else None,
        "scanned_at": scanned_at,
        "fully_verified": bool(required) and all(m["state"] != STATE_UNVERIFIED for m in required),
    }


class MonitorStore:
    """Definitions and the small amount of state needed to avoid duplicate alarms."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, MONITOR_STORAGE_KEY)
        self.items: list[dict[str, Any]] = []
        self.runtime: dict[str, dict[str, Any]] = {}
        self.results: list[dict[str, Any]] = []
        self.history: dict[str, list[dict[str, Any]]] = {}
        self.retention_days = DEFAULT_HISTORY_DAYS

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if not isinstance(data, dict):
            return
        seen_ids: set[str] = set()
        for item in data.get("items", ()) if isinstance(data.get("items"), list) else ():
            if not isinstance(item, dict):
                continue
            try:
                self._validate(
                    item.get("name"),
                    item.get("description"),
                    item.get("notify"),
                    item.get("members"),
                    item.get("enabled", True),
                )
            except MonitorError:
                continue
            if isinstance(item.get("id"), str) and item["id"] and item["id"] not in seen_ids:
                seen_ids.add(item["id"])
                self.items.append(
                    {
                        **{
                            key: item[key]
                            for key in ("id", "name", "description", "notify", "members")
                        },
                        "enabled": item.get("enabled", True),
                        "members": [
                            {**member, "rules": member.get("rules", [])}
                            for member in item["members"]
                        ],
                        "created_at": item.get("created_at")
                        if _time(item.get("created_at"))
                        else None,
                        "updated_at": item.get("updated_at")
                        if _time(item.get("updated_at"))
                        else None,
                    }
                )
        self.items = self.items[:MAX_ITEMS]
        saved_history = data.get("history")
        if isinstance(saved_history, dict):
            for item in self.items:
                entries = saved_history.get(item["id"])
                if isinstance(entries, list):
                    self.history[item["id"]] = [e for e in map(self._history_entry, entries) if e]
        saved = data.get("runtime")
        if isinstance(saved, dict):
            for item in self.items:
                value = saved.get(item["id"])
                if isinstance(value, dict):
                    self.runtime[item["id"]] = {
                        "primed": value.get("primed") is True,
                        "state": value.get("state")
                        if value.get("state") in {STATE_OK, STATE_PROBLEM, STATE_UNVERIFIED}
                        else STATE_UNVERIFIED,
                        "open_incident": value.get("open_incident") is True,
                        "notified": value.get("notified") is True,
                        "unknown_notified": value.get("unknown_notified") is True,
                        "unknown_count": max(0, min(2, value.get("unknown_count", 0)))
                        if isinstance(value.get("unknown_count"), int)
                        else 0,
                        "last_verified_at": value.get("last_verified_at")
                        if _time(value.get("last_verified_at"))
                        else None,
                        "last_problem_reason": value.get("last_problem_reason")
                        if isinstance(value.get("last_problem_reason"), str)
                        else None,
                        "last_problem_key": value.get("last_problem_key")
                        if isinstance(value.get("last_problem_key"), str)
                        else None,
                    }

    def _save(self) -> None:
        self._store.async_delay_save(
            lambda: {"items": self.items, "runtime": self.runtime, "history": self.history},
            SAVE_DELAY,
        )

    @staticmethod
    def _history_entry(value: Any) -> dict[str, Any] | None:
        """Keep only what the history writes itself, so a damaged store cannot reach the panel."""
        if (
            not isinstance(value, dict)
            or value.get("kind") not in HISTORY_KINDS
            or not _time(value.get("at"))
        ):
            return None
        entry: dict[str, Any] = {"at": value["at"], "kind": value["kind"]}
        if value["kind"] == "flapping":
            if (
                not _time(value.get("until"))
                or value.get("state") not in HISTORY_STATES
                or not isinstance(value.get("count"), int)
            ):
                return None
            entry.update(
                until=value["until"],
                state=value["state"],
                count=max(1, min(value["count"], 100000)),
            )
        for key in ("reason", "key"):
            if isinstance(value.get(key), str):
                entry[key] = value[key][:200]
        for key in HISTORY_LISTS:
            if isinstance(value.get(key), list):
                entry[key] = [v[:200] for v in value[key] if isinstance(v, str)][: MAX_MEMBERS * 2]
        return entry

    def _log(self, item_id: str, kind: str, now: datetime, **fields: Any) -> bool:
        """Append one dated entry; a repeat of the previous one is not written again."""
        entry = {"at": now.isoformat(), "kind": kind, **{k: v for k, v in fields.items() if v}}
        entries = self.history.setdefault(item_id, [])
        if entries and {k: v for k, v in entries[-1].items() if k != "at"} == {
            k: v for k, v in entry.items() if k != "at"
        }:
            return False
        if kind in HISTORY_STATES and self._flap(entries, entry, now):
            self._prune(item_id, now)
            return True
        entries.append(entry)
        self._prune(item_id, now)
        return True

    @staticmethod
    def _flap(entries: list[dict[str, Any]], entry: dict[str, Any], now: datetime) -> bool:
        """Fold a run of quick state changes into one entry, so a wobbling object cannot fill the history."""
        last = entries[-1] if entries else None
        latest = {k: entry[k] for k in ("reason", "key") if k in entry}
        if (
            last
            and last["kind"] == "flapping"
            and (until := _time(last["until"]))
            and now - until <= FLAP_WINDOW
        ):
            for key in ("reason", "key"):
                last.pop(key, None)
            last.update(
                until=now.isoformat(), count=last["count"] + 1, state=entry["kind"], **latest
            )
            return True
        recent: list[dict[str, Any]] = []
        for old in reversed(entries):
            at = _time(old["at"])
            if old["kind"] not in HISTORY_STATES or at is None or now - at > FLAP_WINDOW:
                break
            recent.append(old)
        if len(recent) + 1 < FLAP_CHANGES:
            return False
        del entries[-len(recent) :]
        entries.append(
            {
                "at": recent[-1]["at"],
                "until": now.isoformat(),
                "kind": "flapping",
                "count": len(recent) + 1,
                "state": entry["kind"],
                **latest,
            }
        )
        return True

    def _prune(self, item_id: str, now: datetime) -> bool:
        """Drop entries older than the retention and keep the list bounded."""
        entries = self.history.get(item_id)
        if not entries:
            return False
        cutoff = now - timedelta(days=self.retention_days)
        kept = [
            e
            for e in entries
            if (at := _time(e.get("until") or e["at"])) is not None and at >= cutoff
        ][-MAX_HISTORY:]
        if len(kept) == len(entries):
            return False
        self.history[item_id] = kept
        return True

    def availability_of(self, item_id: str, now: datetime | None = None) -> dict[str, Any]:
        """The state shares of one function over the last 30 days (less if the retention is shorter)."""
        entries = self.history.get(item_id, [])
        return availability(
            entries, now or datetime.now(UTC), min(AVAILABILITY_DAYS, self.retention_days)
        )

    def last_problem_at(self, item_id: str, now: datetime | None = None) -> str | None:
        """When the function was last impaired or unstable (now, while it still is), if the history knows."""
        ends = [
            end
            for _, end, state in _segments(self.history.get(item_id, []), now or datetime.now(UTC))
            if state in ("problem", "flapping")
        ]
        return max(ends).isoformat() if ends else None

    def history_of(self, item_id: str) -> list[dict[str, Any]]:
        """The entries of one function, newest first."""
        return list(reversed(self.history.get(item_id, ())))

    @staticmethod
    def _validate(
        name: Any, description: Any, notify: Any, members: Any, enabled: Any = True
    ) -> None:
        if not isinstance(name, str) or not name.strip() or len(name.strip()) > NAME_MAX:
            raise MonitorError("name")
        if not isinstance(description, str) or len(description) > DESCRIPTION_MAX:
            raise MonitorError("description")
        if not isinstance(notify, bool):
            raise MonitorError("notify")
        if not isinstance(enabled, bool):
            raise MonitorError("enabled")
        if not isinstance(members, list) or not 1 <= len(members) <= MAX_MEMBERS:
            raise MonitorError("members")
        keys: set[str] = set()
        for member in members:
            if not isinstance(member, dict) or not isinstance(member.get("required"), bool):
                raise MonitorError("members")
            key = member.get("object_key")
            if not isinstance(key, str) or ":" not in key or len(key) > 260:
                raise MonitorError("members")
            kind, object_id = key.split(":", 1)
            if kind not in MEMBER_TYPES or not object_id or key in keys:
                raise MonitorError("members")
            rules = member.get("rules", [])
            if not isinstance(rules, list) or len(rules) > MAX_RULES or rules and kind != "entity":
                raise MonitorError("rules")
            seen_rules: set[str] = set()
            for rule in rules:
                if not isinstance(rule, dict) or set(rule) != {"kind", "value"}:
                    raise MonitorError("rules")
                rule_kind, value = rule["kind"], rule["value"]
                if (
                    not isinstance(rule_kind, str)
                    or rule_kind not in RULE_LIMITS
                    or rule_kind in seen_rules
                    or isinstance(value, bool)
                    or not isinstance(value, (int, float))
                ):
                    raise MonitorError("rules")
                minimum, maximum = RULE_LIMITS[rule_kind]
                if (
                    not minimum <= value <= maximum
                    or not isfinite(value)
                    or rule_kind != "min_value"
                    and not isinstance(value, int)
                ):
                    raise MonitorError("rules")
                seen_rules.add(rule_kind)
            keys.add(key)

    def upsert(
        self,
        item_id: str | None,
        name: str,
        description: str,
        notify: bool,
        members: list[dict[str, Any]],
        snapshot: dict[str, Any] | None,
        health: dict[str, Any] | None,
        enabled: bool = True,
    ) -> str:
        self._validate(name, description, notify, members, enabled)
        old = next((item for item in self.items if item["id"] == item_id), None)
        if item_id and old is None:
            raise MonitorError("not_found")
        if old is None and len(self.items) >= MAX_ITEMS:
            raise MonitorError("too_many")
        existing = {m["object_key"] for m in old["members"]} if old else set()
        available = {
            f"{o['object_type']}:{o['object_id']}"
            for o in (snapshot or {}).get("objects", ())
            if o.get("status") != "ignored"
        }
        if any(m["object_key"] not in available | existing for m in members):
            raise MonitorError("object_key")
        now = datetime.now(UTC)
        before = (
            None
            if old is None
            else {
                "members": {
                    m["object_key"]: (m["required"], m.get("rules", [])) for m in old["members"]
                },
                "fields": {
                    "name": old["name"],
                    "description": old["description"],
                    "notify": old["notify"],
                },
                "enabled": old.get("enabled", True),
            }
        )
        changed_members = old is None or members != old["members"]
        changed_enabled = old is not None and old.get("enabled", True) != enabled
        enabled_notification = (
            old is not None
            and not changed_members
            and not changed_enabled
            and enabled
            and not old["notify"]
            and notify
        )
        if old is None:
            item_id = secrets.token_hex(6)
            old = {"id": item_id, "created_at": datetime.now(UTC).isoformat()}
            self.items.append(old)
        old.update(
            name=name.strip(),
            description=description.strip(),
            notify=notify,
            enabled=enabled,
            members=[
                {
                    "object_key": m["object_key"],
                    "required": m["required"],
                    "rules": [{"kind": r["kind"], "value": r["value"]} for r in m.get("rules", [])],
                }
                for m in members
            ],
            updated_at=datetime.now(UTC).isoformat(),
        )
        if before is None:
            self._log(item_id, "created", now, added=[m["object_key"] for m in members])
        else:
            after = {
                m["object_key"]: (
                    m["required"],
                    [{"kind": r["kind"], "value": r["value"]} for r in m.get("rules", [])],
                )
                for m in members
            }
            fields = [
                k
                for k, v in {
                    "name": name.strip(),
                    "description": description.strip(),
                    "notify": notify,
                }.items()
                if before["fields"][k] != v
            ]
            added = [k for k in after if k not in before["members"]]
            removed = [k for k in before["members"] if k not in after]
            changed = [
                k for k in after if k in before["members"] and after[k] != before["members"][k]
            ]
            if added or removed or changed or fields:
                self._log(
                    item_id,
                    "edited",
                    now,
                    added=added,
                    removed=removed,
                    changed=changed,
                    fields=fields,
                )
            if changed_enabled:
                self._log(item_id, "enabled" if enabled else "disabled", now)
        if changed_members or changed_enabled:
            self._dismiss(item_id)
            self.runtime.pop(item_id, None)
        elif not notify and self.runtime.get(item_id, {}).get("notified"):
            self._dismiss(item_id)
            self.runtime[item_id]["notified"] = False
        self._save()
        async_dispatcher_send(self.hass, SIGNAL_MONITOR_DEFINITIONS)
        self.refresh(snapshot, health, new_scan=False)
        if enabled_notification:
            runtime = self.runtime.get(item_id, {})
            result = next((value for value in self.results if value["id"] == item_id), None)
            if result and (runtime.get("open_incident") or runtime.get("unknown_notified")):
                self._notify(result, uncertain=result["state"] == STATE_UNVERIFIED)
                runtime["notified"] = True
                self._save()
        return item_id

    def delete(self, item_id: str) -> None:
        if not any(item["id"] == item_id for item in self.items):
            raise MonitorError("not_found")
        self.items = [item for item in self.items if item["id"] != item_id]
        self.runtime.pop(item_id, None)
        self.history.pop(item_id, None)
        self.results = [result for result in self.results if result["id"] != item_id]
        self._dismiss(item_id)
        self._save()
        async_dispatcher_send(self.hass, SIGNAL_MONITOR_DEFINITIONS)

    def _dismiss(self, item_id: str) -> None:
        persistent_notification.async_dismiss(self.hass, f"{DOMAIN}_monitor_{item_id}")

    def _notify(self, result: dict[str, Any], *, uncertain: bool = False) -> None:
        if not result["notify"]:
            return
        texts = pick(self.hass, MONITOR_TEXTS)
        reasons = pick(self.hass, MONITOR_REASONS)
        reason = reasons.get(result["reason"], result["reason"])
        last_reason = reasons.get(
            result.get("last_problem_reason"), result.get("last_problem_reason") or reason
        )
        title = f"Housekeeper: {result['name']}"
        if uncertain and result["incident_open"]:
            body = texts["uncertain_open"].format(last_reason=last_reason)
        elif uncertain:
            body = texts["uncertain"]
        else:
            body = texts["impaired"].format(reason=reason)
        link = texts["link"]
        persistent_notification.async_create(
            self.hass,
            f"{body} [{link}](/{PANEL_URL}?view=monitor&function={result['id']})",
            title=title,
            notification_id=f"{DOMAIN}_monitor_{result['id']}",
        )

    def _event(self, kind: str, result: dict[str, Any], now: datetime) -> None:
        payload = {
            "function_id": result["id"],
            "name": result["name"],
            "reason": result["reason"],
            "at": now.isoformat(),
        }
        self.hass.bus.async_fire(EVENT_NAME, {"event_type": kind, **payload})
        async_dispatcher_send(self.hass, SIGNAL_MONITOR_EVENT, kind, payload)

    def refresh(
        self,
        snapshot: dict[str, Any] | None,
        health: dict[str, Any] | None,
        *,
        new_scan: bool,
    ) -> None:
        now = datetime.now(UTC)
        changed = False
        results = []
        for item in self.items:
            result = evaluate(item, snapshot, health, now)
            runtime = self.runtime.setdefault(item["id"], {})
            if not item.get("enabled", True):
                result.update(
                    state=STATE_DISABLED,
                    reason="disabled",
                    reason_key=None,
                    fully_verified=False,
                    incident_open=False,
                    last_verified_at=runtime.get("last_verified_at"),
                    last_problem_reason=None,
                    last_problem_key=None,
                )
                results.append(result)
                continue
            old = runtime.get("state")
            state = result["state"]
            if (snapshot or {}).get("meta", {}).get("preliminary"):
                result["incident_open"] = bool(runtime.get("open_incident"))
                result["last_verified_at"] = runtime.get("last_verified_at")
                result["last_problem_reason"] = runtime.get("last_problem_reason")
                result["last_problem_key"] = runtime.get("last_problem_key")
                results.append(result)
                continue
            if result["fully_verified"] and new_scan:
                runtime["last_verified_at"] = result["scanned_at"]
                changed = True
            if not runtime.get("primed"):
                if new_scan or (
                    snapshot is not None
                    and not snapshot.get("meta", {}).get("preliminary")
                    and (health or {}).get("state") == "ok"
                ):
                    runtime.update(
                        primed=True,
                        state=state,
                        open_incident=state == STATE_PROBLEM,
                        notified=False,
                        unknown_notified=False,
                        unknown_count=1 if state == STATE_UNVERIFIED and new_scan else 0,
                    )
                    if result["fully_verified"]:
                        runtime["last_verified_at"] = result["scanned_at"]
                    if state == STATE_PROBLEM:
                        runtime["last_problem_reason"] = result["reason"]
                        runtime["last_problem_key"] = result["reason_key"]
                    self._log(
                        item["id"], state, now, reason=result["reason"], key=result["reason_key"]
                    )
                    changed = True
            elif old != state:
                runtime["state"] = state
                self._log(item["id"], state, now, reason=result["reason"], key=result["reason_key"])
                changed = True
                if state == STATE_PROBLEM and not runtime.get("open_incident"):
                    runtime["open_incident"] = True
                    runtime["last_problem_reason"] = result["reason"]
                    runtime["last_problem_key"] = result["reason_key"]
                    runtime["unknown_notified"] = False
                    self._event("beeintraechtigt", result, now)
                    if item["notify"]:
                        self._notify({**result, "incident_open": True})
                        runtime["notified"] = True
                elif state == STATE_PROBLEM:
                    runtime["last_problem_reason"] = result["reason"]
                    runtime["last_problem_key"] = result["reason_key"]
                    if runtime.get("notified"):
                        self._notify({**result, "incident_open": True})
                elif state == STATE_OK:
                    if runtime.get("open_incident"):
                        self._event("wieder_unauffaellig", result, now)
                    elif runtime.get("unknown_notified"):
                        self._event("pruefung_wieder_moeglich", result, now)
                    if runtime.get("notified"):
                        self._dismiss(item["id"])
                    runtime.update(open_incident=False, notified=False, unknown_notified=False)
                    runtime["last_problem_reason"] = None
                    runtime["last_problem_key"] = None
                elif (
                    state == STATE_UNVERIFIED
                    and runtime.get("open_incident")
                    and runtime.get("notified")
                ):
                    self._notify(
                        {
                            **result,
                            "incident_open": True,
                            "last_problem_reason": runtime.get("last_problem_reason"),
                        },
                        uncertain=True,
                    )
            elif (
                state == STATE_PROBLEM
                and runtime.get("open_incident")
                and (
                    runtime.get("last_problem_reason") != result["reason"]
                    or runtime.get("last_problem_key") != result["reason_key"]
                )
            ):
                runtime["last_problem_reason"] = result["reason"]
                runtime["last_problem_key"] = result["reason_key"]
                self._log(
                    item["id"],
                    STATE_PROBLEM,
                    now,
                    reason=result["reason"],
                    key=result["reason_key"],
                )
                changed = True
                if runtime.get("notified"):
                    self._notify({**result, "incident_open": True})
            if state == STATE_UNVERIFIED:
                if new_scan:
                    runtime["unknown_count"] = min(
                        2, runtime.get("unknown_count", 0) + 1 if old == STATE_UNVERIFIED else 1
                    )
                    changed = True
                old_scan = _time(result["scanned_at"])
                limit = (
                    stale_after(int((health or {}).get("interval_hours") or 0))
                    or MANUAL_STALE_AFTER
                )
                overdue = old_scan is not None and now - old_scan > limit
                if (
                    runtime.get("primed")
                    and not runtime.get("unknown_notified")
                    and (runtime.get("unknown_count", 0) >= 2 or overdue)
                ):
                    runtime["unknown_notified"] = True
                    self._event("pruefung_unvollstaendig", result, now)
                    if item["notify"]:
                        self._notify(
                            {
                                **result,
                                "incident_open": bool(runtime.get("open_incident")),
                                "last_problem_reason": runtime.get("last_problem_reason"),
                            },
                            uncertain=True,
                        )
                        runtime["notified"] = True
                    changed = True
            else:
                runtime["unknown_count"] = 0
                runtime["unknown_notified"] = False
            result["incident_open"] = bool(runtime.get("open_incident"))
            result["last_verified_at"] = runtime.get("last_verified_at")
            result["last_problem_reason"] = runtime.get("last_problem_reason")
            result["last_problem_key"] = runtime.get("last_problem_key")
            results.append(result)
        for item in self.items:
            changed = self._prune(item["id"], now) or changed
        for result in results:
            result["last_problem_at"] = self.last_problem_at(result["id"], now)
        self.results = results
        if changed:
            self._save()
        async_dispatcher_send(self.hass, SIGNAL_MONITOR_DEFINITIONS)

    def report(self) -> list[dict[str, Any]]:
        return list(self.results)
