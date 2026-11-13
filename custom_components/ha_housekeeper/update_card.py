"""What the dashboard card "after the update" shows: what stopped working since the last update, in a few lines.

The judgement is the one of the watch (``watch.evaluate``); this only puts the names to the keys, keeps the list short
and adds how long the start took. Like the watch it says "since", never "because".
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Final

from .watch import evaluate, next_due

PROBLEMS_MAX: Final = 8
TRIGGERS_MAX: Final = 3
# What a person looks at first: the integration, then the device, then what it controls.
_ORDER: Final = ("config_entry", "device", "automation", "script", "scene", "entity")

NONE: Final = "none"
STATES: Final = (NONE, "pending", "stable", "transient", "worse", "unknown")


def _name(key: str, names: dict[str, str]) -> str:
    return names.get(key) or key.partition(":")[2]


def _at(value: Any) -> datetime | None:
    try:
        return datetime.fromisoformat(str(value))
    except ValueError:
        return None


def start_figures(
    starts: list[dict[str, Any]], since: str | None = None
) -> dict[str, float | None]:
    """How long a start took against the mean of all the starts before it, as on the start page of the panel.

    Without ``since`` it is the last start. With the time a watch began it is the first start from then on, the one that
    belongs to the update; a restart that came later does not stand in for it, and without such a start there is none.
    """
    timed = [s for s in starts if isinstance(s.get("boot_s"), int | float)]
    begin = _at(since) if since else None
    if begin is not None:
        timed = timed[
            : next(
                (i + 1 for i, s in enumerate(timed) if (at := _at(s.get("at"))) and at >= begin),
                0,
            )
        ]
    if not timed:
        return {"start_seconds": None, "start_usual_seconds": None}
    before = [float(s["boot_s"]) for s in timed[:-1]]
    return {
        "start_seconds": float(timed[-1]["boot_s"]),
        "start_usual_seconds": sum(before) / len(before) if before else None,
    }


def update_view(
    watch: dict[str, Any] | None,
    marked: frozenset[str],
    objects: list[dict[str, Any]],
    starts: list[dict[str, Any]],
) -> dict[str, Any]:
    """The newest watch, judged, with the objects that are worse than before named and the last start."""
    figures = start_figures(starts, watch["started_at"] if watch else None)
    if watch is None:
        return {"state": NONE, **figures}
    result = evaluate(watch, marked)
    verdict = (
        watch["verdict"] if watch.get("closed_at") and watch.get("verdict") else result["verdict"]
    )
    names = {f"{o['object_type']}:{o['object_id']}": o.get("name") or "" for o in objects}
    last = watch["samples"][-1] if watch["samples"] else {}
    bad = last.get("bad") or {}
    rank = {kind: i for i, kind in enumerate(_ORDER)}
    keys = sorted(
        result["new"],
        key=lambda k: (rank.get(k.partition(":")[0], len(_ORDER)), _name(k, names).casefold()),
    )
    due = next_due(watch) if not watch.get("closed_at") and not watch["samples"] else None
    return {
        "state": verdict if verdict in STATES else "unknown",
        "started_at": watch["started_at"],
        "until": watch["until"],
        "open": not watch.get("closed_at"),
        "samples": len(watch["samples"]),
        "triggers": [
            {"kind": t["kind"], "to": t.get("to")} for t in watch["triggers"][:TRIGGERS_MAX]
        ],
        "next_check": due.isoformat() if due else None,
        "problems": [
            {
                "name": _name(key, names),
                "type": key.partition(":")[0],
                "status": bad.get(key) or "unavailable",
            }
            for key in keys[:PROBLEMS_MAX]
        ],
        "problems_total": len(keys),
        "silent": len(result["silent"]),
        "fixed": len(result["fixed"]),
        "transient": len(result["transient"]),
        "new_findings": len(result["new_findings"]),
        "new_repairs": len(result["new_repairs"]),
        **figures,
    }
