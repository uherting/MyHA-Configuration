"""Sensors that keep their last value but have reported nothing new for a long time.

Only reads Home Assistant. Housekeeper remembers per sensor when it last saw a report newer than
the start of Home Assistant; a restart resets every ``last_reported``, so a restart alone is no
activity. The time Home Assistant was down does not count against a sensor. By default only
numeric sensors with a ``state_class`` are watched (they report regularly); anything else, such as
door contacts, is watched only when a limit is set for it. A limit of 0 switches one sensor off.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STALE_STORAGE_KEY, STORAGE_VERSION

SAVE_DELAY = 10
ITEM_LIMIT = 5000
LIMIT_MAX_HOURS = 8760


def _parse(value: Any) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=UTC)


class StaleStore:
    """When each watched sensor last showed activity, and the limits set per sensor."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STALE_STORAGE_KEY)
        self.anchors: dict[str, str] = {}
        self.limits: dict[str, int] = {}
        self.heartbeat: str | None = None
        self._shifted = False

    async def async_load(self) -> None:
        """Load the store; anything of an unknown shape is dropped."""
        data = await self._store.async_load()
        if not isinstance(data, dict):
            return
        if isinstance(data.get("anchors"), dict):
            self.anchors = {
                key: value
                for key, value in data["anchors"].items()
                if isinstance(key, str) and _parse(value) is not None
            }
        if isinstance(data.get("limits"), dict):
            self.limits = {
                key: value
                for key, value in data["limits"].items()
                if isinstance(key, str)
                and isinstance(value, int)
                and not isinstance(value, bool)
                and 0 <= value <= LIMIT_MAX_HOURS
            }
        if _parse(data.get("heartbeat")) is not None:
            self.heartbeat = data["heartbeat"]

    def _save(self) -> None:
        self._store.async_delay_save(
            lambda: {"anchors": self.anchors, "limits": self.limits, "heartbeat": self.heartbeat},
            SAVE_DELAY,
        )

    def set_limit(self, entity_id: str, hours: int | None) -> bool:
        """Set the limit of one sensor (0 = off), or take it back with ``None``."""
        if hours is None:
            if self.limits.pop(entity_id, None) is None:
                return True
        else:
            if not 0 <= hours <= LIMIT_MAX_HOURS:
                return False
            if entity_id not in self.limits and len(self.limits) >= ITEM_LIMIT:
                return False
            self.limits[entity_id] = hours
        self._save()
        return True

    def limit_hours(self, item: dict[str, Any], default_hours: int) -> int | None:
        """The limit that applies to a sensor in hours; ``None`` when it is not watched."""
        override = self.limits.get(item["object_id"])
        if override is not None:
            return override or None
        if (
            default_hours > 0
            and item["object_id"].startswith("sensor.")
            and item.get("state_class")
        ):
            return default_hours
        return None

    def observe(
        self,
        entities: list[dict[str, Any]],
        now: datetime,
        started: datetime,
        cutoff: datetime,
        default_hours: int,
    ) -> None:
        """Note which watched sensors showed activity since the last scan.

        ``started`` is when this run of Housekeeper began, ``cutoff`` the end of its warm-up: a report
        before that may be nothing but the value restored at startup.
        """
        if not self._shifted:
            self._shifted = True
            beat = _parse(self.heartbeat)
            if beat is not None and started > beat:
                down = started - beat
                shifted: dict[str, str] = {}
                for key, value in self.anchors.items():
                    anchor = _parse(value)
                    if anchor is not None:
                        shifted[key] = min(now, anchor + down).isoformat()
                self.anchors = shifted
        watched = {
            item["object_id"]: item
            for item in entities
            if item["status"] == "active" and self.limit_hours(item, default_hours)
        }
        for entity_id in set(self.anchors) - set(watched):
            del self.anchors[entity_id]
        for entity_id, item in watched.items():
            seen = _parse(item.get("last_reported")) or _parse(item.get("last_updated"))
            anchor = _parse(self.anchors.get(entity_id))
            fresh = seen if seen is not None and seen > cutoff else None
            if anchor is None:
                self.anchors[entity_id] = (fresh or now).isoformat()
            elif fresh is not None and fresh > anchor:
                self.anchors[entity_id] = fresh.isoformat()
        self.heartbeat = now.isoformat()
        self._save()

    def annotate(self, entities: list[dict[str, Any]], now: datetime, default_hours: int) -> None:
        """Tell each entity item its limit, the override and the time since its last report."""
        for item in entities:
            override = self.limits.get(item["object_id"])
            hours = self.limit_hours(item, default_hours)
            item["stale_override"] = override
            item["stale_limit_hours"] = hours
            anchor = _parse(self.anchors.get(item["object_id"]))
            item["stale_last_activity"] = anchor.isoformat() if anchor and hours else None

    def findings(
        self, entities: list[dict[str, Any]], now: datetime, default_hours: int
    ) -> list[dict[str, Any]]:
        """One finding per watched sensor that has been silent for longer than its limit."""
        result = []
        for item in entities:
            hours = self.limit_hours(item, default_hours)
            anchor = _parse(self.anchors.get(item["object_id"]))
            if not hours or anchor is None or item["status"] != "active":
                continue
            limit = timedelta(hours=hours)
            if now - anchor < limit:
                continue
            result.append(
                {
                    "rule_id": "entity.stale",
                    "object_id": item["object_id"],
                    "classification": "stale",
                    "confidence": 0.7,
                    "first_detected_at": (anchor + limit).isoformat(),
                    "evidence": [
                        {
                            "kind": "stale",
                            "source": "state_machine",
                            "last_activity": anchor.isoformat(),
                            "idle_hours": int((now - anchor).total_seconds() // 3600),
                            "limit_hours": hours,
                        }
                    ],
                }
            )
        return result
