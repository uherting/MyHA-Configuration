"""Whether the scans run: the last attempt, the last success and the last failure.

The scanner keeps the previous snapshot when a scan fails, so the counts and "last scan" look normal
while nothing is checked any more. This keeps the facts that tell the two apart and survives a
restart. Only times, the phase and the kind of error are kept, plus the error text for the panel.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import SCAN_HEALTH_STORAGE_KEY, STORAGE_VERSION

SAVE_DELAY = 5
STATES = ("ok", "stale", "failed", "preliminary")
STALE_FACTOR = 3  # a scan is overdue after this many intervals ...
STALE_MIN_HOURS = 6  # ... but never earlier than this
REPAIR_AFTER_FAILURES = 3  # a repair hint after this many failures in a row, or when stale
ERROR_MAX = 300


def stale_after(interval_hours: int) -> timedelta | None:
    """How old the last success may be; ``None`` when scans only run on request."""
    if interval_hours <= 0:
        return None
    return timedelta(hours=max(STALE_MIN_HOURS, STALE_FACTOR * interval_hours))


def _time(value: Any) -> datetime | None:
    try:
        return datetime.fromisoformat(value) if isinstance(value, str) else None
    except ValueError:
        return None


class ScanHealth:
    """The facts about the scans, persisted."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, SCAN_HEALTH_STORAGE_KEY)
        self.last_attempt_at: str | None = None
        self.last_success_at: str | None = None
        self.last_error_at: str | None = None
        self.error_class: str | None = None
        self.error: str | None = None
        self.failed_phase: str | None = None
        self.consecutive_failures = 0
        self.last_duration: float | None = None
        self.preliminary = False

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if not isinstance(data, dict):
            return
        for key in ("last_attempt_at", "last_success_at", "last_error_at"):
            value = data.get(key)
            setattr(self, key, value if _time(value) else None)
        for key in ("error_class", "error", "failed_phase"):
            value = data.get(key)
            setattr(self, key, str(value)[:ERROR_MAX] if value else None)
        failures = data.get("consecutive_failures")
        self.consecutive_failures = failures if isinstance(failures, int) and failures > 0 else 0
        duration = data.get("last_duration")
        self.last_duration = float(duration) if isinstance(duration, (int, float)) else None

    def _save(self) -> None:
        self._store.async_delay_save(self._as_dict, SAVE_DELAY)

    def _as_dict(self) -> dict[str, Any]:
        return {
            "last_attempt_at": self.last_attempt_at,
            "last_success_at": self.last_success_at,
            "last_error_at": self.last_error_at,
            "error_class": self.error_class,
            "error": self.error,
            "failed_phase": self.failed_phase,
            "consecutive_failures": self.consecutive_failures,
            "last_duration": self.last_duration,
        }

    def started(self, now: datetime) -> None:
        self.last_attempt_at = now.isoformat()

    def succeeded(self, now: datetime, duration: float, preliminary: bool) -> None:
        """A finished scan. One made while Home Assistant starts is no proof that scanning works."""
        self.preliminary = preliminary
        self.last_duration = round(duration, 1)
        if not preliminary:
            self.last_success_at = now.isoformat()
            self.consecutive_failures = 0
            self.error_class = self.error = self.failed_phase = None
        self._save()

    def failed(self, now: datetime, phase: str, err: BaseException) -> None:
        self.last_error_at = now.isoformat()
        self.consecutive_failures += 1
        self.failed_phase = phase
        self.error_class = type(err).__name__
        self.error = f"{type(err).__name__}: {err}"[:ERROR_MAX]
        self._save()

    def state(self, now: datetime, interval_hours: int) -> str | None:
        """``failed`` after a failed latest attempt, ``stale`` when no scan succeeded for too long."""
        failed_at, success_at = _time(self.last_error_at), _time(self.last_success_at)
        if failed_at and (success_at is None or failed_at >= success_at):
            return "failed"
        limit = stale_after(interval_hours)
        if limit and success_at and now - success_at > limit:
            return "stale"
        if self.preliminary:
            return "preliminary"
        return "ok" if success_at else None

    def report(self, now: datetime, interval_hours: int) -> dict[str, Any]:
        """What the panel and the sensor show."""
        state = self.state(now, interval_hours)
        return {
            "state": state,
            "last_attempt_at": self.last_attempt_at,
            "last_success_at": self.last_success_at,
            "last_error_at": self.last_error_at,
            "failed_phase": self.failed_phase,
            "error_class": self.error_class,
            "error": self.error,
            "consecutive_failures": self.consecutive_failures,
            "last_duration": self.last_duration,
            "interval_hours": interval_hours,
            "needs_repair": state == "stale"
            or (state == "failed" and self.consecutive_failures >= REPAIR_AFTER_FAILURES),
        }
