"""One-off import of past notifications from the recorder (call_service events)."""
from __future__ import annotations

import json
import logging
import time
from typing import Any

from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)


def _rows(hass: HomeAssistant, since: float) -> list[tuple[float, str | None, str | None, dict[str, Any]]]:
    """(ts, context_id, user_id, event data) of notify call_service events, in the recorder thread pool."""
    from sqlalchemy import select

    from homeassistant.components.recorder.db_schema import EventData, Events, EventTypes
    from homeassistant.helpers.recorder import session_scope
    from homeassistant.util.ulid import bytes_to_ulid_or_none

    out = []
    with session_scope(hass=hass, read_only=True) as session:
        query = (
            select(Events.time_fired_ts, Events.context_id_bin, Events.context_user_id_bin, EventData.shared_data)
            .join(EventData, Events.data_id == EventData.data_id)
            .join(EventTypes, Events.event_type_id == EventTypes.event_type_id)
            .where(EventTypes.event_type == "call_service")
            .where(Events.time_fired_ts >= since)
            .where(EventData.shared_data.like('%"domain":"notify"%'))
            .order_by(Events.time_fired_ts)
        )
        for ts, ctx, user, shared in session.execute(query):
            try:
                data = json.loads(shared)
            except (TypeError, ValueError):
                continue
            if data.get("domain") != "notify":
                continue
            user_hex = user.hex() if isinstance(user, bytes) else None
            out.append((ts, bytes_to_ulid_or_none(ctx), user_hex, data))
    return out


async def async_fetch_past(hass: HomeAssistant, days: int) -> list[tuple[float, str | None, str | None, dict[str, Any]]]:
    """Past notify calls, or [] if the recorder is not available."""
    if "recorder" not in hass.config.components:
        return []
    from homeassistant.helpers.recorder import get_instance

    instance = get_instance(hass)
    if not await instance.async_db_ready:
        return []
    try:
        return await instance.async_add_executor_job(_rows, hass, time.time() - days * 86400)
    except Exception:  # noqa: BLE001 - a failed import must not break the integration
        _LOGGER.exception("Could not import past notifications from the recorder")
        return []
