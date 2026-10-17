"""Pure housekeeping heuristics: duplicate entity suspects and forgotten automations."""

from __future__ import annotations

import re
from datetime import datetime, timedelta
from typing import Any

from .battery_kind import excluded

SUFFIXED_NAME = re.compile(r"^(?P<base>.+?)_(?P<number>\d+)$")
LEFTOVER_STATUSES = frozenset({"unavailable", "orphaned", "unknown"})


def finding_key(finding: dict[str, Any]) -> str:
    """Stable identity of a finding across scans."""
    return f"{finding['rule_id']}|{finding['object_id']}|{finding.get('affected_object') or ''}"


def mark_duplicates(entities: list[dict[str, Any]]) -> None:
    """Set ``duplicate_of`` on entities that look like leftovers of an active twin.

    Re-adding a device often creates ``sensor.x_2`` while the old ``sensor.x`` stays.
    Only an entity that is not working, from the same integration as a working
    entity with the unsuffixed name, is marked; two active entities are never.
    """
    by_id = {item["object_id"]: item for item in entities}
    for item in entities:
        item["duplicate_of"] = None
        if item["status"] not in LEFTOVER_STATUSES:
            continue
        domain, _, name = item["object_id"].partition(".")
        match = SUFFIXED_NAME.match(name)
        if not match:
            continue
        twin = by_id.get(f"{domain}.{match['base']}")
        if twin and twin["status"] == "active" and twin["platform"] == item["platform"]:
            item["duplicate_of"] = twin["object_id"]


def duplicate_findings(entities: list[dict[str, Any]], keep: Any) -> list[dict[str, Any]]:
    """Create findings for marked duplicates; ``keep`` filters out short outages."""
    return [
        {
            "rule_id": "entity.possible_duplicate",
            "object_id": item["object_id"],
            "classification": "possible_duplicate",
            "confidence": 0.7,
            "first_detected_at": item.get("status_since"),
            "affected_object": item["duplicate_of"],
            "evidence": [{"kind": "possible_duplicate", "source": "entity_registry"}],
        }
        for item in entities
        if item.get("duplicate_of") and keep(item)
    ]


def _age(value: str | None, now: datetime) -> timedelta | None:
    if not value:
        return None
    try:
        return now - datetime.fromisoformat(value)
    except ValueError:
        return None


def automation_hygiene_findings(
    automations: list[dict[str, Any]], now: datetime, days: int
) -> list[dict[str, Any]]:
    """Find automations that are switched off or never run for ``days`` days."""
    if days <= 0:
        return []
    limit = timedelta(days=days)
    findings: list[dict[str, Any]] = []

    def add(item: dict[str, Any], rule: str, age: timedelta, confidence: float) -> None:
        findings.append(
            {
                "rule_id": f"automation.{rule}",
                "object_id": item["object_id"],
                "classification": "unused",
                "confidence": confidence,
                "first_detected_at": item.get("status_since") if rule == "disabled_long" else None,
                "evidence": [{"kind": rule, "source": "automation_state", "days": age.days}],
            }
        )

    for item in automations:
        if item["object_type"] != "automation":
            continue
        if item["status"] == "disabled":
            age = _age(item.get("status_since"), now)
            if age is not None and age >= limit:
                add(item, "disabled_long", age, 0.7)
        elif item["status"] == "active":
            if item.get("last_triggered"):
                age = _age(item["last_triggered"], now)
                if age is not None and age >= limit:
                    add(item, "stale", age, 0.6)
            else:
                age = _age(item.get("created_at") or item.get("status_since"), now)
                if age is not None and age >= limit:
                    add(item, "never_triggered", age, 0.6)
    return findings


ENTITY_ID_SHAPE = re.compile(r"^[a-z0-9_]+\.[a-z0-9_]+$")
MAX_ORPHANED_STATISTICS = 500


def orphan_statistics(
    statistics: list[dict[str, Any]], existing_entities: set[str], energy_ids: set[str]
) -> list[dict[str, Any]]:
    """Recorder statistics of entities that no longer exist.

    External statistics (``domain:name``) and anything that is not an entity ID are
    ignored. Statistics the Energy dashboard still refers to are flagged, not hidden.
    """
    orphans = [
        {
            "statistic_id": item["statistic_id"],
            "unit": item.get("display_unit_of_measurement")
            or item.get("statistics_unit_of_measurement"),
            "has_mean": bool(item.get("has_mean")),
            "has_sum": bool(item.get("has_sum")),
            "in_energy": item["statistic_id"] in energy_ids,
        }
        for item in statistics
        if item.get("source", "recorder") == "recorder"
        and ENTITY_ID_SHAPE.match(item["statistic_id"])
        and item["statistic_id"] not in existing_entities
    ]
    orphans.sort(key=lambda orphan: orphan["statistic_id"])
    return orphans[:MAX_ORPHANED_STATISTICS]


def battery_level(item: dict[str, Any]) -> tuple[float | None, bool]:
    """Return (percent, is_low_flag) for a working battery entity, else (None, False).

    Battery sensors report a percentage; battery binary sensors report ``on`` when low. A sensor
    with another unit (volts, for example) is not a percentage and is judged by ``battery_voltage``.
    """
    if item.get("device_class") != "battery" or item.get("status") != "active" or excluded(item):
        return None, False
    domain = item["object_id"].partition(".")[0]
    if domain == "binary_sensor":
        return None, item.get("state") == "on"
    if domain == "sensor":
        if item.get("unit") not in (None, "", "%"):
            return None, False
        try:
            return float(item["state"]), False
        except (TypeError, ValueError):
            return None, False
    return None, False


def low_battery_ids(entities: list[dict[str, Any]], threshold: int) -> list[str]:
    """Return IDs of working batteries at or below ``threshold`` percent or flagged low."""
    low = []
    for item in entities:
        level, flagged = battery_level(item)
        if flagged or (level is not None and level <= threshold):
            low.append(item["object_id"])
    return low


TOTAL_CLASSES = ("total", "total_increasing")
CLASSES = ("measurement", *TOTAL_CLASSES)


def statistic_continuity(
    statistics: list[dict[str, Any]], entities: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    """Working entities whose long-term statistics no longer fit their unit or state class.

    Only the recorder's metadata is read, never the values. A unit counts as changed only when the
    recorder says the old unit cannot be converted into the new one (``unit_class`` is empty);
    without that field nothing is judged. A state class counts as changed when the statistics
    have a sum and the class is ``measurement``, or have none and the class is a total class.
    """
    meta = {s["statistic_id"]: s for s in statistics if s.get("source", "recorder") == "recorder"}
    issues = []
    for item in entities:
        stat = meta.get(item["object_id"])
        if stat is None or item.get("status") != "active":
            continue
        unit, stat_unit = item.get("unit"), stat.get("statistics_unit_of_measurement")
        if (
            unit
            and stat_unit
            and unit != stat_unit
            and "unit_class" in stat
            and not stat["unit_class"]
        ):
            issues.append(
                {"object_id": item["object_id"], "kind": "unit", "was": stat_unit, "now": unit}
            )
        state_class = item.get("state_class")
        if state_class in CLASSES and bool(stat.get("has_sum")) != (state_class in TOTAL_CLASSES):
            issues.append(
                {
                    "object_id": item["object_id"],
                    "kind": "class",
                    "was": "total" if stat.get("has_sum") else "measurement",
                    "now": state_class,
                }
            )
    return issues[:MAX_ORPHANED_STATISTICS]
