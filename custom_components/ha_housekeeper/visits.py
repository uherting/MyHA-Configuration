"""The last visit of each Home Assistant user to the findings page, and how things stood then.

"New since your last visit" and "got worse" compare the findings now with this record. It is the
state of the house for one person, kept on the server so it follows them from one device to another.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_VERSION, VISITS_STORAGE_KEY
from .impact import RANK

SAVE_DELAY = 10
USER_LIMIT = 50
STATE_LIMIT = 5000
MIN_RANK = RANK["low"]  # quieter findings are no news


def _clean(value: Any) -> dict[str, Any] | None:
    if not isinstance(value, dict) or not isinstance(value.get("at"), str):
        return None
    state = value.get("state")
    if not isinstance(state, dict):
        return None
    return {
        "at": value["at"],
        "state": {
            key: [item[0], item[1]]
            for key, item in state.items()
            if isinstance(key, str)
            and isinstance(item, list)
            and len(item) == 2
            and item[0] in RANK
            and isinstance(item[1], int)
        },
    }


class VisitStore:
    """Remember, for each user, when they last left the findings page and the findings then."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, VISITS_STORAGE_KEY)
        self._users: dict[str, dict[str, Any]] = {}

    async def async_load(self) -> None:
        """Load the visits; anything of an unknown shape is dropped."""
        data = await self._store.async_load()
        if isinstance(data, dict) and isinstance(data.get("users"), dict):
            cleaned = ((user, _clean(value)) for user, value in data["users"].items())
            self._users = {u: v for u, v in cleaned if isinstance(u, str) and v is not None}

    def get(self, user: str | None) -> dict[str, Any] | None:
        """The last visit of this user: ``at`` and ``state`` (finding key to [impact, follow-ups])."""
        return self._users.get(user or "")

    def leave(self, user: str | None, snapshot: dict[str, Any], now: datetime) -> dict[str, Any]:
        """Record that the user leaves the findings page now; what is recorded."""
        follows = {
            c["finding_key"]: c["total_followers"]
            for c in snapshot.get("causes", [])
            if c.get("finding_key")
        }
        state = {
            f["key"]: [f.get("impact") or "none", follows.get(f["key"], 0)]
            for f in snapshot.get("findings", [])
            if not f.get("ignored") and RANK.get(f.get("impact") or "none", 0) >= MIN_RANK
        }
        visit = {"at": now.isoformat(), "state": dict(list(state.items())[:STATE_LIMIT])}
        key = user or ""
        if key in self._users or len(self._users) < USER_LIMIT:
            self._users[key] = visit
            self._store.async_delay_save(lambda: {"users": self._users}, SAVE_DELAY)
        return visit
