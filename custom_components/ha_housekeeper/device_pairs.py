"""Suggest which new entity takes the place of each entity of an old device.

Only reads the last scan. The result is a proposal: nothing is chosen for the person, every pair
is confirmed one by one in the panel and then becomes an ordinary cleanup plan.
"""

from __future__ import annotations

from difflib import SequenceMatcher
from typing import Any

from .cleanup import USAGE_RELATIONS

CANDIDATE_LIMIT = 20
METER_CLASSES = frozenset({"energy", "gas", "water"})
METER_STATE_CLASSES = frozenset({"total", "total_increasing"})
NAME_MIN = 0.6
ID_MIN = 0.7


def _domain(object_id: str) -> str:
    return object_id.split(".", 1)[0]


def _plain(text: str | None, drop: str | None) -> str:
    """A name for comparing: lower case, without the device name that most entities repeat."""
    text = (text or "").lower()
    if drop and drop.lower() in text:
        text = text.replace(drop.lower(), "")
    return " ".join(text.replace("_", " ").split())


def _ratio(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio() if a and b else 0.0


def _tail(unique_id: Any) -> str:
    """The last part of a unique ID, where integrations put the kind of value."""
    return str(unique_id or "").lower().replace("-", "_").rsplit("_", 1)[-1]


def _is_meter(item: dict[str, Any]) -> bool:
    return bool(
        item.get("has_statistics")
        and (
            item.get("state_class") in METER_STATE_CLASSES
            or item.get("device_class") in METER_CLASSES
        )
    )


def _score(
    old: dict[str, Any], new: dict[str, Any], old_name: str | None, new_name: str | None
) -> tuple[int, list[str]]:
    score, reasons = 0, []
    if old.get("device_class") and old.get("device_class") == new.get("device_class"):
        score += 3
        reasons.append("same_class")
    if old.get("unit") and old.get("unit") == new.get("unit"):
        score += 2
        reasons.append("same_unit")
    if old.get("state_class") and old.get("state_class") == new.get("state_class"):
        score += 1
        reasons.append("same_state_class")
    if old.get("area_id") and old.get("area_id") == new.get("area_id"):
        score += 1
        reasons.append("same_area")
    names = _ratio(_plain(old["name"], old_name), _plain(new["name"], new_name))
    if names >= NAME_MIN:
        score += round(names * 3)
        reasons.append("similar_name")
    if _tail(old.get("unique_id")) and _tail(old.get("unique_id")) == _tail(new.get("unique_id")):
        score += 2
        reasons.append("same_id_tail")
    return score, reasons


def pair_devices(snapshot: dict[str, Any], old_id: str, new_id: str) -> dict[str, Any] | None:
    """One row per entity of the old device with the entities of the new one that may replace it.

    Returns None when one of the devices is unknown. Candidates have the same domain and are not
    disabled; ``score`` only orders them. ``used`` is the number of automations, scripts and
    dashboards that use the old entity: a pair without use has nothing to replace.
    """
    devices = {o["object_id"]: o for o in snapshot["objects"] if o["object_type"] == "device"}
    if old_id not in devices or new_id not in devices or old_id == new_id:
        return None
    entities = [o for o in snapshot["objects"] if o["object_type"] == "entity"]
    old_name, new_name = devices[old_id].get("name"), devices[new_id].get("name")
    uses: dict[str, int] = {}
    for edge in snapshot["edges"]:
        if edge["relation"] in USAGE_RELATIONS and edge["target"].startswith("entity:"):
            key = edge["target"][7:]
            uses[key] = uses.get(key, 0) + 1
    new_items = [o for o in entities if o.get("device_id") == new_id and o["status"] != "disabled"]
    pairs = []
    for old in sorted(
        (o for o in entities if o.get("device_id") == old_id), key=lambda o: o["object_id"]
    ):
        candidates = []
        for new in new_items:
            if _domain(new["object_id"]) != _domain(old["object_id"]):
                continue
            score, reasons = _score(old, new, old_name, new_name)
            candidates.append(
                {
                    "object_id": new["object_id"],
                    "name": new["name"],
                    "status": new["status"],
                    "unit": new.get("unit"),
                    "score": score,
                    "reasons": reasons,
                }
            )
        candidates.sort(key=lambda c: (-c["score"], c["object_id"]))
        pairs.append(
            {
                "object_id": old["object_id"],
                "name": old["name"],
                "status": old["status"],
                "unit": old.get("unit"),
                "used": uses.get(old["object_id"], 0),
                "meter": _is_meter(old),
                "candidates": candidates[:CANDIDATE_LIMIT],
            }
        )
    pairs.sort(key=lambda p: (-p["used"], p["object_id"]))
    taken = {c["object_id"] for p in pairs for c in p["candidates"]}
    return {
        "old": {"device_id": old_id, "name": old_name or old_id},
        "new": {"device_id": new_id, "name": new_name or new_id},
        "pairs": pairs,
        "unmatched_new": sorted(o["object_id"] for o in new_items if o["object_id"] not in taken),
    }
