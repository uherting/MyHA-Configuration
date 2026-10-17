"""Exposure and privacy: which entities voice assistants and bridges can reach.

Only reads, nothing is stored and nothing is changed. Only metadata leaves this module: entity ids,
names, the assistant and counts. Config entries are read through a whitelist (the entity filter of
a bridge and nothing else), webhooks are only counted per integration. A webhook id or url never
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
SENSITIVE_DOMAINS = ("alarm_control_panel", "lock", "person", "device_tracker")
SENSITIVE_COVERS = ("garage", "gate")
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


def _assistant_exposure(hass: HomeAssistant, entity_ids: list[str]) -> dict[str, dict[str, Any]]:
    """Per assistant: its status and the entities it may use. A source that fails is "unavailable"."""
    result: dict[str, dict[str, Any]] = {}
    try:
        from homeassistant.components.homeassistant.exposed_entities import async_should_expose
    except Exception:  # noqa: BLE001 - another Home Assistant version without this module
        return {name: {"status": "unavailable", "exposed": []} for name in ASSISTANTS}
    for name in ASSISTANTS:
        if name in CLOUD_ASSISTANTS and "cloud" not in hass.config.components:
            result[name] = {"status": "inactive", "exposed": []}
            continue
        try:
            exposed = [eid for eid in entity_ids if async_should_expose(hass, name, eid)]
        except Exception:  # noqa: BLE001 - never report a failed check as "not exposed"
            result[name] = {"status": "unavailable", "exposed": []}
            continue
        result[name] = {"status": "ok", "exposed": exposed}
    return result


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
    return {
        "assistants": _assistant_exposure(hass, entity_ids),
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
        if item["object_type"] == "entity" and IGNORE_LABEL in (item.get("labels") or [])
    }
    return {"available": True, **evaluate(collect(hass, list(entities)), entities, ignored)}  # type: ignore[typeddict-item]
