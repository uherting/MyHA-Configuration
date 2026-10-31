"""What each cheap view of the menu has to look at, counted at the scan for the numbers in the bar."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant

from .access import access_report
from .exposure import exposure
from .run_health import report as runs_report
from .sensitive_fields import sensitive_fields

_LOGGER = logging.getLogger(__name__)


def _credentials(data: dict[str, Any]) -> int:
    """Entries with a login to renew, an empty field or values kept while switched off; admins
    without a second factor; tokens that are old or whose account is gone."""
    entries = 0
    for row in data["entries"]:
        values = [f.get("set") for f in row["fields"]]
        kept = row["disabled"] and any(values)
        if row["reauth"] or (not row["disabled"] and not all(values)) or kept:
            entries += 1
    users = data.get("accounts") or []
    no_mfa = sum(1 for u in users if u.get("active") and u.get("admin") and not u.get("mfa"))
    tokens = sum(1 for t in data.get("tokens") or [] if t.get("old") or not t.get("account_active"))
    return entries + no_mfa + tokens


async def view_counts(
    scanner: Any, hass: HomeAssistant, snapshot: dict[str, Any]
) -> dict[str, int]:
    """Counts by view id; a view that cannot be read is left out, so the bar shows no number."""
    counts: dict[str, int] = {}

    async def one(name: str, read: Any) -> None:
        try:
            counts[name] = await read()
        except Exception as err:  # noqa: BLE001 - one view never fails the scan
            _LOGGER.debug("Count of %s skipped: %s", name, type(err).__name__)

    async def exposure_count() -> int:
        return len(exposure(hass, snapshot)["findings"])

    async def dataflow_count() -> int:
        data = await access_report(hass)
        return int(data["high"]) + sum(1 for a in data["apps"] if a.get("risk") == "high")

    async def credentials_count() -> int:
        return _credentials(await sensitive_fields(hass))

    async def runs_count() -> int:
        data = await runs_report(scanner, snapshot)
        return sum(1 for row in data.get("items", []) if row["findings"])

    await one("exposure", exposure_count)
    await one("dataflow", dataflow_count)
    await one("secrets", credentials_count)
    await one("runs", runs_count)
    return counts
