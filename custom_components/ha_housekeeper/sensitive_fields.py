"""Which config entries hold credentials, of what kind, and whether a value is set.

Only the names of the fields are looked at and whether they are empty. No value is returned, and
nothing derived from one (no mask, no length, no part of it): the answer for a field is its kind
and a yes or no. The kind comes from the field name, so it is a hint: a credential under an
unusual name is not found, and a field named like one may hold something harmless.
"""

from __future__ import annotations

import re
from collections.abc import Mapping
from typing import Any

from homeassistant.core import HomeAssistant

SOURCES = ("data", "options")
MAX_DEPTH = 3  # nested mappings below a field (OAuth keeps the tokens in "token")

# Name parts that say a field is about a credential, not the credential itself.
NOT_A_VALUE = {"type", "expires", "expiry", "expire", "public", "implementation", "url", "name"}
KEY_PREFIXES = {"api", "app", "private", "secret", "access", "license", "licence", "auth"}


def kind_of(name: Any) -> str | None:
    """The kind of credential a field name stands for, or None."""
    parts = set(re.split(r"[^a-z0-9]+", str(name).lower())) - {""}
    if parts & NOT_A_VALUE:
        return None
    if parts & {"password", "passwd", "pwd", "passphrase", "psk"}:
        return "password"
    if "token" in parts:
        return "token"
    if "secret" in parts:
        return "secret"
    if "apikey" in parts or ("key" in parts and parts & KEY_PREFIXES):
        return "api_key"
    if "webhook" in parts:
        return "webhook"
    if "pin" in parts:
        return "pin"
    return None


def _is_set(value: Any) -> bool:
    return value not in (None, "", [], {}) and not isinstance(value, bool)


def fields_of(entry: Any) -> list[dict[str, Any]]:
    """The credential fields of a config entry: where, the field name, its kind and whether set."""
    found: list[dict[str, Any]] = []

    def walk(source: str, mapping: Mapping[str, Any], prefix: str, depth: int) -> None:
        for key, value in mapping.items():
            path = f"{prefix}{key}"
            if isinstance(value, Mapping):
                if depth < MAX_DEPTH:
                    walk(source, value, f"{path}.", depth + 1)
                continue
            kind = kind_of(key)
            if kind is None or isinstance(value, bool | list | tuple):
                continue
            found.append({"source": source, "key": path, "kind": kind, "set": _is_set(value)})

    for source in SOURCES:
        mapping = getattr(entry, source, None)
        if isinstance(mapping, Mapping):
            walk(source, mapping, "", 0)
    return found


def sensitive_fields(hass: HomeAssistant) -> dict[str, Any]:
    """Every config entry with credential fields: kind and set or empty, never a value."""
    rows = []
    for entry in hass.config_entries.async_entries():
        fields = fields_of(entry)
        if fields:
            rows.append(
                {
                    "entry_id": entry.entry_id,
                    "domain": entry.domain,
                    "title": entry.title,
                    "disabled": bool(entry.disabled_by),
                    "fields": fields,
                }
            )
    rows.sort(key=lambda r: (r["domain"], str(r["title"]).lower()))
    return {"entries": rows}
