"""Renaming an entity ID and carrying every reference to it along.

Home Assistant renames the entity and moves its history and statistics, but not the places that
name it. The sources found here are the same ones a replacement rewrites.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant, valid_entity_id
from homeassistant.helpers import entity_registry as er

from .references import collect_sources, entity_print, text_hash


def taken(hass: HomeAssistant, entity_id: str) -> bool:
    """Whether an entity or a state already uses this ID."""
    return er.async_get(hass).async_get(entity_id) is not None or (
        hass.states.get(entity_id) is not None
    )


async def prepare(
    hass: HomeAssistant,
    snapshot: dict[str, Any],
    old: str,
    new: str,
    lineage: dict[str, dict[str, str]] | None = None,
) -> dict[str, Any]:
    """What a rename touches: the registry facts, the sources and a fingerprint of both."""
    valid = valid_entity_id(new) and new.split(".", 1)[0] == old.split(".", 1)[0]
    free = valid and not taken(hass, new)
    sources_print, sources = await collect_sources(hass, snapshot, old, new, lineage)
    return {
        "registered": er.async_get(hass).async_get(old) is not None,
        "valid": valid,
        "free": free,
        "sources": sources,
        "fingerprint": text_hash(f"{sources_print}|{entity_print(hass, old)}|{free}"),
    }
