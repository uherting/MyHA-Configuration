"""WebSocket-Befehle, über die die Lovelace-Karte mit der Integration spricht.

Suche und Watch-Provider-Refresh gehen direkt gegen themoviedb.org, alles
andere (Watchlist, Sehstatus, Archiv) läuft über den lokalen Store - damit
ist die Karte auch ohne Internet nutzbar, solange man nichts Neues
hinzufügen oder die Verfügbarkeit auffrischen möchte.

`get_settings` ist bewusst der einzige Weg, über den die Karte die vom
Nutzer im Options-Flow gewählte Region/Anbieterliste zu sehen bekommt: eine
Lovelace-Karte hat keinen sanktionierten Zugriff auf `ConfigEntry.options`
eines Integrations-Entries, daher dieser schreibgeschützte WS-Befehl statt
eigenem Zugriff auf Home-Assistant-Interna. Geschrieben wird ausschließlich
über die native Options-Flow-UI (kein `set_settings`-Befehl).
"""
from __future__ import annotations

import logging

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_send

from .api import TMDBError
from .const import (
    CONF_PROVIDER_IDS,
    CONF_REGION,
    DEFAULT_REGION,
    DOMAIN,
    SIGNAL_MOVIE_ADDED,
    SIGNAL_MOVIE_REMOVED,
)

_LOGGER = logging.getLogger(__name__)


def _get_entry_data(hass: HomeAssistant) -> dict | None:
    domain_data = hass.data.get(DOMAIN, {})
    if not domain_data:
        return None
    # Es wird von genau einer konfigurierten Instanz ausgegangen (Standardfall).
    return next(iter(domain_data.values()))


def _configured_provider_ids(entry_data: dict) -> set[int]:
    entry = entry_data.get("entry")
    if entry is None:
        return set()
    return set(entry.options.get(CONF_PROVIDER_IDS, []))


def _available_on(movie: dict, provider_ids: set[int]) -> list[str]:
    """Namen der eigenen konfigurierten Anbieter, die den Film aktuell im Abo haben."""
    if not provider_ids:
        return []
    providers = movie.get("watch_providers") or {}
    return [
        p["provider_name"]
        for p in providers.get("flatrate", [])
        if p.get("provider_id") in provider_ids
    ]


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/search", vol.Required("query"): str})
@websocket_api.async_response
async def ws_search(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    entry_data = _get_entry_data(hass)
    if entry_data is None:
        connection.send_error(msg["id"], "not_configured", "Integration ist nicht eingerichtet.")
        return
    try:
        results = await entry_data["client"].async_search_movies(msg["query"])
    except TMDBError as err:
        connection.send_error(msg["id"], "tmdb_error", str(err))
        return
    tracked_ids = set(entry_data["store"].get_all_movies().keys())
    for item in results:
        item["tracked"] = item["movie_id"] in tracked_ids
    connection.send_result(msg["id"], {"results": results})


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/list_tracked"})
@websocket_api.async_response
async def ws_list_tracked(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    entry_data = _get_entry_data(hass)
    if entry_data is None:
        connection.send_result(msg["id"], {"movies": []})
        return
    store = entry_data["store"]
    provider_ids = _configured_provider_ids(entry_data)
    movies = []
    for movie_id, movie in store.get_all_movies().items():
        movies.append(
            {
                "movie_id": movie_id,
                "title": movie.get("title"),
                "image": movie.get("image"),
                "release_year": movie.get("release_year"),
                "runtime": movie.get("runtime"),
                "archived": movie.get("archived", False),
                "watched_at": movie.get("watched_at"),
                "available_on": _available_on(movie, provider_ids),
            }
        )
    movies.sort(key=lambda m: (m["title"] or "").lower())
    connection.send_result(msg["id"], {"movies": movies})


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/get_movie", vol.Required("movie_id"): str}
)
@websocket_api.async_response
async def ws_get_movie(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    entry_data = _get_entry_data(hass)
    if entry_data is None:
        connection.send_error(msg["id"], "not_configured", "Integration ist nicht eingerichtet.")
        return
    movie = entry_data["store"].get_movie(msg["movie_id"])
    if movie is None:
        connection.send_error(msg["id"], "not_found", "Film wird nicht verfolgt.")
        return
    connection.send_result(
        msg["id"],
        {
            "movie_id": movie["movie_id"],
            "title": movie.get("title"),
            "overview": movie.get("overview"),
            "image": movie.get("image"),
            "release_year": movie.get("release_year"),
            "runtime": movie.get("runtime"),
            "archived": movie.get("archived", False),
            "watched_at": movie.get("watched_at"),
            "watch_providers": movie.get("watch_providers"),
        },
    )


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/get_watch_providers", vol.Required("movie_id"): str}
)
@websocket_api.async_response
async def ws_get_watch_providers(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Frischt die Watch-Provider-Daten für einen Film gezielt auf.

    Wird von der Karte beim Öffnen der Detailansicht gerufen, damit die
    Anzeige nicht bis zu UPDATE_INTERVAL_HOURS lang veraltet ist.
    """
    entry_data = _get_entry_data(hass)
    if entry_data is None:
        connection.send_error(msg["id"], "not_configured", "Integration ist nicht eingerichtet.")
        return
    movie_id = msg["movie_id"]
    if not entry_data["store"].is_tracked(movie_id):
        connection.send_error(msg["id"], "not_found", "Film wird nicht verfolgt.")
        return
    try:
        await entry_data["coordinator"].async_refresh_watch_providers(movie_id)
    except Exception as err:  # noqa: BLE001 - UpdateFailed o.ä., als tmdb_error melden
        connection.send_error(msg["id"], "tmdb_error", str(err))
        return
    movie = entry_data["store"].get_movie(movie_id)
    connection.send_result(msg["id"], movie.get("watch_providers") or {})


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/add_movie", vol.Required("movie_id"): str}
)
@websocket_api.async_response
async def ws_add_movie(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    entry_data = _get_entry_data(hass)
    if entry_data is None:
        connection.send_error(msg["id"], "not_configured", "Integration ist nicht eingerichtet.")
        return
    movie_id = msg["movie_id"]
    try:
        info = await entry_data["client"].async_get_movie(movie_id)
    except TMDBError as err:
        connection.send_error(msg["id"], "tmdb_error", str(err))
        return
    await entry_data["store"].async_add_movie(movie_id, info)
    try:
        await entry_data["coordinator"].async_refresh_watch_providers(movie_id)
    except Exception as err:  # noqa: BLE001 - Watch-Provider sind optional, Hinzufügen soll trotzdem klappen
        _LOGGER.warning("Konnte Watch-Provider für neuen Film %s nicht laden: %s", movie_id, err)
    async_dispatcher_send(hass, SIGNAL_MOVIE_ADDED, movie_id)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/remove_movie", vol.Required("movie_id"): str}
)
@websocket_api.async_response
async def ws_remove_movie(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    entry_data = _get_entry_data(hass)
    if entry_data is None:
        connection.send_error(msg["id"], "not_configured", "Integration ist nicht eingerichtet.")
        return
    movie_id = msg["movie_id"]
    await entry_data["store"].async_remove_movie(movie_id)
    async_dispatcher_send(hass, SIGNAL_MOVIE_REMOVED, movie_id)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/set_watched",
        vol.Required("movie_id"): str,
        vol.Required("watched"): bool,
    }
)
@websocket_api.async_response
async def ws_set_watched(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    entry_data = _get_entry_data(hass)
    if entry_data is None:
        connection.send_error(msg["id"], "not_configured", "Integration ist nicht eingerichtet.")
        return
    await entry_data["store"].async_set_watched(msg["movie_id"], msg["watched"])
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/set_archived",
        vol.Required("movie_id"): str,
        vol.Required("archived"): bool,
    }
)
@websocket_api.async_response
async def ws_set_archived(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    entry_data = _get_entry_data(hass)
    if entry_data is None:
        connection.send_error(msg["id"], "not_configured", "Integration ist nicht eingerichtet.")
        return
    await entry_data["store"].async_set_archived(msg["movie_id"], msg["archived"])
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/get_settings"})
@websocket_api.async_response
async def ws_get_settings(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    entry_data = _get_entry_data(hass)
    if entry_data is None:
        connection.send_result(msg["id"], {"region": DEFAULT_REGION, "providers": []})
        return
    entry = entry_data["entry"]
    region = entry.options.get(CONF_REGION, DEFAULT_REGION)
    provider_ids = set(entry.options.get(CONF_PROVIDER_IDS, []))

    providers: list[dict] = []
    if provider_ids:
        try:
            all_providers = await entry_data["client"].async_get_watch_provider_list(region)
        except TMDBError as err:
            _LOGGER.warning("Konnte Anbieterliste für Einstellungen nicht laden: %s", err)
            all_providers = []
        by_id = {p["provider_id"]: p for p in all_providers}
        for provider_id in provider_ids:
            providers.append(
                by_id.get(provider_id, {"provider_id": provider_id, "provider_name": str(provider_id), "logo_path": ""})
            )

    connection.send_result(msg["id"], {"region": region, "providers": providers})


def async_register_commands(hass: HomeAssistant) -> None:
    """Registriert alle WebSocket-Befehle (nur einmal global nötig)."""
    websocket_api.async_register_command(hass, ws_search)
    websocket_api.async_register_command(hass, ws_list_tracked)
    websocket_api.async_register_command(hass, ws_get_movie)
    websocket_api.async_register_command(hass, ws_get_watch_providers)
    websocket_api.async_register_command(hass, ws_add_movie)
    websocket_api.async_register_command(hass, ws_remove_movie)
    websocket_api.async_register_command(hass, ws_set_watched)
    websocket_api.async_register_command(hass, ws_set_archived)
    websocket_api.async_register_command(hass, ws_get_settings)
