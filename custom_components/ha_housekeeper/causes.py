"""Common causes behind many findings: a stopped app, a dead integration or device, a gap.

Only reads the objects, edges and findings of the last scan. A cause is a hint, not a proof: when
an integration is not loaded, every entity it provides is unavailable, and one note at the top is
more useful than a hundred findings. The follow-up findings get a ``cause_id`` and stay in the
list; hidden or marked findings do not count.

Causes can be chained, from the top down: an app that is stopped, the integration that hangs on
it, a device of that integration, the entities of that device. A cause carries ``parent_id`` (the
cause above it) and ``child_ids`` (the causes right below it); ``follower_count`` counts the
findings right below it and ``total_followers`` all findings below it, the own finding of a cause
below included: a device that is down because its integration is, is one problem, not two.

A cause with its own finding (an app, an integration that is not loaded, a device that is down)
is always listed, even without follow-up findings, so the outage never goes unnoticed. A missing
target (service, entity, device, area) has no object of its own: it is a cause only when several
automations, scripts or dashboards point to it, and the cause is ``virtual``.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from .impact import RANK, USAGE
from .outage_levels import Levels, outage_level

OUTAGE_STATES = frozenset({"unavailable", "unknown"})  # an entity without a value
KEY_LIMIT = 500
TARGET_MIN = 2  # automations, scripts and dashboards that point to the same missing target
SERVICE_MIN = TARGET_MIN

# The kinds of missing target: the end of the rule id (``automation.missing_service``) and the
# kind of cause. A new kind is one more line here.
MISSING_TARGETS = {
    "service": "service_missing",
    "entity": "entity_missing",
    "device": "device_missing",
    "area": "area_missing",
    "blueprint": "blueprint_missing",
}
OUTAGE_RULE = "config_entry.not_loaded"
REAUTH_RULE = "config_entry.reauth"
DEVICE_RULE = "device.down"
APP_RULE = "app.stopped_in_use"


def _counts(entity: dict[str, Any]) -> bool:
    """Whether an entity says something about its device: it works, or it lost a value it had.

    Disabled and orphaned entities (a placeholder the integration no longer provides) say nothing,
    nor does one that is unknown and never had a value.
    """
    if entity["status"] in ("active", "unavailable"):
        return True
    return entity["status"] == "unknown" and bool(entity.get("had_value"))


def device_down_findings(
    entities: list[dict[str, Any]],
    devices: list[dict[str, Any]],
    findings: list[dict[str, Any]],
    now: datetime | None = None,
    levels: Levels | None = None,
) -> list[dict[str, Any]]:
    """One finding for each device whose entities are all without a value: down means down completely.

    Without a value is unavailable, or unknown after the entity had a value (a device in standby).
    Entities that do not count (see ``_counts``) neither make the device down nor keep it up.
    It waits as long as the entity findings do: at least one entity of the device must already
    have a finding, so a device that has just gone offline is no finding yet.
    """
    flagged = {f["object_id"] for f in findings if f["classification"] in OUTAGE_STATES}
    members: dict[str, list[dict[str, Any]]] = {}
    for item in entities:
        if item.get("device_id"):
            members.setdefault(item["device_id"], []).append(item)
    result = []
    for device in devices:
        group = [e for e in members.get(device["object_id"], []) if _counts(e)]
        if not group or any(e["status"] not in OUTAGE_STATES for e in group):
            continue
        if not any(e["object_id"] in flagged for e in group):
            continue
        since = [e["status_since"] for e in group if e.get("status_since")]
        level = None
        if levels is not None and now is not None:
            if not since:
                continue
            level = outage_level(
                max(now - datetime.fromisoformat(max(since)), timedelta(0)), levels
            )
            if level is None:
                continue  # younger than the first threshold
        found = {
            "rule_id": DEVICE_RULE,
            "object_id": device["object_id"],
            "classification": "problem",
            "confidence": 0.9,
            "first_detected_at": max(since) if since else None,
            "evidence": [
                {
                    "kind": "all_entities_unavailable"
                    if all(e["status"] == "unavailable" for e in group)
                    else "all_entities_without_value",
                    "source": "entity_registry",
                }
            ],
        }
        if level is not None:
            found["outage_level"] = level
        result.append(found)
    return result


def _visible(finding: dict[str, Any]) -> bool:
    return finding["classification"] in OUTAGE_STATES and not finding.get("ignored")


def _consumers(entity_ids: list[str], users: dict[str, set[str]]) -> dict[str, int]:
    """How many automations, scripts and dashboards use the entities of a cause."""
    sources = {s for entity_id in entity_ids for s in users.get(f"entity:{entity_id}", ())}
    counts = {"automation": 0, "script": 0, "dashboard": 0}
    for source in sources:
        kind = source.split(":", 1)[0]
        if kind in counts:
            counts[kind] += 1
    return {kind: n for kind, n in counts.items() if n}


def _top(levels: list[str]) -> str:
    return max(levels, default="none", key=RANK.__getitem__)


def _cause(
    kind: str,
    item: dict[str, Any],
    followers: list[dict[str, Any]],
    users: dict[str, set[str]],
    entity_ids: list[str],
    own: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    cause: dict[str, Any] = {
        "id": f"{kind}:{item['object_id']}",
        "kind": kind,
        "object_type": item["object_type"],
        "object_id": item["object_id"],
        "name": item.get("name") or item["object_id"],
        "follower_count": len(followers),
        "follower_keys": [f["key"] for f in followers[:KEY_LIMIT]],
        "consumers": _consumers(entity_ids, users),
        "impact": _top([f.get("impact", "none") for f in [*followers, *(own or [])]]),
        "parent_id": None,
        "child_ids": [],
        "total_followers": len(followers),
        "virtual": False,
    }
    if own:
        cause["finding_key"] = own[0]["key"]
        for finding in own:
            finding["cause_id"] = cause["id"]
    return cause


def apply_causes(
    objects: list[dict[str, Any]], edges: list[dict[str, Any]], findings: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    """Set ``cause_id`` on the follow-up findings and return the causes, most followers first.

    Call it after the marks and the impact are applied: it counts only findings that are shown.
    """
    for finding in findings:
        finding.pop("cause_id", None)
    entity = {o["object_id"]: o for o in objects if o["object_type"] == "entity"}
    by_object = {
        f["object_id"]: f
        for f in findings
        if f["rule_id"].startswith("entity.") and _visible(f) and f["object_id"] in entity
    }
    shown = [f for f in findings if not f.get("ignored")]
    # Who uses what, built once: looking it up per cause in all edges grew with causes x edges.
    users: dict[str, set[str]] = {}
    for edge in edges:
        if edge["relation"] in USAGE:
            users.setdefault(edge["target"], set()).add(edge["source"])
    causes: dict[str, dict[str, Any]] = {}

    # 1. Devices that are down: their entities are the followers.
    members: dict[str, list[str]] = {}
    provided: dict[str, list[str]] = {}
    for item in entity.values():
        if item.get("device_id"):
            members.setdefault(item["device_id"], []).append(item["object_id"])
        if item.get("config_entry_id"):
            provided.setdefault(item["config_entry_id"], []).append(item["object_id"])
    device_findings = {f["object_id"]: f for f in shown if f["rule_id"] == DEVICE_RULE}
    device_cause: dict[str, dict[str, Any]] = {}
    for item in objects:
        own = device_findings.get(item["object_id"]) if item["object_type"] == "device" else None
        if own is None:
            continue
        ids = members.get(item["object_id"], [])
        followers = [by_object[i] for i in ids if i in by_object and "cause_id" not in by_object[i]]
        cause = _cause("device_down", item, followers, users, ids, [own])
        for finding in followers:
            finding["cause_id"] = cause["id"]
        causes[cause["id"]] = device_cause[item["object_id"]] = cause

    # 2. Integrations that are not loaded: the entities no device took, and the devices below.
    outage = {f["object_id"]: f for f in findings if f["rule_id"] in (OUTAGE_RULE, REAUTH_RULE)}
    integration_cause: dict[str, dict[str, Any]] = {}
    for item in objects:
        if item["object_type"] != "config_entry" or item["status"] != "problem":
            continue
        own = outage.get(item["object_id"])
        if own is not None and own.get("ignored"):
            continue  # known, snoozed, hidden or marked: the outage is no longer news
        ids = provided.get(item["object_id"], [])
        followers = [by_object[i] for i in ids if i in by_object and "cause_id" not in by_object[i]]
        cause = _cause("integration_down", item, followers, users, ids, [own] if own else None)
        cause.update(domain=item.get("domain"), state=item.get("state"), error=item.get("error"))
        if item.get("log"):
            cause["log"] = item["log"]
        for finding in followers:
            finding["cause_id"] = cause["id"]
        causes[cause["id"]] = integration_cause[item["object_id"]] = cause
    for item in objects:  # a device that is down hangs on the integration it belongs to
        below = device_cause.get(item["object_id"]) if item["object_type"] == "device" else None
        above = next(
            (
                integration_cause[e]
                for e in item.get("config_entry_ids", [])
                if e in integration_cause
            ),
            None,
        )
        if below is not None and above is not None:
            below["parent_id"] = above["id"]
            above["child_ids"].append(below["id"])

    # 3. Apps that are stopped: the integrations that seem to hang on them are the followers.
    app_findings: dict[str, list[dict[str, Any]]] = {}
    for finding in shown:
        if finding["rule_id"] == APP_RULE:
            app_findings.setdefault(finding["object_id"], []).append(finding)
    for item in objects:
        own = app_findings.get(item["object_id"]) if item["object_type"] == "app" else None
        if not own:
            continue
        cause = _cause("app_down", item, [], users, [], own)
        for finding in own:
            below = integration_cause.get(finding.get("affected_object") or "")
            if below is not None and below["parent_id"] is None:
                below["parent_id"] = cause["id"]
                cause["child_ids"].append(below["id"])
        causes[cause["id"]] = cause

    # 4. Missing targets: every automation, script or dashboard that points to the same one.
    callers: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for finding in shown:
        _, _, suffix = finding["rule_id"].partition(".missing_")
        if suffix in MISSING_TARGETS and finding.get("affected_object"):
            callers.setdefault((suffix, finding["affected_object"]), []).append(finding)
    for (suffix, target), followers in callers.items():
        if len(followers) < TARGET_MIN:
            continue
        item = {"object_type": suffix, "object_id": target, "name": target}
        cause = _cause(MISSING_TARGETS[suffix], item, followers, users, [])
        cause["virtual"] = True
        for finding in followers:
            finding["cause_id"] = cause["id"]
        causes[cause["id"]] = cause

    # The totals and the impact run up the chains: an app is as bad as the worst below it.
    def settle(cause: dict[str, Any]) -> None:
        for child_id in cause["child_ids"]:
            child = causes[child_id]
            settle(child)
            cause["total_followers"] += child["total_followers"] + bool(child.get("finding_key"))
            cause["impact"] = _top([cause["impact"], child["impact"]])

    for cause in causes.values():
        if cause["parent_id"] is None:
            settle(cause)
    return sorted(causes.values(), key=lambda c: (-c["total_followers"], c["id"]))
