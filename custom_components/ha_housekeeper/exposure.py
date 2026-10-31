"""Exposure and privacy: which entities voice assistants and bridges can reach.

Only reads, nothing is stored and nothing is changed. Only metadata leaves this module: entity ids,
names, the assistant and counts. Config entries are read through a whitelist (the entity filter of
a bridge and nothing else), of Nabu Casa only whether Alexa and Google are switched on, per assistant only whether new entities
are exposed by themselves, per entity only whether Google may open it without a PIN, of a
conversation agent or the MCP server only whether it may control Home Assistant (never prompt,
model or key), webhooks are
only counted per integration. A webhook id or url never
appears in a result, not even shortened: whoever knows it can call the webhook.
"""

from __future__ import annotations

import unicodedata
from collections.abc import Mapping
from typing import Any

from homeassistant.core import HomeAssistant

from .const import IGNORE_LABEL
from .payloads import ExposureResult

ASSISTANTS = ("conversation", "cloud.alexa", "cloud.google_assistant")
CLOUD_ASSISTANTS = ("cloud.alexa", "cloud.google_assistant")
# The Nabu Casa switch of a cloud assistant: off means it reaches nothing, whatever is exposed.
CLOUD_SWITCHES = {"cloud.alexa": "alexa_enabled", "cloud.google_assistant": "google_enabled"}
BRIDGE_DOMAINS = ("homekit",)
# The only keys read from the options of a bridge: the entity filter, never ports, codes or pairing data.
FILTER_KEYS = (
    "include_domains",
    "include_entities",
    "include_entity_globs",
    "exclude_domains",
    "exclude_entities",
    "exclude_entity_globs",
)
SENSITIVE_DOMAINS = (
    "alarm_control_panel",
    "lock",
    "person",
    "device_tracker",
    "camera",
    "siren",
    "valve",
)
SENSITIVE_COVERS = ("garage", "gate", "door")
# What Google Assistant only opens or disarms after a PIN, unless the entity is set to skip it.
GOOGLE = "cloud.google_assistant"
GOOGLE_SECURE_DOMAINS = ("lock", "alarm_control_panel", "cover")
# The option of an LLM integration that hands it the Assist API: the Assist exposures go to the model.
LLM_OPTION = "llm_hass_api"
LLM_ASSIST = "assist"
LLM_LOCAL_DOMAINS = ("ollama", "llama_cpp")  # models that run in the house
LLM_EXTERNAL_DOMAINS = ("mcp_server",)  # programs that connect from outside
DIAGNOSTIC_CATEGORIES = ("diagnostic", "config")
STALE_STATUSES = ("disabled", "orphaned")
ITEM_LIMIT = 200
EXPOSED_LIMIT = 2000  # entities listed with the assistants that reach them


def _clean_filter(raw: Any) -> dict[str, list[str]]:
    """Keep the filter keys with lists of text, drop everything else."""
    if not isinstance(raw, Mapping):
        return {}
    cleaned: dict[str, list[str]] = {}
    for key in FILTER_KEYS:
        value = raw.get(key)
        if isinstance(value, list | tuple):
            cleaned[key] = [item for item in value if isinstance(item, str)]
    return cleaned


def normalize_alias(alias: str) -> str:
    """Compare voice names the way a speaker hears them: case, spaces, accents and umlauts do not count."""
    text = alias.casefold()
    for source, target in (("ä", "ae"), ("ö", "oe"), ("ü", "ue"), ("ß", "ss")):
        text = text.replace(source, target)
    text = unicodedata.normalize("NFKD", text)
    return "".join(ch for ch in text if ch.isalnum())


def _cloud_prefs(hass: HomeAssistant) -> Any:
    """The Nabu Casa preferences, or None when the cloud is not loaded or they cannot be read."""
    cloud = hass.data.get("cloud")
    return getattr(getattr(cloud, "client", None), "prefs", None)


def _cloud_switch_off(prefs: Any, name: str) -> bool:
    """True only when the switch reads as a plain False; anything unreadable keeps the check."""
    try:
        return getattr(prefs, CLOUD_SWITCHES[name]) is False
    except Exception:  # noqa: BLE001 - another cloud version: check as before, never assume off
        return False


def _assistant_exposure(hass: HomeAssistant, entity_ids: list[str]) -> dict[str, dict[str, Any]]:
    """Per assistant: its status and the entities it may use. A source that fails is "unavailable"."""
    result: dict[str, dict[str, Any]] = {}
    try:
        from homeassistant.components.homeassistant.exposed_entities import async_should_expose
    except Exception:  # noqa: BLE001 - another Home Assistant version without this module
        return {name: {"status": "unavailable", "exposed": []} for name in ASSISTANTS}
    prefs = _cloud_prefs(hass)
    for name in ASSISTANTS:
        if name in CLOUD_ASSISTANTS and "cloud" not in hass.config.components:
            result[name] = {"status": "inactive", "exposed": []}
            continue
        if name in CLOUD_ASSISTANTS and prefs is not None and _cloud_switch_off(prefs, name):
            result[name] = {"status": "off", "exposed": []}
            continue
        try:
            exposed = [eid for eid in entity_ids if async_should_expose(hass, name, eid)]
        except Exception:  # noqa: BLE001 - never report a failed check as "not exposed"
            result[name] = {"status": "unavailable", "exposed": []}
            continue
        result[name] = {"status": "ok", "exposed": exposed}
    return result


def _expose_new(hass: HomeAssistant, assistants: dict[str, dict[str, Any]]) -> dict[str, bool]:
    """Per working cloud assistant: whether new entities are exposed by themselves. Unreadable is
    left out. Assist is not asked: Home Assistant exposes new entities to it by default."""
    result: dict[str, bool] = {}
    try:
        from homeassistant.components.homeassistant.const import DATA_EXPOSED_ENTITIES

        store = hass.data[DATA_EXPOSED_ENTITIES]
    except Exception:  # noqa: BLE001 - another Home Assistant version or not set up
        return result
    for name in CLOUD_ASSISTANTS:
        if assistants.get(name, {}).get("status") != "ok":
            continue
        try:
            result[name] = store.async_get_expose_new_entities(name) is True
        except Exception:  # noqa: BLE001
            continue
    return result


def _google_without_pin(hass: HomeAssistant, assistants: dict[str, dict[str, Any]]) -> list[str]:
    """Entities Google may open or disarm without asking for the PIN. Only the switch is read."""
    if assistants.get(GOOGLE, {}).get("status") != "ok":
        return []
    try:
        from homeassistant.components.homeassistant.exposed_entities import (
            async_get_entity_settings,
        )
    except Exception:  # noqa: BLE001
        return []
    found = []
    for eid in assistants[GOOGLE]["exposed"]:
        if eid.split(".", 1)[0] not in GOOGLE_SECURE_DOMAINS:
            continue
        try:
            options = async_get_entity_settings(hass, eid).get(GOOGLE) or {}
        except Exception:  # noqa: BLE001 - never report a failed read as "without PIN"
            continue
        if options.get("disable_2fa") is True:
            found.append(eid)
    return found


def _uses_assist(value: Any) -> bool:
    if isinstance(value, str):
        return value == LLM_ASSIST
    return isinstance(value, list | tuple) and LLM_ASSIST in value


def _llm_agents(hass: HomeAssistant) -> list[dict[str, str]]:
    """Enabled integrations whose agent may control Home Assistant through Assist. Only that one
    option is read, of the entry and of its subentries; local models are left out."""
    agents = []
    for entry in hass.config_entries.async_entries():
        if entry.disabled_by is not None or entry.domain in LLM_LOCAL_DOMAINS:
            continue
        options = [entry.options] + [sub.data for sub in getattr(entry, "subentries", {}).values()]
        if any(isinstance(o, Mapping) and _uses_assist(o.get(LLM_OPTION)) for o in options):
            target = "external" if entry.domain in LLM_EXTERNAL_DOMAINS else "cloud"
            agents.append(
                {
                    "entry_id": entry.entry_id,
                    "domain": entry.domain,
                    "title": entry.title,
                    "target": target,
                }
            )
    return agents


def _bridges(hass: HomeAssistant) -> list[dict[str, Any]]:
    bridges = []
    for entry in hass.config_entries.async_entries():
        if entry.domain not in BRIDGE_DOMAINS:
            continue
        options = entry.options if isinstance(entry.options, Mapping) else {}
        bridges.append(
            {
                "kind": entry.domain,
                "title": entry.title,
                "filter": _clean_filter(options.get("filter")),
            }
        )
    return bridges


def _webhook_counts(hass: HomeAssistant) -> dict[str, int]:
    """Webhooks per integration. Only the domain of a registration is read, never its id."""
    counts: dict[str, int] = {}
    registered = hass.data.get("webhook")
    if not isinstance(registered, Mapping):
        return counts
    for registration in list(registered.values()):
        domain = getattr(registration, "domain", None)
        key = domain if isinstance(domain, str) else ""
        counts[key] = counts.get(key, 0) + 1
    return counts


def collect(hass: HomeAssistant, entity_ids: list[str]) -> dict[str, Any]:
    """Blocking-free: read the metadata the judgement needs."""
    live = {entry.domain for entry in hass.config_entries.async_entries()} | set(
        hass.config.components
    )
    assistants = _assistant_exposure(hass, entity_ids)
    return {
        "assistants": assistants,
        "expose_new": _expose_new(hass, assistants),
        "google_without_pin": _google_without_pin(hass, assistants),
        "llm_agents": _llm_agents(hass),
        "bridges": _bridges(hass),
        "webhooks": _webhook_counts(hass),
        "live_domains": sorted(live),
    }


def _bridge_exposed(bridge_filter: dict[str, list[str]], entity_ids: list[str]) -> list[str]:
    from homeassistant.helpers.entityfilter import convert_filter

    try:
        accepts = convert_filter({key: bridge_filter.get(key, []) for key in FILTER_KEYS})
    except Exception:  # noqa: BLE001
        return []
    return [eid for eid in entity_ids if accepts(eid)]


def _sensitive(info: dict[str, Any]) -> bool:
    domain = info["domain"]
    if domain in SENSITIVE_DOMAINS:
        return True
    return domain == "cover" and info.get("device_class") in SENSITIVE_COVERS


def _google_secure(info: dict[str, Any]) -> bool:
    """Locks, alarm panels and doors, garage doors and gates: Google asks for a PIN before opening."""
    if info["domain"] in ("lock", "alarm_control_panel"):
        return True
    return info["domain"] == "cover" and info.get("device_class") in SENSITIVE_COVERS


def evaluate(
    raw: dict[str, Any], entities: dict[str, dict[str, Any]], ignored: set[str]
) -> dict[str, Any]:
    """Judge the collected data. ``entities`` maps entity_id to name, status and registry facts."""
    names = {eid: info.get("name") or eid for eid, info in entities.items()}
    known = [eid for eid in entities if eid not in ignored]
    by_entity: dict[str, set[str]] = {}
    assistants = []
    for name in ASSISTANTS:
        item = raw["assistants"].get(name, {"status": "unavailable", "exposed": []})
        exposed = [eid for eid in item["exposed"] if eid in entities and eid not in ignored]
        for eid in exposed:
            by_entity.setdefault(eid, set()).add(name)
        assistants.append({"id": name, "status": item["status"], "exposed": len(exposed)})
    bridges = []
    for bridge in raw["bridges"]:
        exposed = _bridge_exposed(bridge["filter"], known)
        for eid in exposed:
            by_entity.setdefault(eid, set()).add(bridge["kind"])
        bridges.append({"kind": bridge["kind"], "title": bridge["title"], "exposed": len(exposed)})

    def items(rule: Any) -> tuple[list[dict[str, Any]], int]:
        found = [
            {"entity_id": eid, "name": names[eid], "assistants": sorted(by_entity[eid])}
            for eid in sorted(by_entity)
            if rule(entities[eid])
        ]
        return found[:ITEM_LIMIT], len(found)

    findings: list[dict[str, Any]] = []
    for kind, level, rule in (
        (
            "stale_exposed",
            "warn",
            lambda info: info.get("status") in STALE_STATUSES,
        ),
        (
            "diagnostic_exposed",
            "hint",
            lambda info: info.get("entity_category") in DIAGNOSTIC_CATEGORIES,
        ),
        ("sensitive_exposed", "hint", _sensitive),
    ):
        found, total = items(rule)
        if total:
            findings.append({"kind": kind, "level": level, "count": total, "items": found})

    no_pin = sorted(
        eid
        for eid in raw.get("google_without_pin", [])
        if eid in entities and eid not in ignored and _google_secure(entities[eid])
    )
    if no_pin:
        findings.append(
            {
                "kind": "google_without_pin",
                "level": "warn",
                "count": len(no_pin),
                "items": [
                    {"entity_id": eid, "name": names[eid], "assistants": sorted(by_entity[eid])}
                    for eid in no_pin[:ITEM_LIMIT]
                ],
            }
        )
    auto = [
        name
        for name in CLOUD_ASSISTANTS
        if raw.get("expose_new", {}).get(name)
        and raw["assistants"].get(name, {}).get("status") == "ok"
    ]
    if auto:
        findings.append(
            {"kind": "auto_expose", "level": "hint", "count": len(auto), "assistants": auto}
        )

    assist = next(a for a in assistants if a["id"] == "conversation")
    agents = raw.get("llm_agents", [])
    if agents and assist["status"] == "ok" and assist["exposed"]:
        findings.append(
            {
                "kind": "llm_exposed",
                "level": "hint",
                "count": len(agents),
                "reach": assist["exposed"],
                "integrations": sorted(
                    agents, key=lambda a: (a["title"].casefold(), a["entry_id"])
                ),
            }
        )

    for name in ASSISTANTS:
        if raw["assistants"].get(name, {}).get("status") != "ok":
            continue
        aliases: dict[str, dict[str, Any]] = {}
        for eid in raw["assistants"][name]["exposed"]:
            if eid not in entities or eid in ignored:
                continue
            for alias in (a for a in entities[eid].get("aliases") or [] if isinstance(a, str)):
                key = normalize_alias(alias)
                if key:
                    group = aliases.setdefault(key, {"alias": alias, "entities": set()})
                    group["entities"].add(eid)
        for group in sorted(aliases.values(), key=lambda g: g["alias"]):
            if len(group["entities"]) > 1:
                findings.append(
                    {
                        "kind": "alias_duplicate",
                        "level": "warn",
                        "assistant": name,
                        "alias": group["alias"],
                        "count": len(group["entities"]),
                        "items": [
                            {"entity_id": eid, "name": names[eid]}
                            for eid in sorted(group["entities"])
                        ],
                    }
                )

    live = set(raw["live_domains"])
    orphans = {d: n for d, n in raw["webhooks"].items() if d and d not in live}
    for domain in sorted(orphans):
        findings.append(
            {"kind": "webhook_orphan", "level": "warn", "domain": domain, "count": orphans[domain]}
        )
    exposed_all = [
        {"entity_id": eid, "name": names[eid], "assistants": sorted(by_entity[eid])}
        for eid in sorted(by_entity, key=lambda e: (names[e].casefold(), e))
    ]
    return {
        "exposed_entities": exposed_all[:EXPOSED_LIMIT],
        "exposed_total": len(exposed_all),
        "assistants": assistants,
        "bridges": bridges,
        "webhooks": sum(raw["webhooks"].values()),
        "checked": len(known),
        "findings": findings,
    }


def exposure(hass: HomeAssistant, snapshot: dict[str, Any]) -> ExposureResult:
    """Exposure of the entities in the snapshot to assistants and bridges."""
    entities = {
        item["object_id"]: {
            "name": item.get("name"),
            "domain": item["object_id"].split(".", 1)[0],
            "status": item.get("status"),
            "entity_category": item.get("entity_category"),
            "device_class": item.get("device_class"),
            "aliases": item.get("aliases") or [],
        }
        for item in snapshot["objects"]
        if item["object_type"] == "entity"
    }
    ignored = {f["object_id"] for f in snapshot.get("findings", []) if f.get("ignored")} | {
        item["object_id"]
        for item in snapshot["objects"]
        if item["object_type"] == "entity"
        and (IGNORE_LABEL in (item.get("labels") or []) or item.get("excepted"))
    }
    return {"available": True, **evaluate(collect(hass, list(entities)), entities, ignored)}  # type: ignore[typeddict-item]
