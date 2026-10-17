"""Watch after an update: did anything stay broken that worked before?

A version change (Home Assistant or an integration) starts a watch. The last scan before the
restart is the "before" point; the scans in the hours after it are the samples. What is judged is
the state of the objects (available before, not now), because an outage becomes a finding only
after days. The result is a temporal proximity, never a cause. Ids, statuses and times only.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_VERSION, WATCH_STORAGE_KEY
from .hygiene import finding_key

SAVE_DELAY = 10
WATCH_KINDS = ("ha_version", "os_version", "supervisor_version")  # updates that start a watch
# The update entities of the Supervisor for exactly those updates; an install on them starts the stand-keeping scan.
UPDATE_ENTITIES = (
    "update.home_assistant_core_update",
    "update.home_assistant_operating_system_update",
    "update.home_assistant_supervisor_update",
)
KEEP = 3  # watches kept, the open one included
BAD = frozenset({"unavailable", "problem", "stopped"})
SILENT = frozenset(
    {"unknown"}
)  # reachable but without a value: its own group, never "worse" by itself
# Integrations load late after a restart: nothing is judged before this has passed.
CALM = timedelta(minutes=30)
SAMPLE_DELAYS = (timedelta(minutes=30), timedelta(hours=2), timedelta(hours=6))
SAMPLES_KEPT = 6
BAD_KEPT = 300  # bad objects stored per sample; the total stays exact
GRACE = timedelta(hours=12)  # a watch whose last scan never came is closed this long after its end


def _parse(value: Any) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=UTC)


def _bad(statuses: dict[str, str]) -> dict[str, Any]:
    keys = sorted(key for key, status in statuses.items() if status in BAD)
    quiet = sorted(key for key, status in statuses.items() if status in SILENT)
    return {
        "bad": {key: statuses[key] for key in keys[:BAD_KEPT]},
        "bad_total": len(keys),
        "silent": {key: statuses[key] for key in quiet[:BAD_KEPT]},
        "silent_total": len(quiet),
    }


def make_before(checkpoint: dict[str, Any] | None) -> dict[str, Any] | None:
    """The state before the restart, from the last stored scan; None when there was none."""
    if not checkpoint:
        return None
    statuses = {
        f"{kind}:{oid}": status
        for kind, objects in checkpoint["objects"].items()
        for oid, status in objects.items()
    }
    return {
        "at": checkpoint["at"],
        **_bad(statuses),
        "findings": list(checkpoint["findings"]),
        "unchecked": list(checkpoint.get("unchecked") or []),
        "repairs": checkpoint.get("repairs"),  # None: a checkpoint from before this was stored
    }


def make_sample(snapshot: dict[str, Any]) -> dict[str, Any]:
    """The state of one scan after the restart."""
    statuses = {f"{i['object_type']}:{i['object_id']}": i["status"] for i in snapshot["objects"]}
    return {
        "at": snapshot["meta"]["scanned_at"],
        **_bad(statuses),
        "findings": sorted({finding_key(f) for f in snapshot["findings"]}),
        "unchecked": sorted(snapshot["meta"].get("unchecked") or []),
        "repairs": list(snapshot["meta"].get("repairs") or []),
    }


def next_due(watch: dict[str, Any]) -> datetime | None:
    """When the next scan of this watch is due: the first point no sample has reached yet."""
    started, until = _parse(watch["started_at"]), _parse(watch["until"])
    if started is None or until is None:
        return None
    last = max((_parse(s["at"]) or started for s in watch["samples"]), default=None)
    for point in (*(started + delay for delay in SAMPLE_DELAYS), until):
        if point <= until and (last is None or last < point):
            return point
    return None


def _unread(kinds: set[str], key: str) -> bool:
    return key.split(":", 1)[0] in kinds or key in kinds


def evaluate(watch: dict[str, Any], marked: frozenset[str] = frozenset()) -> dict[str, Any]:
    """Judge a watch: ``stable``, ``worse``, ``transient``, ``unknown`` or ``pending``.

    Bad objects of a source that one of the two scans could not read are not counted either way;
    when something is unread and nothing worse is known, the answer is ``unknown``. An object in
    ``marked`` (offline on purpose and the like) is listed apart and makes nothing worse. Objects that
    answer without a value (``silent``) are a group of their own and do not change the verdict. A repair
    that is open now and was not before is listed by its key (``domain:issue_id``) and counts as worse.
    """
    before, samples = watch.get("before"), watch["samples"]
    empty = {
        "new": [],
        "silent": [],
        "marked": [],
        "fixed": [],
        "transient": [],
        "new_findings": [],
        "new_repairs": [],
    }
    if not samples:
        return {"verdict": "pending", **empty}
    if before is None:
        return {"verdict": "unknown", "reason": "no_before", **empty}
    last = samples[-1]
    unread = set(before.get("unchecked") or []) | set(last.get("unchecked") or [])
    was, now = set(before["bad"]), set(last["bad"])
    seen = set().union(*(set(s["bad"]) for s in samples))
    new_all = sorted(k for k in now - was if not _unread(unread, k))
    new = [k for k in new_all if k not in marked]
    was_quiet, now_quiet = set(before.get("silent") or {}), set(last.get("silent") or {})
    quiet_all = sorted(k for k in now_quiet - was_quiet - was if not _unread(unread, k))
    quiet = [k for k in quiet_all if k not in marked]
    kept = sorted(set(new_all + quiet_all) & marked)
    fixed = sorted(k for k in was - now if not _unread(unread, k))
    transient = sorted(k for k in seen - now - was if not _unread(unread, k))
    new_findings = sorted(set(last["findings"]) - set(before["findings"]))
    # Repairs are compared only when both sides know them (older stored watches do not).
    if isinstance(before.get("repairs"), list) and isinstance(last.get("repairs"), list):
        new_repairs = sorted(set(last["repairs"]) - set(before["repairs"]))
    else:
        new_repairs = []
    if new or new_findings or new_repairs:
        verdict, reason = "worse", None
    elif unread:
        verdict, reason = "unknown", "unread"
    elif transient:
        verdict, reason = "transient", None
    else:
        verdict, reason = "stable", None
    result: dict[str, Any] = {
        "verdict": verdict,
        "new": new,
        "silent": quiet,
        "marked": kept,
        "fixed": fixed,
        "transient": transient,
        "new_findings": new_findings,
        "new_repairs": new_repairs,
    }
    if reason:
        result["reason"] = reason
    return result


def merge_triggers(old: list[dict[str, Any]], new: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """The version changes of a watch; the same change is listed once."""
    seen = {(t["kind"], t.get("domain"), t["to"]) for t in old}
    return [*old, *(t for t in new if (t["kind"], t.get("domain"), t["to"]) not in seen)]


class WatchStore:
    """Persistent record of the last few watches."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, WATCH_STORAGE_KEY)
        self.watches: list[dict[str, Any]] = []

    async def async_load(self) -> None:
        data = await self._store.async_load()
        items = data.get("watches") if isinstance(data, dict) else None
        if isinstance(items, list):
            self.watches = [
                w
                for w in items
                if isinstance(w, dict)
                and _parse(w.get("started_at"))
                and _parse(w.get("until"))
                and isinstance(w.get("samples"), list)
                and isinstance(w.get("triggers"), list)
            ][-KEEP:]

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"watches": self.watches}, SAVE_DELAY)

    def active(self) -> dict[str, Any] | None:
        last = self.watches[-1] if self.watches else None
        return last if last is not None and not last.get("closed_at") else None

    def start(
        self,
        started_at: datetime,
        now: datetime,
        hours: int,
        triggers: list[dict[str, Any]],
        before: dict[str, Any] | None,
    ) -> None:
        """Open a watch, or add the changes to the one that is open (it keeps its first "before")."""
        until = started_at + timedelta(hours=hours)
        current = self.active()
        if current is not None:
            current["triggers"] = merge_triggers(current["triggers"], triggers)
            current["until"] = max(until, _parse(current["until"]) or until).isoformat()
        else:
            self.watches.append(
                {
                    "id": started_at.isoformat(),
                    "started_at": started_at.isoformat(),
                    "detected_at": now.isoformat(),
                    "until": until.isoformat(),
                    "triggers": triggers,
                    "before": before,
                    "samples": [],
                    "closed_at": None,
                    "verdict": None,
                }
            )
            del self.watches[:-KEEP]
        self._save()

    def sample(
        self, snapshot: dict[str, Any], now: datetime, marked: frozenset[str] = frozenset()
    ) -> None:
        """Add this scan to the open watch once the restart has calmed down."""
        watch = self.active()
        started = _parse(watch["started_at"]) if watch else None
        if watch is None or started is None or now < started + CALM:
            return
        for older in watch["samples"]:
            older["findings"] = None  # only the last sample is judged on findings
        watch["samples"].append(make_sample(snapshot))
        del watch["samples"][1 : -SAMPLES_KEPT + 1]
        self._finish(watch, now, marked=marked)
        self._save()

    def expire(self, now: datetime) -> bool:
        """Close a watch whose end passed long ago without a scan; True when it was closed."""
        watch = self.active()
        until = _parse(watch["until"]) if watch else None
        if watch is None or until is None or now < until + GRACE:
            return False
        self._finish(watch, now, force=True)
        self._save()
        return True

    def end(self, now: datetime) -> bool:
        """Close the open watch now, on the user's word; True when there was one."""
        watch = self.active()
        if watch is None:
            return False
        self._finish(watch, now, force=True)
        self._save()
        return True

    def _finish(
        self,
        watch: dict[str, Any],
        now: datetime,
        force: bool = False,
        marked: frozenset[str] = frozenset(),
    ) -> None:
        until = _parse(watch["until"])
        if force or (until is not None and now >= until):
            watch["closed_at"] = now.isoformat()
            watch["verdict"] = evaluate(watch, marked)["verdict"] if watch["samples"] else "unknown"

    def report(self, marked: frozenset[str] = frozenset()) -> list[dict[str, Any]]:
        """Newest first, each with its judgement; ids, statuses and times only."""
        out = []
        for w in reversed(self.watches):
            result = evaluate(w, marked)
            if w.get("closed_at") and w.get("verdict"):
                result["verdict"] = w["verdict"]
            out.append({**w, "result": result})
        return out
