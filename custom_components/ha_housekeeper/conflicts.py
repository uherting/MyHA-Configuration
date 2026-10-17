"""Possible conflicts and feedback loops between automations.

Reads configurations, the dependency edges and the daily run numbers; it never runs anything. A
finding has one of three stages and never claims more than its evidence:

* ``static``: the configuration allows it (two automations command the same entity in opposite
  ways while they can fire together, or a chain of triggers and actions leads back to the start);
* ``observed``: the run numbers show the involved automations active on the same day;
* ``confirmed``: the same on several days of the window.

Run numbers are counted per day, so "same day" is all they can say about timing.
"""

from __future__ import annotations

import re
from collections import deque
from datetime import date, timedelta
from typing import Any

from .policy_rules import _entity_ids
from .runs import RUNS

WINDOW_DAYS = 7
CONFIRM_DAYS = 3  # days of shared activity from which a finding counts as confirmed
LOOP_MIN_RUNS = 20  # runs per day by every automation of a loop that look like a loop
MAX_DEPTH = 6  # automations a loop may pass through
LIMIT = 100
THRESHOLDS = {
    "window_days": WINDOW_DAYS,
    "confirm_days": CONFIRM_DAYS,
    "loop_min_runs_per_day": LOOP_MIN_RUNS,
    "loop_max_automations": MAX_DEPTH,
}

OPPOSITE = {
    "turn_on": "turn_off",
    "turn_off": "turn_on",
    "open_cover": "close_cover",
    "close_cover": "open_cover",
    "lock": "unlock",
    "unlock": "lock",
    "media_play": "media_pause",
    "media_pause": "media_play",
}
# Services that set a value, and the key of the value; two different literals are a conflict.
VALUE_KEY = {
    "set_temperature": "temperature",
    "set_hvac_mode": "hvac_mode",
    "set_value": "value",
    "select_option": "option",
    "set_percentage": "percentage",
    "set_preset_mode": "preset_mode",
}
RESULT = {"turn_on": "on", "turn_off": "off"}
QUIET_DOMAINS = {"notify", "persistent_notification", "tts", "logbook", "system_log", "script"}
TRIGGER_KINDS = {"state", "numeric_state"}
CLOCK = re.compile(r"^(\d{1,2}):(\d{2})(?::\d{2})?$")
ENTITY = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")


def _kind(trigger: dict[str, Any]) -> str:
    return str(trigger.get("platform") or trigger.get("trigger") or "")


def triggers_of(item: dict[str, Any]) -> dict[str, list[Any]]:
    """Entity id -> the ``to`` values of the state triggers on it (``None`` when unfiltered)."""
    found: dict[str, list[Any]] = {}
    for trigger in item.get("triggers") or []:
        if not isinstance(trigger, dict) or _kind(trigger) not in TRIGGER_KINDS:
            continue
        to = trigger.get("to") if _kind(trigger) == "state" else None
        for entity_id in _entity_ids(trigger):
            found.setdefault(entity_id, []).append(to if isinstance(to, str) else None)
    return found


def _targets(block: dict[str, Any]) -> set[str]:
    ids = _entity_ids(block)
    for key in ("target", "data"):
        if isinstance(block.get(key), dict):
            ids |= _entity_ids(block[key])
    return {i for i in ids if ENTITY.match(i)}


def commands_of(item: dict[str, Any]) -> list[tuple[str, str, str, Any]]:
    """(entity id, domain, service, value) of every service call that names entities."""
    found: list[tuple[str, str, str, Any]] = []

    def walk(node: Any) -> None:
        if isinstance(node, list):
            for child in node:
                walk(child)
        elif isinstance(node, dict):
            service = node.get("action") or node.get("service")
            if isinstance(service, str) and "." in service:
                domain, name = service.split(".", 1)
                if domain not in QUIET_DOMAINS:
                    data = node.get("data") if isinstance(node.get("data"), dict) else {}
                    key = VALUE_KEY.get(name)
                    value = data.get(key) if key else None
                    if isinstance(value, str) and ("{{" in value or "{%" in value):
                        value = None
                    for entity_id in _targets(node):
                        found.append((entity_id, domain, name, value))
            for child in node.values():
                if isinstance(child, (list, dict)):
                    walk(child)

    walk(item.get("actions") or [])
    return found


def _windows(item: dict[str, Any]) -> list[tuple[int, int]]:
    """Minutes of the day an automation's ``time`` condition allows (several if it wraps midnight)."""
    for condition in item.get("conditions") or []:
        if not isinstance(condition, dict) or condition.get("condition") != "time":
            continue
        bounds = []
        for key, default in (("after", 0), ("before", 24 * 60)):
            match = CLOCK.match(str(condition.get(key, "")).strip())
            bounds.append(int(match[1]) * 60 + int(match[2]) if match else default)
        if bounds == [0, 24 * 60]:
            return []
        start, end = bounds
        return [(start, end)] if start < end else [(start, 24 * 60), (0, end)]
    return []


def _overlap(first: list[tuple[int, int]], second: list[tuple[int, int]]) -> tuple[int, int] | None:
    for a0, a1 in first:
        for b0, b1 in second:
            if max(a0, b0) < min(a1, b1):
                return max(a0, b0), min(a1, b1)
    return None


def _clock(minutes: int) -> str:
    return f"{minutes // 60:02d}:{minutes % 60:02d}"


def _clash(first: tuple, second: tuple) -> bool:
    (_, d1, s1, v1), (_, d2, s2, v2) = first, second
    if d1 != d2 and "homeassistant" not in (d1, d2):
        return False
    if OPPOSITE.get(s1) == s2:
        return True
    return s1 == s2 and s1 in VALUE_KEY and v1 is not None and v2 is not None and v1 != v2


def _active_days(days_of: list[dict[str, Any]], today: date, minimum: int) -> int:
    """Days of the window on which every given automation ran at least ``minimum`` times."""
    count = 0
    for back in range(WINDOW_DAYS):
        key = (today - timedelta(days=back)).isoformat()
        if all(((days.get(key) or {}).get("c") or [0])[RUNS] >= minimum for days in days_of):
            count += 1
    return count


def _stage(days: int) -> str:
    return "confirmed" if days >= CONFIRM_DAYS else "observed" if days else "static"


def opposing(autos: list[dict[str, Any]], days: dict[str, dict[str, Any]], today: date):
    """Pairs that command one entity in opposite ways while they can fire together."""
    by_entity: dict[str, list[tuple[dict[str, Any], tuple]]] = {}
    for item in autos:
        for command in commands_of(item):
            by_entity.setdefault(command[0], []).append((item, command))
    seen: set[tuple[str, str, str]] = set()
    for entity_id, entries in sorted(by_entity.items()):
        for index, (first, c1) in enumerate(entries):
            for second, c2 in entries[index + 1 :]:
                pair = tuple(sorted((first["entity_id"], second["entity_id"])))
                if first["entity_id"] == second["entity_id"] or not _clash(c1, c2):
                    continue
                if (*pair, entity_id) in seen:
                    continue
                reason = None
                shared = sorted(set(triggers_of(first)) & set(triggers_of(second)))
                if shared:
                    reason = {"reason": "trigger", "detail": shared[0]}
                else:
                    window = _overlap(_windows(first), _windows(second))
                    if window:
                        reason = {
                            "reason": "window",
                            "detail": f"{_clock(window[0])}–{_clock(window[1])}",
                        }
                if reason is None:
                    continue
                seen.add((*pair, entity_id))
                active = _active_days(
                    [days.get(first["run_key"], {}), days.get(second["run_key"], {})], today, 1
                )
                yield {
                    "kind": "opposing",
                    "stage": _stage(active),
                    "days": active,
                    "entity_id": entity_id,
                    "automations": [_brief(first), _brief(second)],
                    "commands": [f"{c1[1]}.{c1[2]}", f"{c2[1]}.{c2[2]}"],
                    **reason,
                }


def _brief(item: dict[str, Any]) -> dict[str, str]:
    return {"entity_id": item["entity_id"], "name": item.get("name") or item["entity_id"]}


def _fires(to: Any, service: str, own: bool) -> bool:
    """Whether a command can make a state trigger with this ``to`` fire."""
    result = RESULT.get(service)
    if to in ("on", "off") and result is not None:
        return result == to and not own
    return True


def follows(edges: list[dict[str, Any]]) -> dict[str, set[str]]:
    """Entity -> entities whose state follows it: groups follow members, helpers their sources."""
    out: dict[str, set[str]] = {}
    provided: dict[str, set[str]] = {}
    sources: dict[str, set[str]] = {}
    for edge in edges:
        src, dst, relation = str(edge.get("source")), str(edge.get("target")), edge.get("relation")
        if not dst.startswith("entity:"):
            continue
        if src.startswith("entity:") and relation == "INCLUDES":
            out.setdefault(dst[7:], set()).add(src[7:])
        elif src.startswith("config_entry:"):
            (provided if relation == "PROVIDES" else sources).setdefault(src, set()).add(dst[7:])
    for entry, reads in sources.items():
        for read in reads:
            out.setdefault(read, set()).update(provided.get(entry, set()) - {read})
    return out


def loops(
    autos: list[dict[str, Any]],
    edges: list[dict[str, Any]],
    days: dict[str, dict[str, Any]],
    today: date,
):
    """Chains of triggers and actions that lead back to the automation they started from."""
    follow = follows(edges)
    triggered: dict[str, list[tuple[dict[str, Any], Any]]] = {}
    for item in autos:
        for entity_id, tos in triggers_of(item).items():
            for to in tos:
                triggered.setdefault(entity_id, []).append((item, to))
    commands = {item["entity_id"]: commands_of(item) for item in autos}
    seen: set[frozenset[str]] = set()
    for start in autos:
        queue: deque[tuple[str, str, list[str], list[dict[str, Any]]]] = deque(
            (entity_id, service, [entity_id], [start])
            for entity_id, _, service, _ in commands[start["entity_id"]]
        )
        visited: set[tuple[str, str]] = set()
        while queue:
            entity, service, path, chain = queue.popleft()
            if (entity, service) in visited:
                continue
            visited.add((entity, service))
            for other, to in triggered.get(entity, []):
                if not _fires(to, service, other is chain[-1]):
                    continue
                if other is start:
                    key = frozenset(i["entity_id"] for i in chain)
                    if key not in seen:
                        seen.add(key)
                        active = _active_days(
                            [days.get(i["run_key"], {}) for i in chain], today, LOOP_MIN_RUNS
                        )
                        yield {
                            "kind": "loop",
                            "stage": _stage(active),
                            "days": active,
                            "entities": path,
                            "automations": [_brief(i) for i in chain],
                        }
                elif len(chain) < MAX_DEPTH and other not in chain:
                    for nxt, _, nservice, _ in commands[other["entity_id"]]:
                        queue.append((nxt, nservice, [*path, nxt], [*chain, other]))
            for nxt in follow.get(entity, ()):
                if nxt not in path:
                    queue.append((nxt, "", [*path, nxt], chain))


def find(
    autos: list[dict[str, Any]],
    edges: list[dict[str, Any]],
    runs: dict[str, dict[str, Any]],
    today: date,
) -> dict[str, Any]:
    """Possible conflicts and loops among enabled automations, strongest evidence first."""
    live = [a for a in autos if a.get("status") not in ("disabled", "unavailable")]
    days = {key: (value.get("days") or {}) for key, value in runs.items()}
    items = [*opposing(live, days, today), *loops(live, edges, days, today)]
    rank = {"confirmed": 0, "observed": 1, "static": 2}
    items.sort(key=lambda i: (rank[i["stage"]], i["kind"], i["automations"][0]["name"]))
    return {"checked": len(live), "total": len(items), "items": items[:LIMIT]}
