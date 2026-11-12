"""The cleanup round: everything unneeded, judged for removal and sorted into what can go and what to see first.

Only reads and judges. Which action stands behind a finding is decided here; the judgement itself is the
cleanup plan's (``build_plan``), so the round can never allow more than a plan would. Nothing here writes.
"""

from __future__ import annotations

from typing import Any, Final

from .finding_topics import UNNEEDED

ROUND_LIMIT: Final = (
    1000  # objects judged in one round; the rest comes in the next, once these are dealt with
)

SAFE: Final = "safe"  # nothing uses it: the removal runs without a closer look
LOOK: Final = "look"  # something needs a decision first: used, a first step only, or a duplicate
BLOCKED: Final = "blocked"  # not removable now; the person can keep it
DUPLICATE_RULE: Final = "entity.possible_duplicate"
NOT_QUARANTINED: Final = "not_quarantined"


def removal_requests(snapshot: dict[str, Any]) -> list[dict[str, Any]]:
    """One removal request per unneeded object that is not decided yet, in the order of the findings."""
    seen: set[str] = set()
    found: list[dict[str, Any]] = []
    for finding in snapshot.get("findings", []):
        if (
            finding.get("topic") != UNNEEDED
            or finding.get("ignored")
            or finding["rule_id"] == DUPLICATE_RULE
        ):
            continue
        domain = finding["rule_id"].partition(".")[0]
        kind = {"entity": "remove_entity", "automation": "delete_automation"}.get(domain)
        if kind is None or finding["object_id"] in seen:
            continue
        seen.add(finding["object_id"])
        found.append(
            {"kind": kind, "object_id": finding["object_id"], "finding_key": finding["key"]}
        )
    return found


def duplicate_rows(snapshot: dict[str, Any]) -> list[dict[str, Any]]:
    """The possible duplicates: they are merged by replacing one entity by the other, never removed here."""
    objects = {o["object_id"]: o for o in snapshot["objects"] if o["object_type"] == "entity"}
    return [
        {
            "finding_key": f["key"],
            "object_type": "entity",
            "object_id": f["object_id"],
            "name": (objects.get(f["object_id"]) or {}).get("name") or f["object_id"],
            "kind": "merge",
            "group": LOOK,
            "reasons": [],
            "duplicate_of": (objects.get(f["object_id"]) or {}).get("duplicate_of"),
        }
        for f in snapshot.get("findings", [])
        if f.get("topic") == UNNEEDED and not f.get("ignored") and f["rule_id"] == DUPLICATE_RULE
    ]


def needs_first_step(request: dict[str, Any], action: dict[str, Any]) -> bool:
    """Whether a removal is only held back because the entity was not disabled for a while first."""
    return request["kind"] == "remove_entity" and NOT_QUARANTINED in action.get("reasons", [])


def sort_row(
    request: dict[str, Any], action: dict[str, Any], first_step: dict[str, Any] | None
) -> dict[str, Any]:
    """The row of one object: the action behind it, and which group it belongs to."""
    chosen = first_step if first_step is not None and first_step["verdict"] != BLOCKED else action
    verdict = chosen["verdict"]
    group = (
        SAFE if verdict == "ok" and chosen is action else LOOK if verdict != BLOCKED else BLOCKED
    )
    return {
        "finding_key": request["finding_key"],
        "object_type": chosen.get("object_type", "entity"),
        "object_id": request["object_id"],
        "name": chosen.get("name") or request["object_id"],
        "kind": chosen["kind"],
        "group": group,
        "verdict": verdict,
        "reasons": chosen.get("reasons", []),
        "first_step": chosen is first_step,
    }
