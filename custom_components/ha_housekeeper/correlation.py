"""Which findings began at about the time of a logged event (an update, a restart, a plan run).

Only reads the findings of the last scan and Housekeeper's own event log. The result says that two
things happened at about the same time, never that one caused the other. Restarts and plan runs
touch almost everything, so they only appear as groups, not as a line on each finding.
Updates a few minutes apart are one incident, and the restart that comes with them joins it:
the findings of an incident are counted once.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

WINDOW_BEFORE = timedelta(minutes=30)  # an event this long before the finding began still counts
WINDOW_AFTER = timedelta(minutes=10)  # the event may be logged shortly after the finding began
GROUP_ONLY = ("start", "plan", "purge")  # too common to name as a reason on a single finding
MERGE_WINDOW = timedelta(
    minutes=10
)  # updates this close are one incident; so is the restart beside them
GROUP_LIMIT = 50
KEYS_PER_GROUP = 500
BY_KEY_LIMIT = 2000
FIELDS = ("kind", "at", "domain", "from", "to", "down_seconds", "title")


def _parse(value: Any) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=UTC)


def correlate(findings: list[dict[str, Any]], events: list[dict[str, Any]]) -> dict[str, Any]:
    """Groups of findings per event and, for each finding, the event it began with."""
    parsed = []
    for event in events:
        at = _parse(event.get("at"))
        if at is not None and event.get("kind"):
            parsed.append((at, event))
    groups: dict[str, dict[str, Any]] = {}
    members: dict[str, list[str]] = {}
    when: dict[str, datetime] = {}
    for finding in findings:
        began = _parse(finding.get("first_detected_at"))
        key = finding.get("key")
        if began is None or not isinstance(key, str) or finding.get("ignored"):
            continue
        for at, event in parsed:
            if not began - WINDOW_BEFORE <= at <= began + WINDOW_AFTER:
                continue
            group_id = f"{event['kind']}|{event['at']}|{event.get('domain', '')}"
            if group_id not in groups:
                groups[group_id] = {
                    "id": group_id,
                    **{k: event[k] for k in FIELDS if k in event},
                    "only_group": event["kind"] in GROUP_ONLY,
                }
                members[group_id] = []
                when[group_id] = at
            members[group_id].append(key)
    merged = _merge_incidents(groups, members, when)
    ordered = sorted(merged, key=lambda g: g["at"], reverse=True)[:GROUP_LIMIT]
    by_key: dict[str, str] = {}
    for group in sorted(merged, key=lambda g: g["at"], reverse=True):
        if group["only_group"]:
            continue
        for key in group.pop("_all"):
            if key not in by_key and len(by_key) < BY_KEY_LIMIT:
                by_key[key] = group["id"]
    for group in ordered:
        group.pop("_all", None)
    return {"groups": ordered, "by_key": by_key}


def _merge_incidents(
    groups: dict[str, dict[str, Any]], members: dict[str, list[str]], when: dict[str, datetime]
) -> list[dict[str, Any]]:
    """Join updates that are close in time, with the restart beside them; the rest stays as it is."""
    updates = sorted(
        (g for g in groups.values() if not g["only_group"]), key=lambda g: when[g["id"]]
    )
    clusters: list[list[dict[str, Any]]] = []
    for group in updates:
        if clusters and when[group["id"]] - when[clusters[-1][-1]["id"]] <= MERGE_WINDOW:
            clusters[-1].append(group)
        else:
            clusters.append([group])
    restarts: dict[int, list[dict[str, Any]]] = {i: [] for i in range(len(clusters))}
    alone = []
    for group in groups.values():
        if group["only_group"] and group["kind"] == "start":
            near = [
                i
                for i, c in enumerate(clusters)
                if when[c[0]["id"]] - MERGE_WINDOW
                <= when[group["id"]]
                <= when[c[-1]["id"]] + MERGE_WINDOW
            ]
            if near:
                restarts[near[0]].append(group)
                continue
        if group["only_group"]:
            alone.append(group)
    out = []
    for i, cluster in enumerate(clusters):
        joined = [*cluster, *restarts[i]]
        keys = list(dict.fromkeys(k for g in joined for k in members[g["id"]]))
        first = cluster[0]
        out.append(
            {
                **first,
                "total": len(keys),
                "keys": keys[:KEYS_PER_GROUP],
                "also": [{k: g[k] for k in FIELDS if k in g} for g in cluster[1:]],
                "with_restart": bool(restarts[i]),
                "_all": keys,
            }
        )
    for group in alone:
        keys = members[group["id"]]
        out.append({**group, "total": len(keys), "keys": keys[:KEYS_PER_GROUP], "_all": keys})
    return out
