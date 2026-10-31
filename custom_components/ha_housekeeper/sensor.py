"""Sensors that expose the Housekeeper counts for dashboards and automations."""

from __future__ import annotations

import math
from collections import Counter
from datetime import datetime
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    DOMAIN,
    NAME,
    SIGNAL_MONITOR_DEFINITIONS,
    SIGNAL_PLAN_ACTIVITY,
    SIGNAL_SCAN_COMPLETE,
    SIGNAL_SCAN_STARTED,
)
from .outage_levels import is_quiet
from .runtime import HousekeeperConfigEntry
from .scan_coverage import gaps
from .scan_health import STATES

COUNT_KEYS = (
    "findings",
    "orphaned_entities",
    "unavailable_entities",
    "broken_references",
    "possible_duplicates",
    "unused_automations",
    "low_batteries",
)


def compute_values(snapshot: dict[str, Any] | None) -> dict[str, Any]:
    """Derive the sensor values from a snapshot; hidden findings never count."""
    # Counts taken while Home Assistant is still starting would be wrong; stay "unknown".
    if snapshot is None or snapshot["meta"].get("preliminary"):
        return {}
    # A quiet outage (info, low) is on the findings page only; the sensors count from medium on.
    active = [f for f in snapshot["findings"] if not f.get("ignored") and not is_quiet(f)]
    by_class = Counter(f["classification"] for f in active)
    return {
        "findings": len(active),
        "orphaned_entities": by_class["orphaned"],
        "unavailable_entities": by_class["unavailable"],
        "broken_references": by_class["broken_reference"],
        "possible_duplicates": by_class["possible_duplicate"],
        "unused_automations": by_class["unused"],
        "low_batteries": snapshot["meta"].get("low_batteries", 0),
        "last_scan": datetime.fromisoformat(snapshot["meta"]["scanned_at"]),
    }


DESCRIPTIONS = (
    *(
        SensorEntityDescription(
            key=key,
            translation_key=key,
            state_class=SensorStateClass.MEASUREMENT,
        )
        for key in COUNT_KEYS
    ),
    SensorEntityDescription(
        key="last_scan", translation_key="last_scan", device_class=SensorDeviceClass.TIMESTAMP
    ),
)


HEALTH_DESCRIPTION = SensorEntityDescription(
    key="scan_health",
    translation_key="scan_health",
    device_class=SensorDeviceClass.ENUM,
    options=list(STATES),
    entity_category=EntityCategory.DIAGNOSTIC,
)


ACTIVITY_DESCRIPTION = SensorEntityDescription(
    key="activity",
    translation_key="activity",
    device_class=SensorDeviceClass.ENUM,
    options=["idle", "scanning", "cleanup", "starting"],
)


def activity(scanner: Any) -> str | None:
    """What Housekeeper does right now; a plan outranks the scans it runs itself."""
    if scanner is None:
        return None
    if scanner.cleanup.running:
        return "cleanup"
    if scanner.status["running"]:
        return "scanning"
    if scanner.warming_up:
        return "starting"
    return "idle"


# Push only: Home Assistant never polls these entities, so updates need no limit.
PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant, entry: HousekeeperConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Create the Housekeeper sensors."""
    async_add_entities(
        [
            *(HousekeeperSensor(entry, description) for description in DESCRIPTIONS),
            ScanHealthSensor(entry, HEALTH_DESCRIPTION),
            ActivitySensor(entry, ACTIVITY_DESCRIPTION),
        ]
    )
    scanner = entry.runtime_data
    known: set[str] = set()

    @callback
    def _check_functions() -> None:
        fresh = {item["id"] for item in scanner.monitor.items} - known
        if fresh:
            known.update(fresh)
            async_add_entities([MonitorSensor(entry, function_id) for function_id in sorted(fresh)])

    _check_functions()
    entry.async_on_unload(
        async_dispatcher_connect(hass, SIGNAL_MONITOR_DEFINITIONS, _check_functions)
    )


class HousekeeperSensor(SensorEntity):
    """One count or timestamp of the latest scan."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, entry: HousekeeperConfigEntry, description: SensorEntityDescription) -> None:
        self.entity_description = description
        self.scanner = entry.runtime_data
        self._attr_unique_id = f"{entry.entry_id}_{description.key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)}, name=NAME, entry_type=DeviceEntryType.SERVICE
        )

    async def async_added_to_hass(self) -> None:
        """Refresh whenever a scan finishes or findings are hidden."""
        self._update()
        self.async_on_remove(
            async_dispatcher_connect(self.hass, SIGNAL_SCAN_COMPLETE, self._handle_update)
        )

    @callback
    def _handle_update(self) -> None:
        self._update()
        self.async_write_ha_state()

    def _update(self) -> None:
        scanner = self.scanner
        values = compute_values(scanner.snapshot if scanner else None)
        self._attr_native_value = values.get(self.entity_description.key)
        if self.entity_description.key == "findings":
            vacation = (
                ((scanner.snapshot if scanner else None) or {}).get("meta", {}).get("vacation")
            )
            self._attr_extra_state_attributes = (
                {
                    "vacation_mode": vacation["active"],
                    "vacation_held": vacation["held"],
                    "vacation_entity": vacation["entity"],
                }
                if vacation
                else {}
            )


class ScanHealthSensor(HousekeeperSensor):
    """Whether the scans run. Unlike the counts it also speaks when the last scan failed or is old."""

    def _update(self) -> None:
        scanner = self.scanner
        report = scanner.health_report() if scanner else None
        meta = ((scanner.snapshot if scanner else None) or {}).get("meta") or {}
        unread = gaps(meta.get("coverage") or [])
        self._attr_native_value = report["state"] if report else None
        # The kind of error and the phase, not the text: that can carry paths and would stay in the history.
        self._attr_extra_state_attributes = (
            {
                "last_attempt": report["last_attempt_at"],
                "last_success": report["last_success_at"],
                "failed_phase": report["failed_phase"],
                "error_class": report["error_class"],
                "consecutive_failures": report["consecutive_failures"],
                "last_duration_seconds": report["last_duration"],
                "unread_sources": unread,
            }
            if report
            else {}
        )


class ActivitySensor(HousekeeperSensor):
    """Whether a scan or a plan runs, for dashboards next to the scan button."""

    async def async_added_to_hass(self) -> None:
        self._update()
        for signal in (SIGNAL_SCAN_STARTED, SIGNAL_SCAN_COMPLETE, SIGNAL_PLAN_ACTIVITY):
            self.async_on_remove(async_dispatcher_connect(self.hass, signal, self._handle_update))

    def _update(self) -> None:
        self._attr_native_value = activity(self.scanner)


class MonitorSensor(SensorEntity):
    """The current, possibly unverified state of one selected function."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = ["ok", "problem", "unverified", "disabled"]
    _attr_translation_key = "monitor"

    def __init__(self, entry: HousekeeperConfigEntry, function_id: str) -> None:
        self.function_id = function_id
        self.scanner = entry.runtime_data
        self._attr_unique_id = f"{entry.entry_id}_monitor_{function_id}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)}, name=NAME, entry_type=DeviceEntryType.SERVICE
        )
        self._attr_native_value = "unverified"
        # The name is part of the translated entity name, so it is there before the entity is added.
        self._attr_translation_placeholders = {"name": self._definition_name()}
        self._removed = False

    async def async_added_to_hass(self) -> None:
        self._update()
        self.async_on_remove(
            async_dispatcher_connect(self.hass, SIGNAL_MONITOR_DEFINITIONS, self._handle_update)
        )

    @callback
    def _handle_update(self) -> None:
        scanner = self.scanner
        if scanner and not any(item["id"] == self.function_id for item in scanner.monitor.items):
            if not self._removed:
                self._removed = True
                registry = er.async_get(self.hass)
                entity_id = registry.async_get_entity_id("sensor", DOMAIN, self.unique_id)
                if entity_id:
                    registry.async_remove(entity_id)
                self.hass.async_create_task(self.async_remove())
            return
        self._update()
        self.async_write_ha_state()

    def _definition_name(self) -> str:
        """The name the user gave the function; its id until the definition is there."""
        definition = next(
            (item for item in self.scanner.monitor.items if item["id"] == self.function_id), None
        )
        return definition["name"] if definition else self.function_id

    def _update(self) -> None:
        scanner = self.scanner
        result = (
            next((item for item in scanner.monitor.results if item["id"] == self.function_id), None)
            if scanner
            else None
        )
        self._attr_translation_placeholders = {"name": self._definition_name()}
        self._attr_native_value = result["state"] if result else "unverified"
        self._attr_extra_state_attributes = (
            {
                "reason": result["reason"],
                "scanned_at": result["scanned_at"],
                "last_verified_at": result["last_verified_at"],
                **self._history_attributes(scanner.monitor),
            }
            if result
            else {}
        )

    def _history_attributes(self, monitor: Any) -> dict[str, Any]:
        """What the history says about the last 30 days; whole minutes and tenths of a percent keep the recorder quiet."""
        shares = monitor.availability_of(self.function_id)
        observed = shares["observed_seconds"]
        return {
            "last_problem_at": monitor.last_problem_at(self.function_id),
            "problems_30d": shares["incidents"],
            "downtime_30d_minutes": round(shares["problem_seconds"] / 60),
            "availability_30d": math.floor(shares["ok_seconds"] / observed * 1000) / 10
            if observed
            else None,
        }
