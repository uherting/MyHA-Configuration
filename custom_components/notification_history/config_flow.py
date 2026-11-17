"""Config flow: which targets to record and how long to keep them."""
from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import selector

from .const import (
    CONF_LOGBOOK,
    CONF_MAX_COUNT,
    CONF_MAX_DAYS,
    CONF_PERSISTENT,
    CONF_TARGETS,
    DEFAULT_MAX_COUNT,
    DEFAULT_MAX_DAYS,
    DOMAIN,
)
from .targets import available_targets


def _schema(hass: HomeAssistant, current: dict[str, Any]) -> vol.Schema:
    options = [
        selector.SelectOptionDict(value=t["target"], label=f"{t['name']} ({t['target']})")
        for t in available_targets(hass)
    ]
    # Keep targets chosen earlier that are not available right now (device offline…).
    known = {o["value"] for o in options}
    options += [selector.SelectOptionDict(value=t, label=t) for t in current.get(CONF_TARGETS, []) if t not in known]
    return vol.Schema(
        {
            vol.Optional(CONF_TARGETS, default=current.get(CONF_TARGETS, [])): selector.SelectSelector(
                selector.SelectSelectorConfig(
                    options=options, multiple=True, custom_value=True, mode=selector.SelectSelectorMode.DROPDOWN
                )
            ),
            vol.Required(CONF_MAX_DAYS, default=current.get(CONF_MAX_DAYS, DEFAULT_MAX_DAYS)): selector.NumberSelector(
                selector.NumberSelectorConfig(min=1, max=3650, step=1, mode=selector.NumberSelectorMode.BOX, unit_of_measurement="d")
            ),
            vol.Required(CONF_MAX_COUNT, default=current.get(CONF_MAX_COUNT, DEFAULT_MAX_COUNT)): selector.NumberSelector(
                selector.NumberSelectorConfig(min=10, max=10000, step=10, mode=selector.NumberSelectorMode.BOX)
            ),
            vol.Required(CONF_LOGBOOK, default=current.get(CONF_LOGBOOK, False)): selector.BooleanSelector(),
            vol.Required(CONF_PERSISTENT, default=current.get(CONF_PERSISTENT, False)): selector.BooleanSelector(),
        }
    )


def _clean(user_input: dict[str, Any]) -> dict[str, Any]:
    return {
        CONF_TARGETS: list(user_input.get(CONF_TARGETS) or []),
        CONF_MAX_DAYS: int(user_input[CONF_MAX_DAYS]),
        CONF_MAX_COUNT: int(user_input[CONF_MAX_COUNT]),
        CONF_LOGBOOK: bool(user_input[CONF_LOGBOOK]),
        CONF_PERSISTENT: bool(user_input.get(CONF_PERSISTENT, False)),
    }


class NotificationHistoryConfigFlow(ConfigFlow, domain=DOMAIN):
    """Single entry; everything lives in options so it can be changed later."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(title="Notification History", data={}, options=_clean(user_input))
        return self.async_show_form(step_id="user", data_schema=_schema(self.hass, {}))

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return NotificationHistoryOptionsFlow()


class NotificationHistoryOptionsFlow(OptionsFlow):
    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(data=_clean(user_input))
        return self.async_show_form(step_id="init", data_schema=_schema(self.hass, dict(self.config_entry.options)))
