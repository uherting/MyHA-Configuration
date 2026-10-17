"""An explaining dry run of one automation: what it would do, judged on known values.

Nothing is executed and nothing is sent to a device. Triggers, conditions and the likely branch are
worked out from the configuration with the current states, overridden by test states the person
gives. Anything that cannot be judged (templates, sun, zones, devices, entity references) is
reported as unknown, never guessed. Services and their targets are listed with what is wrong with
them; locks, alarm panels and garage doors are marked as critical.
"""

from __future__ import annotations

import re
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime, time
from typing import Any

CRITICAL_DOMAINS = frozenset({"lock", "alarm_control_panel"})
CRITICAL_COVERS = frozenset({"garage", "gate", "door"})
WEEKDAYS = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")
CLOCK = re.compile(r"^(\d{1,2}):(\d{2})(?::(\d{2}))?$")
ENTITY = re.compile(r"^[a-z0-9_]+\.[a-z0-9_]+$")
MAX_CALLS = 50
LIMITS = ("templates", "sun_zone_device", "external", "no_execution")


@dataclass
class Context:
    """What the dry run may look at: states (with test overrides), the registry and the clock."""

    state: Callable[[str], str | None]
    attrs: Callable[[str], dict[str, Any]]
    exists: Callable[[str], bool]
    disabled: Callable[[str], bool]
    now: datetime
    overrides: dict[str, str]


def _ids(value: Any) -> list[str]:
    if isinstance(value, str):
        return [value]
    if isinstance(value, list):
        return [v for v in value if isinstance(v, str)]
    return []


def _clock(value: Any) -> time | None:
    match = CLOCK.match(value) if isinstance(value, str) else None
    if not match:
        return None
    hour, minute, second = int(match[1]), int(match[2]), int(match[3] or 0)
    return time(hour, minute, second) if hour < 24 and minute < 60 and second < 60 else None


def _all(results: list[bool | None]) -> bool | None:
    if any(r is False for r in results):
        return False
    return None if any(r is None for r in results) else True


def _any(results: list[bool | None]) -> bool | None:
    if any(r is True for r in results):
        return True
    return None if any(r is None for r in results) else False


def _number(value: Any) -> float | None:
    if isinstance(value, bool) or not isinstance(value, int | float | str):
        return None
    try:
        return float(value)
    except ValueError:
        return None


def _numeric(entities: list[str], above: Any, below: Any, ctx: Context) -> bool | None:
    results: list[bool | None] = []
    for entity_id in entities:
        value = _number(ctx.state(entity_id))
        low, high = (
            (None if above is None else _number(above)),
            (None if below is None else _number(below)),
        )
        if (
            value is None
            or (above is not None and low is None)
            or (below is not None and high is None)
        ):
            results.append(None)
            continue
        results.append((low is None or value > low) and (high is None or value < high))
    return _all(results) if results else None


def _time(cond: dict[str, Any], ctx: Context) -> bool | None:
    results: list[bool | None] = []
    weekday = cond.get("weekday")
    if weekday is not None:
        days = [weekday] if isinstance(weekday, str) else weekday
        results.append(WEEKDAYS[ctx.now.weekday()] in days if isinstance(days, list) else None)
    after, before = cond.get("after"), cond.get("before")
    low, high = _clock(after), _clock(before)
    if (after is not None and low is None) or (before is not None and high is None):
        results.append(None)  # an input_datetime or sensor reference
    elif low is not None or high is not None:
        now = ctx.now.time()
        if low is not None and high is not None and low >= high:
            results.append(now >= low or now < high)
        else:
            results.append((low is None or now >= low) and (high is None or now < high))
    return _all(results) if results else None


def evaluate(cond: Any, ctx: Context) -> bool | None:
    """True, False, or None when the condition cannot be judged with what is known."""
    if not isinstance(cond, dict):
        return None
    kind = cond.get("condition")
    if kind == "state":
        entities, wanted = _ids(cond.get("entity_id")), cond.get("state")
        if not entities or wanted is None or cond.get("for") or cond.get("attribute"):
            return None
        options = [str(w) for w in (wanted if isinstance(wanted, list) else [wanted])]
        states = [ctx.state(e) for e in entities]
        if any(s is None for s in states):
            return None
        matches = [s in options for s in states]
        return any(matches) if cond.get("match") == "any" else all(matches)
    if kind == "numeric_state":
        if cond.get("attribute") or cond.get("value_template"):
            return None
        return _numeric(_ids(cond.get("entity_id")), cond.get("above"), cond.get("below"), ctx)
    if kind == "time":
        return _time(cond, ctx)
    nested = [evaluate(c, ctx) for c in cond.get("conditions") or []]
    if kind == "and":
        return _all(nested)
    if kind == "or":
        return _any(nested)
    if kind == "not":
        inner = _any(nested)
        return None if inner is None else not inner
    return None


def evaluate_all(conditions: Any, ctx: Context) -> bool | None:
    """All of a list of conditions (an empty list is true)."""
    items = (
        conditions if isinstance(conditions, list) else ([] if conditions is None else [conditions])
    )
    return _all([evaluate(c, ctx) for c in items])


def trigger_result(trigger: Any, ctx: Context) -> bool | None:
    """Whether a trigger would fire for the test states; None without a test state or a verdict."""
    if not isinstance(trigger, dict):
        return None
    kind = trigger.get("trigger") or trigger.get("platform")
    entities = [e for e in _ids(trigger.get("entity_id")) if e in ctx.overrides]
    if kind not in ("state", "numeric_state") or not entities:
        return None
    if kind == "numeric_state":
        if trigger.get("attribute") or trigger.get("value_template"):
            return None
        return _numeric(entities, trigger.get("above"), trigger.get("below"), ctx)
    if trigger.get("from") is not None or trigger.get("attribute"):
        return None
    wanted = trigger.get("to")
    if wanted is None:
        return True
    options = [str(w) for w in (wanted if isinstance(wanted, list) else [wanted])]
    return any(ctx.overrides[e] in options for e in entities)


def _targets(step: dict[str, Any]) -> tuple[list[str], bool]:
    """Entity IDs a service step names, and whether some are given by a template."""
    found: list[str] = []
    templated = False
    for holder in (step, step.get("target"), step.get("data")):
        if isinstance(holder, dict) and "entity_id" in holder:
            for value in (
                holder["entity_id"]
                if isinstance(holder["entity_id"], list)
                else [holder["entity_id"]]
            ):
                if isinstance(value, str) and ENTITY.match(value):
                    found.append(value)
                else:
                    templated = True
    return list(dict.fromkeys(found)), templated


def _call(
    step: dict[str, Any], service: str, certain: bool, path: str, ctx: Context
) -> dict[str, Any]:
    targets, templated = _targets(step)
    domain = service.split(".", 1)[0]
    critical = domain in CRITICAL_DOMAINS or any(
        t.split(".", 1)[0] in CRITICAL_DOMAINS
        or (t.startswith("cover.") and ctx.attrs(t).get("device_class") in CRITICAL_COVERS)
        for t in targets
    )
    return {
        "service": service,
        "targets": targets,
        "templated": templated,
        "certain": certain,
        "path": path,
        "critical": critical,
        "missing": [t for t in targets if not ctx.exists(t)],
        "disabled": [t for t in targets if ctx.exists(t) and ctx.disabled(t)],
    }


class _Walk:
    def __init__(self, ctx: Context) -> None:
        self.ctx = ctx
        self.calls: list[dict[str, Any]] = []
        self.branches: list[str] = []
        self.unknown = False
        self.stopped = False

    def steps(self, steps: Any, prefix: str, certain: bool) -> bool:
        """Walk a list of steps; False once a condition step ended the run."""
        if not isinstance(steps, list):
            return True
        for index, step in enumerate(steps):
            if not isinstance(step, dict):
                continue
            base = f"{prefix}/{index}"
            if not self.step(step, base, certain):
                return False
            if (
                (step.get("condition") is not None and evaluate(step, self.ctx) is None)
                or "wait_template" in step
                or "wait_for_trigger" in step
            ):
                certain = False  # whether the rest runs at all is not known
        return True

    def step(self, step: dict[str, Any], base: str, certain: bool) -> bool:
        service = step.get("action") or step.get("service")
        if isinstance(service, str) and "." in service and len(self.calls) < MAX_CALLS:
            self.calls.append(_call(step, service, certain, base, self.ctx))
        if "stop" in step:
            return False
        if step.get("condition") is not None:
            verdict = evaluate(step, self.ctx)
            if verdict is False:
                return False
            if verdict is None:
                self.unknown = True
        if isinstance(step.get("choose"), list):
            return self.choose(step, base, certain)
        if "if" in step:
            return self.branch_if(step, base, certain)
        if isinstance(step.get("parallel"), list):
            return self.steps(step["parallel"], f"{base}/parallel", certain)
        if "sequence" in step and "choose" not in step:
            return self.steps(step["sequence"], f"{base}/sequence", certain)
        if isinstance(step.get("repeat"), dict):
            count = step["repeat"].get("count")
            return self.steps(
                step["repeat"].get("sequence"),
                f"{base}/repeat/sequence",
                certain and isinstance(count, int) and not isinstance(count, bool) and count >= 1,
            )
        return True

    def choose(self, step: dict[str, Any], base: str, certain: bool) -> bool:
        undecided = False
        for number, option in enumerate(step["choose"]):
            if not isinstance(option, dict):
                continue
            branch = f"{base}/choose/{number}/sequence"
            verdict = evaluate_all(option.get("conditions"), self.ctx)
            if verdict is False:
                continue
            if verdict is True and not undecided:
                self.branches.append(branch)
                return self.steps(option.get("sequence"), branch, certain)
            undecided = True
            self.unknown = True
            self.steps(option.get("sequence"), branch, False)
        if "default" in step:
            if not undecided:
                self.branches.append(f"{base}/default")
            return self.steps(step["default"], f"{base}/default", certain and not undecided)
        return True

    def branch_if(self, step: dict[str, Any], base: str, certain: bool) -> bool:
        verdict = evaluate_all(step.get("if"), self.ctx)
        if verdict is True:
            self.branches.append(f"{base}/then")
            return self.steps(step.get("then"), f"{base}/then", certain)
        if verdict is False:
            if "else" in step:
                self.branches.append(f"{base}/else")
            return self.steps(step.get("else"), f"{base}/else", certain)
        self.unknown = True
        self.steps(step.get("then"), f"{base}/then", False)
        self.steps(step.get("else"), f"{base}/else", False)
        return True


def dry_run(triggers: Any, conditions: Any, actions: Any, ctx: Context) -> dict[str, Any]:
    """The explaining result; it never calls a service."""
    fired = [
        {
            "index": i,
            "result": trigger_result(t, ctx),
            "platform": (t or {}).get("trigger") or (t or {}).get("platform"),
        }
        for i, t in enumerate(triggers or [])
    ]
    verdict = evaluate_all(conditions, ctx)
    walk = _Walk(ctx)
    if verdict is not False:
        walk.steps(actions, "action", verdict is True)
    return {
        "executes": False,
        "triggers": fired,
        "conditions": verdict,
        "condition_details": [
            {"index": i, "result": evaluate(c, ctx)}
            for i, c in enumerate(conditions if isinstance(conditions, list) else [])
        ],
        "branches": walk.branches,
        "calls": walk.calls,
        "uncertain": walk.unknown or verdict is None,
        "limits": list(LIMITS),
    }
