"""The activity: what was done in Housekeeper, when, by whom and why, for all kinds of action.

Decisions on findings, marks, plans, logbook entries and what happened by itself all write one
entry here through ``record``; the records of the single features stay as they are (they hold the
state), this one only appends. The newest entries within a count and an age are kept. Entries that
were taken over from the older records (``backfilled``) have no undo.
"""

from __future__ import annotations

import secrets
from datetime import datetime, timedelta
from typing import Any, Final

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import ACTIVITY_STORAGE_KEY, STORAGE_VERSION

SAVE_DELAY = 10
KINDS: Final = ("decision", "mark", "plan", "note", "auto")
ITEM_LIMIT: Final = 2000
KEEP_DAYS: Final = 365
TEXT_LIMIT: Final = 300
PAGE_LIMIT: Final = 100
SOURCES: Final = ("cleanup", "list", "plan", "mcp", "system")
UNDO_KINDS: Final = ("ignore", "ignore_many", "mark", "plan")  # what an undo reference can point at
BULK_ITEMS: Final = 1000  # decisions one entry of a bulk action can take back


def _text(value: Any, limit: int = TEXT_LIMIT) -> str | None:
    return value.strip()[:limit] or None if isinstance(value, str) else None


def _bulk_items(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    return [
        {
            "key": key,
            "previous": item["previous"] if isinstance(item.get("previous"), dict) else None,
            "after": _text(item.get("after"), 40),
        }
        for item in value[:BULK_ITEMS]
        if isinstance(item, dict) and (key := _text(item.get("key")))
    ]


def _clean(value: Any) -> dict[str, Any] | None:
    """One entry in its known shape, or None."""
    if not isinstance(value, dict):
        return None
    entry_id, at, action = (
        _text(value.get("id"), 40),
        _text(value.get("at"), 40),
        _text(value.get("action"), 40),
    )
    if not entry_id or not at or not action or value.get("kind") not in KINDS:
        return None
    undo = value.get("undo")
    count = value.get("count")
    return {
        "id": entry_id,
        "at": at,
        "kind": value["kind"],
        "action": action,
        "key": _text(value.get("key")),
        "name": _text(value.get("name")),
        "reason": _text(value.get("reason")),
        "until": _text(value.get("until"), 40),
        "by": _text(value.get("by"), 80),
        "source": value["source"] if value.get("source") in SOURCES else None,
        "count": count
        if isinstance(count, int) and not isinstance(count, bool) and count > 0
        else None,
        "undo": {
            "type": undo["type"],
            "key": _text(undo.get("key")) or "",
            "previous": undo["previous"] if isinstance(undo.get("previous"), dict) else None,
            # The time of the entry the action left behind: an undo applies only while it is still that one.
            "after": _text(undo.get("after"), 40),
            # A bulk action is one entry; each decision it made keeps what it was before and what it left.
            "items": _bulk_items(undo.get("items")),
        }
        if isinstance(undo, dict) and undo.get("type") in UNDO_KINDS
        else None,
        "backfilled": value.get("backfilled") is True,
    }


class ActivityStore:
    """The append-only record of what was done."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, ACTIVITY_STORAGE_KEY)
        self._items: list[dict[str, Any]] = []  # newest first
        self._backfilled = False

    async def async_load(self) -> None:
        """Load the entries; anything of an unknown shape is dropped."""
        data = await self._store.async_load()
        if not isinstance(data, dict):
            return
        items = data.get("items")
        cleaned = [e for item in items if (e := _clean(item))] if isinstance(items, list) else []
        self._items = sorted(cleaned, key=lambda e: e["at"], reverse=True)[:ITEM_LIMIT]
        self._backfilled = data.get("backfilled") is True

    def _save(self) -> None:
        self._store.async_delay_save(
            lambda: {"items": self._items, "backfilled": self._backfilled}, SAVE_DELAY
        )

    def record(
        self,
        kind: str,
        action: str,
        now: datetime,
        *,
        key: str | None = None,
        name: str | None = None,
        reason: str | None = None,
        until: str | None = None,
        by: str | None = None,
        source: str | None = None,
        count: int | None = None,
        undo: dict[str, Any] | None = None,
    ) -> None:
        """Append one entry (``count``: how many things a bulk action touched); an unknown kind is dropped."""
        entry = _clean(
            {
                "id": secrets.token_hex(6),
                "at": now.isoformat(),
                "kind": kind,
                "action": action,
                "key": key,
                "name": name,
                "reason": reason,
                "until": until,
                "by": by,
                "source": source,
                "count": count,
                "undo": undo,
            }
        )
        if entry is None:
            return
        self._items.insert(0, entry)
        self._trim(now)
        self._save()

    def get(self, entry_id: str) -> dict[str, Any] | None:
        """A copy of one entry, or None."""
        entry = next((e for e in self._items if e["id"] == entry_id), None)
        return dict(entry) if entry else None

    def drop_undo(self, entry_id: str) -> None:
        """The entry was undone: it offers no undo any more."""
        for entry in self._items:
            if entry["id"] == entry_id and entry["undo"]:
                entry["undo"] = None
                self._save()

    def _trim(self, now: datetime) -> None:
        cutoff = (now - timedelta(days=KEEP_DAYS)).isoformat()
        self._items = [e for e in self._items[:ITEM_LIMIT] if e["at"] >= cutoff]

    def backfill(
        self,
        decisions: dict[str, dict[str, Any]],
        marks: dict[str, dict[str, Any]],
        notes: list[dict[str, Any]],
        plans: list[dict[str, Any]],
    ) -> None:
        """Once: take over what the older records know, without undo."""
        if self._backfilled:
            return
        rows: list[dict[str, Any]] = []
        for key, entry in decisions.items():
            rows.append(
                {
                    "kind": "decision",
                    "action": entry.get("kind"),
                    "key": key,
                    "at": entry.get("at"),
                    "reason": entry.get("reason"),
                    "until": entry.get("until"),
                    "by": entry.get("by"),
                    "source": "mcp" if entry.get("via") == "mcp" else None,
                }
            )
        for key, entry in marks.items():
            rows.append(
                {
                    "kind": "mark",
                    "action": entry.get("kind"),
                    "key": key,
                    "at": entry.get("at"),
                    "name": entry.get("target"),
                    "reason": entry.get("reason"),
                    "until": entry.get("until"),
                    "by": entry.get("by"),
                    "source": "mcp" if entry.get("via") == "mcp" else None,
                }
            )
        for note in notes:
            rows.append(
                {
                    "kind": "note",
                    "action": "note",
                    "key": note.get("target"),
                    "at": note.get("at"),
                    "name": note.get("title"),
                    "reason": note.get("note"),
                }
            )
        for plan in plans:
            if plan.get("executed"):
                rows.append(
                    {
                        "kind": "plan",
                        "action": plan.get("status") or "executed",
                        "key": plan.get("plan_id"),
                        "at": (plan.get("run") or {}).get("finished_at") or plan.get("created_at"),
                        "source": "plan",
                    }
                )
        known = {e["id"] for e in self._items}
        for row in rows:
            fresh = _clean({**row, "id": f"b{secrets.token_hex(5)}", "backfilled": True})
            if fresh and fresh["id"] not in known:
                self._items.append(fresh)
        self._items.sort(key=lambda e: e["at"], reverse=True)
        del self._items[ITEM_LIMIT:]
        self._backfilled = True
        self._save()

    def _after(self, cursor: str | None) -> list[dict[str, Any]]:
        """The entries after the cursor (``at|id`` of the last one of the page before).

        Entries of one moment (a bulk action) share their time, so the time alone would skip them; the
        position of the entry says where the next page begins. An entry that is gone falls back to the time.
        """
        if not cursor:
            return self._items
        at, _, entry_id = cursor.partition("|")
        position = next((i for i, e in enumerate(self._items) if e["id"] == entry_id), None)
        if position is not None:
            return self._items[position + 1 :]
        return [e for e in self._items if e["at"] < at]

    def view(
        self,
        kinds: tuple[str, ...] | None = None,
        query: str = "",
        before: str | None = None,
        limit: int = 50,
    ) -> dict[str, Any]:
        """A page of entries, newest first; ``next`` is the cursor for the page after it (or None)."""
        needle = query.strip().casefold()
        rows = [
            e
            for e in self._after(before)
            if (not kinds or e["kind"] in kinds)
            and (
                not needle
                or needle
                in " ".join(
                    str(e.get(f) or "") for f in ("key", "name", "reason", "by", "action")
                ).casefold()
            )
        ]
        limit = max(1, min(limit, PAGE_LIMIT))
        page = rows[:limit]
        return {
            "items": [
                {
                    **e,
                    "undo": e["undo"]
                    and {
                        k: v
                        for k, v in e["undo"].items()
                        if k not in ("previous", "after", "items")
                    },
                }
                for e in page
            ],
            "next": f"{page[-1]['at']}|{page[-1]['id']}" if len(rows) > limit else None,
            "total": len(rows),
        }
