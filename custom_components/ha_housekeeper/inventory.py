"""Read-only Home Assistant inventory scanner."""

from __future__ import annotations

import asyncio
import logging
import time
from collections import Counter
from collections.abc import Callable
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

from homeassistant.config_entries import SOURCE_IGNORE, ConfigEntryState
from homeassistant.const import __version__ as HA_VERSION
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import UnsupportedStorageVersionError
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import floor_registry as fr
from homeassistant.helpers import label_registry as lr
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.storage import Store
from homeassistant.loader import IntegrationNotFound, async_get_integration, async_get_integrations
from homeassistant.util import dt as dt_util

from . import followup
from .app_links import app_edges, stopped_app_findings
from .auto_pause import AutoPause
from .automation_analysis import (
    is_concrete_id,
    missing_references,
    summarize_automation_config,
    summarize_script_config,
)
from .automation_blocked import blocked_automation_findings, dead_effect_findings
from .backup_health import AttestStore, backup_health
from .battery_care import BatteryStore
from .battery_kind import apply_battery_kinds
from .blueprints import async_available, blueprint_path, missing_blueprint_findings
from .causes import apply_causes, device_down_findings
from .cleanup import JournalStore, is_child_device, quarantine_entries, recurring_devices
from .cleanup_exec import CleanupRunner
from .config_changes import ChangeStore, fingerprint
from .conflicts import KEY_PREFIX as CONFLICT_KEY_PREFIX
from .const import (
    DEFAULT_LOW_BATTERY_PERCENT,
    DEFAULT_OUTAGE_HIGH_HOURS,
    DEFAULT_OUTAGE_INFO_MINUTES,
    DEFAULT_OUTAGE_LOW_HOURS,
    DEFAULT_OUTAGE_MEDIUM_HOURS,
    DEFAULT_SCAN_INTERVAL_HOURS,
    DEFAULT_STALE_HOURS,
    DEFAULT_UNUSED_AUTOMATION_DAYS,
    DEFAULT_WATCH_HOURS,
    DOMAIN,
    IGNORE_LABEL,
    PREFLIGHT_STORAGE_KEY,
    QUARANTINE_DAYS,
    SIGNAL_SCAN_COMPLETE,
    SIGNAL_SCAN_STARTED,
    STORAGE_VERSION,
    WARMUP_BLIP_SECONDS,
    WARMUP_NAMES,
    WARMUP_SECONDS,
    WARMUP_SETTLE_SECONDS,
    WINDOW_STORAGE_KEY,
)
from .coverage import CoverageStore
from .criteria import CriteriaStore
from .dashboard_analysis import (
    HELPER_DOMAINS,
    annotate_findings,
    dashboard_health,
    extract_dashboard_references,
    extract_entity_references,
    extract_helper_references,
    suggest_replacements,
    view_keys,
)
from .db_health import database_summary
from .entry_states import EntryStateHistory
from .events import EventLog
from .exceptions import ExceptionStore, entry_traits, traits, verdict
from .exceptions import matches as _hits
from .goals import GoalStore
from .hacs import hacs_by_domain, removed_issues, store_kind
from .hints import HintStore
from .history import ScanHistory
from .hygiene import (
    automation_hygiene_findings,
    duplicate_findings,
    finding_key,
    low_battery_ids,
    mark_duplicates,
    orphan_statistics,
    statistic_continuity,
)
from .ignored import IgnoreStore
from .impact import apply_impact
from .issues import (
    async_sync_backup_issue,
    async_sync_database_issue,
    async_sync_issues,
    async_sync_scan_issue,
    async_sync_statistics_issue,
)
from .load_history import LoadStore
from .log_facts import log_facts
from .maintenance import repair_keys
from .marks import (
    GRACE_DEFAULT,
    HIDING_KINDS,
    KINDS,
    KINDS_OF,
    MarkStore,
    apply_marks,
    clean_window,
    counts_from,
    mark_key,
    window_active,
)
from .mcp_access import McpStore
from .monitor import MonitorStore
from .notes import NoteStore
from .notify import NotifyStore, async_announce
from .observations import ObservationStore
from .outage_levels import DIRECT_ENTRY_STATES, Levels, outage_level
from .outage_scan import OutageScans, outage_start
from .policies import KEY_PREFIX as POLICY_KEY_PREFIX
from .policies import PolicyStore
from .protection import ProtectionStore, protection_rules
from .queries import ReplyStore
from .refactor import RefactorStore
from .reminders import ReminderStore
from .runs import RunStore
from .scan_coverage import RETRY_LIMIT, RETRY_MINUTES, ScanCoverage, retryable_gaps
from .scan_health import ScanHealth
from .scan_trigger import ScanRefused, scan_request
from .sensitive_fields import reauth_entry_ids
from .service_check import missing_service_findings
from .signals import SignalStore, situations
from .signals import fire as signal_fire
from .stale import StaleStore
from .start_times import StartStore
from .system_usage import supervisor_get, supervisor_token
from .view_counts import view_counts
from .watch import WATCH_KINDS, WatchStore, evaluate, make_before, next_due

_LOGGER = logging.getLogger(__name__)
SUGGEST_LIMIT = 200
# An entity not provided for this long may be removed without quarantine: one that stays so for a
# day of scans, restarts included, is no integration still waiting for its first data.
NOT_PROVIDED_SETTLED = timedelta(hours=24)
NOT_PROVIDED_KEY = "not_provided:"  # observation key of that period, next to "entity:<id>"

# Keys of the Energy dashboard preferences that name statistics, which are entity IDs.
ENERGY_KEYS = frozenset(
    {
        "stat_energy_from",
        "stat_energy_to",
        "stat_cost",
        "stat_compensation",
        "stat_consumption",
        "stat_rate",
        "included_in_stat",
        "entity_energy_price",
        "entity_energy_price_export",
    }
)


def _iso(value: Any) -> str | None:
    """Serialize a datetime when the registry provides one."""
    return value.isoformat() if hasattr(value, "isoformat") else None


def _edge(source: str, target: str, relation: str) -> dict[str, str]:
    """Build a registry-derived dependency edge."""
    return {"source": source, "target": target, "relation": relation, "confidence": "certain"}


def _enum(value: Any) -> str | None:
    """Serialize an enum-like registry value."""
    if value is None:
        return None
    return str(getattr(value, "value", value))


def marked_keys(objects: list[dict[str, Any]]) -> frozenset[str]:
    """Keys of the objects a hiding mark covers, with the entities of a marked device."""

    def hides(item: dict[str, Any]) -> bool:
        mark = item.get("mark")
        return bool(mark and mark.get("kind") in HIDING_KINDS and not item.get("mark_due"))

    devices = {i["object_id"] for i in objects if i["object_type"] == "device" and hides(i)}
    return frozenset(
        f"{i['object_type']}:{i['object_id']}"
        for i in objects
        if hides(i) or (i["object_type"] == "entity" and i.get("device_id") in devices)
    )


def listed_objects(objects: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """The objects the inventory lists: an automation, script or scene, not also its entity."""
    own = {i["object_id"] for i in objects if i["object_type"] in ("automation", "script", "scene")}
    return [i for i in objects if not (i["object_type"] == "entity" and i["object_id"] in own)]


def marked_status_counts(objects: list[dict[str, Any]]) -> dict[str, int]:
    """How many marked objects there are per status, for the inventory status card.

    Only listed objects count; a mark on the entity of an automation counts for the automation.
    """
    marked = marked_keys(objects)
    return dict(
        Counter(
            i["status"]
            for i in listed_objects(objects)
            if f"{i['object_type']}:{i['object_id']}" in marked
            or f"entity:{i['object_id']}" in marked
        )
    )


class _DeviceIds(set):
    """The IDs of all devices; an ID Home Assistant still resolves (composite) counts as well."""

    def __init__(self, registry: Any) -> None:
        super().__init__(
            entry.id
            for collection in (registry.devices, getattr(registry, "child_devices", ()))
            for entry in _registry_entries(collection)
        )
        self._registry = registry

    def __contains__(self, device_id: object) -> bool:
        return super().__contains__(device_id) or (
            isinstance(device_id, str) and self._registry.async_get(device_id) is not None
        )


def _registry_entries(collection: Any) -> list[Any]:
    """Return entries from legacy mappings and modern read-only collections."""
    return [collection[value] if isinstance(value, str) else value for value in collection]


def _device_config_entry_ids(device: Any) -> list[str]:
    """The config entry that owns a device (a device belongs to exactly one)."""
    return [device.config_entry_id] if getattr(device, "config_entry_id", None) else []


def _entity_status(
    entry: Any,
    state: Any,
    config_entries: dict[str, Any],
    devices: dict[str, Any],
    components: set[str] | frozenset[str] = frozenset(),
) -> tuple[str, str]:
    """Classify an entity conservatively and explain why.

    ``components`` is ``hass.config.components``; it names each platform set up successfully as
    ``<platform>.<domain>``, which tells for an entity without a config entry (YAML) that its
    platform runs.
    """
    if entry.disabled_by is not None:
        return "disabled", "entity_disabled"
    if entry.device_id and entry.device_id not in devices:
        return "orphaned", "device_missing"
    if entry.device_id and devices[entry.device_id].disabled_by is not None:
        return "disabled", "device_disabled"
    if entry.config_entry_id and entry.config_entry_id not in config_entries:
        return "orphaned", "config_entry_missing"
    if entry.config_entry_id and config_entries[entry.config_entry_id].disabled_by is not None:
        return "disabled", "integration_disabled"
    if state is None:
        return "orphaned", "state_missing"
    # Home Assistant keeps a "restored" placeholder for a registry entry its integration did not
    # add. Only while that integration (or YAML platform) runs does it mean "no longer provided";
    # during start-up or a failed setup all its entities carry the placeholder.
    if state.state == "unavailable" and getattr(state, "attributes", {}).get("restored"):
        if entry.config_entry_id:
            running = (
                getattr(config_entries[entry.config_entry_id], "state", None)
                is ConfigEntryState.LOADED
            )
        else:
            running = f"{entry.platform}.{entry.entity_id.partition('.')[0]}" in components
        if running:
            return "orphaned", "not_provided"
    if state.state == "unavailable":
        return "unavailable", "state_unavailable"
    if state.state == "unknown":
        return "unknown", "state_unknown"
    return "active", "state_available"


def alias_texts(aliases: Any, computed_name: str | None = None) -> list[str]:
    """The aliases of a registry entry as sorted text.

    Newer Home Assistant versions mark "use the computed name" with a sentinel instead of text.
    That sentinel stands for the entity's own name, so it is replaced by it (or dropped without one).
    """
    texts = {alias for alias in aliases if isinstance(alias, str)}
    if computed_name and any(not isinstance(alias, str) for alias in aliases):
        texts.add(computed_name)
    return sorted(texts)


def _entity_item(
    entry: Any,
    state: Any,
    config_entries: dict[str, Any],
    devices: dict[str, Any],
    components: set[str] | frozenset[str] = frozenset(),
) -> dict[str, Any]:
    """Normalize one entity registry entry together with its live state."""
    status, reason = _entity_status(entry, state, config_entries, devices, components)
    return {
        "object_type": "entity",
        "object_id": entry.entity_id,
        "name": entry.name or entry.original_name or (state.name if state else entry.entity_id),
        "unique_id": entry.unique_id,
        "platform": entry.platform,
        "original_name": entry.original_name,
        "icon": entry.icon or entry.original_icon,
        "aliases": alias_texts(
            entry.aliases,
            entry.name or entry.original_name or (state.name if state else None),
        ),
        "state_class": state.attributes.get("state_class") if state else None,
        "device_class": (state.attributes.get("device_class") if state else None)
        or getattr(entry, "device_class", None)
        or getattr(entry, "original_device_class", None),
        "unit": state.attributes.get("unit_of_measurement") if state else None,
        "entity_category": _enum(entry.entity_category),
        "config_entry_id": entry.config_entry_id,
        "device_id": entry.device_id,
        "area_id": entry.area_id,
        "labels": sorted(entry.labels),
        "disabled_by": _enum(entry.disabled_by),
        "hidden_by": _enum(entry.hidden_by),
        "status": status,
        "reason": reason,
        "status_since": None,
        "status_since_source": "first_housekeeper_observation",
        "state": state.state if state else None,
        "attributes": dict(state.attributes) if state else {},
        "last_changed": _iso(state.last_changed) if state else None,
        "last_updated": _iso(state.last_updated) if state else None,
        "last_reported": _iso(getattr(state, "last_reported", None)) if state else None,
        "created_at": _iso(getattr(entry, "created_at", None)),
        "modified_at": _iso(getattr(entry, "modified_at", None)),
    }


def _device_item(device: Any, entity_count: int) -> dict[str, Any]:
    """Normalize one device registry entry."""
    status = "disabled" if device.disabled_by is not None else "active" if entity_count else "empty"
    if is_child_device(device):
        # A child device has no manufacturer, connections or via device; reading them from
        # Home Assistant's entry would only report a deprecated access.
        return {
            "object_type": "device",
            "object_id": device.id,
            "name": device.name_by_user or device.name or device.id,
            "manufacturer": None,
            "model": None,
            "model_id": None,
            "serial_number": None,
            "original_name": device.name if device.name_by_user else None,
            "sw_version": None,
            "hw_version": None,
            "entry_type": None,
            "configuration_url": None,
            "identifiers": sorted(":".join(map(str, key)) for key in device.identifiers),
            "connections": [],
            "area_id": device.area_id,
            "config_entry_ids": _device_config_entry_ids(device),
            "device_kind": "child",
            "parent_device_id": device.parent_device_id,
            "via_device_id": None,
            "labels": sorted(device.labels),
            "disabled_by": _enum(device.disabled_by),
            "status": status,
            "entity_count": entity_count,
            "created_at": _iso(getattr(device, "created_at", None)),
            "modified_at": _iso(getattr(device, "modified_at", None)),
        }
    return {
        "object_type": "device",
        "object_id": device.id,
        "name": device.name_by_user or device.name or device.id,
        "manufacturer": device.manufacturer,
        "model": device.model,
        "model_id": getattr(device, "model_id", None),
        "serial_number": getattr(device, "serial_number", None),
        "original_name": device.name if device.name_by_user else None,
        "sw_version": getattr(device, "sw_version", None),
        "hw_version": getattr(device, "hw_version", None),
        "entry_type": _enum(getattr(device, "entry_type", None)),
        "configuration_url": str(device.configuration_url) if device.configuration_url else None,
        "identifiers": sorted(":".join(map(str, key)) for key in device.identifiers),
        "connections": sorted(":".join(map(str, key)) for key in device.connections),
        "area_id": device.area_id,
        "config_entry_ids": _device_config_entry_ids(device),
        "device_kind": "device",
        "parent_device_id": None,
        "via_device_id": device.via_device_id,
        "labels": sorted(device.labels),
        "disabled_by": _enum(device.disabled_by),
        "status": status,
        "entity_count": entity_count,
        "created_at": _iso(getattr(device, "created_at", None)),
        "modified_at": _iso(getattr(device, "modified_at", None)),
    }


def _area_item(area: Any) -> dict[str, Any]:
    return {
        "object_type": "area",
        "object_id": area.id,
        "name": area.name,
        "floor_id": area.floor_id,
        "labels": sorted(area.labels),
        "aliases": sorted(area.aliases),
        "status": "active",
    }


def _floor_item(floor: Any) -> dict[str, Any]:
    return {
        "object_type": "floor",
        "object_id": floor.floor_id,
        "name": floor.name,
        "level": floor.level,
        "aliases": sorted(floor.aliases),
        "status": "active",
    }


def _label_item(label: Any) -> dict[str, Any]:
    return {
        "object_type": "label",
        "object_id": label.label_id,
        "name": label.name,
        "description": label.description,
        "color": label.color,
        "status": "active",
    }


def _config_entry_item(
    entry: Any,
    integration: Any = None,
    entity_count: int = 0,
    device_count: int = 0,
    reauth: bool = False,
) -> dict[str, Any]:
    """Normalize one config entry; ``integration`` is the loader's description of its domain.

    ``reauth`` says that a reauth flow of the entry is open: it asks for a new login. Such an entry
    is a problem even while it is loaded, because its data stops coming.
    """
    state = _enum(entry.state)
    if entry.disabled_by:
        status = "disabled"
    elif entry.source == "ignore":
        status = "ignored"  # a discovery the user dismissed: never set up, so not a problem
    else:
        status = "active" if state == "loaded" and not reauth else "problem"
    reauth = reauth and status == "problem"
    custom = integration is not None and not getattr(integration, "is_built_in", True)
    return {
        "object_type": "config_entry",
        "object_id": entry.entry_id,
        "name": entry.title,
        "domain": entry.domain,
        "integration_name": getattr(integration, "name", None),
        "custom": custom,
        "integration_dir": f"custom_components/{entry.domain}" if custom else None,
        "integration_version": str(integration.version)
        if custom and getattr(integration, "version", None)
        else None,
        "documentation": getattr(integration, "documentation", None),
        "source": entry.source,
        "state": state,
        "error": getattr(entry, "reason", None),
        "reauth": reauth,
        "unique_id": entry.unique_id,
        "disabled_by": _enum(entry.disabled_by),
        "entity_count": entity_count,
        "device_count": device_count,
        "created_at": _iso(getattr(entry, "created_at", None)),
        "modified_at": _iso(getattr(entry, "modified_at", None)),
        "status": status,
    }


APP_TIMEOUT = 8  # seconds; the scan does not wait longer for the Supervisor's list of apps


def _app_item(app: dict[str, Any]) -> dict[str, Any]:
    """One installed app (add-on) from the Supervisor's list; a stopped app is not a problem."""
    slug = str(app["slug"])
    return {
        "object_type": "app",
        "object_id": slug,
        "name": str(app.get("name") or slug),
        "slug": slug,
        "version": app.get("version"),
        "version_latest": app.get("version_latest"),
        "update_available": bool(app.get("update_available")),
        "state": app.get("state"),
        "repository": app.get("repository"),
        "stage": app.get("stage"),
        "description": app.get("description"),
        "status": "active" if app.get("state") == "started" else "stopped",
    }


async def _app_inventory(
    hass: HomeAssistant, unchecked: set[str] | None = None
) -> list[dict[str, Any]]:
    """Installed apps; empty without a Supervisor or when it does not answer.

    A Supervisor that exists but does not answer is noted in ``unchecked``: the apps and what
    hangs on them were not looked at, which is not the same as "no problems".
    """
    if not supervisor_token():
        return []
    listing = await supervisor_get(hass, "/addons", timeout=APP_TIMEOUT)
    if listing is None and unchecked is not None:
        unchecked.add("app")
    return [
        _app_item(app)
        for app in (listing or {}).get("addons") or []
        if isinstance(app, dict) and app.get("slug")
    ]


def _fallback_automation_item(state: Any) -> dict[str, Any]:
    """Describe an automation only known through its state object."""
    attrs = state.attributes
    return {
        "object_type": "automation",
        "object_id": state.entity_id,
        "name": attrs.get("friendly_name", state.entity_id),
        "automation_id": attrs.get("id"),
        "mode": attrs.get("mode"),
        "current": attrs.get("current", 0),
        "max": attrs.get("max"),
        "last_triggered": _iso(attrs.get("last_triggered")),
        "status": "active" if state.state == "on" else "disabled",
        "state": state.state,
        "source": "state_fallback",
        "description": "",
        "triggers": [],
        "conditions": [],
        "actions": [],
        "trigger_count": 0,
        "condition_count": 0,
        "action_count": 0,
        "references": [],
    }


def _runtime_references(entity: Any, attr: str) -> Any:
    """What Home Assistant extracts from an automation or script, or nothing where it fails on it."""
    try:
        return getattr(entity, attr, set())
    except Exception as err:
        # HA's extraction raises on a config it did not expect (a dict in an entity_id list).
        _LOGGER.warning(
            "Home Assistant could not read %s of %s (%s); only its configuration is used",
            attr,
            getattr(entity, "entity_id", "?"),
            type(err).__name__,
        )
        return set()


def _age(item: dict[str, Any], now: datetime) -> timedelta | None:
    since = item.get("status_since")
    return max(now - datetime.fromisoformat(since), timedelta(0)) if since else None


def _observed_as(item: dict[str, Any]) -> str:
    """The classification the observation period follows.

    An entity not provided is usually one that was unavailable before a restart: the period goes
    on, so "observed since" does not start again with the new classification.
    """
    return "unavailable" if item.get("reason") == "not_provided" else item["status"]


def _not_provided_settled(since: str | None, now: datetime) -> bool:
    """Whether an entity has not been provided for a whole day of observation."""
    return since is not None and now - datetime.fromisoformat(since) >= NOT_PROVIDED_SETTLED


def _placeholder_age(item: dict[str, Any], now: datetime) -> timedelta | None:
    """How long Home Assistant has held the "restored" placeholder of an entity not provided."""
    since = item.get("last_changed")
    return max(now - datetime.fromisoformat(since), timedelta(0)) if since else None


def _reaches_info(item: dict[str, Any], now: datetime, levels: Levels | None) -> bool:
    """Whether an unavailable entity has been so long enough to be a finding.

    Orphaned entities always qualify; only an outage that is still younger than the first
    threshold is left out. An entity not provided waits as long: some integrations add their
    entities only when the first data arrives, after they count as loaded. Without ``levels``
    nothing is left out.
    """
    if levels is not None and item.get("reason") == "not_provided":
        age = _placeholder_age(item, now)
        return age is not None and outage_level(age, levels) is not None
    if levels is None or item["status"] not in ("unavailable", "unknown"):
        return True
    age = _age(item, now)
    return age is not None and outage_level(age, levels) is not None


def _entity_findings(
    entities: list[dict[str, Any]],
    now: datetime | None = None,
    levels: Levels | None = None,
) -> list[dict[str, Any]]:
    """Create findings for entities that need attention; an outage is graded by how long it lasts."""
    now = now or datetime.now(UTC)
    findings = []
    for item in entities:
        # No value any more is a problem only for an entity that had one: some never report.
        if item["status"] == "unknown" and not item.get("had_value"):
            continue
        if item["status"] not in {"orphaned", "unavailable", "unknown"} or not _reaches_info(
            item, now, levels
        ):
            continue
        finding = {
            "rule_id": f"entity.{item['reason']}",
            "object_id": item["object_id"],
            "classification": item["status"],
            "confidence": 0.98
            if item["reason"] in ("config_entry_missing", "not_provided")
            else 0.75,
            "first_detected_at": item["status_since"],
            "evidence": [{"kind": item["reason"], "source": "entity_registry"}],
        }
        if levels is not None and item["status"] in ("unavailable", "unknown"):
            age = _age(item, now)
            if age is not None:
                finding["outage_level"] = outage_level(age, levels)
        findings.append(finding)
    return findings


FAILED_ENTRY_STATES = frozenset(
    {
        "setup_error",
        "setup_retry",
        "setup_in_progress",
        "not_loaded",
        "failed_unload",
        "migration_error",
    }
)


def _dashboard_failure(err: Exception) -> str:
    """Why a dashboard could not be read: a category only, never the error text."""
    if type(err).__name__ == "ConfigNotFound":
        return "auto_generated"
    if type(err).__name__ in ("HomeAssistantError", "JSONDecodeError", "ValueError"):
        return "invalid"
    return "error"


def _graded_outage(
    began: str,
    now: datetime,
    levels: Levels,
    counted_from: datetime | None,
    direct: bool = False,
) -> tuple[str, str | None]:
    """``(since, level)`` of an outage that began at ``began``; a mark window moves ``since`` later."""
    started = datetime.fromisoformat(began)
    if counted_from and counted_from > started:
        started = counted_from
    age = max(now - started, timedelta(0))
    return started.isoformat(), outage_level(age, levels, direct)


REAUTH_RULE = "config_entry.reauth"
REAUTH_SCAN_GAP = 60  # seconds between two scans that a changed login request asks for


def _config_entry_findings(
    integrations: list[dict[str, Any]],
    now: datetime,
    levels: Levels,
    counted_from: dict[str, datetime] | None = None,
    auto_paused: dict[str, str] | None = None,
) -> list[dict[str, Any]]:
    """Findings for active config entries that are not loaded, graded by how long that has lasted.

    ``counted_from`` holds, per entry with a mark window, when the window ended: what happened
    before is expected, the outage counts from then on. ``auto_paused`` holds, per entry that
    auto-pause disabled, where its outage began: the pause handles it, but it stays a finding.
    """
    findings = []
    for item in integrations:
        since = item.get("status_since")
        paused_since = (auto_paused or {}).get(item["object_id"])
        if paused_since and item["status"] == "disabled":
            counted, level = _graded_outage(
                paused_since, now, levels, (counted_from or {}).get(item["object_id"])
            )
            if level is not None:
                findings.append(
                    {
                        "rule_id": "config_entry.not_loaded",
                        "object_id": item["object_id"],
                        "classification": "problem",
                        "confidence": 0.75,
                        "first_detected_at": counted,
                        "outage_level": level,
                        "evidence": [{"kind": "paused", "source": "auto_pause"}],
                    }
                )
            continue
        if item.get("reauth"):
            findings.append(
                {
                    "rule_id": REAUTH_RULE,
                    "object_id": item["object_id"],
                    "classification": "problem",
                    "confidence": 0.95,
                    "first_detected_at": since or now.isoformat(),
                    "evidence": [{"kind": "reauth", "source": "config_entries"}],
                }
            )
            continue  # the new login is the news, not that the entry is not loaded
        if item["status"] != "problem" or item["state"] not in FAILED_ENTRY_STATES or not since:
            continue
        counted, level = _graded_outage(
            since,
            now,
            levels,
            (counted_from or {}).get(item["object_id"]),
            item["state"] in DIRECT_ENTRY_STATES,
        )
        if level is None:
            continue  # younger than the first threshold: no finding yet
        findings.append(
            {
                "rule_id": "config_entry.not_loaded",
                "object_id": item["object_id"],
                "classification": "problem",
                "confidence": 0.9 if item["state"] == "setup_error" else 0.75,
                "first_detected_at": counted,
                "outage_level": level,
                "evidence": [
                    {"kind": item["state"], "source": "config_entries", "reason": item.get("error")}
                ],
            }
        )
    return findings


def runtime_scene_ids(config: Any) -> set[str]:
    """Scene entity IDs that an automation or script creates itself with ``scene.create``.

    Such a scene does not exist until the action has run once (and again after each restart), so a
    reference to it is not necessarily broken. Only fixed IDs count; templates are skipped.
    """
    found: set[str] = set()
    stack = [config]
    while stack:
        node = stack.pop()
        if isinstance(node, dict):
            if "scene.create" in (node.get("action"), node.get("service")):
                data = node.get("data")
                scene_id = data.get("scene_id") if isinstance(data, dict) else None
                if isinstance(scene_id, str) and is_concrete_id(scene_id):
                    found.add(scene_id if scene_id.startswith("scene.") else f"scene.{scene_id}")
            stack.extend(node.values())
        elif isinstance(node, list):
            stack.extend(node)
    return found


def _missing_findings(
    domain: str,
    object_id: str,
    missing: list[dict[str, str]],
    known: set[str] | None = None,
) -> list[dict[str, Any]]:
    """Create one finding per reference whose target no longer exists.

    With ``known`` (the existing entity IDs) a missing entity also gets ``suggestions``: close
    names that do exist. The first ``SUGGEST_LIMIT`` findings get them, so a huge broken config
    cannot make a scan slow.
    """
    findings = [
        {
            "rule_id": f"{domain}.missing_{reference['kind']}",
            "object_id": object_id,
            "classification": "broken_reference",
            "confidence": 0.98,
            "first_detected_at": None,
            "affected_object": reference["object_id"],
            "evidence": [
                {
                    "kind": "missing_reference",
                    "source": f"{domain}_runtime_config",
                    "location": reference["location"],
                }
            ],
        }
        for reference in missing
    ]
    if known:
        cache: dict[str, tuple[str, ...]] = {}
        for finding in findings[:SUGGEST_LIMIT]:
            if finding["rule_id"].endswith("_entity"):
                found = suggest_replacements(finding["affected_object"], known, cache=cache)
                if found:
                    finding["suggestions"] = found
    return findings


def _structure_edges(
    entities: list[dict[str, Any]],
    devices: list[dict[str, Any]],
    areas: list[dict[str, Any]],
) -> list[dict[str, str]]:
    """Create registry-derived dependency edges."""
    edges: list[dict[str, str]] = []
    for entity in entities:
        entity_key = f"entity:{entity['object_id']}"
        if entity["device_id"]:
            edges.append(_edge(f"device:{entity['device_id']}", entity_key, "PROVIDES"))
        if entity["config_entry_id"]:
            edges.append(_edge(f"config_entry:{entity['config_entry_id']}", entity_key, "PROVIDES"))
        if entity["area_id"]:
            edges.append(_edge(f"area:{entity['area_id']}", entity_key, "CONTAINS"))
    for device in devices:
        device_key = f"device:{device['object_id']}"
        edges.extend(
            _edge(f"config_entry:{entry_id}", device_key, "OWNS")
            for entry_id in device["config_entry_ids"]
        )
        if device["via_device_id"]:
            edges.append(_edge(f"device:{device['via_device_id']}", device_key, "VIA_DEVICE"))
        if device["area_id"]:
            edges.append(_edge(f"area:{device['area_id']}", device_key, "CONTAINS"))
    edges.extend(
        _edge(f"floor:{area['floor_id']}", f"area:{area['object_id']}", "CONTAINS")
        for area in areas
        if area["floor_id"]
    )
    return edges


DETAIL_FIELDS = ("attributes", "triggers", "conditions", "actions", "references")


def _split_details(objects: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    """Move bulky per-object fields out of the list payload into a detail index."""
    details: dict[str, dict[str, Any]] = {}
    for item in objects:
        bulky = {name: item.pop(name) for name in DETAIL_FIELDS if name in item}
        if bulky:
            details[f"{item['object_type']}:{item['object_id']}"] = bulky
    return details


def storage_sizes(hass: HomeAssistant) -> dict[str, dict[str, float]]:
    """Blocking: size in bytes and last change of each of Housekeeper's own files in ``.storage``."""
    base = Path(hass.config.path(".storage"))
    files: dict[str, dict[str, float]] = {}
    try:
        found = sorted(base.glob(f"{DOMAIN}.*"))
    except OSError:
        return files
    for path in found:
        try:
            info = path.stat()
        except OSError:
            continue
        files[path.name[len(DOMAIN) + 1 :]] = {"bytes": info.st_size, "changed": info.st_mtime}
    return files


STORE_NAMES = (
    "observations",
    "history",
    "ignored",
    "exceptions",
    "policies",
    "replies",
    "journal",
    "attest",
    "events",
    "watch",
    "marks",
    "stale",
    "load",
    "starts",
    "goals",
    "criteria",
    "coverage",
    "refactor",
    "protection",
    "signals",
    "entry_states",
    "health",
    "reminders",
    "notes",
    "batteries",
    "notify",
    "hints",
    "mcp",
    "monitor",
    "runs",
    "config_changes",
    "auto_pause",
)


class InventoryScanner:
    """Build and cache a normalized, read-only inventory."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.observations = ObservationStore(hass)
        self.history = ScanHistory(hass)
        self.ignored = IgnoreStore(hass)
        self.exceptions = ExceptionStore(hass)
        self.vacation_hook: Callable[[], None] | None = (
            None  # set by __init__.py: follow the switch
        )
        self.policies = PolicyStore(hass)
        self.replies = ReplyStore(hass)
        self.journal = JournalStore(hass)
        self.attest = AttestStore(hass)
        self.events = EventLog(hass)
        self.watch = WatchStore(hass)
        self.marks = MarkStore(hass)
        self._window_seen: dict[str, bool] = {}  # which mark windows were open at the last apply
        self.stale = StaleStore(hass)
        self.load = LoadStore(hass)
        self.starts = StartStore(hass)
        self._started = datetime.now(UTC)
        self._reauth_seen: set[str] | None = (
            None  # the entries that asked for a login at the last scan
        )
        self._reauth_asked = float("-inf")
        self.goals = GoalStore(hass)
        self.criteria = CriteriaStore(hass)
        self.coverage = CoverageStore(hass)
        self.refactor = RefactorStore(hass)
        self.protection = ProtectionStore(hass)
        self.signals = SignalStore(hass)
        self.entry_states = EntryStateHistory(hass)
        self.health = ScanHealth(hass)
        self.reminders = ReminderStore(hass)
        self.notes = NoteStore(hass)
        self.batteries = BatteryStore(hass)
        self.notify = NotifyStore(hass)
        self.hints = HintStore(hass)
        hass.data.setdefault(DOMAIN, {})["hints"] = self.hints
        self.backup_report: dict[str, Any] | None = None  # the last one that could be read
        self.mcp = McpStore(hass)
        self.monitor = MonitorStore(hass)
        self.runs = RunStore(hass)
        self.config_changes = ChangeStore(hass)
        self.auto_pause = AutoPause(hass, self)
        self.cleanup = CleanupRunner(hass, self)
        self.paused = False
        self.retry_runs = 0  # Rescans after a gap in a row; set by the scheduler in __init__.py
        self._booting = False
        self.boot_anchor: float | None = (
            None  # epoch seconds the start counts from; set in __init__.py
        )
        self._warmup_until: float | None = None
        self._settled_at: float | None = None  # since when no integration has been loading
        self._pending_since: float | None = None  # since when an integration has been loading again
        self.integrations_pending = 0
        self.integrations_loading: list[
            str
        ] = []  # titles of the ones being set up, for the start notice
        self.integrations_done = (
            0  # of the enabled ones: not waiting to be set up and not being set up
        )
        self.integrations_total = 0
        self._recorder_available = False
        # What the scan in progress could not read: "dashboard", "dashboard:<id>" or "app".
        self._unchecked: set[str] = set()
        self.scan_coverage = ScanCoverage()
        self._lock = asyncio.Lock()
        self._scan_task: asyncio.Task[None] | None = None  # a scan the service or button started
        self._last_scan_end: float | None = None
        self._snapshot: dict[str, Any] | None = None
        self._details: dict[str, dict[str, Any]] = {}
        self.outage_info_minutes = DEFAULT_OUTAGE_INFO_MINUTES
        self.outage_low_hours = DEFAULT_OUTAGE_LOW_HOURS
        self.outage_medium_hours = DEFAULT_OUTAGE_MEDIUM_HOURS
        self.outage_high_hours = DEFAULT_OUTAGE_HIGH_HOURS
        self.last_scan_seconds = 0.0
        self.outage_scans = OutageScans(hass, self)
        self.unused_automation_days = DEFAULT_UNUSED_AUTOMATION_DAYS
        self.low_battery_percent = DEFAULT_LOW_BATTERY_PERCENT
        self.stale_hours = DEFAULT_STALE_HOURS
        self.scan_interval_hours = DEFAULT_SCAN_INTERVAL_HOURS
        self.watch_hours = DEFAULT_WATCH_HOURS
        self.version: str | None = None
        self.load_failures: list[str] = []  # stores whose saved data could not be read
        self.status: dict[str, Any] = {
            "running": False,
            "phase": "idle",
            "progress": 0,
            "last_error": None,
        }

    @property
    def outage_levels(self) -> Levels:
        """The thresholds of the levels: info in minutes, low, medium and high in hours."""
        return (
            self.outage_info_minutes,
            self.outage_low_hours,
            self.outage_medium_hours,
            self.outage_high_hours,
        )

    async def async_initialize(self) -> None:
        """Load persisted observations and read the installed version."""
        try:
            self.version = str((await async_get_integration(self.hass, DOMAIN)).version)
        except IntegrationNotFound:
            self.version = None
        for name in STORE_NAMES:
            try:
                await getattr(self, name).async_load()
            except UnsupportedStorageVersionError:
                raise  # written by a newer version: running on would overwrite it
            except Exception:
                # One unreadable file must not take the whole integration down; that part starts empty.
                _LOGGER.exception("The saved data of %s could not be read, starting it empty", name)
                self.load_failures.append(name)
        # Features that were removed leave a file behind that is of no use any more.
        for key in (WINDOW_STORAGE_KEY, PREFLIGHT_STORAGE_KEY):
            try:
                await Store(self.hass, STORAGE_VERSION, key).async_remove()
            except Exception:  # noqa: BLE001 - a file that cannot be deleted is left alone
                _LOGGER.debug("The old file %s could not be removed", key, exc_info=True)

    def begin_boot(self) -> None:
        """Home Assistant is still booting: scans are preliminary until the warm-up is over."""
        self._booting = True

    def begin_warmup(self, seconds: float) -> None:
        """Home Assistant just started: scans stay preliminary for the next ``seconds``."""
        self._booting = False
        self._warmup_until = time.monotonic() + seconds
        self._settled_at = None
        self._pending_since = None
        self.check_warmup()

    def check_warmup(self) -> None:
        """Look at the integrations: the warm-up ends a minute after none of them is loading any more."""
        if self._booting or self._warmup_until is None:
            return
        entries = list(self.hass.config_entries.async_entries())
        # An entry that auto-pause switches on for a try is no part of the start.
        trying = {i for i, rec in self.auto_pause.paused.items() if rec.get("trying")}
        loading = [
            e
            for e in entries
            if e.state is ConfigEntryState.SETUP_IN_PROGRESS
            and getattr(e, "entry_id", None) not in trying
        ]
        # Ignored and disabled entries are never set up, so they are no part of the progress.
        enabled = [
            e
            for e in entries
            if getattr(e, "disabled_by", None) is None
            and getattr(e, "source", None) != SOURCE_IGNORE
            and getattr(e, "entry_id", None) not in trying
        ]
        self.integrations_pending = len(loading)
        self.integrations_loading = [str(getattr(e, "title", "") or e.domain) for e in loading][
            :WARMUP_NAMES
        ]
        self.integrations_total = len(enabled)
        self.integrations_done = sum(
            1
            for e in enabled
            if e.state not in (ConfigEntryState.SETUP_IN_PROGRESS, ConfigEntryState.NOT_LOADED)
        )
        now = time.monotonic()
        if self.integrations_pending:
            if self._pending_since is None:
                self._pending_since = now
            # A short blip after the integrations had settled does not start the buffer over.
            if self._settled_at is None or now - self._pending_since >= WARMUP_BLIP_SECONDS:
                self._settled_at = None
        else:
            self._pending_since = None
            if self._settled_at is None:
                self._settled_at = now

    @property
    def settled_at(self) -> float | None:
        """``time.monotonic()`` of the moment no integration was loading any more; None while some are."""
        return self._settled_at

    @property
    def boot_seconds(self) -> int | None:
        """How long Home Assistant has been loading, while it still is; None once it runs."""
        if not self._booting or self.boot_anchor is None:
            return None
        return max(0, round(time.time() - self.boot_anchor))

    @property
    def warmup_settling(self) -> bool:
        """Whether every integration has loaded and only the safety buffer is left."""
        return self._settled_at is not None and self.warmup_seconds_left > 0

    @property
    def booting(self) -> bool:
        """Whether Home Assistant has not reported "started" yet, so the warm-up has not begun."""
        return self._booting

    @property
    def warmup_seconds_left(self) -> int:
        """Seconds until scans count again, 0 when the warm-up is over."""
        if self._booting:
            return WARMUP_SECONDS
        if self._warmup_until is None:
            return 0
        now = time.monotonic()
        left = self._warmup_until - now
        if self._settled_at is not None:
            left = min(left, self._settled_at + WARMUP_SETTLE_SECONDS - now)
        return max(0, round(left))

    @property
    def warming_up(self) -> bool:
        """Whether entity states may still be missing because Home Assistant is starting."""
        return self._booting or self.warmup_seconds_left > 0

    async def async_scan(self, record: bool = True) -> dict[str, Any]:
        """Scan registries and states. Concurrent callers share serialized work.

        ``record`` False is a scan that follows an outage: it is no point of the history.
        """
        async with self._lock:
            self.status.update(running=True, phase="registries", progress=5, last_error=None)
            async_dispatcher_send(self.hass, SIGNAL_SCAN_STARTED)
            began = time.monotonic()
            self.health.started(datetime.now(UTC))
            try:
                # Decided before the states are read: a scan that began during the warm-up stays
                # preliminary even if the warm-up ends while it runs.
                preliminary = self.warming_up
                snapshot = await self._async_build_snapshot(preliminary)
                self._details = _split_details(snapshot["objects"])
                self._snapshot = snapshot
                if not preliminary:
                    self._sync_issues(snapshot)
                    async_announce(self.hass, self.notify.new(snapshot["findings"]))
                    if record:
                        self.history.record(snapshot)
                    self.entry_states.record(
                        {
                            e.entry_id: getattr(e.state, "value", str(e.state))
                            for e in self.hass.config_entries.async_entries()
                        },
                        datetime.now(UTC),
                        {
                            e.entry_id: getattr(e, "_tries", None)
                            for e in self.hass.config_entries.async_entries()
                        },
                    )
                    try:
                        await self.auto_pause.check(datetime.now(UTC))
                    except Exception:  # a failing pause must not fail the scan
                        _LOGGER.warning("Auto-pause check failed", exc_info=True)
                    await self._observe_versions(snapshot)
                    self._observe_watch(snapshot)
                    snapshot["meta"]["view_counts"] = await view_counts(self, self.hass, snapshot)
                    if followup.check(
                        self.journal.plans, snapshot, datetime.now(UTC), self.runs.errors_since
                    ):
                        self.journal.save()
                    snapshot["regressions"] = followup.regressions(
                        self.journal.plans, datetime.now(UTC)
                    )
                    snapshot["criteria_alerts"] = self.criteria.alerts(datetime.now(UTC).date())
                    self.hass.async_create_background_task(
                        self._announce(snapshot), "HA Housekeeper events"
                    )
                self.last_scan_seconds = time.monotonic() - began
                self.health.succeeded(datetime.now(UTC), self.last_scan_seconds, preliminary)
                if not preliminary:
                    self.outage_scans.after_scan(snapshot)
                self.monitor.refresh(snapshot, self.health_report(), new_scan=not preliminary)
                # Not running any more before the signal goes out: the button reads it then.
                self.status.update(running=False, phase="complete", progress=100)
                self.async_check_health()
                self._last_scan_end = time.monotonic()
                return snapshot
            except Exception as err:
                # The traceback only at debug level: it names the line, which the error text lacks.
                _LOGGER.debug(
                    "The scan failed in phase %s", self.status.get("phase"), exc_info=True
                )
                self.health.failed(datetime.now(UTC), str(self.status.get("phase")), err)
                self.status.update(
                    running=False,
                    phase="failed",
                    last_error=f"{type(err).__name__}: {err}",
                )
                self.async_check_health()
                raise

    async def async_request_scan(self, wait: bool = False, record: bool = True) -> dict[str, Any]:
        """Start a scan for the service or the button; many requests make one scan.

        Returns how the request went (``start``, ``join``, ``recent``) and, once there is a
        snapshot, the counts of the latest one. Raises ``ScanRefused`` while a plan runs or Home
        Assistant boots. With ``wait`` it returns after the scan has ended.
        """
        task = self._scan_task if self._scan_task and not self._scan_task.done() else None
        decision = scan_request(
            running=bool(self.status["running"]) or task is not None,
            cleanup_busy=self.cleanup.running or self.paused,
            warming_up=self.warming_up,
            since_last=None
            if self._last_scan_end is None
            else time.monotonic() - self._last_scan_end,
        )
        if decision == "start":
            task = self._scan_task = self.hass.async_create_background_task(
                self._requested_scan(record), "HA Housekeeper requested scan"
            )
        if wait and decision != "recent":
            if task is not None:
                await asyncio.shield(task)
            else:  # the panel's scan is running: wait for its lock
                async with self._lock:
                    pass
        return self.scan_summary(decision)

    async def _requested_scan(self, record: bool = True) -> None:
        try:
            await self.async_scan(record)
        except Exception as err:  # the status and the scan health keep the reason
            _LOGGER.warning("The requested scan failed: %s", type(err).__name__)

    def scan_summary(self, decision: str) -> dict[str, Any]:
        """How a requested scan went and the counts of the latest snapshot; no names, no texts."""
        result: dict[str, Any] = {"status": decision}
        snapshot = self._snapshot
        if snapshot is not None:
            active = [f for f in snapshot["findings"] if not f.get("ignored")]
            result.update(
                findings=len(active),
                high=sum(1 for f in active if f.get("impact") == "high"),
                scanned_at=snapshot["meta"]["scanned_at"],
                preliminary=bool(snapshot["meta"].get("preliminary")),
            )
        return result

    def health_report(self) -> dict[str, Any]:
        """The scan health as the panel and the sensor read it."""
        return self.health.report(datetime.now(UTC), self.scan_interval_hours)

    def _sync_issues(self, snapshot: dict[str, Any]) -> None:
        async_sync_issues(self.hass, snapshot["findings"])
        async_sync_statistics_issue(self.hass, len(snapshot.get("orphaned_statistics", [])))

    @callback
    def sync_hints(self) -> None:
        """Bring every repair hint in line with the switches, without waiting for the next scan."""
        if self._snapshot is not None and not self.warming_up:
            self._sync_issues(self._snapshot)
        async_sync_scan_issue(self.hass, self.health_report())
        async_sync_database_issue(self.hass, self.events.integrity)
        async_sync_backup_issue(self.hass, self.backup_report)

    def async_check_health(self) -> None:
        """Raise or clear the repair hint for a scan that keeps failing, and tell the sensor."""
        async_sync_scan_issue(self.hass, self.health_report())
        async_sync_database_issue(self.hass, self.events.integrity)
        self.monitor.refresh(self._snapshot, self.health_report(), new_scan=False)
        async_dispatcher_send(self.hass, SIGNAL_SCAN_COMPLETE)

    async def _announce(self, snapshot: dict[str, Any]) -> None:
        """Fire the events for situations that are new since the last scan."""
        backup = None
        try:
            async with asyncio.timeout(20):
                backup = await backup_health(self.hass, self.attest, self.journal.plans)
        except Exception:  # noqa: BLE001 - without the backup report only that event is skipped
            backup = None
        if backup is not None:
            self.backup_report = backup
        async_sync_backup_issue(self.hass, self.backup_report)
        try:
            found = situations(
                snapshot,
                self.journal.plans,
                backup,
                datetime.now(UTC),
                snapshot.get("reminders"),
            )
            # Unknown is not "overdue", and a missing report must not end that situation either.
            unknown = ("backup:",) if backup is None else ()
            signal_fire(self.hass, self.signals.fresh(found, unknown))
        except Exception:  # noqa: BLE001 - events never break a scan
            _LOGGER.debug("Events failed", exc_info=True)

    async def _system_versions(self) -> dict[str, str]:
        """OS and Supervisor versions; empty where there is no Supervisor or it does not answer."""
        found: dict[str, str] = {}
        for key, path in (("os", "/os/info"), ("supervisor", "/supervisor/info")):
            info = await supervisor_get(self.hass, path, timeout=10)
            version = info.get("version") if isinstance(info, dict) else None
            if isinstance(version, str) and version:
                found[key] = version
        return found

    async def _observe_versions(self, snapshot: dict[str, Any]) -> None:
        custom = {
            item["domain"]: item["integration_version"]
            for item in snapshot["objects"]
            if item["object_type"] == "config_entry" and item.get("integration_version")
        }
        now = datetime.now(UTC)
        found = self.events.observe(HA_VERSION, custom, now, await self._system_versions())
        found = [
            e for e in found if e["kind"] in WATCH_KINDS
        ]  # integrations run on the usual findings
        if found and self.watch_hours > 0:
            # The restart is the moment of the update; the scan that notices it comes minutes later.
            started = self.events.last_start(now, timedelta(hours=24)) or now
            triggers = [{k: v for k, v in e.items() if k != "at"} for e in found]
            self.watch.start(
                started, now, self.watch_hours, triggers, make_before(self.history.previous)
            )

    def _observe_watch(self, snapshot: dict[str, Any]) -> None:
        """A scan after an update is a sample of the watch, once the restart has calmed down."""
        self.watch.sample(snapshot, datetime.now(UTC), self.watch_marked(snapshot))
        snapshot["meta"]["watch"] = self.watch_summary()

    def watch_marked(self, snapshot: dict[str, Any] | None = None) -> frozenset[str]:
        """Objects marked as expected (offline on purpose and the like); they do not count as new outages."""
        snapshot = snapshot or self._snapshot or {}
        return marked_keys(snapshot.get("objects") or [])

    def watch_summary(self) -> dict[str, Any] | None:
        """The open watch in short, for the band in the panel header; None when none is open."""
        watch = self.watch.active()
        if watch is None:
            return None
        result = evaluate(watch, self.watch_marked())
        return {
            "id": watch["id"],
            "started_at": watch["started_at"],
            "until": watch["until"],
            "triggers": watch["triggers"],
            "samples": len(watch["samples"]),
            "new": len(result["new"]) + len(result["new_findings"]) + len(result["new_repairs"]),
        }

    def end_watch(self) -> bool:
        """Close the open watch before its time; the band in the panel header goes with it."""
        ended = self.watch.end(datetime.now(UTC))
        if ended and self._snapshot is not None:
            self._snapshot["meta"]["watch"] = None
        return ended

    async def async_update_changed(self, old: Any, new: Any) -> None:
        """An install of Home Assistant, the OS or the Supervisor began: scan now, so that the watch
        after it compares with the state of this moment and not with the last scheduled scan.

        When the scan is refused (a plan runs, the start is on) or comes too late, the last stored scan stays
        the state before the restart.
        """

        def installing(state: Any) -> bool:
            return state is not None and bool(state.attributes.get("in_progress"))

        if self.watch_hours <= 0 or not installing(new) or installing(old):
            return
        try:
            await self.async_request_scan()
        except ScanRefused:
            return

    async def async_check_reauth(self) -> None:
        """Ask for a scan when the entries that wait for a new login are not those of the last scan.

        Home Assistant has no hook for a flow that starts or ends, so this is a cheap look at its open
        flows. At most one scan a minute comes of it, and only when the set has changed.
        """
        if self._reauth_seen is None or reauth_entry_ids(self.hass) == self._reauth_seen:
            return
        if time.monotonic() - self._reauth_asked < REAUTH_SCAN_GAP:
            return
        self._reauth_asked = time.monotonic()
        try:
            await self.async_request_scan()
        except ScanRefused:  # a plan or the start is in the way: the next look asks again
            return

    async def async_watch_tick(self) -> None:
        """Ask for the next scan of an open watch when it is due; it is judged at its end."""
        watch = self.watch.active()
        if watch is None or self.watch.expire(datetime.now(UTC)):
            return
        due = next_due(watch)
        if due is None or due > datetime.now(UTC) or self.watch_hours <= 0:
            return
        try:
            await self.async_request_scan()
        except ScanRefused:  # a plan or the start is in the way: the next tick asks again
            return

    @property
    def snapshot(self) -> dict[str, Any] | None:
        """Return the latest snapshot without triggering a scan."""
        return self._snapshot

    async def async_get_snapshot(self) -> dict[str, Any]:
        """Return the latest snapshot, scanning on first access."""
        if self._snapshot is None:
            return await self.async_scan()
        return self._snapshot

    def get_details(self, object_type: str, object_id: str) -> dict[str, Any] | None:
        """Return bulky fields of one object from the latest snapshot."""
        if self._snapshot is None:
            return None
        key = f"{object_type}:{object_id}"
        if key in self._details:
            return self._details[key]
        known = any(
            f"{item['object_type']}:{item['object_id']}" == key
            for item in self._snapshot["objects"]
        )
        return {} if known else None

    async def _async_build_snapshot(self, preliminary: bool = False) -> dict[str, Any]:
        # Seconds per phase, in the snapshot and the debug log: the scan runs in the event loop,
        # so a slow phase on a large installation shows here first.
        timing: dict[str, float] = {}
        self._unchecked = set()
        self.scan_coverage.reset()
        mark = time.monotonic()

        def lap(phase: str) -> None:
            nonlocal mark
            now = time.monotonic()
            timing[phase] = round(now - mark, 3)
            mark = now

        entity_registry = er.async_get(self.hass)
        device_registry = dr.async_get(self.hass)
        area_registry = ar.async_get(self.hass)
        floor_registry = fr.async_get(self.hass)
        label_registry = lr.async_get(self.hass)
        config_entries = self.hass.config_entries.async_entries()
        config_entries_by_id = {entry.entry_id: entry for entry in config_entries}
        main_devices = _registry_entries(device_registry.devices)
        child_devices = _registry_entries(getattr(device_registry, "child_devices", ()))
        device_entries = [*main_devices, *child_devices]
        devices_by_id = {device.id: device for device in device_entries}
        # Entities may still name a pre-migration composite device ID that the registry resolves
        # on demand; such a device exists and must not make its entities look orphaned.
        for entry in _registry_entries(entity_registry.entities):
            if (
                entry.device_id
                and entry.device_id not in devices_by_id
                and (resolved := device_registry.async_get(entry.device_id)) is not None
            ):
                devices_by_id[entry.device_id] = resolved
        observed_at = datetime.now(UTC)

        entities = [
            _entity_item(
                entry,
                self.hass.states.get(entry.entity_id),
                config_entries_by_id,
                devices_by_id,
                self.hass.config.components,
            )
            for entry in _registry_entries(entity_registry.entities)
        ]
        lap("entities")
        self.status.update(phase="devices", progress=30)
        await asyncio.sleep(0)

        entity_counts = Counter(item["device_id"] for item in entities if item["device_id"])
        devices = [_device_item(device, entity_counts[device.id]) for device in device_entries]
        areas = [_area_item(area) for area in _registry_entries(area_registry.areas)]
        floors = [_floor_item(floor) for floor in _registry_entries(floor_registry.floors)]
        labels = [_label_item(label) for label in _registry_entries(label_registry.labels)]
        entities_per_entry = Counter(item["config_entry_id"] for item in entities)
        devices_per_entry = Counter(
            entry_id for device in device_entries for entry_id in _device_config_entry_ids(device)
        )
        described = await async_get_integrations(
            self.hass, {entry.domain for entry in config_entries}
        )
        reauth = reauth_entry_ids(self.hass)
        self._reauth_seen = reauth
        integrations = [
            _config_entry_item(
                entry,
                described.get(entry.domain)
                if not isinstance(described.get(entry.domain), BaseException)
                else None,
                entities_per_entry[entry.entry_id],
                devices_per_entry[entry.entry_id],
                entry.entry_id in reauth,
            )
            for entry in config_entries
        ]

        hacs = hacs_by_domain(self.hass)
        if hacs is not None:
            for item in integrations:
                if item["custom"] and item["domain"] in hacs:
                    item["hacs"] = hacs[item["domain"]]
        apps = await _app_inventory(self.hass, self._unchecked)
        self.scan_coverage.checked("registry")
        if not supervisor_token():
            self.scan_coverage.absent("apps", "no_supervisor")
        elif "app" in self._unchecked:
            self.scan_coverage.skipped("apps", "not_reachable")
        else:
            self.scan_coverage.checked("apps")

        lap("devices")
        self.status.update(phase="automations", progress=60)
        await asyncio.sleep(0)
        # One view of what exists for the whole reference analysis of this scan.
        existing_objects = self._existing_objects()
        automations, automation_edges, automation_findings = self._automation_inventory(
            existing_objects
        )
        lap("automations")
        dashboards, dashboard_edges, dashboard_findings = await self._dashboard_inventory(
            existing_objects
        )
        dashboard_count = len(dashboards)
        energy, energy_edges = await self._energy_inventory(existing_objects)
        self.scan_coverage.checked("automations")
        blueprint_files = await self._blueprint_files()
        dashboards.extend(energy)
        dashboard_edges.extend(energy_edges)
        lap("dashboards")
        helper_edges, helper_findings = self._helper_inventory(existing_objects)
        group_edges, group_findings = self._group_inventory(existing_objects)
        known_automation_ids = {item["object_id"] for item in automations}
        automations.extend(
            _fallback_automation_item(state)
            for state in self.hass.states.async_all("automation")
            if state.entity_id not in known_automation_ids
        )

        if not preliminary:
            self.config_changes.update(
                {
                    f"{item['object_type']}.{item['object_id']}": fingerprint(item)
                    for item in automations
                    if item["object_type"] in ("automation", "script")
                    and item.get("source") != "state_fallback"
                },
                observed_at,
            )
        # One update for everything: anything missing from it would be forgotten.
        tracked = (
            [("entity", item) for item in entities]
            + [("automation", item) for item in automations]
            + [("app", item) for item in apps]
            + [("config_entry", item) for item in integrations]
        )
        if not preliminary:
            # An extra period per entity not provided: it survives restarts, which renew the
            # placeholder, and ends as soon as the integration provides the entity again.
            await self.observations.async_update(
                {f"{kind}:{item['object_id']}": _observed_as(item) for kind, item in tracked}
                | {
                    f"{NOT_PROVIDED_KEY}{item['object_id']}": "not_provided"
                    for item in entities
                    if item["reason"] == "not_provided"
                },
                observed_at,
            )
        for kind, item in tracked:
            item["status_since"] = self.observations.since(
                f"{kind}:{item['object_id']}", _observed_as(item)
            )
            if kind == "config_entry":
                item["status_since"] = self.auto_pause.outage_start(
                    item["object_id"], item["status"], item["status_since"]
                )
            if kind == "entity" and item["status"] in ("unavailable", "unknown"):
                item["status_since"], item["status_since_source"] = outage_start(
                    item["status_since"], item.get("last_changed")
                )
                item["had_value"] = self.observations.had_value(f"{kind}:{item['object_id']}")
            if kind == "entity" and item["reason"] == "not_provided":
                item["not_provided_settled"] = _not_provided_settled(
                    self.observations.since(
                        f"{NOT_PROVIDED_KEY}{item['object_id']}", "not_provided"
                    ),
                    observed_at,
                )
        if not preliminary:
            self.stale.observe(
                entities,
                observed_at,
                self._started,
                self._started + timedelta(seconds=WARMUP_SECONDS),
                self.stale_hours,
            )
        self.stale.annotate(entities, observed_at, self.stale_hours)
        statistics = await self._statistics()
        statistic_ids = {item["statistic_id"] for item in statistics}
        for item in entities:
            item["has_statistics"] = item["object_id"] in statistic_ids
        statistic_issues = statistic_continuity(statistics, entities)
        mark_duplicates(entities)
        lap("tracking")

        app_links = app_edges(config_entries, apps)
        edges = (
            _structure_edges(entities, devices, areas)
            + automation_edges
            + dashboard_edges
            + helper_edges
            + group_edges
            + app_links
        )
        objects = (
            entities
            + devices
            + integrations
            + apps
            + areas
            + floors
            + labels
            + automations
            + dashboards
        )
        registry = er.async_get(self.hass)
        for (
            item
        ) in automations:  # automations, scripts and scenes carry their labels on their entity
            if item["object_type"] in ("automation", "script", "scene") and "labels" not in item:
                entry = registry.async_get(item["object_id"])
                item["labels"] = sorted(entry.labels) if entry is not None else []
        entity_by_id = {e["object_id"]: e for e in entities}
        for item in automations:  # what the registry knows of the entity behind it, to show as one
            twin = entity_by_id.get(item["object_id"])
            if twin is not None and item["object_type"] in ("automation", "script", "scene"):
                item["unique_id"] = twin["unique_id"]
                item["platform"] = twin["platform"]
                item["entity_status"] = twin["status"]
                item["entity_reason"] = twin["reason"]
        findings = (
            _entity_findings(entities, observed_at, self.outage_levels)
            + duplicate_findings(
                entities,
                lambda item: _reaches_info(item, observed_at, self.outage_levels),
            )
            + ([] if preliminary else self.stale.findings(entities, observed_at, self.stale_hours))
            + automation_hygiene_findings(automations, observed_at, self.unused_automation_days)
            + automation_findings
            + (
                []
                if preliminary
                else self.criteria.findings(
                    observed_at.date(), {a["object_id"] for a in automations}
                )
            )
            + dashboard_findings
            + helper_findings
            + group_findings
            + stopped_app_findings(apps, integrations, app_links, observed_at, self.outage_levels)
            + ([] if preliminary else missing_blueprint_findings(automations, blueprint_files))
            + (
                []
                if preliminary
                else missing_service_findings(
                    automations,
                    self.hass.services.has_service,
                    {
                        entry.domain
                        for entry in config_entries
                        if entry.disabled_by is None
                        and entry.source != "ignore"
                        and _enum(entry.state) != "loaded"
                    },
                )
            )
            + _config_entry_findings(
                integrations,
                observed_at,
                self.outage_levels,
                self._counts_from(),
                self.auto_pause.outage_starts(),
            )
        )
        findings += device_down_findings(
            entities, devices, findings, observed_at, self.outage_levels
        )

        quarantine = quarantine_entries(self.journal.plans, [*entities, *devices])
        recurring = recurring_devices(
            self.journal.plans,
            [
                (
                    device.id,
                    device.name_by_user or device.name or device.id,
                    {*map(tuple, device.identifiers), *map(tuple, device.connections)},
                )
                for device in main_devices
            ],
        )
        orphaned_statistics = orphan_statistics(
            statistics,
            existing_objects["entity"],
            {edge["target"][7:] for edge in energy_edges},
        )

        entity_registry_entries = er.async_get(self.hass)
        for finding in findings:
            finding["key"] = finding_key(finding)
            self._mark_ignored(finding, entity_registry_entries)
        self._apply_marks(objects, findings)
        blocked = blocked_automation_findings(automations, findings)
        blocked += dead_effect_findings(automations, findings)
        for finding in blocked:
            finding["key"] = finding_key(finding)
            self._mark_ignored(finding, entity_registry_entries)
        findings.extend(blocked)
        # A preliminary scan misses findings: it says nothing about what is away.
        if not preliminary:
            self.ignored.note_seen({f["key"] for f in findings}, datetime.now(UTC))
        # A blocked automation may be switched off by a plan, though its entity is "working".
        stuck = {
            f["object_id"]
            for f in blocked
            if f["rule_id"] == "automation.blocked" and not f.get("ignored")
        }
        for item in entities:
            if item["object_id"] in stuck:
                item["blocked_automation"] = True
        apply_battery_kinds(objects, self.batteries.kinds)
        apply_impact(objects, edges, findings)
        logged = log_facts(self.hass)
        for item in objects:
            if item["object_type"] == "config_entry" and item.get("domain") in logged:
                item["log"] = logged[item["domain"]]
        causes = apply_causes(objects, edges, findings)

        lap("analysis")
        self.status.update(phase="finalizing", progress=90)

        storage = await self.hass.async_add_executor_job(storage_sizes, self.hass)
        try:
            database = await database_summary(self.hass, self.events)
        except Exception:  # noqa: BLE001 - the overview works without the size of the database
            database = None
            self.scan_coverage.skipped("database", "unreadable")
        else:
            if database is None:
                self.scan_coverage.absent("database", "no_recorder")
            else:
                self.scan_coverage.checked("database")

        kinds = Counter(item["object_type"] for item in automations)
        self.scan_coverage.counts(
            "registry", entities=len(entities), devices=len(devices), areas=len(areas)
        )
        self.scan_coverage.counts(
            "automations",
            automations=kinds["automation"],
            scripts=kinds["script"],
            scenes=kinds["scene"],
        )
        self.scan_coverage.counts("dashboards", dashboards=dashboard_count)
        self.scan_coverage.counts("apps", apps=len(apps))
        self.scan_coverage.counts("statistics", statistics=len(statistics))

        lap("finalizing")
        _LOGGER.debug("Scan took %.2f s: %s", sum(timing.values()), timing)
        return {
            "meta": {
                "scan_timing": timing,
                "unchecked": sorted(self._unchecked),
                "repairs": repair_keys(self.hass),
                "coverage": self.scan_coverage.report(),
                "coverage_retry_minutes": RETRY_MINUTES
                if self.retry_runs < RETRY_LIMIT and retryable_gaps(self.scan_coverage.report())
                else 0,
                "storage": storage,
                "database": database,
                "scanned_at": observed_at.isoformat(),
                "read_only": True,
                "preliminary": preliminary,
                "warmup_seconds_left": self.warmup_seconds_left,
                "warmup_booting": self.booting,
                "warmup_pending": self.integrations_pending,
                "warmup_names": self.integrations_loading,
                "warmup_done": self.integrations_done,
                "warmup_total": self.integrations_total,
                "warmup_settling": self.warmup_settling,
                "outage_info_minutes": self.outage_info_minutes,
                "outage_low_hours": self.outage_low_hours,
                "outage_medium_hours": self.outage_medium_hours,
                "outage_high_hours": self.outage_high_hours,
                "unused_automation_days": self.unused_automation_days,
                "ignore_label": IGNORE_LABEL,
                "version": self.version,
                "notify": self.notify.enabled,
                "mcp": self.mcp.meta(),
                "protection": self.protection.mode,
                "protection_rules": protection_rules(),
                "recorder_available": self._recorder_available,
                "orphaned_statistics": len(orphaned_statistics),
                "quarantined": len(quarantine),
                "recurring_devices": len(recurring),
                "quarantine_days": QUARANTINE_DAYS,
                "ha_version": HA_VERSION,
                "hacs_available": hacs is not None,
                "hacs_store": store_kind(self.hass),
                "hacs_housekeeper": hacs.get(DOMAIN) if hacs is not None else None,
                "hacs_removed": [
                    {"id": key, **value}
                    for key, value in sorted(removed_issues(self.hass).items())
                    if not value["ignored"]
                ],
                "scan_interval_hours": self.scan_interval_hours,
                "low_battery_percent": self.low_battery_percent,
                "stale_hours": self.stale_hours,
                "history_days": self.history.retention_days,
                "watch_hours": self.watch_hours,
                "watch": self.watch_summary(),
                "low_batteries": len(low_battery_ids(entities, self.low_battery_percent)),
                "object_count": len(listed_objects(objects)),
                "status_counts": dict(Counter(item["status"] for item in listed_objects(objects))),
                "marked_status_counts": marked_status_counts(objects),
                "type_counts": dict(
                    Counter(item["object_type"] for item in listed_objects(objects))
                ),
                "vacation": self.vacation_meta(findings),
                "exception_rules": len(self.exceptions.rules),
            },
            "objects": objects,
            "edges": edges,
            "findings": findings,
            "causes": causes,
            "reminders": self.reminders.view(datetime.now(UTC).date()),
            "notes": self.notes.view(),
            "regressions": [],
            "criteria_alerts": [],
            "orphaned_statistics": orphaned_statistics,
            "statistic_issues": statistic_issues,
            "quarantine": quarantine,
            "recurring_devices": recurring,
        }

    def _ignored_by(self, finding: dict[str, Any], registry: Any) -> str | None:
        """Return why a finding is hidden: by the user, or by the ignore label."""
        if self.ignored.is_ignored(finding["key"]):
            return "user"
        entry = registry.async_get(finding["object_id"])
        if entry is not None and IGNORE_LABEL in entry.labels:
            return "label"
        # The label on a device also hides the device's own findings and those of its entities.
        device_id = entry.device_id if entry is not None else finding["object_id"]
        device = dr.async_get(self.hass).async_get(device_id) if device_id else None
        if device is not None and IGNORE_LABEL in device.labels:
            return "label"
        return None

    def _mark_ignored(self, finding: dict[str, Any], registry: Any) -> None:
        """Set what hides a finding, the decision behind it and whether one ran out."""
        finding["ignored_by"] = self._ignored_by(finding, registry)
        finding["ignore_rule"] = None
        finding["rule_due"] = False
        if finding["ignored_by"] is None:
            self._apply_exception(finding)
        finding["ignored"] = finding["ignored_by"] is not None
        info = self.ignored.info(finding["key"])
        finding["ignore_info"] = info if finding["ignored_by"] == "user" else None
        finding["resurfaced"] = not finding["ignored"] and self.ignored.is_due(finding["key"])

    def _apply_exception(self, finding: dict[str, Any]) -> None:
        """Let the exception rules hide or hold back a finding, or mark it as due after a delay."""
        if not self.exceptions.rules:
            return
        if finding["rule_id"] == "config_entry.not_loaded":
            found = entry_traits(self.hass, finding["object_id"])
        else:
            kind = "entity" if "." in finding["object_id"] else "device"
            found = traits(self.hass, kind, finding["object_id"])
        if found is None:
            return
        result = verdict(
            self.exceptions.rules, found, finding, datetime.now(UTC), self.exceptions.vacation()
        )
        if result is None:
            return
        finding["ignore_rule"] = {
            **result["rule"],
            "until": result["until"],
            "phase": result["phase"],
        }
        if result["state"] == "due":
            finding["rule_due"] = True
        else:
            finding["ignored_by"] = "rule"

    def _mark_excepted(self, objects: list[dict[str, Any]]) -> None:
        """Flag the objects a hiding rule covers, so lists and cleanup plans leave them out."""
        vacation = self.exceptions.active()
        hiding = [
            r
            for r in self.exceptions.rules
            if r["action"] == "hide" and (r["scope"] == "always" or vacation)
        ]
        for item in objects:
            found = traits(self.hass, item["object_type"], item["object_id"]) if hiding else None
            item["excepted"] = bool(found) and any(r["enabled"] and _hits(r, found) for r in hiding)

    def vacation_meta(self, findings: list[dict[str, Any]]) -> dict[str, Any] | None:
        """What the panel shows about the vacation mode; None while no switch is chosen."""
        store = self.exceptions
        if not store.entity:
            return None
        held = [
            f
            for f in findings
            if f.get("ignored_by") == "rule"
            and (f.get("ignore_rule") or {}).get("phase") in ("vacation", "after")
        ]
        state = store.switch_state()
        after = [f for f in held if f["ignore_rule"]["phase"] == "after"]
        return {
            "entity": store.entity,
            "keyword": store.keyword,
            "active": store.active(),
            "missing": state in (None, "unavailable", "unknown"),
            "ended_at": store.ended_at.isoformat() if store.ended_at else None,
            "grace_hours": store.grace_hours,
            "held": len(held),
            # Whether anything can be held back at all: the rules that apply only in the vacation mode.
            "rules": sum(
                1 for r in store.rules if r.get("scope") == "vacation" and r.get("enabled", True)
            ),
            "after_until": max((f["ignore_rule"]["until"] for f in after), default=None),
        }

    def set_vacation(self, entity: str | None, grace_hours: int, keyword: str = "") -> str | None:
        """Choose the vacation switch, its keyword and the grace period; the failure, or None."""
        if (
            error := self.exceptions.set_vacation(entity, grace_hours, datetime.now(UTC), keyword)
        ) is not None:
            return error
        self._refresh_marks()
        if self.vacation_hook is not None:
            self.vacation_hook()
        return None

    @callback
    def vacation_changed(self) -> None:
        """The vacation switch moved: look at every finding again, without a scan."""
        if self.exceptions.sync(datetime.now(UTC)) or self.exceptions.entity:
            self._refresh_marks()

    def set_exceptions(self, rules: list[Any]) -> str | None:
        """Replace the exception rules and bring the cached snapshot up to date; the failure, or None."""
        if (error := self.exceptions.set_rules(rules)) is not None:
            return error
        self._refresh_marks()
        return None

    def set_finding_ignored(
        self,
        key: str,
        ignored: bool,
        *,
        kind: str = "ignore",
        reason: str = "",
        days: int | None = None,
        by: str | None = None,
        via: str | None = None,
    ) -> bool:
        """Hide or show one finding in the stored state and the cached snapshot.

        ``kind`` and ``reason`` say what was decided and why; ``days`` how long it holds.
        A policy violation (key ``policy.<rule>|...``) or a conflict (``conflict.<kind>|...``) is no finding: only the ignore list changes.
        """
        now = datetime.now(UTC)

        def store() -> bool:
            if not ignored:
                self.ignored.set_ignored(key, False, now)
                return True
            until = now + timedelta(days=days) if days else None
            return self.ignored.decide(key, kind, now, reason=reason, until=until, by=by, via=via)

        # A decision whose finding is away right now (it rests) can be changed or taken away as well.
        if key.startswith((POLICY_KEY_PREFIX, CONFLICT_KEY_PREFIX)) or (
            self.ignored.entry(key) is not None
            and not any(f["key"] == key for f in (self._snapshot or {}).get("findings", []))
        ):
            return store()
        finding = next(
            (f for f in (self._snapshot or {}).get("findings", []) if f["key"] == key), None
        )
        if finding is None:
            return False
        if not store():
            return False
        self._refresh_finding(finding)
        return True

    def restore_decision(self, key: str, entry: dict[str, Any] | None) -> None:
        """Put the decision about a finding back as it was (``None``: there was none)."""
        self.ignored.restore(key, entry)
        finding = next(
            (f for f in (self._snapshot or {}).get("findings", []) if f["key"] == key), None
        )
        if finding is not None:
            self._refresh_finding(finding)

    def _refresh_finding(self, finding: dict[str, Any]) -> None:
        assert self._snapshot is not None
        self._mark_ignored(finding, er.async_get(self.hass))
        self._snapshot["causes"] = apply_causes(
            self._snapshot["objects"], self._snapshot["edges"], self._snapshot["findings"]
        )
        self._sync_issues(self._snapshot)
        async_dispatcher_send(self.hass, SIGNAL_SCAN_COMPLETE)

    def set_mark(
        self,
        object_type: str,
        object_id: str,
        kind: str,
        *,
        reason: str = "",
        days: int | None = None,
        target: str | None = None,
        by: str | None = None,
        window: dict[str, str] | None = None,
        grace: int = GRACE_DEFAULT,
        via: str | None = None,
    ) -> str | None:
        """Mark an entity, device, integration or app; the reason it failed, or None."""
        if kind not in KINDS_OF.get(object_type, KINDS):
            return "kind_not_allowed"
        if window is not None and (kind not in HIDING_KINDS or clean_window(window) is None):
            return "window_invalid"
        snapshot = self._snapshot or {}
        known = {(item["object_type"], item["object_id"]) for item in snapshot.get("objects", [])}
        if (object_type, object_id) not in known:
            return "not_found"
        if target and (object_type, target) not in known:
            return "target_unknown"
        now = datetime.now(UTC)
        until = now + timedelta(days=days) if days else None
        if not self.marks.set(
            mark_key(object_type, object_id),
            kind,
            now,
            reason=reason,
            until=until,
            target=target,
            by=by,
            window=window,
            grace=grace,
            via=via,
        ):
            return "too_many"
        self._refresh_marks()
        return None

    def restore_mark(self, object_type: str, object_id: str, entry: dict[str, Any] | None) -> None:
        """Put the mark of an object back as it was (``None``: there was none)."""
        self.marks.restore(mark_key(object_type, object_id), entry)
        self._refresh_marks()

    async def set_stale_limit(self, entity_id: str, hours: int | None) -> str | None:
        """Set the "no new report" limit of one sensor (0 = off, ``None`` = default); the failure, or None."""
        known = {
            item["object_id"]
            for item in (self._snapshot or {}).get("objects", [])
            if item["object_type"] == "entity"
        }
        if entity_id not in known:
            return "not_found"
        if not self.stale.set_limit(entity_id, hours):
            return "too_many"
        await self.async_scan()
        return None

    def clear_mark(self, object_type: str, object_id: str) -> bool:
        """Take a mark away again."""
        if not self.marks.clear(mark_key(object_type, object_id)):
            return False
        self._refresh_marks()
        return True

    def set_battery_kinds(self, items: list[tuple[str, str]]) -> None:
        """Store the kinds of battery sensors and bring the cached snapshot and its count up to date."""
        self.batteries.set_kinds(items)
        snapshot = self._snapshot
        if not snapshot:
            return
        apply_battery_kinds(snapshot["objects"], self.batteries.kinds)
        # The forecast was read for the sensors of the time before; the next one reads them anew.
        self.hass.data.get(DOMAIN, {}).get("query_cache", {}).pop("battery_trend", None)
        entities = [o for o in snapshot["objects"] if o["object_type"] == "entity"]
        snapshot["meta"]["low_batteries"] = len(low_battery_ids(entities, self.low_battery_percent))
        async_dispatcher_send(self.hass, SIGNAL_SCAN_COMPLETE)

    def _sun(self) -> tuple[bool, datetime] | None:
        """``(below the horizon, since)`` from ``sun.sun``; None when it is missing or unknown."""
        state = self.hass.states.get("sun.sun")
        if state is None or state.state not in ("above_horizon", "below_horizon"):
            return None
        return state.state == "below_horizon", state.last_changed

    def _counts_from(self) -> dict[str, datetime]:
        """Per integration with a mark window: when its outage starts to count (see ``counts_from``)."""
        sun, local = self._sun(), dt_util.now()
        result = {}
        for key, mark in self.marks.items.items():
            if not key.startswith("config_entry:") or mark["kind"] not in HIDING_KINDS:
                continue
            if counted := counts_from(mark, local, sun):
                result[key.split(":", 1)[1]] = counted
        return result

    def _window_states(self, sun: tuple[bool, datetime] | None) -> dict[str, bool]:
        local = dt_util.now()
        return {
            key: window_active(mark, local, sun)
            for key, mark in self.marks.items.items()
            if mark.get("window")
        }

    def _apply_marks(self, objects: list[dict[str, Any]], findings: list[dict[str, Any]]) -> None:
        sun = self._sun()
        apply_marks(objects, findings, self.marks.items, sun=sun)
        self._mark_excepted(objects)
        self._window_seen = self._window_states(sun)

    @callback
    def refresh_marks_on_window_change(self) -> bool:
        """Bring the findings up to date when a mark window opened or closed; no scan is needed.

        True when the window of an integration closed: its outage is graded at the scan, so the
        caller asks for one.
        """
        if not self._snapshot:
            return False
        states = self._window_states(self._sun())
        if states == self._window_seen:
            return False
        closed = any(
            key.startswith("config_entry:") and self._window_seen.get(key) and not active
            for key, active in states.items()
        )
        self._refresh_marks()
        return closed

    def _refresh_marks(self) -> None:
        """Bring the objects and findings of the cached snapshot up to date with the marks."""
        snapshot = self._snapshot
        if not snapshot:
            return
        registry = er.async_get(self.hass)
        for finding in snapshot["findings"]:
            self._mark_ignored(finding, registry)
        self._apply_marks(snapshot["objects"], snapshot["findings"])
        snapshot["meta"]["vacation"] = self.vacation_meta(snapshot["findings"])
        snapshot["meta"]["marked_status_counts"] = marked_status_counts(snapshot["objects"])
        snapshot["causes"] = apply_causes(
            snapshot["objects"], snapshot["edges"], snapshot["findings"]
        )
        self._sync_issues(snapshot)
        async_dispatcher_send(self.hass, SIGNAL_SCAN_COMPLETE)

    def _existing_objects(self) -> dict[str, set[str]]:
        """Collect the IDs a reference may legitimately point to."""
        registries = {
            "devices": dr.async_get(self.hass),
            "areas": ar.async_get(self.hass),
            "floors": fr.async_get(self.hass),
            "labels": lr.async_get(self.hass),
        }
        existing = {
            "entity": {
                entry.entity_id for entry in _registry_entries(er.async_get(self.hass).entities)
            }
            | {state.entity_id for state in self.hass.states.async_all()},
            "device": _DeviceIds(registries["devices"]),
            "area": {entry.id for entry in _registry_entries(registries["areas"].areas)},
            "floor": {entry.floor_id for entry in _registry_entries(registries["floors"].floors)},
            "label": {entry.label_id for entry in _registry_entries(registries["labels"].labels)},
        }
        # Without a readable tag store there is no "tag" key, so nothing is reported as missing.
        tags = getattr(self.hass.data.get("tag"), "data", None)
        if isinstance(tags, dict):
            existing["tag"] = {str(tag_id) for tag_id in tags}
        return existing

    async def _blueprint_files(self) -> dict[str, set[str]] | None:
        """The paths of every blueprint file, or None where they cannot be read (a gap, not "gone")."""
        if "blueprint" not in self.hass.config.components:
            self.scan_coverage.absent("blueprints", "not_set_up")
            return None
        try:
            available = await async_available(self.hass)
        except Exception as err:
            _LOGGER.debug("The blueprint files could not be read: %s", type(err).__name__)
            self.scan_coverage.skipped("blueprints", "unreadable")
            return None
        self.scan_coverage.checked("blueprints")
        return {domain: set(files) for domain, files in available.items()}

    def _runtime_component(self, domain: str) -> Any | None:
        """Return a loaded entity component such as automation or script."""
        try:
            module = __import__(f"homeassistant.components.{domain}", fromlist=["DATA_COMPONENT"])
        except ImportError:
            return None
        return self.hass.data.get(getattr(module, "DATA_COMPONENT", domain))

    def _config_object_inventory(
        self,
        domain: str,
        summarize: Any,
        existing: dict[str, set[str]],
    ) -> tuple[list[dict[str, Any]], list[dict[str, str]], list[dict[str, Any]]]:
        """Inspect automations or scripts through Home Assistant runtime APIs."""
        component = self._runtime_component(domain)
        if component is None:
            if domain in self.hass.config.components:
                self.scan_coverage.skipped("automations", f"{domain}_not_ready")
            return [], [], []

        items: list[dict[str, Any]] = []
        edges: list[dict[str, str]] = []
        findings: list[dict[str, Any]] = []

        for entity in component.entities:
            entity_id = entity.entity_id
            state = self.hass.states.get(entity_id)
            summary = summarize(getattr(entity, "raw_config", None))
            references = summary["references"]

            # HA's runtime extraction also detects references inside templates.
            explicit_markers = {(ref["kind"], ref["object_id"]) for ref in references}
            runtime_sets = {
                kind: _runtime_references(entity, attr)
                for kind, attr in (
                    ("entity", "referenced_entities"),
                    ("device", "referenced_devices"),
                    ("area", "referenced_areas"),
                    ("floor", "referenced_floors"),
                    ("label", "referenced_labels"),
                )
            }
            for kind, object_ids in runtime_sets.items():
                for object_id in object_ids:
                    # Home Assistant may hand over unevaluated Template objects here.
                    if is_concrete_id(object_id) and (kind, object_id) not in explicit_markers:
                        references.append(
                            {
                                "kind": kind,
                                "object_id": object_id,
                                "relation": "REFERENCES",
                                "location": "runtime_extraction",
                                "confidence": "probable",
                            }
                        )

            edges.extend(
                {
                    "source": f"{domain}:{entity_id}",
                    "target": f"{reference['kind']}:{reference['object_id']}",
                    "relation": reference["relation"],
                    "confidence": reference["confidence"],
                    "location": reference["location"],
                }
                for reference in references
            )

            missing = missing_references(references, existing)
            findings.extend(_missing_findings(domain, entity_id, missing, existing["entity"]))
            self._created_scenes |= runtime_scene_ids(getattr(entity, "raw_config", None))

            attrs = state.attributes if state else {}
            blueprint = blueprint_path(entity)
            item = {
                "object_type": domain,
                "object_id": entity_id,
                "name": getattr(entity, "name", None) or attrs.get("friendly_name", entity_id),
                "status": "unavailable"
                if state is None or state.state == "unavailable"
                else ("active" if state.state == "on" or domain == "script" else "disabled"),
                "state": state.state if state else None,
                "source": "blueprint" if blueprint else "home_assistant_runtime",
                "blueprint": blueprint,
                "missing_reference_count": len(missing),
                "last_triggered": _iso(attrs.get("last_triggered")),
                **summary,
            }
            if domain == "automation":
                registry_entry = er.async_get(self.hass).async_get(entity_id)
                item.update(
                    {
                        "created_at": _iso(getattr(registry_entry, "created_at", None)),
                        "automation_id": getattr(entity, "unique_id", None),
                        "mode": attrs.get("mode"),
                        "current": attrs.get("current", 0),
                        "max": attrs.get("max"),
                    }
                )
            else:
                item["mode"] = attrs.get("mode")
            items.append(item)

        return items, edges, findings

    def _automation_inventory(
        self, existing: dict[str, set[str]]
    ) -> tuple[list[dict[str, Any]], list[dict[str, str]], list[dict[str, Any]]]:
        """Inspect automations, scripts and scenes."""
        self._created_scenes: set[str] = set()
        automations, edges, findings = self._config_object_inventory(
            "automation", summarize_automation_config, existing
        )
        scripts, script_edges, script_findings = self._config_object_inventory(
            "script", summarize_script_config, existing
        )
        scenes, scene_edges, scene_findings = self._scene_inventory(existing)
        all_findings = findings + script_findings + scene_findings
        for finding in all_findings:
            if finding.get("affected_object") in self._created_scenes:
                finding["runtime_created"] = True
        return (
            automations + scripts + scenes,
            edges + script_edges + scene_edges,
            all_findings,
        )

    def _helper_inventory(
        self, existing: dict[str, set[str]]
    ) -> tuple[list[dict[str, str]], list[dict[str, Any]]]:
        """Link helper config entries (template, derivative, ...) to the entities they use."""
        edges: list[dict[str, str]] = []
        findings: list[dict[str, Any]] = []
        for entry in self.hass.config_entries.async_entries():
            if entry.domain not in HELPER_DOMAINS:
                continue
            references = extract_helper_references(dict(entry.options), existing["entity"])
            edges.extend(
                {
                    "source": f"config_entry:{entry.entry_id}",
                    "target": f"entity:{reference['object_id']}",
                    "relation": reference["relation"],
                    "confidence": reference["confidence"],
                    "location": reference["location"],
                }
                for reference in references
            )
            findings.extend(
                _missing_findings(
                    "config_entry",
                    entry.entry_id,
                    missing_references(references, existing),
                    existing["entity"],
                )
            )
        return edges, findings

    def _group_inventory(
        self, existing: dict[str, set[str]]
    ) -> tuple[list[dict[str, str]], list[dict[str, Any]]]:
        """Link groups (any entity listing members in ``entity_id``) to their members."""
        edges: list[dict[str, str]] = []
        findings: list[dict[str, Any]] = []
        for state in self.hass.states.async_all():
            if state.domain in {"automation", "script", "scene"}:
                continue
            members = state.attributes.get("entity_id")
            if not isinstance(members, (list, tuple)) or not all(
                isinstance(member, str) for member in members
            ):
                continue
            references = [
                {
                    "kind": "entity",
                    "object_id": member,
                    "relation": "INCLUDES",
                    "location": "entity_id",
                    "confidence": "certain",
                }
                for member in members
            ]
            edges.extend(
                {
                    "source": f"entity:{state.entity_id}",
                    "target": f"entity:{reference['object_id']}",
                    "relation": reference["relation"],
                    "confidence": reference["confidence"],
                    "location": reference["location"],
                }
                for reference in references
            )
            for reference in missing_references(references, existing):
                findings.append(
                    {
                        "rule_id": "entity.missing_member",
                        "object_id": state.entity_id,
                        "classification": "broken_reference",
                        "confidence": 0.9,
                        "first_detected_at": None,
                        "affected_object": reference["object_id"],
                        "evidence": [
                            {
                                "kind": "missing_reference",
                                "source": "group_members",
                                "location": "entity_id",
                            }
                        ],
                    }
                )
        return edges, findings

    async def _statistics(self) -> list[dict[str, Any]]:
        """Long-term statistics known to the recorder; empty without a recorder."""
        self._recorder_available = False
        if "recorder" not in self.hass.config.components:
            self.scan_coverage.absent("statistics", "no_recorder")
            return []
        try:
            from homeassistant.components.recorder.statistics import async_list_statistic_ids

            statistics = await async_list_statistic_ids(self.hass)
        except Exception:  # The recorder may be unavailable or still starting.
            self.scan_coverage.skipped("statistics", "not_ready")
            return []
        self._recorder_available = True
        self.scan_coverage.checked("statistics")
        return list(statistics)

    async def _energy_inventory(
        self, existing: dict[str, set[str]]
    ) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
        """Describe the Energy dashboard through the entities its preferences use."""
        if "energy" not in self.hass.config.components:
            self.scan_coverage.absent("energy", "not_set_up")
            return [], []
        try:
            from homeassistant.components.energy.data import async_get_manager

            manager = await async_get_manager(self.hass)
            preferences = manager.data
        except Exception:  # Energy is optional and may not be configured.
            self._unchecked.add("dashboard:energy")
            self.scan_coverage.skipped("energy", "unreadable")
            return [], []
        self.scan_coverage.checked("energy")
        references = extract_entity_references(
            preferences, existing["entity"], ENERGY_KEYS, "SHOWS"
        )
        if not references:
            return [], []
        edges = [
            {
                "source": "dashboard:energy",
                "target": f"entity:{reference['object_id']}",
                "relation": "SHOWS",
                "confidence": reference["confidence"],
                "location": reference["location"],
            }
            for reference in references
        ]
        dashboard = {
            "object_type": "dashboard",
            "object_id": "energy",
            "name": "Energy",
            "url_path": "energy",
            "mode": "energy",
            "view_count": 0,
            "entity_count": len({reference["object_id"] for reference in references}),
            "missing_reference_count": 0,
            "status": "active",
            "references": references,
        }
        return [dashboard], edges

    async def _dashboard_inventory(
        self, existing: dict[str, set[str]]
    ) -> tuple[list[dict[str, Any]], list[dict[str, str]], list[dict[str, Any]]]:
        """Read dashboard configurations and link the entities they show."""
        try:
            from homeassistant.components.lovelace.const import LOVELACE_DATA
        except ImportError:
            self._unchecked.add("dashboard")
            self.scan_coverage.skipped("dashboards", "unavailable")
            return [], [], []
        lovelace = self.hass.data.get(LOVELACE_DATA)
        if lovelace is None:
            self._unchecked.add("dashboard")
            self.scan_coverage.skipped("dashboards", "not_ready")
            return [], [], []

        dashboards: list[dict[str, Any]] = []
        edges: list[dict[str, str]] = []
        findings: list[dict[str, Any]] = []
        configs: dict[str, Any] = {}
        unreadable: list[dict[str, str]] = []
        for url_path, dashboard in lovelace.dashboards.items():
            try:
                config = await dashboard.async_load(False)
            except Exception as err:  # Missing or invalid dashboards have nothing to read.
                # One that had findings before and cannot be read now has not become clean.
                self._unchecked.add(f"dashboard:{url_path or 'lovelace'}")
                reason = _dashboard_failure(err)
                if reason != "auto_generated":  # Nothing was saved, so there is nothing to miss.
                    unreadable.append({"id": url_path or "lovelace", "reason": reason})
                continue
            object_id = url_path or "lovelace"
            configs[object_id] = config
            references = extract_dashboard_references(config, existing["entity"])
            edges.extend(
                {
                    "source": f"dashboard:{object_id}",
                    "target": f"entity:{reference['object_id']}",
                    "relation": reference["relation"],
                    "confidence": reference["confidence"],
                    "location": reference["location"],
                }
                for reference in references
            )
            missing = missing_references(references, existing)
            broken = _missing_findings("dashboard", object_id, missing, existing["entity"])
            annotate_findings(broken, config, references)
            findings.extend(broken)
            settings = getattr(dashboard, "config", None) or {}
            views = config.get("views") if isinstance(config.get("views"), list) else []
            dashboards.append(
                {
                    "object_type": "dashboard",
                    "object_id": object_id,
                    "name": settings.get("title") or config.get("title") or object_id,
                    "url_path": url_path,
                    "mode": getattr(dashboard, "mode", None),
                    "view_count": len(views),
                    "entity_count": len({ref["object_id"] for ref in references}),
                    "missing_reference_count": len(missing),
                    "status": "active",
                    "references": references,
                }
            )
        views_of = {
            object_id: {
                key
                for index, view in enumerate(config.get("views") or [])
                for key in view_keys(view, index)
            }
            for object_id, config in configs.items()
            if isinstance(config.get("views"), list)
        }
        try:
            resources: int | None = len(lovelace.resources.async_items())
        except Exception:  # noqa: BLE001 - unknown resources only switch one check off
            resources = None
        for item in dashboards:
            item["health"] = dashboard_health(configs[item["object_id"]], views_of, resources)
        if unreadable:
            self.scan_coverage.partial(
                "dashboards",
                "unreadable",
                read=len(dashboards),
                failed=len(unreadable),
                items=unreadable,
            )
        elif resources is None:
            self.scan_coverage.partial("dashboards", "resources_unknown")
        else:
            self.scan_coverage.checked("dashboards")
        return dashboards, edges, findings

    def _scene_inventory(
        self, existing: dict[str, set[str]]
    ) -> tuple[list[dict[str, Any]], list[dict[str, str]], list[dict[str, Any]]]:
        """Describe scenes through the entities listed in their state attributes."""
        scenes: list[dict[str, Any]] = []
        edges: list[dict[str, str]] = []
        findings: list[dict[str, Any]] = []
        registry = er.async_get(self.hass)
        for state in self.hass.states.async_all("scene"):
            registry_entry = registry.async_get(state.entity_id)
            listed = state.attributes.get("entity_id", ())
            # A scene from a custom integration may list anything; only names can be linked.
            entity_ids = [
                value
                for value in (listed if isinstance(listed, (list, tuple)) else ())
                if value and isinstance(value, str)
            ]
            references = [
                {
                    "kind": "entity",
                    "object_id": entity_id,
                    "relation": "TARGETS",
                    "location": "entities",
                    "confidence": "certain",
                }
                for entity_id in entity_ids
            ]
            edges.extend(
                {
                    "source": f"scene:{state.entity_id}",
                    "target": f"entity:{reference['object_id']}",
                    "relation": reference["relation"],
                    "confidence": reference["confidence"],
                    "location": reference["location"],
                }
                for reference in references
            )
            missing = missing_references(references, existing)
            findings.extend(
                _missing_findings("scene", state.entity_id, missing, existing["entity"])
            )
            scenes.append(
                {
                    "object_type": "scene",
                    "object_id": state.entity_id,
                    "name": state.attributes.get("friendly_name", state.entity_id),
                    "status": "unavailable" if state.state == "unavailable" else "active",
                    "state": state.state,
                    "scene_id": state.attributes.get("id"),
                    "device_id": registry_entry.device_id if registry_entry else None,
                    "entities": entity_ids,
                    "entity_count": len(entity_ids),
                    "missing_reference_count": len(missing),
                    "references": references,
                }
            )
        return scenes, edges, findings
