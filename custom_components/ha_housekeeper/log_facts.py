"""What the Home Assistant log says about an integration, as numbers and times only.

``system_log`` keeps the last 50 different warnings and errors in memory (equal ones are counted),
nothing on disk and nothing across a restart. So an entry is a hint at best and its absence proves
nothing. Only the integration, the level, how often and when are taken; the message and the
exception text are never read into the result, because they may hold hosts, names or keys.
"""

from __future__ import annotations

import re
from datetime import UTC, datetime
from typing import Any

from homeassistant.core import HomeAssistant

LEVELS = {"WARNING": 1, "ERROR": 2, "CRITICAL": 3}
LOGGER = re.compile(r"^(?:homeassistant\.components|custom_components)\.([a-z0-9_]+)")
SOURCE = re.compile(r"^(?:components|custom_components)/([a-z0-9_]+)/")
# The setup of an integration is logged by the core, not by the integration itself.
SETUP_LOGGERS = {
    "homeassistant.config_entries": re.compile(r"Error setting up entry .* for ([a-z0-9_]+)\b"),
    "homeassistant.setup": re.compile(r"Setup failed for (?:custom integration )?'([a-z0-9_]+)'"),
}


def _domain(entry: Any) -> str | None:
    name = str(getattr(entry, "name", ""))
    if match := LOGGER.match(name):
        return match.group(1)
    if pattern := SETUP_LOGGERS.get(name):
        for text in getattr(entry, "message", ()):
            if match := pattern.search(str(text)):
                return match.group(1)  # only the domain leaves this function
    source = getattr(entry, "source", None)
    if isinstance(source, (tuple, list)) and source and (match := SOURCE.match(str(source[0]))):
        return match.group(1)
    return None


def _iso(stamp: Any) -> str | None:
    try:
        return datetime.fromtimestamp(float(stamp), UTC).isoformat()
    except (TypeError, ValueError, OverflowError, OSError):
        return None


def log_facts(hass: HomeAssistant) -> dict[str, dict[str, Any]]:
    """Per integration domain: worst ``level``, ``count``, ``first`` and ``last`` time."""
    records = getattr(hass.data.get("system_log"), "records", None)
    if records is None:
        return {}
    facts: dict[str, dict[str, Any]] = {}
    try:
        entries = list(records.values())
    except Exception:  # noqa: BLE001 - the log is a hint; a changed internal must not break a scan
        return {}
    for entry in entries:
        level = getattr(entry, "level", None)
        if level not in LEVELS:
            continue
        domain = _domain(entry)
        first, last = (
            _iso(getattr(entry, "first_occurred", None)),
            _iso(getattr(entry, "timestamp", None)),
        )
        if domain is None or first is None or last is None:
            continue
        count = getattr(entry, "count", 1)
        count = count if isinstance(count, int) and count > 0 else 1
        known = facts.get(domain)
        if known is None:
            facts[domain] = {"level": level.lower(), "count": count, "first": first, "last": last}
            continue
        if LEVELS[level] > LEVELS[known["level"].upper()]:
            known["level"] = level.lower()
        known["count"] += count
        known["first"] = min(known["first"], first)
        known["last"] = max(known["last"], last)
    return facts
