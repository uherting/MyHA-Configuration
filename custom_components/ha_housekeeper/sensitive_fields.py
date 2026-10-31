"""Which config entries hold credentials, of what kind, and whether a value is set; the accounts.

Only the names of the fields are looked at and whether they are empty. No value is returned, and
nothing derived from one (no mask, no length, no part of it): the answer for a field is its kind
and a yes or no. The kind comes from the field name, so it is a hint: a credential under an
unusual name is not found, and a field named like one may hold something harmless.

The accounts are the people of this Home Assistant: role, two-factor login and last login. Only
names, dates and the kind of a token are read: never a token value, never an address.
"""

from __future__ import annotations

import re
from collections.abc import Mapping
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .policy_rules import ACCOUNT_DAYS, user_inactive

SOURCES = ("data", "options")
MAX_DEPTH = 3  # nested mappings below a field (OAuth keeps the tokens in "token")

# Name parts that say a field is about a credential, not the credential itself.
NOT_A_VALUE = {
    "type",
    "expires",
    "expiry",
    "expire",
    "public",
    "implementation",
    "url",
    "name",
    "timeout",
    "interval",
    "length",
    "digits",
}
KEY_PREFIXES = {"api", "app", "private", "secret", "access", "license", "licence", "auth"}


def kind_of(name: Any) -> str | None:
    """The kind of credential a field name stands for, or None."""
    parts = set(re.split(r"[^a-z0-9]+", str(name).lower())) - {""}
    if parts & NOT_A_VALUE:
        return None
    if parts & {"password", "passwd", "pwd", "passphrase", "psk", "pass", "passcode"}:
        return "password"
    if "token" in parts or "cookie" in parts or ("session" in parts and parts & {"id", "key"}):
        return "token"
    if parts & {"secret", "otp", "totp"}:
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


def reauth_entry_ids(hass: HomeAssistant) -> set[str]:
    """The config entries that wait for a new login (a running reauth flow)."""
    return {
        flow["context"].get("entry_id")
        for flow in hass.config_entries.flow.async_progress()
        if flow["context"].get("source") == "reauth"
    }


async def account_facts(hass: HomeAssistant) -> list[dict[str, Any]]:
    """The people of this Home Assistant with their tokens; accounts the system made for itself
    (Supervisor, add-ons) are left out. The account rules read the same facts."""
    facts = []
    for user in await hass.auth.async_get_users():
        if user.system_generated:
            continue
        tokens = list(user.refresh_tokens.values())
        logins = [t for t in tokens if t.token_type == "normal"]
        facts.append(
            {
                "id": user.id,
                "name": user.name or "?",
                "active": user.is_active,
                "owner": user.is_owner,
                "admin": user.is_admin,
                "local_only": user.local_only,
                "mfa": bool(await hass.auth.async_get_enabled_mfa(user)),
                "tokens": [
                    {"name": t.client_name or "?", "created": t.created_at}
                    for t in tokens
                    if t.token_type == "long_lived_access_token"
                ],
                "logins": bool(logins),
                "last_login": max((t.last_used_at or t.created_at for t in logins), default=None),
            }
        )
    return facts


def accounts(facts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """The accounts as the credentials page shows them; ``inactive`` as the account rule says."""
    inactive = {item["object_id"] for item in user_inactive({"users": facts}, dt_util.utcnow())}
    return [
        {
            "id": user["id"],
            "name": user["name"],
            "active": user["active"],
            "owner": user["owner"],
            "admin": user["admin"],
            "local_only": user["local_only"],
            "mfa": user["mfa"],
            "logins": user["logins"],
            "last_login": user["last_login"].isoformat() if user["last_login"] else None,
            "inactive": user["id"] in inactive,
            "token_count": len(user["tokens"]),
        }
        for user in sorted(facts, key=lambda u: str(u["name"]).lower())
    ]


def long_lived_tokens(facts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Every long-lived token by name, account and age. Home Assistant does not record when one is
    used, so the age is all there is; ``old`` from ACCOUNT_DAYS on, as the token rule says."""
    now = dt_util.utcnow()
    rows = []
    for user in facts:
        for token in user["tokens"]:
            days = max(0, (now - token["created"]).days)
            rows.append(
                {
                    "name": token["name"],
                    "account": user["name"],
                    "account_active": user["active"],
                    "created": token["created"].isoformat(),
                    "days": days,
                    "old": days >= ACCOUNT_DAYS,
                }
            )
    return sorted(rows, key=lambda row: -row["days"])


async def sensitive_fields(hass: HomeAssistant) -> dict[str, Any]:
    """Every config entry with credential fields (kind and set or empty, never a value) and the
    accounts."""
    rows = []
    reauth = reauth_entry_ids(hass)
    for entry in hass.config_entries.async_entries():
        fields = fields_of(entry)
        # One that waits for a new login is listed even when no field name gave it away.
        if fields or entry.entry_id in reauth:
            rows.append(
                {
                    "entry_id": entry.entry_id,
                    "domain": entry.domain,
                    "title": entry.title,
                    "disabled": bool(entry.disabled_by),
                    "reauth": entry.entry_id in reauth,
                    "fields": fields,
                }
            )
    rows.sort(key=lambda r: (r["domain"], str(r["title"]).lower()))
    try:
        facts = await account_facts(hass)
    except Exception:  # noqa: BLE001 - no readable accounts, the integrations still show
        facts = None
    return {
        "entries": rows,
        "accounts": None if facts is None else accounts(facts),
        "tokens": None if facts is None else long_lived_tokens(facts),
    }
