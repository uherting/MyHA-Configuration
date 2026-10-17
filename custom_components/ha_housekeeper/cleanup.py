"""Cleanup plans: a dry run that judges candidates, and the journal that records every plan.

Nothing in this module changes Home Assistant. Executing a confirmed plan lives in
``cleanup_exec`` so that all writes stay in one small, reviewable place.
"""

from __future__ import annotations

import hashlib
import json
import secrets
from collections.abc import Callable
from datetime import UTC, datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from . import followup
from .const import IGNORE_LABEL, JOURNAL_STORAGE_KEY, QUARANTINE_DAYS, STORAGE_VERSION
from .simulation import simulate

USAGE_RELATIONS = frozenset(
    {"TRIGGERS_ON", "USES_AS_CONDITION", "TARGETS", "REFERENCES", "SHOWS", "INCLUDES"}
)
ENTITY_KINDS = frozenset({"disable_entity", "remove_entity"})
DEVICE_KINDS = frozenset({"disable_device", "remove_device", "forget_device"})
REFERENCE_KINDS = frozenset({"replace_references"})
RENAME_KINDS = frozenset({"rename_entity"})  # a new entity ID, with every reference carried along
METER_KINDS = frozenset({"migrate_meter"})
METER_MODES = ("both", "statistics", "id")
PURGE_KINDS = frozenset({"purge_statistics"})
DELETE_CANDIDATE_RULES = frozenset(
    {"automation.never_triggered", "automation.stale", "automation.disabled_long"}
)
TRIM_KINDS = frozenset({"trim_history"})  # deletes old state rows of one entity; statistics stay
TRIM_DAYS = (1, 3650)
DELETE_BACKUP_KINDS = frozenset({"delete_backup"})  # deletes one of Housekeeper's own backups
DELETE_AUTOMATION_KINDS = frozenset(
    {"delete_automation"}
)  # removes one automation from its YAML file
REPAIR_KINDS = frozenset({"repair_counter", "repair_range"})
LABEL_KINDS = frozenset({"add_label"})  # adds one existing label to an entity; Home Assistant only
AREA_KINDS = frozenset({"set_area"})  # gives an entity or device without an area an existing one
# Switches one entity between enabled and disabled or visible and hidden; the target says which way.
STATE_KINDS = frozenset({"set_entity_state"})
STATE_TARGETS = ("disable", "enable", "hide", "unhide")
# What happens to the recorder rows of a removed entity: nothing, its statistics, or also its states.
RECORDER_CHOICES = ("keep", "statistics", "states")
REFACTOR_KINDS = frozenset({"refactor_automation"})
ACTION_KINDS = (
    ENTITY_KINDS
    | DEVICE_KINDS
    | REFERENCE_KINDS
    | RENAME_KINDS
    | METER_KINDS
    | PURGE_KINDS
    | TRIM_KINDS
    | DELETE_BACKUP_KINDS
    | DELETE_AUTOMATION_KINDS
    | REFACTOR_KINDS
    | REPAIR_KINDS
    | LABEL_KINDS
    | AREA_KINDS
    | STATE_KINDS
)
# Disabling is the quarantine; removing is only allowed after a full quarantine period.
EXECUTABLE_KINDS = ACTION_KINDS
# Kinds that cannot simply be switched back: a verified backup is created before they run.
BACKUP_KINDS = frozenset(
    {
        "remove_entity",
        "remove_device",
        "forget_device",
        "replace_references",
        "rename_entity",
        "migrate_meter",
        "purge_statistics",
        "trim_history",
        "delete_automation",
        "refactor_automation",
        "repair_counter",
        "repair_range",
    }
)
# Kinds that always write into the recorder database. Removal actions additionally require it
# when their optional ``recorder`` deletion is selected.
DATABASE_KINDS = frozenset(
    {"repair_counter", "repair_range", "purge_statistics", "trim_history", "migrate_meter"}
)
# Kinds that remove something: they get the strongest confirmation word.
REMOVAL_KINDS = frozenset({"remove_entity", "remove_device", "forget_device"})
QUARANTINE_KINDS = {"disable_entity": "entity", "disable_device": "device"}
REMOVABLE_STATUSES = frozenset({"orphaned", "unavailable", "unknown", "disabled"})
DISABLEABLE_STATUSES = frozenset({"orphaned", "unavailable", "unknown"})
PLAN_MAX_AGE_HOURS = 24
MAX_ACTIONS = 200
# Only previews that were never started are limited by number; they cannot be confirmed after
# PLAN_MAX_AGE_HOURS anyway. Plans that ran are never dropped by position (their data is needed for
# undo, restore and the start of the quarantine); when the journal grows too large the oldest ones
# lose their whole-file copies instead.
MAX_OPEN_PREVIEWS = 20
MAX_PURGES = 100  # recorder purges kept in the journal
JOURNAL_MAX_BYTES = 8 * 1024 * 1024
JOURNAL_KEEP_DAYS = 365  # plans that ran and ended longer ago than this are dropped ...
JOURNAL_MAX_PLANS = 300  # ... and the oldest of them once there are more plans than this
SAVE_DELAY = 5


def _enum_value(value: Any) -> Any:
    return getattr(value, "value", value)


def registry_fingerprint(entry: Any) -> str:
    """Short hash of the registry fields a cleanup action must find unchanged."""
    fields = [
        entry.entity_id,
        entry.unique_id,
        entry.platform,
        entry.config_entry_id,
        entry.device_id,
        entry.area_id,
        entry.name,
        sorted(entry.labels),
        _enum_value(entry.disabled_by),
        _enum_value(entry.hidden_by),
        _enum_value(entry.entity_category),
    ]
    return hashlib.sha256(json.dumps(fields, default=str).encode()).hexdigest()[:16]


def is_child_device(entry: Any) -> bool:
    """Whether a device registry entry is a child device (it has no ``connections`` and so on)."""
    return getattr(entry, "parent_device_id", None) is not None


def get_main_device(registry: Any, device_id: str) -> Any | None:
    """The regular device with this ID; child devices and pre-migration composite IDs are None."""
    try:
        return registry.async_get(
            device_id, include_child_devices=False, include_composite_devices=False
        )
    except TypeError:  # a Home Assistant without these options
        entry = registry.async_get(device_id)
        return None if entry is None or is_child_device(entry) else entry


def device_fingerprint(entry: Any) -> str:
    """Short hash of the device registry fields a cleanup action must find unchanged."""
    if is_child_device(entry):
        fields: list[Any] = [
            entry.id,
            sorted(map(list, entry.identifiers)),
            [entry.config_entry_id],
            entry.parent_device_id,
            entry.area_id,
            entry.name,
            entry.name_by_user,
            sorted(entry.labels),
            _enum_value(entry.disabled_by),
        ]
    else:
        fields = [
            entry.id,
            sorted(map(list, entry.identifiers)),
            sorted(map(list, entry.connections)),
            [entry.config_entry_id],  # as the sorted list of one that earlier versions hashed
            entry.area_id,
            entry.name,
            entry.name_by_user,
            sorted(entry.labels),
            _enum_value(entry.disabled_by),
            entry.via_device_id,
            entry.manufacturer,
            entry.model,
        ]
    return hashlib.sha256(json.dumps(fields, default=str).encode()).hexdigest()[:16]


def device_support(hass: HomeAssistant, entry: Any) -> dict[str, Any]:
    """Whether the integration behind a device offers regular removal, and could restore it."""
    if is_child_device(entry):
        return {"removal_supported": False, "restorable": False}
    config_entry = hass.config_entries.async_get_entry(entry.config_entry_id)
    return {
        "removal_supported": config_entry is not None and config_entry.supports_remove_device,
        "restorable": config_entry is not None,
    }


def quarantine_entries(
    plans: list[dict[str, Any]], items: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    """Entities and devices Housekeeper quarantined that are still disabled by the user.

    The journal says when something was disabled; the live inventory says whether it still
    is. Items that were re-enabled, undone or removed since are no longer in quarantine.
    """
    live = {(item.get("object_type", "entity"), item["object_id"]): item for item in items}
    latest: dict[tuple[str, str], dict[str, Any]] = {}
    for plan in plans:
        for action in plan.get("actions", []):
            result = action.get("result") or {}
            object_type = QUARANTINE_KINDS.get(action["kind"])
            if object_type is None or result.get("state") != "done":
                continue
            key = (object_type, action["object_id"])
            current = latest.get(key)
            if current is None or result["at"] > current["since"]:
                latest[key] = {
                    "object_type": object_type,
                    "object_id": action["object_id"],
                    "plan_id": plan["plan_id"],
                    "since": result["at"],
                }
    return sorted(
        (
            entry
            for key, entry in latest.items()
            if (item := live.get(key)) and item.get("disabled_by") == "user"
        ),
        key=lambda entry: entry["since"],
    )


def recurring_devices(
    plans: list[dict[str, Any]], devices: list[tuple[str, str, set[Any]]]
) -> list[dict[str, Any]]:
    """Devices that an integration created again after Housekeeper made Home Assistant forget them.

    ``devices`` holds ``(device_id, name, identifiers_and_connections)`` of the live registry.
    """
    live = [(device_id, name, {tuple(key) for key in keys}) for device_id, name, keys in devices]
    found: dict[str, dict[str, Any]] = {}
    for plan in plans:
        for action in plan.get("actions", []):
            result = action.get("result") or {}
            if action["kind"] != "forget_device" or result.get("state") != "done":
                continue
            restore = result.get("restore", {})
            identifiers = {tuple(key) for key in restore.get("identifiers", [])}
            keys = identifiers | {tuple(key) for key in restore.get("connections", [])}
            for device_id, name, live_keys in live:
                if keys & live_keys:
                    found[device_id] = {
                        "device_id": device_id,
                        "name": name,
                        "forgotten_at": result["at"],
                        "plan_id": plan["plan_id"],
                        "domains": sorted({key[0] for key in identifiers & live_keys}),
                    }
    return sorted(found.values(), key=lambda entry: entry["forgotten_at"])


def _used_by(edges: list[dict[str, Any]], key: str) -> list[dict[str, Any]]:
    """Objects that use ``key``, with how sure Housekeeper is."""
    return [
        {
            "source": edge["source"],
            "relation": edge["relation"],
            "confidence": edge.get("confidence", "certain"),
            "location": edge.get("location"),
        }
        for edge in edges
        if edge["target"] == key and edge["relation"] in USAGE_RELATIONS
    ]


def judge_action(
    kind: str,
    object_id: str,
    objects: dict[str, dict[str, Any]],
    edges: list[dict[str, Any]],
    quarantine: dict[str, str] | None = None,
    restorable: bool | None = None,
    now: datetime | None = None,
    *,
    devices: dict[str, dict[str, Any]] | None = None,
    support: dict[str, Any] | None = None,
    target: str | None = None,
    sources: list[dict[str, Any]] | None = None,
    meter: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Judge one candidate of any kind; see ``judge_entity_action`` for the verdicts."""
    if kind in METER_KINDS:
        return judge_meter_action(object_id, target, objects, edges, meter or {})
    if kind in DEVICE_KINDS:
        return judge_device_action(
            kind, object_id, objects, devices or {}, edges, quarantine, support, now
        )
    if kind in REFERENCE_KINDS:
        return judge_reference_action(object_id, target, objects, edges, sources)
    return judge_entity_action(kind, object_id, objects, edges, quarantine, restorable, now)


def _quarantine_reasons(
    action: dict[str, Any],
    reasons: list[str],
    since: str | None,
    now: datetime | None,
) -> None:
    if since is None:
        reasons.append("not_quarantined")
        return
    age = (now or datetime.now(UTC)) - datetime.fromisoformat(since)
    action["quarantine_since"] = since
    if age < timedelta(days=QUARANTINE_DAYS):
        reasons.append("quarantine_too_short")
        action["quarantine_days_left"] = QUARANTINE_DAYS - age.days


BLOCKING_REASONS = frozenset(
    {
        "entity_working",
        "used_certain",
        "already_disabled",
        "already_in_state",
        "bad_state",
        "not_user_disabled",
        "marked_keep",
        "not_quarantined",
        "quarantine_too_short",
        "device_has_working_entities",
        "has_children",
        "child_device",
        "integration_no_support",
        "regular_removal_available",
        "unsupported_action",
        "not_found",
        "target_missing",
        "same_entity",
        "different_domain",
        "target_not_working",
        "nothing_to_replace",
        "stats_missing_old",
        "bad_keep_days",
        "backup_missing",
        "not_housekeeper_backup",
        "backup_protected",
        "not_a_candidate",
        "not_in_yaml",
        "file_too_large",
        "not_counted",
        "nothing_to_trim",
        "bad_tables",
        "range_states_only",
        "stats_unit_differs",
        "stats_type_differs",
        "stats_nothing_to_import",
        "no_recorder",
        "no_counter_statistics",
        "no_range_statistics",
        "bad_range",
        "no_bracket",
        "bracket_not_good",
        "fixed_outside",
        "label_missing",
        "already_labelled",
        "no_suggestion",
        "not_registered",
        "bad_new_id",
        "target_taken",
        "rename_unwritable",
        "rename_templates",
        "area_missing",
        "has_area",
        "nothing_found",
        "too_many_rows",
        "schema_unknown",
        "counter_changed",
        "old_not_in_registry",
        "target_not_in_registry",
        "alt_id_taken",
        "not_orphaned",
        "in_energy",
        "entity_exists",
        "nothing_to_do",
        "refactor_disabled",
        "not_editable",
        "invalid_fix",
        "invalid_config",
    }
)


def _verdict(action: dict[str, Any]) -> None:
    reasons = set(action["reasons"])
    if BLOCKING_REASONS & reasons:
        action["verdict"] = "blocked"
    elif reasons:
        action["verdict"] = "review"
    else:
        action["verdict"] = "ok"


def judge_device_action(
    kind: str,
    device_id: str,
    objects: dict[str, dict[str, Any]],
    devices: dict[str, dict[str, Any]],
    edges: list[dict[str, Any]],
    quarantine: dict[str, str] | None = None,
    support: dict[str, Any] | None = None,
    now: datetime | None = None,
) -> dict[str, Any]:
    """Judge one device. Removal and forgetting follow the same rules as entities, plus hubs.

    ``support`` says whether the integration offers regular removal; Force Forget is only an
    option when it does not. Removing a device also removes its entities, so everything that
    could depend on any of them counts as use of the device.
    """
    device = devices.get(device_id)
    action: dict[str, Any] = {
        "kind": kind,
        "object_id": device_id,
        "object_type": "device",
        "name": device_id,
        "verdict": "blocked",
        "reasons": [],
        "used_by": [],
        "has_statistics": False,
        "entities": [],
    }
    if device is None:
        action["reasons"].append("not_found")
        return action
    action["name"] = device.get("name") or device_id
    action["status"] = device["status"]
    members = [
        item
        for item in objects.values()
        if item.get("device_id") == device_id and item["object_type"] == "entity"
    ]
    action["entities"] = sorted(item["object_id"] for item in members)
    action["has_statistics"] = any(item.get("has_statistics") for item in members)
    used_by = _used_by(edges, f"device:{device_id}")
    for item in members:
        used_by.extend(_used_by(edges, f"entity:{item['object_id']}"))
    action["used_by"] = used_by

    reasons = action["reasons"]
    if device.get("marked_keep") or any(item.get("marked_keep") for item in members):
        reasons.append("marked_keep")
    if device.get("critical") or any(item.get("critical") for item in members):
        reasons.append("critical_object")
    if any(item["status"] not in DISABLEABLE_STATUSES | {"disabled"} for item in members):
        reasons.append("device_has_working_entities")
    if device.get("device_kind") == "child":
        reasons.append("child_device")  # removing and restoring child devices is not supported yet
    if any(
        device_id in (other.get("via_device_id"), other.get("parent_device_id"))
        for other in devices.values()
    ):
        reasons.append("has_children")
    if kind == "disable_device" and device["status"] == "disabled":
        reasons.append("already_disabled")
    if any(use["confidence"] == "certain" for use in used_by):
        reasons.append("used_certain")
    elif used_by:
        reasons.append("used_probable")
    if action["has_statistics"]:
        reasons.append("has_statistics")
    if IGNORE_LABEL in (device.get("labels") or []) or any(
        IGNORE_LABEL in (item.get("labels") or []) for item in members
    ):
        reasons.append("ignored_by_label")
    if kind != "disable_device":
        _quarantine_reasons(action, reasons, (quarantine or {}).get(device_id), now)
        action["removal_supported"] = (support or {}).get("removal_supported")
        action["restorable"] = (support or {}).get("restorable")
        if kind == "remove_device" and not action["removal_supported"]:
            reasons.append("integration_no_support")
        if kind == "forget_device":
            if action["removal_supported"]:
                reasons.append("regular_removal_available")
            reasons.append("forced_forget")
        reasons.append("restore_limited")
        if action["restorable"] is False:
            reasons.append("not_restorable")
    _verdict(action)
    return action


def judge_reference_action(
    object_id: str,
    target: str | None,
    objects: dict[str, dict[str, Any]],
    edges: list[dict[str, Any]],
    sources: list[dict[str, Any]] | None,
) -> dict[str, Any]:
    """Judge replacing every reference to ``object_id`` by ``target``.

    The old entity may be gone already (a broken reference); the new one must exist, work, and
    be of the same domain. A replacement always rewrites configuration, so it is at least
    ``review``: the person confirms it entity by entity.
    """
    action: dict[str, Any] = {
        "kind": "replace_references",
        "object_id": object_id,
        "object_type": "entity",
        "target": target,
        "name": (objects.get(object_id) or {}).get("name") or object_id,
        "verdict": "blocked",
        "reasons": [],
        "used_by": _used_by(edges, f"entity:{object_id}"),
        "has_statistics": bool((objects.get(object_id) or {}).get("has_statistics")),
        "sources": sources or [],
    }
    reasons = action["reasons"]
    new = objects.get(target or "")
    old = objects.get(object_id)
    if not target or new is None:
        reasons.append("target_missing")
    elif target == object_id:
        reasons.append("same_entity")
    elif target.split(".", 1)[0] != object_id.split(".", 1)[0]:
        reasons.append("different_domain")
    elif new["status"] != "active":
        reasons.append("target_not_working")
    if new is not None and old is not None:
        if new.get("unit") != old.get("unit"):
            reasons.append("unit_differs")
        if new.get("device_class") != old.get("device_class"):
            reasons.append("class_differs")
    writable = [source for source in action["sources"] if source["writable"] and source["changes"]]
    if not writable:
        reasons.append("nothing_to_replace")
    elif any(not source["writable"] or source["manual"] for source in action["sources"]):
        reasons.append("source_manual")
    if any(source["type"] == "energy" for source in writable):
        reasons.append("energy_changes")
    if action["has_statistics"]:
        reasons.append("has_statistics")
    reasons.append("config_rewrite")
    _verdict(action)
    return action


def judge_rename_action(
    object_id: str,
    target: str | None,
    objects: dict[str, dict[str, Any]],
    edges: list[dict[str, Any]],
    info: dict[str, Any],
) -> dict[str, Any]:
    """Judge giving one entity a new ID and rewriting every reference to it.

    A reference that cannot be written (a package, a blueprint input) or that sits in a template
    would break silently, so either one blocks the plan. A rename that changes files is at least
    ``review``; one without references only changes the registry and needs no review.
    """
    action: dict[str, Any] = {
        "kind": "rename_entity",
        "object_id": object_id,
        "object_type": "entity",
        "target": target,
        "name": (objects.get(object_id) or {}).get("name") or object_id,
        "verdict": "blocked",
        "reasons": [],
        "used_by": _used_by(edges, f"entity:{object_id}"),
        "has_statistics": bool((objects.get(object_id) or {}).get("has_statistics")),
        "sources": info.get("sources") or [],
    }
    reasons = action["reasons"]
    if not info.get("registered"):
        reasons.append("not_registered")
    elif target == object_id:
        reasons.append("same_entity")
    elif not info.get("valid"):
        reasons.append("bad_new_id")
    elif not info.get("free"):
        reasons.append("target_taken")
    sources = action["sources"]
    if any(not source["writable"] for source in sources):
        reasons.append("rename_unwritable")
    if any(source["manual"] for source in sources):
        reasons.append("rename_templates")
    if any(source["writable"] and source["changes"] for source in sources):
        reasons.append("config_rewrite")
    _verdict(action)
    return action


def judge_refactor_action(
    entity_id: str,
    fix: str,
    values: dict[str, Any] | None,
    automations: dict[str, dict[str, Any]],
    preview: dict[str, Any] | None,
    enabled: bool,
) -> dict[str, Any]:
    """Judge one mechanical improvement of an automation (see ``refactor``).

    ``preview`` is what ``refactor.preview`` found: the source with its diff, or an error code.
    The edit rewrites a configuration file, so a plan that may run is always ``review``.
    """
    obj = automations.get(entity_id)
    action: dict[str, Any] = {
        "kind": "refactor_automation",
        "object_id": entity_id,
        "object_type": "automation",
        "name": (obj or {}).get("name") or entity_id,
        "fix": fix,
        "values": values or {},
        "verdict": "blocked",
        "reasons": [],
        "used_by": [],
        "has_statistics": False,
        "sources": [],
    }
    reasons = action["reasons"]
    if not enabled:
        reasons.append("refactor_disabled")
    elif obj is None:
        reasons.append("not_found")
    elif preview is None or preview.get("error"):
        error = (preview or {}).get("error") or "invalid_fix"
        reasons.append(error if error in BLOCKING_REASONS else "invalid_fix")
        if preview and preview.get("source_reason"):
            action["source_reason"] = preview["source_reason"]
    else:
        action["sources"] = [preview["source"]]
        reasons.append("config_rewrite")
    _verdict(action)
    return action


def apply_recorder_choice(action: dict[str, Any], choice: str, recorder: bool) -> None:
    """Add the person's choice to delete recorder data after a removal, and judge it again.

    The deletion cannot be undone except from the backup, so a plan that may run is ``review``.
    It is blocked without a recorder and for an entity the Energy dashboard uses.
    """
    if choice == "keep":
        return
    action["recorder"] = choice
    reasons = action["reasons"]
    if not recorder:
        reasons.append("no_recorder")
    elif any(use["source"] == "dashboard:energy" for use in action["used_by"]):
        reasons.append("in_energy")
    reasons.append("irreversible")
    if choice == "states":
        reasons.append("with_states")
    _verdict(action)


def judge_purge_action(
    statistic_id: str,
    orphans: dict[str, dict[str, Any]],
    exists: bool,
    states: bool,
    recorder: bool,
) -> dict[str, Any]:
    """Judge deleting the recorder statistics of one orphaned ID.

    Only an ID the last scan listed as orphaned, that no entity carries now and that the Energy
    dashboard does not use may go. The deletion cannot be undone except from the backup, so a
    plan that may run is always ``review``: the person confirms it one by one.
    """
    action: dict[str, Any] = {
        "kind": "purge_statistics",
        "object_id": statistic_id,
        "object_type": "statistic",
        "name": statistic_id,
        "verdict": "blocked",
        "reasons": [],
        "used_by": [],
        "has_statistics": True,
        "states": states,
    }
    reasons = action["reasons"]
    if not recorder:
        reasons.append("no_recorder")
    elif statistic_id not in orphans:
        reasons.append("not_orphaned")
    elif orphans[statistic_id].get("in_energy"):
        reasons.append("in_energy")
    elif exists:
        reasons.append("entity_exists")
    reasons.append("irreversible")
    if states:
        reasons.append("with_states")
    _verdict(action)
    return action


TRIM_STATES = ("states",)
TRIM_TABLES = ("states", "short_term", "long_term")


def trim_is_plain(action: dict[str, Any]) -> bool:
    """True for the classic trim: the state rows older than ``keep_days``, nothing else."""
    return not action.get("range") and tuple(action.get("tables") or TRIM_STATES) == TRIM_STATES


def judge_trim_action(
    entity_id: str,
    keep_days: int,
    objects: dict[str, dict[str, Any]],
    counted: dict[str, Any] | None,
    recorder: bool,
    *,
    tables: list[str] | None = None,
    rng: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Judge deleting recorder rows of one entity: older than ``keep_days`` days, or a stretch.

    ``counted`` is ``{"rows", "oldest"}`` from the recorder, None when it could not be counted.
    ``tables`` picks what goes: the state rows (default), the short-term and the long-term
    statistics. A stretch (``rng``) is allowed for state rows only: a hole in a running sum would
    falsify every chart that reads it. The deletion cannot be undone except from the backup, so a
    plan that may run is always ``review``.
    """
    action: dict[str, Any] = {
        "kind": "trim_history",
        "object_id": entity_id,
        "object_type": "entity",
        "name": (objects.get(entity_id) or {}).get("name") or entity_id,
        "keep_days": keep_days,
        "verdict": "blocked",
        "reasons": [],
        "used_by": [],
        "has_statistics": False,
        "trim": counted,
    }
    chosen = list(tables or TRIM_STATES)
    if tables:
        action["tables"] = chosen
    if rng:
        action["range"] = {"from": rng["from"], "to": rng["to"]}
    reasons = action["reasons"]
    if not recorder:
        reasons.append("no_recorder")
    elif not chosen or not set(chosen) <= set(TRIM_TABLES):
        reasons.append("bad_tables")
    elif rng and (chosen != list(TRIM_STATES) or not rng["from"] < rng["to"]):
        reasons.append("bad_range" if chosen == list(TRIM_STATES) else "range_states_only")
    elif not rng and not TRIM_DAYS[0] <= keep_days <= TRIM_DAYS[1]:
        reasons.append("bad_keep_days")
    elif counted is None:
        reasons.append("not_counted")
    elif not counted["rows"]:
        reasons.append("nothing_to_trim")
    if "long_term" in chosen:
        reasons.append("trim_statistics")  # charts and sums begin later; the sums after stay right
    reasons.append("irreversible")
    _verdict(action)
    return action


def judge_backup_deletion(backup_id: str, row: dict[str, Any] | None) -> dict[str, Any]:
    """Judge deleting one of Housekeeper's own backups; ``row`` is its entry of the listing.

    Deleting is final, so a plan that may run is always ``review``. A protected backup (its plan is
    still watched, or it is the newest one that still allows an undo) is never deleted.
    """
    action: dict[str, Any] = {
        "kind": "delete_backup",
        "object_id": backup_id,
        "object_type": "backup",
        "name": (row or {}).get("name") or backup_id,
        "verdict": "blocked",
        "reasons": [],
        "used_by": [],
        "has_statistics": False,
        "backup": row,
    }
    reasons = action["reasons"]
    if row is None:
        reasons.append("backup_missing")
    elif row.get("protected"):
        reasons.append("backup_protected")
    else:
        reasons.append("irreversible")
        if row.get("only_return"):
            reasons.append("only_return")
    _verdict(action)
    return action


def judge_automation_deletion(
    entity_id: str,
    objects: dict[str, dict[str, Any]],
    edges: list[dict[str, Any]],
    candidates: set[str],
    source: dict[str, Any] | None,
) -> dict[str, Any]:
    """Judge removing one automation from its YAML file.

    Only an automation with a finding that calls it unused or switched off for long, defined in
    ``automations.yaml``, qualifies. Mentions elsewhere (scripts, scenes, dashboards) do not block,
    but they are listed and the plan is always ``review``. Undo puts the whole file back.
    """
    item = objects.get(entity_id)
    action: dict[str, Any] = {
        "kind": "delete_automation",
        "object_id": entity_id,
        "object_type": "automation",
        "name": (item or {}).get("name") or entity_id,
        "verdict": "blocked",
        "reasons": [],
        "used_by": _used_by(edges, f"entity:{entity_id}"),
        "has_statistics": False,
        "yaml": (source or {}).get("text"),
        "sources": [
            {"source": (source or {}).get("source"), "hash": (source or {}).get("fingerprint")}
        ],
    }
    reasons = action["reasons"]
    if item is None:
        reasons.append("not_found")
    elif entity_id not in candidates:
        reasons.append("not_a_candidate")
    elif source is None or source.get("error"):
        reasons.append((source or {}).get("error") or "not_in_yaml")
    else:
        reasons.append("deletes_config")
        if action["used_by"]:
            reasons.append("used_by_mentions")
    _verdict(action)
    return action


def counter_key(request: dict[str, Any]) -> tuple[Any, ...]:
    """Identifies the preview of a repair request: the sensor, the mode and the picked range."""
    rng = request.get("range") or {}
    return (
        request["object_id"],
        request.get("mode") or "hold",
        rng.get("from"),
        rng.get("to"),
        rng.get("fixed"),
    )


def judge_counter_action(
    object_id: str,
    objects: dict[str, dict[str, Any]],
    counter: dict[str, Any],
    recorder: bool,
    kind: str = "repair_counter",
    rng: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Judge repairing the wrong readings of one counter in the recorder tables.

    ``counter`` is the preview of ``counter_repair``: the findings, the rows each table would
    change and a fingerprint. Writing the recorder is always ``review``; the old values are kept in
    the journal, so the repair can be undone as long as the rows are still as it left them.
    """
    action: dict[str, Any] = {
        "kind": kind,
        "object_id": object_id,
        "object_type": "entity",
        "name": (objects.get(object_id) or {}).get("name") or object_id,
        "mode": counter.get("mode") or "hold",
        **({"range": rng} if rng else {}),
        "verdict": "blocked",
        "reasons": [],
        "used_by": [],
        "has_statistics": True,
        "counter": {k: v for k, v in counter.items() if k != "error"},
    }
    reasons = action["reasons"]
    if not recorder:
        reasons.append("no_recorder")
    elif counter.get("error"):
        reasons.append(counter["error"])
    else:
        reasons.append("counter_write")
        if counter.get("skipped"):
            reasons.append("counter_partial")
    _verdict(action)
    return action


def judge_label_action(
    object_id: str, label_id: str, name: str, info: dict[str, Any]
) -> dict[str, Any]:
    """Judge adding one existing label to one entity.

    ``info`` says what the registries hold now: whether the entity is registered, the name of the
    label (None if there is none) and whether the entity already carries it. Nothing else changes,
    so a plan that is not blocked needs no further review.
    """
    action: dict[str, Any] = {
        "kind": "add_label",
        "object_id": object_id,
        "object_type": "entity",
        "name": name,
        "target": label_id,
        "label_name": info.get("label"),
        "verdict": "blocked",
        "reasons": [],
        "used_by": [],
        "has_statistics": False,
    }
    reasons = action["reasons"]
    if not info.get("exists"):
        reasons.append("not_found")
    elif info.get("label") is None:
        reasons.append("label_missing")
    elif info.get("has"):
        reasons.append("already_labelled")
    _verdict(action)
    return action


def judge_area_action(object_id: str, name: str, info: dict[str, Any]) -> dict[str, Any]:
    """Judge giving one entity or device without an area one that exists.

    ``info`` is what ``area_assign.prepare`` found. An area that is set already is never replaced,
    so a plan that is not blocked changes nothing but an empty field and needs no review.
    """
    action: dict[str, Any] = {
        "kind": "set_area",
        "object_id": object_id,
        "object_type": info.get("object_type", "entity"),
        "name": name,
        "target": info.get("target"),
        "area_name": info.get("area_name"),
        "suggested": bool(info.get("suggested")),
        "verdict": "blocked",
        "reasons": [],
        "used_by": [],
        "has_statistics": False,
    }
    reasons = action["reasons"]
    if not info.get("exists"):
        reasons.append("not_found")
    elif info.get("current"):
        reasons.append("has_area")
    elif info.get("target") is None:
        reasons.append("no_suggestion" if info.get("suggested") else "area_missing")
    _verdict(action)
    return action


def judge_state_action(
    object_id: str,
    target: str,
    name: str,
    info: dict[str, Any],
    used_by: list[dict[str, Any]],
) -> dict[str, Any]:
    """Judge enabling, disabling, hiding or showing one entity, whatever its status.

    ``info`` is what the registry holds now. Only an entity the user disabled is enabled again, so
    one an integration or its device switched off stays as it is. Disabling an entity something
    certainly uses is blocked; hiding and the way back never are, they only change what lists show.
    """
    action: dict[str, Any] = {
        "kind": "set_entity_state",
        "object_id": object_id,
        "object_type": "entity",
        "name": name,
        "target": target,
        "verdict": "blocked",
        "reasons": [],
        "used_by": used_by if target == "disable" else [],
        "has_statistics": False,
    }
    reasons = action["reasons"]
    if not info.get("exists"):
        reasons.append("not_found")
    elif target not in STATE_TARGETS:
        reasons.append("bad_state")
    elif target == "disable":
        if info.get("disabled_by"):
            reasons.append("already_in_state")
        if any(use["confidence"] == "certain" for use in used_by):
            reasons.append("used_certain")
        elif used_by:
            reasons.append("used_probable")
        if info.get("marked_keep"):
            reasons.append("marked_keep")
        if info.get("critical"):
            reasons.append("critical_object")
    elif target == "enable":
        if not info.get("disabled_by"):
            reasons.append("already_in_state")
        elif info["disabled_by"] != "user":
            reasons.append("not_user_disabled")
    elif target == "hide":
        if info.get("hidden_by"):
            reasons.append("already_in_state")
    elif not info.get("hidden_by"):
        reasons.append("already_in_state")
    _verdict(action)
    return action


def judge_meter_action(
    object_id: str,
    target: str | None,
    objects: dict[str, dict[str, Any]],
    edges: list[dict[str, Any]],
    meter: dict[str, Any],
) -> dict[str, Any]:
    """Judge joining a replaced meter's history onto its successor and/or its entity ID.

    ``meter`` carries ``mode`` (``statistics``, ``id`` or ``both``), the statistics ``analysis``,
    the free ``alt_id`` the old entity moves to, and whether both entities are in the registry.
    Writing statistics is always at least ``review``; nothing in it can be undone without the
    backup.
    """
    mode = meter.get("mode") or "both"
    analysis = meter.get("analysis") or {}
    action: dict[str, Any] = {
        "kind": "migrate_meter",
        "object_id": object_id,
        "object_type": "entity",
        "target": target,
        "mode": mode,
        "alt_id": meter.get("alt_id"),
        "name": (objects.get(object_id) or {}).get("name") or object_id,
        "verdict": "blocked",
        "reasons": [],
        "used_by": _used_by(edges, f"entity:{object_id}"),
        "has_statistics": True,
        "statistics": {k: v for k, v in analysis.items() if k != "reasons"},
    }
    reasons = action["reasons"]
    new = objects.get(target or "")
    if mode not in METER_MODES:
        reasons.append("nothing_to_do")
    if not target or new is None:
        reasons.append("target_missing")
    elif target == object_id:
        reasons.append("same_entity")
    elif target.split(".", 1)[0] != object_id.split(".", 1)[0]:
        reasons.append("different_domain")
    elif new["status"] != "active":
        reasons.append("target_not_working")
    old = objects.get(object_id)
    if new is not None and old is not None:
        if new.get("unit") != old.get("unit"):
            reasons.append("unit_differs")
        if new.get("device_class") != old.get("device_class"):
            reasons.append("class_differs")
    if mode in {"both", "statistics"}:
        reasons.extend(analysis.get("reasons", []))
        reasons.append("stats_write")
    if mode in {"both", "id"}:
        if not meter.get("old_in_registry"):
            reasons.append("old_not_in_registry")
        if not meter.get("target_in_registry"):
            reasons.append("target_not_in_registry")
        if meter.get("alt_taken"):
            reasons.append("alt_id_taken")
        reasons.append("id_takeover")
        if _used_by(edges, f"entity:{target}"):
            reasons.append("target_in_use")
    _verdict(action)
    return action


def judge_entity_action(
    kind: str,
    object_id: str,
    objects: dict[str, dict[str, Any]],
    edges: list[dict[str, Any]],
    quarantine: dict[str, str] | None = None,
    restorable: bool | None = None,
    now: datetime | None = None,
) -> dict[str, Any]:
    """Judge one entity candidate. Verdicts: ``ok`` (no known use), ``review``, ``blocked``.

    ``quarantine`` maps entity IDs to when Housekeeper disabled them; removal is only
    allowed after ``QUARANTINE_DAYS``. ``restorable`` tells whether a removed entity could be
    brought back (its config entry still exists).
    """
    action: dict[str, Any] = {
        "kind": kind,
        "object_id": object_id,
        "object_type": "entity",
        "name": object_id,
        "verdict": "blocked",
        "reasons": [],
        "used_by": [],
        "has_statistics": False,
    }
    if kind not in ENTITY_KINDS:
        action["reasons"].append("unsupported_action")
        return action
    item = objects.get(object_id)
    if item is None:
        action["reasons"].append("not_found")
        return action
    action["name"] = item.get("name") or object_id
    action["status"] = item["status"]
    action["has_statistics"] = bool(item.get("has_statistics"))
    used_by = _used_by(edges, f"entity:{object_id}")
    action["used_by"] = used_by

    reasons = action["reasons"]
    allowed = DISABLEABLE_STATUSES if kind == "disable_entity" else REMOVABLE_STATUSES
    if kind == "disable_entity" and item["status"] == "disabled":
        reasons.append("already_disabled")
    elif item["status"] not in allowed and not (
        kind == "disable_entity" and item.get("blocked_automation")
    ):
        reasons.append("entity_working")
    if any(use["confidence"] == "certain" for use in used_by):
        reasons.append("used_certain")
    elif used_by:
        reasons.append("used_probable")
    if action["has_statistics"]:
        reasons.append("has_statistics")
    if item.get("labels") and IGNORE_LABEL in item["labels"]:
        reasons.append("ignored_by_label")
    if item.get("marked_keep"):
        reasons.append("marked_keep")
    if item.get("critical"):
        reasons.append("critical_object")
    if kind == "remove_entity":
        _quarantine_reasons(action, reasons, (quarantine or {}).get(object_id), now)
        action["restorable"] = restorable
        if restorable is False:
            reasons.append("not_restorable")

    _verdict(action)
    return action


def build_plan(
    snapshot: dict[str, Any],
    requested: list[dict[str, Any]],
    now: datetime,
    fingerprint: Callable[[str], str | None] | None = None,
    restorable: Callable[[str], bool | None] | None = None,
    *,
    device_info: Callable[[str], tuple[str | None, dict[str, Any]]] | None = None,
    reference_data: dict[tuple[str, str], tuple[str | None, list[dict[str, Any]]]] | None = None,
    meter_data: dict[tuple[str, str, str], dict[str, Any]] | None = None,
    statistic_exists: Callable[[str], bool] | None = None,
    refactor_data: dict[tuple[str, str, str], dict[str, Any]] | None = None,
    refactor_enabled: bool = False,
    counter_data: dict[tuple[str, str], dict[str, Any]] | None = None,
    label_data: dict[tuple[str, str], dict[str, Any]] | None = None,
    area_data: dict[str, dict[str, Any]] | None = None,
    state_data: dict[str, dict[str, Any]] | None = None,
    rename_data: dict[tuple[str, str], dict[str, Any]] | None = None,
    trim_data: dict[tuple[str, int], dict[str, Any] | None] | None = None,
    backup_data: dict[str, dict[str, Any]] | None = None,
    delete_data: dict[str, dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Create a dry-run plan for ``requested`` actions from the latest snapshot.

    ``fingerprint`` returns the registry fingerprint of an entity so that execution can
    detect changes made after the preview; ``restorable`` tells whether a removal could be
    undone. ``device_info`` gives a device's fingerprint and what its integration supports;
    ``reference_data`` maps ``(old, new)`` entity IDs to the fingerprint and the sources found
    for a replacement; ``statistic_exists`` tells whether an entity carries a statistic ID now;
    ``meter_data`` maps ``(old, new, mode)`` to the fingerprint and judging data
    of a meter migration. A plan holds at most one action per object.
    """
    quarantine = {q["object_id"]: q["since"] for q in snapshot.get("quarantine", [])}
    objects = {
        item["object_id"]: item for item in snapshot["objects"] if item["object_type"] == "entity"
    }
    devices = {
        item["object_id"]: item for item in snapshot["objects"] if item["object_type"] == "device"
    }
    seen: set[str] = set()
    actions = []
    for request in requested[:MAX_ACTIONS]:
        kind, object_id = request["kind"], request["object_id"]
        if object_id in seen:
            continue
        seen.add(object_id)
        if kind in DEVICE_KINDS:
            device_print, support = device_info(object_id) if device_info else (None, {})
            action = judge_action(
                kind,
                object_id,
                objects,
                snapshot["edges"],
                quarantine,
                None,
                now,
                devices=devices,
                support=support,
            )
            action["fingerprint"] = device_print
        elif kind in PURGE_KINDS:
            action = judge_purge_action(
                object_id,
                {i["statistic_id"]: i for i in snapshot.get("orphaned_statistics", [])},
                bool(statistic_exists and statistic_exists(object_id)),
                bool(request.get("states")),
                bool(snapshot["meta"].get("recorder_available")),
            )
            action["fingerprint"] = None
        elif kind in DELETE_BACKUP_KINDS:
            action = judge_backup_deletion(object_id, (backup_data or {}).get(object_id))
            action["fingerprint"] = None
        elif kind in DELETE_AUTOMATION_KINDS:
            automations = {
                o["object_id"]: o for o in snapshot["objects"] if o["object_type"] == "automation"
            }
            found = (delete_data or {}).get(object_id)
            action = judge_automation_deletion(
                object_id,
                automations,
                snapshot["edges"],
                {
                    f["object_id"]
                    for f in snapshot.get("findings", [])
                    if f["rule_id"] in DELETE_CANDIDATE_RULES
                },
                found,
            )
            action["fingerprint"] = (found or {}).get("fingerprint")
        elif kind in TRIM_KINDS:
            keep_days = int(request.get("keep_days") or 0)
            action = judge_trim_action(
                object_id,
                keep_days,
                objects,
                (trim_data or {}).get((object_id, keep_days)),
                bool(snapshot["meta"].get("recorder_available")),
                tables=request.get("tables"),
                rng=request.get("range"),
            )
            action["fingerprint"] = None
        elif kind in AREA_KINDS:
            info = (area_data or {}).get(object_id, {})
            entry = objects.get(object_id) or devices.get(object_id) or {}
            action = judge_area_action(object_id, entry.get("name") or object_id, info)
            action["fingerprint"] = info.get("fingerprint")
        elif kind in STATE_KINDS:
            info = (state_data or {}).get(object_id, {})
            item = objects.get(object_id) or {}
            action = judge_state_action(
                object_id,
                request.get("target") or "",
                item.get("name") or object_id,
                {**info, "marked_keep": item.get("marked_keep"), "critical": item.get("critical")},
                _used_by(snapshot["edges"], f"entity:{object_id}"),
            )
            action["fingerprint"] = info.get("fingerprint")
        elif kind in LABEL_KINDS:
            label_id = request.get("target") or ""
            info = (label_data or {}).get((object_id, label_id), {})
            name = (objects.get(object_id) or {}).get("name") or object_id
            action = judge_label_action(object_id, label_id, name, info)
            action["fingerprint"] = info.get("fingerprint")
        elif kind in REPAIR_KINDS:
            mode = request.get("mode") or "hold"
            rng = request.get("range") if kind == "repair_range" else None
            counter = (counter_data or {}).get(
                counter_key({**request, "range": rng}),
                {"error": "bad_range" if kind == "repair_range" else "no_counter_statistics"},
            )
            action = judge_counter_action(
                object_id,
                objects,
                counter,
                bool(snapshot["meta"].get("recorder_available")),
                kind,
                rng,
            )
            action["fingerprint"] = counter.get("fingerprint")
        elif kind in REFACTOR_KINDS:
            fix, values = request.get("fix") or "", request.get("values") or {}
            found = (refactor_data or {}).get(refactor_key(object_id, fix, values))
            automations = {
                o["object_id"]: o for o in snapshot["objects"] if o["object_type"] == "automation"
            }
            action = judge_refactor_action(
                object_id, fix, values, automations, found, refactor_enabled
            )
            action["fingerprint"] = (found or {}).get("fingerprint")
        elif kind in METER_KINDS:
            target = request.get("target") or ""
            mode = request.get("mode") or "both"
            meter = (meter_data or {}).get((object_id, target, mode), {})
            action = judge_action(
                kind,
                object_id,
                objects,
                snapshot["edges"],
                target=target,
                meter={**meter, "mode": mode},
            )
            action["fingerprint"] = meter.get("fingerprint")
        elif kind in RENAME_KINDS:
            target = request.get("target") or ""
            found = (rename_data or {}).get((object_id, target), {})
            action = judge_rename_action(object_id, target, objects, snapshot["edges"], found)
            action["fingerprint"] = found.get("fingerprint")
        elif kind in REFERENCE_KINDS:
            target = request.get("target") or ""
            reference_print, sources = (reference_data or {}).get((object_id, target), (None, []))
            action = judge_action(
                kind,
                object_id,
                objects,
                snapshot["edges"],
                target=target,
                sources=sources,
            )
            action["fingerprint"] = reference_print
        else:
            action = judge_action(
                kind,
                object_id,
                objects,
                snapshot["edges"],
                quarantine,
                restorable(object_id) if restorable else None,
                now,
            )
            action["fingerprint"] = fingerprint(object_id) if fingerprint else None
        if kind in REMOVAL_KINDS:
            apply_recorder_choice(
                action,
                request.get("recorder") or "keep",
                bool(snapshot["meta"].get("recorder_available")),
            )
        action["executable"] = kind in EXECUTABLE_KINDS and action["verdict"] != "blocked"
        actions.append(action)
    counts = {
        verdict: sum(a["verdict"] == verdict for a in actions)
        for verdict in ("ok", "review", "blocked")
    }
    return {
        "plan_id": secrets.token_hex(6),
        "created_at": now.isoformat(),
        "scanned_at": snapshot["meta"]["scanned_at"],
        "status": "dry_run",
        "executed": False,
        "confirmed": None,
        "run": None,
        "actions": actions,
        "summary": {
            "total": len(actions),
            **counts,
            "uses": sum(len(a["used_by"]) for a in actions),
            "statistics": sum(a["has_statistics"] for a in actions),
            # What a removal is measured against: the panel warns when a plan takes most of it.
            "totals": {"entity": len(objects), "device": len(devices)},
        },
        "simulation": simulate(actions),
        "events": [{"at": now.isoformat(), "type": "created"}],
    }


MAX_MERGE = 10


def refactor_key(entity_id: str, fix: str, values: dict[str, Any]) -> tuple[str, str, str]:
    """How a fix is found again in the data gathered for ``build_plan``."""
    return entity_id, fix, json.dumps(values, sort_keys=True)


def merge_requests(
    plans: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], list[dict[str, str]], int]:
    """The requests of several plans as one list, in the order of the plans.

    The same request twice counts once (the third value). A plan knows each object only once, so
    the same object asked for in a different way is a conflict: it is listed and left out, never
    decided for the person.
    """
    requests: dict[str, dict[str, Any]] = {}
    conflicts: dict[str, dict[str, Any]] = {}
    dropped = 0
    for plan in plans:
        for action in plan["actions"]:
            request = {"kind": action["kind"], "object_id": action["object_id"]}
            if action.get("target"):
                request["target"] = action["target"]
            if action["kind"] in METER_KINDS | REPAIR_KINDS and action.get("mode"):
                request["mode"] = action["mode"]
            if action.get("range"):
                request["range"] = action["range"]
            if action["kind"] in PURGE_KINDS:
                request["states"] = bool(action.get("states"))
            if action.get("recorder"):
                request["recorder"] = action["recorder"]
            if action["kind"] in TRIM_KINDS:
                request["keep_days"] = action["keep_days"]
                if action.get("tables"):
                    request["tables"] = action["tables"]
            if action["kind"] in REFACTOR_KINDS:
                request["fix"], request["values"] = action["fix"], action.get("values") or {}
            known = requests.get(request["object_id"])
            if known is None:
                if request["object_id"] not in conflicts:
                    requests[request["object_id"]] = request
            elif known == request:
                dropped += 1
            else:
                conflicts[request["object_id"]] = {
                    "object_id": request["object_id"],
                    "kinds": sorted({known["kind"], request["kind"]}),
                }
                del requests[request["object_id"]]
    return list(requests.values()), list(conflicts.values()), dropped


def history_ids(plan: dict[str, Any]) -> list[str]:
    """The entity or statistic IDs whose recorder rows a plan is about."""
    ids: list[str] = []
    for action in plan["actions"]:
        if action["kind"] in PURGE_KINDS or action["kind"] == "remove_entity":
            ids.append(action["object_id"])
        elif action["kind"] in {"remove_device", "forget_device"}:
            ids.extend(action.get("entities") or [])
    return ids


def attach_history(plan: dict[str, Any], rows: dict[str, dict[str, int]]) -> None:
    """Add the recorder row counts to the actions and work the simulation out again."""
    for action in plan["actions"]:
        ids = history_ids({"actions": [action]})
        if ids and all(i in rows for i in ids):
            action["history"] = {
                key: sum(rows[i][key] for i in ids) for key in ("states", "statistics")
            }
    plan["simulation"] = simulate(plan["actions"])


# Fields that only the server needs to undo a step. They can be large (a whole config file) and are
# never sent to the panel.
INTERNAL_RESULT_KEYS = frozenset({"restore", "counter"})
INTERNAL_SOURCE_KEYS = frozenset({"before", "file_before", "file_after_hash"})


OBJECT_LIST_LIMIT = (
    300  # objects per plan in the journal list; the panel only marks findings with them
)


def _done(action: dict[str, Any]) -> bool:
    return (action.get("result") or {}).get("state") == "done"


def plan_summary(plan: dict[str, Any]) -> dict[str, Any]:
    """What the journal list shows: no actions and no restore data."""
    actions = plan.get("actions", [])
    done_objects = {a["object_id"] for a in actions if a.get("object_id") and _done(a)}
    return {
        "plan_id": plan["plan_id"],
        "created_at": plan.get("created_at"),
        "status": plan.get("status"),
        "executed": bool(plan.get("executed")),
        "run": bool(plan.get("run")),
        "finished_at": (plan.get("run") or {}).get("finished_at"),
        "undoable": not plan.get("file_snapshot_dropped")
        and any((a.get("result") or {}).get("state") == "done" for a in plan.get("actions", [])),
        "summary": plan.get("summary"),
        "file_snapshot_dropped": bool(plan.get("file_snapshot_dropped")),
        "followup": (plan.get("followup") or {}).get("state"),
        "followup_until": (plan.get("followup") or {}).get("until"),
        "objects": sorted({a["object_id"] for a in plan.get("actions", []) if a.get("object_id")})[
            :OBJECT_LIST_LIMIT
        ],
        "done_objects": sorted(done_objects)[:OBJECT_LIST_LIMIT],
        # The full number and the kinds of what was done, for the "Done" list of the findings page.
        "done_count": len(done_objects),
        "kinds": sorted({a["kind"] for a in actions if a.get("kind") and _done(a)}),
    }


def public_plan(plan: dict[str, Any]) -> dict[str, Any]:
    """A plan for the panel: the stored plan without the internal restore data."""

    def action_view(action: dict[str, Any]) -> dict[str, Any]:
        result = action.get("result")
        if not result:
            return action
        shown = {k: v for k, v in result.items() if k not in INTERNAL_RESULT_KEYS}
        if isinstance(result.get("sources"), list):
            shown["sources"] = [
                {k: v for k, v in source.items() if k not in INTERNAL_SOURCE_KEYS}
                if isinstance(source, dict)
                else source
                for source in result["sources"]
            ]
        return {**action, "result": shown}

    shown = {**plan, "actions": [action_view(action) for action in plan.get("actions", [])]}
    if "followup" in shown:
        shown["followup"] = followup.public(shown["followup"])
    return shown


RUN_STATES = ("backup", "running")  # a plan in one of these has a run going right now


def end_interrupted(plan: dict[str, Any], at: str) -> None:
    """End a run that was stopped from outside (restart, crash): partial or aborted, never running.

    Steps without a result did not run; the done ones keep their restore data for an undo.
    """
    plan["status"] = "partial" if plan.get("executed") else "aborted"
    run = plan.get("run")
    if isinstance(run, dict) and not run.get("finished_at"):
        run["finished_at"] = at
    plan.setdefault("events", []).append({"at": at, "type": "interrupted"})
    for action in plan.get("actions", []):
        action.setdefault("result", {"state": "not_run", "at": at, "reason": "interrupted"})


class JournalStore:
    """Journal of dry-run plans, newest first. Stored by Housekeeper only."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, JOURNAL_STORAGE_KEY)
        self._plans: list[dict[str, Any]] = []
        self.purges: list[dict[str, Any]] = []

    async def async_load(self) -> None:
        """Load the journal."""
        data = await self._store.async_load()
        if isinstance(data, dict) and isinstance(data.get("plans"), list):
            self._plans = data["plans"]
        if isinstance(data, dict) and isinstance(data.get("purges"), list):
            self.purges = [p for p in data["purges"] if isinstance(p, dict)][:MAX_PURGES]
        # Nothing runs right after loading: a plan still marked as running was cut off.
        stopped = [p for p in self._plans if isinstance(p, dict) and p.get("status") in RUN_STATES]
        now = datetime.now(UTC).isoformat()
        for plan in stopped:
            end_interrupted(plan, now)
        if stopped:
            self._save()

    @property
    def store(self) -> Store[dict[str, Any]]:
        """The storage file; only the runner writes it at once (``CleanupRunner.flush_journal``)."""
        return self._store

    def data(self) -> dict[str, Any]:
        """What is stored."""
        return {"plans": self._plans, "purges": self.purges}

    def add_purge(self, entry: dict[str, Any]) -> None:
        """Record a recorder purge, newest first. It cannot be undone, so it is only noted."""
        self.purges.insert(0, entry)
        del self.purges[MAX_PURGES:]
        self._save()

    @property
    def plans(self) -> list[dict[str, Any]]:
        """All plans, newest first."""
        return self._plans

    def add(self, plan: dict[str, Any]) -> None:
        """Record a plan and trim the journal."""
        self._plans.insert(0, plan)
        self._trim()
        self._save()

    @staticmethod
    def _is_open_preview(plan: dict[str, Any]) -> bool:
        return not plan.get("executed") and not plan.get("run")

    @staticmethod
    def _still_needed(plan: dict[str, Any], now: str) -> bool:
        """A plan that ran but must stay: running, watched after the run, or holding a quarantine.

        Whether a quarantined item is still disabled only the live inventory knows, so a plan with
        a done disable step stays until that step is undone.
        """
        if plan.get("status") in RUN_STATES:
            return True
        if ((plan.get("followup") or {}).get("until") or "") > now:
            return True
        return any(
            action.get("kind") in QUARANTINE_KINDS
            and (action.get("result") or {}).get("state") == "done"
            for action in plan.get("actions", [])
        )

    def _trim(self) -> None:
        """Limit the previews by number, the plans that ran by age and number, the journal by size.

        A plan that ran goes after ``JOURNAL_KEEP_DAYS`` days, or earlier when there are more than
        ``JOURNAL_MAX_PLANS`` plans (oldest first), unless it is still needed (see above).
        """
        previews = 0
        kept = []
        for plan in self._plans:
            if self._is_open_preview(plan):
                previews += 1
                if previews > MAX_OPEN_PREVIEWS:
                    continue
            kept.append(plan)
        now = datetime.now(UTC)
        cutoff = (now - timedelta(days=JOURNAL_KEEP_DAYS)).isoformat()
        count, dropped = len(kept), set()
        for plan in reversed(kept):  # oldest first
            ended = (plan.get("run") or {}).get("finished_at") or plan.get("created_at")
            if (
                self._is_open_preview(plan)
                or not ended
                or self._still_needed(plan, now.isoformat())
            ):
                continue
            if count > JOURNAL_MAX_PLANS or ended < cutoff:
                dropped.add(id(plan))
                count -= 1
        self._plans[:] = [plan for plan in kept if id(plan) not in dropped]
        self._compact_to(JOURNAL_MAX_BYTES)

    def _compact_to(self, limit: int) -> None:
        """Drop the whole-file copies of the oldest plans until the journal fits the limit.

        The entry level data (what each step changed and when) stays, so the quarantine and the
        undo of single items keep working; only the byte-exact file undo is given up.
        """
        size = len(json.dumps(self._plans, default=str))
        for plan in reversed(self._plans):
            if size <= limit:
                break
            for action in plan.get("actions", []):
                for source in (action.get("result") or {}).get("sources") or []:
                    if isinstance(source, dict) and source.get("file_before") is not None:
                        size -= len(json.dumps(source.pop("file_before"), default=str))
                        source.pop("file_after_hash", None)
                        source["file_snapshot_dropped"] = True
                        plan["file_snapshot_dropped"] = True

    def get(self, plan_id: str) -> dict[str, Any] | None:
        """Return one plan by ID."""
        return next((plan for plan in self._plans if plan["plan_id"] == plan_id), None)

    def remove(self, plan_id: str) -> bool:
        """Remove a plan that was never executed. Executed plans stay as the audit trail."""
        for plan in self._plans:
            if plan["plan_id"] == plan_id and not plan.get("executed") and not plan.get("run"):
                self._plans.remove(plan)
                self._save()
                return True
        return False

    def save(self) -> None:
        """Persist changes made to a plan in place."""
        self._save()

    def _save(self) -> None:
        self._store.async_delay_save(self.data, SAVE_DELAY)
