"""Persistente Ablage der verfolgten Filme (Watchlist/Archiv).

Nutzt das eingebaute Storage-Helper von Home Assistant, die Daten landen
also ganz normal unter `.storage/ha_moviesdb_data`.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_VERSION


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class TMDBStore:
    """Verwaltet `{"movies": {movie_id: {...}}}` und speichert es persistent."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict[str, Any] = {"movies": {}}

    async def async_load(self) -> None:
        stored = await self._store.async_load()
        if stored:
            self._data = stored
        self._data.setdefault("movies", {})

    async def _async_save(self) -> None:
        await self._store.async_save(self._data)

    # -- Lesezugriffe -------------------------------------------------

    def get_all_movies(self) -> dict[str, Any]:
        return self._data["movies"]

    def get_movie(self, movie_id: str) -> dict[str, Any] | None:
        return self._data["movies"].get(str(movie_id))

    def is_tracked(self, movie_id: str) -> bool:
        return str(movie_id) in self._data["movies"]

    def get_watchlist_ids(self) -> list[str]:
        """Liefert die IDs aller nicht archivierten Filme.

        Wird vom Coordinator genutzt, um nur für die aktive Watchlist
        Watch-Provider-Daten aufzufrischen - archivierte Filme sind
        "abgeschlossen" und müssen nicht weiter aktuell gehalten werden.
        """
        return [
            movie_id
            for movie_id, movie in self._data["movies"].items()
            if not movie.get("archived", False)
        ]

    # -- Filme verwalten -------------------------------------------------

    async def async_add_movie(self, movie_id: str, info: dict[str, Any]) -> None:
        movie_id = str(movie_id)
        existing = self._data["movies"].get(movie_id, {})
        self._data["movies"][movie_id] = {
            "movie_id": movie_id,
            "title": info.get("title", existing.get("title", "")),
            "overview": info.get("overview", existing.get("overview", "")),
            "image": info.get("image", existing.get("image", "")),
            "release_year": info.get("release_year", existing.get("release_year", "")),
            "runtime": info.get("runtime", existing.get("runtime")),
            "added_at": existing.get("added_at", _now()),
            "watched_at": existing.get("watched_at"),
            "archived": existing.get("archived", False),
            "watch_providers": existing.get("watch_providers"),
        }
        await self._async_save()

    async def async_remove_movie(self, movie_id: str) -> None:
        self._data["movies"].pop(str(movie_id), None)
        await self._async_save()

    # -- Sehstatus / Archiv -----------------------------------------------

    async def async_set_watched(self, movie_id: str, watched: bool) -> None:
        movie = self._data["movies"].get(str(movie_id))
        if movie is None:
            return
        movie["watched_at"] = _now() if watched else None
        await self._async_save()

    async def async_set_archived(self, movie_id: str, archived: bool) -> None:
        movie = self._data["movies"].get(str(movie_id))
        if movie is None:
            return
        movie["archived"] = bool(archived)
        await self._async_save()

    # -- Watch-Provider-Cache ----------------------------------------------

    async def async_update_watch_providers(self, movie_id: str, providers: dict[str, Any]) -> None:
        movie = self._data["movies"].get(str(movie_id))
        if movie is None:
            return
        movie["watch_providers"] = {
            "region": providers.get("region", ""),
            "flatrate": providers.get("flatrate", []),
            "rent": providers.get("rent", []),
            "buy": providers.get("buy", []),
            "ads": providers.get("ads", []),
            "free": providers.get("free", []),
            "link": providers.get("link", ""),
            "fetched_at": _now(),
        }
        await self._async_save()
