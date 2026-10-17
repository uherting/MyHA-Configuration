"""Mechanical improvements of one automation: small, exact edits that never rewrite logic.

``propose`` looks at the configuration and names what could be improved; ``apply`` makes exactly one
named edit and returns the new configuration with a list of what changed. Templates, conditions and
actions are never touched. A fix needs values from the person where a value cannot be known
(a description). Writing, validation and undo are the cleanup plan's job.
"""

from __future__ import annotations

import copy
import json
from typing import Any

from homeassistant.components.automation.config import async_validate_config_item
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import REFACTOR_STORAGE_KEY, STORAGE_VERSION
from .references import MAX_LISTED, SourceError, load_source, text_hash

FIXES = ("add_description", "remove_duplicate_triggers", "set_timeout", "set_mode")
DESCRIPTION_MAX = 300
TIMEOUT_MAX = 86400  # seconds
MODES = ("single", "restart", "queued", "parallel")
MAX_RUNS = 100
DEFAULT_MAX = 10  # what Home Assistant uses for queued and parallel without a value
TRIGGER_KEYS = ("triggers", "trigger")
ACTION_KEYS = ("actions", "action")
WAITS = ("wait_template", "wait_for_trigger")
LONG_DELAY = 300  # seconds; a delay at least this long is lost when Home Assistant restarts
# Hints name something worth a look but are never written: a change would alter what the automation does.
HINTS = ("hint_device_trigger", "hint_long_delay", "hint_dead_branch")


class RefactorStore:
    """The switch for refactoring (experimental, off until the person turns it on)."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, REFACTOR_STORAGE_KEY)
        self.enabled = False

    async def async_load(self) -> None:
        data = await self._store.async_load()
        self.enabled = isinstance(data, dict) and data.get("enabled") is True

    def set_enabled(self, enabled: bool) -> None:
        self.enabled = enabled
        self._store.async_delay_save(lambda: {"enabled": self.enabled}, 5)


def _trigger_key(item: dict[str, Any]) -> str | None:
    return next((k for k in TRIGGER_KEYS if isinstance(item.get(k), list)), None)


def duplicates(item: dict[str, Any]) -> list[int]:
    """Positions of triggers that equal an earlier one exactly (the first one is kept)."""
    key = _trigger_key(item)
    seen: set[str] = set()
    found: list[int] = []
    for index, trigger in enumerate(item[key] if key else []):
        text = json.dumps(trigger, sort_keys=True, default=str)
        if text in seen:
            found.append(index)
        seen.add(text)
    return found


def _walk(steps: Any, prefix: str):
    """Every step of an action list with its path, down through the blocks that hold steps."""
    if not isinstance(steps, list):
        return
    for index, step in enumerate(steps):
        if not isinstance(step, dict):
            continue
        base = f"{prefix}/{index}"
        yield base, step
        for number, option in enumerate(
            step["choose"] if isinstance(step.get("choose"), list) else []
        ):
            if isinstance(option, dict):
                yield from _walk(option.get("sequence"), f"{base}/choose/{number}/sequence")
        yield from _walk(step.get("default"), f"{base}/default")
        yield from _walk(step.get("then"), f"{base}/then")
        yield from _walk(step.get("else"), f"{base}/else")
        yield from _walk(step.get("sequence"), f"{base}/sequence")
        yield from _walk(step.get("parallel"), f"{base}/parallel")
        if isinstance(step.get("repeat"), dict):
            yield from _walk(step["repeat"].get("sequence"), f"{base}/repeat/sequence")


def _action_key(item: dict[str, Any]) -> str | None:
    return next((k for k in ACTION_KEYS if isinstance(item.get(k), list)), None)


def waits_without_timeout(item: dict[str, Any]) -> list[str]:
    """Paths of waits that would wait forever."""
    key = _action_key(item)
    return [
        path
        for path, step in _walk(item[key] if key else [], key or "action")
        if any(w in step for w in WAITS) and "timeout" not in step
    ]


def device_triggers(item: dict[str, Any]) -> list[str]:
    """Paths of triggers that hang on a device id, which breaks when the device is added again."""
    key = _trigger_key(item)
    return [
        f"{key}/{index}"
        for index, trigger in enumerate(item[key] if key else [])
        if isinstance(trigger, dict)
        and (trigger.get("trigger") or trigger.get("platform")) == "device"
    ]


def delay_seconds(value: Any) -> int | None:
    """The length of a ``delay`` in seconds; None where it is a template or cannot be read."""
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return int(value)
    if isinstance(value, str):
        if value.strip().isdigit():
            return int(value)
        parts = value.split(":")
        if len(parts) in (2, 3) and all(part.replace(".", "", 1).isdigit() for part in parts):
            numbers = [float(part) for part in parts]
            while len(numbers) < 3:
                numbers.insert(0, 0.0)
            return int(numbers[0] * 3600 + numbers[1] * 60 + numbers[2])
        return None
    if isinstance(value, dict):
        total = 0.0
        for unit, factor in (("days", 86400), ("hours", 3600), ("minutes", 60), ("seconds", 1)):
            part = value.get(unit, 0)
            if isinstance(part, bool) or not isinstance(part, (int, float)):
                if part in (0, None, "0"):
                    continue
                return None
            total += part * factor
        return int(total)
    return None


def long_delays(item: dict[str, Any]) -> list[tuple[str, int]]:
    """Paths and lengths (seconds) of delays that do not survive a restart of Home Assistant."""
    key = _action_key(item)
    found = []
    for path, step in _walk(item[key] if key else [], key or "action"):
        seconds = delay_seconds(step["delay"]) if "delay" in step else None
        if seconds is not None and seconds >= LONG_DELAY:
            found.append((path, seconds))
    return found


def _condition_entities(conditions: Any) -> set[str]:
    """Entities named by the plain state and numeric-state conditions of a list (all must hold)."""
    found: set[str] = set()
    for condition in conditions if isinstance(conditions, list) else [conditions]:
        if not isinstance(condition, dict) or condition.get("condition") not in (
            "state",
            "numeric_state",
        ):
            continue
        ids = condition.get("entity_id")
        for entity_id in ids if isinstance(ids, list) else [ids]:
            if isinstance(entity_id, str) and "{{" not in entity_id and "." in entity_id:
                found.add(entity_id)
    return found


def dead_branches(item: dict[str, Any], known: set[str]) -> list[tuple[str, list[str]]]:
    """``choose`` branches that can never apply because a condition names an entity that does not exist."""
    key = _action_key(item)
    found = []
    for path, step in _walk(item[key] if key else [], key or "action"):
        for number, option in enumerate(
            step["choose"] if isinstance(step.get("choose"), list) else []
        ):
            if isinstance(option, dict):
                missing = sorted(_condition_entities(option.get("conditions")) - known)
                if missing:
                    found.append((f"{path}/choose/{number}", missing))
    return found


def current_mode(item: dict[str, Any]) -> tuple[str, int | None]:
    """The mode of the automation and, for queued and parallel, its limit."""
    mode = item.get("mode") if item.get("mode") in MODES else "single"
    return mode, (item.get("max", DEFAULT_MAX) if mode in ("queued", "parallel") else None)


def propose(item: dict[str, Any], known: set[str] | None = None) -> list[dict[str, Any]]:
    """What could be improved in this configuration, without values the person has to give.

    ``known`` are the entity ids that exist; without them no branch is called dead. The ``hint_*``
    entries are for reading only: there is no fix behind them.
    """
    found: list[dict[str, Any]] = []
    if not str(item.get("description") or "").strip():
        found.append({"fix": "add_description"})
    if doubled := duplicates(item):
        found.append({"fix": "remove_duplicate_triggers", "count": len(doubled)})
    if waits := waits_without_timeout(item):
        found.append({"fix": "set_timeout", "count": len(waits), "paths": waits[:5]})
    mode, limit = current_mode(item)
    found.append({"fix": "set_mode", "mode": mode, "max": limit})
    if devices := device_triggers(item):
        found.append({"fix": "hint_device_trigger", "count": len(devices), "paths": devices[:5]})
    if delays := long_delays(item):
        found.append(
            {
                "fix": "hint_long_delay",
                "count": len(delays),
                "paths": [path for path, _ in delays[:5]],
                "longest": max(seconds for _, seconds in delays),
            }
        )
    if known and (dead := dead_branches(item, known)):
        found.append(
            {
                "fix": "hint_dead_branch",
                "count": len(dead),
                "paths": [path for path, _ in dead[:5]],
                "entities": sorted({e for _, missing in dead for e in missing})[:5],
            }
        )
    return found


def apply(
    item: dict[str, Any], fix: str, values: dict[str, Any] | None
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    """The configuration after one fix and what changed; ``ValueError`` names what is wrong."""
    values = values or {}
    new = copy.deepcopy(item)
    if fix == "add_description":
        text = str(values.get("description") or "").strip()
        if str(item.get("description") or "").strip():
            raise ValueError("nothing_to_do")
        if not 1 <= len(text) <= DESCRIPTION_MAX:
            raise ValueError("invalid_fix")
        ordered: dict[str, Any] = {}
        for key, value in new.items():  # right after the alias, where people look for it
            ordered[key] = value
            if key == "alias":
                ordered["description"] = text
        ordered.setdefault("description", text)
        return ordered, [{"path": "description", "before": None, "after": text}]
    if fix == "remove_duplicate_triggers":
        key = _trigger_key(new)
        positions = duplicates(new)
        if key is None or not positions:
            raise ValueError("nothing_to_do")
        diff = [{"path": f"{key}/{i}", "before": new[key][i], "after": None} for i in positions]
        new[key] = [t for i, t in enumerate(new[key]) if i not in positions]
        return new, diff
    if fix == "set_timeout":
        timeout, keep = values.get("timeout"), values.get("continue_on_timeout", True)
        if (
            isinstance(timeout, bool)
            or not isinstance(timeout, int)
            or not 1 <= timeout <= TIMEOUT_MAX
        ):
            raise ValueError("invalid_fix")
        paths = waits_without_timeout(new)
        if not paths:
            raise ValueError("nothing_to_do")
        key = _action_key(new)
        steps = dict(_walk(new[key], key))
        diff = []
        for path in paths:
            steps[path]["timeout"] = timeout
            if keep is False:
                steps[path]["continue_on_timeout"] = False
            diff.append({"path": f"{path}/timeout", "before": None, "after": timeout})
        return new, diff
    if fix == "set_mode":
        mode, limit = values.get("mode"), values.get("max")
        if mode not in MODES:
            raise ValueError("invalid_fix")
        if mode in ("queued", "parallel"):
            limit = DEFAULT_MAX if limit is None else limit
            if isinstance(limit, bool) or not isinstance(limit, int) or not 2 <= limit <= MAX_RUNS:
                raise ValueError("invalid_fix")
        if (mode, limit if mode in ("queued", "parallel") else None) == current_mode(item):
            raise ValueError("nothing_to_do")
        before = current_mode(item)
        new["mode"] = mode
        if mode in ("queued", "parallel"):
            new["max"] = limit
        else:
            new.pop("max", None)
        return new, [
            {"path": "mode", "before": before[0], "after": mode},
            *(
                [{"path": "max", "before": before[1], "after": new.get("max")}]
                if before[1] != new.get("max")
                else []
            ),
        ]
    raise ValueError("invalid_fix")


def applied(item: dict[str, Any], fix: str, values: dict[str, Any]) -> bool:
    """Whether the edit is in this configuration (checked after it was written)."""
    if fix == "add_description":
        return str(item.get("description") or "").strip() == values.get("description")
    if fix == "remove_duplicate_triggers":
        return not duplicates(item)
    if fix == "set_timeout":
        return not waits_without_timeout(item)
    if fix == "set_mode":
        mode, limit = current_mode(item)
        return mode == values.get("mode") and (
            mode not in ("queued", "parallel") or limit == values.get("max", DEFAULT_MAX)
        )
    return False


async def is_valid(hass: HomeAssistant, ref: str, item: dict[str, Any]) -> bool:
    """Whether Home Assistant accepts this automation configuration."""
    try:
        return await async_validate_config_item(hass, ref, dict(item)) is not None
    except Exception:  # noqa: BLE001 - anything that does not validate is not written
        return False


async def preview(
    hass: HomeAssistant,
    snapshot: dict[str, Any],
    entity_id: str,
    fix: str,
    values: dict[str, Any] | None,
) -> dict[str, Any]:
    """The source of one fix as the plan shows it, or ``error`` with a reason code. Reads only."""
    key = f"automation:{entity_id}"
    entry: dict[str, Any] = {"source": key, "type": "automation", "id": entity_id}
    try:
        loaded = await load_source(hass, snapshot, key)
    except SourceError as err:
        return {"error": "not_editable", "source_reason": str(err), "source": None}
    item = loaded["item"]
    if "use_blueprint" in item:
        return {"error": "not_editable", "source_reason": "blueprint", "source": None}
    try:
        new, diff = apply(item, fix, values)
    except ValueError as err:
        return {"error": str(err), "source": None}
    if not await is_valid(hass, loaded["ref"], new):
        return {"error": "invalid_config", "source": None}
    return {
        "error": None,
        "fingerprint": text_hash(
            f"{loaded['hash']}|{fix}|{json.dumps(values or {}, sort_keys=True)}"
        ),
        "source": {
            **entry,
            "name": loaded["name"],
            "writable": True,
            "reason": None,
            "hash": loaded["hash"],
            "changes": diff[:MAX_LISTED],
            "change_count": len(diff),
            "manual": [],
            "file_bytes": loaded.get("file_bytes"),
        },
    }
