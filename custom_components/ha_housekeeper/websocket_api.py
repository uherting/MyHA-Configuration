"""WebSocket API for the HA Housekeeper panel."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import label_registry as lr

from . import (
    area_assign,
    counter_repair,
    rename,
    ws_automations,
    ws_care,
    ws_mcp,
    ws_recorder,
    ws_system,
)
from . import refactor as refactor_module
from .audit_report import build_report
from .automation_delete import preview as preview_automation_delete
from .backup_cleanup import KEEP_DAYS, KEEP_LAST, MAX_DAYS, MAX_LAST, list_backups
from .cleanup import (
    ACTION_KINDS,
    AREA_KINDS,
    DELETE_AUTOMATION_KINDS,
    DELETE_BACKUP_KINDS,
    LABEL_KINDS,
    MAX_ACTIONS,
    MAX_MERGE,
    METER_KINDS,
    METER_MODES,
    RECORDER_CHOICES,
    REFACTOR_KINDS,
    REFERENCE_KINDS,
    RENAME_KINDS,
    REPAIR_KINDS,
    STATE_KINDS,
    TRIM_KINDS,
    attach_history,
    build_plan,
    counter_key,
    device_fingerprint,
    device_support,
    history_ids,
    merge_requests,
    plan_summary,
    public_plan,
    refactor_key,
    registry_fingerprint,
    trim_is_plain,
)
from .cleanup_exec import CleanupError, backup_is_local_only, entity_restorable
from .const import DOMAIN, OPTION_LIMITS
from .device_pairs import pair_devices
from .history import PinError
from .ignored import KINDS as IGNORE_KINDS
from .ignored import REASON_LIMIT as IGNORE_REASON_LIMIT
from .inventory import InventoryScanner
from .lifecycle import removed_objects
from .meter import prepare_meter
from .monitor import MonitorError, MonitorStore, evaluate
from .outage_levels import OUTAGE_KEYS, thresholds_from_options, thresholds_rise
from .recorder_purge import TRIM_MAX_DAYS, TRIM_TABLES, count_history, count_older, count_trim
from .references import preview_replacement
from .writelock import write_holder
from .ws_common import (
    _scanner,
    _versioned,
    panel_session_only,
    scanner_plans,
    send_sendable,
    with_scanner,
)


async def _send_inventory_result(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    *,
    refresh: bool,
) -> None:
    """Send inventory data or a useful, admin-only scanner error."""
    scanner = _scanner(hass)
    if scanner is None:
        connection.send_error(msg["id"], "not_loaded", "HA Housekeeper is not loaded")
        return
    # A scan in the middle of a plan would record intermediate states in the history, the
    # observations and the repairs hints. The runner scans for its own verification directly.
    if (refresh or scanner.snapshot is None) and scanner.cleanup.running:
        connection.send_error(msg["id"], "cleanup_busy", "A cleanup plan is running")
        return
    try:
        result = await (scanner.async_scan() if refresh else scanner.async_get_snapshot())
    except Exception as err:
        connection.send_error(msg["id"], "scan_failed", f"{type(err).__name__}: {err}")
        return
    # The snapshot is from the last success; the health says whether it is still being refreshed.
    result = {
        **result,
        "meta": {**result["meta"], "scan_health": scanner.health_report()},
        "monitor": scanner.monitor.report(),
        # Decisions whose finding is away right now: they rest and hold again when it comes back.
        "resting_decisions": scanner.ignored.resting(
            {f["key"] for f in result.get("findings", [])}
        ),
    }
    send_sendable(connection, msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/inventory"})
@websocket_api.async_response
async def websocket_inventory(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return the last inventory, scanning on first use."""
    await _send_inventory_result(hass, connection, msg, refresh=False)


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/scan"})
@websocket_api.async_response
async def websocket_scan(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Run and return a fresh inventory scan."""
    await _send_inventory_result(hass, connection, msg, refresh=True)


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/status"})
@callback
@with_scanner
def websocket_status(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Return scan progress without triggering work."""
    scanner.check_warmup()
    warmup = {
        "booting": scanner.booting,
        "boot_seconds": scanner.boot_seconds,
        "seconds_left": scanner.warmup_seconds_left,
        "pending": scanner.integrations_pending,
        "names": scanner.integrations_loading,
        "done": scanner.integrations_done,
        "total": scanner.integrations_total,
        "preliminary": bool(((scanner.snapshot or {}).get("meta") or {}).get("preliminary")),
        "settling": scanner.warmup_settling,
    }
    connection.send_result(
        msg["id"],
        _versioned(
            {
                **scanner.status,
                "scanned_at": ((scanner.snapshot or {}).get("meta") or {}).get("scanned_at"),
                "writing": write_holder(hass),
                "warmup": warmup,
                "health": scanner.health_report(),
            }
        ),
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/detail",
        vol.Required("object_type"): str,
        vol.Required("object_id"): str,
    }
)
@callback
@with_scanner
def websocket_detail(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Return attributes and automation structure of one inventory object."""
    details = scanner.get_details(msg["object_type"], msg["object_id"])
    if details is None:
        connection.send_error(msg["id"], "not_found", "Object not found in the latest scan")
        return
    # The attributes come straight from the entity, as any integration wrote them.
    send_sendable(connection, msg["id"], details)


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/history_series"})
@websocket_api.async_response
@with_scanner
async def websocket_history_series(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Totals per day from the scan history, for the sparklines. Reads only."""
    connection.send_result(msg["id"], scanner.history.series())


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/scan_point",
        vol.Required("action"): vol.In(["save", "delete"]),
        vol.Optional("name", default=""): str,
        vol.Optional("baseline"): str,
    }
)
@websocket_api.async_response
@with_scanner
async def websocket_scan_point(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Keep the latest scan as a named comparison point, or delete one. Only Housekeeper's history."""
    try:
        if msg["action"] == "save":
            scanner.history.pin(await scanner.async_get_snapshot(), msg["name"])
        else:
            scanner.history.unpin(msg.get("baseline", ""))
    except PinError as err:
        connection.send_error(msg["id"], "invalid_format", f"Not accepted: {err}")
        return
    connection.send_result(msg["id"], _versioned({"baselines": scanner.history.baselines()}))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/compare", vol.Optional("baseline", default="previous"): str}
)
@websocket_api.async_response
@with_scanner
async def websocket_compare(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Compare the latest scan with an earlier one."""
    try:
        snapshot = await scanner.async_get_snapshot()
    except Exception as err:
        connection.send_error(msg["id"], "scan_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], scanner.history.compare(snapshot, msg["baseline"]))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/ignore",
        vol.Required("finding_key"): str,
        vol.Required("ignored"): bool,
        vol.Optional("kind", default="ignore"): vol.In(IGNORE_KINDS),
        vol.Optional("reason", default=""): vol.All(str, vol.Length(max=IGNORE_REASON_LIMIT)),
        vol.Optional("days"): vol.All(int, vol.Range(min=1, max=3650)),
    }
)
@callback
@with_scanner
def websocket_ignore(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Hide, keep or put off one finding, or show it again. Only Housekeeper's own list changes."""
    if msg["ignored"]:
        if msg["kind"] == "keep" and not msg["reason"].strip():
            connection.send_error(msg["id"], "reason_required", "Keeping a finding needs a reason")
            return
        if msg["kind"] == "snooze" and "days" not in msg:
            connection.send_error(msg["id"], "days_required", "Putting a finding off needs days")
            return
    if not scanner.set_finding_ignored(
        msg["finding_key"],
        msg["ignored"],
        kind=msg["kind"],
        reason=msg["reason"],
        days=msg.get("days"),
        by=connection.user.id if connection.user else None,
    ):
        connection.send_error(msg["id"], "not_found", "Finding not found in the latest scan")
        return
    connection.send_result(msg["id"], {"ignored": msg["ignored"]})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/set_options",
        **{
            vol.Optional(key): vol.All(int, vol.Range(min=low, max=high))
            for key, (low, high) in OPTION_LIMITS.items()
        },
    }
)
@callback
def websocket_set_options(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Change Housekeeper's own options. The entry reloads afterwards to apply them."""
    scanner = _scanner(hass)
    if write_holder(hass) or (scanner is not None and scanner.cleanup.running):
        # The reload would drop the running plan's runner and journal while it still writes.
        connection.send_error(msg["id"], "busy", "A plan, undo or purge is running")
        return
    entries = hass.config_entries.async_entries(DOMAIN)
    changes = {key: msg[key] for key in OPTION_LIMITS if key in msg}
    if not entries or not changes:
        connection.send_error(msg["id"], "invalid_format", "Nothing to change")
        return
    entry = entries[0]
    options = {**entry.options, **changes}
    if any(key in changes for key in OUTAGE_KEYS) and not thresholds_rise(
        thresholds_from_options(options)
    ):
        connection.send_error(msg["id"], "thresholds_order", "Info, low, medium and high must rise")
        return
    if options != dict(entry.options):
        hass.config_entries.async_update_entry(entry, options=options)
    connection.send_result(msg["id"], {"options": options})


async def _plan_from_requests(
    hass: HomeAssistant,
    snapshot: dict[str, Any],
    requests: list[dict[str, Any]],
    refactor_enabled: bool = False,
) -> dict[str, Any]:
    """Judge ``requests`` against the snapshot and the live registries: a plan, not yet journaled."""
    registry = er.async_get(hass)

    def fingerprint(object_id: str) -> str | None:
        entry = registry.async_get(object_id)
        return registry_fingerprint(entry) if entry else None

    def restorable(object_id: str) -> bool | None:
        return entity_restorable(hass, registry.async_get(object_id))

    devices = dr.async_get(hass)

    def device_info(device_id: str) -> tuple[str | None, dict[str, Any]]:
        entry = devices.async_get(device_id)
        return (device_fingerprint(entry), device_support(hass, entry)) if entry else (None, {})

    reference_data = {}
    for action in requests:
        if action["kind"] in REFERENCE_KINDS and action.get("target"):
            pair = (action["object_id"], action["target"])
            if pair not in reference_data and pair[0] != pair[1]:
                reference_data[pair] = await preview_replacement(hass, snapshot, *pair)

    meter_data = {}
    for action in requests:
        if action["kind"] in METER_KINDS and action.get("target"):
            key = (action["object_id"], action["target"], action.get("mode") or "both")
            if key not in meter_data and key[0] != key[1]:
                meter_data[key] = await prepare_meter(hass, key[0], key[1], key[2])

    counter_data = {}
    for action in requests:
        if action["kind"] in REPAIR_KINDS:
            key = counter_key(action)
            if key not in counter_data:
                counter_data[key] = await counter_repair.prepare(
                    hass,
                    key[0],
                    key[1],
                    rng=action.get("range") if action["kind"] == "repair_range" else None,
                )

    label_data = {}
    for action in requests:
        if action["kind"] in LABEL_KINDS:
            entry = er.async_get(hass).async_get(action["object_id"])
            label = lr.async_get(hass).async_get_label(action.get("target") or "")
            label_data[(action["object_id"], action.get("target") or "")] = {
                "exists": entry is not None,
                "label": label.name if label else None,
                "has": entry is not None and (action.get("target") or "") in entry.labels,
                "fingerprint": registry_fingerprint(entry) if entry else None,
            }

    rename_data = {}
    for action in requests:
        if action["kind"] in RENAME_KINDS:
            key = (action["object_id"], action.get("target") or "")
            if key not in rename_data:
                rename_data[key] = await rename.prepare(hass, snapshot, *key)

    state_data = {}
    for action in requests:
        if action["kind"] in STATE_KINDS:
            entry = er.async_get(hass).async_get(action["object_id"])
            state_data[action["object_id"]] = {
                "exists": entry is not None,
                "disabled_by": str(getattr(entry.disabled_by, "value", entry.disabled_by or ""))
                if entry
                else "",
                "hidden_by": str(getattr(entry.hidden_by, "value", entry.hidden_by or ""))
                if entry
                else "",
                "fingerprint": registry_fingerprint(entry) if entry else None,
            }

    area_data = {
        action["object_id"]: area_assign.prepare(
            hass, action["object_id"], action.get("target") or ""
        )
        for action in requests
        if action["kind"] in AREA_KINDS
    }

    backup_data: dict[str, dict[str, Any]] = {}
    if any(a["kind"] in DELETE_BACKUP_KINDS for a in requests):
        listing = await list_backups(hass, scanner_plans(hass), datetime.now(UTC))
        backup_data = {r["backup_id"]: r for r in listing["rows"]}
    delete_data: dict[str, dict[str, Any]] = {}
    for action in requests:
        if action["kind"] in DELETE_AUTOMATION_KINDS:
            delete_data[action["object_id"]] = await preview_automation_delete(
                hass, snapshot, action["object_id"]
            )

    trim_data: dict[tuple[str, int], dict[str, Any] | None] = {}
    plain_trims = [a for a in requests if a["kind"] in TRIM_KINDS and trim_is_plain(a)]
    for days in {a["keep_days"] for a in plain_trims if a.get("keep_days")}:
        found = await count_older(
            hass, [a["object_id"] for a in plain_trims if a.get("keep_days") == days], days
        )
        for a in plain_trims:
            if a.get("keep_days") == days:
                trim_data[(a["object_id"], days)] = (
                    None if found is None else found.get(a["object_id"])
                )
    for a in requests:  # statistics or a stretch of states: counted one by one
        if a["kind"] in TRIM_KINDS and not trim_is_plain(a):
            trim_data[(a["object_id"], a.get("keep_days") or 0)] = await count_trim(
                hass,
                a["object_id"],
                a.get("keep_days"),
                a.get("range"),
                a.get("tables") or ["states"],
            )

    def statistic_exists(statistic_id: str) -> bool:
        return registry.async_get(statistic_id) is not None or hass.states.get(statistic_id)

    refactor_data = {}
    for action in requests:
        if action["kind"] in REFACTOR_KINDS and refactor_enabled:
            fix, values = action.get("fix") or "", action.get("values") or {}
            key = refactor_key(action["object_id"], fix, values)
            if key not in refactor_data:
                refactor_data[key] = await refactor_module.preview(
                    hass, snapshot, action["object_id"], fix, values
                )

    plan = build_plan(
        snapshot,
        requests,
        datetime.now(UTC),
        fingerprint,
        restorable,
        device_info=device_info,
        reference_data=reference_data,
        meter_data=meter_data,
        statistic_exists=statistic_exists,
        refactor_data=refactor_data,
        refactor_enabled=refactor_enabled,
        counter_data=counter_data,
        label_data=label_data,
        area_data=area_data,
        state_data=state_data,
        rename_data=rename_data,
        trim_data=trim_data,
        backup_data=backup_data,
        delete_data=delete_data,
    )
    await _add_history(hass, snapshot, plan)
    return plan


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/plan_create",
        vol.Required("actions"): vol.All(
            [
                {
                    vol.Required("kind"): vol.In(sorted(ACTION_KINDS)),
                    vol.Required("object_id"): str,
                    vol.Optional("target"): str,
                    vol.Optional("mode"): vol.In((*METER_MODES, *counter_repair.RANGE_MODES)),
                    vol.Optional("range"): {
                        vol.Required("from"): vol.Coerce(float),
                        vol.Required("to"): vol.Coerce(float),
                        vol.Optional("fixed"): vol.Coerce(float),
                    },
                    vol.Optional("states"): bool,
                    vol.Optional("keep_days"): vol.All(int, vol.Range(min=1, max=TRIM_MAX_DAYS)),
                    vol.Optional("tables"): vol.All([vol.In(TRIM_TABLES)], vol.Length(min=1)),
                    vol.Optional("recorder"): vol.In(RECORDER_CHOICES),
                    vol.Optional("fix"): vol.In(refactor_module.FIXES),
                    vol.Optional("values"): {
                        vol.Optional("description"): vol.All(
                            str, vol.Length(max=refactor_module.DESCRIPTION_MAX)
                        ),
                        vol.Optional("timeout"): vol.All(
                            int, vol.Range(min=1, max=refactor_module.TIMEOUT_MAX)
                        ),
                        vol.Optional("continue_on_timeout"): bool,
                        vol.Optional("mode"): vol.In(refactor_module.MODES),
                        vol.Optional("max"): vol.All(
                            int, vol.Range(min=2, max=refactor_module.MAX_RUNS)
                        ),
                    },
                }
            ],
            vol.Length(min=1, max=MAX_ACTIONS),
        ),
        # Asked for after the small backup failed: back up as the automatic backup settings say.
        vol.Optional("full_backup", default=False): bool,
    }
)
@websocket_api.async_response
@with_scanner
async def websocket_plan_create(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Create a dry-run cleanup plan from the latest scan. Nothing is changed or executed."""
    if scanner.warming_up:
        connection.send_error(msg["id"], "warming_up", "Home Assistant is still starting")
        return
    try:
        snapshot = await scanner.async_get_snapshot()
    except Exception as err:
        connection.send_error(msg["id"], "scan_failed", f"{type(err).__name__}: {err}")
        return
    plan = await _plan_from_requests(hass, snapshot, msg["actions"], scanner.refactor.enabled)
    if msg["full_backup"]:
        plan["full_backup"] = True
    if backup_is_local_only(hass):
        plan["backup_local"] = True
    scanner.journal.add(plan)
    connection.send_result(msg["id"], _versioned(public_plan(plan)))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/plan_merge",
        vol.Required("plan_ids"): vol.All([str], vol.Length(min=2, max=MAX_MERGE)),
    }
)
@websocket_api.async_response
@with_scanner
async def websocket_plan_merge(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Build one new plan from several open previews and drop those previews. Executes nothing."""
    if scanner.warming_up:
        connection.send_error(msg["id"], "warming_up", "Home Assistant is still starting")
        return
    ids = list(dict.fromkeys(msg["plan_ids"]))
    plans = [scanner.journal.get(i) for i in ids]
    if len(ids) < 2 or any(p is None for p in plans):
        connection.send_error(msg["id"], "not_found", "Two or more known plans are needed")
        return
    if any(p.get("executed") or p.get("run") for p in plans):
        connection.send_error(msg["id"], "plan_not_open", "Only open previews can be merged")
        return
    requests, conflicts, dropped = merge_requests(plans)
    if not requests:
        connection.send_error(msg["id"], "nothing_to_merge", "Nothing is left after the conflicts")
        return
    if len(requests) > MAX_ACTIONS:
        connection.send_error(msg["id"], "too_many", f"At most {MAX_ACTIONS} actions in one plan")
        return
    try:
        snapshot = await scanner.async_get_snapshot()
    except Exception as err:
        connection.send_error(msg["id"], "scan_failed", f"{type(err).__name__}: {err}")
        return
    plan = await _plan_from_requests(hass, snapshot, requests, scanner.refactor.enabled)
    plan["events"].append({"at": datetime.now(UTC).isoformat(), "type": "merged", "plans": ids})
    scanner.journal.add(plan)
    for plan_id in ids:
        scanner.journal.remove(plan_id)
    connection.send_result(
        msg["id"],
        _versioned(
            {
                "plan": public_plan(plan),
                "merged": ids,
                "conflicts": conflicts,
                "dropped": dropped,
            }
        ),
    )


async def _rebuilt_preview(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> tuple[dict[str, Any], dict[str, Any]] | None:
    """The open preview named in ``msg`` and the same requests judged again now (not journaled)."""
    if scanner.warming_up:
        connection.send_error(msg["id"], "warming_up", "Home Assistant is still starting")
        return None
    old = scanner.journal.get(msg["plan_id"])
    if old is None:
        connection.send_error(msg["id"], "not_found", "Plan not found")
        return None
    if old.get("status") != "dry_run" or old.get("executed") or old.get("run"):
        connection.send_error(msg["id"], "plan_not_open", "Only open previews can be renewed")
        return None
    try:
        snapshot = await scanner.async_get_snapshot()
    except Exception as err:
        connection.send_error(msg["id"], "scan_failed", f"{type(err).__name__}: {err}")
        return None
    requests, _, _ = merge_requests([old])
    new = await _plan_from_requests(hass, snapshot, requests, scanner.refactor.enabled)
    return old, new


# What a person decides on in a preview: if one of these differs now, the preview is out of date.
_CHECKED_FIELDS = ("verdict", "executable", "fingerprint", "has_statistics", "used_by")


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/plan_renew", vol.Required("plan_id"): str}
)
@websocket_api.async_response
@with_scanner
async def websocket_plan_renew(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Judge an open preview's requests again as a new preview and drop the old one."""
    rebuilt = await _rebuilt_preview(hass, connection, msg, scanner)
    if rebuilt is None:
        return
    old, plan = rebuilt
    if old.get("full_backup"):
        plan["full_backup"] = True
    if backup_is_local_only(hass):
        plan["backup_local"] = True
    plan["events"].append(
        {"at": datetime.now(UTC).isoformat(), "type": "renewed", "plans": [old["plan_id"]]}
    )
    scanner.journal.add(plan)
    scanner.journal.remove(old["plan_id"])
    connection.send_result(msg["id"], _versioned(public_plan(plan)))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/plan_check", vol.Required("plan_id"): str}
)
@websocket_api.async_response
@with_scanner
async def websocket_plan_check(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Tell whether an open preview still matches the current state. Changes nothing."""
    rebuilt = await _rebuilt_preview(hass, connection, msg, scanner)
    if rebuilt is None:
        return
    old, plan = rebuilt
    now = {a["object_id"]: a for a in plan["actions"]}
    changed = []
    for action in old["actions"]:
        fresh = now.get(action["object_id"])
        if fresh is None or any(action.get(k) != fresh.get(k) for k in _CHECKED_FIELDS):
            changed.append(
                {
                    "object_id": action["object_id"],
                    "was": action["verdict"],
                    "now": fresh["verdict"] if fresh else "gone",
                }
            )
    connection.send_result(msg["id"], {"current": not changed, "changed": changed})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/plan_list"})
@callback
@with_scanner
def websocket_plan_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Return the journal of plans as short entries, newest first; details come per plan."""
    if scanner.journal.drop_stale_previews():
        scanner.journal.save()
    connection.send_result(
        msg["id"],
        _versioned(
            {
                "plans": [plan_summary(p) for p in scanner.journal.plans],
                "purges": scanner.journal.purges,
                # What a plan removed, forgot or deleted: the journal is the only place that knows it.
                "removed": removed_objects(scanner.journal.plans),
            }
        ),
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/plan_detail", vol.Required("plan_id"): str}
)
@callback
def websocket_plan_detail(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return one plan for display, without the data only the server needs to undo it."""
    scanner = _scanner(hass)
    plan = scanner.journal.get(msg["plan_id"]) if scanner else None
    if scanner is None or plan is None:
        connection.send_error(msg["id"], "not_found", "Plan not found")
        return
    connection.send_result(msg["id"], _versioned(public_plan(plan)))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/plan_report",
        vol.Required("plan_id"): str,
        vol.Optional("anonymize", default=True): bool,
        vol.Optional("lang", default="en"): vol.In(["de", "en"]),
    }
)
@callback
def websocket_plan_report(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return the audit report of one plan as Markdown; IDs are anonymized unless asked."""
    scanner = _scanner(hass)
    plan = scanner.journal.get(msg["plan_id"]) if scanner else None
    if scanner is None or plan is None:
        connection.send_error(msg["id"], "not_found", "Plan not found")
        return
    markdown = build_report(plan, anonymize=msg["anonymize"], lang=msg["lang"])
    connection.send_result(
        msg["id"],
        _versioned(
            {
                "filename": f"housekeeper-plan-{plan['plan_id']}.md",
                "anonymized": msg["anonymize"],
                "markdown": markdown,
            }
        ),
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/device_pairs",
        vol.Required("old_device_id"): str,
        vol.Required("new_device_id"): str,
    }
)
@websocket_api.async_response
@with_scanner
async def websocket_device_pairs(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Suggest the entities of a new device for those of an old one. Reads only; nothing is chosen."""
    try:
        snapshot = await scanner.async_get_snapshot()
    except Exception as err:
        connection.send_error(msg["id"], "scan_failed", f"{type(err).__name__}: {err}")
        return
    pairs = pair_devices(snapshot, msg["old_device_id"], msg["new_device_id"])
    if pairs is None:
        connection.send_error(msg["id"], "not_found", "Two different known devices are needed")
        return
    connection.send_result(msg["id"], _versioned(pairs))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/plan_delete", vol.Required("plan_id"): str}
)
@callback
@with_scanner
def websocket_plan_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Remove a dry-run entry from Housekeeper's journal."""
    if not scanner.journal.remove(msg["plan_id"]):
        connection.send_error(msg["id"], "not_found", "Plan not found")
        return
    connection.send_result(msg["id"], {"removed": True})


def _cleanup_error(
    connection: websocket_api.ActiveConnection, msg: dict[str, Any], err: CleanupError
) -> None:
    connection.send_error(msg["id"], str(err), f"Cleanup: {err}")


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/plan_confirm",
        vol.Required("plan_id"): str,
        vol.Optional("acknowledged", default=[]): [str],
    }
)
@callback
@with_scanner
def websocket_plan_confirm(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Pick the actions that may run and return a short-lived confirmation token."""
    if panel_session_only(hass, connection, msg):
        return
    try:
        result = scanner.cleanup.confirm(msg["plan_id"], msg["acknowledged"], connection.user.id)
    except CleanupError as err:
        _cleanup_error(connection, msg, err)
        return
    connection.send_result(msg["id"], result)


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/plan_execute",
        vol.Required("plan_id"): str,
        vol.Required("token"): str,
    }
)
@callback
@with_scanner
def websocket_plan_execute(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Start a confirmed plan. It runs in the background; poll ``plan_status``."""
    if panel_session_only(hass, connection, msg):
        return
    try:
        scanner.cleanup.start(msg["plan_id"], msg["token"], connection.user.id)
    except CleanupError as err:
        _cleanup_error(connection, msg, err)
        return
    connection.send_result(msg["id"], {"started": True})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/plan_cancel"})
@callback
@with_scanner
def websocket_plan_cancel(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Stop a running plan after the current step."""
    scanner.cleanup.cancel()
    connection.send_result(msg["id"], {"cancelling": scanner.cleanup.running})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/plan_status", vol.Required("plan_id"): str}
)
@callback
def websocket_plan_status(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return progress and the current state of one plan."""
    scanner = _scanner(hass)
    plan = scanner.journal.get(msg["plan_id"]) if scanner else None
    if scanner is None or plan is None:
        connection.send_error(msg["id"], "not_found", "Plan not found")
        return
    connection.send_result(
        msg["id"],
        _versioned({"progress": scanner.cleanup.status, "plan": public_plan(plan)}),
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/plan_undo",
        vol.Required("plan_id"): str,
        vol.Optional("object_ids"): [str],
    }
)
@websocket_api.async_response
@with_scanner
async def websocket_plan_undo(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Re-enable quarantined entities that are still as Housekeeper left them."""
    if panel_session_only(hass, connection, msg):
        return
    try:
        result = await scanner.cleanup.undo(msg["plan_id"], msg.get("object_ids"))
    except CleanupError as err:
        _cleanup_error(connection, msg, err)
        return
    connection.send_result(msg["id"], result)


async def _add_history(hass: HomeAssistant, snapshot: dict[str, Any], plan: dict[str, Any]) -> None:
    """Count the recorder rows a plan is about, so the end state can name them (exact, no sizes)."""
    ids = history_ids(plan)
    if ids and snapshot["meta"].get("recorder_available"):
        rows = await count_history(hass, ids)
        if rows is not None:
            attach_history(plan, rows)
            # The end state says when the recorder drops the states left behind.
            plan["recorder_keep_days"] = ws_recorder.keep_days(hass)
            plan["recorder_auto_purge"] = ws_recorder.auto_purge(hass)


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/backup_cleanup",
        vol.Optional("keep_last", default=KEEP_LAST): vol.All(int, vol.Range(min=0, max=MAX_LAST)),
        vol.Optional("keep_days", default=KEEP_DAYS): vol.All(int, vol.Range(min=0, max=MAX_DAYS)),
    }
)
@websocket_api.async_response
@with_scanner
async def websocket_backup_cleanup(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Housekeeper's own backups with the suggestion of the rule. Reads only."""
    result = await list_backups(
        hass, scanner.journal.plans, datetime.now(UTC), msg["keep_last"], msg["keep_days"]
    )
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/events"})
@callback
@with_scanner
def websocket_events(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Return Housekeeper's own event log (version changes, restarts); reads the store only."""
    connection.send_result(
        msg["id"],
        _versioned({"events": scanner.events.recent(), "heartbeat": scanner.events.heartbeat}),
    )


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/monitor_list"})
@callback
@with_scanner
def websocket_monitor_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Return definitions with the latest evaluation, without starting a scan."""
    connection.send_result(msg["id"], _versioned({"functions": scanner.monitor.report()}))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/monitor_save",
        vol.Optional("function_id"): str,
        vol.Required("name"): str,
        vol.Optional("description", default=""): str,
        vol.Required("notify"): bool,
        vol.Optional("enabled", default=True): bool,
        vol.Required("members"): [
            {
                vol.Required("object_key"): str,
                vol.Required("required"): bool,
                vol.Optional("rules", default=[]): [
                    {vol.Required("kind"): str, vol.Required("value"): vol.Any(int, float)}
                ],
            }
        ],
    }
)
@websocket_api.async_response
@with_scanner
async def websocket_monitor_save(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Save one explicitly selected function; only Housekeeper's definition changes."""
    if scanner.warming_up:
        connection.send_error(msg["id"], "busy", "Home Assistant is still starting")
        return
    try:
        snapshot = await scanner.async_get_snapshot()
        function_id = scanner.monitor.upsert(
            msg.get("function_id"),
            msg["name"],
            msg["description"],
            msg["notify"],
            msg["members"],
            snapshot,
            scanner.health_report(),
            msg["enabled"],
        )
    except MonitorError as err:
        connection.send_error(msg["id"], "invalid_format", str(err))
        return
    except Exception as err:
        connection.send_error(msg["id"], "scan_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(
        msg["id"], _versioned({"function_id": function_id, "functions": scanner.monitor.report()})
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/monitor_preview",
        vol.Required("members"): [
            {
                vol.Required("object_key"): str,
                vol.Required("required"): bool,
                vol.Optional("rules", default=[]): [
                    {vol.Required("kind"): str, vol.Required("value"): vol.Any(int, float)}
                ],
            }
        ],
    }
)
@websocket_api.async_response
@with_scanner
async def websocket_monitor_preview(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Evaluate the draft against the latest scan without storing or notifying."""
    try:
        MonitorStore._validate("Preview", "", False, msg["members"])
        snapshot = await scanner.async_get_snapshot()
        result = evaluate(
            {
                "id": "preview",
                "name": "Preview",
                "description": "",
                "notify": False,
                "members": msg["members"],
            },
            snapshot,
            scanner.health_report(),
            datetime.now(UTC),
        )
    except MonitorError as err:
        connection.send_error(msg["id"], "invalid_format", str(err))
        return
    except Exception as err:
        connection.send_error(msg["id"], "scan_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], _versioned({"preview": result}))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/monitor_history", vol.Required("function_id"): str}
)
@callback
@with_scanner
def websocket_monitor_history(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Return the dated changes of one function, newest first."""
    if not any(item["id"] == msg["function_id"] for item in scanner.monitor.items):
        connection.send_error(msg["id"], "invalid_format", "not_found")
        return
    connection.send_result(
        msg["id"],
        _versioned(
            {
                "entries": scanner.monitor.history_of(msg["function_id"]),
                "retention_days": scanner.monitor.retention_days,
                "availability": scanner.monitor.availability_of(msg["function_id"]),
            }
        ),
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/monitor_delete", vol.Required("function_id"): str}
)
@callback
@with_scanner
def websocket_monitor_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Delete a definition and its persistent notification."""
    try:
        scanner.monitor.delete(msg["function_id"])
    except MonitorError as err:
        connection.send_error(msg["id"], "invalid_format", str(err))
        return
    connection.send_result(msg["id"], _versioned({"functions": scanner.monitor.report()}))


def async_register(hass: HomeAssistant) -> None:
    """Register Housekeeper WebSocket commands."""
    ws_automations.async_register(hass)
    ws_care.async_register(hass)
    ws_mcp.async_register(hass)
    ws_recorder.async_register(hass)
    ws_system.async_register(hass)
    websocket_api.async_register_command(hass, websocket_inventory)
    websocket_api.async_register_command(hass, websocket_scan)
    websocket_api.async_register_command(hass, websocket_status)
    websocket_api.async_register_command(hass, websocket_detail)
    websocket_api.async_register_command(hass, websocket_compare)
    websocket_api.async_register_command(hass, websocket_scan_point)
    websocket_api.async_register_command(hass, websocket_history_series)
    websocket_api.async_register_command(hass, websocket_ignore)
    websocket_api.async_register_command(hass, websocket_set_options)
    websocket_api.async_register_command(hass, websocket_plan_create)
    websocket_api.async_register_command(hass, websocket_plan_merge)
    websocket_api.async_register_command(hass, websocket_plan_renew)
    websocket_api.async_register_command(hass, websocket_plan_check)
    websocket_api.async_register_command(hass, websocket_plan_list)
    websocket_api.async_register_command(hass, websocket_plan_detail)
    websocket_api.async_register_command(hass, websocket_plan_delete)
    websocket_api.async_register_command(hass, websocket_plan_report)
    websocket_api.async_register_command(hass, websocket_device_pairs)
    websocket_api.async_register_command(hass, websocket_plan_confirm)
    websocket_api.async_register_command(hass, websocket_plan_execute)
    websocket_api.async_register_command(hass, websocket_plan_cancel)
    websocket_api.async_register_command(hass, websocket_plan_status)
    websocket_api.async_register_command(hass, websocket_plan_undo)
    websocket_api.async_register_command(hass, websocket_backup_cleanup)
    websocket_api.async_register_command(hass, websocket_events)
    websocket_api.async_register_command(hass, websocket_monitor_list)
    websocket_api.async_register_command(hass, websocket_monitor_save)
    websocket_api.async_register_command(hass, websocket_monitor_preview)
    websocket_api.async_register_command(hass, websocket_monitor_history)
    websocket_api.async_register_command(hass, websocket_monitor_delete)
