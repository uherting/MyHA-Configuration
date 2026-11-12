"""The last failed run of an automation or script, and a hint from its error text.

Read from the short heads of Home Assistant's own trace buffer, on request, in memory; nothing is kept and no
variable is read. The error text is shortened, and an address in it keeps its host only (a path or query may
carry a token). A hint only names an entity of the text that is down itself:
the text says that a call failed, not why, so the hint is never more than "look there".
"""

from __future__ import annotations

import re
from typing import Any

from homeassistant.core import HomeAssistant

from .runs import _parse

ERROR_MAX = 300
_ENTITY = re.compile(r"\b[a-z_]+\.[a-z0-9_]+\b")
_URL_TAIL = re.compile(r"(https?://[^\s/?#]+)[^\s]*")


def item_id_of(snapshot: dict[str, Any], finding: dict[str, Any]) -> str | None:
    """The id Home Assistant's trace buffer knows an automation or script by."""
    domain = finding["rule_id"].partition(".")[0]
    if domain == "script":
        return finding["object_id"].partition(".")[2] or None
    item: dict[str, Any] = next(
        (
            o
            for o in snapshot.get("objects", [])
            if o["object_type"] == domain and o["object_id"] == finding["object_id"]
        ),
        {},
    )
    return str(item["automation_id"]) if item.get("automation_id") else None


async def last_failure(hass: HomeAssistant, domain: str, item_id: str) -> dict[str, Any] | None:
    """The newest run that ended in an error: when, at which step, and what Home Assistant said."""
    from homeassistant.components.trace.util import async_list_traces  # noqa: PLC0415

    try:
        heads = await async_list_traces(hass, domain, f"{domain}.{item_id}")
    except Exception:  # noqa: BLE001 - the buffer is Home Assistant's; no trace is no answer
        return None
    failed = [
        head
        for head in heads
        if head.get("script_execution") == "error"
        and head.get("state") == "stopped"
        and not head.get("not_triggered")
    ]
    if not failed:
        return None
    head = max(failed, key=lambda h: str((h.get("timestamp") or {}).get("start") or ""))
    start = _parse((head.get("timestamp") or {}).get("start"))
    return {
        "run_id": head.get("run_id"),
        "at": start.isoformat() if start else None,
        "step": head.get("last_step"),
        "error": _URL_TAIL.sub(r"\1", str(head.get("error") or ""))[:ERROR_MAX] or None,
    }


def error_hint(error: str | None, down: dict[str, str]) -> dict[str, str] | None:
    """The first entity of the error text that is down itself (``down`` maps it to the key of its finding)."""
    for entity_id in _ENTITY.findall(error or ""):
        if entity_id in down:
            return {"entity_id": entity_id, "finding_key": down[entity_id]}
    return None
