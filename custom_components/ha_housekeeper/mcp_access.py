"""The switches for AI access and the log of every call, kept by Housekeeper only.

Two switches, both off until you switch them on: "AI access" allows the read-only functions,
"change the list" additionally allows the ones that write Housekeeper's own lists (never Home
Assistant). The log keeps who called what and how it went, as counts and shortened parameters,
never the content of an answer. Many reads in a row from one caller are one line with a counter.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import MCP_STORAGE_KEY, STORAGE_VERSION

SAVE_DELAY = 10
ENTRY_LIMIT = 2000
KEEP_DAYS = 90
MERGE_SECONDS = 60  # reads of one caller within this time are one line
PARAM_TEXT = 60
KINDS = ("read", "write", "denied")
WRITE_LIMIT_CHOICES = (50, 100, 200, 500)  # changes allowed in five minutes
READ_LIMIT_CHOICES = (60, 120, 300)  # reads allowed per minute
AUTO_OFF_CHOICES = (0, 1, 8, 24)  # hours until AI access switches itself off; 0 is never


def short_params(params: dict[str, Any]) -> dict[str, Any]:
    """The parameters of a call as the log keeps them: short texts, only the size of lists."""
    result: dict[str, Any] = {}
    for key, value in params.items():
        if isinstance(value, str):
            result[key] = value[:PARAM_TEXT]
        elif isinstance(value, bool | int | float) or value is None:
            result[key] = value
        elif isinstance(value, list | tuple | dict | set):
            result[key] = f"[{len(value)}]"
    return result


def _time(value: Any) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


class McpStore:
    """The two switches and the call log."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, MCP_STORAGE_KEY)
        self.enabled = False
        self.write = False
        self.hide_sensitive = True
        self.auto_off_hours = 0
        self.write_limit = 200
        self.read_limit = 120
        self.enabled_at: str | None = None
        self.entries: list[dict[str, Any]] = []

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if not isinstance(data, dict):
            return
        self.enabled = data.get("enabled") is True
        self.write = data.get("write") is True
        self.hide_sensitive = data.get("hide_sensitive") is not False
        if data.get("auto_off_hours") in AUTO_OFF_CHOICES:
            self.auto_off_hours = data["auto_off_hours"]
        if data.get("write_limit") in WRITE_LIMIT_CHOICES:
            self.write_limit = data["write_limit"]
        if data.get("read_limit") in READ_LIMIT_CHOICES:
            self.read_limit = data["read_limit"]
        if self.enabled and _time(data.get("enabled_at")) is not None:
            self.enabled_at = data["enabled_at"]
        entries = data.get("entries")
        if isinstance(entries, list):
            self.entries = [
                e for e in entries if isinstance(e, dict) and _time(e.get("at")) is not None
            ][-ENTRY_LIMIT:]

    @property
    def can_write(self) -> bool:
        """Writing needs both switches."""
        return self.enabled and self.write

    def set_switches(
        self,
        enabled: bool | None = None,
        write: bool | None = None,
        auto_off_hours: int | None = None,
        hide_sensitive: bool | None = None,
        write_limit: int | None = None,
        read_limit: int | None = None,
    ) -> None:
        if enabled is not None:
            if enabled and not self.enabled:
                self.enabled_at = datetime.now(UTC).isoformat()
            if not enabled:
                self.enabled_at = None
            self.enabled = enabled
        if write is not None:
            self.write = write
        if auto_off_hours in AUTO_OFF_CHOICES:
            self.auto_off_hours = auto_off_hours
        if hide_sensitive is not None:
            self.hide_sensitive = hide_sensitive
        if write_limit in WRITE_LIMIT_CHOICES:
            self.write_limit = write_limit
        if read_limit in READ_LIMIT_CHOICES:
            self.read_limit = read_limit
        self._save()

    @property
    def off_at(self) -> str | None:
        """When AI access switches itself off, or ``None`` when it is off or has no time limit."""
        started = _time(self.enabled_at)
        if not self.enabled or not self.auto_off_hours or started is None:
            return None
        return (started + timedelta(hours=self.auto_off_hours)).isoformat()

    def expire(self, now: datetime | None = None) -> bool:
        """Switch both switches off when the time limit has passed; True when it did."""
        due = _time(self.off_at)
        if due is None or (now or datetime.now(UTC)) < due:
            return False
        hours = self.auto_off_hours
        self.enabled = self.write = False
        self.enabled_at = None
        self.log(None, "auto_off", "write", {"hours": hours}, "ok", None)
        return True

    def changes_since(self, hours: int) -> int:
        """How many changes the log holds from the last hours."""
        return self.writes_since(hours * 60)

    def meta(self) -> dict[str, Any]:
        """The state the panel shows next to the page: switches and the time limit."""
        return {
            "enabled": self.enabled,
            "write": self.write,
            "hide_sensitive": self.hide_sensitive,
            "auto_off_hours": self.auto_off_hours,
            "write_limit": self.write_limit,
            "read_limit": self.read_limit,
            "off_at": self.off_at,
        }

    def log(
        self,
        user: str | None,
        function: str,
        kind: str,
        params: dict[str, Any],
        result: str,
        count: int | None = None,
        undo: dict[str, Any] | None = None,
        now: datetime | None = None,
    ) -> None:
        """Add a call. A read or a refusal that repeats within a minute only counts up."""
        now = now or datetime.now(UTC)
        last = self.entries[-1] if self.entries else None
        if (
            last is not None
            and kind in ("read", "denied")
            and (last["kind"], last["result"], last["fn"], last["user"])
            == (kind, result, function, user)
            and (seen := _time(last.get("last") or last["at"])) is not None
            and now - seen <= timedelta(seconds=MERGE_SECONDS)
        ):
            last.update(n=last["n"] + 1, last=now.isoformat(), count=count, params=params)
        else:
            self.entries.append(
                {
                    "at": now.isoformat(),
                    "last": now.isoformat(),
                    "n": 1,
                    "user": user,
                    "fn": function,
                    "kind": kind,
                    "params": params,
                    "result": result,
                    "count": count,
                    **({"undo": undo} if undo else {}),
                }
            )
        cutoff = now - timedelta(days=KEEP_DAYS)
        self.entries = [e for e in self.entries if (_time(e["at"]) or now) >= cutoff][-ENTRY_LIMIT:]
        self._save()

    def mark_undone(self, entry: dict[str, Any]) -> None:
        entry["undone"] = True
        self._save()

    def recent(self, kind: str | None = None, only_failed: bool = False) -> list[dict[str, Any]]:
        """The log, newest first, optionally one kind or only calls that did not go through."""
        rows = reversed(self.entries)
        return [
            e
            for e in rows
            if (kind is None or e["kind"] == kind) and (not only_failed or e["result"] != "ok")
        ]

    def reads_since(self, seconds: int, now: datetime | None = None) -> int:
        """How many reads the log holds from the last seconds (a merged line counts all its calls)."""
        start = (now or datetime.now(UTC)) - timedelta(seconds=seconds)
        return sum(
            e["n"]
            for e in self.entries
            if e["kind"] == "read"
            and (seen := _time(e.get("last") or e["at"])) is not None
            and seen >= start
        )

    def writes_since(self, minutes: int, now: datetime | None = None) -> int:
        """How many changes the log holds from the last minutes (an undo is a change too)."""
        start = (now or datetime.now(UTC)) - timedelta(minutes=minutes)
        return sum(
            1
            for e in self.entries
            if e["kind"] == "write" and (seen := _time(e["at"])) is not None and seen >= start
        )

    def calls_since(self, hours: int = 24, now: datetime | None = None) -> int:
        """How many calls the log holds from the last hours (a merged line counts all its calls)."""
        start = (now or datetime.now(UTC)) - timedelta(hours=hours)
        return sum(
            e["n"]
            for e in self.entries
            if (seen := _time(e.get("last") or e["at"])) and seen >= start
        )

    def _save(self) -> None:
        self._store.async_delay_save(
            lambda: {
                "enabled": self.enabled,
                "write": self.write,
                "hide_sensitive": self.hide_sensitive,
                "auto_off_hours": self.auto_off_hours,
                "write_limit": self.write_limit,
                "read_limit": self.read_limit,
                "enabled_at": self.enabled_at,
                "entries": self.entries,
            },
            SAVE_DELAY,
        )
