"""Which integrations hang on which app (add-on): an assumption, never a certainty.

Two signals, both deterministic:

* the host name of the app (its slug with ``_`` turned into ``-``, the name the Supervisor's
  network resolves) appears as a host in the entry's title, data or options;
* the entry was created by the Supervisor itself (source ``hassio``) and its domain is the app's
  name without the repository prefix.

The values are only compared and never kept: the result is an edge from the entry to the app.
Names alone (an integration and an app that are called alike) say nothing and are not used.
"""

from __future__ import annotations

import re
from collections.abc import Iterable, Mapping
from datetime import datetime, timedelta
from typing import Any

from .outage_levels import Levels, outage_level
from .sensitive_fields import kind_of

MAX_DEPTH = 3
REPOSITORY_PREFIX = re.compile(r"^[0-9a-f]{8}_")


def dns_name(slug: str) -> str:
    """The host name under which the Supervisor's network resolves an app."""
    return slug.replace("_", "-")


def _strings(value: Any, depth: int = 0) -> Iterable[str]:
    """The text values of a mapping, nested ones included; credentials are skipped."""
    if isinstance(value, str):
        yield value
    elif isinstance(value, Mapping) and depth <= MAX_DEPTH:
        for key, child in value.items():
            if kind_of(key) is None:
                yield from _strings(child, depth + 1)
    elif isinstance(value, list | tuple) and depth <= MAX_DEPTH:
        for child in value:
            yield from _strings(child, depth + 1)


def _mentions(text: str, host: str) -> bool:
    """True when ``host`` stands as a whole host name in ``text`` (not as part of a longer one)."""
    return bool(re.search(rf"(?<![a-z0-9-]){re.escape(host)}(?![a-z0-9-])", text.lower()))


def app_edges(entries: Iterable[Any], apps: Iterable[dict[str, Any]]) -> list[dict[str, str]]:
    """Edges ``config_entry:<id>`` -> ``app:<slug>``; each entry gets the apps it most likely uses."""
    hosts = {app["slug"]: dns_name(str(app["slug"])) for app in apps}
    if not hosts:
        return []
    edges: list[dict[str, str]] = []
    for entry in entries:
        if entry.source == "ignore":
            continue
        texts = [entry.title or "", *_strings(dict(entry.data)), *_strings(dict(entry.options))]
        for slug, host in hosts.items():
            by_host = any(_mentions(text, host) for text in texts)
            by_source = entry.source == "hassio" and dns_name(
                REPOSITORY_PREFIX.sub("", slug)
            ) == dns_name(str(entry.domain))
            if by_host or by_source:
                edges.append(
                    {
                        "source": f"config_entry:{entry.entry_id}",
                        "target": f"app:{slug}",
                        "relation": "CONNECTED",
                        "confidence": "probable",
                    }
                )
    return edges


def stopped_app_findings(
    apps: Iterable[dict[str, Any]],
    integrations: Iterable[dict[str, Any]],
    edges: Iterable[dict[str, str]],
    now: datetime | None = None,
    levels: Levels | None = None,
) -> list[dict[str, Any]]:
    """One finding for each integration that is not working while the app it seems to use is stopped.

    A stopped app on its own is no problem (``status`` stays ``stopped``); it counts only when
    something that hangs on it has failed. As the link is an assumption, so is the confidence.
    """
    stopped = {app["slug"]: app for app in apps if app["status"] == "stopped"}
    failed = {item["object_id"]: item for item in integrations if item["status"] == "problem"}
    findings = []
    for edge in edges:
        if edge["relation"] != "CONNECTED":
            continue
        app = stopped.get(edge["target"].removeprefix("app:"))
        entry = failed.get(edge["source"].removeprefix("config_entry:"))
        if app and entry:
            finding = {
                "rule_id": "app.stopped_in_use",
                "object_id": app["object_id"],
                "classification": "problem",
                "confidence": 0.6,
                "first_detected_at": app.get("status_since"),
                "affected_object": entry["object_id"],
                "evidence": [{"kind": "app_stopped", "source": "supervisor"}],
            }
            if levels is not None and now is not None:
                since = app.get("status_since")
                if not since:
                    continue
                level = outage_level(max(now - datetime.fromisoformat(since), timedelta(0)), levels)
                if level is None:
                    continue  # younger than the first threshold
                finding["outage_level"] = level
            findings.append(finding)
    return findings
