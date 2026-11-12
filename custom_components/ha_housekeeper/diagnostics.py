"""Diagnostics for HA Housekeeper.

Only aggregate counts are exported; names, IDs and attributes never leave the
installation, so the download is safe to attach to a bug report.
"""

from __future__ import annotations

from collections import Counter
from datetime import UTC, datetime
from typing import Any

from homeassistant.const import __version__ as HA_VERSION
from homeassistant.core import HomeAssistant

from .backup_health import collect
from .runtime import HousekeeperConfigEntry, loaded_scanner

# Meta fields that are plain numbers, flags, codes or fixed-shape aggregates.
_META_KEEP = (
    "scan_timing", "coverage", "coverage_retry_minutes", "storage", "database", "scanned_at",
    "read_only", "preliminary", "warmup_seconds_left", "warmup_booting", "warmup_pending",
    "warmup_done", "warmup_total", "warmup_settling", "outage_info_minutes", "outage_low_hours",
    "outage_medium_hours", "outage_high_hours", "unused_automation_days", "version", "notify",
    "mcp", "protection", "protection_migrated", "protection_rules", "recorder_available",
    "orphaned_statistics", "quarantined", "recurring_devices", "quarantine_days", "ha_version",
    "hacs_available", "hacs_store", "scan_interval_hours", "low_battery_percent", "stale_hours",
    "history_days", "watch_hours", "low_batteries", "object_count", "status_counts",
    "marked_status_counts", "type_counts", "exception_rules", "exception_rules_due",
)  # fmt: skip
# Lists of ids or names that are reduced to how many there were.
_META_COUNT = ("unchecked", "state_only_entities", "warmup_names", "repairs", "hacs_removed")
_VACATION_KEEP = ("active", "missing", "ended_at", "grace_hours", "held", "rules")


def _agent_kinds(agents: Any) -> list[str] | None:
    """Where a backup is stored, by integration only: the rest of an agent id can name an account."""
    if not isinstance(agents, (list, tuple)):
        return None
    return [str(agent).split(".", 1)[0] for agent in agents]


def diagnostic_meta(meta: dict[str, Any]) -> dict[str, Any]:
    """The scan meta without any id or name: a list allowed by name, so a new field stays out."""
    result = {key: meta[key] for key in _META_KEEP if key in meta}
    result.update({key: len(meta.get(key) or []) for key in _META_COUNT})
    if isinstance(meta.get("coverage"), list):
        # A gap may name what could not be read (a dashboard's path): only how many.
        result["coverage"] = [
            {
                key: (len(value) if key == "items" and isinstance(value, list) else value)
                for key, value in entry.items()
            }
            for entry in meta["coverage"]
            if isinstance(entry, dict)
        ]
    vacation = meta.get("vacation")
    result["vacation"] = {key: vacation.get(key) for key in _VACATION_KEEP} if vacation else None
    watch = meta.get("watch")
    result["watch"] = {"samples": watch["samples"], "new": watch["new"]} if watch else None
    return result


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: HousekeeperConfigEntry
) -> dict[str, Any]:
    """Return anonymous scan statistics."""
    scanner = loaded_scanner(hass)
    if scanner is None:
        return {"home_assistant": HA_VERSION, "loaded": False}

    backups = await collect(hass)
    snapshot = scanner.snapshot
    findings = snapshot["findings"] if snapshot else []
    # Only the kind of the last error: its message can name entities.
    error = scanner.status.get("last_error")
    return {
        "home_assistant": HA_VERSION,
        "loaded": True,
        # The central log of the checks: levels, the backup that runs, and the last changes (numbers only).
        "check_log": {
            "levels": dict(scanner.events.levels),
            "backup_running": backups.get("running") if backups.get("available") else None,
            "since": scanner.events.log_since,
            "recent": scanner.events.check_log(datetime.now(UTC), 30, 50)["entries"],
        },
        # Names of the saved data that could not be read at start and began empty (names of parts, no data).
        "storage_load_failures": list(getattr(scanner, "load_failures", [])),
        "scan_status": {**scanner.status, "last_error": error.split(":", 1)[0] if error else None},
        # Without the error text: it can name entities or paths.
        "scan_health": {**scanner.health_report(), "error": None},
        "meta": diagnostic_meta(snapshot["meta"]) if snapshot else None,
        # Backup flags only, no names or ids: shows how a backup tool marks its backups.
        "backups": (
            [
                {
                    key: item.get(key)
                    for key in (
                        "automatic",
                        "ha_included",
                        "own",
                        "partial",
                        "protected",
                        "database",
                    )
                }
                | {"agents": _agent_kinds(item.get("agents"))}
                for item in backups["backups"][:10]
            ]
            if backups.get("backups")
            else None
        ),
        "edge_count": len(snapshot["edges"]) if snapshot else 0,
        "findings_by_rule": dict(Counter(item["rule_id"] for item in findings)),
        "findings_by_classification": dict(Counter(item["classification"] for item in findings)),
    }
