"""Constants for Notification History."""
from __future__ import annotations

DOMAIN = "notification_history"

CONF_TARGETS = "targets"
CONF_MAX_DAYS = "max_days"
CONF_MAX_COUNT = "max_count"
CONF_LOGBOOK = "logbook"

DEFAULT_MAX_DAYS = 90
DEFAULT_MAX_COUNT = 500

# Notify platforms that write to a log or a file: not notifications a person
# receives, so never recorded. persistent_notification has its own panel in HA.
EXCLUDED_PLATFORMS = frozenset({"file", "syslog", "persistent_notification"})
EXCLUDED_SERVICES = frozenset({"persistent_notification"})

# Companion app command messages (iOS and Android): they drive the app, they are
# not shown to anyone. See companion.home-assistant.io/docs/notifications/notification-commands
COMMAND_MESSAGES = frozenset(
    {
        "clear_badge",
        "clear_notification",
        "remove_channel",
        "request_location_update",
        "update_complications",
        "update_widgets",
    }
)
COMMAND_PREFIXES = ("command_", "kiosk_")

EVENT_ACTION = "mobile_app_notification_action"
EVENT_CLEARED = "mobile_app_notification_cleared"

STATUS_SENT = "sent"
STATUS_REPLACED = "replaced"
STATUS_REMOVED = "removed"  # clear_notification sent by HA for this tag
STATUS_CLEARED = "cleared"  # dismissed on the device (Android only)
STATUS_ACTION = "action"  # a button was tapped, see record["action_title"]

SIGNAL_UPDATED = f"{DOMAIN}_updated"
