"""The four thresholds that turn the duration of an outage into a level: info, low, medium, high.

They are options. A setup that only has the old ``min_unavailable_days`` (days until an entity became
a finding, and until an integration was "high") keeps what it meant: a larger value moves medium and
high, a smaller one only high. Once the new options are saved the old one is ignored.
"""

from __future__ import annotations

from collections.abc import Mapping
from datetime import timedelta
from typing import Any

from .const import (
    CONF_MIN_UNAVAILABLE_DAYS,
    CONF_OUTAGE_HIGH_HOURS,
    CONF_OUTAGE_INFO_MINUTES,
    CONF_OUTAGE_LOW_HOURS,
    CONF_OUTAGE_MEDIUM_HOURS,
    DEFAULT_MIN_UNAVAILABLE_DAYS,
    DEFAULT_OUTAGE_HIGH_HOURS,
    DEFAULT_OUTAGE_INFO_MINUTES,
    DEFAULT_OUTAGE_LOW_HOURS,
    DEFAULT_OUTAGE_MEDIUM_HOURS,
)

OUTAGE_KEYS = (
    CONF_OUTAGE_INFO_MINUTES,
    CONF_OUTAGE_LOW_HOURS,
    CONF_OUTAGE_MEDIUM_HOURS,
    CONF_OUTAGE_HIGH_HOURS,
)


def _whole(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


def thresholds_from_options(options: Mapping[str, Any]) -> dict[str, int]:
    """The four thresholds as set; the old option stands in while none of them was ever saved."""
    values = {
        CONF_OUTAGE_INFO_MINUTES: DEFAULT_OUTAGE_INFO_MINUTES,
        CONF_OUTAGE_LOW_HOURS: DEFAULT_OUTAGE_LOW_HOURS,
        CONF_OUTAGE_MEDIUM_HOURS: DEFAULT_OUTAGE_MEDIUM_HOURS,
        CONF_OUTAGE_HIGH_HOURS: DEFAULT_OUTAGE_HIGH_HOURS,
    }
    saved = [key for key in OUTAGE_KEYS if _whole(options.get(key))]
    legacy = options.get(CONF_MIN_UNAVAILABLE_DAYS)
    if not saved and _whole(legacy):
        if legacy > DEFAULT_MIN_UNAVAILABLE_DAYS:
            values[CONF_OUTAGE_MEDIUM_HOURS] = legacy * 24
            values[CONF_OUTAGE_HIGH_HOURS] = legacy * 24 + 24
        elif legacy >= 2:
            values[CONF_OUTAGE_HIGH_HOURS] = legacy * 24
    for key in saved:
        values[key] = options[key]
    return values


def thresholds_rise(values: Mapping[str, int]) -> bool:
    """Whether info < low < medium < high, all in the same unit."""
    steps = (
        values[CONF_OUTAGE_INFO_MINUTES] / 60,
        values[CONF_OUTAGE_LOW_HOURS],
        values[CONF_OUTAGE_MEDIUM_HOURS],
        values[CONF_OUTAGE_HIGH_HOURS],
    )
    return all(a < b for a, b in zip(steps, steps[1:], strict=False))


Levels = tuple[int, int, int, int]  # info in minutes, low, medium and high in hours
RANK = ("info", "low", "medium", "high")
# Integrations that cannot start and do not heal on their own: a finding from the first scan on.
DIRECT_ENTRY_STATES = frozenset({"setup_error", "migration_error", "failed_unload"})


def levels_of(values: Mapping[str, int]) -> Levels:
    return (
        values[CONF_OUTAGE_INFO_MINUTES],
        values[CONF_OUTAGE_LOW_HOURS],
        values[CONF_OUTAGE_MEDIUM_HOURS],
        values[CONF_OUTAGE_HIGH_HOURS],
    )


def outage_level(age: timedelta, levels: Levels, direct: bool = False) -> str | None:
    """The level of an outage that has lasted ``age``; None below the first threshold (no finding).

    ``direct`` is an outage that does not heal on its own: it is at least medium from the start.
    """
    info, low, medium, high = levels
    seconds = age.total_seconds()
    if seconds >= high * 3600:
        found: str | None = "high"
    elif seconds >= medium * 3600:
        found = "medium"
    elif seconds >= low * 3600:
        found = "low"
    elif seconds >= info * 60:
        found = "info"
    else:
        found = None
    if direct and (found is None or RANK.index(found) < RANK.index("medium")):
        return "medium"
    return found


# The findings of an outage: they begin quiet (info, low) and are loud from medium on. Quiet ones
# stay on the findings page but are left out of the overview, the sensors, the repair hints and the
# lists of what is new or gone.
OUTAGE_RULES = frozenset(
    {
        "entity.state_unavailable",
        "entity.state_unknown",
        "device.down",
        "config_entry.not_loaded",
        "app.stopped_in_use",
    }
)
QUIET_IMPACTS = frozenset({"info", "low"})


def is_quiet(finding: Mapping[str, Any]) -> bool:
    """Whether the finding is an outage that is only info or low so far."""
    return finding.get("rule_id") in OUTAGE_RULES and finding.get("impact") in QUIET_IMPACTS
