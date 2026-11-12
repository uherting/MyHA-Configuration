"""The five-minute look of the central log: backups, the system, the scans, flapping.

Every part has its own guard, so one that hangs or fails does not keep the others from being written down.
The targets of the backup manager are listed only now and then (a cloud target answers a request each time);
between two listings only the manager's state is read, which is enough to see a backup begin and end.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant

from .backup_health import backup_health, backup_running
from .issues import async_sync_flapping_issue
from .system_checks import scan_check, system_checks
from .system_usage import disk_usage, memory
from .ws_common import BACKUP_HEALTH_TIMEOUT

_LOGGER = logging.getLogger(__name__)

BACKUP_LISTING_MINUTES = 45


async def log_tick(hass: HomeAssistant, scanner: Any, memo: dict[str, Any], now: datetime) -> None:
    """One look; ``memo`` holds when the backup targets were listed last."""
    events = scanner.events
    try:
        listed = memo.get("backups_at")
        running = backup_running(hass)
        ended = running is False and events.backup_since is not None
        if listed is None or now - listed >= timedelta(minutes=BACKUP_LISTING_MINUTES) or ended:
            memo["backups_at"] = now  # also when it fails: a target that hangs is asked again later
            async with asyncio.timeout(BACKUP_HEALTH_TIMEOUT):
                await backup_health(hass, scanner.attest, scanner.journal.plans, events)
        else:
            events.observe_backup_run(running, now)
    except Exception:  # noqa: BLE001 - a check that cannot be read is not worth a message here
        _LOGGER.debug("The central log could not read the backup check", exc_info=True)
    try:
        disk, ram = await hass.async_add_executor_job(
            lambda: (disk_usage(hass.config.config_dir), memory())
        )
        events.observe_checks("system", system_checks(disk, ram, events.levels), now)
    except Exception:  # noqa: BLE001
        _LOGGER.debug("The central log could not read the system", exc_info=True)
    try:
        events.observe_checks("scan", scan_check(scanner.health_report()), now)
        async_sync_flapping_issue(hass, events.flapping(now))
    except Exception:  # noqa: BLE001
        _LOGGER.debug("The central log could not read the scans", exc_info=True)
