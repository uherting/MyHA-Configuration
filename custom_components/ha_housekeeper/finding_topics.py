"""The topic of a finding: what is wrong, in the words of the user.

Every rule belongs to exactly one of four topics. The panel and the AI access read the same
table; ``classification`` stays as the technical state of the finding.
"""

from __future__ import annotations

from typing import Any, Final

DOWN: Final = "down"
BROKEN_REFERENCES: Final = "broken_references"
FAILING_AUTOMATIONS: Final = "failing_automations"
UNNEEDED: Final = "unneeded"
TOPICS: Final = (DOWN, BROKEN_REFERENCES, FAILING_AUTOMATIONS, UNNEEDED)

_RULES: Final[dict[str, str]] = {
    "config_entry.not_loaded": DOWN,
    "config_entry.reauth": DOWN,
    "device.down": DOWN,
    "entity.state_unavailable": DOWN,
    "entity.state_unknown": DOWN,
    "entity.stale": DOWN,
    "app.stopped_in_use": DOWN,
    "entity.missing_member": BROKEN_REFERENCES,
    "automation.blocked": FAILING_AUTOMATIONS,
    "automation.goal_missed": FAILING_AUTOMATIONS,
    "automation.run_failing": FAILING_AUTOMATIONS,
    "automation.never_ok": FAILING_AUTOMATIONS,
    "entity.device_missing": UNNEEDED,
    "entity.config_entry_missing": UNNEEDED,
    "entity.state_missing": UNNEEDED,
    "entity.not_provided": UNNEEDED,
    "entity.possible_duplicate": UNNEEDED,
    "automation.never_triggered": UNNEEDED,
    "automation.stale": UNNEEDED,
    "automation.disabled_long": UNNEEDED,
}


def topic_of(rule_id: str) -> str:
    """The topic of a rule; a rule that is not in the table counts as unneeded."""
    if rule_id in _RULES:
        return _RULES[rule_id]
    suffix = rule_id.partition(".")[2]
    if suffix.startswith("missing_"):
        return BROKEN_REFERENCES
    if suffix in ("dead_condition", "dead_actions", "run_failing", "never_ok"):
        return FAILING_AUTOMATIONS
    return UNNEEDED


def apply_topics(findings: list[dict[str, Any]]) -> None:
    """Set ``topic`` on every finding."""
    for finding in findings:
        finding["topic"] = topic_of(finding["rule_id"])
