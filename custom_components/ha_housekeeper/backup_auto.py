"""Optional automatic tidying of Housekeeper's own safety backups. Off unless the person switches it on.

It applies the rule the cleanup page preselects (keep the last N and everything younger than D days),
with three more safeguards: it never touches a backup that is protected (its plan is still watched or
can still be undone), never one that is the only way back after a recorder change, and nothing happens
while a plan runs or the protection mode forbids irreversible actions.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import TYPE_CHECKING, Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .backup_cleanup import KEEP_DAYS, KEEP_LAST, MAX_DAYS, MAX_LAST, delete_backup, list_backups
from .const import BACKUP_AUTO_STORAGE_KEY, STORAGE_VERSION
from .protection import allows
from .writelock import write_holder

if TYPE_CHECKING:
    from .inventory import InventoryScanner

_LOGGER = logging.getLogger(__name__)
SAVE_DELAY = 10


class BackupAutoStore:
    """The switch, the two numbers of the rule and the last run."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, BACKUP_AUTO_STORAGE_KEY)
        self.enabled = False
        self.keep_last = KEEP_LAST
        self.keep_days = KEEP_DAYS
        self.last: dict[str, Any] | None = None

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if not isinstance(data, dict):
            return
        self.enabled = data.get("enabled") is True
        keep_last, keep_days = data.get("keep_last"), data.get("keep_days")
        if isinstance(keep_last, int) and 0 <= keep_last <= MAX_LAST:
            self.keep_last = keep_last
        if isinstance(keep_days, int) and 0 <= keep_days <= MAX_DAYS:
            self.keep_days = keep_days
        last = data.get("last")
        self.last = last if isinstance(last, dict) else None

    def set(self, enabled: bool, keep_last: int, keep_days: int) -> None:
        self.enabled = enabled
        self.keep_last = max(0, min(keep_last, MAX_LAST))
        self.keep_days = max(0, min(keep_days, MAX_DAYS))
        self._save()

    def public(self) -> dict[str, Any]:
        return {
            "enabled": self.enabled,
            "keep_last": self.keep_last,
            "keep_days": self.keep_days,
            "last": self.last,
        }

    def _save(self) -> None:
        self._store.async_delay_save(self.public, SAVE_DELAY)


async def async_auto_clean(scanner: InventoryScanner, now: datetime) -> dict[str, Any] | None:
    """Delete the backups the rule picks; None when it is off or must wait, else what was done."""
    store: BackupAutoStore = scanner.backup_auto
    hass = scanner.hass
    if not store.enabled or scanner.cleanup.running or write_holder(hass):
        return None
    if not allows(scanner.protection.mode, {"kind": "delete_backup"}):
        return None
    listing = await list_backups(hass, scanner.journal.plans, now, store.keep_last, store.keep_days)
    if not listing["available"]:
        return None
    deleted = freed = 0
    for row in listing["rows"]:
        if not row["suggested"] or row["only_return"]:
            continue
        if await delete_backup(hass, row["backup_id"]) is None:
            deleted += 1
            freed += row["size"] or 0
    if deleted:
        store.last = {"at": now.isoformat(), "count": deleted, "bytes": freed}
        store._save()  # noqa: SLF001 - same module family, the store has no other writer
        _LOGGER.info("Automatic tidy-up deleted %s Housekeeper backup(s), %s bytes", deleted, freed)
    return {"count": deleted, "bytes": freed}
