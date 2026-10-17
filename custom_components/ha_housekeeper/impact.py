"""How much a finding matters, from what depends on the object and whether it is critical.

Only reads the objects and edges of the last scan. The answer is a level (high, medium, low, info)
with the facts behind it (an outage that has lasted under an hour is "info"), never a score: "used by 3 automations", "critical area". A missing target
of a lock automation ranks above an orphaned temperature sensor nobody uses.

An object is critical when it carries the label ``housekeeper_critical`` (itself, its device or
its area) or by its kind: locks, alarm panels, valves, sirens, garage doors and gates, and the
sensors for smoke, gas, carbon monoxide, water leaks and safety.
"""

from __future__ import annotations

from typing import Any

from .const import CRITICAL_LABEL

CRITICAL_DOMAINS = ("lock", "alarm_control_panel", "valve", "siren")
CRITICAL_COVERS = ("garage", "gate")
CRITICAL_CLASSES = ("smoke", "gas", "carbon_monoxide", "moisture", "safety")
USAGE = ("TRIGGERS_ON", "USES_AS_CONDITION", "TARGETS", "REFERENCES", "SHOWS", "INCLUDES")
CONSUMERS = ("automation", "script")
MANY = 5  # this many dependents make a finding high on their own
FACT_LIMIT = 5
RANK = {"none": 0, "info": 1, "low": 2, "medium": 3, "high": 4}
OUTAGE_RULE = "config_entry.not_loaded"


def _kind_critical(object_id: str, device_class: str | None) -> bool:
    domain = object_id.split(".", 1)[0]
    if domain in CRITICAL_DOMAINS:
        return True
    if domain == "cover":
        return device_class in CRITICAL_COVERS
    return domain == "binary_sensor" and device_class in CRITICAL_CLASSES


def critical_reason(
    item: dict[str, Any], devices: dict[str, dict[str, Any]], areas: dict[str, dict[str, Any]]
) -> str | None:
    """Why an entity counts as critical: ``label``, ``device_label``, ``area_label`` or ``kind``."""
    if CRITICAL_LABEL in (item.get("labels") or []):
        return "label"
    device = devices.get(item.get("device_id") or "")
    if device and CRITICAL_LABEL in (device.get("labels") or []):
        return "device_label"
    area = areas.get(item.get("area_id") or (device or {}).get("area_id") or "")
    if area and CRITICAL_LABEL in (area.get("labels") or []):
        return "area_label"
    if _kind_critical(item["object_id"], item.get("device_class")):
        return "kind"
    return None


def apply_impact(
    objects: list[dict[str, Any]], edges: list[dict[str, Any]], findings: list[dict[str, Any]]
) -> None:
    """Set ``impact`` and ``impact_facts`` on every finding."""
    by_key = {f"{o['object_type']}:{o['object_id']}": o for o in objects}
    devices = {o["object_id"]: o for o in objects if o["object_type"] == "device"}
    areas = {o["object_id"]: o for o in objects if o["object_type"] == "area"}
    critical = {
        o["object_id"]: reason
        for o in objects
        if o["object_type"] == "entity" and (reason := critical_reason(o, devices, areas))
    }
    for o in objects:  # cleanup asks for a separate confirmation of critical objects
        o.pop("critical", None)
        if o["object_type"] == "entity" and o["object_id"] in critical:
            o["critical"] = critical[o["object_id"]]
    users: dict[str, list[str]] = {}
    controls: dict[str, list[str]] = {}
    for edge in edges:
        if edge["relation"] not in USAGE:
            continue
        users.setdefault(edge["target"], []).append(edge["source"])
        if edge["relation"] == "TARGETS":
            controls.setdefault(edge["source"], []).append(edge["target"])
    for finding in findings:
        level, facts = _judge(finding, by_key, users, controls, critical)
        if finding["rule_id"] == OUTAGE_RULE or "outage_level" in finding:
            # the longer something stays down, the more it matters
            aged = finding.pop("outage_level", None) or "info"
            facts.append({"fact": "outage_age", "level": aged})
            level = max(level, aged, key=RANK.__getitem__)
        finding["impact"], finding["impact_facts"] = level, facts[:FACT_LIMIT]


def _judge(
    finding: dict[str, Any],
    by_key: dict[str, dict[str, Any]],
    users: dict[str, list[str]],
    controls: dict[str, list[str]],
    critical: dict[str, str],
) -> tuple[str, list[dict[str, Any]]]:
    kind = finding["rule_id"].split(".", 1)[0]
    key = f"{kind}:{finding['object_id']}"
    item = by_key.get(key)
    facts: list[dict[str, Any]] = []
    high = False
    if finding["object_id"] in critical:
        facts.append({"fact": "critical", "why": critical[finding["object_id"]]})
        high = True
    target = finding.get("affected_object")
    if target and (target in critical or _kind_critical(target, None)):  # a missing one too
        facts.append({"fact": "target_critical", "id": target})
        high = True
    controlled = {t[7:] for t in controls.get(key, []) if t.startswith("entity:")} & critical.keys()
    if controlled:
        facts.append({"fact": "controls_critical", "n": len(controlled)})
        high = True
    sources = list(dict.fromkeys(users.get(key, [])))
    active = [
        s
        for s in sources
        if s.split(":", 1)[0] in CONSUMERS and (by_key.get(s) or {}).get("status") == "active"
    ]
    boards = [s for s in sources if s.startswith("dashboard:")]
    if active:
        facts.append({"fact": "used_by_active", "n": len(active)})
    if boards:
        facts.append({"fact": "on_dashboards", "n": len(boards)})
    own_active = kind in CONSUMERS and item is not None and item.get("status") == "active"
    if own_active:
        facts.append({"fact": "runs_active"})
    elif kind in CONSUMERS and item is not None:
        facts.append({"fact": "runs_inactive"})
    if high or len(sources) >= MANY:
        if not high:
            facts.append({"fact": "many_dependents", "n": len(sources)})
        return "high", facts
    if active or own_active:
        return "medium", facts
    if sources or kind in CONSUMERS:
        return "low", facts
    return "info", facts
