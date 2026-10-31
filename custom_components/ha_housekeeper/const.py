"""Constants for HA Housekeeper."""

from typing import Final

DOMAIN: Final = "ha_housekeeper"
NAME: Final = "HA Housekeeper"

PANEL_URL: Final = "ha-housekeeper"
PANEL_ELEMENT: Final = "ha-housekeeper-panel"
FRONTEND_URL: Final = "/ha_housekeeper/ha-housekeeper-panel.js"
LOGO_URL: Final = "/ha_housekeeper/logo.png"
FONTS_URL: Final = "/ha_housekeeper/fonts"

STORAGE_KEY: Final = f"{DOMAIN}.observations"
IGNORED_STORAGE_KEY: Final = f"{DOMAIN}.ignored"
EXCEPTIONS_STORAGE_KEY: Final = f"{DOMAIN}.exceptions"
HISTORY_STORAGE_KEY: Final = f"{DOMAIN}.history"
PREFLIGHT_STORAGE_KEY: Final = (
    f"{DOMAIN}.preflight"  # removed feature: the file is deleted on start
)
POLICIES_STORAGE_KEY: Final = f"{DOMAIN}.policies"
REPLIES_STORAGE_KEY: Final = f"{DOMAIN}.replies"
ATTEST_STORAGE_KEY: Final = f"{DOMAIN}.attest"
EVENT_AI_CHANGE: Final = f"{DOMAIN}_ai_change"  # fired for every change made through AI access
EVENTS_STORAGE_KEY: Final = f"{DOMAIN}.events"
RUNS_STORAGE_KEY: Final = f"{DOMAIN}.runs"
CHANGES_STORAGE_KEY: Final = f"{DOMAIN}.config_changes"
MARKS_STORAGE_KEY: Final = f"{DOMAIN}.marks"
GOALS_STORAGE_KEY: Final = f"{DOMAIN}.goals"
CRITERIA_STORAGE_KEY: Final = f"{DOMAIN}.criteria"
COVERAGE_STORAGE_KEY: Final = f"{DOMAIN}.coverage"
REFACTOR_STORAGE_KEY: Final = f"{DOMAIN}.refactor"
PROTECTION_STORAGE_KEY: Final = f"{DOMAIN}.protection"
SIGNALS_STORAGE_KEY: Final = f"{DOMAIN}.signals"
ENTRY_STATES_STORAGE_KEY: Final = f"{DOMAIN}.entry_states"
AUTO_PAUSE_STORAGE_KEY: Final = f"{DOMAIN}.auto_pause"
REMINDERS_STORAGE_KEY: Final = f"{DOMAIN}.reminders"
NOTES_STORAGE_KEY: Final = f"{DOMAIN}.notes"
BATTERY_STORAGE_KEY: Final = f"{DOMAIN}.batteries"
WINDOW_STORAGE_KEY: Final = f"{DOMAIN}.window"  # removed feature: the file is deleted on start
NOTIFY_STORAGE_KEY: Final = f"{DOMAIN}.notify"
HINTS_STORAGE_KEY: Final = f"{DOMAIN}.hints"
MCP_STORAGE_KEY: Final = f"{DOMAIN}.mcp"
STALE_STORAGE_KEY: Final = f"{DOMAIN}.stale"
SCAN_HEALTH_STORAGE_KEY: Final = f"{DOMAIN}.scan_health"
MONITOR_STORAGE_KEY: Final = f"{DOMAIN}.monitor"
LOAD_STORAGE_KEY: Final = f"{DOMAIN}.load"
WATCH_STORAGE_KEY: Final = f"{DOMAIN}.watch"
STARTS_STORAGE_KEY: Final = f"{DOMAIN}.starts"
STORAGE_VERSION: Final = 1

CONF_MIN_UNAVAILABLE_DAYS: Final = (
    "min_unavailable_days"  # replaced by the four below, read as a fallback
)
CONF_OUTAGE_INFO_MINUTES: Final = "outage_info_minutes"
CONF_OUTAGE_LOW_HOURS: Final = "outage_low_hours"
CONF_OUTAGE_MEDIUM_HOURS: Final = "outage_medium_hours"
CONF_OUTAGE_HIGH_HOURS: Final = "outage_high_hours"
DEFAULT_MIN_UNAVAILABLE_DAYS: Final = 7
DEFAULT_OUTAGE_INFO_MINUTES: Final = 15
DEFAULT_OUTAGE_LOW_HOURS: Final = 1
DEFAULT_OUTAGE_MEDIUM_HOURS: Final = 24
DEFAULT_OUTAGE_HIGH_HOURS: Final = 168
CONF_SCAN_INTERVAL_HOURS: Final = "scan_interval_hours"
DEFAULT_SCAN_INTERVAL_HOURS: Final = 6
CONF_UNUSED_AUTOMATION_DAYS: Final = "unused_automation_days"
DEFAULT_UNUSED_AUTOMATION_DAYS: Final = 90
CONF_LOW_BATTERY_PERCENT: Final = "low_battery_percent"
DEFAULT_LOW_BATTERY_PERCENT: Final = 20
CONF_STALE_HOURS: Final = "stale_hours"
DEFAULT_STALE_HOURS: Final = 48
CONF_HISTORY_DAYS: Final = "history_days"
DEFAULT_HISTORY_DAYS: Final = 30
CONF_WATCH_HOURS: Final = "watch_hours"
DEFAULT_WATCH_HOURS: Final = 24
JOURNAL_STORAGE_KEY: Final = f"{DOMAIN}.journal"
# Earliest point at which a quarantined entity may be removed (a later step, preview only today).
QUARANTINE_DAYS: Final = 14
IGNORE_LABEL: Final = "housekeeper_ignore"
CRITICAL_LABEL: Final = "housekeeper_critical"
KEEP_LABEL: Final = "housekeeper_keep"
# Allowed range (min, max) per option, shared by the options flow and the panel command.
OPTION_LIMITS: Final = {
    CONF_OUTAGE_INFO_MINUTES: (5, 1440),
    CONF_OUTAGE_LOW_HOURS: (1, 720),
    CONF_OUTAGE_MEDIUM_HOURS: (2, 2160),
    CONF_OUTAGE_HIGH_HOURS: (3, 8760),
    CONF_UNUSED_AUTOMATION_DAYS: (0, 3650),
    CONF_SCAN_INTERVAL_HOURS: (0, 720),
    CONF_LOW_BATTERY_PERCENT: (1, 100),
    CONF_STALE_HOURS: (0, 8760),
    CONF_HISTORY_DAYS: (1, 365),
    CONF_WATCH_HOURS: (0, 168),
}
# While Home Assistant is still starting, entities of slow integrations have no state yet.
# Scans in this window are preliminary: they change no stored observations, issues or history.
WARMUP_SECONDS: Final = 300
# The warm-up ends earlier: this long after no integration is loading any more (WARMUP_SECONDS stays the cap).
WARMUP_SETTLE_SECONDS: Final = 60
# An integration that is loading for less than this long does not restart the buffer (late, short set-ups are common).
WARMUP_BLIP_SECONDS: Final = 15
# How many titles of loading integrations the start notice can list (it shows the first few and unfolds the rest).
WARMUP_NAMES: Final = 60
# Version of the WebSocket reply contract; raise it when a field is renamed or removed.
API_SCHEMA: Final = 1
SIGNAL_SCAN_COMPLETE: Final = f"{DOMAIN}_scan_complete"
SIGNAL_SCAN_STARTED: Final = f"{DOMAIN}_scan_started"
# A cleanup plan starts or ends; the activity sensor follows it.
SIGNAL_PLAN_ACTIVITY: Final = f"{DOMAIN}_plan_activity"
SIGNAL_MONITOR_DEFINITIONS: Final = f"{DOMAIN}_monitor_definitions"
SIGNAL_MONITOR_EVENT: Final = f"{DOMAIN}_monitor_event"

# Undo data kept in the journal for a rewritten YAML file: files up to MAX_FILE_BACKUP are kept
# whole (byte-exact undo); one plan keeps at most MAX_PLAN_SNAPSHOTS of such copies.
MAX_FILE_BACKUP: Final = 512 * 1024
MAX_PLAN_SNAPSHOTS: Final = 2 * 1024 * 1024
