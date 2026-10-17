"""A message when a new broken reference appears. Off until you switch it on.

Only findings that really break something count (a reference to an entity, device or service that
does not exist). Each finding is announced once; switching the message on announces nothing that
exists already. The message is a persistent notification in Home Assistant, nothing leaves it.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DOMAIN, NOTIFY_STORAGE_KEY, PANEL_URL, STORAGE_VERSION
from .texts import pick

SAVE_DELAY = 10
SEEN_LIMIT = 500
LISTED = 5
NOTIFICATION_ID = f"{DOMAIN}_broken"
TEXTS = {
    "de": (
        "HA Housekeeper: neue defekte Referenzen",
        "{count} neue defekte Referenz(en): {names}. [Befunde öffnen](/{url}?view=findingsNav&filter=broken_reference)",
    ),
    "en": (
        "HA Housekeeper: new broken references",
        "{count} new broken reference(s): {names}. [Open findings](/{url}?view=findingsNav&filter=broken_reference)",
    ),
}


def broken(findings: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        f for f in findings if f["classification"] == "broken_reference" and not f.get("ignored")
    ]


class NotifyStore:
    """The switch and the findings that were announced already."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, NOTIFY_STORAGE_KEY)
        self.enabled = False
        self.seen: list[str] = []

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if not isinstance(data, dict):
            return
        self.enabled = data.get("enabled") is True
        seen = data.get("seen")
        if isinstance(seen, list):
            self.seen = [key for key in seen if isinstance(key, str)][-SEEN_LIMIT:]

    def set_enabled(self, on: bool, findings: list[dict[str, Any]]) -> None:
        """Switch the message; switching it on marks what exists as announced."""
        if on == self.enabled:
            return
        self.enabled = on
        if on:
            self.seen = [f["key"] for f in broken(findings)][-SEEN_LIMIT:]
        self._save()

    def new(self, findings: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """The broken findings not announced yet; they count as announced afterwards."""
        if not self.enabled:
            return []
        current = broken(findings)
        fresh = [f for f in current if f["key"] not in self.seen]
        # Keep what is still broken, so a finding that stays does not come back as new.
        keep = [key for key in self.seen if any(f["key"] == key for f in current)]
        merged = [*keep, *(f["key"] for f in fresh)][-SEEN_LIMIT:]
        if merged != self.seen:
            self.seen = merged
            self._save()
        return fresh

    def _save(self) -> None:
        self._store.async_delay_save(
            lambda: {"enabled": self.enabled, "seen": self.seen}, SAVE_DELAY
        )


def async_announce(hass: HomeAssistant, fresh: list[dict[str, Any]]) -> None:
    """Create the persistent notification for the new findings."""
    if not fresh:
        return
    from homeassistant.components import persistent_notification

    title, template = pick(hass, TEXTS)
    names = sorted({str(f.get("affected_object") or f["object_id"]) for f in fresh})
    text = ", ".join(names[:LISTED]) + (", …" if len(names) > LISTED else "")
    persistent_notification.async_create(
        hass,
        template.format(count=len(fresh), names=text, url=PANEL_URL),
        title=title,
        notification_id=NOTIFICATION_ID,
    )
