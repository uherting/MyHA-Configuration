"""What HACS knows about the custom integrations it installed: version, newest version, pending update.

HACS keeps its repository index in memory under ``hass.data["hacs"]``; from Home Assistant 2026.11 the
built-in Marketplace holds it in the ``runtime_data`` of its config entry. That object is not public,
so everything is read defensively: without HACS or Marketplace, or with a layout this code does not
know, the answer is ``None`` and the panel simply shows nothing about HACS. Nothing is
called that talks to GitHub, and nothing is changed.
"""

from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from homeassistant.core import HomeAssistant

HACS_KEY = "hacs"
MARKETPLACE_KEY = "marketplace"
ISSUE_DOMAINS = (HACS_KEY, MARKETPLACE_KEY)
FULL_NAME = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$")


def _text(value: Any) -> str | None:
    return str(value) if value not in (None, "") else None


def _date(value: Any) -> str | None:
    """Return a JSON-safe timestamp from the HACS repository data."""
    return value.isoformat() if isinstance(value, datetime) else None


def _versions(repository: Any, data: Any) -> dict[str, Any]:
    """The installed and the newest version of one repository and whether an update is pending."""
    installed_release = _text(getattr(data, "installed_version", None))
    installed_commit = _text(getattr(data, "installed_commit", None))
    installed = _text(
        getattr(repository, "display_installed_version", None)
        or installed_release
        or installed_commit
    )
    available = _text(
        getattr(repository, "display_available_version", None)
        or getattr(data, "last_version", None)
    )
    pending = getattr(repository, "pending_update", None)
    if not isinstance(pending, bool):
        pending = bool(installed and available and installed != available)
    return {
        "installed_version": installed,
        "installed_kind": (
            "release" if installed_release else "commit" if installed_commit else None
        ),
        "available_version": available,
        "pending_update": pending,
    }


def removed_issues(hass: HomeAssistant) -> dict[str, dict[str, Any]]:
    """The repairs HACS raises for a repository it took out of its list, by repository id.

    HACS files them as ``removed_<id>`` with the reason as a placeholder. Read from the issue
    registry, which is Home Assistant's own; ``ignored`` is the choice made on the repair.
    """
    try:
        from homeassistant.helpers import issue_registry as ir

        issues = dict(ir.async_get(hass).issues)
    except Exception:  # noqa: BLE001 - no registry (or another layout): nothing is known
        return {}
    found: dict[str, dict[str, Any]] = {}
    for (domain, issue_id), issue in issues.items():
        if domain not in ISSUE_DOMAINS or not str(issue_id).startswith("removed_"):
            continue
        placeholders = getattr(issue, "translation_placeholders", None) or {}
        found[str(issue_id).removeprefix("removed_")] = {
            "name": _text(placeholders.get("name")),
            "reason": _text(placeholders.get("reason")),
            "ignored": getattr(issue, "dismissed_version", None) is not None,
        }
    return found


def repository_info(
    repository: Any, removed: dict[str, dict[str, Any]] | None = None
) -> tuple[str, dict[str, Any]] | None:
    """The domain and the details of one installed integration repository, else ``None``."""
    data = getattr(repository, "data", None)
    if data is None or getattr(data, "category", None) != "integration":
        return None
    domain = _text(getattr(data, "domain", None))
    if not domain or not getattr(data, "installed", False):
        return None
    versions = _versions(repository, data)
    full_name = _text(getattr(data, "full_name", None))
    repo_id = _text(getattr(data, "id", None))
    return domain, {
        "id": repo_id,
        "full_name": full_name if full_name and FULL_NAME.match(full_name) else None,
        **versions,
        "last_fetched": _date(getattr(data, "last_fetched", None)),
        "archived": getattr(data, "archived", None) is True,
        "blocked": getattr(repository, "can_download", True) is False
        and versions["pending_update"],
        "removed": (removed or {}).get(repo_id or ""),
    }


def repository_row(repository: Any, removed: dict[str, dict[str, Any]]) -> dict[str, Any] | None:
    """One installed repository of any kind (integration, card, theme, ...), else ``None``."""
    data = getattr(repository, "data", None)
    if data is None or not getattr(data, "installed", False):
        return None
    full_name = _text(getattr(data, "full_name", None))
    repo_id = _text(getattr(data, "id", None))
    if not repo_id or not full_name or not FULL_NAME.match(full_name):
        return None
    return {
        "id": repo_id,
        "name": _text(getattr(repository, "display_name", None) or getattr(data, "name", None))
        or full_name,
        "full_name": full_name,
        "category": _text(getattr(data, "category", None)),
        "domain": _text(getattr(data, "domain", None)),
        **_versions(repository, data),
        "archived": getattr(data, "archived", None) is True,
        "removed": removed.get(repo_id),
    }


def _repositories(hass: HomeAssistant) -> list[Any] | None:
    """The repositories of HACS or of the Marketplace; ``None`` when neither is there or readable."""
    try:
        hacs = hass.data.get(HACS_KEY)
        if hacs is not None:
            return list(hacs.repositories.list_all)
        for entry in hass.config_entries.async_entries(MARKETPLACE_KEY):
            manager = getattr(entry, "runtime_data", None)
            if manager is not None:
                return list(manager.repositories.list_installed)
    except Exception:  # noqa: BLE001 - a layout this code does not know is not an error of ours
        return None
    return None


def store_kind(hass: HomeAssistant) -> str | None:
    """Which store the repositories come from: ``hacs``, ``marketplace`` (from 2026.11) or ``None``."""
    try:
        if hass.data.get(HACS_KEY) is not None:
            return HACS_KEY
        if hass.config_entries.async_entries(MARKETPLACE_KEY):
            return MARKETPLACE_KEY
    except Exception:  # noqa: BLE001 - a layout this code does not know is not an error of ours
        return None
    return None


def hacs_by_domain(hass: HomeAssistant) -> dict[str, dict[str, Any]] | None:
    """Installed HACS integrations by domain; ``None`` when HACS and Marketplace are missing or cannot be read."""
    repositories = _repositories(hass)
    if repositories is None:
        return None
    found: dict[str, dict[str, Any]] = {}
    removed = removed_issues(hass)
    for repository in repositories:
        try:
            info = repository_info(repository, removed)
        except Exception:  # noqa: BLE001 - one odd repository must not hide the others
            continue
        if info:
            found[info[0]] = info[1]
    return found


def hacs_repositories(hass: HomeAssistant) -> list[dict[str, Any]] | None:
    """Every installed HACS repository; ``None`` when HACS is missing or cannot be read."""
    repositories = _repositories(hass)
    if repositories is None:
        return None
    removed = removed_issues(hass)
    rows = []
    for repository in repositories:
        try:
            row = repository_row(repository, removed)
        except Exception:  # noqa: BLE001 - one odd repository must not hide the others
            continue
        if row:
            rows.append(row)
    return sorted(rows, key=lambda r: (r["name"].lower(), r["id"]))


def blocked_repository_ids(hass: HomeAssistant) -> set[str]:
    """Ids of the installed repositories whose pending update HACS cannot install; empty without HACS."""
    repositories = _repositories(hass)
    if repositories is None:
        return set()
    found = set()
    for repository in repositories:
        try:
            data = repository.data
            if (
                getattr(data, "installed", False)
                and getattr(repository, "can_download", True) is False
                and _versions(repository, data)["pending_update"]
                and (repo_id := _text(getattr(data, "id", None)))
            ):
                found.add(repo_id)
        except Exception:  # noqa: BLE001 - one odd repository must not hide the others
            continue
    return found
