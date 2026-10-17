"""Scan history: compact checkpoints and a pure diff between two scans."""

from __future__ import annotations

import math
from datetime import UTC, datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import DEFAULT_HISTORY_DAYS, HISTORY_STORAGE_KEY, STORAGE_VERSION
from .hygiene import finding_key as _finding_key
from .outage_levels import is_quiet

SAVE_DELAY = 10
LIST_LIMIT = 500  # entries per section sent to the panel; totals stay exact
PIN_LIMIT = 10  # own scan points; the daily clean-up never touches them
PIN_NAME_MAX = 60


class PinError(Exception):
    """A scan point was not accepted; the message names the reason."""


def _valid_checkpoint(value: Any) -> dict[str, Any] | None:
    """A stored checkpoint, or None when what is on disk is not one."""
    if (
        isinstance(value, dict)
        and isinstance(value.get("at"), str)
        and isinstance(value.get("objects"), dict)
        and all(isinstance(group, dict) for group in value["objects"].values())
        and isinstance(value.get("findings"), list)
    ):
        return value
    return None


# The rules whose outcome depends on a setting: when it changed between two scans, findings that
# vanished were not repaired, the rule just reads differently now.
_OUTAGE_RULES = {
    "entity.state_unavailable",
    "entity.state_unknown",
    "config_entry.not_loaded",
    "device.down",
}
SETTING_RULES = {
    "outage_info_minutes": _OUTAGE_RULES,
    "outage_low_hours": _OUTAGE_RULES,
    "outage_medium_hours": _OUTAGE_RULES,
    "outage_high_hours": _OUTAGE_RULES,
    "unused_automation_days": {
        "automation.disabled_long",
        "automation.stale",
        "automation.never_triggered",
    },
    "stale_hours": {"entity.stale"},
}


# The state of the house, as the panel reads it: the number of rated objects, minus the weight of each object
# that has a finding. An object counts once, with its worst level; a chain of outages stands for its cause and
# its followers do not count. "info" (an outage under an hour) weighs nothing, so a restart leaves no dent.
HEALTH_TYPES = frozenset({"entity", "automation", "script", "scene", "config_entry", "device"})
HEALTH_WEIGHTS = {"high": 1.0, "medium": 0.5, "low": 0.2}


def _health(snapshot: dict[str, Any]) -> tuple[int, float]:
    """The rated objects and the weight the objects with a finding take off."""
    known = {
        f"{o['object_type']}:{o['object_id']}"
        for o in snapshot["objects"]
        if o["object_type"] in HEALTH_TYPES
    }
    worst: dict[str, float] = {}

    def note(key: str, level: str) -> None:
        if key in known:
            worst[key] = max(worst.get(key, 0.0), HEALTH_WEIGHTS.get(level, 0.0))

    for cause in snapshot.get("causes", []):
        if not cause.get("parent_id"):
            note(f"{cause['object_type']}:{cause['object_id']}", cause.get("impact", "none"))
    for finding in snapshot["findings"]:
        if not finding.get("ignored") and not finding.get("cause_id"):
            key = f"{finding['rule_id'].split('.')[0]}:{finding['object_id']}"
            note(key, finding.get("impact", "none"))
    return len(known), round(sum(worst.values()), 1)


def health_percent(base: int | None, load: float | None) -> float | None:
    """The share of the rated objects that is in order, with one decimal."""
    if not base or load is None:
        return None
    # Rounded down, so that a house with a finding never reads 100.
    return math.floor(round(1000 * (1 - load / base), 6)) / 10


# The rules whose finding is a cause itself; any other finding with a cause_id is a follow-up.
CAUSE_OWN_RULES = {"config_entry.not_loaded", "device.down", "app.stopped_in_use"}


def _is_follower(finding: dict[str, Any]) -> bool:
    return bool(finding.get("cause_id")) and finding.get("rule_id") not in CAUSE_OWN_RULES


def make_checkpoint(snapshot: dict[str, Any]) -> dict[str, Any]:
    """Reduce a snapshot to what a later comparison needs."""
    objects: dict[str, dict[str, str]] = {}
    for item in snapshot["objects"]:
        objects.setdefault(item["object_type"], {})[item["object_id"]] = item["status"]
    open_findings = [f for f in snapshot["findings"] if not f.get("ignored")]
    classes: dict[str, int] = {}
    for finding in open_findings:
        name = str(finding.get("classification") or "")
        classes[name] = classes.get(name, 0) + 1
    # The tiles count without the follow-ups that hang on a cause, so their curves do too.
    lead_classes: dict[str, int] = {}
    for finding in open_findings:
        if not _is_follower(finding):
            name = str(finding.get("classification") or "")
            lead_classes[name] = lead_classes.get(name, 0) + 1
    health_base, health_load = _health(snapshot)
    return {
        "at": snapshot["meta"]["scanned_at"],
        "objects": objects,
        # A quiet outage (info, low) is not a change: it enters the list once it is medium.
        "findings": sorted({_finding_key(f) for f in snapshot["findings"] if not is_quiet(f)}),
        # For the sparklines: open findings, per class, and the state of the house.
        "open": len(open_findings),
        "classes": classes,
        "lead": sum(lead_classes.values()),
        "lead_classes": lead_classes,
        "health_base": health_base,
        "health_load": health_load,
        # The settings that decide whether some findings exist at all.
        "rules": {
            name: snapshot["meta"][name] for name in SETTING_RULES if name in snapshot["meta"]
        },
        # Sources this scan could not read: what is missing from it is unknown, not gone.
        "unchecked": sorted(snapshot["meta"].get("unchecked") or []),
        # Open repairs (domain:issue_id), for the watch after an update.
        "repairs": list(snapshot["meta"].get("repairs") or []),
    }


def diff_checkpoints(base: dict[str, Any], snapshot: dict[str, Any]) -> dict[str, Any]:
    """Describe what changed between a stored checkpoint and the current snapshot."""
    current = make_checkpoint(snapshot)
    by_key = {(i["object_type"], i["object_id"]): i for i in snapshot["objects"]}

    old = {(t, oid): s for t, objs in base["objects"].items() for oid, s in objs.items()}
    now = {(t, oid): s for t, objs in current["objects"].items() for oid, s in objs.items()}

    # An object of a source that one of the two scans could not read did not appear or vanish: it was unseen.
    unchecked = set(snapshot["meta"].get("unchecked") or [])
    unread = unchecked | set(base.get("unchecked") or [])

    def is_unread(t: str, oid: str) -> bool:
        return t in unread or f"{t}:{oid}" in unread

    new_objects = [
        {
            "object_type": t,
            "object_id": oid,
            "name": by_key[(t, oid)]["name"],
            "status": now[(t, oid)],
        }
        for (t, oid) in now.keys() - old.keys()
        if not is_unread(t, oid)
    ]
    removed_objects = [
        {"object_type": t, "object_id": oid}
        for (t, oid) in old.keys() - now.keys()
        if not is_unread(t, oid)
    ]
    unread_objects = [
        {"object_type": t, "object_id": oid}
        for (t, oid) in old.keys() ^ now.keys()
        if is_unread(t, oid)
    ]
    status_changes = [
        {
            "object_type": t,
            "object_id": oid,
            "name": by_key[(t, oid)]["name"],
            "from": old[(t, oid)],
            "to": now[(t, oid)],
        }
        for (t, oid) in now.keys() & old.keys()
        if old[(t, oid)] != now[(t, oid)]
    ]

    base_findings = set(base["findings"])
    new_findings = [
        f for f in snapshot["findings"] if _finding_key(f) not in base_findings and not is_quiet(f)
    ]
    # Rules that read differently now than at the baseline: what vanished under them was not repaired.
    base_rules = base.get("rules") or {}
    # A checkpoint from before the levels by duration still holds the old setting: every outage reads differently now.
    legacy = "min_unavailable_days" in base_rules and "outage_info_minutes" not in base_rules
    changed = {
        name
        for name in SETTING_RULES
        if (name in base_rules and base_rules[name] != current["rules"].get(name))
        or (legacy and name.startswith("outage_"))
    }
    reworded = set().union(*(SETTING_RULES[name] for name in changed)) if changed else set()
    resolved_findings = []
    ended_findings = []
    for key in sorted(base_findings - set(current["findings"])):
        rule_id, object_id, affected = key.split("|", 2)
        item = {"rule_id": rule_id, "object_id": object_id, "affected_object": affected or None}
        owner = (rule_id.split(".")[0], object_id)
        # Said only when it is proven: "resolved" needs the object still there, a rule that reads the
        # same and a source that was read. Otherwise the end is listed with its reason, not counted.
        if owner[0] in unchecked or f"{owner[0]}:{owner[1]}" in unchecked:
            ended_findings.append({**item, "reason": "unchecked"})
        elif owner not in now:
            ended_findings.append(
                {**item, "reason": "object_removed" if owner in old else "unknown"}
            )
        elif rule_id in reworded:
            ended_findings.append({**item, "reason": "rules_changed"})
        else:
            resolved_findings.append(item)

    def cut(rows: list[dict[str, Any]]) -> dict[str, Any]:
        rows = sorted(rows, key=lambda r: (r.get("object_type", ""), r["object_id"]))
        return {"total": len(rows), "items": rows[:LIST_LIMIT]}

    return {
        "baseline_at": base["at"],
        "scanned_at": current["at"],
        "new_objects": cut(new_objects),
        "removed_objects": cut(removed_objects),
        "unread_objects": {"total": len(unread_objects)},
        "status_changes": cut(status_changes),
        "new_findings": cut(new_findings),
        "resolved_findings": cut(resolved_findings),
        "ended_findings": cut(ended_findings),
        "new_rating": legacy,
    }


def checkpoint_counts(checkpoint: dict[str, Any]) -> dict[str, int]:
    """Totals for the timeline, derived from what a checkpoint already stores."""
    return {
        "objects": sum(len(objs) for objs in checkpoint["objects"].values()),
        "findings": len(checkpoint["findings"]),
    }


def _local_day(at: str) -> str:
    """The calendar day of a timestamp in Home Assistant's time zone, the day the panel shows."""
    try:
        moment = datetime.fromisoformat(at)
    except ValueError:
        return at[:10]
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=UTC)
    return dt_util.as_local(moment).date().isoformat()


def _one_per_day(checkpoints: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Keep the last checkpoint of each local day (older files counted the day in UTC)."""
    last: dict[str, dict[str, Any]] = {}
    for checkpoint in sorted(checkpoints, key=lambda cp: cp["at"]):
        last[_local_day(checkpoint["at"])] = checkpoint
    return list(last.values())


def _age_cutoff(at: str, days: int) -> str:
    """ISO timestamp ``days`` before ``at``; checkpoints older than this are dropped."""
    try:
        return (datetime.fromisoformat(at) - timedelta(days=days)).isoformat()
    except ValueError:
        return ""


class ScanHistory:
    """Persist the previous scan, the last scan of each earlier day and the scan points you set yourself."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.retention_days = DEFAULT_HISTORY_DAYS
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, HISTORY_STORAGE_KEY)
        self._latest: dict[str, Any] | None = None
        self._previous: dict[str, Any] | None = None
        self._daily: list[dict[str, Any]] = []
        self._pinned: list[dict[str, Any]] = []

    async def async_load(self) -> None:
        """Load stored checkpoints."""
        data = await self._store.async_load()
        if not isinstance(data, dict):
            return
        self._latest = _valid_checkpoint(data.get("latest"))
        self._previous = _valid_checkpoint(data.get("previous"))
        daily = data.get("daily")
        self._daily = _one_per_day(
            [cp for cp in daily if _valid_checkpoint(cp)] if isinstance(daily, list) else []
        )
        pinned = data.get("pinned")
        self._pinned = [
            {**cp, "name": str(cp.get("name") or "")[:PIN_NAME_MAX]}
            for cp in (pinned if isinstance(pinned, list) else [])
            if _valid_checkpoint(cp)
        ][:PIN_LIMIT]

    @property
    def previous(self) -> dict[str, Any] | None:
        """The scan before the latest one."""
        return self._previous

    def record(self, snapshot: dict[str, Any]) -> None:
        """Remember a finished scan; the last one becomes the 'previous' baseline."""
        checkpoint = make_checkpoint(snapshot)
        if self._latest is not None:
            self._previous = self._latest
            if _local_day(self._latest["at"]) != _local_day(checkpoint["at"]):
                self._daily = [*self._daily, self._latest]
        if self._daily:
            cutoff = _age_cutoff(checkpoint["at"], self.retention_days)
            self._daily = [cp for cp in self._daily if cp["at"] >= cutoff]
        self._latest = checkpoint
        self._store.async_delay_save(self._as_dict, SAVE_DELAY)

    def _as_dict(self) -> dict[str, Any]:
        return {
            "latest": self._latest,
            "previous": self._previous,
            "daily": self._daily,
            "pinned": self._pinned,
        }

    def pin(self, snapshot: dict[str, Any], name: str) -> None:
        """Keep this scan as a comparison point until it is deleted."""
        if snapshot["meta"].get("preliminary"):
            raise PinError("preliminary")
        name = name.strip()
        if len(name) > PIN_NAME_MAX:
            raise PinError("name")
        checkpoint = make_checkpoint(snapshot)
        if any(cp["at"] == checkpoint["at"] for cp in self._pinned):
            raise PinError("exists")
        if len(self._pinned) >= PIN_LIMIT:
            raise PinError("too_many")
        self._pinned.append({**checkpoint, "name": name})
        self._store.async_delay_save(self._as_dict, SAVE_DELAY)

    def unpin(self, baseline: str) -> None:
        """Delete a scan point by its id (``pin:<time>``)."""
        before = len(self._pinned)
        self._pinned = [cp for cp in self._pinned if f"pin:{cp['at']}" != baseline]
        if len(self._pinned) == before:
            raise PinError("not_found")
        self._store.async_delay_save(self._as_dict, SAVE_DELAY)

    def baselines(self) -> list[dict[str, str]]:
        """List selectable comparison points, newest first."""
        options = []
        if self._previous is not None:
            options.append(
                {"id": "previous", "at": self._previous["at"], **checkpoint_counts(self._previous)}
            )
        options.extend(
            {
                "id": f"pin:{cp['at']}",
                "at": cp["at"],
                "name": cp["name"],
                "pinned": True,
                **checkpoint_counts(cp),
            }
            for cp in sorted(self._pinned, key=lambda c: c["at"], reverse=True)
        )
        options.extend(
            {"id": cp["at"], "at": cp["at"], **checkpoint_counts(cp)}
            for cp in reversed(self._daily)
            if self._previous is None or cp["at"] != self._previous["at"]
        )
        return options

    def series(self) -> dict[str, Any]:
        """Totals per day for the sparklines: the stored days plus the latest scan, oldest first."""
        checkpoints = list(self._daily)
        if self._latest is not None:
            if checkpoints and _local_day(checkpoints[-1]["at"]) == _local_day(self._latest["at"]):
                checkpoints.pop()
            checkpoints.append(self._latest)
        return {
            "retention_days": self.retention_days,
            "points": [
                {
                    "at": cp["at"],
                    **checkpoint_counts(cp),
                    "open": cp.get("open"),
                    "classes": cp.get("classes"),
                    "lead": cp.get("lead"),
                    "lead_classes": cp.get("lead_classes"),
                    "health": health_percent(cp.get("health_base"), cp.get("health_load")),
                    "unavailable": sum(
                        1
                        for objs in cp["objects"].values()
                        for status in objs.values()
                        if status == "unavailable"
                    ),
                }
                for cp in checkpoints
            ],
        }

    def compare(self, snapshot: dict[str, Any], baseline: str = "previous") -> dict[str, Any]:
        """Compare the current snapshot with a baseline; an empty result if none exists."""
        if baseline == "previous":
            base = self._previous
        elif isinstance(baseline, str) and baseline.startswith("pin:"):
            base = next((cp for cp in self._pinned if f"pin:{cp['at']}" == baseline), None)
        else:
            base = next((cp for cp in self._daily if cp["at"] == baseline), None)
        result: dict[str, Any] = {
            "baselines": self.baselines(),
            "baseline": baseline,
            "retention_days": self.retention_days,
            "current": checkpoint_counts(make_checkpoint(snapshot)),
        }
        if base is None:
            return {**result, "available": False}
        return {**result, "available": True, **diff_checkpoints(base, snapshot)}
