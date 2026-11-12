"""Decisions about findings: hidden, meant to be so ("keep"), or put off until later ("snooze").

Stored by Housekeeper only; Home Assistant objects stay untouched. Each entry says what was decided
(``kind``), why (``reason``), until when (``until``, optional) and by whom. An entry whose time has
passed no longer hides the finding; it stays so the finding can be shown as due again.
A decision outlives its finding: when the object works again, the entry rests and holds again the
next time. ``seen`` is when a full scan last found the finding, so a resting entry can say how long
its finding has been away.
A "later" remembers how bad its finding was (``impact_at``, ``followers_at``); when the scan finds it
worse, the decision is lifted (``worse``) and the finding comes back as due.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import IGNORED_STORAGE_KEY, STORAGE_VERSION
from .impact import RANK

SAVE_DELAY = 10
KEEP_REVIEW_DAYS = 90  # "meant to be so" without a time is looked at again after this long
KINDS = ("ignore", "keep", "snooze")
REASON_LIMIT = 200  # characters
SEEN_STEP = timedelta(hours=1)  # "last seen" moves on at most once an hour, so a scan rarely writes
VIAS = ("mcp",)  # how a decision was made when it was not the panel
ITEM_LIMIT = 5000


def _clean(value: Any) -> dict[str, Any] | None:
    """One stored entry in its known shape; an older entry was just the time it was hidden."""
    if isinstance(value, str):
        return {"kind": "ignore", "at": value, "reason": "", "until": None, "by": None}
    if not isinstance(value, dict) or value.get("kind") not in KINDS:
        return None
    until = value.get("until")
    by = value.get("by")
    seen = value.get("seen")
    impact = value.get("impact_at")
    followers = value.get("followers_at")
    worse = value.get("worse")
    return {
        "kind": value["kind"],
        "at": value["at"] if isinstance(value.get("at"), str) else "",
        "reason": str(value.get("reason") or "")[:REASON_LIMIT],
        "until": until if isinstance(until, str) else None,
        "by": by if isinstance(by, str) else None,
        "via": value["via"] if value.get("via") in VIAS else None,
        "seen": seen if isinstance(seen, str) else None,
        "impact_at": impact if impact in RANK else None,
        "followers_at": followers if isinstance(followers, int) and followers >= 0 else None,
        "worse": worse if isinstance(worse, str) else None,
        # The object was critical when this was decided: a finding that is away right now cannot say so again.
        "critical": value.get("critical") is True,
    }


def due(entry: dict[str, Any], now: datetime) -> bool:
    """Whether the time of an entry has passed."""
    if not entry["until"]:
        return False
    try:
        return datetime.fromisoformat(entry["until"]) <= now
    except ValueError:
        return True


class IgnoreStore:
    """Remember which findings are hidden, kept or put off, and why."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, IGNORED_STORAGE_KEY)
        self._items: dict[str, dict[str, Any]] = {}
        self._migrated = False
        self._notice: dict[str, Any] | None = None

    async def async_load(self) -> None:
        """Load the decisions; anything of an unknown shape is dropped."""
        data = await self._store.async_load()
        if isinstance(data, dict) and isinstance(data.get("items"), dict):
            cleaned = ((key, _clean(value)) for key, value in data["items"].items())
            self._items = {
                key: entry for key, entry in cleaned if isinstance(key, str) and entry is not None
            }
        if isinstance(data, dict):
            self._migrated = bool(data.get("migrated"))
            notice = data.get("notice")
            if isinstance(notice, dict) and isinstance(notice.get("count"), int):
                self._notice = {"count": notice["count"], "days": KEEP_REVIEW_DAYS}
        if not self._migrated:
            self._migrate(datetime.now(UTC))

    def _migrate(self, now: datetime) -> None:
        """Once: remember that the file was looked at.

        An older version let "meant to be so" go without a time, and so does this one: such an entry is
        left as it is (a first 2.0 beta added a review date to each; those dates stay, and so does the note
        about them until it is read).
        """
        self._migrated = True

    @property
    def notice(self) -> dict[str, Any] | None:
        """The one-time note about the review dates just added, until the user has seen it."""
        return self._notice

    def dismiss_notice(self) -> None:
        """The user has read the note."""
        if self._notice is not None:
            self._notice = None
            self._save()

    def is_ignored(self, key: str, now: datetime | None = None) -> bool:
        """Whether a decision hides this finding right now."""
        entry = self._items.get(key)
        return entry is not None and not due(entry, now or datetime.now(UTC))

    def info(self, key: str, now: datetime | None = None) -> dict[str, Any] | None:
        """The decision for a finding that it is hidden by, or None."""
        return self._items[key] if self.is_ignored(key, now) else None

    def is_due(self, key: str, now: datetime | None = None) -> bool:
        """Whether a decision ran out, so the finding is back and wants a new look."""
        entry = self._items.get(key)
        return entry is not None and due(entry, now or datetime.now(UTC))

    def decide(
        self,
        key: str,
        kind: str,
        now: datetime,
        *,
        reason: str = "",
        until: datetime | None = None,
        by: str | None = None,
        via: str | None = None,
        impact: str | None = None,
        followers: int | None = None,
        critical: bool = False,
    ) -> bool:
        """Record a decision; False when the store is full.

        ``impact`` and ``followers`` say how bad the finding is right now, so a "later" can tell when it gets worse.
        """
        if kind not in KINDS or (key not in self._items and len(self._items) >= ITEM_LIMIT):
            return False
        self._items[key] = {
            "kind": kind,
            "at": now.isoformat(),
            "reason": reason.strip()[:REASON_LIMIT],
            "until": until.isoformat() if until else None,
            "by": by,
            "via": via,
            "seen": now.isoformat(),
            "impact_at": impact if kind == "snooze" and impact in RANK else None,
            "followers_at": followers if kind == "snooze" else None,
            "worse": None,
            "critical": critical,
        }
        self._save()
        return True

    def entries(self) -> dict[str, dict[str, Any]]:
        """Copies of all stored decisions, for the activity record."""
        return {key: dict(entry) for key, entry in self._items.items()}

    def entry(self, key: str) -> dict[str, Any] | None:
        """A copy of the stored decision, whether it holds or has run out; None if there is none."""
        return dict(self._items[key]) if key in self._items else None

    def restore(self, key: str, entry: dict[str, Any] | None) -> None:
        """Put a decision back exactly as it was, or take it away when there was none."""
        if entry is None:
            self._items.pop(key, None)
        elif (cleaned := _clean(entry)) is not None:
            self._items[key] = cleaned
        self._save()

    def set_ignored(self, key: str, ignored: bool, now: datetime) -> None:
        """Hide a finding for good or show it again."""
        if ignored:
            self.decide(key, "ignore", now)
        elif self._items.pop(key, None) is not None:
            self._save()

    def note_seen(self, keys: set[str], now: datetime) -> None:
        """Note that a full scan found these findings: their decisions hold for something that is there."""
        changed = False
        for key in keys & self._items.keys():
            entry = self._items[key]
            try:
                fresh = entry["seen"] and now - datetime.fromisoformat(entry["seen"]) < SEEN_STEP
            except ValueError:
                fresh = False
            if not fresh:
                entry["seen"] = now.isoformat()
                changed = True
        if changed:
            self._save()

    def review(self, current: dict[str, tuple[str, int]], now: datetime) -> list[str]:
        """Lift every "later" whose finding got worse; the keys lifted.

        ``current`` is the impact and the number of follow-ups now. A "later" from before this was kept
        has no earlier value: it takes the present one and is judged from the next scan on.
        """
        lifted: list[str] = []
        changed = False
        for key, (impact, followers) in current.items():
            entry = self._items.get(key)
            if entry is None or entry["kind"] != "snooze" or due(entry, now):
                continue
            if entry["impact_at"] is None or entry["followers_at"] is None:
                entry["impact_at"], entry["followers_at"] = impact, followers
                changed = True
            elif RANK[impact] > RANK[entry["impact_at"]] or followers > entry["followers_at"]:
                entry["until"] = entry["worse"] = now.isoformat()
                lifted.append(key)
                changed = True
        if changed:
            self._save()
        return lifted

    def resting(self, present: set[str]) -> list[dict[str, Any]]:
        """The decisions whose finding is not there right now, with their key; policy violations stay out."""
        return [
            {"key": key, **entry}
            for key, entry in self._items.items()
            if key not in present and not key.startswith(("policy.", "conflict."))
        ]

    def _save(self) -> None:
        self._store.async_delay_save(self._data, SAVE_DELAY)

    def _data(self) -> dict[str, Any]:
        return {"items": self._items, "migrated": self._migrated, "notice": self._notice}
