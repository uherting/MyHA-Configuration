"""Seven separate quality dimensions per automation, never one score.

Every dimension says ``ok``, ``info``, ``warn``, ``red`` or ``unknown`` and names the numbers it
rests on. ``unknown`` means there is nothing to judge by (no runs observed, no criterion defined),
which is not the same as fine. The dimensions only read what the other checks already found.
"""

from __future__ import annotations

from datetime import date
from typing import Any

from .cleanup import USAGE_RELATIONS
from .const import IGNORE_LABEL
from .criteria import MISSED_MIN, MISSED_RATE, CriteriaStore
from .inventory import marked_keys

DIMENSIONS = (
    "integrity",
    "reliability",
    "effectiveness",
    "maintainability",
    "restart_safety",
    "efficiency",
    "conflicts",
)
LARGE_ACTIONS = 25
LARGE_TRIGGERS = 10
DEEP_NESTING = 5
LIMIT = 300
RANK = {"red": 0, "warn": 1, "info": 2, "unknown": 3, "ok": 4}
RELIABILITY_KINDS = {"failing", "never_ok", "overlap", "burst", "long_run", "after_update"}
RESTART_KINDS = {"long_wait", "wait_no_timeout"}
SCRIPT_DIMENSIONS = ("integrity", "reliability", "maintainability", "efficiency")
SCRIPT_SERVICES = {
    "turn_on",
    "turn_off",
    "toggle",
    "reload",
}  # the other script.* services call one script by name
STALE = {"disabled", "unavailable", "orphaned", "unknown"}
THRESHOLDS = {
    "large_actions": LARGE_ACTIONS,
    "large_triggers": LARGE_TRIGGERS,
    "deep_nesting": DEEP_NESTING,
    "criteria_missed_min": MISSED_MIN,
    "criteria_missed_rate": MISSED_RATE,
}


def _depth(node: Any) -> int:
    """How deeply actions are nested (a list inside a list of a block counts as a level)."""
    if isinstance(node, list):
        return max((_depth(child) for child in node), default=0)
    if not isinstance(node, dict):
        return 0
    deepest = 0
    for key, value in node.items():
        if key in ("choose", "if", "then", "else", "default", "sequence", "parallel", "repeat"):
            deepest = max(deepest, 1 + _depth(value))
        elif isinstance(value, list | dict):
            deepest = max(deepest, _depth(value))
    return deepest


def _dimension(level: str, *reasons: dict[str, Any]) -> dict[str, Any]:
    return {"level": level, "reasons": list(reasons)}


def _worst(levels: list[str]) -> str:
    return min(levels, key=RANK.__getitem__) if levels else "ok"


def _called_scripts(node: Any) -> set[str]:
    """Script entities a list of actions calls by name (``script.my_script``), through any nesting."""
    found: set[str] = set()
    if isinstance(node, list):
        for child in node:
            found |= _called_scripts(child)
    elif isinstance(node, dict):
        for key, value in node.items():
            if (
                key in ("service", "action")
                and isinstance(value, str)
                and value.startswith("script.")
            ):
                if value[7:] not in SCRIPT_SERVICES:
                    found.add(value)
            else:
                found |= _called_scripts(value)
    return found


def _script_callers(
    snapshot: dict[str, Any], actions_of: Any, script_actions_of: Any
) -> dict[str, dict[str, set[str]]]:
    """Script entity -> the automations and scripts that call it, by name or as a target."""
    callers: dict[str, dict[str, set[str]]] = {}

    def add(script: str, kind: str, entity_id: str) -> None:
        if script != entity_id:
            callers.setdefault(script, {"automation": set(), "script": set()})[kind].add(entity_id)

    sources = {
        f"{o['object_type']}:{o['object_id']}"
        for o in snapshot["objects"]
        if o["object_type"] in ("automation", "script")
    }
    for edge in snapshot["edges"]:
        target = str(edge["target"])
        if (
            edge["source"] in sources
            and target.startswith("entity:script.")
            and edge["relation"] == "TARGETS"
        ):
            kind, _, entity_id = str(edge["source"]).partition(":")
            add(target[7:], kind, entity_id)
    for obj in snapshot["objects"]:
        kind = obj["object_type"]
        if kind not in ("automation", "script"):
            continue
        actions = (actions_of if kind == "automation" else script_actions_of)(obj["object_id"])
        for script in _called_scripts(actions):
            add(script, kind, obj["object_id"])
    return callers


def build(
    snapshot: dict[str, Any],
    runs: dict[str, Any],
    conflict_items: list[dict[str, Any]],
    criteria: CriteriaStore,
    today: date,
    actions_of: Any,
    script_actions_of: Any = lambda entity_id: None,
) -> dict[str, Any]:
    """One row per automation with its seven dimensions and one per script with four, the worst first."""
    objects = {o["object_id"]: o for o in snapshot["objects"] if o["object_type"] == "entity"}
    rows_by_entity = {row["entity_id"]: row for row in runs.get("items", [])}
    broken: dict[str, int] = {}
    for finding in snapshot["findings"]:
        if finding["classification"] == "broken_reference" and not finding.get("ignored"):
            broken[finding["object_id"]] = broken.get(finding["object_id"], 0) + 1
    stale: dict[str, set[str]] = {}
    marked = marked_keys(snapshot["objects"])
    for edge in snapshot["edges"]:
        if edge["relation"] in USAGE_RELATIONS and edge["target"].startswith("entity:"):
            target = objects.get(edge["target"][7:])
            if (
                target
                and target["status"] in STALE
                and target.get("reason") != "integration_disabled"  # switched off on purpose
                and f"entity:{target['object_id']}" not in marked
                and IGNORE_LABEL not in (target.get("labels") or [])
                and not target.get("excepted")
            ):
                stale.setdefault(edge["source"], set()).add(target["object_id"])
    clashes: dict[str, list[dict[str, Any]]] = {}
    for item in conflict_items:
        if item.get("ignored"):
            continue
        for automation in item["automations"]:
            clashes.setdefault(automation["entity_id"], []).append(item)
    callers = _script_callers(snapshot, actions_of, script_actions_of)
    rows = []
    script_rows = []
    for obj in snapshot["objects"]:
        kind = obj["object_type"]
        if kind not in ("automation", "script"):
            continue
        entity_id = obj["object_id"]
        row = rows_by_entity.get(entity_id)
        findings = {f["kind"]: f for f in (row or {}).get("findings", [])}
        dims: dict[str, dict[str, Any]] = {}

        count = broken.get(entity_id, 0)
        gone = stale.get(f"{kind}:{entity_id}", set()) if obj["status"] != "disabled" else set()
        if count:
            dims["integrity"] = _dimension("red", {"key": "broken", "count": count})
        elif gone:
            dims["integrity"] = _dimension("warn", {"key": "stale_targets", "count": len(gone)})
        else:
            dims["integrity"] = _dimension("ok")

        reliability = [findings[k] for k in findings if k in RELIABILITY_KINDS]
        if reliability:
            level = _worst([f["level"] for f in reliability])
            dims["reliability"] = _dimension(level, *({"key": f["kind"]} for f in reliability))
        elif row and row["runs"]:
            dims["reliability"] = _dimension("ok", {"key": "runs", "count": row["runs"]})
        else:
            dims["reliability"] = _dimension("unknown", {"key": "no_runs"})

        numbers = criteria.stats(entity_id, today)
        total = numbers["ok"] + numbers["missed"]
        if entity_id not in criteria.items:
            dims["effectiveness"] = _dimension("unknown", {"key": "no_criteria"})
        elif not total:
            dims["effectiveness"] = _dimension("unknown", {"key": "not_yet_checked"})
        elif numbers["missed"] >= MISSED_MIN and numbers["missed"] / total >= MISSED_RATE:
            dims["effectiveness"] = _dimension("red", {"key": "missed", **numbers})
        elif numbers["missed"]:
            dims["effectiveness"] = _dimension("warn", {"key": "missed", **numbers})
        else:
            dims["effectiveness"] = _dimension("ok", {"key": "reached", **numbers})

        if obj.get("source") == "state_fallback":
            dims["maintainability"] = _dimension("unknown", {"key": "no_config"})
        else:
            reasons = []
            if not (obj.get("description") or "").strip():
                reasons.append({"key": "no_description"})
            if (obj.get("action_count") or 0) > LARGE_ACTIONS or (
                obj.get("trigger_count") or 0
            ) > LARGE_TRIGGERS:
                reasons.append({"key": "large"})
            if (
                _depth((actions_of if kind == "automation" else script_actions_of)(entity_id))
                >= DEEP_NESTING
            ):
                reasons.append({"key": "deep"})
            level = "warn" if any(r["key"] != "no_description" for r in reasons) else "info"
            dims["maintainability"] = _dimension(level if reasons else "ok", *reasons)

        restart = [findings[k] for k in findings if k in RESTART_KINDS]
        dims["restart_safety"] = (
            _dimension("warn", *({"key": f["kind"]} for f in restart))
            if restart
            else _dimension("ok")
        )
        dims["efficiency"] = (
            _dimension("info", {"key": "no_effect"})
            if "no_effect" in findings
            else _dimension("ok")
        )
        found = clashes.get(entity_id, [])
        if found:
            stages = {"confirmed": "red", "observed": "warn", "static": "info"}
            dims["conflicts"] = _dimension(
                _worst([stages[i["stage"]] for i in found]),
                {"key": "conflict", "count": len(found)},
            )
        else:
            dims["conflicts"] = _dimension("ok")
        if kind == "script":
            dims = {key: dims[key] for key in SCRIPT_DIMENSIONS}
        item = {
            "entity_id": entity_id,
            "name": obj.get("name") or entity_id,
            "status": obj.get("status"),
            "dimensions": dims,
            "worst": _worst([d["level"] for d in dims.values() if d["level"] != "unknown"]),
        }
        if kind == "script":
            used = callers.get(entity_id, {"automation": set(), "script": set()})
            script_rows.append({**item, "callers": {k: len(v) for k, v in used.items()}})
        else:
            rows.append(item)
    rows.sort(key=lambda r: (RANK[r["worst"]], r["name"]))
    script_rows.sort(key=lambda r: (RANK[r["worst"]], r["name"]))
    return {
        "checked": len(rows),
        "total": len(rows),
        "items": rows[:LIMIT],
        "scripts": script_rows[:LIMIT],
        "scripts_total": len(script_rows),
        "dimensions": list(DIMENSIONS),
        "script_dimensions": list(SCRIPT_DIMENSIONS),
        "thresholds": THRESHOLDS,
    }
