"""The language of what Housekeeper writes on its own: notifications and logbook entries.

The languages are listed in `languages.json`, which the panel uses too. A text table is picked with
`pick`; a language without an entry, or without a single text of an entry, falls back to English.
"""

from __future__ import annotations

import json
from functools import cache
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant

LANGUAGES: list[dict[str, Any]] = json.loads(
    (Path(__file__).parent / "languages.json").read_text(encoding="utf-8")
)
LANGUAGE_CODES: list[str] = [lang["code"] for lang in LANGUAGES]
LOCALES = Path(__file__).parent / "locales"


def match_language(code: str | None, languages: list[dict[str, Any]] = LANGUAGES) -> str:
    """The language for a Home Assistant language code: an exact match of a pattern, else its main
    part (de-AT is de), else English. zh-Hant does not fall to zh-Hans.
    """
    full = str(code or "en").lower().replace("_", "-")
    for key in (full, full.split("-")[0]):
        for lang in languages:
            if key in lang["patterns"]:
                return str(lang["code"])
    return "en"


def language_of(hass: HomeAssistant) -> str:
    """The language Home Assistant speaks, as one of the languages of Housekeeper."""
    return match_language(hass.config.language)


def pick[T](hass: HomeAssistant, table: dict[str, T]) -> T:
    """The entry of the language of Home Assistant, else the English one.

    An entry that is a dict is completed from the English one, so a text still missing in a new
    language shows in English instead of failing.
    """
    code = language_of(hass)
    entry = table.get(code, table["en"])
    english = table["en"]
    if isinstance(entry, dict) and isinstance(english, dict) and not english.keys() <= entry.keys():
        return {**english, **entry}  # type: ignore[return-value]
    return entry


@cache
def _locale(code: str) -> dict[str, Any]:
    path = LOCALES / f"{code}.json"
    return json.loads(path.read_text(encoding="utf-8")) if path.is_file() else {}


def _like(template: Any, value: Any) -> Any:
    """The value in the shape of the English one: tuples where English has tuples, and no key English lacks."""
    if isinstance(template, dict) and isinstance(value, dict):
        return {key: _like(template[key], value[key]) for key in template if key in value}
    if isinstance(template, tuple) and isinstance(value, list) and len(template) == len(value):
        return tuple(_like(t, v) for t, v in zip(template, value, strict=True))
    return value


def localize(name: str, table: dict[str, Any]) -> dict[str, Any]:
    """Add the languages of `locales/<code>.json` to a text table; `name` is `module.TABLE`.

    German and English stay in the code. A language needs no entry: `pick` falls back to English.
    """
    for code in LANGUAGE_CODES:
        entry = _locale(code).get(name) if code not in ("de", "en") else None
        if entry is not None:
            table[code] = _like(table["en"], entry)
    return table
