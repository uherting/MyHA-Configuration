"""The state of the house in a few numbers, for the sensor behind the dashboard card.

The numbers are the ones of the tiles on the overview page of the panel: per topic the objects that have a
finding of their own (a follow-up is a consequence, not a job), and the worst impact in that topic. The card and
the panel therefore say the same.
"""

from __future__ import annotations

from typing import Any, Final

from .finding_topics import TOPICS, topic_of
from .history import _finding_key, diff_checkpoints, make_checkpoint
from .outage_levels import is_quiet

OK: Final = "ok"
ATTENTION: Final = "attention"
URGENT: Final = "urgent"
STATES: Final = (OK, ATTENTION, URGENT)

# The impact of a finding, lowest first; "none" stands for a topic without a finding.
_RANK: Final = {"none": 0, "info": 1, "low": 2, "medium": 3, "high": 4}


def house_health(snapshot: dict[str, Any], previous: dict[str, Any] | None) -> dict[str, Any]:
    """The state, the objects per topic and what changed since the scan before.

    ``attention`` from a medium impact, ``urgent`` from a high one; findings of a lower impact are listed on the
    card without a color. ``new`` and ``resolved`` are ``None`` while there is no scan to compare with.
    """
    point = make_checkpoint(snapshot)
    worst = {name: "none" for name in TOPICS}
    for finding in snapshot["findings"]:
        if finding.get("ignored"):
            continue
        name = str(finding.get("topic") or topic_of(finding["rule_id"]))
        impact = str(finding.get("impact") or "none")
        if name in worst and _RANK.get(impact, 0) > _RANK[worst[name]]:
            worst[name] = impact
    top = max((_RANK[level] for level in worst.values()), default=0)
    changes = diff_checkpoints(previous, snapshot) if previous is not None else None
    # What is new is counted here and not taken from the comparison: a finding that is hidden is nothing to look at.
    known = set(previous["findings"]) if previous is not None else set()
    fresh = [
        f
        for f in snapshot["findings"]
        if not f.get("ignored") and not is_quiet(f) and _finding_key(f) not in known
    ]
    return {
        "state": URGENT if top >= _RANK["high"] else ATTENTION if top >= _RANK["medium"] else OK,
        "objects": point["affected"],
        "topics": {
            name: {"objects": point["lead_object_topics"].get(name, 0), "level": worst[name]}
            for name in TOPICS
        },
        "new": len(fresh) if changes else None,
        "resolved": changes["resolved_findings"]["total"] if changes else None,
        "since": changes["baseline_at"] if changes else None,
    }
