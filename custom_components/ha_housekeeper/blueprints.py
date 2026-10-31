"""Blueprints: which ones nothing uses any more, and which automations point to one that is gone.

Only reads. A blueprint is "used" when an automation or script in the snapshot names its path.
"""

from __future__ import annotations

import json
import os
import re
from collections.abc import Iterable, Mapping
from datetime import UTC, datetime
from typing import Any

from homeassistant.core import HomeAssistant

from .payloads import BlueprintsResult

DOMAINS = ("automation", "script")
LIST_LIMIT = 100
USERS_LIMIT = 50
SHOWN_LIMIT = 120
ENTITY_ID = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")
SECRET_INPUT = re.compile(r"token|secret|passw|api|key|pin|code|auth|credential", re.IGNORECASE)


def evaluate(
    available: dict[str, dict[str, dict[str, Any]]],
    users: dict[str, dict[str, list[dict[str, str]]]],
) -> BlueprintsResult:
    """``available``: domain -> path -> {name, ok, author, source_url, description}; ``users``: domain -> path -> [{id, name}]."""
    domains = []
    totals = {"unused": 0, "missing": 0, "broken": 0}
    for domain in DOMAINS:
        files = available.get(domain, {})
        used = users.get(domain, {})
        unused = [
            {
                "path": path,
                "name": info["name"],
                "author": info.get("author"),
                "source_url": info.get("source_url"),
                "description": info.get("description"),
            }
            for path, info in sorted(files.items())
            if info["ok"] and not used.get(path)
        ]
        broken = [
            {
                "path": path,
                "users": used.get(path, [])[:USERS_LIMIT],
                "count": len(used.get(path, [])),
            }
            for path, info in sorted(files.items())
            if not info["ok"]
        ]
        missing = [
            {"path": path, "users": people[:USERS_LIMIT], "count": len(people)}
            for path, people in sorted(used.items())
            if path not in files
        ]
        totals["unused"] += len(unused)
        totals["missing"] += len(missing)
        totals["broken"] += len(broken)
        domains.append(
            {
                "domain": domain,
                "total": len(files),
                "unused": unused[:LIST_LIMIT],
                "missing": missing[:LIST_LIMIT],
                "broken": broken[:LIST_LIMIT],
            }
        )
    return {"available": True, "domains": domains, **totals}  # type: ignore[typeddict-item]


def blueprint_path(entity: Any) -> str | None:
    """The blueprint an automation or script uses, or None.

    A loaded one names it itself (``referenced_blueprint``). One whose blueprint is gone is not
    loaded: Home Assistant keeps it as an unavailable entity that answers None there, and the path
    stays in its raw configuration. Only a text path counts; any other shape says nothing.
    """
    path = getattr(entity, "referenced_blueprint", None)
    if isinstance(path, str) and path:
        return path
    raw = getattr(entity, "raw_config", None)
    use = raw.get("use_blueprint") if isinstance(raw, Mapping) else None
    path = use.get("path") if isinstance(use, Mapping) else None
    return path if isinstance(path, str) and path else None


def missing_blueprint_findings(
    items: Iterable[dict[str, Any]], available: dict[str, Iterable[str]] | None
) -> list[dict[str, Any]]:
    """One finding for each automation or script whose blueprint file Home Assistant does not know.

    ``available``: domain -> the paths of every blueprint file, also those that fail to load (they
    are "broken", not "missing"). ``None`` (the list could not be read) says nothing.
    """
    if available is None:
        return []
    known = {domain: set(paths) for domain, paths in available.items()}
    findings = []
    for item in items:
        domain, path = item["object_type"], item.get("blueprint")
        if domain not in DOMAINS or not isinstance(path, str) or not path:
            continue
        if path in known.get(domain, set()):
            continue
        findings.append(
            {
                "rule_id": f"{domain}.missing_blueprint",
                "object_id": item["object_id"],
                "classification": "broken_reference",
                "confidence": 0.98,
                "first_detected_at": None,
                "affected_object": path,
                "evidence": [
                    {
                        "kind": "missing_reference",
                        "source": "blueprint_files",
                        "location": "use_blueprint",
                    }
                ],
            }
        )
    return findings


def _text(value: Any) -> str | None:
    return value if isinstance(value, str) and value else None


def _shown(value: Any) -> str:
    """A value as short text; lists and mappings as JSON."""
    text = (
        str(value)
        if isinstance(value, str | int | float | bool) or value is None
        else json.dumps(value, default=str, ensure_ascii=False)
    )
    return text if len(text) <= SHOWN_LIMIT else text[: SHOWN_LIMIT - 1] + "\u2026"


def _selector_kind(selector: Any) -> str | None:
    return next(iter(selector), None) if isinstance(selector, Mapping) and selector else None


def input_rows(inputs: Any, section: str = "") -> list[dict[str, Any]]:
    """The inputs of a blueprint, flat; an input inside a section carries the section's name."""
    rows: list[dict[str, Any]] = []
    if not isinstance(inputs, Mapping):
        return rows
    for key, value in inputs.items():
        if isinstance(value, Mapping) and isinstance(value.get("input"), Mapping):
            rows.extend(input_rows(value["input"], _text(value.get("name")) or str(key)))
            continue
        value = value if isinstance(value, Mapping) else {}
        rows.append(
            {
                "key": str(key),
                "name": _text(value.get("name")) or str(key),
                "description": _text(value.get("description")),
                "selector": _selector_kind(value.get("selector")),
                "has_default": "default" in value,
                "default": _shown(value["default"]) if "default" in value else None,
                "section": section,
            }
        )
    return rows


def user_inputs(
    config: Any, rows: list[dict[str, Any]], known_entities: set[str]
) -> list[dict[str, Any]]:
    """What one automation or script set for each input: ``default``, ``set`` or ``missing_entity``.

    A text input that looks like a secret keeps its value out of the answer.
    """
    use = config.get("use_blueprint") if isinstance(config, Mapping) else None
    given = use.get("input") if isinstance(use, Mapping) else None
    given = given if isinstance(given, Mapping) else {}
    out = []
    for row in rows:
        key = row["key"]
        if key not in given:
            out.append({"key": key, "state": "default", "value": None})
            continue
        value = given[key]
        state, shown = "set", _shown(value)
        if row["selector"] == "text" and SECRET_INPUT.search(f"{key} {row['name']}"):
            shown = None
        elif row["selector"] == "entity":
            ids = value if isinstance(value, list) else [value]
            if any(
                isinstance(i, str) and ENTITY_ID.match(i) and i not in known_entities for i in ids
            ):
                state = "missing_entity"
        out.append({"key": key, "state": state, "value": shown})
    return out


async def async_available(hass: HomeAssistant) -> dict[str, dict[str, dict[str, Any]]]:
    """Every blueprint file by domain and path: ``{name, ok, author, source_url, description}``; ``ok`` is False for one that fails."""
    from homeassistant.components.automation.helpers import (
        async_get_blueprints as automation_blueprints,
    )
    from homeassistant.components.blueprint.errors import BlueprintException
    from homeassistant.components.script.helpers import async_get_blueprints as script_blueprints

    getters = {"automation": automation_blueprints, "script": script_blueprints}
    available: dict[str, dict[str, dict[str, Any]]] = {}
    for domain, getter in getters.items():
        found: dict[str, dict[str, Any]] = {}
        for path, blueprint in (await getter(hass).async_get_blueprints()).items():
            ok = blueprint is not None and not isinstance(blueprint, BlueprintException)
            metadata = getattr(blueprint, "metadata", None)
            metadata = metadata if isinstance(metadata, Mapping) else {}
            found[str(path)] = {
                "ok": ok,
                "name": getattr(blueprint, "name", None) or str(path),
                "author": _text(metadata.get("author")),
                "source_url": _text(metadata.get("source_url")),
                "description": _text(metadata.get("description")),
            }
        available[domain] = found
    return available


async def async_blueprints(hass: HomeAssistant, snapshot: dict[str, Any]) -> BlueprintsResult:
    """Blueprints of Home Assistant against the automations and scripts in the snapshot."""
    available = await async_available(hass)
    users: dict[str, dict[str, list[dict[str, str]]]] = {domain: {} for domain in DOMAINS}
    for item in snapshot["objects"]:
        path = item.get("blueprint")
        if item["object_type"] in DOMAINS and isinstance(path, str) and path:
            users[item["object_type"]].setdefault(path, []).append(
                {"id": item["object_id"], "name": item.get("name") or item["object_id"]}
            )
    return evaluate(available, users)


def _file_facts(hass: HomeAssistant, domain: str, path: str) -> tuple[int | None, str | None]:
    full = hass.config.path("blueprints", domain, path)
    try:
        stat = os.stat(full)
    except OSError:
        return None, None
    return stat.st_size, datetime.fromtimestamp(stat.st_mtime, UTC).isoformat()


async def async_blueprint_detail(
    hass: HomeAssistant,
    domain: str,
    path: str,
    entities: Iterable[Any],
    known_entities: set[str],
) -> dict[str, Any]:
    """One blueprint: its metadata and inputs, the file, and what each of its users set.

    ``path`` must be a file Home Assistant lists or one an automation names; nothing else is read.
    ``entities``: the loaded automations or scripts of the domain.
    """
    from homeassistant.components.automation.helpers import (
        async_get_blueprints as automation_blueprints,
    )
    from homeassistant.components.script.helpers import async_get_blueprints as script_blueprints

    getter = {"automation": automation_blueprints, "script": script_blueprints}.get(domain)
    if getter is None:
        return {"available": False}
    found = (await getter(hass).async_get_blueprints()).get(path)
    metadata = getattr(found, "metadata", None)
    metadata = metadata if isinstance(metadata, Mapping) else {}
    rows = input_rows(metadata.get("input"))
    users = []
    for entity in entities:
        if blueprint_path(entity) != path:
            continue
        users.append(
            {
                "id": entity.entity_id,
                "name": getattr(entity, "name", None) or entity.entity_id,
                "inputs": user_inputs(getattr(entity, "raw_config", None), rows, known_entities),
            }
        )
    users.sort(key=lambda u: str(u["name"]).casefold())
    size = modified = None
    if found is not None:
        size, modified = await hass.async_add_executor_job(_file_facts, hass, domain, path)
    min_version = (metadata.get("homeassistant") or {}).get("min_version")
    return {
        "available": True,
        "domain": domain,
        "path": path,
        "found": found is not None,
        "min_version": _text(min_version),
        "size": size,
        "modified": modified,
        "inputs": rows,
        "users": users[:USERS_LIMIT],
        "user_count": len(users),
    }
