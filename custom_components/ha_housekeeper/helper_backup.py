"""Export a helper entry and create it again from such an export.

A helper that is a config entry (template, min/max, derivative …) is little more than its options.
``export_helper`` takes them with the registry settings of its entities (name, area, labels …);
``create_helper`` runs the helper's own config flow with them, so Home Assistant itself validates
and creates the entry, then puts the entity IDs and settings back. Nothing here touches private
Home Assistant internals; a flow that cannot be walked ends as ``conflict_helper_flow`` and the
backup stays the way back.
"""

from __future__ import annotations

import asyncio
import copy
from typing import Any

from homeassistant.config_entries import SOURCE_USER
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import entity_registry as er

from .const import DOMAIN
from .dashboard_analysis import HELPER_DOMAINS

FORMAT = "housekeeper-helper-export"
FORMAT_VERSION = 1
MAX_FLOW_STEPS = 8
SETUP_WAIT = 6.0
MENU_KEYS = ("template_type", "group_type")


class HelperError(Exception):
    """The helper could not be created; ``reason`` is the undo outcome."""

    def __init__(self, reason: str) -> None:
        super().__init__(reason)
        self.reason = reason


def export_helper(hass: HomeAssistant, entry_id: str) -> dict[str, Any] | None:
    """What it takes to create the helper again, or None if the entry is no helper."""
    from .cleanup_exec import _restore_data

    entry = hass.config_entries.async_get_entry(entry_id)
    if entry is None or entry.domain not in HELPER_DOMAINS or entry.domain == DOMAIN:
        return None
    registry = er.async_get(hass)
    entities = [
        _restore_data(e)
        for e in sorted(
            er.async_entries_for_config_entry(registry, entry_id), key=lambda e: e.entity_id
        )
    ]
    return {
        "domain": entry.domain,
        "title": str(entry.title or ""),
        "options": copy.deepcopy(dict(entry.options)),
        "entities": entities,
    }


def export_file(hass: HomeAssistant, entry_ids: list[str], now: str) -> dict[str, Any]:
    """The file of an export: format marker, time, and the helpers that could be exported."""
    helpers = [h for i in entry_ids if (h := export_helper(hass, i)) is not None]
    return {"format": FORMAT, "version": FORMAT_VERSION, "exported_at": now, "helpers": helpers}


def check_note(note: Any) -> str | None:
    """Why a helper note cannot be created (None if it can); shape and domain only."""
    if not isinstance(note, dict):
        return "invalid_helper"
    if note.get("domain") not in HELPER_DOMAINS or note.get("domain") == DOMAIN:
        return "not_helper"
    if not isinstance(note.get("options"), dict) or not isinstance(note.get("title"), str):
        return "invalid_helper"
    entities = note.get("entities", [])
    if not isinstance(entities, list) or not all(
        isinstance(e, dict) and isinstance(e.get("entity_id"), str) for e in entities
    ):
        return "invalid_helper"
    return None


def taken_ids(hass: HomeAssistant, note: dict[str, Any]) -> list[str]:
    """Entity IDs of the note that exist again (registry or state)."""
    registry = er.async_get(hass)
    return [
        e["entity_id"]
        for e in note.get("entities", [])
        if registry.async_get(e["entity_id"]) is not None
        or hass.states.get(e["entity_id"]) is not None
    ]


def _form_input(schema: Any, note: dict[str, Any]) -> dict[str, Any]:
    """The values of a form step: the saved options by field name, the title as the name."""
    values: dict[str, Any] = {}
    for key in getattr(schema, "schema", {}) or {}:
        name = str(getattr(key, "schema", key))
        if name == "name":
            values[name] = note["title"]
        elif name in note["options"]:
            values[name] = copy.deepcopy(note["options"][name])
    return values


async def _walk_flow(hass: HomeAssistant, note: dict[str, Any]) -> str:
    """Run the config flow of the helper's domain to its end and return the new entry's ID."""
    flows = hass.config_entries.flow
    try:
        result = await flows.async_init(note["domain"], context={"source": SOURCE_USER})
    except Exception as err:
        raise HelperError("conflict_helper_flow") from err
    for _ in range(MAX_FLOW_STEPS):
        kind = result["type"]
        if kind == FlowResultType.CREATE_ENTRY:
            return str(result["result"].entry_id)
        try:
            if kind == FlowResultType.MENU:
                choice = next(
                    (
                        note["options"][key]
                        for key in MENU_KEYS
                        if note["options"].get(key) in (result.get("menu_options") or [])
                    ),
                    None,
                )
                if choice is None:
                    break
                result = await flows.async_configure(result["flow_id"], {"next_step_id": choice})
            elif kind == FlowResultType.FORM and not result.get("errors"):
                result = await flows.async_configure(
                    result["flow_id"], _form_input(result.get("data_schema"), note)
                )
                if result["type"] == FlowResultType.FORM and result.get("errors"):
                    break
            else:
                break
        except Exception:
            break
    if "flow_id" in result:
        flows.async_abort(result["flow_id"])
    raise HelperError("conflict_helper_flow")


async def _wait_for_entities(
    hass: HomeAssistant, entry_id: str, count: int
) -> list[er.RegistryEntry]:
    """The entities of the new entry; they appear while the entry sets up."""
    registry = er.async_get(hass)
    for _ in range(int(SETUP_WAIT / 0.2)):
        found = er.async_entries_for_config_entry(registry, entry_id)
        if len(found) >= count:
            return list(found)
        await asyncio.sleep(0.2)
    return list(er.async_entries_for_config_entry(registry, entry_id))


async def create_helper(hass: HomeAssistant, note: dict[str, Any]) -> dict[str, Any]:
    """Create the helper of ``note`` anew; raises ``HelperError`` with the undo outcome."""
    problem = check_note(note)
    if problem:
        raise HelperError("conflict_helper_flow")
    if taken_ids(hass, note):
        raise HelperError("conflict_taken")
    entry_id = await _walk_flow(hass, note)
    entry = hass.config_entries.async_get_entry(entry_id)
    if entry is not None and dict(entry.options) != note["options"]:
        hass.config_entries.async_update_entry(entry, options=copy.deepcopy(note["options"]))
    created = await _wait_for_entities(hass, entry_id, len(note.get("entities", [])))
    from .cleanup_exec import _put_helper_entities_back

    differ = _put_helper_entities_back(hass, created, note)
    return {"entry_id": entry_id, "ids_differ": differ}
