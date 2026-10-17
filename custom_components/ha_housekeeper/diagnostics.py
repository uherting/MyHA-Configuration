"""Diagnostics for HA Housekeeper.

Only aggregate counts are exported; names, IDs and attributes never leave the
installation, so the download is safe to attach to a bug report.
"""

from __future__ import annotations

from collections import Counter
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import __version__ as HA_VERSION
from homeassistant.core import HomeAssistant

from .const import DOMAIN


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Return anonymous scan statistics."""
    scanner = hass.data.get(DOMAIN, {}).get("scanner")
    if scanner is None:
        return {"home_assistant": HA_VERSION, "loaded": False}

    snapshot = scanner.snapshot
    findings = snapshot["findings"] if snapshot else []
    # Only the kind of the last error: its message can name entities.
    error = scanner.status.get("last_error")
    return {
        "home_assistant": HA_VERSION,
        "loaded": True,
        # Names of the saved data that could not be read at start and began empty (names of parts, no data).
        "storage_load_failures": list(getattr(scanner, "load_failures", [])),
        "scan_status": {**scanner.status, "last_error": error.split(":", 1)[0] if error else None},
        # Without the error text: it can name entities or paths.
        "scan_health": {**scanner.health_report(), "error": None},
        # The ids of unread dashboards are left out, only how many there were.
        "meta": (
            {
                **{k: v for k, v in snapshot["meta"].items() if k != "unchecked"},
                "unchecked": len(snapshot["meta"].get("unchecked") or []),
            }
            if snapshot
            else None
        ),
        "edge_count": len(snapshot["edges"]) if snapshot else 0,
        "findings_by_rule": dict(Counter(item["rule_id"] for item in findings)),
        "findings_by_classification": dict(Counter(item["classification"] for item in findings)),
    }
