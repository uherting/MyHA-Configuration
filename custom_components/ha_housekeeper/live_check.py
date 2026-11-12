"""A quick look at one finding's object as it is right now, without a scan.

Only reads the live state of Home Assistant. It can say "looks fixed" or "still open" for the findings whose
object has a state of its own (an entity, an integration, a device); for every other kind it says it
cannot tell. It never closes a finding: the next regular scan decides.
"""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from .sensitive_fields import reauth_entry_ids

FIXED = "fixed"
OPEN = "open"
UNKNOWN = "unknown"
OUTAGE = ("unavailable", "unknown")


def _entity_ok(hass: HomeAssistant, entity_id: str) -> bool:
    state = hass.states.get(entity_id)
    return state is not None and state.state not in OUTAGE


def check_finding(hass: HomeAssistant, finding: dict[str, Any]) -> dict[str, Any]:
    """``{"result": fixed|open|unknown, "detail": code}`` for one finding, from the live state."""
    rule, ident = finding["rule_id"], finding["object_id"]
    if rule in ("entity.state_unavailable", "entity.state_unknown"):
        state = hass.states.get(ident)
        if state is None:
            return {"result": OPEN, "detail": "no_state"}
        return {"result": OPEN if state.state in OUTAGE else FIXED, "detail": state.state}
    if rule in ("config_entry.not_loaded", "config_entry.reauth"):
        entry = hass.config_entries.async_get_entry(ident)
        if entry is None:
            return {"result": UNKNOWN, "detail": "gone"}
        if rule == "config_entry.reauth":
            waiting = ident in reauth_entry_ids(hass)
            return {"result": OPEN if waiting else FIXED, "detail": "reauth"}
        loaded = entry.state is ConfigEntryState.LOADED
        return {"result": FIXED if loaded else OPEN, "detail": entry.state.value}
    if rule == "device.down":
        entities = [e.entity_id for e in er.async_entries_for_device(er.async_get(hass), ident)]
        working = any(_entity_ok(hass, entity_id) for entity_id in entities)
        return {"result": FIXED if working else OPEN, "detail": "entities"}
    return {"result": UNKNOWN, "detail": "scan"}
