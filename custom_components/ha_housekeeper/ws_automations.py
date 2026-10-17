"""WebSocket commands about automations: runs, quality, coverage, traces, refactoring, dry runs."""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util

from . import refactor as refactor_module
from .blueprints import async_blueprints
from .const import DOMAIN
from .correlation import correlate
from .criteria import THRESHOLDS as CRITERIA_LIMITS
from .dry_run import Context as DryRunContext
from .dry_run import dry_run as run_dry
from .inventory import InventoryScanner
from .quality import build as build_quality
from .run_health import report as runs_report
from .runs import run_key
from .trace_compare import compare as compare_traces
from .trace_compare import list_runs as list_trace_runs
from .ws_common import (
    RUNS_TIMEOUT,
    _versioned,
    with_scanner,
)


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/automation_runs"})
@websocket_api.async_response
@with_scanner
async def websocket_automation_runs(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Rate automation and script runs; reads trace heads and Housekeeper's own numbers."""
    try:
        async with asyncio.timeout(RUNS_TIMEOUT):
            result = await runs_report(scanner)
    except Exception as err:
        connection.send_error(msg["id"], "automation_runs_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/automation_quality"})
@websocket_api.async_response
@with_scanner
async def websocket_automation_quality(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Seven separate quality dimensions per automation; reads only."""
    try:
        async with asyncio.timeout(RUNS_TIMEOUT):
            runs = await runs_report(scanner)
            snapshot = await scanner.async_get_snapshot()
    except Exception as err:
        connection.send_error(msg["id"], "quality_failed", f"{type(err).__name__}: {err}")
        return
    result = build_quality(
        snapshot,
        runs,
        runs["conflicts"]["items"],
        scanner.criteria,
        datetime.now(UTC).date(),
        lambda entity_id: (scanner.get_details("automation", entity_id) or {}).get("actions"),
        lambda entity_id: (scanner.get_details("script", entity_id) or {}).get("actions"),
    )
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/criteria", vol.Required("entity_id"): str}
)
@callback
@with_scanner
def websocket_criteria(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """The success criteria of one automation with their outcomes of the last days."""
    result = scanner.criteria.view(msg["entity_id"], datetime.now(UTC).date())
    connection.send_result(msg["id"], _versioned({**result, "limits": CRITERIA_LIMITS}))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/criteria_set",
        vol.Required("entity_id"): str,
        vol.Required("criteria"): list,
    }
)
@callback
@with_scanner
def websocket_criteria_set(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Replace the success criteria of one automation; an empty list removes them."""
    try:
        scanner.criteria.set(msg["entity_id"], msg["criteria"])
    except ValueError as err:
        connection.send_error(msg["id"], "invalid_format", str(err))
        return
    result = scanner.criteria.view(msg["entity_id"], datetime.now(UTC).date())
    connection.send_result(msg["id"], _versioned({**result, "limits": CRITERIA_LIMITS}))


async def _snapshot_or_error(
    scanner: Any, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> dict[str, Any] | None:
    """The last snapshot, or None after the error was sent."""
    try:
        return await scanner.async_get_snapshot()
    except Exception as err:
        connection.send_error(msg["id"], "scan_failed", f"{type(err).__name__}: {err}")
        return None


def _automation_key(snapshot: dict[str, Any], entity_id: str) -> tuple[str | None, dict[str, Any]]:
    for obj in snapshot["objects"]:
        if obj["object_type"] == "automation" and obj["object_id"] == entity_id:
            return run_key(obj), obj
    return None, {}


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/coverage", vol.Required("entity_id"): str}
)
@websocket_api.async_response
@with_scanner
async def websocket_coverage(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """How often each trigger and branch of one automation ran (only when switched on)."""
    snapshot = await _snapshot_or_error(scanner, connection, msg)
    if snapshot is None:
        return
    key, _ = _automation_key(snapshot, msg["entity_id"])
    if key is None:
        connection.send_error(msg["id"], "not_found", "Unknown automation")
        return
    details = scanner.get_details("automation", msg["entity_id"]) or {}
    result = scanner.coverage.view(key, details.get("triggers"), details.get("actions"))
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/coverage_set",
        vol.Required("enabled"): bool,
        vol.Optional("clear", default=False): bool,
    }
)
@callback
@with_scanner
def websocket_coverage_set(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Switch the coverage counting on or off; ``clear`` forgets what was counted."""
    scanner.coverage.set_enabled(msg["enabled"], clear=msg["clear"])
    connection.send_result(msg["id"], {"enabled": scanner.coverage.enabled})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/trace_compare",
        vol.Required("entity_id"): str,
        vol.Optional("run_a"): str,
        vol.Optional("run_b"): str,
    }
)
@websocket_api.async_response
@with_scanner
async def websocket_trace_compare(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """List the runs Home Assistant still has, or compare two of them by structure. Reads only."""
    snapshot = await _snapshot_or_error(scanner, connection, msg)
    if snapshot is None:
        return
    key, _ = _automation_key(snapshot, msg["entity_id"])
    if key is None:
        connection.send_error(msg["id"], "not_found", "Unknown automation")
        return
    try:
        if "run_a" not in msg or "run_b" not in msg:
            runs = await list_trace_runs(hass, key)
            connection.send_result(msg["id"], _versioned({"runs": runs}))
            return
        result = await compare_traces(
            hass,
            key,
            msg["run_a"],
            msg["run_b"],
            scanner.events.events,
            scanner.criteria.recent.get(msg["entity_id"], []),
        )
    except Exception as err:
        connection.send_error(msg["id"], "trace_failed", f"{type(err).__name__}: {err}")
        return
    if result is None:
        connection.send_error(msg["id"], "not_found", "A run is no longer in the trace buffer")
        return
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/refactor_proposals", vol.Required("entity_id"): str}
)
@websocket_api.async_response
@with_scanner
async def websocket_refactor_proposals(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """What could be improved mechanically in one automation, and whether refactoring is on."""
    snapshot = await _snapshot_or_error(scanner, connection, msg)
    if snapshot is None:
        return
    result: dict[str, Any] = {
        "entity_id": msg["entity_id"],
        "enabled": scanner.refactor.enabled,
        "editable": False,
        "reason": None,
        "proposals": [],
    }
    try:
        loaded = await refactor_module.load_source(hass, snapshot, f"automation:{msg['entity_id']}")
        if "use_blueprint" in loaded["item"]:
            result["reason"] = "blueprint"
        else:
            result["editable"] = True
            known = {o["object_id"] for o in snapshot["objects"] if o["object_type"] == "entity"}
            result["proposals"] = refactor_module.propose(loaded["item"], known)
    except refactor_module.SourceError as err:
        result["reason"] = str(err)
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/refactor_set", vol.Required("enabled"): bool}
)
@callback
@with_scanner
def websocket_refactor_set(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Switch the experimental refactoring on or off."""
    scanner.refactor.set_enabled(msg["enabled"])
    connection.send_result(msg["id"], {"enabled": scanner.refactor.enabled})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/automation_dry_run",
        vol.Required("entity_id"): str,
        vol.Optional("states", default={}): vol.All(
            {vol.Match(r"^[a-z0-9_]+\.[a-z0-9_]+$"): vol.All(str, vol.Length(min=1, max=100))},
            vol.Length(max=20),
        ),
    }
)
@websocket_api.async_response
@with_scanner
async def websocket_automation_dry_run(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Explain what one automation would do for the given test states. Never executes anything."""
    snapshot = await _snapshot_or_error(scanner, connection, msg)
    if snapshot is None:
        return
    key, _ = _automation_key(snapshot, msg["entity_id"])
    if key is None:
        connection.send_error(msg["id"], "not_found", "Unknown automation")
        return
    details = scanner.get_details("automation", msg["entity_id"]) or {}
    registry = er.async_get(hass)
    overrides = msg["states"]

    def state(entity_id: str) -> str | None:
        if entity_id in overrides:
            return overrides[entity_id]
        found = hass.states.get(entity_id)
        return found.state if found else None

    def attrs(entity_id: str) -> dict[str, Any]:
        found = hass.states.get(entity_id)
        return dict(found.attributes) if found else {}

    def disabled(entity_id: str) -> bool:
        entry = registry.async_get(entity_id)
        return bool(entry and entry.disabled_by)

    ctx = DryRunContext(
        state=state,
        attrs=attrs,
        exists=lambda e: hass.states.get(e) is not None or registry.async_get(e) is not None,
        disabled=disabled,
        now=dt_util.now(),
        overrides=overrides,
    )
    result = run_dry(
        details.get("triggers"), details.get("conditions"), details.get("actions"), ctx
    )
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/blueprints"})
@websocket_api.async_response
@with_scanner
async def websocket_blueprints(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Blueprints nothing uses and automations whose blueprint is gone. Read-only."""
    try:
        snapshot = await scanner.async_get_snapshot()
        result = await async_blueprints(hass, snapshot)
    except Exception as err:
        connection.send_error(msg["id"], "blueprints_failed", f"{type(err).__name__}: {err}")
        return
    connection.send_result(msg["id"], _versioned(result))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/watches"})
@websocket_api.async_response
@with_scanner
async def websocket_watches(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """The watches after updates, newest first. Reads stored samples only."""
    connection.send_result(
        msg["id"],
        _versioned(
            {"hours": scanner.watch_hours, "watches": scanner.watch.report(scanner.watch_marked())}
        ),
    )


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/watch_end"})
@websocket_api.async_response
@with_scanner
async def websocket_watch_end(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """End the open watch now; what it has measured so far is judged as it stands."""
    connection.send_result(msg["id"], _versioned({"ended": scanner.end_watch()}))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/correlations"})
@websocket_api.async_response
@with_scanner
async def websocket_correlations(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scanner: InventoryScanner,
) -> None:
    """Findings that began at about the time of an update or restart. Reads the last scan only."""
    snapshot = await scanner.async_get_snapshot()
    result = correlate(snapshot["findings"], [*scanner.events.recent(), *scanner.notes.as_events()])
    connection.send_result(msg["id"], _versioned(result))


def async_register(hass: HomeAssistant) -> None:
    """Register the commands of this part."""
    websocket_api.async_register_command(hass, websocket_blueprints)
    websocket_api.async_register_command(hass, websocket_correlations)
    websocket_api.async_register_command(hass, websocket_watches)
    websocket_api.async_register_command(hass, websocket_watch_end)
    websocket_api.async_register_command(hass, websocket_automation_runs)
    websocket_api.async_register_command(hass, websocket_automation_quality)
    websocket_api.async_register_command(hass, websocket_criteria)
    websocket_api.async_register_command(hass, websocket_criteria_set)
    websocket_api.async_register_command(hass, websocket_coverage)
    websocket_api.async_register_command(hass, websocket_coverage_set)
    websocket_api.async_register_command(hass, websocket_trace_compare)
    websocket_api.async_register_command(hass, websocket_automation_dry_run)
    websocket_api.async_register_command(hass, websocket_refactor_proposals)
    websocket_api.async_register_command(hass, websocket_refactor_set)
