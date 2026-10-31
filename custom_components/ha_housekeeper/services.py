"""The services: ``scan`` from an automation or a script, and the AI access functions."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.service import async_register_admin_service

from .const import DOMAIN
from .mcp_api import FUNCTIONS, McpError, run
from .runtime import loaded_scanner
from .scan_trigger import ScanRefused

SERVICE_SCAN = "scan"


def async_register_services(hass: HomeAssistant) -> None:
    """Register the services once; they find the scanner of the loaded entry when they are called."""

    async def _scan(call: ServiceCall) -> dict[str, Any]:
        scanner = loaded_scanner(hass)
        if scanner is None:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="not_loaded")
        try:
            return await scanner.async_request_scan(call.data["wait"])
        except ScanRefused as err:
            raise ServiceValidationError(
                translation_domain=DOMAIN, translation_key=err.reason
            ) from err

    def ai_service(name: str) -> Any:
        async def _call(call: ServiceCall) -> dict[str, Any]:
            scanner = loaded_scanner(hass)
            try:
                return await run(hass, scanner, name, dict(call.data), call.context.user_id)
            except McpError as err:
                raise ServiceValidationError(
                    translation_domain=DOMAIN,
                    translation_key=err.reason,
                    translation_placeholders={"detail": err.detail},
                ) from err

        return _call

    # The schema is checked in ``run`` so that a wrong call is refused in the log too.
    for name in FUNCTIONS:
        async_register_admin_service(
            hass,
            DOMAIN,
            name,
            ai_service(name),
            schema=vol.Schema({}, extra=vol.ALLOW_EXTRA),
            supports_response=SupportsResponse.ONLY,
        )

    async_register_admin_service(
        hass,
        DOMAIN,
        SERVICE_SCAN,
        _scan,
        schema=vol.Schema({vol.Optional("wait", default=False): cv.boolean}),
        supports_response=SupportsResponse.OPTIONAL,
    )
