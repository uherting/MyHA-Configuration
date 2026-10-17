"""Deleting one automation from its YAML file: what the preview shows.

Only an automation that Housekeeper already reports as unused or switched off for long, that
lives in ``automations.yaml`` and whose file is small enough to be saved whole may be deleted.
Writing, reloading and undo are the cleanup plan's job.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.util.yaml import dump

from .const import MAX_FILE_BACKUP
from .references import SourceError, load_source


async def preview(hass: HomeAssistant, snapshot: dict[str, Any], entity_id: str) -> dict[str, Any]:
    """The source of one automation, or the reason it cannot be deleted."""
    try:
        loaded = await load_source(hass, snapshot, f"automation:{entity_id}")
    except SourceError as err:
        return {"error": str(err), "fingerprint": None}
    if loaded["file_bytes"] > MAX_FILE_BACKUP:
        return {"error": "file_too_large", "fingerprint": None}
    return {
        "error": None,
        "fingerprint": loaded["hash"],
        "source": loaded["source"],
        "text": dump(loaded["item"])[:4000],
    }
