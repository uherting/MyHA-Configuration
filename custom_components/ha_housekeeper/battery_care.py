"""What you tell Housekeeper about your batteries: the type per sensor and handled replacements.

Only Housekeeper's own list changes, never Home Assistant. A replacement the statistics seem to
show stays a suggestion until you enter it or say it was none; either way it is not shown again.
"""

from __future__ import annotations

import re
from datetime import date
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .battery_kind import ALL_KINDS
from .const import BATTERY_STORAGE_KEY, STORAGE_VERSION

SAVE_DELAY = 5
MAX_ITEMS = 500
TYPE_MAX = 30
ENTITY = re.compile(r"^[a-z0-9_]+\.[a-z0-9_]+$")
BUILTIN_TYPES = ("2× AAA", "2× AA", "CR2016", "CR2032", "CR2450", "9 V")


def noted_types(objects: list[dict[str, Any]], entity_ids: Any) -> dict[str, str]:
    """The battery type the integration Battery Notes keeps as a sensor of the same device.

    Only for the given battery sensors, and only when the sensor has a value; Housekeeper's own
    type is applied over it by the caller.
    """
    by_device: dict[str, str] = {}
    devices: dict[str, str] = {}
    wanted = set(entity_ids)
    for o in objects:
        if o.get("object_type") != "entity" or not o.get("device_id"):
            continue
        is_type = str(o.get("unique_id") or "").endswith("_battery_type")
        if o.get("platform") == "battery_notes" and is_type:
            value = str(o.get("state") or "").strip()
            if value and value.lower() not in ("unknown", "unavailable", "none"):
                by_device[o["device_id"]] = value[:TYPE_MAX]
        if o["object_id"] in wanted:
            devices[o["object_id"]] = o["device_id"]
    return {e: by_device[d] for e, d in devices.items() if d in by_device}


class BatteryError(Exception):
    """The input was not accepted; the message names the field."""


class BatteryStore:
    """Battery type per sensor and the day up to which replacements are settled."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, BATTERY_STORAGE_KEY)
        self.types: dict[str, str] = {}
        self.handled: dict[str, str] = {}
        self.kinds: dict[str, str] = {}
        self.custom_types: list[str] = []

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if not isinstance(data, dict):
            return
        for name, kept in (("types", self.types), ("handled", self.handled), ("kinds", self.kinds)):
            found = data.get(name)
            for key, value in found.items() if isinstance(found, dict) else ():
                if isinstance(key, str) and ENTITY.match(key) and isinstance(value, str):
                    if name == "kinds" and value not in ALL_KINDS:
                        continue
                    kept[key] = value[:TYPE_MAX] if name == "types" else value
        found = data.get("custom_types")
        for value in found if isinstance(found, list) else ():
            if isinstance(value, str) and value.strip():
                self._remember(value.strip()[:TYPE_MAX])
        for key in [k for k, v in self.handled.items() if not _day(v)]:
            del self.handled[key]
        for kept in (self.types, self.handled, self.kinds):
            for key in list(kept)[MAX_ITEMS:]:
                del kept[key]

    def _save(self) -> None:
        self._store.async_delay_save(
            lambda: {
                "types": self.types,
                "handled": self.handled,
                "kinds": self.kinds,
                "custom_types": self.custom_types,
            },
            SAVE_DELAY,
        )

    def _known(self, value: str) -> bool:
        """Whether the type is a built-in one or already in the own list (case does not matter)."""
        wanted = value.casefold()
        return any(t.casefold() == wanted for t in (*BUILTIN_TYPES, *self.custom_types))

    def _remember(self, value: str) -> None:
        if not self._known(value) and len(self.custom_types) < MAX_ITEMS:
            self.custom_types.append(value)
            self.custom_types.sort(key=str.casefold)

    def _users(self, value: str) -> list[str]:
        return [e for e, t in self.types.items() if t == value]

    def edit_custom(self, action: str, name: str, new_name: str = "") -> None:
        """Add, rename or delete an own type; a type in use or a built-in one is never removed."""
        name, new_name = name.strip(), new_name.strip()
        if not name or len(name) > TYPE_MAX or len(new_name) > TYPE_MAX:
            raise BatteryError("type")
        if action == "add":
            if self._known(name):
                raise BatteryError("exists")
            if len(self.custom_types) >= MAX_ITEMS:
                raise BatteryError("too_many")
            self._remember(name)
        elif name not in self.custom_types:
            raise BatteryError("unknown")
        elif action == "delete":
            if self._users(name):
                raise BatteryError("in_use")
            self.custom_types.remove(name)
        elif action == "rename":
            if not new_name or (new_name.casefold() != name.casefold() and self._known(new_name)):
                raise BatteryError("exists")
            for entity_id in self._users(name):
                self.types[entity_id] = new_name
            self.custom_types.remove(name)
            self._remember(new_name)
        else:
            raise BatteryError("action")
        self._save()

    def set_type(self, entity_id: str, value: str) -> None:
        """Set the type of one sensor; an empty text takes it back."""
        if not ENTITY.match(entity_id):
            raise BatteryError("entity_id")
        value = value.strip()
        if len(value) > TYPE_MAX:
            raise BatteryError("type")
        if not value:
            self.types.pop(entity_id, None)
        else:
            if entity_id not in self.types and len(self.types) >= MAX_ITEMS:
                raise BatteryError("too_many")
            self.types[entity_id] = value
            self._remember(value)
        self._save()

    def set_kinds(self, items: list[tuple[str, str]]) -> None:
        """Set the kind of several sensors; an empty kind takes it back. All or nothing."""
        for entity_id, kind in items:
            if not ENTITY.match(entity_id):
                raise BatteryError("entity_id")
            if kind and kind not in ALL_KINDS:
                raise BatteryError("kind")
        fresh = {e for e, k in items if k and e not in self.kinds}
        if len(self.kinds) + len(fresh) > MAX_ITEMS:
            raise BatteryError("too_many")
        for entity_id, kind in items:
            if kind:
                self.kinds[entity_id] = kind
            else:
                self.kinds.pop(entity_id, None)
        self._save()

    def handle(self, entity_id: str, day: str, today: date) -> None:
        """Settle replacements of one sensor up to ``day``."""
        settled = _day(day)
        if not ENTITY.match(entity_id) or settled is None or settled > today:
            raise BatteryError("day")
        if entity_id not in self.handled and len(self.handled) >= MAX_ITEMS:
            raise BatteryError("too_many")
        known = _day(self.handled.get(entity_id))
        if known is None or settled > known:
            self.handled[entity_id] = settled.isoformat()
        self._save()

    def open_replacements(self, found: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """The detected replacements that are not settled yet."""
        return [
            item
            for item in found
            if (_day(self.handled.get(item["entity_id"])) or date.min)
            < date.fromisoformat(item["day"])
        ]


def _day(value: Any) -> date | None:
    try:
        return date.fromisoformat(value) if isinstance(value, str) else None
    except ValueError:
        return None
