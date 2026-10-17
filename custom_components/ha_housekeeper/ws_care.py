"""WebSocket commands for care and settings: rules, batteries, marks, notes, goals, backups, preflight."""

from __future__ import annotations

import asyncio
import time
from datetime import UTC, date, datetime, timedelta
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from . import battery_trend, battery_voltage
from .backup_health import ATTEST_KINDS, backup_health
from .battery_care import BatteryError, noted_types
from .battery_kind import excluded
from .const import DOMAIN
from .db_health import growth
from .exposure import exposure
from .goals import CATALOG as GOAL_CATALOG
from .goals import evaluate as evaluate_goals
from .goals import measure as measure_goals
from .ignored import REASON_LIMIT as IGNORE_REASON_LIMIT
from .inventory import InventoryScanner
from .lifecycle import removed_devices, timeline
from .maintenance import preflight_report
from .marks import GRACE_DEFAULT, GRACE_MAX
from .marks import KINDS as MARK_KINDS
from .marks import OBJECT_TYPES as MARK_TYPES
from .notes import NoteError
from .policies import RULES as POLICY_RULES
from .policies import auth_facts, policies
from .protection import MODES as PROTECTION_MODES
from .queries import cached_query
from .reminders import ReminderError
from .ws_common import (
    BACKUP_HEALTH_TIMEOUT,
    EXPOSURE_TIMEOUT,
    RELIABILITY_TIMEOUT,
    _versioned,
    with_scanner,
)


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/preflight"})
@websocket_api.async_response
@with_scanner
async def websocket_preflight(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Check backup, repairs, failing integrations and broken references before an update."""
    try:
        snapshot = await scanner.async_get_snapshot()
        result = await preflight_report(hass, snapshot)
        # What follows an update: whether the watch is on, and the one that runs now.
        result["watch"] = {"hours": scanner.watch_hours, "active": scanner.watch_summary()}
    except Exception as err:
        connection.send_error(msg["id"], "scan_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], result)


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/policies"})
@websocket_api.async_response
@with_scanner
async def websocket_policies(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Which quality rules are on and which objects break them. Read-only."""
    try:
        snapshot = await scanner.async_get_snapshot()
        result = policies(
            hass,
            snapshot,
            scanner.policies,
            scanner.ignored,
            scanner.replies,
            scanner.low_battery_percent,
            await auth_facts(hass, scanner.policies.enabled),
        )
    except Exception as err:
        connection.send_error(msg["id"], "policies_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/set_policy",
        vol.Required("rule"): vol.In(POLICY_RULES),
        vol.Required("enabled"): bool,
    }
)
@callback
@with_scanner
def websocket_set_policy(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Switch one quality rule on or off. Only Housekeeper's own setting changes."""
    scanner.policies.set_enabled(msg["rule"], msg["enabled"])
    connection.send_result(msg["id"], {"enabled": sorted(scanner.policies.enabled)})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/set_policy_limit", vol.Required("limit"): int}
)
@callback
@with_scanner
def websocket_set_policy_limit(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Set the daily limit of the state-changes rule. Only Housekeeper's own setting changes."""
    try:
        scanner.policies.set_limit(msg["limit"])
    except ValueError as err:
        connection.send_error(msg["id"], "invalid_format", f"Not accepted: {err}")
        return
    connection.send_result(msg["id"], {"limit": scanner.policies.limit})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/set_policy_prefix",
        vol.Required("domain"): str,
        vol.Required("prefix"): str,
    }
)
@callback
@with_scanner
def websocket_set_policy_prefix(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Set or remove the naming prefix of one domain (an empty prefix removes it)."""
    try:
        scanner.policies.set_prefix(msg["domain"].strip().lower(), msg["prefix"].strip().lower())
    except ValueError as err:
        connection.send_error(msg["id"], "invalid_format", f"Not accepted: {err}")
        return
    connection.send_result(msg["id"], {"prefixes": dict(scanner.policies.prefixes)})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/exposure"})
@websocket_api.async_response
@with_scanner
async def websocket_exposure(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Which entities assistants and bridges can reach. Read-only; only metadata, no secrets."""
    try:
        snapshot = await scanner.async_get_snapshot()
        async with asyncio.timeout(EXPOSURE_TIMEOUT):
            result = exposure(hass, snapshot)
    except Exception as err:
        connection.send_error(msg["id"], "exposure_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/backup_health"})
@websocket_api.async_response
@with_scanner
async def websocket_backup_health(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Judge the backup strategy; reads the backup manager only."""
    try:
        async with asyncio.timeout(BACKUP_HEALTH_TIMEOUT):
            result = await backup_health(hass, scanner.attest, scanner.journal.plans)
    except Exception as err:
        connection.send_error(msg["id"], "backup_health_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/battery_trend", vol.Optional("refresh", default=False): bool}
)
@websocket_api.async_response
@with_scanner
async def websocket_battery_trend(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """When working batteries will probably reach the limit. Reads daily statistics only."""
    snapshot = await scanner.async_get_snapshot()
    if not snapshot["meta"].get("recorder_available"):
        connection.send_result(
            msg["id"], _versioned({"available": False, "rows": [], "groups": []})
        )
        return
    limit = snapshot["meta"].get("low_battery_percent") or 20
    names = {
        o["object_id"]: o["name"]
        for o in snapshot["objects"]
        if o["object_type"] == "entity"
        and o.get("device_class") == "battery"
        and not excluded(o)
        and o["object_id"].startswith("sensor.")
        and o.get("status") == "active"
        and o.get("has_statistics")
        and o.get("unit") in (None, "", "%")
    }
    volts = {
        o["object_id"]: o
        for o in snapshot["objects"]
        if o["object_type"] == "entity"
        and o.get("has_statistics")
        and not excluded(o)
        and battery_voltage.is_voltage_battery(o)
    }
    wanted = sorted({*names, *volts})
    now = time.time()
    try:
        async with asyncio.timeout(RELIABILITY_TIMEOUT):
            found = await cached_query(
                hass,
                "battery_trend",
                600,
                lambda: battery_trend.read_series(
                    hass, wanted, now - battery_trend.WINDOW_DAYS * 86400, now
                ),
                refresh=msg["refresh"],
            )
    except Exception as err:
        connection.send_error(msg["id"], "battery_trend_failed", f"{type(err).__name__}: {err}")
        return
    if found.busy:
        connection.send_result(
            msg["id"], _versioned({"available": True, "busy": True, "rows": [], "groups": []})
        )
        return
    result = battery_trend.build({k: v for k, v in found.raw.items() if k in names}, names, limit)
    types = {**noted_types(snapshot["objects"], wanted), **scanner.batteries.types}
    voltage = battery_voltage.build(
        {k: v for k, v in found.raw.items() if k in volts},
        {k: o["name"] for k, o in volts.items()},
        {k: battery_voltage.UNITS[o["unit"]] for k, o in volts.items()},
        types,
        limit,
    )
    result["replaced"] = scanner.batteries.open_replacements(result["replaced"])
    connection.send_result(
        msg["id"],
        _versioned(
            {
                "available": True,
                "busy": False,
                **result,
                "voltage": voltage,
                "types": types,
                "custom_types": scanner.batteries.custom_types,
            }
        ),
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/battery_type_set",
        vol.Required("entity_id"): str,
        vol.Required("battery_type"): str,
    }
)
@callback
@with_scanner
def websocket_battery_type_set(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Set the battery type of one sensor (empty = take it back). Only Housekeeper's list changes."""
    try:
        scanner.batteries.set_type(msg["entity_id"], msg["battery_type"])
    except BatteryError as err:
        connection.send_error(msg["id"], "invalid_format", f"Not accepted: {err}")
        return
    connection.send_result(
        msg["id"],
        _versioned(
            {"types": scanner.batteries.types, "custom_types": scanner.batteries.custom_types}
        ),
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/battery_custom_type",
        vol.Required("action"): vol.In(["add", "rename", "delete"]),
        vol.Required("name"): str,
        vol.Optional("new_name", default=""): str,
    }
)
@callback
@with_scanner
def websocket_battery_custom_type(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Add, rename or delete an own battery type; built-in and used types stay."""
    try:
        scanner.batteries.edit_custom(msg["action"], msg["name"], msg["new_name"])
    except BatteryError as err:
        connection.send_error(msg["id"], "invalid_format", f"Not accepted: {err}")
        return
    connection.send_result(
        msg["id"],
        _versioned(
            {"types": scanner.batteries.types, "custom_types": scanner.batteries.custom_types}
        ),
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/battery_kind_set",
        vol.Required("items"): vol.All(
            [{vol.Required("entity_id"): str, vol.Required("kind"): str}], vol.Length(max=200)
        ),
    }
)
@callback
@with_scanner
def websocket_battery_kind_set(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Say which battery sensors are no replaceable battery (empty kind = take it back)."""
    try:
        scanner.set_battery_kinds([(i["entity_id"], i["kind"]) for i in msg["items"]])
    except BatteryError as err:
        connection.send_error(msg["id"], "invalid_format", f"Not accepted: {err}")
        return
    connection.send_result(msg["id"], _versioned({"kinds": scanner.batteries.kinds}))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/battery_replaced",
        vol.Required("entity_id"): str,
        vol.Required("day"): str,
        vol.Required("action"): vol.In(["enter", "dismiss"]),
        vol.Optional("name", default=""): vol.All(str, vol.Length(max=80)),
        vol.Optional("title", default=""): vol.All(str, vol.Length(max=80)),
        vol.Optional("note", default=""): vol.All(str, vol.Length(max=200)),
    }
)
@callback
@with_scanner
def websocket_battery_replaced(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Settle a detected battery replacement: enter it in the history, or say it was none."""
    now = datetime.now(UTC)
    updated = 0
    try:
        scanner.batteries.handle(msg["entity_id"], msg["day"], now.date())
        if msg["action"] == "enter":
            name = msg["name"] or msg["entity_id"]
            scanner.notes.upsert(
                None,
                msg["title"] or f"Battery replaced: {name}"[:80],
                f"{msg['day']}T12:00:00+00:00",
                f"entity:{msg['entity_id']}",
                msg["note"],
                now,
            )
            updated = scanner.reminders.done_matching(
                [name, msg["entity_id"].split(".", 1)[1].replace("_", " ")],
                msg["day"],
                now.date(),
            )
    except (BatteryError, NoteError) as err:
        connection.send_error(msg["id"], "invalid_format", f"Not accepted: {err}")
        return
    if scanner._snapshot is not None:
        scanner._snapshot["notes"] = scanner.notes.view()
        scanner._snapshot["reminders"] = scanner.reminders.view(now.date())
    connection.send_result(
        msg["id"],
        _versioned(
            {
                "reminders_updated": updated,
                "handled": scanner.batteries.handled,
                "notes": scanner.notes.view(),
                "reminders": scanner.reminders.view(now.date()),
            }
        ),
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/note_set",
        vol.Required("action"): vol.In(["save", "delete"]),
        vol.Optional("note_id"): str,
        vol.Optional("title"): str,
        vol.Optional("at"): str,
        vol.Optional("target", default=""): str,
        vol.Optional("note", default=""): str,
        vol.Optional("source"): vol.In(["me", "housekeeper"]),
        vol.Optional("ref", default=""): str,
    }
)
@callback
@with_scanner
def websocket_note_set(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Save or delete an entry of the logbook. Only Housekeeper's own list changes."""
    try:
        if msg["action"] == "save":
            scanner.notes.upsert(
                msg.get("note_id"),
                msg.get("title", ""),
                msg.get("at", ""),
                msg["target"],
                msg["note"],
                datetime.now(UTC),
                msg.get("source"),
                msg["ref"],
            )
        else:
            scanner.notes.delete(msg.get("note_id", ""))
    except NoteError as err:
        connection.send_error(msg["id"], "invalid_format", f"Not accepted: {err}")
        return
    view = scanner.notes.view()
    if scanner._snapshot is not None:
        scanner._snapshot["notes"] = view
    connection.send_result(msg["id"], _versioned({"notes": view}))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/reminder_set",
        vol.Required("action"): vol.In(["save", "done", "delete", "history_delete"]),
        vol.Optional("reminder_id"): str,
        vol.Optional("name"): str,
        vol.Optional("interval_days"): int,
        vol.Optional("due"): str,
        vol.Optional("day"): str,
        vol.Optional("note", default=""): str,
    }
)
@callback
@with_scanner
def websocket_reminder_set(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Save, finish or delete a maintenance reminder. Only Housekeeper's own list changes."""
    today = datetime.now(UTC).date()
    try:
        if msg["action"] == "save":
            scanner.reminders.upsert(
                msg.get("reminder_id"),
                msg.get("name", ""),
                msg.get("interval_days", 0),
                msg.get("due", ""),
                msg["note"],
            )
        elif msg["action"] == "done":
            scanner.reminders.done(msg.get("reminder_id", ""), today)
        elif msg["action"] == "history_delete":
            scanner.reminders.delete_history(msg.get("reminder_id", ""), msg.get("day", ""))
        else:
            scanner.reminders.delete(msg.get("reminder_id", ""))
    except ReminderError as err:
        connection.send_error(msg["id"], "invalid_format", f"Not accepted: {err}")
        return
    view = scanner.reminders.view(today)
    if scanner._snapshot is not None:
        scanner._snapshot["reminders"] = view
    connection.send_result(msg["id"], _versioned({"reminders": view}))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/protection_set",
        vol.Required("mode"): vol.In(PROTECTION_MODES),
    }
)
@callback
@with_scanner
def websocket_protection_set(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Set the protection mode: what plans may change, checked on the server."""
    scanner.protection.set_mode(msg["mode"])
    if scanner._snapshot is not None:
        scanner._snapshot["meta"]["protection"] = scanner.protection.mode
    connection.send_result(msg["id"], {"mode": scanner.protection.mode})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/lifecycle", vol.Optional("device_id"): str}
)
@websocket_api.async_response
@with_scanner
async def websocket_lifecycle(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """The life of one device (steps, state), or without a device the removed devices."""
    plans = scanner.journal.plans
    if "device_id" not in msg:
        connection.send_result(msg["id"], _versioned({"removed": removed_devices(plans)}))
        return
    snapshot = await scanner.async_get_snapshot()
    device = next(
        (
            i
            for i in snapshot["objects"]
            if i["object_type"] == "device" and i["object_id"] == msg["device_id"]
        ),
        None,
    )
    if device is None:
        connection.send_error(msg["id"], "not_found", "Unknown device")
        return
    result = timeline(device, snapshot, plans, scanner.replies)
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/mark_set",
        vol.Required("object_type"): vol.In(MARK_TYPES),
        vol.Required("object_id"): str,
        vol.Required("kind"): vol.In(MARK_KINDS),
        vol.Optional("reason", default=""): vol.All(str, vol.Length(max=IGNORE_REASON_LIMIT)),
        vol.Optional("days"): vol.All(int, vol.Range(min=1, max=3650)),
        vol.Optional("target"): vol.All(str, vol.Length(max=255)),
        vol.Optional("window"): vol.Any(
            None,
            vol.Schema({vol.Required("mode"): "sun"}),
            vol.Schema(
                {
                    vol.Required("mode"): "time",
                    vol.Required("from"): vol.Match(r"^([01]\d|2[0-3]):[0-5]\d$"),
                    vol.Required("to"): vol.Match(r"^([01]\d|2[0-3]):[0-5]\d$"),
                }
            ),
        ),
        vol.Optional("grace_minutes", default=GRACE_DEFAULT): vol.All(
            int, vol.Range(min=0, max=GRACE_MAX)
        ),
    }
)
@callback
@with_scanner
def websocket_mark_set(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Tell Housekeeper what to expect of an entity or device. Only its own list changes."""
    error = scanner.set_mark(
        msg["object_type"],
        msg["object_id"],
        msg["kind"],
        reason=msg["reason"],
        days=msg.get("days"),
        target=msg.get("target"),
        by=connection.user.id if connection.user else None,
        window=msg.get("window"),
        grace=msg["grace_minutes"],
    )
    if error:
        connection.send_error(msg["id"], error, f"Mark not set: {error}")
        return
    connection.send_result(msg["id"], {"marked": True})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/set_stale_limit",
        vol.Required("entity_id"): str,
        vol.Required("hours"): vol.Any(None, vol.All(int, vol.Range(min=0, max=8760))),
    }
)
@websocket_api.async_response
@with_scanner
async def websocket_set_stale_limit(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Set after how many hours without a new report one sensor counts as silent (0 = never)."""
    error = await scanner.set_stale_limit(msg["entity_id"], msg["hours"])
    if error:
        connection.send_error(msg["id"], error, f"Limit not set: {error}")
        return
    connection.send_result(msg["id"], {"set": True})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/goals"})
@websocket_api.async_response
@with_scanner
async def websocket_goals(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Each maintenance goal with its limit, the current value and whether it is met. Read-only."""
    try:
        snapshot = await scanner.async_get_snapshot()
        try:  # a missing source makes its goals unknown, it never fails the answer
            async with asyncio.timeout(BACKUP_HEALTH_TIMEOUT):
                backup = await backup_health(hass, scanner.attest, scanner.journal.plans)
        except Exception:  # noqa: BLE001
            backup = None
        rules = policies(
            hass,
            snapshot,
            scanner.policies,
            scanner.ignored,
            scanner.replies,
            scanner.low_battery_percent,
            await auth_facts(hass, scanner.policies.enabled),
        )["rules"]
        grown = growth(scanner.events.sizes, datetime.now(UTC).date())
        month = (datetime.now(UTC) - timedelta(days=30)).date().isoformat()
        errors = (
            sum(
                key.startswith("automation.") and scanner.runs.errors_since(key, month) > 0
                for key in scanner.runs.items
            )
            if scanner.runs.since
            else None
        )
        measured = measure_goals(snapshot, backup, grown, rules, errors)
        result = evaluate_goals(measured, scanner.goals.items)
    except Exception as err:
        connection.send_error(msg["id"], "goals_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/goal_set",
        vol.Required("goal"): vol.In(tuple(GOAL_CATALOG)),
        vol.Optional("enabled"): bool,
        vol.Optional("limit"): vol.All(int, vol.Range(min=0, max=1_000_000)),
    }
)
@callback
@with_scanner
def websocket_goal_set(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Switch a goal on or off or change its limit. Only Housekeeper's own list changes."""
    if not scanner.goals.set(msg["goal"], enabled=msg.get("enabled"), limit=msg.get("limit")):
        connection.send_error(msg["id"], "invalid_limit", "The limit is outside the allowed range")
        return
    connection.send_result(msg["id"], {"saved": True})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/mark_clear",
        vol.Required("object_type"): vol.In(MARK_TYPES),
        vol.Required("object_id"): str,
    }
)
@callback
@with_scanner
def websocket_mark_clear(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Take a mark away again."""
    scanner.clear_mark(msg["object_type"], msg["object_id"])
    connection.send_result(msg["id"], {"marked": False})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/notify_set",
        vol.Required("enabled"): bool,
    }
)
@callback
@with_scanner
def websocket_notify_set(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Switch the message about new broken references. Switching on announces nothing old."""
    findings = (scanner.snapshot or {}).get("findings", [])
    scanner.notify.set_enabled(msg["enabled"], findings)
    if scanner.snapshot:
        scanner.snapshot["meta"]["notify"] = scanner.notify.enabled
    connection.send_result(msg["id"], {"enabled": scanner.notify.enabled})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/backup_attest",
        vol.Required("kind"): vol.In(ATTEST_KINDS),
        vol.Optional("date"): vol.Match(r"^\d{4}-\d{2}-\d{2}$"),
        vol.Optional("clear", default=False): bool,
    }
)
@websocket_api.async_response
@with_scanner
async def websocket_backup_attest(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Record, or clear, a fact only the person can confirm (emergency kit stored, restore tried)."""
    if msg["clear"]:
        scanner.attest.clear(msg["kind"])
    else:
        day = None
        if "date" in msg:
            try:
                day = date.fromisoformat(msg["date"])
            except ValueError:
                connection.send_error(msg["id"], "invalid_date", "The date does not exist")
                return
            if day > datetime.now(UTC).date():
                connection.send_error(msg["id"], "invalid_date", "The date lies in the future")
                return
        scanner.attest.set(msg["kind"], day)
    try:
        async with asyncio.timeout(BACKUP_HEALTH_TIMEOUT):
            result = await backup_health(hass, scanner.attest, scanner.journal.plans)
    except Exception as err:
        connection.send_error(msg["id"], "backup_health_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], _versioned(result))


def async_register(hass: HomeAssistant) -> None:
    """Register the commands of this part."""
    websocket_api.async_register_command(hass, websocket_preflight)
    websocket_api.async_register_command(hass, websocket_backup_health)
    websocket_api.async_register_command(hass, websocket_policies)
    websocket_api.async_register_command(hass, websocket_set_policy)
    websocket_api.async_register_command(hass, websocket_set_policy_prefix)
    websocket_api.async_register_command(hass, websocket_set_policy_limit)
    websocket_api.async_register_command(hass, websocket_exposure)
    websocket_api.async_register_command(hass, websocket_backup_attest)
    websocket_api.async_register_command(hass, websocket_notify_set)
    websocket_api.async_register_command(hass, websocket_battery_type_set)
    websocket_api.async_register_command(hass, websocket_battery_custom_type)
    websocket_api.async_register_command(hass, websocket_battery_kind_set)
    websocket_api.async_register_command(hass, websocket_battery_replaced)
    websocket_api.async_register_command(hass, websocket_lifecycle)
    websocket_api.async_register_command(hass, websocket_mark_set)
    websocket_api.async_register_command(hass, websocket_mark_clear)
    websocket_api.async_register_command(hass, websocket_set_stale_limit)
    websocket_api.async_register_command(hass, websocket_goals)
    websocket_api.async_register_command(hass, websocket_goal_set)
    websocket_api.async_register_command(hass, websocket_protection_set)
    websocket_api.async_register_command(hass, websocket_battery_trend)
    websocket_api.async_register_command(hass, websocket_reminder_set)
    websocket_api.async_register_command(hass, websocket_note_set)
