"""Assigning an area to an entity or a device that has none, with a suggestion from its surroundings.

Only reads the registries. The suggestion comes from the device (the area of its other entities)
or the integration (the area most of its devices have); a name is never guessed from.
"""

from __future__ import annotations

from collections import Counter
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from .cleanup import device_fingerprint, registry_fingerprint

MIN_DEVICES = 2  # devices of the integration that must have an area
MIN_SHARE = 0.6  # share of them that must agree


def _majority(counter: Counter[str], total: int, share: float) -> str | None:
    if not counter:
        return None
    area, count = counter.most_common(1)[0]
    return area if count / total >= share else None


def suggest(hass: HomeAssistant, object_id: str) -> str | None:
    """The area a device or an entity most likely belongs to, or ``None`` without a safe guess."""
    entities, devices = er.async_get(hass), dr.async_get(hass)
    if "." in object_id:
        entry = entities.async_get(object_id)
        device = devices.async_get(entry.device_id) if entry and entry.device_id else None
    else:
        entry, device = None, devices.async_get(object_id)
    if device is None:
        return None
    own = Counter(
        e.area_id
        for e in er.async_entries_for_device(entities, device.id)
        if e.area_id and e.entity_id != object_id
    )
    found = _majority(own, sum(own.values()), 0.5001)
    if found or entry is not None:
        return found
    domains = {
        entities_entry.platform
        for entities_entry in er.async_entries_for_device(entities, device.id)
    }
    if not domains:
        return None
    siblings = Counter(
        d.area_id
        for d in devices.devices.values()
        if d.id != device.id
        and d.area_id
        and domains & {e.platform for e in er.async_entries_for_device(entities, d.id)}
    )
    total = sum(siblings.values())
    return _majority(siblings, total, MIN_SHARE) if total >= MIN_DEVICES else None


def prepare(hass: HomeAssistant, object_id: str, target: str) -> dict[str, Any]:
    """What the registries hold for one assignment; ``target`` empty asks for a suggestion."""
    is_entity = "." in object_id
    entry = (
        er.async_get(hass).async_get(object_id)
        if is_entity
        else dr.async_get(hass).async_get(object_id)
    )
    chosen = target or (suggest(hass, object_id) if entry is not None else None)
    area = ar.async_get(hass).async_get_area(chosen) if chosen else None
    fingerprint = None
    if entry is not None:
        fingerprint = registry_fingerprint(entry) if is_entity else device_fingerprint(entry)
    return {
        "exists": entry is not None,
        "object_type": "entity" if is_entity else "device",
        "current": entry.area_id if entry is not None else None,
        "target": area.id if area else None,
        "area_name": area.name if area else None,
        "suggested": not target,
        "fingerprint": fingerprint,
    }
