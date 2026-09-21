"""Konstanten für die HA MoviesDB Integration."""

DOMAIN = "ha_moviesdb"

CONF_API_KEY = "api_key"
CONF_REGION = "region"
CONF_PROVIDER_IDS = "provider_ids"

TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/"
TMDB_POSTER_SIZE = "w342"
TMDB_PROVIDER_LOGO_SIZE = "w45"
TMDB_LANGUAGE = "de-DE"

DEFAULT_REGION = "DE"

# Fallback-Liste, falls /watch/providers/regions nicht erreichbar ist.
FALLBACK_REGIONS = {
    "DE": "Germany",
    "AT": "Austria",
    "CH": "Switzerland",
    "US": "United States",
    "GB": "United Kingdom",
    "FR": "France",
    "IT": "Italy",
    "ES": "Spain",
    "NL": "Netherlands",
    "PL": "Poland",
}

PLATFORMS = ["sensor"]

CARD_FILENAME = "ha-moviesdb-card.js"
STATIC_BASE_PATH = f"/{DOMAIN}"

# Wird bei jeder inhaltlichen Änderung der Karte hochgezählt. Die
# Lovelace-Ressource wird automatisch auf diese Version aktualisiert (siehe
# frontend.py) - ein manuelles Nachtragen der URL ist dadurch nicht mehr
# nötig.
CARD_VERSION = "1"

STORAGE_VERSION = 1
STORAGE_KEY = f"{DOMAIN}_data"

UPDATE_INTERVAL_HOURS = 12

SIGNAL_MOVIE_ADDED = f"{DOMAIN}_movie_added"
SIGNAL_MOVIE_REMOVED = f"{DOMAIN}_movie_removed"
SIGNAL_MOVIE_UPDATED = f"{DOMAIN}_movie_updated"

SERVICE_ADD_MOVIE = "add_movie"
SERVICE_REMOVE_MOVIE = "remove_movie"
SERVICE_SET_WATCHED = "set_watched"
SERVICE_SET_ARCHIVED = "set_archived"
SERVICE_REFRESH = "refresh"
SERVICE_REFRESH_WATCH_PROVIDERS = "refresh_watch_providers"

ATTR_MOVIE_ID = "movie_id"
ATTR_WATCHED = "watched"
ATTR_ARCHIVED = "archived"
