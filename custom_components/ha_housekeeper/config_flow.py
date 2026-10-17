"""Config flow for HA Housekeeper."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.config_entries import ConfigEntry, ConfigFlowResult, OptionsFlow

from .const import (
    CONF_HISTORY_DAYS,
    CONF_LOW_BATTERY_PERCENT,
    CONF_OUTAGE_HIGH_HOURS,
    CONF_OUTAGE_INFO_MINUTES,
    CONF_OUTAGE_LOW_HOURS,
    CONF_OUTAGE_MEDIUM_HOURS,
    CONF_SCAN_INTERVAL_HOURS,
    CONF_STALE_HOURS,
    CONF_UNUSED_AUTOMATION_DAYS,
    CONF_WATCH_HOURS,
    DEFAULT_HISTORY_DAYS,
    DEFAULT_LOW_BATTERY_PERCENT,
    DEFAULT_SCAN_INTERVAL_HOURS,
    DEFAULT_STALE_HOURS,
    DEFAULT_UNUSED_AUTOMATION_DAYS,
    DEFAULT_WATCH_HOURS,
    DOMAIN,
    NAME,
    OPTION_LIMITS,
)
from .outage_levels import thresholds_from_options, thresholds_rise
from .writelock import write_holder


class HAHousekeeperOptionsFlow(OptionsFlow):
    """Diagnosis thresholds."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Edit thresholds."""
        # Saving reloads the entry, which must not happen while a plan or purge writes.
        scanner = self.hass.data.get(DOMAIN, {}).get("scanner")
        if write_holder(self.hass) or (scanner is not None and scanner.cleanup.running):
            return self.async_abort(reason="busy")
        errors: dict[str, str] = {}
        if user_input is not None:
            if thresholds_rise(thresholds_from_options(user_input)):
                return self.async_create_entry(data=user_input)
            errors["base"] = "thresholds_order"
        options = {
            **self.config_entry.options,
            **thresholds_from_options(self.config_entry.options),
        }
        if user_input is not None:
            options = {**options, **user_input}

        def field(key: str, default: int) -> tuple[Any, Any]:
            minimum, maximum = OPTION_LIMITS[key]
            return (
                vol.Required(key, default=options.get(key, default)),
                vol.All(vol.Coerce(int), vol.Range(min=minimum, max=maximum)),
            )

        schema = vol.Schema(
            dict(
                [
                    field(CONF_OUTAGE_INFO_MINUTES, options[CONF_OUTAGE_INFO_MINUTES]),
                    field(CONF_OUTAGE_LOW_HOURS, options[CONF_OUTAGE_LOW_HOURS]),
                    field(CONF_OUTAGE_MEDIUM_HOURS, options[CONF_OUTAGE_MEDIUM_HOURS]),
                    field(CONF_OUTAGE_HIGH_HOURS, options[CONF_OUTAGE_HIGH_HOURS]),
                    field(CONF_UNUSED_AUTOMATION_DAYS, DEFAULT_UNUSED_AUTOMATION_DAYS),
                    field(CONF_SCAN_INTERVAL_HOURS, DEFAULT_SCAN_INTERVAL_HOURS),
                    field(CONF_LOW_BATTERY_PERCENT, DEFAULT_LOW_BATTERY_PERCENT),
                    field(CONF_STALE_HOURS, DEFAULT_STALE_HOURS),
                    field(CONF_HISTORY_DAYS, DEFAULT_HISTORY_DAYS),
                    field(CONF_WATCH_HOURS, DEFAULT_WATCH_HOURS),
                ]
            )
        )
        return self.async_show_form(step_id="init", data_schema=schema, errors=errors)


class HAHousekeeperConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Configure HA Housekeeper."""

    VERSION = 1

    @staticmethod
    def async_get_options_flow(config_entry: ConfigEntry) -> HAHousekeeperOptionsFlow:
        """Return the options flow."""
        return HAHousekeeperOptionsFlow()

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Create the single local config entry."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(title=NAME, data={})

        return self.async_show_form(step_id="user")
