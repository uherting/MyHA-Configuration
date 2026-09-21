"""Sensor-Plattform: pro verfolgtem Film eine Entität mit Status und Verfügbarkeit.

Die Entitäten sind vor allem für Automationen gedacht (z.B. "benachrichtige
mich, wenn ein Film auf einem meiner Streamingdienste verfügbar wird"). Die
eigentliche Bedienung passiert über die Lovelace-Karte.
"""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import CONF_PROVIDER_IDS, DOMAIN, SIGNAL_MOVIE_ADDED, SIGNAL_MOVIE_REMOVED
from .coordinator import TMDBCoordinator
from .store import TMDBStore

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    data = hass.data[DOMAIN][entry.entry_id]
    coordinator: TMDBCoordinator = data["coordinator"]
    store: TMDBStore = data["store"]

    known_entities: dict[str, TMDBMovieSensor] = {}

    def _add_movie_entity(movie_id: str) -> None:
        if movie_id in known_entities:
            return
        entity = TMDBMovieSensor(coordinator, store, movie_id, entry)
        known_entities[movie_id] = entity
        async_add_entities([entity])

    # Beim Start: für alle bereits gemerkten Filme Entitäten anlegen.
    for movie_id in store.get_all_movies():
        _add_movie_entity(movie_id)

    @callback
    def _handle_movie_added(movie_id: str) -> None:
        _add_movie_entity(movie_id)

    @callback
    def _handle_movie_removed(movie_id: str) -> None:
        entity = known_entities.pop(movie_id, None)
        if entity is not None:
            hass.async_create_task(entity.async_remove(force_remove=True))

    entry.async_on_unload(
        async_dispatcher_connect(hass, SIGNAL_MOVIE_ADDED, _handle_movie_added)
    )
    entry.async_on_unload(
        async_dispatcher_connect(hass, SIGNAL_MOVIE_REMOVED, _handle_movie_removed)
    )


class TMDBMovieSensor(CoordinatorEntity[TMDBCoordinator], SensorEntity):
    """Zeigt Status ("watchlist"/"watched"/"archived") und Verfügbarkeit eines Films an."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:movie-open"
    _attr_entity_category = None

    def __init__(
        self, coordinator: TMDBCoordinator, store: TMDBStore, movie_id: str, entry: ConfigEntry
    ) -> None:
        super().__init__(coordinator)
        self._store = store
        self._movie_id = movie_id
        self._entry = entry
        self._attr_unique_id = f"{DOMAIN}_{movie_id}"
        self._attr_translation_key = "movie_status"

    @property
    def _movie(self) -> dict[str, Any]:
        return self._store.get_movie(self._movie_id) or {}

    @property
    def name(self) -> str:
        return self._movie.get("title") or f"Film {self._movie_id}"

    @property
    def native_value(self) -> str:
        movie = self._movie
        if movie.get("archived"):
            return "archived"
        if movie.get("watched_at"):
            return "watched"
        return "watchlist"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        movie = self._movie
        return {
            "movie_id": self._movie_id,
            "title": movie.get("title"),
            "release_year": movie.get("release_year"),
            "runtime": movie.get("runtime"),
            "image": movie.get("image"),
            "archived": movie.get("archived", False),
            "watched_at": movie.get("watched_at"),
            "available_on": self._available_on(movie),
        }

    @property
    def entity_picture(self) -> str | None:
        return self._movie.get("image") or None

    def _available_on(self, movie: dict[str, Any]) -> list[str]:
        """Namen der eigenen konfigurierten Anbieter, die den Film aktuell im
        Abo (flatrate) haben - die automatisierungsfreundliche Kernfunktion
        ("Film X ist jetzt auf Netflix verfügbar")."""
        provider_ids = set(self._entry.options.get(CONF_PROVIDER_IDS, []))
        if not provider_ids:
            return []
        providers = movie.get("watch_providers") or {}
        return [
            p["provider_name"]
            for p in providers.get("flatrate", [])
            if p.get("provider_id") in provider_ids
        ]
