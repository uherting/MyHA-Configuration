"""Maintenance goals: what "in order" means for this house, and whether it is so right now.

Reads what Housekeeper knows already (findings, backup report, daily database sizes, policies) and
compares it with limits the person sets. Nothing is changed and the health figure is not touched.
A goal whose source is missing is ``unknown``, never ``met``; "never confirmed" counts as missed.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import GOALS_STORAGE_KEY, STORAGE_VERSION

SAVE_DELAY = 5
NEVER = "never"  # measured: the thing was never done
# id -> (unit, default limit, smallest, largest)
CATALOG: dict[str, tuple[str, int, int, int]] = {
    "broken_references": ("count", 0, 0, 100000),
    "unavailable": ("count", 10, 0, 100000),
    "backup_age": ("hours", 36, 1, 8760),
    "restore_test_age": ("days", 90, 1, 3650),
    "recorder_growth": ("mb_per_day", 50, 1, 1000000),
    "weak_batteries": ("count", 0, 0, 100000),
    "devices_without_area": ("count", 5, 0, 100000),
    "stale_sensors": ("count", 0, 0, 100000),
    "recurring_devices": ("count", 0, 0, 100000),
    "automation_errors": ("count", 0, 0, 100000),
    "blocked_automations": ("count", 0, 0, 100000),
    "orphaned_statistics": ("count", 0, 0, 1000000),
}


def _number(value: Any) -> int | None:
    return value if isinstance(value, int) and not isinstance(value, bool) else None


class GoalStore:
    """The person's choices; a goal that was never touched keeps its default and is on."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, GOALS_STORAGE_KEY)
        self.items: dict[str, dict[str, Any]] = {}

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if not isinstance(data, dict) or not isinstance(data.get("items"), dict):
            return
        for goal_id, value in data["items"].items():
            if goal_id in CATALOG and isinstance(value, dict):
                limit = _number(value.get("limit"))
                _, _, low, high = CATALOG[goal_id]
                self.items[goal_id] = {
                    "enabled": value.get("enabled") is not False,
                    "limit": limit if limit is not None and low <= limit <= high else None,
                }

    def set(self, goal_id: str, *, enabled: bool | None = None, limit: int | None = None) -> bool:
        """Change one goal; False for an unknown goal or a limit outside its range."""
        if goal_id not in CATALOG:
            return False
        _, _, low, high = CATALOG[goal_id]
        if limit is not None and not low <= limit <= high:
            return False
        item = self.items.setdefault(goal_id, {"enabled": True, "limit": None})
        if enabled is not None:
            item["enabled"] = enabled
        if limit is not None:
            item["limit"] = limit
        self._store.async_delay_save(lambda: {"items": self.items}, SAVE_DELAY)
        return True


def _check(backup: dict[str, Any] | None, check_id: str) -> dict[str, Any] | None:
    if not backup or not backup.get("available"):
        return None
    return next((c for c in backup.get("checks", []) if c["id"] == check_id), None)


def measure(
    snapshot: dict[str, Any],
    backup: dict[str, Any] | None,
    growth: dict[str, Any] | None,
    policy_rules: list[dict[str, Any]] | None,
    automation_errors: int | None = None,
) -> dict[str, Any]:
    """The current value of each goal: a number, ``NEVER``, or ``None`` when it cannot be told."""
    findings = [f for f in snapshot["findings"] if not f.get("ignored")]
    measured: dict[str, Any] = {
        "broken_references": sum(f["classification"] == "broken_reference" for f in findings),
        "unavailable": sum(f["classification"] == "unavailable" for f in findings),
        "weak_batteries": snapshot["meta"].get("low_batteries"),
        "stale_sensors": sum(f["classification"] == "stale" for f in findings),
        "recurring_devices": snapshot["meta"].get("recurring_devices"),
        "orphaned_statistics": snapshot["meta"].get("orphaned_statistics"),
        "automation_errors": automation_errors,
        "blocked_automations": sum(f.get("rule_id") == "automation.blocked" for f in findings),
    }
    newest = _check(backup, "newest")
    if newest and newest["level"] != "unknown":
        age = newest["values"].get("age_hours")
        measured["backup_age"] = NEVER if age is None else age
    restore = _check(backup, "restore_test")
    if restore:
        age = restore["values"].get("age_days")
        measured["restore_test_age"] = NEVER if age is None else age
    if growth and growth.get("known"):
        measured["recorder_growth"] = round(growth["per_day"] / 1_000_000, 1)
    rule = next((r for r in policy_rules or [] if r["id"] == "device_area"), None)
    if rule and rule["enabled"] and not rule.get("pending"):
        measured["devices_without_area"] = rule["count"]
    return measured


def evaluate(measured: dict[str, Any], settings: dict[str, dict[str, Any]]) -> dict[str, Any]:
    """Each goal with its limit, value and state: ``met``, ``missed``, ``unknown`` or ``off``."""
    goals = []
    for goal_id, (unit, default, _, _) in CATALOG.items():
        chosen = settings.get(goal_id) or {}
        enabled = chosen.get("enabled", True)
        limit = chosen.get("limit")
        limit = default if limit is None else limit
        value = measured.get(goal_id)
        if not enabled:
            state = "off"
        elif value is None:
            state = "unknown"
        else:
            state = "met" if value != NEVER and value <= limit else "missed"
        goals.append(
            {
                "id": goal_id,
                "unit": unit,
                "enabled": enabled,
                "limit": limit,
                "default": default,
                "value": None if value in (None, NEVER) else value,
                "never": value == NEVER,
                "state": state,
            }
        )
    return {
        "goals": goals,
        "met": sum(g["state"] == "met" for g in goals),
        "missed": sum(g["state"] == "missed" for g in goals),
    }
