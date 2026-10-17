"""The service ``ha_housekeeper.scan``: start a scan from an automation or a script."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.service import async_register_admin_service

from .const import DOMAIN
from .scan_trigger import ScanRefused

SERVICE_SCAN = "scan"


def async_register_services(hass: HomeAssistant) -> None:
    """Register the services once; they find the scanner of the loaded entry when they are called."""

    async def _scan(call: ServiceCall) -> dict[str, Any]:
        scanner = hass.data.get(DOMAIN, {}).get("scanner")
        if scanner is None:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="not_loaded")
        try:
            return await scanner.async_request_scan(call.data["wait"])
        except ScanRefused as err:
            raise ServiceValidationError(
                translation_domain=DOMAIN, translation_key=err.reason
            ) from err

    async_register_admin_service(
        hass,
        DOMAIN,
        SERVICE_SCAN,
        _scan,
        schema=vol.Schema({vol.Optional("wait", default=False): cv.boolean}),
        supports_response=SupportsResponse.OPTIONAL,
    )
