"""Entity model."""

import bisect
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime
import logging
from typing import TYPE_CHECKING

from homeassistant.util import dt as dt_util

from ..const import MAX_WEIGHT, MIN_PROBABILITY, MIN_WEIGHT
from ..db import AreaOccupancyDB as DB
from ..utils import clamp_probability
from .decay import Decay
from .entity_type import EntityType, InputType

if TYPE_CHECKING:
    from ..coordinator import AreaOccupancyCoordinator

_LOGGER = logging.getLogger(__name__)


@dataclass
class Entity:
    """Type for sensor state information."""

    # --- Core Data ---
    entity_id: str
    type: EntityType
    prob_given_true: float
    prob_given_false: float
    decay: Decay
    coordinator: "AreaOccupancyCoordinator"
    last_updated: datetime
    previous_evidence: bool | None

    @property
    def name(self) -> str | None:
        """Get the entity name from Home Assistant state."""
        ha_state = self.coordinator.hass.states.get(self.entity_id)
        return ha_state.name if ha_state else None

    @property
    def available(self) -> bool:
        """Get the entity availability."""
        return self.state is not None

    @property
    def state(self) -> str | float | bool | None:
        """Get the entity state."""
        ha_state = self.coordinator.hass.states.get(self.entity_id)

        # Check if HA state is valid
        if ha_state and ha_state.state not in [
            "unknown",
            "unavailable",
            None,
            "",
            "NaN",
        ]:
            return ha_state.state
        return None

    @property
    def weight(self) -> float:
        """Get the entity weight."""
        return self.type.weight

    @property
    def evidence(self) -> bool | None:
        """Determine if entity is active.

        Returns:
            bool | None: True if entity is active, False if inactive, None if state unknown

        """
        if self.state is None:
            return None

        if self.active_states:
            return str(self.state) in self.active_states
        if self.active_range:
            min_val, max_val = self.active_range
            try:
                return min_val <= float(self.state) <= max_val
            except (ValueError, TypeError):
                return False

        return None

    @property
    def active(self) -> bool:
        """Get the entity active status."""
        return self.evidence or self.decay.is_decaying

    @property
    def active_states(self) -> list[str] | None:
        """Get the active states for the entity."""
        return self.type.active_states

    @property
    def active_range(self) -> tuple[float, float] | None:
        """Get the active range for the entity."""
        return self.type.active_range

    @property
    def decay_factor(self) -> float:
        """Get decay factor that considers current evidence state.

        Returns 1.0 if evidence is currently True, otherwise returns the normal decay factor.
        This prevents inconsistent states where evidence is True but decay is being applied.
        """
        if self.evidence is True:
            return 1.0
        return self.decay.decay_factor

    def update_likelihood(
        self, prob_given_true: float, prob_given_false: float
    ) -> None:
        """Update the likelihood of the entity."""
        self.prob_given_true = clamp_probability(prob_given_true)
        self.prob_given_false = clamp_probability(prob_given_false)
        self.last_updated = dt_util.utcnow()

    def update_decay(self, decay_start: datetime, is_decaying: bool) -> None:
        """Update the decay of the entity."""
        self.decay.decay_start = decay_start
        self.decay.is_decaying = is_decaying

    def has_new_evidence(self) -> bool:
        """Update decay on actual evidence transitions.

        Returns:
            bool: True if evidence transition occurred, False otherwise

        """
        # Pure calculation from current HA state
        current_evidence = self.evidence

        # Capture previous evidence before updating it
        previous_evidence = self.previous_evidence

        # Skip transition logic if current evidence is None (entity unavailable)
        if current_evidence is None or previous_evidence is None:
            # Update previous evidence even if skipping to prevent false transitions later
            self.previous_evidence = current_evidence
            return False

        # Fix inconsistent state: if evidence is True but decay is running, stop decay
        if current_evidence and self.decay.is_decaying:
            self.decay.stop_decay()

        # Check for evidence transitions
        transition_occurred = current_evidence != previous_evidence

        # Handle evidence transitions
        if transition_occurred:
            self.last_updated = dt_util.utcnow()
            if current_evidence:  # FALSE→TRUE transition
                self.decay.stop_decay()
            else:  # TRUE→FALSE transition
                # Evidence lost - start decay
                self.decay.start_decay()

        # Update previous evidence for next comparison
        self.previous_evidence = current_evidence
        return transition_occurred


class EntityFactory:
    """Factory for creating entities from various sources."""

    def __init__(self, coordinator: "AreaOccupancyCoordinator") -> None:
        """Initialize the factory."""
        self.coordinator = coordinator
        self.config = coordinator.config

    def create_from_db(self, entity_obj: "DB.Entities") -> Entity:
        """Create entity from storage data."""
        # Create the entity type directly
        entity_type = EntityType.create(
            InputType(entity_obj.entity_type),
            self.config,
        )
        # DB weight should take priority over configured default
        try:
            if MIN_WEIGHT <= float(entity_obj.weight) <= MAX_WEIGHT:
                entity_type.weight = float(entity_obj.weight)
        except (TypeError, ValueError):
            pass
        decay = Decay.create(
            decay_start=entity_obj.decay_start,
            half_life=self.config.decay.half_life,
            is_decaying=entity_obj.is_decaying,
        )

        return Entity(
            entity_id=entity_obj.entity_id,
            type=entity_type,
            prob_given_true=entity_obj.prob_given_true,
            prob_given_false=entity_obj.prob_given_false,
            decay=decay,
            coordinator=self.coordinator,
            last_updated=entity_obj.last_updated,
            previous_evidence=entity_obj.evidence,
        )

    def create_from_config_spec(self, entity_id: str, input_type: str) -> Entity:
        """Create entity from configuration specification."""
        # Create the entity type directly
        entity_type = EntityType.create(
            InputType(input_type),
            self.config,
        )
        decay = Decay.create(
            decay_start=dt_util.utcnow(),
            half_life=self.config.decay.half_life,
            is_decaying=False,
        )

        return Entity(
            entity_id=entity_id,
            type=entity_type,
            prob_given_true=entity_type.prob_given_true,
            prob_given_false=entity_type.prob_given_false,
            decay=decay,
            coordinator=self.coordinator,
            last_updated=dt_util.utcnow(),
            previous_evidence=None,
        )

    def create_all_from_config(self) -> dict[str, Entity]:
        """Create all entities from current configuration."""
        entity_type_mapping = self.get_entity_type_mapping()
        entities = {}

        for entity_id, input_type in entity_type_mapping.items():
            _LOGGER.debug("Creating entity %s with type %s", entity_id, input_type)
            entities[entity_id] = self.create_from_config_spec(entity_id, input_type)

        return entities

    def get_entity_type_mapping(self) -> dict[str, str]:
        """Get entity type mapping for all configured entities.

        Returns a mapping of entity_id -> input_type string that can be used
        directly for entity creation.
        """
        specs = {}

        # Define sensor type mappings to eliminate repetition
        SENSOR_TYPE_MAPPING = {
            "motion": InputType.MOTION,
            "media": InputType.MEDIA,
            "appliance": InputType.APPLIANCE,
            "door": InputType.DOOR,
            "window": InputType.WINDOW,
            "illuminance": InputType.ILLUMINANCE,
            "humidity": InputType.HUMIDITY,
            "temperature": InputType.TEMPERATURE,
        }

        # Process each sensor type using the mapping
        for sensor_type, input_type in SENSOR_TYPE_MAPPING.items():
            sensor_list = getattr(self.config.sensors, sensor_type)

            # Special handling for motion sensors (includes wasp)
            if sensor_type == "motion":
                sensor_list = self.config.sensors.get_motion_sensors(self.coordinator)

            for entity_id in sensor_list:
                specs[entity_id] = input_type.value

        return specs


class EntityManager:
    """Manages entities with simplified creation and storage logic."""

    def __init__(self, coordinator: "AreaOccupancyCoordinator") -> None:
        """Initialize the entity manager."""
        self.coordinator = coordinator
        self.config = coordinator.config
        self.hass = coordinator.hass
        self._factory = EntityFactory(coordinator)
        self._entities: dict[str, Entity] = self._factory.create_all_from_config()

    @property
    def entities(self) -> dict[str, Entity]:
        """Get the entities."""
        return self._entities

    def get_entities_by_input_type(
        self, input_type: "InputType"
    ) -> dict[str, "Entity"]:
        """Get entities filtered by InputType."""
        return {
            entity_id: entity
            for entity_id, entity in self._entities.items()
            if entity.type.input_type == input_type
        }

    @property
    def entity_ids(self) -> list[str]:
        """Get the entity IDs."""
        return list(self._entities.keys())

    @property
    def active_entities(self) -> list[Entity]:
        """Get the active entities."""
        return [
            entity
            for entity in self._entities.values()
            if entity.evidence or entity.decay.is_decaying
        ]

    @property
    def inactive_entities(self) -> list[Entity]:
        """Get the inactive entities."""
        return [
            entity
            for entity in self._entities.values()
            if not entity.evidence and not entity.decay.is_decaying
        ]

    @property
    def decaying_entities(self) -> list[Entity]:
        """Get the decaying entities."""
        return [
            entity for entity in self._entities.values() if entity.decay.is_decaying
        ]

    def get_entity(self, entity_id: str) -> Entity:
        """Get the entity from an entity ID."""
        if entity_id not in self._entities:
            raise ValueError(f"Entity not found for entity: {entity_id}")
        return self._entities[entity_id]

    def add_entity(self, entity: Entity) -> None:
        """Add an entity to the manager."""
        self._entities[entity.entity_id] = entity

    async def cleanup(self) -> None:
        """Clean up resources and recreate from config."""
        self._entities.clear()
        self._entities = self._factory.create_all_from_config()

    async def update_likelihoods(self):
        """Compute P(sensor=true|occupied) and P(sensor=true|empty) per sensor.

        Use motion-based labels for 'occupied'.
        """
        _LOGGER.debug("Updating likelihoods")
        db = self.coordinator.db
        entry_id = self.coordinator.entry_id

        with db.get_session() as session:
            sensors = self._get_sensors(session, entry_id)
            if not sensors:
                return

            occupied_times = self.coordinator.prior.get_occupied_intervals()
            intervals_by_entity = self._get_intervals_by_entity(session, sensors)

            for entity in sensors:
                self._update_entity_likelihoods(
                    entity, intervals_by_entity, occupied_times, dt_util.utcnow()
                )

            session.commit()
            _LOGGER.debug("Likelihoods updated")

    def _get_sensors(self, session, entry_id: str) -> list["DB.Entities"]:
        """Get all sensor configs for this area."""
        return (
            session.query(self.coordinator.db.Entities)
            .filter_by(entry_id=entry_id)
            .all()
        )

    def _get_intervals_by_entity(
        self,
        session,
        sensors: list["DB.Entities"],
    ) -> dict[str, list["DB.Intervals"]]:
        """Get all intervals grouped by entity_id."""
        sensor_entity_ids = [entity.entity_id for entity in sensors]

        all_intervals = (
            session.query(self.coordinator.db.Intervals)
            .filter(self.coordinator.db.Intervals.entity_id.in_(sensor_entity_ids))
            .all()
        )

        intervals_by_entity = defaultdict(list)
        for interval in all_intervals:
            intervals_by_entity[interval.entity_id].append(interval)

        return intervals_by_entity

    def _update_entity_likelihoods(
        self,
        entity: "DB.Entities",
        intervals_by_entity: dict[str, list["DB.Intervals"]],
        occupied_times: list[tuple[datetime, datetime]],
        now: datetime,
    ) -> None:
        """Update likelihoods for a single entity."""
        intervals = intervals_by_entity[entity.entity_id]
        entity_obj = self.get_entity(entity.entity_id)

        # Count interval states
        true_occ = false_occ = true_empty = false_empty = 0

        for interval in intervals:
            occ = self._is_occupied(interval.start_time, occupied_times)
            is_active = self._is_interval_active(interval, entity_obj)

            if is_active:
                if occ:
                    true_occ += interval.duration_seconds
                else:
                    true_empty += interval.duration_seconds
            elif occ:
                false_occ += interval.duration_seconds
            else:
                false_empty += interval.duration_seconds

        # Calculate probabilities
        prob_given_true = (
            true_occ / (true_occ + false_occ) if (true_occ + false_occ) > 0 else 0.5
        )
        prob_given_false = (
            true_empty / (true_empty + false_empty)
            if (true_empty + false_empty) > 0
            else 0.5
        )

        # Special handling for motion sensors (ground truth)
        if entity_obj.type.input_type == InputType.MOTION:
            # Check data quality for motion sensors
            total_occupied_time = true_occ + false_occ
            if total_occupied_time < 3600:  # Less than 1 hour of occupied time
                _LOGGER.warning(
                    "Motion sensor %s has insufficient occupied time data (%.1fs), using defaults",
                    entity.entity_id,
                    total_occupied_time,
                )
                prob_given_true = entity_obj.type.prob_given_true
                prob_given_false = entity_obj.type.prob_given_false
            else:
                # Motion sensors should have high prob_given_true for ground truth
                if prob_given_true < 0.8:  # Higher threshold for motion sensors
                    _LOGGER.warning(
                        "Motion sensor %s has low prob_given_true (%.3f), using default (%.3f)",
                        entity.entity_id,
                        prob_given_true,
                        entity_obj.type.prob_given_true,
                    )
                    prob_given_true = entity_obj.type.prob_given_true
                if prob_given_false > 0.1:  # Lower threshold for false positives
                    _LOGGER.warning(
                        "Motion sensor %s has high prob_given_false (%.3f), using default (%.3f)",
                        entity.entity_id,
                        prob_given_false,
                        entity_obj.type.prob_given_false,
                    )
                    prob_given_false = entity_obj.type.prob_given_false
        else:
            # Fallback to defaults if too low for other sensors
            if prob_given_true < MIN_PROBABILITY:
                prob_given_true = entity_obj.type.prob_given_true
            if prob_given_false < MIN_PROBABILITY:
                prob_given_false = entity_obj.type.prob_given_false

        # Update entity
        entity_obj.update_likelihood(prob_given_true, prob_given_false)

    def _is_occupied(
        self, ts: datetime, occupied_times: list[tuple[datetime, datetime]]
    ) -> bool:
        """Check if timestamp falls within any occupied interval."""
        if not occupied_times:
            return False

        # Binary search to find the rightmost interval that starts <= ts
        idx = bisect.bisect_right([start for start, _ in occupied_times], ts)

        # Check if ts falls within the interval found
        if idx > 0:
            start, end = occupied_times[idx - 1]
            if start <= ts < end:
                return True

        return False

    def _is_interval_active(self, interval: "DB.Intervals", entity_obj: Entity) -> bool:
        """Determine if interval state is active based on entity type."""
        if entity_obj.active_states:
            return interval.state in entity_obj.active_states
        if entity_obj.active_range:
            min_val, max_val = entity_obj.active_range
            try:
                state_val = float(interval.state)
            except (ValueError, TypeError):
                return False
            else:
                return min_val <= state_val <= max_val
        return False
