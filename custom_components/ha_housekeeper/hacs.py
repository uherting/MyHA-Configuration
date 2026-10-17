"""What HACS knows about the custom integrations it installed: version, newest version, pending update.

HACS keeps its repository index in memory under ``hass.data["hacs"]``. That object is HACS's own and
has no public interface, so everything is read defensively: without HACS, or with a layout this code
does not know, the answer is ``None`` and the panel simply shows nothing about HACS. Nothing is
called that talks to GitHub, and nothing is changed.
"""

from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from homeassistant.core import HomeAssistant

HACS_KEY = "hacs"
FULL_NAME = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$")


def _text(value: Any) -> str | None:
    return str(value) if value not in (None, "") else None


def _date(value: Any) -> str | None:
    """Return a JSON-safe timestamp from the HACS repository data."""
    return value.isoformat() if isinstance(value, datetime) else None


def repository_info(repository: Any) -> tuple[str, dict[str, Any]] | None:
    """The domain and the details of one installed integration repository, else ``None``."""
    data = getattr(repository, "data", None)
    if data is None or getattr(data, "category", None) != "integration":
        return None
    domain = _text(getattr(data, "domain", None))
    if not domain or not getattr(data, "installed", False):
        return None
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
    full_name = _text(getattr(data, "full_name", None))
    return domain, {
        "id": _text(getattr(data, "id", None)),
        "full_name": full_name if full_name and FULL_NAME.match(full_name) else None,
        "installed_version": installed,
        "installed_kind": (
            "release" if installed_release else "commit" if installed_commit else None
        ),
        "available_version": available,
        "pending_update": pending,
        "last_fetched": _date(getattr(data, "last_fetched", None)),
        "archived": getattr(data, "archived", None) is True,
        "blocked": getattr(repository, "can_download", True) is False and pending,
    }


def hacs_by_domain(hass: HomeAssistant) -> dict[str, dict[str, Any]] | None:
    """Installed HACS integrations by domain; ``None`` when HACS is missing or cannot be read."""
    hacs = hass.data.get(HACS_KEY)
    if hacs is None:
        return None
    try:
        repositories = list(hacs.repositories.list_all)
    except Exception:  # noqa: BLE001 - a layout this code does not know is not an error of ours
        return None
    found: dict[str, dict[str, Any]] = {}
    for repository in repositories:
        try:
            info = repository_info(repository)
        except Exception:  # noqa: BLE001 - one odd repository must not hide the others
            continue
        if info:
            found[info[0]] = info[1]
    return found
