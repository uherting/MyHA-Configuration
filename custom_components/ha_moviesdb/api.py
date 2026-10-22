"""Schlanker asynchroner Client für die kostenlose themoviedb.org (TMDB) API v3.

Es wird bewusst kein zusätzliches Python-Paket genutzt, sondern nur die in
Home Assistant ohnehin vorhandene aiohttp-Session, damit die Integration
keine externen Requirements benötigt.

API-Dokumentation: https://developer.themoviedb.org/reference/intro/getting-started
Watch-Provider-Daten stammen von JustWatch und werden von TMDB durchgereicht:
https://developer.themoviedb.org/docs/watch-providers-attribution-requirement
"""
from __future__ import annotations

import asyncio
import logging
import re
from datetime import date, timedelta
from typing import Any

import async_timeout
from aiohttp import ClientSession, ContentTypeError

from .const import (
    FALLBACK_REGIONS,
    NOW_PLAYING_MAX_AGE_DAYS,
    NOW_PLAYING_MAX_PAGES,
    TMDB_BASE_URL,
    TMDB_IMAGE_BASE,
    TMDB_LANGUAGE,
    TMDB_POSTER_SIZE,
    TMDB_PROVIDER_LOGO_SIZE,
    UPCOMING_LOOKUP_CONCURRENCY,
)

_LOGGER = logging.getLogger(__name__)

REQUEST_TIMEOUT = 20

PROVIDER_CATEGORIES = ("flatrate", "rent", "buy", "ads", "free")


class TMDBError(Exception):
    """Allgemeiner Fehler bei der Kommunikation mit themoviedb.org."""


class TMDBAuthError(TMDBError):
    """API-Key wurde von themoviedb.org abgelehnt."""


def _image_url(path: str | None, size: str) -> str:
    if not path:
        return ""
    return f"{TMDB_IMAGE_BASE}{size}{path}"


def _map_provider(item: dict[str, Any]) -> dict[str, Any]:
    return {
        "provider_id": item.get("provider_id"),
        "provider_name": item.get("provider_name", ""),
        "logo_path": _image_url(item.get("logo_path"), TMDB_PROVIDER_LOGO_SIZE),
    }


def _map_movie_item(item: dict[str, Any]) -> dict[str, Any] | None:
    """Vereinfacht einen Eintrag aus Listen-Endpunkten (Suche, Im Kino)."""
    movie_id = item.get("id")
    if movie_id is None:
        return None
    release_date = item.get("release_date") or ""
    return {
        "movie_id": str(movie_id),
        "title": item.get("title") or item.get("original_title") or "?",
        "overview": item.get("overview", ""),
        "image": _image_url(item.get("poster_path"), TMDB_POSTER_SIZE),
        "release_year": release_date[:4],
        "release_date": release_date,
    }


# Unicode-Bereiche der Schriften, in denen TMDB Titel von Filmen ohne deutschen
# oder englischen Titel liefert (Rückfall auf den Originaltitel). Solche Filme
# werden in der Kinoliste ausgeblendet.
_HIDDEN_SCRIPT_RANGES = (
    (0x0600, 0x06FF),  # Arabisch
    (0x0750, 0x077F),  # Arabisch, Ergänzung
    (0x08A0, 0x08FF),  # Arabisch, erweitert
    (0xFB50, 0xFDFF),  # Arabisch, Präsentationsformen A
    (0xFE70, 0xFEFF),  # Arabisch, Präsentationsformen B
    (0x0900, 0x0DFF),  # Indische Schriften (Devanagari bis Singhalesisch)
    (0x0E00, 0x0EFF),  # Thai, Lao
    (0x1000, 0x109F),  # Birmanisch
    (0x1780, 0x17FF),  # Khmer
    (0x1100, 0x11FF),  # Hangul Jamo
    (0x3130, 0x318F),  # Hangul-Kompatibilität
    (0xAC00, 0xD7AF),  # Hangul-Silben
    (0x3040, 0x30FF),  # Hiragana, Katakana
    (0x3400, 0x4DBF),  # Han, Erweiterung A
    (0x4E00, 0x9FFF),  # Han (Chinesisch/Kanji)
    (0xF900, 0xFAFF),  # Han-Kompatibilität
    (0x20000, 0x2FA1F),  # Han, Erweiterungen B bis F
)
_HIDDEN_SCRIPTS = re.compile(
    "[" + "".join(f"{chr(start)}-{chr(end)}" for start, end in _HIDDEN_SCRIPT_RANGES) + "]"
)
# Wer Home Assistant in einer dieser Sprachen nutzt, bekommt die Titel nicht ausgeblendet.
_NATIVE_SCRIPT_LANGUAGES = frozenset(
    "ar fa ur zh ja ko th hi mr ne bn pa gu ta te kn ml si my km lo".split()
)
_YOUTUBE_KEY = re.compile(r"^[\w-]{6,20}$")


def _regional_release_date(results: list[dict[str, Any]], region: str, today: date) -> str | None:
    """Frühester Kinostart (Typ 2 begrenzt, 3 regulär) in der Region ab heute, als ISO-Datum."""
    start = today.isoformat()
    dates = [
        (entry.get("release_date") or "")[:10]
        for country in results
        if country.get("iso_3166_1") == region
        for entry in country.get("release_dates", [])
        if entry.get("type") in (2, 3) and (entry.get("release_date") or "")[:10] >= start
    ]
    return min(dates) if dates else None


def _pick_trailer(videos: list[dict[str, Any]], language: str) -> dict[str, str] | None:
    """Wählt aus den TMDB-Videos den besten YouTube-Trailer (Sprache, offiziell)."""
    candidates = [
        video
        for video in videos
        if video.get("site") == "YouTube"
        and video.get("type") in ("Trailer", "Teaser")
        and _YOUTUBE_KEY.match(video.get("key") or "")
    ]
    if not candidates:
        return None
    best = min(
        candidates,
        key=lambda video: (
            video["type"] != "Trailer",
            video.get("iso_639_1") != language,
            video.get("iso_639_1") != "en",
            not video.get("official"),
        ),
    )
    return {"url": f"https://www.youtube.com/watch?v={best['key']}", "name": best.get("name", "")}


# Home-Assistant-Sprache -> TMDB-Sprachcode (TMDB erwartet z.B. "de-DE").
_TMDB_LANGUAGE_MAP = {
    "de": "de-DE",
    "en": "en-US",
    "zh-Hans": "zh-CN",
    "zh-Hant": "zh-TW",
    "nb": "no",
}


def tmdb_language(ha_language: str | None) -> str:
    """Leitet die TMDB-Sprache aus der Home-Assistant-Sprache ab (Fallback: Deutsch)."""
    if not ha_language:
        return TMDB_LANGUAGE
    return _TMDB_LANGUAGE_MAP.get(ha_language, ha_language)


class TMDBClient:
    """Kapselt die wenigen TMDB-Endpunkte, die diese Integration braucht.

    TMDB nutzt (in der kostenlosen "API Key (v3 auth)"-Variante) einen
    simplen API-Key, der bei jeder Anfrage als Query-Parameter mitgeschickt
    wird – es ist also kein separater Login-Schritt nötig.
    """

    def __init__(
        self, session: ClientSession, api_key: str, language: str = TMDB_LANGUAGE
    ) -> None:
        self._session = session
        self._api_key = api_key
        self._language = language

    @property
    def language(self) -> str:
        """TMDB-Sprache, in der Titel, Beschreibungen usw. abgefragt werden."""
        return self._language

    async def _request(self, path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        query = {"api_key": self._api_key, "language": self._language}
        if params:
            query.update(params)

        try:
            async with async_timeout.timeout(REQUEST_TIMEOUT):
                resp = await self._session.get(f"{TMDB_BASE_URL}{path}", params=query)
        except Exception as err:  # noqa: BLE001
            raise TMDBError(f"Anfrage an themoviedb.org fehlgeschlagen: {err}") from err

        if resp.status == 401:
            raise TMDBAuthError("API-Key wurde von themoviedb.org abgelehnt (401).")
        if resp.status == 404:
            raise TMDBError("Nicht gefunden (404) bei themoviedb.org.")
        if resp.status == 429:
            raise TMDBError("Rate-Limit von themoviedb.org erreicht, bitte kurz warten.")
        if resp.status != 200:
            raise TMDBError(f"themoviedb.org antwortete mit HTTP {resp.status} für {path}.")

        try:
            return await resp.json()
        except ContentTypeError as err:
            raise TMDBError("Unerwartete Antwort von themoviedb.org.") from err

    async def async_test_connection(self) -> None:
        """Wird beim Einrichten des Config-Flows genutzt, um den API-Key zu prüfen."""
        await self._request("/authentication")

    async def async_search_movies(self, query: str) -> list[dict[str, Any]]:
        """Sucht Filme über /search/movie und liefert eine vereinfachte Liste zurück."""
        data = await self._request(
            "/search/movie", params={"query": query, "include_adult": "false"}
        )
        mapped = (_map_movie_item(item) for item in data.get("results", []))
        return [movie for movie in mapped if movie]

    async def _async_get_cinema_movies(
        self, path: str, region: str, today: date
    ) -> list[dict[str, Any]]:
        """Holt alle Seiten eines TMDB-Kinolisten-Endpunkts und filtert Unbrauchbares heraus.

        Weitere Seiten werden parallel geholt. TMDB zählt in diesen Listen auch
        Wiederaufführungen und Sondervorstellungen alter Filme mit; sie werden
        über das ursprüngliche Erscheinungsdatum herausgefiltert (nur Filme der
        letzten NOW_PLAYING_MAX_AGE_DAYS Tage oder kommende). Filme, deren Titel
        in arabischer oder asiatischer Schrift steht (TMDB kennt dann nur den
        Originaltitel), werden ausgeblendet, sofern die Abfragesprache nicht
        selbst eine solche Schrift nutzt, ebenso Einträge ganz ohne Poster und
        Beschreibung (meist unfertige TMDB-Datensätze).
        """
        first = await self._request(path, params={"region": region, "page": 1})
        pages = [first]
        total_pages = min(first.get("total_pages") or 1, NOW_PLAYING_MAX_PAGES)
        if total_pages > 1:
            pages.extend(
                await asyncio.gather(
                    *(
                        self._request(path, params={"region": region, "page": page})
                        for page in range(2, total_pages + 1)
                    )
                )
            )

        cutoff = (today - timedelta(days=NOW_PLAYING_MAX_AGE_DAYS)).isoformat()
        hide_scripts = self._language.split("-")[0].lower() not in _NATIVE_SCRIPT_LANGUAGES
        results: list[dict[str, Any]] = []
        seen: set[str] = set()
        for page in pages:
            for item in page.get("results", []):
                movie = _map_movie_item(item)
                if not movie or movie["movie_id"] in seen:
                    continue
                seen.add(movie["movie_id"])
                if not movie["release_date"] or movie["release_date"] < cutoff:
                    continue
                if hide_scripts and _HIDDEN_SCRIPTS.search(movie["title"]):
                    continue
                if not movie["image"] and not movie["overview"]:
                    continue
                results.append(movie)
        return results

    async def async_get_now_playing(
        self, region: str, today: date | None = None
    ) -> list[dict[str, Any]]:
        """Filme, die aktuell in der Region im Kino laufen (/movie/now_playing), neueste zuerst."""
        movies = await self._async_get_cinema_movies(
            "/movie/now_playing", region, today or date.today()
        )
        movies.sort(key=lambda movie: movie["release_date"], reverse=True)
        return movies

    async def async_get_upcoming(
        self, region: str, today: date | None = None
    ) -> list[dict[str, Any]]:
        """Filme, die demnächst in der Region ins Kino kommen (/movie/upcoming).

        Das Erscheinungsdatum in der Liste ist das weltweit erste, ein Film kann
        also längst woanders laufen. Deshalb wird pro Film der Kinostart in der
        Region nachgeschlagen (/release_dates, begrenzt parallel). Schlägt das
        fehl oder gibt es keinen kommenden Termin, bleibt das ursprüngliche Datum.
        Der nächste Start steht zuerst.
        """
        today = today or date.today()
        movies = await self._async_get_cinema_movies("/movie/upcoming", region, today)
        semaphore = asyncio.Semaphore(UPCOMING_LOOKUP_CONCURRENCY)

        async def apply_regional_date(movie: dict[str, Any]) -> None:
            async with semaphore:
                try:
                    data = await self._request(f"/movie/{movie['movie_id']}/release_dates")
                except TMDBError as err:
                    _LOGGER.debug("Kinostart für %s nicht abrufbar: %s", movie["movie_id"], err)
                    return
            found = _regional_release_date(data.get("results", []), region, today)
            if found:
                movie["release_date"] = found
                movie["release_year"] = found[:4]

        await asyncio.gather(*(apply_regional_date(movie) for movie in movies))
        movies.sort(key=lambda movie: movie["release_date"])
        return movies

    async def async_get_trailer(self, movie_id: str) -> dict[str, str] | None:
        """Liefert den besten YouTube-Trailer eines Films (oder None, falls keiner existiert)."""
        language = self._language.split("-")[0].lower()
        data = await self._request(
            f"/movie/{movie_id}/videos", params={"include_video_language": f"{language},en"}
        )
        return _pick_trailer(data.get("results", []), language)

    async def async_get_movie(self, movie_id: str) -> dict[str, Any]:
        """Holt Filminfos (Titel, Poster, Beschreibung, Laufzeit, Jahr)."""
        movie = await self._request(f"/movie/{movie_id}")
        year = (movie.get("release_date") or "")[:4]
        return {
            "movie_id": str(movie_id),
            "title": movie.get("title") or movie.get("original_title") or "?",
            "overview": movie.get("overview", ""),
            "image": _image_url(movie.get("poster_path"), TMDB_POSTER_SIZE),
            "release_year": year,
            "runtime": movie.get("runtime"),
            "language": self._language,
        }

    async def async_get_watch_providers(self, movie_id: str, region: str) -> dict[str, Any]:
        """Holt die Streaming-Verfügbarkeit eines Films für eine Region.

        TMDB liefert die Daten (von JustWatch) verschachtelt unter
        ``results.<region>``. Existiert die Region nicht in der Antwort
        (keine bekannten Angebote in diesem Land), werden leere Listen
        zurückgegeben statt eines Fehlers.
        """
        data = await self._request(f"/movie/{movie_id}/watch/providers")
        region_data = (data.get("results") or {}).get(region, {})

        result: dict[str, Any] = {"link": region_data.get("link", "")}
        for category in PROVIDER_CATEGORIES:
            result[category] = [_map_provider(p) for p in region_data.get(category, [])]
        return result

    async def async_get_watch_provider_list(self, region: str) -> list[dict[str, Any]]:
        """Holt die vollständige, aktuelle Anbieterliste für eine Region.

        Wird von der Options-Flow-UI genutzt, damit die Auswahl der eigenen
        Streamingdienste immer den echten, aktuellen TMDB-Katalog zeigt statt
        einer hartkodierten (und damit potenziell veralteten) Liste.
        """
        data = await self._request(
            "/watch/providers/movie", params={"watch_region": region}
        )
        return [_map_provider(item) for item in data.get("results", [])]

    async def async_get_watch_provider_regions(self) -> dict[str, str]:
        """Holt die Liste der von TMDB unterstützten Watch-Provider-Regionen.

        Fällt bei einem Fehler auf eine kleine statische Liste gängiger
        Länder zurück, damit die Options-Flow-UI trotzdem nutzbar bleibt.
        """
        try:
            data = await self._request("/watch/providers/regions")
        except TMDBError as err:
            _LOGGER.warning("Konnte Regionenliste nicht laden, nutze Fallback: %s", err)
            return dict(FALLBACK_REGIONS)

        regions = {}
        for item in data.get("results", []):
            code = item.get("iso_3166_1")
            name = item.get("english_name") or item.get("native_name")
            if code and name:
                regions[code] = name
        return regions or dict(FALLBACK_REGIONS)
