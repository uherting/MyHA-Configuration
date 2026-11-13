"""Sensors that expose the Housekeeper counts for dashboards and automations."""

from __future__ import annotations

import math
from collections import Counter
from collections.abc import Callable
from datetime import UTC, datetime, timedelta
from typing import Any, cast

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.const import PERCENTAGE, EntityCategory, UnitOfInformation, UnitOfTime
from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_point_in_utc_time
from homeassistant.util import dt as dt_util

from .backup_card import STATES as BACKUP_STATES
from .backup_card import backup_view
from .battery_card import battery_overview
from .battery_care import noted_types
from .const import (
    DOMAIN,
    NAME,
    SIGNAL_AUTO_PAUSE,
    SIGNAL_MONITOR_DEFINITIONS,
    SIGNAL_PLAN_ACTIVITY,
    SIGNAL_SCAN_COMPLETE,
    SIGNAL_SCAN_STARTED,
)
from .database_card import database_view
from .house_health import STATES as HOUSE_STATES
from .house_health import house_health
from .outage_levels import is_quiet
from .runtime import HousekeeperConfigEntry
from .scan_coverage import gaps
from .scan_health import STATES
from .start_card import start_view
from .update_card import STATES as UPDATE_STATES
from .update_card import update_view
from .vacation_card import STATES as VACATION_STATES
from .vacation_card import vacation_view

NEW_HOURS = 24  # how long a finding counts as new for the sensor

COUNT_KEYS = (
    "findings",
    "orphaned_entities",
    "unavailable_entities",
    "broken_references",
    "possible_duplicates",
    "unused_automations",
    "low_batteries",
    "new_findings",
)


def compute_values(snapshot: dict[str, Any] | None) -> dict[str, Any]:
    """Derive the sensor values from a snapshot; hidden findings never count."""
    # Counts taken while Home Assistant is still starting would be wrong; stay "unknown".
    if snapshot is None or snapshot["meta"].get("preliminary"):
        return {}
    # A quiet outage (info, low) is on the findings page only; the sensors count from medium on.
    active = [f for f in snapshot["findings"] if not f.get("ignored") and not is_quiet(f)]
    by_class = Counter(f["classification"] for f in active)
    scanned = datetime.fromisoformat(snapshot["meta"]["scanned_at"])
    fresh = [
        f
        for f in active
        if f.get("impact") in ("high", "medium")
        and f.get("first_seen_at")
        and scanned - datetime.fromisoformat(f["first_seen_at"]) <= timedelta(hours=NEW_HOURS)
    ]
    return {
        "findings": len(active),
        "new_findings": len(fresh),
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


HOUSE_DESCRIPTION = SensorEntityDescription(
    key="house_health",
    translation_key="house_health",
    device_class=SensorDeviceClass.ENUM,
    options=list(HOUSE_STATES),
)


BATTERY_WEAKEST_DESCRIPTION = SensorEntityDescription(
    key="battery_weakest",
    translation_key="battery_weakest",
    device_class=SensorDeviceClass.BATTERY,
    native_unit_of_measurement=PERCENTAGE,
)

BATTERY_NEXT_DESCRIPTION = SensorEntityDescription(
    key="battery_next_change",
    translation_key="battery_next_change",
    device_class=SensorDeviceClass.TIMESTAMP,
)


AUTO_PAUSE_DESCRIPTION = SensorEntityDescription(
    key="auto_pause",
    translation_key="auto_pause",
)


UPDATE_WATCH_DESCRIPTION = SensorEntityDescription(
    key="update_watch",
    translation_key="update_watch",
    device_class=SensorDeviceClass.ENUM,
    options=list(UPDATE_STATES),
)


START_TIME_DESCRIPTION = SensorEntityDescription(
    key="start_time",
    translation_key="start_time",
    device_class=SensorDeviceClass.DURATION,
    native_unit_of_measurement=UnitOfTime.SECONDS,
    suggested_display_precision=0,
)


DATABASE_SIZE_DESCRIPTION = SensorEntityDescription(
    key="database_size",
    translation_key="database_size",
    device_class=SensorDeviceClass.DATA_SIZE,
    native_unit_of_measurement=UnitOfInformation.BYTES,
)


BACKUP_DESCRIPTION = SensorEntityDescription(
    key="backup",
    translation_key="backup",
    device_class=SensorDeviceClass.ENUM,
    options=list(BACKUP_STATES),
)


VACATION_DESCRIPTION = SensorEntityDescription(
    key="vacation",
    translation_key="vacation",
    device_class=SensorDeviceClass.ENUM,
    options=list(VACATION_STATES),
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
            HouseHealthSensor(entry, HOUSE_DESCRIPTION),
            BatteryWeakestSensor(entry, BATTERY_WEAKEST_DESCRIPTION),
            BatteryNextChangeSensor(entry, BATTERY_NEXT_DESCRIPTION),
            AutoPauseSensor(entry, AUTO_PAUSE_DESCRIPTION),
            UpdateWatchSensor(entry, UPDATE_WATCH_DESCRIPTION),
            StartTimeSensor(entry, START_TIME_DESCRIPTION),
            DatabaseSizeSensor(entry, DATABASE_SIZE_DESCRIPTION),
            BackupSensor(entry, BACKUP_DESCRIPTION),
            VacationSensor(entry, VACATION_DESCRIPTION),
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


def _shared(scanner: Any, name: str, key: tuple[Any, ...], make: Callable[[], Any]) -> Any:
    """What the sensors of one signal share: worked out once for the same snapshot and decisions.

    Every sensor reads the same numbers when the signal comes; without this each of the fourteen
    would go through all findings and objects again, once per note or decision the person makes.
    """
    cache = getattr(scanner, "__dict__", None)
    if cache is None:
        return make()
    store = cache.setdefault("_sensor_values", {})
    held = store.get(name)
    if held is not None and held[0] == key:
        return held[1]
    value = make()
    store[name] = (key, value)
    return value


def _snapshot_key(scanner: Any) -> tuple[Any, ...]:
    return (id(scanner.snapshot), getattr(scanner, "_values_generation", 0))


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
        snapshot = scanner.snapshot if scanner else None
        values = (
            _shared(scanner, "values", _snapshot_key(scanner), lambda: compute_values(snapshot))
            if scanner
            else compute_values(snapshot)
        )
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


class HouseHealthSensor(HousekeeperSensor):
    """How the house is doing, for the dashboard card: the state, the objects per topic and what changed.

    The card reads these attributes, so they stay out of the recorder: only the state is history.
    """

    _unrecorded_attributes = frozenset({"objects", "topics", "new", "resolved", "since"})

    def _update(self) -> None:
        scanner = self.scanner
        snapshot = scanner.snapshot if scanner else None
        # Numbers taken while Home Assistant is still starting would be wrong; stay "unknown".
        if snapshot is None or snapshot["meta"].get("preliminary"):
            self._attr_native_value = None
            self._attr_extra_state_attributes = {}
            return
        health = house_health(snapshot, scanner.history.previous)
        self._attr_native_value = health.pop("state")
        self._attr_extra_state_attributes = health


class AutoPauseSensor(HousekeeperSensor):
    """How many integrations are paused; who, why and when the next attempt is as attributes, for the card.

    It follows every change of the pauses, not only the scans. The attributes stay out of the recorder.
    """

    _unrecorded_attributes = frozenset({"enabled", "paused", "max_days"})

    async def async_added_to_hass(self) -> None:
        self._update()
        for signal in (SIGNAL_SCAN_COMPLETE, SIGNAL_AUTO_PAUSE):
            self.async_on_remove(async_dispatcher_connect(self.hass, signal, self._handle_update))

    def _update(self) -> None:
        scanner = self.scanner
        if scanner is None:
            self._attr_native_value = None
            self._attr_extra_state_attributes = {}
            return
        view = scanner.auto_pause.card_view()
        self._attr_native_value = len(view["paused"])
        self._attr_extra_state_attributes = view


class StartTimeSensor(HousekeeperSensor):
    """How long the last start of Home Assistant took, for the card; usual time, strip and slowest integrations as attributes.

    Changes once per start. The attributes stay out of the recorder.
    """

    _unrecorded_attributes = frozenset(
        {"started_at", "update", "usual_seconds", "change_percent", "slower", "history", "slowest"}
    )

    def _update(self) -> None:
        scanner = self.scanner
        view = start_view(scanner.starts.starts) if scanner else {}
        self._attr_native_value = view.pop("state", None)
        self._attr_extra_state_attributes = view


class DatabaseSizeSensor(HousekeeperSensor):
    """How big the database is (files and journal), for the card; change, daily sizes and hints as attributes.

    Read from what each scan keeps anyway, never from a query of the recorder tables. The attributes stay out of the
    recorder.
    """

    _unrecorded_attributes = frozenset(
        {
            "wal_bytes",
            "wal_large",
            "growing_fast",
            "per_day",
            "change_bytes",
            "change_days",
            "history",
            "keep_days",
            "dialect",
            "estimated",
        }
    )

    def _update(self) -> None:
        scanner = self.scanner
        snapshot = scanner.snapshot if scanner else None
        view: dict[str, Any] = {}
        if scanner is not None and snapshot is not None and not snapshot["meta"].get("preliminary"):
            view = database_view(
                snapshot["meta"].get("database"), scanner.events.sizes, datetime.now(UTC).date()
            )
        self._attr_native_value = view.pop("state", None)
        self._attr_extra_state_attributes = view


class BackupSensor(HousekeeperSensor):
    """Whether the backups protect the house, for the card; age, copy off the device and the week as attributes.

    Read from the backup report each scan keeps anyway, never from a query of its own. The attributes stay out of the
    recorder.
    """

    _unrecorded_attributes = frozenset(
        {
            "outside",
            "newest_at",
            "age_hours",
            "limit_hours",
            "external_copy",
            "external_count",
            "size",
            "size_unusual",
            "failed_days",
            "last_run_failed",
            "encrypted",
            "history",
        }
    )

    def _update(self) -> None:
        scanner = self.scanner
        view = backup_view(scanner.backup_report if scanner else None, dt_util.now())
        self._attr_native_value = view.pop("state", None)
        self._attr_extra_state_attributes = view


class VacationSensor(HousekeeperSensor):
    """Whether the vacation mode is on, for the card; the failures held back, the rules and the grace period as attributes.

    Follows the switch as well as the scans (a change of the switch looks at every finding again and tells the sensors).
    The attributes stay out of the recorder.
    """

    _unrecorded_attributes = frozenset(
        {"entity", "held", "rules", "grace_hours", "after_until", "ended_at", "missing"}
    )

    _grace_timer: CALLBACK_TYPE | None = None

    async def async_will_remove_from_hass(self) -> None:
        self._stop_timer()

    def _stop_timer(self) -> None:
        if self._grace_timer is not None:
            self._grace_timer()
            self._grace_timer = None

    def _update(self) -> None:
        scanner = self.scanner
        snapshot = scanner.snapshot if scanner else None
        self._stop_timer()
        if snapshot is None or snapshot["meta"].get("preliminary"):
            self._attr_native_value = None
            self._attr_extra_state_attributes = {}
            return
        view = vacation_view(snapshot["meta"].get("vacation"), dt_util.utcnow())
        self._attr_native_value = view.pop("state")
        self._attr_extra_state_attributes = view
        # The grace period ends by itself, without a scan: the sensor looks again when it is over.
        if self._attr_native_value == "after" and view.get("after_until") and self.hass:
            self._grace_timer = async_track_point_in_utc_time(
                self.hass,
                lambda _now: self._handle_update(),
                datetime.fromisoformat(view["after_until"]),
            )


class UpdateWatchSensor(HousekeeperSensor):
    """What stopped working since the last update, for the card: the verdict of the watch and the worst objects.

    "none" while no update was watched. Wording stays "since", never "because"; the lists stay out of the recorder.
    """

    _unrecorded_attributes = frozenset(
        {
            "started_at",
            "until",
            "open",
            "samples",
            "triggers",
            "next_check",
            "problems",
            "problems_total",
            "silent",
            "fixed",
            "transient",
            "new_findings",
            "new_repairs",
            "start_seconds",
            "start_usual_seconds",
        }
    )

    def _update(self) -> None:
        scanner = self.scanner
        snapshot = scanner.snapshot if scanner else None
        if scanner is None or snapshot is None or snapshot["meta"].get("preliminary"):
            self._attr_native_value = None
            self._attr_extra_state_attributes = {}
            return
        watches = scanner.watch.watches
        view = update_view(
            watches[-1] if watches else None,
            scanner.watch_marked(snapshot),
            snapshot["objects"],
            scanner.starts.starts,
        )
        self._attr_native_value = view.pop("state")
        self._attr_extra_state_attributes = view


class _BatterySensor(HousekeeperSensor):
    """What the battery card shows; the lists stay out of the recorder, only the state is history."""

    def _overview(self) -> dict[str, Any] | None:
        scanner = self.scanner
        snapshot = scanner.snapshot if scanner else None
        # Numbers taken while Home Assistant is still starting would be wrong; stay "unknown".
        if snapshot is None or snapshot["meta"].get("preliminary"):
            return None
        ids = [
            o["object_id"]
            for o in snapshot["objects"]
            if o["object_type"] == "entity" and o.get("device_class") == "battery"
        ]
        types = {**noted_types(snapshot["objects"], ids), **scanner.batteries.types}
        key = (
            *_snapshot_key(scanner),
            id(scanner.battery_forecast),
            scanner.battery_forecast_at,
            tuple(sorted(types.items())),
            datetime.now(UTC).date(),
        )
        return _shared(
            scanner,
            "battery",
            key,
            lambda: battery_overview(
                snapshot, types, scanner.battery_forecast, scanner.battery_forecast_at
            ),
        )


class BatteryWeakestSensor(_BatterySensor):
    """The lowest level of all batteries; the weakest ones, the next round of changes and what to buy as attributes."""

    _unrecorded_attributes = frozenset(
        {
            "weakest",
            "round",
            "round_days",
            "shopping",
            "unknown_type",
            "total",
            "low",
            "forecast_at",
        }
    )

    def _update(self) -> None:
        overview = self._overview()
        if overview is None:
            self._attr_native_value = None
            self._attr_extra_state_attributes = {}
            return
        self._attr_native_value = overview["lowest"]
        self._attr_extra_state_attributes = {
            key: overview[key]
            for key in (
                "weakest",
                "round",
                "round_days",
                "shopping",
                "unknown_type",
                "total",
                "low",
                "forecast_at",
            )
        }


class BatteryNextChangeSensor(_BatterySensor):
    """When the first battery will probably run low, for automations: who is due and what to buy as attributes."""

    _unrecorded_attributes = frozenset({"names", "shopping"})

    def _update(self) -> None:
        overview = self._overview()
        if overview is None:
            self._attr_native_value = None
            self._attr_extra_state_attributes = {}
            return
        self._attr_native_value = overview["first_change"]
        self._attr_extra_state_attributes = {
            "names": [item["name"] for item in overview["round"]][:10],
            "shopping": {entry["type"]: entry["count"] for entry in overview["shopping"]},
        }


class MonitorSensor(SensorEntity):
    """The current, possibly unverified state of one selected function."""

    # What the dashboard card reads besides the state; it changes rarely and is no history of its own.
    _unrecorded_attributes = frozenset(
        {
            "function_id",
            "function_name",
            "members_total",
            "members_ok",
            "members_problem",
            "members_unverified",
            "problem_object",
            "history_30d",
        }
    )
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
                unique_id = cast(str, self.unique_id)
                entity_id = registry.async_get_entity_id("sensor", DOMAIN, unique_id)
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
                **self._member_attributes(result, scanner),
                **self._history_attributes(scanner.monitor),
            }
            if result
            else {}
        )

    def _member_attributes(self, result: dict[str, Any], scanner: Any) -> dict[str, Any]:
        """The name of the function, how many of its objects are fine and which one is the reason."""
        members = result.get("members") or []
        attributes: dict[str, Any] = {
            "function_id": self.function_id,
            "function_name": self._definition_name(),
            "members_total": len(members),
            "members_ok": sum(1 for m in members if m["state"] == "ok"),
            "members_problem": sum(1 for m in members if m["state"] == "problem"),
            "members_unverified": sum(1 for m in members if m["state"] == "unverified"),
        }
        key = result.get("reason_key")
        if key and result["state"] in ("problem", "unverified"):
            snapshot = scanner.snapshot or {}
            found = next(
                (
                    o
                    for o in snapshot.get("objects", ())
                    if f"{o['object_type']}:{o['object_id']}" == key
                ),
                None,
            )
            attributes["problem_object"] = (found or {}).get("name") or key.partition(":")[2]
        return attributes

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
            # The worst state of each day, oldest first, for the strip of the card ("" = nothing known that day).
            "history_30d": [day["state"] or "" for day in shares["days"]],
        }
