"""HA Housekeeper integration."""

from __future__ import annotations

import asyncio
import hashlib
import logging
import time
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STOP, Platform
from homeassistant.core import CoreState, HomeAssistant, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
    async_track_time_interval,
)
from homeassistant.helpers.start import async_at_started
from homeassistant.helpers.typing import ConfigType

from . import criteria as criteria_module
from . import db_health as db_health_module
from . import reliability as reliability_module
from . import storms as storms_module
from .const import (
    CONF_HISTORY_DAYS,
    CONF_LOW_BATTERY_PERCENT,
    CONF_OUTAGE_HIGH_HOURS,
    CONF_OUTAGE_INFO_MINUTES,
    CONF_OUTAGE_LOW_HOURS,
    CONF_OUTAGE_MEDIUM_HOURS,
    CONF_SCAN_INTERVAL_HOURS,
    CONF_STALE_HOURS,
    CONF_UNUSED_AUTOMATION_DAYS,
    CONF_WATCH_HOURS,
    DEFAULT_HISTORY_DAYS,
    DEFAULT_LOW_BATTERY_PERCENT,
    DEFAULT_SCAN_INTERVAL_HOURS,
    DEFAULT_STALE_HOURS,
    DEFAULT_UNUSED_AUTOMATION_DAYS,
    DEFAULT_WATCH_HOURS,
    DOMAIN,
    FONTS_URL,
    FRONTEND_URL,
    LOGO_URL,
    PANEL_ELEMENT,
    PANEL_URL,
    WARMUP_SECONDS,
)
from .db_health import sample_size
from .inventory import InventoryScanner
from .issues import async_clear_issues
from .maintenance import recorder_costs
from .outage_levels import thresholds_from_options
from .runs import run_key
from .scan_coverage import RETRY_LIMIT, RETRY_MINUTES, retryable_gaps
from .scan_trigger import ScanRefused
from .services import async_register_services
from .system_usage import system_light
from .watch import UPDATE_ENTITIES
from .websocket_api import async_register as async_register_websocket

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

PLATFORMS = [Platform.SENSOR, Platform.EVENT, Platform.BUTTON]
REPLY_PAUSE = 20  # seconds between two prepared views


async def _async_initial_scan(scanner: InventoryScanner) -> None:
    """Run the initial scan without leaking a background-task exception."""
    try:
        await scanner.async_scan()
    except Exception:  # Scanner status retains the user-facing error.
        _LOGGER.exception("Initial HA Housekeeper inventory scan failed")


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up global API handlers once."""
    hass.data.setdefault(DOMAIN, {})
    async_register_websocket(hass)
    async_register_services(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up HA Housekeeper from a config entry."""
    scanner = InventoryScanner(hass)
    # Home Assistant reports "started" while slow integrations are still adding entities, so scans
    # during the boot (also ones the panel triggers early) and shortly after it are preliminary.
    booting = hass.state is not CoreState.running
    if booting:
        scanner.begin_boot()
    levels = thresholds_from_options(entry.options)
    scanner.outage_info_minutes = levels[CONF_OUTAGE_INFO_MINUTES]
    scanner.outage_low_hours = levels[CONF_OUTAGE_LOW_HOURS]
    scanner.outage_medium_hours = levels[CONF_OUTAGE_MEDIUM_HOURS]
    scanner.outage_high_hours = levels[CONF_OUTAGE_HIGH_HOURS]
    scanner.unused_automation_days = entry.options.get(
        CONF_UNUSED_AUTOMATION_DAYS, DEFAULT_UNUSED_AUTOMATION_DAYS
    )
    scanner.low_battery_percent = entry.options.get(
        CONF_LOW_BATTERY_PERCENT, DEFAULT_LOW_BATTERY_PERCENT
    )
    scanner.stale_hours = entry.options.get(CONF_STALE_HOURS, DEFAULT_STALE_HOURS)
    scanner.scan_interval_hours = entry.options.get(
        CONF_SCAN_INTERVAL_HOURS, DEFAULT_SCAN_INTERVAL_HOURS
    )
    scanner.history.retention_days = entry.options.get(CONF_HISTORY_DAYS, DEFAULT_HISTORY_DAYS)
    scanner.watch_hours = entry.options.get(CONF_WATCH_HOURS, DEFAULT_WATCH_HOURS)
    scanner.monitor.retention_days = scanner.history.retention_days
    await scanner.async_initialize()
    hass.data[DOMAIN]["scanner"] = scanner

    frontend_dir = Path(__file__).parent / "frontend"
    bundle = frontend_dir / "ha-housekeeper-panel.js"
    # The URL names the content: browsers may cache the bundle for good and still load every
    # new build at once, also a local one without a new version number.
    digest = await hass.async_add_executor_job(
        lambda: hashlib.sha256(bundle.read_bytes()).hexdigest()[:12]
    )
    if not hass.data[DOMAIN].get("static_path_registered"):
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(FRONTEND_URL, str(bundle), True),
                StaticPathConfig(LOGO_URL, str(Path(__file__).parent / "brand" / "logo.png"), True),
                StaticPathConfig(FONTS_URL, str(Path(__file__).parent / "fonts"), True),
            ]
        )
        hass.data[DOMAIN]["static_path_registered"] = True
    # A reload for new options keeps the panel: removing it makes Home Assistant leave the open page.
    if PANEL_URL not in hass.data.get(frontend.DATA_PANELS, {}):
        await panel_custom.async_register_panel(
            hass,
            webcomponent_name=PANEL_ELEMENT,
            frontend_url_path=PANEL_URL,
            module_url=f"{FRONTEND_URL}?v={digest}",
            sidebar_title="Housekeeper",
            sidebar_icon="mdi:broom",
            require_admin=True,
            config={"entry_id": entry.entry_id},
            config_panel_domain=DOMAIN,
        )

    # A gap that a new scan may close (Lovelace not ready, a dashboard being saved) is tried again
    # a few minutes later, a few times, instead of waiting for the next regular scan.
    retry: dict[str, Any] = {"cancel": None}

    async def _scan(*, again: bool = False) -> None:
        scanner.retry_runs = scanner.retry_runs + 1 if again else 0
        await _async_initial_scan(scanner)
        if retry["cancel"]:
            retry["cancel"]()
            retry["cancel"] = None
        if scanner.retry_runs < RETRY_LIMIT and retryable_gaps(scanner.scan_coverage.report()):
            retry["cancel"] = async_call_later(hass, RETRY_MINUTES * 60, _retry_scan)

    @callback
    def _retry_scan(_: Any) -> None:
        retry["cancel"] = None
        if scanner.paused:  # A cleanup run scans itself; look again in a while.
            retry["cancel"] = async_call_later(hass, RETRY_MINUTES * 60, _retry_scan)
            return
        entry.async_create_background_task(
            hass, _scan(again=True), "HA Housekeeper rescan after a gap"
        )

    entry.async_on_unload(lambda: retry["cancel"]() if retry["cancel"] else None)

    # Scanning while Home Assistant is still starting would classify entities of
    # integrations that have not finished loading as orphaned and persist that.
    # A final scan follows once the warm-up after "started" is over.
    @callback
    def _final_scan(_: Any) -> None:
        entry.async_create_background_task(hass, _scan(), "HA Housekeeper final startup scan")

    @callback
    def _start_initial_scan(_: HomeAssistant) -> None:
        # Once per Home Assistant run: a reload of this entry is not a restart.
        if not hass.data[DOMAIN].get("start_logged"):
            hass.data[DOMAIN]["start_logged"] = True
            scanner.events.record_start(datetime.now(UTC))
        if booting:
            scanner.begin_warmup(WARMUP_SECONDS)
            entry.async_on_unload(async_call_later(hass, WARMUP_SECONDS + 5, _final_scan))
        entry.async_create_background_task(hass, _scan(), "HA Housekeeper initial inventory scan")

    # Changed thresholds only affect the findings, so a reload with a fresh scan suffices.
    entry.async_on_unload(entry.add_update_listener(_async_options_updated))
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(async_at_started(hass, _start_initial_scan))

    @callback
    def _stopping(_: Any) -> None:
        scanner.events.mark_clean_stop()

    entry.async_on_unload(hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, _stopping))

    @callback
    def _heartbeat(_: Any) -> None:
        scanner.events.beat(datetime.now(UTC))

    entry.async_on_unload(async_track_time_interval(hass, _heartbeat, timedelta(minutes=5)))

    async def _watch_tick(_: Any) -> None:
        await scanner.async_watch_tick()

    entry.async_on_unload(async_track_time_interval(hass, _watch_tick, timedelta(minutes=5)))

    async def _mark_windows(_: Any) -> None:
        if scanner.refresh_marks_on_window_change():
            try:  # an outage counts from the end of the window: the scan grades it anew
                await scanner.async_request_scan()
            except ScanRefused:  # a plan or the start is in the way
                return

    # A mark with a window hides only inside it: look again when the clock or the sun moves it.
    entry.async_on_unload(async_track_time_interval(hass, _mark_windows, timedelta(minutes=5)))
    entry.async_on_unload(async_track_state_change_event(hass, ["sun.sun"], _mark_windows))

    async def _update_changed(event: Any) -> None:
        await scanner.async_update_changed(event.data.get("old_state"), event.data.get("new_state"))

    # An install of a system update takes the state of that moment for the watch after it.
    entry.async_on_unload(
        async_track_state_change_event(hass, list(UPDATE_ENTITIES), _update_changed)
    )

    async def _sample_load(_: Any) -> None:
        # A sample that cannot be taken is a gap in the line, nothing more.
        try:
            light = await system_light(hass)
            scanner.load.record(
                time.time(),
                {
                    "disk": (light.get("disk") or {}).get("percent"),
                    "ram": (light.get("ram") or {}).get("percent"),
                    "cpu": (light.get("cpu") or {}).get("percent"),
                    "swap": (light.get("swap") or {}).get("percent"),
                },
            )
        except Exception:
            _LOGGER.debug("Taking a load sample failed", exc_info=True)

    entry.async_on_unload(async_track_time_interval(hass, _sample_load, timedelta(minutes=5)))
    entry.async_on_unload(scanner.outage_scans.start())
    entry.async_on_unload(criteria_module.async_listen(hass, scanner.criteria))
    entry.async_on_unload(scanner.criteria.cancel_all)

    async def _collect_runs(_: Any) -> None:
        # Each collector on its own: one that fails must neither stop the other nor disturb Home Assistant.
        try:
            await scanner.runs.async_collect()
        except Exception:
            _LOGGER.exception("Collecting automation runs failed")
        try:
            snapshot = scanner.snapshot
            present = (
                {run_key(o) for o in snapshot["objects"] if o["object_type"] == "automation"}
                if snapshot
                else None
            )
            await scanner.coverage.async_collect(present)
        except Exception:
            _LOGGER.exception("Collecting trigger and branch coverage failed")
        try:
            await sample_size(hass, scanner.events)
        except Exception:
            _LOGGER.exception("Noting the database size failed")

    entry.async_on_unload(async_track_time_interval(hass, _collect_runs, timedelta(minutes=15)))

    async def _prepare_replies() -> None:
        # The slow recorder views open with the last numbers; this keeps them from getting old, but
        # only for views and windows that were opened once. One after the other with a pause, so
        # the shared query lock is never held for long at a stretch. A busy recorder makes a run
        # a no-op (the shared query lock), a failure only costs a log line.
        if scanner.paused or not scanner.replies.replies:
            return
        try:
            snapshot = await scanner.async_get_snapshot()
            for key in sorted(scanner.replies.replies):
                kind, *rest = key.split(":")
                if kind == "reliability":
                    await reliability_module.reliability(
                        hass,
                        snapshot,
                        window_days=int(rest[0]),
                        refresh=True,
                        compare=rest[1] == "1",
                        store=scanner.replies,
                    )
                elif kind == "storms":
                    await storms_module.storms(
                        hass,
                        snapshot,
                        window_days=int(rest[0]),
                        refresh=True,
                        store=scanner.replies,
                    )
                elif kind == "costs":
                    await recorder_costs(hass, snapshot, refresh=True, store=scanner.replies)
                elif kind == "db_health":
                    await db_health_module.db_health(
                        hass, snapshot, scanner.events, refresh=True, store=scanner.replies
                    )
                await asyncio.sleep(REPLY_PAUSE)
        except Exception:
            _LOGGER.exception("Preparing the recorder views failed")

    @callback
    def _schedule_replies(_: Any) -> None:
        # A task of the entry, so an unload stops it instead of letting it query on for minutes.
        entry.async_create_background_task(
            hass, _prepare_replies(), "HA Housekeeper recorder views"
        )

    entry.async_on_unload(async_track_time_interval(hass, _schedule_replies, timedelta(minutes=30)))
    entry.async_on_unload(async_call_later(hass, WARMUP_SECONDS + 120, _schedule_replies))

    # A scan that never comes cannot report itself: look at the age of the last success every hour.
    @callback
    def _check_scan_health(_: Any) -> None:
        scanner.async_check_health()

    entry.async_on_unload(async_track_time_interval(hass, _check_scan_health, timedelta(hours=1)))

    # Regular scans keep the comparison history, findings and hints current.
    interval_hours = entry.options.get(CONF_SCAN_INTERVAL_HOURS, DEFAULT_SCAN_INTERVAL_HOURS)
    if interval_hours > 0:

        @callback
        def _scheduled_scan(_: Any) -> None:
            if scanner.paused:  # A cleanup run is in progress and scans itself.
                return
            entry.async_create_background_task(
                hass, _scan(), "HA Housekeeper scheduled inventory scan"
            )

        entry.async_on_unload(
            async_track_time_interval(hass, _scheduled_scan, timedelta(hours=interval_hours))
        )
    return True


async def _async_options_updated(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload so the new thresholds apply."""
    hass.data[DOMAIN]["keep_panel"] = True
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload the integration."""
    scanner = hass.data[DOMAIN].get("scanner")
    if scanner is not None and scanner.cleanup.running:
        # The run is not tied to the entry: stop it after the current step and let it finish,
        # so the next setup does not load a journal that is still being written.
        scanner.cleanup.cancel()
        await scanner.cleanup.wait()
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        if not hass.data[DOMAIN].pop("keep_panel", False):
            frontend.async_remove_panel(hass, PANEL_URL)
        hass.data[DOMAIN].pop("scanner", None)
        if scanner is not None:
            await scanner.cleanup.flush_journal()
        async_clear_issues(hass)
    return unloaded
