"""Auto lights."""
from homeassistant.core import State
from homeassistant.components.light import DOMAIN as LIGHT_DOMAIN
from homeassistant.helpers.event import async_track_state_change
from homeassistant.const import (
    EVENT_HOMEASSISTANT_STARTED,
    STATE_ON,
    SERVICE_TURN_ON,
    SERVICE_TURN_OFF,
    ATTR_ENTITY_ID,
)
from homeassistant.util import slugify

from .ha_helpers import get_all_entities

from .const import (
    LOGGER,
    CONFIG_IS_SLEEPING_AREA,
    CONFIG_EXCLUDED_LIGHT_ENTITIES,
    PRESENCE_BINARY_SENSOR_ENTITY_PREFIX,
    SLEEP_MODE_SWITCH_ENTITY_PREFIX,
)


class AutoLights:
    """Automatic light control."""

    def __init__(self, auto_area) -> None:
        """Initialize entities."""
        self.auto_area = auto_area
        self.hass = auto_area.hass

        self.is_sleeping_area = (
            self.auto_area.config_entry.options.get(CONFIG_IS_SLEEPING_AREA) or False
        )
        self.sleep_mode_enabled = None

        self.excluded_light_entities = (
            self.auto_area.config_entry.options.get(CONFIG_EXCLUDED_LIGHT_ENTITIES)
            or []
        )

        self.sleep_mode_entity_id = (
            f"{SLEEP_MODE_SWITCH_ENTITY_PREFIX}{slugify(self.auto_area.area.name)}"
        )
        self.presence_entity_id = (
            f"{PRESENCE_BINARY_SENSOR_ENTITY_PREFIX}{slugify(self.auto_area.area.name)}"
        )

        self.light_entity_ids = [
            entity.entity_id
            for entity in get_all_entities(
                self.auto_area.entity_registry,
                self.auto_area.device_registry,
                self.auto_area.area_id,
                [LIGHT_DOMAIN],
            )
            if entity.entity_id not in self.excluded_light_entities
        ]

        LOGGER.debug(
            "%s: Managing light entities: %s",
            self.auto_area.area.name,
            self.light_entity_ids,
        )
        if len(self.light_entity_ids) == 0:
            LOGGER.warning(
                "%s: No light entities found to manage", self.auto_area.area.name
            )
            return

        if self.hass.is_running:
            self.hass.async_create_task(self.initialize())
        else:
            self.hass.bus.async_listen_once(
                EVENT_HOMEASSISTANT_STARTED, self.initialize()
            )

    def cleanup(self):
        """Deinitialize this area."""
        LOGGER.debug("%s: Disabling light control", self.auto_area.area.name)
        if self.unsubscribe_sleep_mode is not None:
            self.unsubscribe_sleep_mode()

        self.unsubscribe_presence()

    async def initialize(self):
        """Start subscribing to state changes."""

        self.unsubscribe_sleep_mode = None
        if self.is_sleeping_area:
            # set initial state
            sleep_mode_state = self.hass.states.get(self.sleep_mode_entity_id)
            if sleep_mode_state:
                self.sleep_mode_enabled = sleep_mode_state.state == STATE_ON

            LOGGER.debug("%s: Tracking sleep mode changes", self.auto_area.area.name)
            self.unsubscribe_sleep_mode = async_track_state_change(
                self.hass,
                self.sleep_mode_entity_id,
                self.handle_sleep_mode_state_change,
            )

        # set lights initially based on presence
        initial_presence_state = self.hass.states.get(self.presence_entity_id)
        if initial_presence_state and self.light_entity_ids:
            action = (
                SERVICE_TURN_ON
                if initial_presence_state.state == STATE_ON
                else SERVICE_TURN_OFF
            )
            await self.auto_area.hass.services.async_call(
                LIGHT_DOMAIN,
                action,
                {ATTR_ENTITY_ID: self.light_entity_ids},
            )

        LOGGER.debug("%s: Tracking presence state changes", self.auto_area.area.name)
        self.unsubscribe_presence = async_track_state_change(
            self.auto_area.hass,
            self.presence_entity_id,
            self.handle_presence_state_change,
        )

    async def handle_presence_state_change(
        self, entity_id, from_state: State, to_state: State
    ):
        """Handle changes in presence."""
        previous_state = from_state.state if from_state else ""
        current_state = to_state.state

        LOGGER.debug(
            "%s: State change of presence entity %s -> %s",
            entity_id,
            previous_state,
            current_state,
        )

        if previous_state == current_state:
            return

        if current_state == STATE_ON:
            if self.sleep_mode_enabled:
                LOGGER.info(
                    "%s: Sleep mode is on. Not turning on lights",
                    self.auto_area.area.name,
                )
                return

            # turn lights on
            LOGGER.info(
                "%s: Turning lights on %s",
                self.auto_area.area.name,
                self.light_entity_ids,
            )
            await self.hass.services.async_call(
                LIGHT_DOMAIN,
                SERVICE_TURN_ON,
                {ATTR_ENTITY_ID: self.light_entity_ids},
            )
            return
        else:
            if not self.sleep_mode_enabled:
                LOGGER.info(
                    "%s: Turning lights off %s",
                    self.auto_area.area.name,
                    self.light_entity_ids,
                )
            await self.hass.services.async_call(
                LIGHT_DOMAIN,
                SERVICE_TURN_OFF,
                {ATTR_ENTITY_ID: self.light_entity_ids},
            )

    async def handle_sleep_mode_state_change(
        self, entity_id, from_state: State, to_state: State
    ):
        """Handle changes in sleep mode."""
        previous_state = from_state.state if from_state else ""
        current_state = to_state.state if to_state else ""

        LOGGER.debug(
            "%s: State change of sleep mode %s -> %s",
            entity_id,
            previous_state,
            current_state,
        )

        if previous_state == current_state:
            return

        if current_state == STATE_ON:
            LOGGER.info(
                "%s: Sleep mode enabled - turning lights off %s",
                self.auto_area.area.name,
                self.light_entity_ids,
            )
            self.sleep_mode_enabled = True
            await self.hass.services.async_call(
                LIGHT_DOMAIN,
                SERVICE_TURN_OFF,
                {ATTR_ENTITY_ID: self.light_entity_ids},
            )
        else:
            LOGGER.info("%s: Sleep mode disabled", self.auto_area.area.name)
            self.sleep_mode_enabled = False
            has_presence = (
                self.hass.states.get(self.presence_entity_id).state == STATE_ON
            )
            if has_presence:
                LOGGER.info(
                    "%s: Turning lights on due to presence %s",
                    self.auto_area.area.name,
                    self.light_entity_ids,
                )
                await self.hass.services.async_call(
                    LIGHT_DOMAIN,
                    SERVICE_TURN_ON,
                    {ATTR_ENTITY_ID: self.light_entity_ids},
                )
