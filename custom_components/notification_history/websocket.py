"""WebSocket commands used by the card."""
from __future__ import annotations

import time
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from .const import DOMAIN, EVENT_ACTION, SIGNAL_UPDATED
from .targets import available_targets

MAX_LIMIT = 200

# What the card needs; internal fields (context, sender…) stay on the server.
PUBLIC_FIELDS = (
    "id", "ts", "target", "target_name", "device_id", "title", "message", "image", "video", "audio",
    "link", "actions", "tag", "group", "status", "action_title", "action_ts",
)


def _manager(hass: HomeAssistant):
    return hass.data.get(DOMAIN)


def _visible(record: dict[str, Any], user) -> bool:
    """Admins see everything, other users only the devices registered with their account."""
    return user.is_admin or (record.get("owner") is not None and record["owner"] == user.id)


def _public(record: dict[str, Any]) -> dict[str, Any]:
    return {k: record.get(k) for k in PUBLIC_FIELDS}


def _matches(record: dict[str, Any], msg: dict[str, Any]) -> bool:
    if (targets := msg.get("targets")) and record["target"] not in targets:
        return False
    if (devices := msg.get("devices")) and record.get("device_id") not in devices:
        return False
    if search := msg.get("search"):
        needle = search.casefold()
        if not any(needle in (record.get(k) or "").casefold() for k in ("title", "message", "target_name")):
            return False
    return True


FILTERS = {
    vol.Optional("targets"): [str],
    vol.Optional("devices"): [str],
    vol.Optional("search"): str,
}


@callback
def async_register(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_list)
    websocket_api.async_register_command(hass, ws_subscribe)
    websocket_api.async_register_command(hass, ws_targets)
    websocket_api.async_register_command(hass, ws_run_action)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/list",
        vol.Optional("limit", default=50): vol.All(int, vol.Range(min=1, max=MAX_LIMIT)),
        vol.Optional("before_id"): str,
        **FILTERS,
    }
)
@callback
def ws_list(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Newest first; `before_id` (id of the last record received) for the next page."""
    manager = _manager(hass)
    if manager is None:
        connection.send_error(msg["id"], "not_loaded", "Notification History is not set up")
        return
    out: list[dict[str, Any]] = []
    more = False
    before_id = msg.get("before_id")
    skipping = before_id is not None and manager.store.get(before_id) is not None
    for record in reversed(manager.store.records):
        if skipping:
            skipping = record["id"] != before_id
            continue
        if not _visible(record, connection.user) or not _matches(record, msg):
            continue
        if len(out) == msg["limit"]:
            more = True
            break
        out.append(_public(record))
    connection.send_result(msg["id"], {"notifications": out, "more": more})


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/subscribe", **FILTERS})
@callback
def ws_subscribe(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Push {record} when a notification is added or changes, {reload: true} after an import or a purge."""

    @callback
    def forward(record: dict[str, Any] | None) -> None:
        if record is None:
            connection.send_message(websocket_api.event_message(msg["id"], {"reload": True}))
        elif _visible(record, connection.user) and _matches(record, msg):
            connection.send_message(websocket_api.event_message(msg["id"], {"record": _public(record)}))

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(hass, SIGNAL_UPDATED, forward)
    connection.send_result(msg["id"])


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/targets"})
@callback
def ws_targets(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Targets that can be recorded (for the card editor); non-admins only get their own devices."""
    user = connection.user
    out = [
        {k: t[k] for k in ("target", "name", "platform", "device_id")}
        for t in available_targets(hass)
        if user.is_admin or t["owner"] == user.id
    ]
    connection.send_result(msg["id"], {"targets": out})


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/run_action", vol.Required("record_id"): str, vol.Required("action"): str}
)
@callback
def ws_run_action(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Fire mobile_app_notification_action as the app would have, for a button of a recorded notification."""
    manager = _manager(hass)
    record = manager.store.get(msg["record_id"]) if manager else None
    if record is None or not _visible(record, connection.user):
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Notification not found")
        return
    action = next((a for a in record.get("actions", []) if a["action"] == msg["action"]), None)
    if action is None or action["action"] in ("URI", "REPLY"):
        connection.send_error(msg["id"], websocket_api.ERR_INVALID_FORMAT, "This button cannot be run from the history")
        return
    event_data: dict[str, Any] = {"action": action["action"], "source": "notification_history"}
    if record.get("tag"):
        event_data["tag"] = record["tag"]
    hass.bus.async_fire(EVENT_ACTION, event_data, context=connection.context(msg))
    manager.mark_action(record, action, time.time())
    connection.send_result(msg["id"], {"record": _public(record)})
