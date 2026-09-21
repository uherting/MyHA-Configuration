"""DataUpdateCoordinator, der die Streaming-Verfügbarkeit der Watchlist aktuell hält.

Anders als bei Serien (deren Episodenlisten mit der Zeit wachsen) ändern
sich Filmmetadaten nach dem Release praktisch nie - sie werden daher nur
einmal beim Hinzufügen geholt. Was sich laufend ändert, ist die
Streaming-Verfügbarkeit (Watch-Provider), deshalb ist das der einzige Wert,
den dieser Coordinator periodisch nachlädt - und auch nur für Filme, die
noch auf der aktiven Watchlist sind (archivierte Filme werden übersprungen).
"""
from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import TMDBClient, TMDBError
from .const import DOMAIN, UPDATE_INTERVAL_HOURS
from .store import TMDBStore

_LOGGER = logging.getLogger(__name__)


class TMDBCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Holt regelmäßig die Watch-Provider-Daten für die aktive Watchlist nach."""

    def __init__(self, hass: HomeAssistant, client: TMDBClient, store: TMDBStore, region: str) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(hours=UPDATE_INTERVAL_HOURS),
        )
        self.client = client
        self.store = store
        self.region = region

    async def _async_update_data(self) -> dict[str, Any]:
        summary: dict[str, Any] = {}
        for movie_id in self.store.get_watchlist_ids():
            try:
                providers = await self.client.async_get_watch_providers(movie_id, self.region)
                providers["region"] = self.region
                await self.store.async_update_watch_providers(movie_id, providers)
            except TMDBError as err:
                _LOGGER.warning(
                    "Konnte Watch-Provider für Film %s nicht aktualisieren: %s", movie_id, err
                )
                continue
            summary[movie_id] = {"has_providers": bool(providers.get("flatrate"))}
        return summary

    async def async_refresh_watch_providers(self, movie_id: str) -> None:
        """Aktualisiert gezielt nur einen einzelnen Film (z.B. direkt nach dem Hinzufügen
        oder beim Öffnen der Detailansicht in der Karte, damit die Daten dort nicht bis
        zu UPDATE_INTERVAL_HOURS lang veraltet sind)."""
        try:
            providers = await self.client.async_get_watch_providers(movie_id, self.region)
        except TMDBError as err:
            raise UpdateFailed(str(err)) from err
        providers["region"] = self.region
        await self.store.async_update_watch_providers(movie_id, providers)
