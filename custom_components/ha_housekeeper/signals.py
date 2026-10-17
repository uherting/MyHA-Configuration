"""Home Assistant events for your own automations, one per new situation.

After each finished scan Housekeeper looks for a few situations and fires an event on the bus for
each one that is new: ``ha_housekeeper_critical_finding``, ``ha_housekeeper_backup_overdue``,
``ha_housekeeper_quarantine_expired``, ``ha_housekeeper_followup_regression`` and
``ha_housekeeper_integration_down`` and ``ha_housekeeper_reminder_due``. Nothing leaves Home Assistant and nothing is sent by
Housekeeper itself. A situation is announced once; it can be announced again after it ended. The
first time, what exists already counts as announced, so switching this on starts quiet.
The payloads hold ids, counts and ages only, never names or texts.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import QUARANTINE_DAYS, SIGNALS_STORAGE_KEY, STORAGE_VERSION

SAVE_DELAY = 10
SEEN_LIMIT = 1000
PER_SCAN = 20  # events fired in one scan at most; the rest follow in later scans
EVENT_PREFIX = "ha_housekeeper_"
EVENTS = (
    "critical_finding",
    "backup_overdue",
    "quarantine_expired",
    "followup_regression",
    "integration_down",
    "reminder_due",
)


def situations(
    snapshot: dict[str, Any],
    plans: list[dict[str, Any]],
    backup: dict[str, Any] | None,
    now: datetime,
    reminders: list[dict[str, Any]] | None = None,
) -> dict[str, tuple[str, dict[str, Any]]]:
    """Everything that is the case now: key -> (event name, payload)."""
    found: dict[str, tuple[str, dict[str, Any]]] = {}
    for finding in snapshot["findings"]:
        if finding.get("impact") == "high" and not finding.get("ignored"):
            found[f"critical:{finding['key']}"] = (
                "critical_finding",
                {
                    "object_id": finding["object_id"],
                    "rule_id": finding["rule_id"],
                    "classification": finding["classification"],
                },
            )
    newest = next(
        (
            c
            for c in (backup or {}).get("checks", [])
            if c["id"] == "newest" and c["level"] == "problem"
        ),
        None,
    )
    if newest is not None and (backup or {}).get("available"):
        values = newest.get("values") or {}
        found[f"backup:{values.get('date')}"] = (
            "backup_overdue",
            {"age_hours": values.get("age_hours"), "limit_hours": values.get("limit_hours")},
        )
    for entry in snapshot.get("quarantine", []):
        try:
            days = (now - datetime.fromisoformat(entry["since"])).days
        except (KeyError, TypeError, ValueError):
            continue
        if days >= QUARANTINE_DAYS:
            found[f"quarantine:{entry['object_type']}:{entry['object_id']}:{entry['since']}"] = (
                "quarantine_expired",
                {
                    "object_type": entry["object_type"],
                    "object_id": entry["object_id"],
                    "days": days,
                },
            )
    for plan in plans:
        if (plan.get("followup") or {}).get("state") == "regression":
            found[f"followup:{plan['plan_id']}"] = (
                "followup_regression",
                {"plan_id": plan["plan_id"], "new_count": plan["followup"].get("new_count", 0)},
            )
    for cause in snapshot.get("causes", []):
        if cause["kind"] == "integration_down":
            found[f"cause:{cause['id']}"] = (
                "integration_down",
                {
                    "object_id": cause["object_id"],
                    "domain": cause.get("domain"),
                    "follower_count": cause["follower_count"],
                },
            )
    for reminder in reminders or []:
        if reminder["state"] == "due":
            found[f"reminder:{reminder['id']}:{reminder['due']}"] = (
                "reminder_due",
                {"reminder_id": reminder["id"], "days_overdue": -reminder["days_left"]},
            )
    return found


class SignalStore:
    """The situations announced already."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, SIGNALS_STORAGE_KEY)
        self.seen: list[str] = []
        self.primed = False

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if isinstance(data, dict) and data.get("primed") is True:
            self.primed = True
            seen = data.get("seen")
            self.seen = (
                [k for k in seen if isinstance(k, str)][-SEEN_LIMIT:]
                if isinstance(seen, list)
                else []
            )

    def fresh(
        self, current: dict[str, tuple[str, dict[str, Any]]], unknown: tuple[str, ...] = ()
    ) -> list[tuple[str, dict[str, Any]]]:
        """The situations not announced yet; they count as announced afterwards.

        Over ``PER_SCAN`` new ones, the rest stay unannounced for the next scan. Keys that start
        with one of ``unknown`` are kept as they are because their source could not be read.
        """
        if not self.primed:
            self.primed = True
            self.seen = list(current)[-SEEN_LIMIT:]
            self._save()
            return []
        new = [key for key in current if key not in self.seen][:PER_SCAN]
        kept = [key for key in self.seen if key in current or key.startswith(unknown)]
        merged = [*kept, *new][-SEEN_LIMIT:]
        if merged != self.seen:
            self.seen = merged
            self._save()
        return [current[key] for key in new]

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"primed": self.primed, "seen": self.seen}, SAVE_DELAY)


def fire(hass: HomeAssistant, items: list[tuple[str, dict[str, Any]]]) -> None:
    for event, payload in items:
        hass.bus.async_fire(f"{EVENT_PREFIX}{event}", payload)
