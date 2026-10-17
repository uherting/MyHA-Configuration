"""Pure helpers that find entity references inside dashboard configurations."""

from __future__ import annotations

import json
import re
from collections import Counter
from collections.abc import Mapping
from typing import Any

ENTITY_ID = re.compile(r"^[a-z0-9_]+\.[a-z0-9_]+$")
ENTITY_IN_TEXT = re.compile(r"\b([a-z0-9_]+\.[a-z0-9_]+)\b")
# Keys whose string values (or lists of strings) name entities in standard cards.
ENTITY_KEYS = frozenset({"entity", "entities", "entity_id", "camera_image", "badges"})


def extract_dashboard_references(
    config: Mapping[str, Any] | None, known_entities: set[str]
) -> list[dict[str, str]]:
    """Return entity references of a dashboard with their location."""
    return extract_entity_references(config, known_entities, ENTITY_KEYS, "SHOWS")


def extract_entity_references(
    config: Mapping[str, Any] | None,
    known_entities: set[str],
    keys: frozenset[str],
    relation: str,
) -> list[dict[str, str]]:
    """Return entity references found under ``keys`` with their location.

    Explicit entity keys are ``certain``. Entity IDs inside templates are only
    reported as ``probable`` and only when the entity exists, so free text can
    never create a false "missing" finding.
    """
    if not config:
        return []
    found: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()

    def add(object_id: str, path: str, confidence: str) -> None:
        if (object_id, path) not in seen:
            seen.add((object_id, path))
            found.append(
                {
                    "kind": "entity",
                    "object_id": object_id,
                    "relation": relation,
                    "location": path,
                    "confidence": confidence,
                }
            )

    def walk(value: Any, path: str, key: str | None) -> None:
        if isinstance(value, Mapping):
            for child_key, child in value.items():
                walk(child, f"{path}/{child_key}" if path else str(child_key), str(child_key))
        elif isinstance(value, list):
            for index, child in enumerate(value):
                walk(child, f"{path}/{index}", key)
        elif isinstance(value, str):
            if key in keys and ENTITY_ID.match(value):
                # auto-entities fills `this.entity_id` per found entity at runtime
                if not value.startswith("this."):
                    add(value, path, "certain")
            elif "{{" in value or "[[[" in value or "states" in value:
                for match in ENTITY_IN_TEXT.findall(value):
                    if match in known_entities:
                        add(match, path, "probable")

    walk(config, "", None)
    return found


# Config-entry helpers keep the entities they build on in their options.
HELPER_DOMAINS = frozenset(
    {
        "template", "derivative", "integration", "min_max", "threshold", "utility_meter",
        "statistics", "trend", "filter", "history_stats", "switch_as_x", "compensation",
        "generic_hygrostat", "generic_thermostat", "bayesian", "mold_indicator",
    }
)  # fmt: skip
HELPER_KEYS = frozenset(
    {
        "entity_id",
        "entity_ids",
        "entities",
        "source",
        "target_sensor",
        "heater",
        "cooler",
        "humidifier",
        "indoor_humidity_sensor",
        "indoor_temp_sensor",
        "outdoor_temp_sensor",
    }
)


def extract_helper_references(
    options: Mapping[str, Any] | None, known_entities: set[str]
) -> list[dict[str, str]]:
    """Return the entities a helper config entry is built on."""
    return extract_entity_references(options, known_entities, HELPER_KEYS, "REFERENCES")


CARD_LISTS = ("cards", "card", "elements")
LISTED = 20
BUILTIN_PANELS = frozenset({"lovelace"})
SUGGEST_COVERAGE = 0.75


def describe_location(config: Mapping[str, Any] | None, location: str) -> dict[str, Any]:
    """Name the view, section and card a reference path leads through.

    ``views/12/sections/1/cards/0/details/info_left/0/entity_id`` becomes the view title, the
    section number, the type of the innermost card on the way and the path of that card.
    Anything the path does not reach (energy preferences, odd shapes) is left out.
    """
    place: dict[str, Any] = {}
    node: Any = config
    parts = location.split("/")
    for index, part in enumerate(parts):
        if isinstance(node, Mapping):
            node = node.get(part)
        elif isinstance(node, list) and part.isdigit() and int(part) < len(node):
            node = node[int(part)]
        else:
            break
        before = parts[index - 1] if index else ""
        inner = parts[index - 2] if index > 1 else ""
        if parts[0] == "views" and index == 1 and isinstance(node, Mapping):
            place["view"] = str(node.get("title") or node.get("path") or part)
            place["view_index"] = int(part) if part.isdigit() else None
        elif before == "sections" and part.isdigit():
            place["section"] = int(part) + 1
        elif (
            isinstance(node, Mapping)
            and isinstance(node.get("type"), str)
            and (before in CARD_LISTS or (inner in CARD_LISTS and part.isdigit()))
        ):
            place["card"] = node["type"]
            place["card_path"] = "/".join(parts[: index + 1])
            title = node.get("title") or node.get("name")
            if isinstance(title, str):
                place["card_title"] = title
    return place


def _same_word(a: str, b: str) -> bool:
    """Equal words, or one the start of the other (``max`` and ``maximum``)."""
    return a == b or (min(len(a), len(b)) >= 3 and (a.startswith(b) or b.startswith(a)))


def suggest_replacements(
    missing: str, known: set[str], limit: int = 3, cache: dict[str, tuple[str, ...]] | None = None
) -> list[str]:
    """Existing entities whose name is close to a missing ID, best first.

    The candidate has to start with the same word(s) as the missing ID (its device or product
    name); only what follows is compared (``keba_p30_power`` against ``keba_p30_charging_power``).
    At least three quarters of the missing words must reappear. Only a close match is offered,
    because a wrong hint is worse than none.
    """
    domain, _, name = missing.partition(".")
    words = tuple(name.split("_"))
    scored: list[tuple[float, str]] = []
    for candidate in known:
        other = cache.get(candidate) if cache is not None else None
        if other is None:
            other = tuple(candidate.partition(".")[2].split("_"))
            if cache is not None:
                cache[candidate] = other
        shared = 0
        while shared < min(len(words), len(other)) and words[shared] == other[shared]:
            shared += 1
        if not shared or candidate == missing:
            continue
        if shared == len(
            words
        ):  # the same name in another domain, e.g. a sensor for a binary sensor
            if len(other) == shared:
                scored.append((2.0, candidate))
            continue
        rest, rest_other = words[shared:], other[shared:]
        matched = sum(any(_same_word(word, x) for x in rest_other) for word in rest)
        if matched / len(rest) < SUGGEST_COVERAGE:
            continue
        score = 0.7 * matched / len(rest) + 0.3 * matched / max(len(rest_other), 1)
        scored.append((score + (0.1 if candidate.startswith(f"{domain}.") else 0), candidate))
    scored.sort(key=lambda item: (-item[0], item[1]))
    return [candidate for _, candidate in scored[:limit]]


def annotate_findings(
    findings: list[dict[str, Any]],
    config: Mapping[str, Any] | None,
    references: list[dict[str, str]],
) -> None:
    """Add the readable place of each broken reference and how much of its card is broken.

    ``place`` joins the evidence: view, section and card type, the card's path, how many entity
    references the card has and how many of them are broken. The panel groups by the card path
    and calls a card orphaned when most of its references are gone.
    """
    cache: dict[str, dict[str, Any]] = {}

    def place_of(location: str) -> dict[str, Any]:
        if location not in cache:
            cache[location] = describe_location(config, location)
        return cache[location]

    totals = Counter(
        place["card_path"]
        for ref in references
        if "card_path" in (place := place_of(ref["location"]))
    )
    broken = Counter(
        place["card_path"]
        for finding in findings
        if "card_path" in (place := place_of(finding["evidence"][0]["location"]))
    )
    for finding in findings:
        evidence = finding["evidence"][0]
        place = dict(place_of(evidence["location"]))
        if "card_path" in place:
            place["card_refs"] = totals[place["card_path"]]
            place["card_missing"] = broken[place["card_path"]]
        if place:
            evidence["place"] = place


def view_keys(view: Any, index: int) -> set[str]:
    keys = {str(index)}
    if isinstance(view, Mapping) and view.get("path"):
        keys.add(str(view["path"]))
    return keys


def dashboard_health(
    config: Mapping[str, Any] | None,
    views_of: Mapping[str, set[str]],
    resources: int | None,
) -> dict[str, Any]:
    """Structure facts of one dashboard: cards, doubled cards, custom card types, broken navigation.

    ``views_of`` maps the URL path of every dashboard Housekeeper read to the views it has (the
    default dashboard is ``lovelace``). A navigation target counts as broken only inside a
    dashboard that was read and only for its view; links to other panels are never judged.
    ``resources`` is the number of registered dashboard resources, ``None`` when unknown.
    """
    cards = 0
    doubles = 0
    custom: set[str] = set()
    targets: list[str] = []

    def walk(value: Any, key: str | None) -> None:
        nonlocal cards, doubles
        if isinstance(value, Mapping):
            if key in CARD_LISTS and isinstance(value.get("type"), str):
                cards += 1
                if value["type"].startswith("custom:"):
                    custom.add(value["type"][7:])
            for child_key, child in value.items():
                if child_key == "navigation_path" and isinstance(child, str):
                    targets.append(child)
                walk(child, str(child_key))
        elif isinstance(value, list):
            if key in CARD_LISTS:
                seen: set[str] = set()
                for child in value:
                    if isinstance(child, Mapping):
                        try:
                            dump = json.dumps(child, sort_keys=True, default=str)
                        except (TypeError, ValueError):
                            continue
                        doubles += dump in seen
                        seen.add(dump)
            for child in value:
                walk(child, key)

    walk(config or {}, None)
    broken: list[str] = []
    for target in targets:
        parts = target.split("#")[0].split("?")[0].strip("/").split("/")
        dash, view = parts[0], parts[1] if len(parts) > 1 else ""
        if dash in views_of and view and view not in views_of[dash]:
            broken.append(target)
    return {
        "cards": cards,
        "doubles": doubles,
        "custom": sorted(custom)[:LISTED],
        "custom_types": sorted(custom),
        "resources": resources,
        "broken_navigation": sorted(set(broken))[:LISTED],
    }
