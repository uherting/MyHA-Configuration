"""Pure helpers for read-only automation analysis."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from datetime import date, datetime
from enum import Enum
from typing import Any

REFERENCE_KEYS = {
    "entity_id": "entity",
    "device_id": "device",
    "area_id": "area",
    "floor_id": "floor",
    "label_id": "label",
    "tag_id": "tag",
}


# Service targets accept these selectors instead of IDs; blueprint inputs are placeholders.
SELECTOR_VALUES = frozenset({"all", "none"})


def is_concrete_id(reference: Any) -> bool:
    """Return whether a value names one object instead of a selector or template."""
    return (
        isinstance(reference, str)
        and reference not in SELECTOR_VALUES
        and "{{" not in reference
        and not reference.startswith("!input")
    )


def json_safe(value: Any) -> Any:
    """Convert runtime configuration values to JSON-safe diagnostic data."""
    if value is None or isinstance(value, (bool, int, float, str)):
        return value
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Enum):
        return value.value
    if isinstance(value, Mapping):
        return {str(key): json_safe(child) for key, child in value.items()}
    if isinstance(value, Sequence) and not isinstance(value, (str, bytes, bytearray)):
        return [json_safe(child) for child in value]
    return str(value)


def _relation(path: str) -> str:
    root = path.split("/", 1)[0]
    if root in {"trigger", "triggers"}:
        return "TRIGGERS_ON"
    if root in {"condition", "conditions"}:
        return "USES_AS_CONDITION"
    if root in {"action", "actions", "sequence"}:
        return "TARGETS"
    return "REFERENCES"


def extract_references(config: Mapping[str, Any] | None) -> list[dict[str, str]]:
    """Extract explicit object references and exact configuration locations."""
    if not config:
        return []
    found: list[dict[str, str]] = []
    seen: set[tuple[str, str, str]] = set()

    def walk(value: Any, path: str) -> None:
        if isinstance(value, Mapping):
            for key, child in value.items():
                child_path = f"{path}/{key}" if path else str(key)
                kind = REFERENCE_KEYS.get(str(key))
                if kind:
                    values = child if isinstance(child, list) else [child]
                    for reference in values:
                        if not is_concrete_id(reference):
                            continue
                        marker = (kind, reference, child_path)
                        if marker not in seen:
                            seen.add(marker)
                            found.append(
                                {
                                    "kind": kind,
                                    "object_id": reference,
                                    "relation": _relation(child_path),
                                    "location": child_path,
                                    "confidence": "certain",
                                }
                            )
                walk(child, child_path)
        elif isinstance(value, list):
            for index, child in enumerate(value):
                walk(child, f"{path}/{index}")

    walk(config, "")
    return found


def block_list(config: Mapping[str, Any] | None, singular: str, plural: str) -> list[Any]:
    """Read old and new Home Assistant automation block keys."""
    if not config:
        return []
    value = config.get(plural, config.get(singular, []))
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def summarize_automation_config(config: Mapping[str, Any] | None) -> dict[str, Any]:
    """Return the inspectable automation structure without executable objects."""
    triggers = block_list(config, "trigger", "triggers")
    conditions = block_list(config, "condition", "conditions")
    actions = block_list(config, "action", "actions")
    return {
        "description": str(config.get("description", "")) if config else "",
        "triggers": json_safe(triggers),
        "conditions": json_safe(conditions),
        "actions": json_safe(actions),
        "trigger_count": len(triggers),
        "condition_count": len(conditions),
        "action_count": len(actions),
        "references": extract_references(config),
    }


def summarize_script_config(config: Mapping[str, Any] | None) -> dict[str, Any]:
    """Return the inspectable script structure; scripts only have a sequence."""
    actions = block_list(config, "sequence", "sequence")
    return {
        "description": str(config.get("description", "")) if config else "",
        "actions": json_safe(actions),
        "action_count": len(actions),
        "references": extract_references(config),
    }


def missing_references(
    references: list[dict[str, str]], existing: Mapping[str, set[str]]
) -> list[dict[str, str]]:
    """Return explicit references whose target registry object is absent."""
    missing: list[dict[str, str]] = []
    for reference in references:
        kind = reference["kind"]
        object_id = reference["object_id"]
        # Templates and selectors can contain dynamic or non-ID strings.
        if kind == "entity" and "." not in object_id:
            continue
        # `scene.none` and the like are the usual "nothing chosen" default of blueprint inputs.
        if kind == "entity" and object_id.partition(".")[2] == "none":
            continue
        # Only a trigger waiting for a tag is broken without it: scanning an unknown tag creates it.
        if kind == "tag" and reference.get("relation") != "TRIGGERS_ON":
            continue
        known = existing.get(kind)
        if known is not None and object_id not in known:
            missing.append(reference)
    return missing
