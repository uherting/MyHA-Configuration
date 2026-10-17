"""Automations and scripts that call a service which does not exist (any more).

Removing an integration removes its services; what still calls them fails at that step, or, with
``continue_on_error``, fails unnoticed. Only a literal ``domain.service`` is looked at: a template,
an input of a blueprint or anything else that is not of that shape says nothing. A service of an
integration that has a configuration entry which is not loaded is left out, because that outage is
the cause and is reported on its own.
"""

from __future__ import annotations

import re
from collections.abc import Callable, Collection, Iterable
from typing import Any

SERVICE_SHAPE = re.compile(r"^[a-z0-9_]+\.[a-z0-9_]+$")
SERVICE_KEYS = ("action", "service")
SKIPPED_KEYS = ("data", "data_template", "variables", "target")  # content, not calls
MAX_DEPTH = 12


def service_calls(actions: Any) -> list[tuple[str, str]]:
    """The literal services an action list calls, with their place: (service, location)."""
    found: list[tuple[str, str]] = []

    def walk(value: Any, path: str, depth: int) -> None:
        if depth > MAX_DEPTH:
            return
        if isinstance(value, dict):
            for key, child in value.items():
                where = f"{path}/{key}" if path else str(key)
                if key in SKIPPED_KEYS:
                    continue
                if key in SERVICE_KEYS and isinstance(child, str) and SERVICE_SHAPE.match(child):
                    found.append((child, where))
                else:
                    walk(child, where, depth + 1)
        elif isinstance(value, list):
            for index, child in enumerate(value):
                walk(child, f"{path}/{index}", depth + 1)

    walk(actions, "actions", 0)
    return found


def missing_service_findings(
    items: Iterable[dict[str, Any]],
    has_service: Callable[[str, str], bool],
    unloaded_domains: Collection[str],
) -> list[dict[str, Any]]:
    """One finding for each service an automation or script calls that is not registered."""
    findings = []
    for item in items:
        if item["object_type"] not in ("automation", "script"):
            continue
        reported: set[str] = set()
        for service, location in service_calls(item.get("actions")):
            domain, name = service.split(".", 1)
            if service in reported or domain in unloaded_domains or has_service(domain, name):
                continue
            reported.add(service)
            findings.append(
                {
                    "rule_id": f"{item['object_type']}.missing_service",
                    "object_id": item["object_id"],
                    "classification": "broken_reference",
                    "confidence": 0.9,
                    "first_detected_at": None,
                    "affected_object": service,
                    "evidence": [
                        {
                            "kind": "missing_service",
                            "source": "service_registry",
                            "location": location,
                        }
                    ],
                }
            )
    return findings
