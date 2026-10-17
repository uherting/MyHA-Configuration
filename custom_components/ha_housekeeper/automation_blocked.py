"""Automations that cannot start because every one of their triggers watches a dead entity.

An automation with a time trigger next to a dead sensor still runs, so it counts only when each
trigger refers to entities and all of them are out of order. A trigger without an entity (time,
sun, webhook, template, device) counts as working: it is not known to be dead. "Dead" is what the
entity findings already say (not available for longer than the grace, or orphaned), so what the
person has marked or hidden stays out here as well.
"""

from __future__ import annotations

import re
from typing import Any

TRIGGER_PATH = re.compile(r"^triggers?/(\d+)/")
ACTION_PATH = re.compile(r"^(?:actions?|sequence)/(\d+)/")
STATE_LIKE = (
    "unavailable",
    "unknown",
)  # a state condition that asks for these is true for a dead entity
DEAD = ("unavailable", "orphaned")
LIST_LIMIT = 10  # entities named in the evidence


def dead_entities(findings: list[dict[str, Any]]) -> set[str]:
    """The entities with an open "not available" or "orphaned" finding."""
    return {
        f["object_id"]
        for f in findings
        if f["rule_id"].startswith("entity.")
        and f["classification"] in DEAD
        and not f.get("ignored")
    }


def blocked_automation_findings(
    automations: list[dict[str, Any]], findings: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    """One finding for each active automation whose triggers are all dead."""
    dead = dead_entities(findings)
    if not dead:
        return []
    result = []
    for item in automations:
        if item["object_type"] != "automation" or item["status"] != "active":
            continue
        count = item.get("trigger_count") or 0
        if not count:
            continue
        by_trigger: dict[int, list[str]] = {}
        for ref in item.get("references") or []:
            match = TRIGGER_PATH.match(ref.get("location") or "")
            if ref.get("relation") == "TRIGGERS_ON" and ref["kind"] == "entity" and match:
                by_trigger.setdefault(int(match[1]), []).append(ref["object_id"])
        if len(by_trigger) != count or not all(set(ids) <= dead for ids in by_trigger.values()):
            continue
        entities = sorted({i for ids in by_trigger.values() for i in ids})
        result.append(
            {
                "rule_id": "automation.blocked",
                "object_id": item["object_id"],
                "classification": "problem",
                "confidence": 0.8,
                "first_detected_at": None,
                "evidence": [
                    {
                        "kind": "dead_triggers",
                        "source": "automation_config",
                        "entities": entities[:LIST_LIMIT],
                        "total": len(entities),
                    }
                ],
            }
        )
    return result


def _entities(value: Any) -> list[str]:
    ids = value if isinstance(value, list) else [value]
    return [i for i in ids if isinstance(i, str) and "." in i]


def _finding(item: dict[str, Any], rule: str, kind: str, entities: list[str]) -> dict[str, Any]:
    entities = sorted(set(entities))
    return {
        "rule_id": f"{item['object_type']}.{rule}",
        "object_id": item["object_id"],
        "classification": "problem",
        "confidence": 0.75,
        "first_detected_at": None,
        "evidence": [
            {
                "kind": kind,
                "source": "automation_config",
                "entities": entities[:LIST_LIMIT],
                "total": len(entities),
            }
        ],
    }


def dead_effect_findings(
    items: list[dict[str, Any]], findings: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    """Automations and scripts that run but change nothing, or are stopped by a dead condition.

    ``dead_actions``: every action of an active automation or script names entities and all of
    them are dead (an action without an entity, such as a notification, counts as working).
    ``dead_condition``: a top-level condition on the state or number of dead entities, which can
    never hold (unless it asks for ``unavailable`` or ``unknown``). Inside ``or`` and ``not`` a
    dead entity may well help, so only the top level is looked at.
    """
    dead = dead_entities(findings)
    if not dead:
        return []
    result = []
    for item in items:
        if item["object_type"] not in ("automation", "script") or item["status"] != "active":
            continue
        count = item.get("action_count") or 0
        by_action: dict[int, list[str]] = {}
        for ref in item.get("references") or []:
            match = ACTION_PATH.match(ref.get("location") or "")
            if ref.get("relation") == "TARGETS" and ref["kind"] == "entity" and match:
                by_action.setdefault(int(match[1]), []).append(ref["object_id"])
        if (
            count
            and len(by_action) == count
            and all(set(ids) <= dead for ids in by_action.values())
        ):
            result.append(
                _finding(
                    item, "dead_actions", "dead_actions", [i for v in by_action.values() for i in v]
                )
            )
        if item["object_type"] != "automation":
            continue
        for condition in item.get("conditions") or []:
            if not isinstance(condition, dict) or condition.get("enabled") is False:
                continue
            if condition.get("condition") not in ("state", "numeric_state"):
                continue
            ids = _entities(condition.get("entity_id"))
            wanted = condition.get("state")
            wanted = wanted if isinstance(wanted, list) else [wanted]
            if condition["condition"] == "state" and any(w in STATE_LIKE for w in wanted):
                continue
            if ids and set(ids) <= dead:
                result.append(_finding(item, "dead_condition", "dead_condition", ids))
                break
    return result
