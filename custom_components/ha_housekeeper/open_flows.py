"""What Home Assistant still waits for: devices found on the network and entries that want a new setup.

Only a look at the open flows; a flow of a login request is a finding, not listed here. Home Assistant
keeps no age for a flow, so there is none to show. Nothing is changed.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant

# Flows a person starts or the system runs on its own: not something that waits for a decision.
OWN_SOURCES = frozenset({"user", "reauth", "import", "system", "unignore", "ignore"})


def open_flows(hass: HomeAssistant) -> list[dict[str, Any]]:
    """The open flows of discoveries and of entries that are to be set up again, by name."""
    titles = {entry.entry_id: entry.title for entry in hass.config_entries.async_entries()}
    found = []
    for flow in hass.config_entries.flow.async_progress():
        context = flow.get("context") or {}
        source = context.get("source")
        if not isinstance(source, str) or source in OWN_SOURCES:
            continue
        reconfigure = source == "reconfigure"
        placeholders = context.get("title_placeholders") or {}
        name = (
            titles.get(context.get("entry_id") or "")
            if reconfigure
            else placeholders.get("name")
            if isinstance(placeholders, dict)
            else None
        )
        found.append(
            {
                "flow_id": flow["flow_id"],
                "domain": flow["handler"],
                "name": str(name or flow["handler"]),
                "source": source,
                "kind": "reconfigure" if reconfigure else "discovered",
            }
        )
    return sorted(found, key=lambda f: (f["kind"], f["name"].casefold(), f["flow_id"]))
