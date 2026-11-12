"""The cleanup ("Aufräumen"): five stages through the open findings, and where the house stands.

The stages are cut from the topics and the impact, with no outline of their own: (1) outages that
hold up many follow-ups, (2) suggestions for marks (the panel's card; it has no findings of its own
here), (3) high or medium impact of the other topics but "Unneeded", (4) "Unneeded" as a cleanup
round, (5) the rest, low or info impact, put off together. One record for the whole house, not per
user: when it began, the stage, how many findings were open then, which stages are done.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Final

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import FIRST_CLEANUP_STORAGE_KEY, STORAGE_VERSION
from .finding_topics import UNNEEDED
from .impact import RANK

SAVE_DELAY = 10
STAGES: Final = (1, 2, 3, 4, 5)
CHAIN_MIN: Final = 3  # an outage with at least this many follow-ups is a "large chain"
OFFER_MIN: Final = 25  # open findings from which the cleanup is offered
LATER_DAYS: Final = 90  # default time for the rest put off in stage 5
BULK_LIMIT: Final = 1000  # findings put off in one step
LOG_ACTIONS: Final = ("keep", "later", "hidden", "skip", "mark", "nothanks", "later_all", "pick")
LOG_LIMIT: Final = 300  # entries of the history kept
LOG_KEYS_LIMIT: Final = (
    5000  # keys the entries of the history name in all; the oldest entries go first
)


def stage_keys(snapshot: dict[str, Any]) -> dict[int, list[str]]:
    """The keys of the open findings in each stage 1, 3, 4 and 5; stage 2 is the panel's own card.

    A finding lands in one stage only. A follow-up goes with its outage and is in none.
    """
    causes = snapshot.get("causes", [])
    followers = {key for cause in causes for key in cause.get("follower_keys", [])}
    chains = {
        cause["finding_key"]
        for cause in causes
        if cause.get("finding_key") and cause.get("total_followers", 0) >= CHAIN_MIN
    }
    stages: dict[int, list[str]] = {1: [], 2: [], 3: [], 4: [], 5: []}
    for finding in snapshot.get("findings", []):
        key = finding["key"]
        if finding.get("ignored") or key in followers:
            continue
        rank = RANK.get(finding.get("impact") or "none", 0)
        if key in chains:
            stages[1].append(key)
        elif finding.get("topic") == UNNEEDED:
            stages[4].append(key)
        elif rank >= RANK["medium"]:
            stages[3].append(key)
        else:
            stages[5].append(key)
    return stages


def _text(value: Any, limit: int) -> str | None:
    return value[:limit] if isinstance(value, str) and value else None


def clean_entry(value: Any) -> dict[str, Any] | None:
    """One entry of the history of the tour (what was decided on a card); anything of an unknown shape is dropped."""
    if not isinstance(value, dict):
        return None
    entry_id, action, stage = _text(value.get("id"), 40), value.get("action"), value.get("stage")
    if not entry_id or action not in LOG_ACTIONS or stage not in STAGES:
        return None
    entry: dict[str, Any] = {
        "id": entry_id,
        "at": _text(value.get("at"), 40) or "",
        "stage": stage,
        "action": action,
    }
    for field in ("key", "name"):
        if text := _text(value.get(field), 400):
            entry[field] = text
    for field, limit in (("keys", BULK_LIMIT), ("targets", 200)):
        items = value.get(field)
        if isinstance(items, list):
            entry[field] = [t for item in items[:limit] if (t := _text(item, 400))]
    count = value.get("n")
    if isinstance(count, int) and 0 <= count <= BULK_LIMIT * 10:
        entry["n"] = count
    return entry


def _weight(entry: dict[str, Any]) -> int:
    """What an entry weighs in the store: the keys and the objects it names."""
    return len(entry.get("keys", [])) + len(entry.get("targets", []))


def _trim(log: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """The newest entries within the limits."""
    log = log[-LOG_LIMIT:]
    while len(log) > 1 and sum(_weight(e) for e in log) > LOG_KEYS_LIMIT:
        log = log[1:]
    return log


def _clean(value: Any) -> dict[str, Any]:
    if not isinstance(value, dict):
        value = {}
    done = value.get("done")
    stage = value.get("stage")
    count = value.get("start_count")
    log = value.get("log")
    return {
        "started_at": value["started_at"] if isinstance(value.get("started_at"), str) else None,
        "finished_at": value["finished_at"] if isinstance(value.get("finished_at"), str) else None,
        "stage": stage if stage in STAGES else 1,
        "start_count": count if isinstance(count, int) and count >= 0 else 0,
        "done": sorted(s for s in set(done) if s in STAGES) if isinstance(done, list) else [],
        "dismissed": value.get("dismissed") is True,
        "log": _trim([e for item in log if (e := clean_entry(item))])
        if isinstance(log, list)
        else [],
        # How many of the oldest entries were let go, so the history can say it is not complete.
        "log_dropped": dropped
        if isinstance(dropped := value.get("log_dropped"), int) and dropped > 0
        else 0,
    }


class FirstCleanupStore:
    """Remember how far the cleanup of the house has come."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, FIRST_CLEANUP_STORAGE_KEY)
        self._state: dict[str, Any] = _clean({})

    async def async_load(self) -> None:
        """Load the record; anything of an unknown shape is dropped."""
        self._state = _clean(await self._store.async_load())

    def _save(self) -> None:
        self._store.async_delay_save(lambda: dict(self._state), SAVE_DELAY)

    def state(self) -> dict[str, Any]:
        return {**self._state, "done": list(self._state["done"]), "log": list(self._state["log"])}

    @property
    def running(self) -> bool:
        return bool(self._state["started_at"]) and not self._state["finished_at"]

    @property
    def started(self) -> bool:
        """Whether the tour was begun, also when it is finished: its pages can still be gone back to."""
        return bool(self._state["started_at"])

    def offered(self, open_count: int) -> bool:
        """Whether the offer shows: not begun, not declined and many findings are open."""
        s = self._state
        return not (s["started_at"] or s["dismissed"]) and open_count >= OFFER_MIN

    def begin(self, open_count: int, now: datetime) -> None:
        """Start the cleanup, or start it over when it was finished."""
        if self.running:
            return
        self._state = {
            **_clean({}),
            "started_at": now.isoformat(),
            "start_count": open_count,
            "dismissed": self._state["dismissed"],
        }
        self._save()

    def reset(self) -> None:
        """Drop the tour back to where it was before it began; the decisions made in it stay."""
        self._state = {**_clean({}), "dismissed": self._state["dismissed"]}
        self._save()

    def log_add(self, value: Any) -> None:
        """Put a decision of the tour into the history, so it can be undone from any browser."""
        if (entry := clean_entry(value)) and all(
            e["id"] != entry["id"] for e in self._state["log"]
        ):
            grown = [*self._state["log"], entry]
            self._state["log"] = _trim(grown)
            self._state["log_dropped"] += len(grown) - len(self._state["log"])
            self._save()

    def log_remove(self, entry_id: str) -> None:
        """Take an entry out of the history (it was undone)."""
        self._state["log"] = [e for e in self._state["log"] if e["id"] != entry_id]
        self._save()

    def log_unskip(self, stage: int) -> None:
        """Show the skipped cards of a stage again: its skips leave the history."""
        self._state["log"] = [
            e for e in self._state["log"] if not (e["stage"] == stage and e["action"] == "skip")
        ]
        self._save()

    def dismiss(self) -> None:
        """ "Not now": the offer goes, the button stays."""
        self._state["dismissed"] = True
        self._save()

    def set_stage(self, stage: int, done: bool | None, now: datetime) -> None:
        """Go to a stage, and mark it done or open again."""
        if stage not in STAGES or not self.started:
            return
        self._state["stage"] = stage
        if done is not None:
            marked = set(self._state["done"])
            if done:
                marked.add(stage)
            else:
                marked.discard(stage)
            self._state["done"] = sorted(marked)
        if len(self._state["done"]) == len(STAGES):
            self._state["finished_at"] = self._state["finished_at"] or now.isoformat()
        else:
            self._state["finished_at"] = None
        self._save()
