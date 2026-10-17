"""Replacing the references to one entity by another: pure rewriting and read-only discovery.

Housekeeper only replaces what it can recognise exactly: a string that *is* the old entity ID
(or a key of a mapping, or one item of a comma-separated list of entity IDs). Templates that
merely mention the old ID are never rewritten; they are reported so that the person can adjust
them by hand. Nothing here writes; the write functions live in ``cleanup_exec``.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections.abc import Mapping
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.util.yaml import dump, load_yaml

from .cleanup import USAGE_RELATIONS, registry_fingerprint
from .const import MAX_FILE_BACKUP, MAX_PLAN_SNAPSHOTS

MAX_LISTED = 50  # changes and mentions kept per source in a plan; totals stay exact
YAML_FILES = {"automation": "automations.yaml", "script": "scripts.yaml", "scene": "scenes.yaml"}
ENERGY_PARTS = ("energy_sources", "device_consumption", "device_consumption_water")
_ENTITY_ID = re.compile(r"^[a-z0-9_]+\.[a-z0-9_]+$")
_TAGS = re.compile(r"!\s*(secret|include\w*|env_var)\b")


class SourceError(Exception):
    """A configuration cannot be rewritten safely; the message is a reason code."""


def mentions(text: str, entity_id: str) -> bool:
    """Whether ``text`` contains ``entity_id`` as a whole word."""
    return re.search(rf"(?<![\w.]){re.escape(entity_id)}(?![\w])", text) is not None


def rewrite(value: Any, old: str, new: str) -> tuple[Any, list[dict[str, str]], list[str]]:
    """Return ``value`` with ``old`` replaced by ``new``, the changes made and the manual mentions.

    The input is never modified. Changes are ``{"location", "from", "to"}``; manual mentions are
    the locations of templates that contain the old ID.
    """
    changes: list[dict[str, str]] = []
    manual: list[str] = []

    def change(path: str, before: str, after: str) -> None:
        changes.append({"location": path, "from": before, "to": after})

    def walk(node: Any, path: str) -> Any:
        if isinstance(node, str):
            if node == old:
                change(path, old, new)
                return new
            if "," in node:
                tokens = [token.strip() for token in node.split(",")]
                if old in tokens and all(_ENTITY_ID.match(token) for token in tokens):
                    joined = ", ".join(new if token == old else token for token in tokens)
                    change(path, node, joined)
                    return joined
            if ("{{" in node or "{%" in node) and mentions(node, old):
                manual.append(path)
            return node
        if isinstance(node, Mapping):
            result: dict[Any, Any] = {}
            for key, child in node.items():
                child_path = f"{path}/{key}" if path else str(key)
                new_key = key
                if key == old:
                    if new in node:
                        manual.append(child_path)  # the new ID is already a key: do not merge
                    else:
                        new_key = new
                        change(child_path, old, new)
                result[new_key] = walk(child, child_path)
            return result
        if isinstance(node, list):
            return [
                walk(child, f"{path}/{index}" if path else str(index))
                for index, child in enumerate(node)
            ]
        return node

    return walk(value, ""), changes, manual


def text_hash(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()[:16]


def yaml_hash(item: Any) -> str:
    """Hash of a YAML item as it would be written; stable across a write and a reload."""
    return text_hash(dump(item))


def json_hash(item: Any) -> str:
    return text_hash(json.dumps(item, sort_keys=True, default=str))


def load_file(path: str) -> tuple[Any, str]:
    """Blocking: parse a YAML file and return its text too, to look for tags."""
    text = Path(path).read_text(encoding="utf-8")
    if has_tags(text):  # parsing would resolve secrets and includes, and a write would keep that
        raise SourceError("yaml_uses_tags")
    return load_yaml(path), text


def has_tags(text: str) -> bool:
    """Whether a YAML file uses ``!secret`` or ``!include``: writing it back would resolve them."""
    return _TAGS.search(text) is not None


def find_yaml_item(kind: str, data: Any, ref: str) -> Any | None:
    """Locate one automation, script or scene in the parsed file."""
    if kind == "script":
        return data.get(ref) if isinstance(data, Mapping) else None
    if not isinstance(data, list):
        return None
    return next((i for i in data if isinstance(i, Mapping) and str(i.get("id")) == str(ref)), None)


def _energy_item(preferences: Mapping[str, Any] | None) -> dict[str, Any]:
    return {key: preferences[key] for key in ENERGY_PARTS if preferences and key in preferences}


async def load_source(
    hass: HomeAssistant, snapshot: dict[str, Any], source_key: str
) -> dict[str, Any]:
    """Read the configuration behind one source of references, or raise ``SourceError``.

    The result holds everything needed to rewrite and later write it back: ``item`` (the
    current configuration), ``hash`` and, for files, ``path`` and ``ref``.
    """
    kind, _, ident = source_key.partition(":")
    objects = {(o["object_type"], o["object_id"]): o for o in snapshot["objects"]}
    obj = objects.get((kind, ident))
    base = {
        "source": source_key,
        "type": kind,
        "id": ident,
        "name": (obj or {}).get("name") or ident,
    }
    if kind in YAML_FILES:
        ref = {
            "automation": (obj or {}).get("automation_id"),
            "script": ident.split(".", 1)[1] if "." in ident else None,
            "scene": (obj or {}).get("scene_id"),
        }[kind]
        if not ref:
            raise SourceError("not_in_yaml")
        path = hass.config.path(YAML_FILES[kind])
        try:
            data, text = await hass.async_add_executor_job(load_file, path)
        except SourceError:
            raise
        except Exception as err:  # missing file, unreadable or invalid YAML
            raise SourceError("not_in_yaml") from err
        item = find_yaml_item(kind, data, str(ref))
        if item is None:
            raise SourceError("not_in_yaml")
        return {
            **base,
            "format": "yaml",
            "path": path,
            "ref": str(ref),
            "item": item,
            "hash": yaml_hash(item),
            "file_bytes": len(text.encode("utf-8")),
        }
    if kind == "dashboard" and ident == "energy":
        try:
            from homeassistant.components.energy.data import async_get_manager

            manager = await async_get_manager(hass)
        except Exception as err:
            raise SourceError("not_editable") from err
        item = _energy_item(manager.data)
        return {**base, "format": "energy", "item": item, "hash": json_hash(item)}
    if kind == "dashboard":
        try:
            from homeassistant.components.lovelace.const import LOVELACE_DATA

            dashboard = hass.data[LOVELACE_DATA].dashboards.get(
                obj.get("url_path") if obj else None
            )
        except Exception as err:
            raise SourceError("not_editable") from err
        if dashboard is None or getattr(dashboard, "mode", None) != "storage":
            raise SourceError("yaml_mode")
        try:
            item = await dashboard.async_load(False)
        except Exception as err:
            raise SourceError("not_editable") from err
        return {
            **base,
            "format": "dashboard",
            "dashboard": dashboard,
            "item": item,
            "hash": json_hash(item),
        }
    raise SourceError("not_editable")


def source_keys(snapshot: dict[str, Any], entity_id: str) -> list[str]:
    """Objects that use ``entity_id``, in a stable order."""
    return sorted(
        {
            edge["source"]
            for edge in snapshot["edges"]
            if edge["target"] == f"entity:{entity_id}" and edge["relation"] in USAGE_RELATIONS
        }
    )


def _mark_item_level_undo(sources: list[dict[str, Any]]) -> None:
    """Flag the YAML sources whose whole file the journal will not keep.

    Mirrors the executor: files over ``MAX_FILE_BACKUP`` never are, and further files stop once a
    plan holds ``MAX_PLAN_SNAPSHOTS``. Undo then restores such a source item by item, so comments
    and formatting of that file do not come back. Only a hint for the preview.
    """
    kept = 0
    for source in sources:
        size = source.get("file_bytes")
        if not source["writable"] or not source.get("change_count") or size is None:
            source["undo_per_item"] = False
            continue
        whole = size <= MAX_FILE_BACKUP and kept + size <= MAX_PLAN_SNAPSHOTS
        if whole:
            kept += size
        source["undo_per_item"] = not whole


def original_hash(lineage: dict[str, dict[str, str]] | None, key: str, value: str | None) -> Any:
    """The hash a source had before the steps of this run rewrote it (``lineage``: key -> after
    hash -> hash before that write), so an earlier step's own edit does not look like a foreign one."""
    steps = (lineage or {}).get(key, {})
    seen = set()
    while value in steps and value not in seen:
        seen.add(value)
        value = steps[value]
    return value


async def collect_sources(
    hass: HomeAssistant,
    snapshot: dict[str, Any],
    old: str,
    new: str,
    lineage: dict[str, dict[str, str]] | None = None,
) -> tuple[str, list[dict[str, Any]]]:
    """Preview a replacement: every source with the changes it would get.

    Returns a fingerprint over all sources (to detect edits made after the preview) and the
    list of sources. Sources that cannot be rewritten are listed with the reason.
    """
    sources: list[dict[str, Any]] = []
    for key in source_keys(snapshot, old):
        kind, _, ident = key.partition(":")
        entry: dict[str, Any] = {
            "source": key,
            "type": "energy" if key == "dashboard:energy" else kind,
            "id": ident,
        }
        try:
            loaded = await load_source(hass, snapshot, key)
        except SourceError as err:
            sources.append(
                {
                    **entry,
                    "name": ident,
                    "writable": False,
                    "reason": str(err),
                    "hash": None,
                    "changes": [],
                    "manual": [],
                    "change_count": 0,
                }
            )
            continue
        _, changes, manual = rewrite(loaded["item"], old, new)
        sources.append(
            {
                **entry,
                "name": loaded["name"],
                "writable": True,
                "reason": None,
                "hash": loaded["hash"],
                "changes": changes[:MAX_LISTED],
                "change_count": len(changes),
                "manual": manual[:MAX_LISTED],
                "file_bytes": loaded.get("file_bytes"),
            }
        )
    _mark_item_level_undo(sources)
    fingerprint = text_hash(
        json.dumps(
            [
                [s["source"], original_hash(lineage, s["source"], s["hash"]), s["change_count"]]
                for s in sources
            ]
        )
    )
    return fingerprint, sources


def entity_print(hass: HomeAssistant, entity_id: str) -> str:
    """Registry fingerprint of an entity, or ``gone`` for one that only exists as a reference."""
    entry = er.async_get(hass).async_get(entity_id)
    return registry_fingerprint(entry) if entry else "gone"


async def preview_replacement(
    hass: HomeAssistant,
    snapshot: dict[str, Any],
    old: str,
    new: str,
    lineage: dict[str, dict[str, str]] | None = None,
) -> tuple[str, list[dict[str, Any]]]:
    """Fingerprint and sources of a replacement; the fingerprint also covers both entities."""
    sources_print, sources = await collect_sources(hass, snapshot, old, new, lineage)
    return text_hash(
        f"{sources_print}|{entity_print(hass, old)}|{entity_print(hass, new)}"
    ), sources
