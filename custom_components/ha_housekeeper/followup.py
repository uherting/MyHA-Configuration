"""Watch the system for a day after a plan ran and say whether it stayed clean.

When a plan finishes, the findings that already exist are remembered. Every following scan is
compared with them: a new broken reference, a new unavailable entity or a device that came back
after being forgotten means a ``regression``, if it concerns an object the plan touched. After the
watch time without such a finding the plan is ``clean``. The check reads scans and, for an automation a plan changed, the error runs counted since.
"""

from __future__ import annotations

from collections.abc import Callable
from datetime import datetime, timedelta
from typing import Any

from .runs import run_key

WATCH_HOURS = 24
SHOWN_NEW = 20  # new findings listed in the plan; the number is always exact
REGRESSION_SHOWN_DAYS = 7  # how long a regression is offered on the overview
BASELINE_KINDS = ("broken_reference", "unavailable")


def _current(snapshot: dict[str, Any]) -> tuple[dict[str, dict[str, Any]], set[str]]:
    findings = {
        f["key"]: f
        for f in snapshot["findings"]
        if f["classification"] in BASELINE_KINDS and not f.get("ignored")
    }
    recurring = {r["device_id"] for r in snapshot.get("recurring_devices", [])}
    return findings, recurring


def _scope(plan: dict[str, Any]) -> set[str]:
    """Objects the plan touched: only findings about these can be a consequence of it."""
    scope: set[str] = set()
    for action in plan.get("actions", []):
        scope.update(
            i
            for i in (
                action.get("object_id"),
                action.get("target"),
                *(action.get("entities") or []),
            )
            if isinstance(i, str)
        )
    return scope


def _watched_runs(
    plan: dict[str, Any],
    snapshot: dict[str, Any],
    now: datetime,
    errors_since: Callable[[str, str], int] | None,
) -> dict[str, dict[str, Any]]:
    """Automations the plan changed, with the error runs counted so far today (the starting point)."""
    if errors_since is None:
        return {}
    objects = {o["object_id"]: o for o in snapshot["objects"] if o["object_type"] == "automation"}
    day = now.date().isoformat()
    watched = {}
    for action in plan.get("actions", []):
        obj = objects.get(action["object_id"])
        done = (action.get("result") or {}).get("state") == "done"
        if action["kind"] == "refactor_automation" and done and obj is not None:
            key = run_key(obj)
            watched[action["object_id"]] = {
                "key": key,
                "day": day,
                "errors": errors_since(key, day),
            }
    return watched


def start(
    plan: dict[str, Any],
    snapshot: dict[str, Any],
    now: datetime,
    errors_since: Callable[[str, str], int] | None = None,
) -> None:
    """Begin watching after a plan that changed something; ``snapshot`` is the state afterwards."""
    if not plan.get("executed"):
        return
    findings, recurring = _current(snapshot)
    plan["followup"] = {
        "state": "watching",
        "since": now.isoformat(),
        "until": (now + timedelta(hours=WATCH_HOURS)).isoformat(),
        "baseline": {
            "findings": sorted(findings),
            "recurring": sorted(recurring),
            "scope": sorted(_scope(plan)),
            "runs": _watched_runs(plan, snapshot, now, errors_since),
        },
        "baseline_counts": {
            kind: sum(f["classification"] == kind for f in findings.values())
            for kind in BASELINE_KINDS
        }
        | {"recurring": len(recurring)},
    }


def stop(plan: dict[str, Any]) -> None:
    """A plan that was undone is not watched any more."""
    followup = plan.get("followup")
    if followup and followup["state"] == "watching":
        followup["state"] = "stopped"
        followup.pop("baseline", None)


def check(
    plans: list[dict[str, Any]],
    snapshot: dict[str, Any],
    now: datetime,
    errors_since: Callable[[str, str], int] | None = None,
) -> bool:
    """Compare a finished scan with every watched plan; True if a plan changed."""
    changed = False
    findings, recurring = _current(snapshot)
    for plan in plans:
        followup = plan.get("followup")
        if not followup or followup["state"] != "watching":
            continue
        baseline = followup["baseline"]
        known = set(baseline["findings"])
        scope = set(baseline.get("scope", []))  # empty: nothing to narrow down by
        new = [
            {"key": key, "object_id": f["object_id"], "classification": f["classification"]}
            for key, f in sorted(findings.items())
            if key not in known
            and (not scope or {f["object_id"], f.get("affected_object")} & scope)
        ]
        new += [
            {"key": f"recurring:{d}", "object_id": d, "classification": "recurring"}
            for d in sorted(recurring - set(baseline["recurring"]))
            if not scope or d in scope
        ]
        for entity_id, watch in (baseline.get("runs") or {}).items():
            if errors_since and errors_since(watch["key"], watch["day"]) > watch["errors"]:
                new.append(
                    {
                        "key": f"run_error:{entity_id}",
                        "object_id": entity_id,
                        "classification": "run_error",
                    }
                )
        if new:
            followup.update(state="regression", at=now.isoformat(), new_count=len(new))
            followup["new"] = new[:SHOWN_NEW]
        elif now >= datetime.fromisoformat(followup["until"]):
            followup.update(state="clean", at=now.isoformat())
        else:
            continue
        followup.pop("baseline", None)
        changed = True
    return changed


def regressions(plans: list[dict[str, Any]], now: datetime) -> list[dict[str, Any]]:
    """Recent regressions for the overview: which plan, when, how many new findings."""
    limit = now - timedelta(days=REGRESSION_SHOWN_DAYS)
    return [
        {
            "plan_id": plan["plan_id"],
            "at": plan["followup"]["at"],
            "new_count": plan["followup"].get("new_count", 0),
        }
        for plan in plans
        if plan.get("followup", {}).get("state") == "regression"
        and datetime.fromisoformat(plan["followup"]["at"]) >= limit
    ]


def public(followup: dict[str, Any] | None) -> dict[str, Any] | None:
    """The part of a follow-up the panel needs: no list of remembered findings."""
    if not followup:
        return None
    return {k: v for k, v in followup.items() if k != "baseline"}
