"""Taking an entity out of the assistants, or giving Google its PIN back: what a plan reads and writes.

The exposure of an entity is not part of its registry fingerprint, so this module keeps its own: a
hash of the options Home Assistant stores per assistant. Only two things are ever written, the
``should_expose`` flag of an assistant and the ``disable_2fa`` option of Google. Nothing is added to
an assistant, and bridges (HomeKit) are left alone.
"""

from __future__ import annotations

import hashlib
import json
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError

from .exposure import ASSISTANTS, CLOUD_ASSISTANTS, GOOGLE

EXPOSE_OPTION = "should_expose"
PIN_OPTION = "disable_2fa"
# The cloud keeps the filter of a YAML setup in its configuration; with one, the exposure of the UI counts for nothing.
FILTER_KEY = "filter"


def _settings(hass: HomeAssistant, entity_id: str) -> dict[str, dict[str, Any]] | None:
    """The stored options per assistant, or None for an entity Home Assistant does not know."""
    from homeassistant.components.homeassistant.exposed_entities import (
        async_get_entity_settings,
    )

    try:
        found = async_get_entity_settings(hass, entity_id)
    except HomeAssistantError:
        return None
    return {name: dict(options) for name, options in found.items()}


def _exposed(hass: HomeAssistant, entity_id: str) -> list[str]:
    from homeassistant.components.homeassistant.exposed_entities import async_should_expose

    return [name for name in ASSISTANTS if async_should_expose(hass, name, entity_id)]


USER_CONFIG = {"cloud.alexa": "alexa_user_config", "cloud.google_assistant": "google_user_config"}


def yaml_filter(hass: HomeAssistant, assistant: str) -> bool | None:
    """Whether a YAML filter of the Nabu Casa setup decides what ``assistant`` reaches; ``None``: cannot tell.

    The filter is part of the configuration the cloud client keeps from the start (not of the assistant
    objects, which are made only when somebody asks). Without a cloud there is no filter; a cloud whose
    configuration cannot be read is not guessed at.
    """
    attribute = USER_CONFIG.get(assistant)
    cloud = hass.data.get("cloud")
    if attribute is None or cloud is None:
        return False
    try:
        return not getattr(cloud.client, attribute)[FILTER_KEY].empty_filter
    except Exception:  # noqa: BLE001 - another cloud version: not guessed at
        return None


def prepare(
    hass: HomeAssistant, entity_id: str, target: str, only: tuple[str, ...] | list[str] = ()
) -> dict[str, Any]:
    """What an entity holds now for ``target`` ("remove" or "pin"); with ``only`` just those assistants."""
    settings = _settings(hass, entity_id)
    if settings is None:
        return {"exists": False}
    exposed = _exposed(hass, entity_id)
    settings = _settings(hass, entity_id) or {}  # asking may have stored a default
    if target == "pin":
        assistants = [GOOGLE] if settings.get(GOOGLE, {}).get(PIN_OPTION) is True else []
    else:
        assistants = [name for name in exposed if not only or name in only]
    return {
        "exists": True,
        "assistants": assistants,
        "only": list(only),
        "filtered": [name for name in assistants if yaml_filter(hass, name) is True],
        "filter_unknown": [name for name in assistants if yaml_filter(hass, name) is None],
        "fingerprint": fingerprint(settings, exposed),
    }


def fingerprint(settings: dict[str, dict[str, Any]], exposed: list[str]) -> str:
    """Short hash of what the assistants hold for one entity."""
    text = json.dumps({"settings": settings, "exposed": exposed}, sort_keys=True, default=str)
    return hashlib.sha256(text.encode()).hexdigest()[:16]


def current_print(hass: HomeAssistant, entity_id: str) -> str | None:
    info = prepare(hass, entity_id, "remove")
    return info.get("fingerprint") if info["exists"] else None


def _write(hass: HomeAssistant, assistant: str, entity_id: str, option: str, value: Any) -> None:
    from homeassistant.components.homeassistant.exposed_entities import (
        async_set_assistant_option,
    )

    async_set_assistant_option(hass, assistant, entity_id, option, value)


def apply(
    hass: HomeAssistant, entity_id: str, target: str, assistants: list[str]
) -> dict[str, Any]:
    """Write ``target`` for ``assistants``; returns what undo needs. The caller checked the print."""
    before = current_print(hass, entity_id)
    option, value = (PIN_OPTION, False) if target == "pin" else (EXPOSE_OPTION, False)
    for name in assistants:
        _write(hass, name, entity_id, option, value)
    return {
        "before": before,
        "after": current_print(hass, entity_id),
        "target": target,
        "assistants": list(assistants),
    }


def undo(hass: HomeAssistant, entity_id: str, result: dict[str, Any]) -> str:
    """Put the flags back; a change made since the run is left alone."""
    after = current_print(hass, entity_id)
    if after is None:
        return "conflict_gone"
    if after != result["after"]:
        return "conflict_changed"
    option, value = (PIN_OPTION, True) if result["target"] == "pin" else (EXPOSE_OPTION, True)
    for name in result["assistants"]:
        _write(hass, name, entity_id, option, value)
    return "undone"


def reached(hass: HomeAssistant, entity_id: str, target: str, assistants: list[str]) -> bool:
    """Is the entity out of ``assistants`` (or, for "pin", does Google ask for the PIN again)."""
    info = prepare(hass, entity_id, target)
    return info["exists"] and not set(assistants) & set(info["assistants"])


def _store(hass: HomeAssistant) -> Any:
    from homeassistant.components.homeassistant.const import DATA_EXPOSED_ENTITIES

    return hass.data[DATA_EXPOSED_ENTITIES]


def expose_new(hass: HomeAssistant, assistant: str) -> dict[str, Any]:
    """Whether new entities are exposed to a cloud assistant by themselves; unreadable is "missing"."""
    if assistant not in CLOUD_ASSISTANTS:
        return {"exists": False}
    try:
        on = _store(hass).async_get_expose_new_entities(assistant) is True
    except Exception:  # noqa: BLE001 - another Home Assistant version or not set up
        return {"exists": False}
    return {"exists": True, "on": on, "fingerprint": "on" if on else "off"}


def set_expose_new(hass: HomeAssistant, assistant: str, value: bool) -> dict[str, Any]:
    """Switch the automatic exposure of new entities; returns what undo needs."""
    before = expose_new(hass, assistant)["fingerprint"]
    _store(hass).async_set_expose_new_entities(assistant, value)
    return {"before": before, "after": expose_new(hass, assistant)["fingerprint"]}


def undo_expose_new(hass: HomeAssistant, assistant: str, result: dict[str, Any]) -> str:
    """Put the switch back as it was; a change made since the run is left alone."""
    now = expose_new(hass, assistant)
    if not now["exists"]:
        return "conflict_gone"
    if now["fingerprint"] != result["after"]:
        return "conflict_changed"
    _store(hass).async_set_expose_new_entities(assistant, result["before"] == "on")
    return "undone"
