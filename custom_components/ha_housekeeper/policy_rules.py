"""More quality rules for policies.py: naming, tidiness, automation habits, exposure and recorder.

Every function only reads the snapshot (and a few numbers the caller hands over) and yields the
objects that break the rule. Several rules are heuristics; their texts in the panel say so.
"""

from __future__ import annotations

import json
import re
from collections.abc import Iterable
from datetime import datetime
from ipaddress import ip_address, ip_network
from typing import Any
from urllib.parse import urlsplit

from .dashboard_analysis import HELPER_DOMAINS
from .exposure import SENSITIVE_COVERS, SENSITIVE_DOMAINS
from .hygiene import low_battery_ids

# A counter has up to three digits; a longer number is one Home Assistant hands out.
SUFFIX = re.compile(r"_(\d{1,3})$")
_OCTET = r"(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)"
_HEX = r"[0-9a-f]{2}"
# An address in an id: a private IPv4 (192.168.x.x, 10.x.x.x, 172.16-31.x.x; other four numbers
# such as ``sensor_1_2_3_4`` are not taken for one), or four or more pairs of hex digits (Eltako
# 4 bytes, MAC 6, Zigbee 8), or twelve hex digits in a row with at least one digit and one letter.
ADDRESS = re.compile(
    rf"(?<![0-9a-z])(?:(?:192_168|10_{_OCTET}|172_(?:1[6-9]|2\d|3[01]))_{_OCTET}_{_OCTET}"
    rf"|{_HEX}(?:_{_HEX}){{3,}}"
    rf"|(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{{12}})(?![0-9a-z])"
)
DEFAULT_NAME = re.compile(
    r"^(neue[rsn]?\s+|new\s+)?(automation|automatisierung|skript|script)(\s+\d+)?$", re.IGNORECASE
)
LITERAL_ID = re.compile(
    r"(?:states|is_state|state_attr|is_state_attr|expand)\(\s*['\"]([a-z_]+\.[a-z0-9_]+)['\"]"
)
TRIGGER_LIMIT = 10  # triggers from which an automation is hard to maintain
RECORDER_MIN_PER_DAY = 200  # state changes per day from which an unused entity is worth a hint
RETENTION_DAYS = 30
RETENTION_BYTES = 2 * 1024**3
DASHBOARD_CARDS = 200  # cards from which one dashboard is slow to load and hard to keep
LISTED = 20
SWITCHABLE = ("switch", "light", "fan", "input_boolean", "humidifier")
ERROR_HANDLING_KEYS = ("continue_on_error", "on_error")
BRANCHING_KEYS = ("choose", "if", "condition", "wait_template", "wait_for_trigger")


def _walk(value: Any) -> Iterable[tuple[str, Any]]:
    """Every (key, value) pair of nested dicts and lists."""
    if isinstance(value, dict):
        for key, inner in value.items():
            yield str(key), inner
            yield from _walk(inner)
    elif isinstance(value, list):
        for inner in value:
            yield from _walk(inner)


def _strings(value: Any) -> Iterable[str]:
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for inner in value.values():
            yield from _strings(inner)
    elif isinstance(value, list):
        for inner in value:
            yield from _strings(inner)


def _entity_ids(value: Any) -> set[str]:
    """Entity ids named under an ``entity_id`` key (text or list) anywhere inside ``value``."""
    found: set[str] = set()
    for key, inner in _walk(value):
        if key != "entity_id":
            continue
        for text in [inner] if isinstance(inner, str) else inner if isinstance(inner, list) else []:
            if isinstance(text, str) and "." in text and "{" not in text:
                found.add(text.strip())
    return found


def _config_automations(automations: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [item for item in automations if item.get("source") != "state_fallback"]


def has_address(object_id: str) -> bool:
    """Whether the id (without its domain) carries a device address."""
    return bool(ADDRESS.search(object_id.split(".", 1)[-1]))


def entity_id_address(entities: dict[str, dict[str, Any]]):
    """Ids built from a device address (IP, MAC, radio): they say nothing about the device."""
    for item in entities.values():
        if has_address(item["object_id"]) and not item.get("disabled_by"):
            yield item


def entity_id_suffix(entities: dict[str, dict[str, Any]]):
    """Ids that end in a counter (``_2``) the name does not carry: a leftover of a rename.

    An id with an address (``..._192_168_79_138``) is no counter; ``entity_id_address`` has it.
    """
    for item in entities.values():
        match = SUFFIX.search(item["object_id"])
        if not match or int(match.group(1)) < 2 or item.get("disabled_by"):
            continue
        if has_address(item["object_id"]):
            continue
        if not str(item.get("name") or "").rstrip().endswith(match.group(1)):
            yield item


def default_name(automations: list[dict[str, Any]], scripts: list[dict[str, Any]]):
    """Automations and scripts that still carry the name the editor proposes."""
    for item in [*automations, *scripts]:
        if DEFAULT_NAME.match(str(item.get("name") or "").strip()):
            yield item


def script_description(scripts: list[dict[str, Any]]):
    for item in scripts:
        if not str(item.get("description") or "").strip():
            yield item


def script_label(scripts: list[dict[str, Any]], with_labels: dict[str, bool]):
    for item in scripts:
        if with_labels.get(item["object_id"]) is False:
            yield item


def device_model(devices: dict[str, dict[str, Any]]):
    """Active, real devices (no service, no sub-device) that name neither manufacturer nor model."""
    for item in devices.values():
        if (
            item.get("status") == "active"
            and item.get("device_kind") != "child"
            and item.get("entry_type") != "service"
            and not (item.get("manufacturer") and item.get("model"))
        ):
            yield item


def area_empty(
    areas: list[dict[str, Any]],
    entities: dict[str, dict[str, Any]],
    devices: dict[str, dict[str, Any]],
):
    used = {i.get("area_id") for i in entities.values()} | {
        i.get("area_id") for i in devices.values()
    }
    for item in areas:
        if item["object_id"] not in used:
            yield item


def label_unused(labels: list[dict[str, Any]], used: set[str], ignore_label: str):
    for item in labels:
        if item["object_id"] != ignore_label and item["object_id"] not in used:
            yield item


ALSO_LIMIT = 3
INPUT_PLATFORMS = frozenset(
    {
        "input_boolean", "input_button", "input_datetime", "input_number", "input_select",
        "input_text", "counter", "timer", "schedule",
    }
)  # fmt: skip
READ_RELATIONS = frozenset({"TRIGGERS_ON", "USES_AS_CONDITION", "REFERENCES", "SHOWS", "INCLUDES"})


def helper_write_only(entities: dict[str, dict[str, Any]], edges: list[dict[str, Any]]):
    """Input helpers that something sets but nothing reads (a hint: the value goes nowhere)."""
    written: set[str] = set()
    read: set[str] = set()
    for edge in edges:
        target = str(edge.get("target", ""))
        if not target.startswith("entity:"):
            continue
        entity_id = target.split(":", 1)[1]
        if edge.get("relation") == "TARGETS":
            written.add(entity_id)
        elif edge.get("relation") in READ_RELATIONS:
            read.add(entity_id)
    for entity_id in sorted(written - read):
        item = entities.get(entity_id)
        if item is not None and item.get("platform") in INPUT_PLATFORMS:
            yield item


def helper_cycle(
    integrations: list[dict[str, Any]],
    entities: dict[str, dict[str, Any]],
    edges: list[dict[str, Any]],
):
    """Helper entries that read their own entities, directly or through other helpers (a hint)."""
    owner = {
        i["object_id"]: i["config_entry_id"] for i in entities.values() if i.get("config_entry_id")
    }
    follows: dict[str, set[str]] = {}
    for edge in edges:
        source, target = str(edge.get("source", "")), str(edge.get("target", ""))
        if source.startswith("config_entry:") and target.startswith("entity:"):
            other = owner.get(target.split(":", 1)[1])
            if other:
                follows.setdefault(source.split(":", 1)[1], set()).add(other)

    def reaches_itself(start: str) -> bool:
        seen: set[str] = set()
        todo = list(follows.get(start, ()))
        while todo:
            node = todo.pop()
            if node == start:
                return True
            if node not in seen:
                seen.add(node)
                todo.extend(follows.get(node, ()))
        return False

    for item in integrations:
        if item.get("domain") in HELPER_DOMAINS and reaches_itself(item["object_id"]):
            yield item


def _nodes(value: Any) -> Iterable[dict[str, Any]]:
    """Every dict of nested dicts and lists."""
    if isinstance(value, dict):
        yield value
        for inner in value.values():
            yield from _nodes(inner)
    elif isinstance(value, list):
        for inner in value:
            yield from _nodes(inner)


def _ids(value: Any) -> list[str]:
    """Entity ids from a string or a list of strings."""
    if isinstance(value, str):
        return [part.strip() for part in value.split(",") if part.strip()]
    if isinstance(value, list):
        return [part for part in value if isinstance(part, str)]
    return []


def _values(value: Any) -> list[str]:
    """Plain text values; a template or anything that is no text is left out."""
    found = [value] if isinstance(value, str) else value if isinstance(value, list) else []
    return [v for v in found if isinstance(v, str) and "{{" not in v and "{%" not in v]


def _select_values(automations: list[dict[str, Any]]) -> dict[str, set[str]]:
    """The option each automation compares with or selects, per input_select."""
    found: dict[str, set[str]] = {}
    for item in _config_automations(automations):
        for block in ("triggers", "conditions", "actions"):
            for entry in _nodes(item.get(block) or []):
                kind = entry.get("trigger") or entry.get("platform") or entry.get("condition")
                values: list[str] = []
                if kind == "state":
                    values = _values(entry.get("to")) + _values(entry.get("from"))
                    values += _values(entry.get("state"))
                elif (entry.get("action") or entry.get("service")) == "input_select.select_option":
                    values = _values((entry.get("data") or {}).get("option"))
                if not values:
                    continue
                target = entry.get("target") or {}
                holder = target.get("entity_id") if isinstance(target, dict) else None
                for entity_id in _ids(entry.get("entity_id") or holder):
                    if entity_id.startswith("input_select."):
                        found.setdefault(entity_id, set()).update(values)
    return found


def input_select_options(entities: dict[str, dict[str, Any]], automations: list[dict[str, Any]]):
    """``input_select`` helpers that an automation compares with or sets to an option they do not have."""
    wanted = _select_values(automations)
    for entity_id, values in sorted(wanted.items()):
        item = entities.get(entity_id)
        options = (item or {}).get("attributes", {}).get("options")
        if item is None or not isinstance(options, list) or item.get("disabled_by"):
            continue
        missing = sorted(
            v for v in values if v not in options and v not in ("unavailable", "unknown")
        )
        if missing:
            yield {**item, "also": missing[:ALSO_LIMIT]}


STATISTIC_HELPERS = frozenset({"utility_meter", "integration", "derivative"})


def statistic_helper_source(helpers: list[dict[str, Any]], entities: dict[str, dict[str, Any]]):
    """Meter, integration and derivative helpers over a source that does not suit them (a hint)."""
    for helper in helpers:
        source = entities.get(str(helper.get("source") or ""))
        if source is None or source.get("state") in (None, "unavailable", "unknown"):
            continue
        problems = []
        if helper.get("domain") == "utility_meter" and source.get("state_class") not in (
            "total",
            "total_increasing",
        ):
            problems.append("state_class")
        if helper.get("domain") in {"integration", "derivative"} and not source.get("unit"):
            problems.append("unit")
        if problems:
            yield {**helper, "also": problems}


DUPLICATE_IGNORED = frozenset({"name", "hide_members"})


def helper_duplicate(helpers: list[dict[str, Any]]):
    """Helper entries of one type with exactly the same settings, apart from the name (a hint)."""
    groups: dict[str, list[dict[str, Any]]] = {}
    for helper in helpers:
        options = {
            k: v for k, v in (helper.get("options") or {}).items() if k not in DUPLICATE_IGNORED
        }
        if options:
            key = json.dumps([helper.get("domain"), options], sort_keys=True, default=str)
            groups.setdefault(key, []).append(helper)
    for twins in groups.values():
        if len(twins) > 1:
            for helper in twins:
                yield {
                    **{k: v for k, v in helper.items() if k != "options"},
                    "also": [t["object_id"] for t in twins if t is not helper][:5],
                }


def group_members(helpers: list[dict[str, Any]], entities: dict[str, dict[str, Any]]):
    """Groups with a single member or with members that no longer exist (a hint)."""
    for helper in helpers:
        if helper.get("domain") != "group":
            continue
        members = _ids((helper.get("options") or {}).get("entities"))
        missing = [m for m in members if m not in entities]
        if len(members) == 1 or missing:
            yield {
                **{k: v for k, v in helper.items() if k != "options"},
                "also": missing[:5] if missing else members,
            }


def helper_area(entities: dict[str, dict[str, Any]], devices: dict[str, dict[str, Any]]):
    """Helpers (input helpers, counters, timers, helper entries) that belong to no area (a hint)."""
    for item in entities.values():
        if item.get("disabled_by") or item.get("area_id"):
            continue
        helper = item.get("platform") in INPUT_PLATFORMS or item.get("platform") in HELPER_DOMAINS
        device = devices.get(item.get("device_id") or "")
        if helper and not (device and device.get("area_id")):
            yield item


def _number(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def input_number_config(entities: dict[str, dict[str, Any]]):
    """``input_number`` helpers whose range does not hold together or whose value is outside it."""
    for item in entities.values():
        if item.get("platform") != "input_number" or item.get("disabled_by"):
            continue
        attrs = item.get("attributes") or {}
        low, high, step = (
            _number(attrs.get("min")),
            _number(attrs.get("max")),
            _number(attrs.get("step")),
        )
        value = _number(item.get("state"))
        problems: list[str] = []
        if low is not None and high is not None:
            if low >= high:
                problems.append("min ≥ max")
            elif step is not None and step > high - low:
                problems.append("step > max − min")
            if value is not None and not low <= value <= high:
                problems.append("value outside min/max")
        if problems:
            yield {**item, "also": problems}


def template_unused(
    integrations: list[dict[str, Any]], entities: dict[str, dict[str, Any]], used: set[str]
):
    """Template helpers whose entities nothing refers to (a hint: the helper may be a leftover)."""
    members: dict[str, list[str]] = {}
    for item in entities.values():
        if item.get("config_entry_id"):
            members.setdefault(item["config_entry_id"], []).append(item["object_id"])
    for item in integrations:
        if item.get("domain") != "template":
            continue
        own = members.get(item["object_id"], [])
        if own and not any(entity_id in used for entity_id in own):
            yield item


# `| float` or `| int` without a default raises an error when the source has no number.
UNGUARDED_NUMBER = re.compile(r"\|\s*(?:float|int)\b(?!\s*\()")
NUMBER_GUARDS = ("is_number", "has_value", "unavailable", "unknown", "default", "availability")


def template_guard(templates: list[dict[str, Any]]):
    """Template helpers that turn a value into a number without a default or a check (a hint)."""
    for item in templates:
        text = str(item.get("state") or "")
        if UNGUARDED_NUMBER.search(text) and not any(word in text for word in NUMBER_GUARDS):
            yield item


# `state_attr('sensor.x', 'a')`, `is_state_attr('sensor.x', 'a', ...)` and `states.sensor.x.attributes.a`: the entity
# and the attribute are written out, so the pair can be checked. Names built from variables are left alone.
ATTRIBUTE_CALL = re.compile(
    r"""\b(?:state_attr|is_state_attr)\(\s*['"]([a-z0-9_]+\.[a-z0-9_]+)['"]\s*,\s*['"]([A-Za-z0-9_]+)['"]"""
    r"""|\bstates\.([a-z0-9_]+\.[a-z0-9_]+)\.attributes\.([A-Za-z0-9_]+)"""
)
ATTRIBUTE_GUARDS = ("is defined", "default", "is none", "is not none", "has_value", "availability")
# Attributes of these come and go with what is playing.
ATTRIBUTE_SKIP_DOMAINS = ("media_player",)


def attribute_refs(text: str) -> list[tuple[str, str]]:
    """The (entity id, attribute) pairs a template names, each once, in order."""
    found: list[tuple[str, str]] = []
    for match in ATTRIBUTE_CALL.finditer(text):
        pair = (match.group(1) or match.group(3), match.group(2) or match.group(4))
        if pair not in found:
            found.append(pair)
    return found


def template_attribute(templates: list[dict[str, Any]], attributes: dict[str, set[str]]):
    """Template helpers that read an attribute their entity does not have (a hint).

    ``attributes`` holds, per entity id, its attribute names; an entity whose state cannot be read, or
    that has nothing besides its name, is not in it, because its attributes may only be missing for now.
    """
    for item in templates:
        text = str(item.get("text") or item.get("state") or "")
        if any(word in text for word in ATTRIBUTE_GUARDS):
            continue
        missing = [
            f"{entity_id}.{attribute}"
            for entity_id, attribute in attribute_refs(text)
            if entity_id in attributes
            and attribute not in attributes[entity_id]
            and entity_id.split(".", 1)[0] not in ATTRIBUTE_SKIP_DOMAINS
        ]
        if missing:
            yield {**item, "also": missing[:3]}


def template_no_unique_id(entities: list[dict[str, Any]]):
    """Template entities without a ``unique_id``: the interface cannot rename or disable them."""
    yield from entities


def automation_error_handling(automations: list[dict[str, Any]]):
    """Two or more actions, no condition and nothing that handles a failing step (a hint)."""
    for item in _config_automations(automations):
        actions = item.get("actions") or []
        keys = {key for key, _ in _walk(actions)}
        if (
            len(actions) >= 2
            and not item.get("conditions")
            and not keys & set(ERROR_HANDLING_KEYS)
            and not keys & set(BRANCHING_KEYS)
        ):
            yield item


def automation_triggers(automations: list[dict[str, Any]]):
    for item in _config_automations(automations):
        if (item.get("trigger_count") or 0) > TRIGGER_LIMIT:
            yield {**item, "count": item["trigger_count"]}


def automation_literal_ids(automations: list[dict[str, Any]]):
    """Templates that name an entity id as text; a rename breaks them without a warning."""
    for item in _config_automations(automations):
        ids = sorted(
            {
                found
                for block in ("triggers", "conditions", "actions")
                for text in _strings(item.get(block) or [])
                if "{{" in text or "{%" in text
                for found in LITERAL_ID.findall(text)
            }
        )
        if ids:
            yield {**item, "also": ids[:3]}


def automation_self_trigger(automations: list[dict[str, Any]]):
    """A state trigger on an entity the same automation changes (a possible loop)."""
    for item in _config_automations(automations):
        triggered = set()
        for trigger in item.get("triggers") or []:
            if (
                isinstance(trigger, dict)
                and (trigger.get("platform") or trigger.get("trigger")) == "state"
            ):
                triggered |= _entity_ids(trigger)
        changed = _entity_ids(item.get("actions") or [])
        both = sorted(triggered & changed)
        if both:
            yield {**item, "also": both[:3]}


def turn_on_only(
    automations: list[dict[str, Any]],
    scripts: list[dict[str, Any]],
    entities: dict[str, dict[str, Any]],
):
    """Entities that automations or scripts turn on and nothing ever turns off (a hint)."""
    on: set[str] = set()
    off: set[str] = set()
    for item in [*_config_automations(automations), *scripts]:
        for block in item.get("actions") or []:
            if not isinstance(block, dict):
                continue
            service = str(block.get("action") or block.get("service") or "")
            ids = _entity_ids(block)
            if service.endswith(".turn_on"):
                on |= ids
            elif service.endswith((".turn_off", ".toggle")) or service.startswith("scene."):
                off |= ids
    for entity_id in sorted(on - off):
        found = entities.get(entity_id)
        if found is not None and entity_id.split(".", 1)[0] in SWITCHABLE:
            yield found


def referenced(edges: list[dict[str, Any]]) -> set[str]:
    """Entity ids that something refers to."""
    return {
        e["target"].split(":", 1)[1]
        for e in edges
        if str(e.get("target", "")).startswith("entity:")
    }


def exposure_unused(
    exposed: dict[str, list[str]], entities: dict[str, dict[str, Any]], used: set[str]
):
    for entity_id in sorted(exposed):
        item = entities.get(entity_id)
        if item is not None and entity_id not in used:
            yield {**item, "also": exposed[entity_id][:3]}


def exposure_sensitive(exposed: dict[str, list[str]], entities: dict[str, dict[str, Any]]):
    for entity_id in sorted(exposed):
        item = entities.get(entity_id)
        if item is None:
            continue
        domain = entity_id.split(".", 1)[0]
        if domain in SENSITIVE_DOMAINS or (
            domain == "cover" and item.get("device_class") in SENSITIVE_COVERS
        ):
            yield {**item, "also": exposed[entity_id][:3]}


def battery_no_automation(entities: dict[str, dict[str, Any]], used: set[str], threshold: int):
    for entity_id in low_battery_ids(list(entities.values()), threshold):
        if entity_id not in used:
            yield entities[entity_id]


def recorder_unused(entities: dict[str, dict[str, Any]], rates: dict[str, int], used: set[str]):
    for entity_id, per_day in sorted(rates.items()):
        item = entities.get(entity_id)
        if (
            item is not None
            and per_day >= RECORDER_MIN_PER_DAY
            and entity_id not in used
            and not item.get("disabled_by")
        ):
            yield {**item, "rate": per_day}


def recorder_retention(db: dict[str, Any]):
    """One item for the recorder when it keeps long and the database is big."""
    days, size = db.get("keep_days"), db.get("db_bytes")
    if (
        isinstance(days, int)
        and isinstance(size, int)
        and days > RETENTION_DAYS
        and size > RETENTION_BYTES
    ):
        yield {
            "object_type": "recorder",
            "object_id": "recorder",
            "name": "Recorder",
            "keep_days": days,
            "db_bytes": size,
        }


def statistics_issue(kind: str, issues: list[dict[str, Any]], entities: dict[str, dict[str, Any]]):
    """Entities whose statistics changed their ``unit`` or their state ``class`` (see hygiene)."""
    for issue in issues:
        item = entities.get(issue["object_id"])
        if item is not None and issue["kind"] == kind:
            yield {**item, "also": [f"{issue['was']} → {issue['now']}"]}


def dashboard_navigation(dashboards: list[dict[str, Any]]):
    """Buttons that open a view of a dashboard that has no such view."""
    for item in dashboards:
        broken = (item.get("health") or {}).get("broken_navigation")
        if broken:
            yield {**item, "also": broken}


def dashboard_disabled_entities(
    dashboards: list[dict[str, Any]], entities: dict[str, dict[str, Any]]
):
    """Dashboards that show entities which are disabled."""
    for item in dashboards:
        shown = sorted(
            {
                ref["object_id"]
                for ref in item.get("references") or []
                if (entities.get(ref["object_id"]) or {}).get("status") == "disabled"
            }
        )
        if shown:
            yield {**item, "also": shown[:LISTED]}


def dashboard_duplicate_cards(dashboards: list[dict[str, Any]]):
    for item in dashboards:
        doubles = (item.get("health") or {}).get("doubles") or 0
        if doubles:
            yield {**item, "also": [str(doubles)]}


def dashboard_size(dashboards: list[dict[str, Any]]):
    for item in dashboards:
        cards = (item.get("health") or {}).get("cards") or 0
        if cards > DASHBOARD_CARDS:
            yield {**item, "also": [str(cards)]}


def dashboard_custom_cards(dashboards: list[dict[str, Any]]):
    """Custom cards although no dashboard resource is registered at all.

    Whether a given card is loaded cannot be told from the server, so only this sure case counts.
    """
    for item in dashboards:
        health = item.get("health") or {}
        if health.get("custom") and health.get("resources") == 0:
            yield {**item, "also": health["custom"]}


# Objects that exist only for a rule about the system itself; they are not in the snapshot.
SYSTEM_OBJECTS = ("recorder", "http_trusted_networks", "http_external_url", "http_proxies")
LOCAL_SUFFIXES = (".local", ".lan", ".home", ".internal", ".localdomain", ".home.arpa")


def _too_wide(network: str) -> bool:
    """Whether a network reaches public addresses: all of them, a block bigger than any private
    range, or addresses that are routed on the internet. Private and carrier-grade ranges are the
    normal case and are not reported."""
    try:
        net = ip_network(network, strict=False)
    except ValueError:
        return False
    return net.prefixlen == 0 or (net.version == 4 and net.prefixlen < 8) or net.is_global


def _system_item(object_id: str, name: str, also: list[str]) -> dict[str, Any]:
    return {"object_type": "system", "object_id": object_id, "name": name, "also": also}


def http_trusted_networks(http: dict[str, Any]):
    """The trusted_networks login provider with a public network or with the login bypass."""
    if "trusted_networks" not in http:
        return
    also = [net for net in http["trusted_networks"] if _too_wide(net)]
    if http.get("bypass_login"):
        also.append("allow_bypass_login")
    if also:
        yield _system_item("http_trusted_networks", "trusted_networks", also)


def http_external_url(http: dict[str, Any]):
    """An external URL that starts with http:// and names a host outside the home network."""
    parts = urlsplit(str(http.get("external_url") or ""))
    host = (parts.hostname or "").lower()
    if parts.scheme != "http" or not host:
        return
    try:
        address = ip_address(host)
    except ValueError:
        if "." not in host or host.endswith(LOCAL_SUFFIXES):
            return
    else:
        if address.is_private or address.is_loopback or address.is_link_local:
            return
    yield _system_item("http_external_url", "external_url", [host])


def http_proxies(http: dict[str, Any]):
    """trusted_proxies that trust a public network: any sender there may name any client address."""
    also = [net for net in http.get("trusted_proxies") or [] if _too_wide(net)]
    if also:
        yield _system_item("http_proxies", "trusted_proxies", also)


ACCOUNT_DAYS = 90  # days without a login, or a token this old, from which a hint is worth it


def _days_since(moment: datetime | None, now: datetime) -> int | None:
    return None if moment is None else max(0, (now - moment).days)


def user_inactive(auth: dict[str, Any], now: datetime):
    """Active people who never logged in or have not for a long time.

    Only tokens a person logs in with count. An account that holds nothing but long-lived tokens
    is a service account that never logs in, so it is left out.
    """
    for user in auth.get("users") or []:
        if not user["active"] or (user["tokens"] and not user["logins"]):
            continue
        days = _days_since(user["last_login"], now)
        if days is None or days >= ACCOUNT_DAYS:
            item = {"object_type": "user", "object_id": user["id"], "name": user["name"]}
            yield item if days is None else {**item, "days": days}


def user_old_tokens(auth: dict[str, Any], now: datetime):
    """Active accounts with long-lived tokens that are old. Home Assistant does not record when
    such a token is used, so this is the age, never a statement about use."""
    for user in auth.get("users") or []:
        old = [
            f"{token['name']}: {_days_since(token['created'], now)}"
            for token in user["tokens"]
            if (_days_since(token["created"], now) or 0) >= ACCOUNT_DAYS
        ]
        if user["active"] and old:
            yield {
                "object_type": "user",
                "object_id": user["id"],
                "name": user["name"],
                "also": old,
            }


def user_dead_tokens(auth: dict[str, Any], now: datetime):
    """Switched-off accounts that still hold long-lived tokens; the tokens no longer work."""
    for user in auth.get("users") or []:
        if not user["active"] and user["tokens"]:
            yield {
                "object_type": "user",
                "object_id": user["id"],
                "name": user["name"],
                "also": [token["name"] for token in user["tokens"]],
            }


COMPANION_DAYS = 30


def companion_silent(
    devices: dict[str, dict[str, Any]], entities: dict[str, dict[str, Any]], now: datetime
):
    """Companion app devices none of whose watched sensors has reported for a long time.

    The last report of a sensor is the one Housekeeper noted (``stale_last_activity``), so the
    time is "at least since": it starts when the sensor was first watched. A device without any
    watched sensor says nothing.
    """
    seen: dict[str, datetime] = {}
    for item in entities.values():
        moment = item.get("stale_last_activity")
        if not moment or item.get("status") != "active" or not item.get("device_id"):
            continue
        try:
            at = datetime.fromisoformat(moment)
        except ValueError:
            continue
        at = at if at.tzinfo else at.replace(tzinfo=now.tzinfo)
        if item["device_id"] not in seen or at > seen[item["device_id"]]:
            seen[item["device_id"]] = at
    for device in devices.values():
        if device.get("device_kind") == "child" or device.get("status") == "disabled":
            continue
        if not any(str(i).startswith("mobile_app:") for i in device.get("identifiers") or []):
            continue
        last = seen.get(device["object_id"])
        days = None if last is None else _days_since(last, now)
        if days is not None and days >= COMPANION_DAYS:
            also = [str(v) for v in (device.get("model"), device.get("sw_version")) if v]
            yield {**device, "idle_days": days, "also": also}


def _hacs_integrations(integrations: list[dict[str, Any]], flag: str):
    """One item per HACS integration (not per entry) whose HACS data carries ``flag``."""
    seen: set[str] = set()
    for item in integrations:
        info = item.get("hacs")
        if not info or not info.get(flag) or item["domain"] in seen:
            continue
        seen.add(item["domain"])
        also = [str(v) for v in (info.get("installed_version"), info.get("available_version")) if v]
        yield {**item, "name": item.get("integration_name") or item["domain"], "also": also}


def hacs_archived(integrations: list[dict[str, Any]]):
    """Integrations installed through HACS whose GitHub repository is archived (not maintained)."""
    return _hacs_integrations(integrations, "archived")


def hacs_blocked(integrations: list[dict[str, Any]]):
    """HACS integrations with an update waiting that needs a newer Home Assistant than runs."""
    return _hacs_integrations(integrations, "blocked")
