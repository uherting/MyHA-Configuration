"""The life of a device as far as the data tells it: found, in quarantine, unstable, replaced, removed.

Only reads. Nothing is invented: every step comes from the device registry, the journal of cleanup
plans or the last calculated reliability.
"""

from __future__ import annotations

from typing import Any

REMOVED_LIMIT = 200
REMOVAL_KINDS = ("remove_device", "forget_device")
DEVICE_STEPS = {
    "disable_device": "disabled",
    "remove_device": "removed",
    "forget_device": "removed",
}


def _done_steps(plans: list[dict[str, Any]]):
    """Every finished step of every plan: (plan id, action, result)."""
    for plan in plans:
        for action in plan.get("actions") or []:
            result = action.get("result")
            if isinstance(result, dict) and result.get("state") == "done":
                yield plan.get("plan_id"), action, result


def removed_devices(plans: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Devices that a plan removed or forgot, newest first."""
    found = [
        {
            "object_id": action.get("object_id"),
            "name": action.get("name") or action.get("object_id"),
            "kind": action.get("kind"),
            "at": result.get("at"),
            "plan_id": plan_id,
        }
        for plan_id, action, result in _done_steps(plans)
        if action.get("object_type") == "device" and action.get("kind") in REMOVAL_KINDS
    ]
    found.sort(key=lambda d: str(d["at"]), reverse=True)
    return found[:REMOVED_LIMIT]


def instability(replies: Any, entity_ids: set[str]) -> str | None:
    """ "flapping" or "unstable" if one of the entities is in the newest kept reliability numbers."""
    kept = [
        r
        for key, r in getattr(replies, "replies", {}).items()
        if key.startswith("reliability:") and isinstance(r.get("unstable"), dict)
    ]
    if not kept:
        return None
    newest = max(kept, key=lambda r: r.get("computed_at", 0))
    levels = [
        info.get("level")
        for entity_id, info in (newest["unstable"].get("entities") or {}).items()
        if entity_id in entity_ids and isinstance(info, dict)
    ]
    return "flapping" if "flapping" in levels else "unstable" if levels else None


def timeline(
    device: dict[str, Any],
    snapshot: dict[str, Any],
    plans: list[dict[str, Any]],
    replies: Any,
) -> dict[str, Any]:
    """The steps of one device in time order and its state now."""
    device_id = device["object_id"]
    entities = {
        i["object_id"]: i
        for i in snapshot["objects"]
        if i["object_type"] == "entity" and i.get("device_id") == device_id
    }
    steps: list[dict[str, Any]] = []
    if device.get("created_at"):
        steps.append({"kind": "discovered", "at": device["created_at"]})
    for q in snapshot.get("quarantine") or []:
        if q.get("object_id") == device_id:
            steps.append({"kind": "quarantine", "at": q.get("since")})
    for plan_id, action, result in _done_steps(plans):
        at = result.get("at")
        if action.get("object_id") == device_id and action.get("kind") in DEVICE_STEPS:
            steps.append({"kind": DEVICE_STEPS[action["kind"]], "at": at, "plan_id": plan_id})
        elif action.get("kind") == "replace_references" and action.get("object_id") in entities:
            steps.append(
                {
                    "kind": "replaced",
                    "at": at,
                    "plan_id": plan_id,
                    "from": action.get("object_id"),
                    "to": action.get("target"),
                }
            )
    steps = [s for s in steps if isinstance(s.get("at"), str)]
    steps.sort(key=lambda s: s["at"])
    return {
        "steps": steps,
        "unstable": instability(replies, set(entities)),
        "status": device.get("status"),
    }
