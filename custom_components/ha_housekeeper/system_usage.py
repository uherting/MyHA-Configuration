"""Storage and system: disk, memory, CPU and the largest consumers of space.

Read-only. Nothing is written, nothing is stored. The file system parts block and run in the
executor; the Supervisor parts (host disk, disk usage by category, apps) are only asked when
Home Assistant runs under a Supervisor and are skipped silently otherwise.

The panel translates the ids of the known places (``STORAGE_TARGETS``); labels of Supervisor
categories and app names are shown as the Supervisor sends them.
"""

from __future__ import annotations

import asyncio
import logging
import os
import re
import shutil
import time
from collections.abc import Coroutine, Iterable
from datetime import UTC, datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

SUPERVISOR_URL = "http://supervisor"
SUPERVISOR_TIMEOUT = 15  # seconds per request
DISK_USAGE_TIMEOUT = 45  # the usage walk over the data disk can take a while
CPU_SAMPLE_SECONDS = 0.4
# The walk over the folders and files is the costly part of the page. A result is reused for this
# long, and a real second walk waits at least the gap, however often the page is refreshed.
WALK_MAX_AGE = 300  # seconds
WALK_MIN_GAP = 30  # seconds
# One walk may take this long, all folders together. A slower one stops: the sizes read so far are
# shown as minimums, and the result is reused only for WALK_TRUNCATED_AGE seconds.
WALK_BUDGET = 20  # seconds
WALK_TRUNCATED_AGE = 60  # seconds
_WALK_KEY = f"{DOMAIN}_folder_walk"
_USAGE_KEY = f"{DOMAIN}_disk_usage"
GIB = 1024**3

# Known places under the configuration directory: (id, relative path, kind).
# kind: "db" sums the recorder database with its -wal and -shm files, "dir" a folder.
STORAGE_TARGETS: tuple[tuple[str, str, str], ...] = (
    ("recorder_db", "home-assistant_v2.db", "db"),
    ("backups", "backups", "dir"),
    ("custom_components", "custom_components", "dir"),
    ("media", "media", "dir"),
    ("www", "www", "dir"),
    ("image", "image", "dir"),
    ("tts", "tts", "dir"),
    ("blueprints", "blueprints", "dir"),
    ("themes", "themes", "dir"),
    ("deps", "deps", "dir"),
)


# --------------------------------------------------------------------------- sizes


class _Budget:
    """The time one folder walk may take; ``cut`` says the walk was stopped before it was done."""

    def __init__(self, seconds: float) -> None:
        self.deadline = time.monotonic() + seconds
        self.cut = False

    def spent(self) -> bool:
        if not self.cut and time.monotonic() > self.deadline:
            self.cut = True
        return self.cut


def path_size(path: str, budget: _Budget | None = None) -> int:
    """Size of a file or a folder in bytes; links are not followed, unreadable parts count 0.

    With a spent ``budget`` the walk stops and the size read so far is returned.
    """
    if not path or not os.path.exists(path):
        return 0
    if os.path.isfile(path):
        try:
            return os.path.getsize(path)
        except OSError:
            return 0
    total = 0
    for root, _dirs, files in os.walk(path, followlinks=False):
        if budget and budget.spent():
            break
        for name in files:
            file = os.path.join(root, name)
            try:
                if not os.path.islink(file):
                    total += os.path.getsize(file)
            except OSError:
                continue
    return total


def _inside(path: str, base: str) -> bool:
    real, root = os.path.realpath(path), os.path.realpath(base)
    return real == root or real.startswith(root + os.sep)


OTHER_LIMIT = 25  # the largest unlisted entries are named; the remainder is one line
_DB_PREFIX = (
    "home-assistant_v2.db"  # the database and its journal are counted with the known places
)


def other_entries(
    config_dir: str, budget: _Budget | None = None
) -> tuple[list[dict[str, Any]], dict[str, int]]:
    """Entries directly under the configuration directory that are not one of the known places.

    Returns the largest ones (name, kind, bytes) and the sum and count of the rest.
    """
    known = {rel for _target, rel, _kind in STORAGE_TARGETS}
    found: list[dict[str, Any]] = []
    try:
        for entry in os.scandir(config_dir):
            if entry.name in known or entry.name.startswith(_DB_PREFIX) or entry.is_symlink():
                continue
            if budget and budget.spent():
                break
            size = path_size(entry.path, budget)
            if size > 0:
                found.append({"name": entry.name, "dir": entry.is_dir(), "bytes": size})
    except OSError as err:
        _LOGGER.debug("The configuration directory cannot be read: %s", err)
    found.sort(key=lambda item: item["bytes"], reverse=True)
    tail = found[OTHER_LIMIT:]
    return found[:OTHER_LIMIT], {"count": len(tail), "bytes": sum(item["bytes"] for item in tail)}


def storage_breakdown(config_dir: str, budget: _Budget | None = None) -> dict[str, Any]:
    """The known places under the configuration directory and every custom integration."""
    items: list[dict[str, Any]] = []
    for target_id, rel, kind in STORAGE_TARGETS:
        if kind == "db":
            size = sum(
                path_size(os.path.join(config_dir, rel + suffix), budget)
                for suffix in ("", "-wal", "-shm")
            )
        else:
            size = path_size(os.path.join(config_dir, rel), budget)
        if size > 0:
            items.append({"id": target_id, "path": rel, "bytes": size})
    items.sort(key=lambda item: item["bytes"], reverse=True)

    custom: list[dict[str, Any]] = []
    folder = os.path.join(config_dir, "custom_components")
    if os.path.isdir(folder):
        try:
            for entry in os.scandir(folder):
                if entry.is_dir() and not entry.name.startswith(("__", ".")):
                    size = path_size(entry.path, budget)
                    if size > 0:
                        custom.append({"domain": entry.name, "bytes": size})
        except OSError as err:
            _LOGGER.debug("custom_components cannot be read: %s", err)
    custom.sort(key=lambda item: item["bytes"], reverse=True)
    other, rest = other_entries(config_dir, budget)
    return {"breakdown": items, "custom_integrations": custom, "other": other, "other_rest": rest}


def card_path(config_dir: str, url: str) -> str | None:
    """The local file of a dashboard resource URL, or None for an external or unknown one.

    ``/local/…`` is ``<config>/www/…``, ``/hacsfiles/…`` is ``<config>/www/community/…``. The
    file must lie inside the configuration directory.
    """
    clean = str(url or "").split("?", 1)[0].split("#", 1)[0]
    if clean.startswith("/local/"):
        rel = os.path.join("www", clean[len("/local/") :])
    elif clean.startswith("/hacsfiles/"):
        rel = os.path.join("www", "community", clean[len("/hacsfiles/") :])
    else:
        return None
    path = os.path.normpath(os.path.join(config_dir, rel))
    return os.path.realpath(path) if _inside(path, config_dir) else None


ELEMENT_NAME = re.compile(r"customElements\.define\(\s*[\"']([a-z][a-z0-9]*(?:-[a-z0-9]+)+)[\"']")
MAX_SCRIPT_BYTES = 2 * 1024 * 1024  # a larger file is not read; its card names stay unknown


def element_names(path: str) -> list[str]:
    """The custom element names a card script defines; empty when none can be read from it.

    Minified scripts often define their elements through variables, so an empty list means
    "unknown", never "defines nothing".
    """
    try:
        if os.path.getsize(path) > MAX_SCRIPT_BYTES:
            return []
        with open(path, encoding="utf-8", errors="ignore") as file:
            return sorted(set(ELEMENT_NAME.findall(file.read())))
    except OSError:
        return []


def card_status(card: dict[str, Any], used: set[str] | None) -> str:
    """``missing`` (local file gone), ``external``, ``unused``, ``used`` or ``unknown``.

    ``used`` holds the ``custom:`` card types of all dashboards, ``None`` when they are unknown.
    A script is ``unused`` only when its element names are known and no dashboard uses one.
    """
    if not card.get("local"):
        return "external"
    if not card.get("exists"):
        return "missing"
    names = card.get("elements") or []
    if used is None or not names:
        return "unknown"
    return "used" if used.intersection(names) else "unused"


def card_sizes(
    config_dir: str, urls: Iterable[str], budget: _Budget | None = None
) -> dict[str, dict[str, Any]]:
    """Size per resource URL: the folder of a card that has one under www (HACS), else the file."""
    www = os.path.realpath(os.path.join(config_dir, "www"))
    result: dict[str, dict[str, Any]] = {}
    for url in urls:
        path = card_path(config_dir, url)
        if not path or not os.path.exists(path):
            result[url] = {
                "bytes": None,
                "scope": None,
                "path": None,
                "local": path is not None,
                "exists": False,
                "elements": [],
            }
            continue
        extra = {
            "local": True,
            "exists": True,
            "elements": element_names(path) if path.endswith((".js", ".mjs")) else [],
        }
        parent = os.path.realpath(os.path.dirname(path))
        if os.path.isfile(path) and parent != www and parent.startswith(www + os.sep):
            result[url] = {
                "bytes": path_size(parent, budget),
                "scope": "folder",
                "path": parent,
                **extra,
            }
        else:
            result[url] = {"bytes": path_size(path, budget), "scope": "file", "path": path, **extra}
    return result


def blueprint_sizes(config_dir: str, specs: Iterable[tuple[str, str]]) -> list[int | None]:
    """Size of each blueprint file ``(domain, path)`` under ``<config>/blueprints``."""
    root = os.path.join(config_dir, "blueprints")
    sizes: list[int | None] = []
    for domain, path in specs:
        size = None
        for candidate in (os.path.join(root, domain, path), os.path.join(root, path)):
            if _inside(candidate, root) and os.path.isfile(candidate):
                size = path_size(candidate)
                break
        sizes.append(size)
    return sizes


# --------------------------------------------------------------------------- CPU, memory, disk


def _cpu_times() -> tuple[int, int] | None:
    try:
        with open("/proc/stat", encoding="utf-8") as file:
            for line in file:
                if line.startswith("cpu "):
                    parts = [int(x) for x in line.split()[1:]]
                    return sum(parts), parts[3] + (parts[4] if len(parts) > 4 else 0)
    except (OSError, ValueError, IndexError):
        return None
    return None


def cpu_percent(sample: float = CPU_SAMPLE_SECONDS) -> float | None:
    """CPU load in percent from two readings of /proc/stat; None where there is no /proc."""
    first = _cpu_times()
    if first is None:
        return None
    time.sleep(sample)
    second = _cpu_times()
    if second is None:
        return None
    total, idle = second[0] - first[0], second[1] - first[1]
    return round((1 - idle / total) * 100, 1) if total > 0 else None


def memory() -> dict[str, dict[str, Any]]:
    """RAM and swap from /proc/meminfo; empty parts where there is no /proc."""
    info: dict[str, int] = {}
    try:
        with open("/proc/meminfo", encoding="utf-8") as file:
            for line in file:
                key, _, rest = line.partition(":")
                value = rest.split()
                if value:
                    info[key.strip()] = int(value[0]) * 1024  # kB
    except (OSError, ValueError):
        return {"ram": {}, "swap": {}}

    def part(total: int, used: int) -> dict[str, Any]:
        return {
            "total": total,
            "used": used,
            "percent": round(used / total * 100, 1) if total else None,
        }

    total = info.get("MemTotal", 0)
    available = info.get("MemAvailable", info.get("MemFree", 0))
    swap_total = info.get("SwapTotal", 0)
    return {
        "ram": {**part(total, max(total - available, 0)), "available": available},
        "swap": part(swap_total, max(swap_total - info.get("SwapFree", 0), 0)),
    }


def disk_usage(path: str) -> dict[str, Any]:
    """Use of the file system the configuration directory lies on."""
    try:
        usage = shutil.disk_usage(path)
    except OSError as err:
        _LOGGER.debug("Disk usage cannot be read: %s", err)
        return {}
    return {
        "total": int(usage.total),
        "used": int(usage.used),
        "free": int(usage.free),
        "percent": round(usage.used / usage.total * 100, 1) if usage.total else None,
        "source": "filesystem",
    }


def _empty_storage() -> dict[str, Any]:
    return {
        "breakdown": [],
        "custom_integrations": [],
        "other": [],
        "other_rest": {"count": 0, "bytes": 0},
    }


def safe_storage_breakdown(config_dir: str, budget: _Budget | None = None) -> dict[str, Any]:
    """The folder walk; a failure leaves the lists empty instead of failing the page."""
    try:
        return storage_breakdown(config_dir, budget)
    except Exception as err:
        _LOGGER.warning("Storage breakdown failed: %s", err)
        return _empty_storage()


def collect_local(config_dir: str, storage: bool = True) -> dict[str, Any]:
    """Everything that is read from this machine's files (blocking; runs in the executor).

    ``storage=False`` leaves out the folder walk: the live values are read, the sizes come from
    the cached walk.
    """
    try:
        load = os.getloadavg()
        load_avg: dict[str, float] | None = {
            "1m": round(load[0], 2),
            "5m": round(load[1], 2),
            "15m": round(load[2], 2),
        }
    except (OSError, AttributeError):
        load_avg = None
    mem = memory()
    return {
        "cpu": {"percent": cpu_percent(), "count": os.cpu_count()},
        "load": load_avg,
        "ram": mem["ram"],
        "swap": mem["swap"],
        "disk": disk_usage(config_dir),
        "storage": safe_storage_breakdown(config_dir) if storage else None,
    }


# --------------------------------------------------------------------------- Supervisor


def supervisor_token() -> str | None:
    return os.environ.get("SUPERVISOR_TOKEN") or None


async def supervisor_get(
    hass: HomeAssistant,
    path: str,
    *,
    params: dict[str, Any] | None = None,
    timeout: int = SUPERVISOR_TIMEOUT,
) -> dict[str, Any] | None:
    """The ``data`` part of a Supervisor answer, or None when it does not answer."""
    token = supervisor_token()
    if not token:
        return None
    session = async_get_clientsession(hass)
    try:
        async with asyncio.timeout(timeout):
            async with session.get(
                f"{SUPERVISOR_URL}{path}",
                headers={"Authorization": f"Bearer {token}"},
                params=params,
            ) as resp:
                if resp.status != 200:
                    return None
                payload = await resp.json()
    except Exception as err:
        _LOGGER.debug("Supervisor %s cannot be read: %s", path, err)
        return None
    data = payload.get("data") if isinstance(payload, dict) else None
    return data if isinstance(data, dict) else None


def host_disk(info: dict[str, Any] | None) -> dict[str, Any]:
    """The data disk of the host from ``/host/info`` (sizes are in GiB there)."""
    if not info or info.get("disk_total") is None:
        return {}
    try:
        total = int(float(info["disk_total"]) * GIB)
        used = int(float(info["disk_used"]) * GIB) if info.get("disk_used") is not None else None
        free = int(float(info["disk_free"]) * GIB) if info.get("disk_free") is not None else None
    except (TypeError, ValueError):
        return {}
    return {
        "total": total,
        "used": used,
        "free": free,
        "percent": round(used / total * 100, 1) if used is not None and total else None,
        "source": "supervisor",
    }


def disk_categories(
    usage: dict[str, Any] | None,
) -> tuple[dict[str, Any], dict[str, dict[str, int]]]:
    """Disk use by category from ``/host/disks/default/usage`` and the size of each app's data.

    With ``max_depth=2`` the categories ``addons_data`` and ``addons_config`` list one child per
    app, named by its slug.
    """
    if not usage:
        return {}, {}
    app_sizes: dict[str, dict[str, int]] = {}
    children: list[dict[str, Any]] = []
    for child in usage.get("children") or []:
        if not isinstance(child, dict) or child.get("used_bytes") is None:
            continue
        kind = {"addons_data": "data", "addons_config": "config"}.get(child.get("id", ""))
        if kind:
            for sub in child.get("children") or []:
                if isinstance(sub, dict) and sub.get("id") and sub.get("used_bytes") is not None:
                    app_sizes.setdefault(str(sub["id"]), {})[kind] = int(sub["used_bytes"])
        children.append(
            {
                "id": str(child.get("id", "")),
                "label": str(child.get("label") or child.get("id") or ""),
                "bytes": int(child["used_bytes"]),
            }
        )
    if not children and usage.get("used_bytes") is None:
        return {}, app_sizes
    children.sort(key=lambda child: child["bytes"], reverse=True)
    return {
        "total": usage.get("total_bytes"),
        "used": usage.get("used_bytes"),
        "children": children,
    }, app_sizes


async def _apps(hass: HomeAssistant, sizes: dict[str, dict[str, int]]) -> list[dict[str, Any]]:
    """Installed apps (add-ons) with CPU and memory while running and the size of their data."""
    listing = await supervisor_get(hass, "/addons")
    if not listing:
        return []
    apps = [a for a in listing.get("addons") or [] if isinstance(a, dict) and a.get("slug")]

    async def one(app: dict[str, Any]) -> dict[str, Any]:
        slug = str(app["slug"])
        running = app.get("state") == "started"
        stats = await supervisor_get(hass, f"/addons/{slug}/stats") if running else None
        size = sizes.get(slug) or {}
        stats = stats or {}
        return {
            "slug": slug,
            "name": str(app.get("name") or slug),
            "state": app.get("state"),
            "cpu_percent": stats.get("cpu_percent"),
            "memory_usage": stats.get("memory_usage"),
            "memory_limit": stats.get("memory_limit"),
            "data_bytes": size.get("data"),
            "config_bytes": size.get("config"),
            "size_bytes": (size.get("data") or 0) + (size.get("config") or 0) if size else None,
        }

    result = await asyncio.gather(*(one(app) for app in apps))
    return sorted(result, key=lambda app: app["name"].lower())


async def _disk_usage(
    hass: HomeAssistant, fresh: bool, quick: bool = False
) -> tuple[dict[str, Any] | None, bool]:
    """Disk use by category and whether it is older than it may be; the Supervisor walks the
    whole data disk for it.

    Reused like the folder walk: for WALK_MAX_AGE seconds, and ``fresh`` asks again only after
    WALK_MIN_GAP. ``quick`` hands out any kept answer at once, however old. An answer that failed
    is not kept, so the next visit asks again.
    """
    kept = hass.data.setdefault(_USAGE_KEY, _Walk())
    if quick and kept.result is not None:
        return kept.result, time.monotonic() - kept.at >= WALK_MAX_AGE
    if quick:
        # Nothing kept yet (the first visit after a start): the Supervisor's walk runs behind the page.
        kept.start(hass, _disk_usage(hass, False))
        return None, True
    async with kept.lock:
        age = time.monotonic() - kept.at
        if kept.result is not None and (age < WALK_MIN_GAP or (not fresh and age < WALK_MAX_AGE)):
            return kept.result, False
        usage = await supervisor_get(
            hass, "/host/disks/default/usage", params={"max_depth": 2}, timeout=DISK_USAGE_TIMEOUT
        )
        if usage is not None and not usage.get("children"):
            usage = await supervisor_get(hass, "/host/disks/default/usage") or usage
        if usage is not None:
            kept.result, kept.at = usage, time.monotonic()
        return usage, False


async def supervisor_part(
    hass: HomeAssistant, fresh: bool = False, quick: bool = False
) -> dict[str, Any]:
    """Host disk, disk use by category and apps; empty without a Supervisor."""
    if not supervisor_token():
        return {"available": False}
    info, (usage, stale) = await asyncio.gather(
        supervisor_get(hass, "/host/info"), _disk_usage(hass, fresh, quick)
    )
    categories, sizes = disk_categories(usage)
    return {
        "available": True,
        "stale": stale,
        "disk": host_disk(info),
        "categories": categories,
        "apps": await _apps(hass, sizes),
    }


# --------------------------------------------------------------------------- dashboard resources, blueprints


async def dashboard_resources(hass: HomeAssistant) -> list[dict[str, Any]]:
    """The dashboard resources (custom cards): id, type and URL."""
    lovelace = hass.data.get("lovelace")
    resources = getattr(lovelace, "resources", None)
    if resources is None and isinstance(lovelace, dict):
        resources = lovelace.get("resources")
    if resources is None:
        return []
    try:
        if hasattr(resources, "async_get_info"):
            await resources.async_get_info()
        items = resources.async_items() or []
    except Exception as err:
        _LOGGER.debug("Dashboard resources cannot be read: %s", err)
        return []
    return [
        {
            "id": str(item.get("id", "")),
            "type": str(item.get("type", "")),
            "url": str(item.get("url", "")),
        }
        for item in items
        if isinstance(item, dict)
    ]


async def blueprint_list(hass: HomeAssistant) -> list[dict[str, Any]]:
    """Every blueprint the blueprint integration knows: domain, path, name and author."""
    found: list[dict[str, Any]] = []
    for domain, domain_blueprints in list((hass.data.get("blueprint") or {}).items()):
        try:
            results = await domain_blueprints.async_get_blueprints()
        except Exception as err:
            _LOGGER.debug("Blueprints of %s cannot be read: %s", domain, err)
            continue
        for path, blueprint in results.items():
            metadata = getattr(blueprint, "metadata", None)
            if not isinstance(metadata, dict):
                continue  # a blueprint that failed to load
            found.append(
                {
                    "domain": str(domain),
                    "path": str(path),
                    "name": str(metadata.get("name") or path),
                    "author": metadata.get("author") or None,
                }
            )
    return found


# --------------------------------------------------------------------------- assembly


def merge_cards(
    breakdown: list[dict[str, Any]], cards: list[dict[str, Any]], config_dir: str
) -> int:
    """Count each measured card once and take its share out of "www", so nothing counts twice.

    Adds a ``custom_cards`` entry to ``breakdown`` and returns the total size of the cards.
    """
    www = os.path.realpath(os.path.join(config_dir, "www"))
    seen: set[str] = set()
    total = www_part = 0
    for card in cards:
        size, path = card.get("bytes"), card.get("path")
        if size and path and path not in seen:
            seen.add(path)
            total += size
            if path == www or path.startswith(www + os.sep):
                www_part += size
    if total:
        for item in breakdown:
            if item["id"] == "www":
                item["bytes"] = max(0, item["bytes"] - www_part)
        breakdown[:] = [item for item in breakdown if item["bytes"] > 0]
        breakdown.append({"id": "custom_cards", "path": "www", "bytes": total})
        breakdown.sort(key=lambda item: item["bytes"], reverse=True)
    return total


class _Walk:
    """A kept slow result (the folder walk, the disk usage) and the lock that lets a second caller reuse it."""

    def __init__(self) -> None:
        self.lock = asyncio.Lock()
        self.result: dict[str, Any] | None = None
        self.signature: tuple[Any, ...] | None = None
        self.at = 0.0
        self.task: asyncio.Task[Any] | None = None

    def start(self, hass: HomeAssistant, work: Coroutine[Any, Any, Any]) -> None:
        """Run ``work`` in the background unless an earlier one is still running."""
        if self.task is not None and not self.task.done():
            work.close()
            return
        self.task = hass.async_create_task(work)


async def _folder_walk(
    hass: HomeAssistant,
    config_dir: str,
    resources: list[dict[str, Any]],
    blueprints: list[dict[str, Any]],
    fresh: bool,
    quick: bool = False,
) -> dict[str, Any]:
    """The sizes from the folders, reused for WALK_MAX_AGE seconds and never walked twice at once.

    ``fresh`` asks for a new walk, which is still refused inside WALK_MIN_GAP seconds of the last
    one. A second page, a second browser or a pressed button then costs no disk reads. ``quick``
    hands out the last walk at once, however old or running again; ``stale`` then says it is due.
    """
    walk = hass.data.setdefault(_WALK_KEY, _Walk())
    signature = (
        tuple(item["url"] for item in resources),
        tuple((item["domain"], item["path"]) for item in blueprints),
    )
    if quick and walk.result is not None:
        max_age = WALK_TRUNCATED_AGE if walk.result.get("truncated") else WALK_MAX_AGE
        stale = walk.signature != signature or time.monotonic() - walk.at >= max_age
        return {**walk.result, "cached": True, "stale": stale}
    if quick:
        # Nothing kept yet (the first visit after a start): the page gets the live values at once.
        walk.start(hass, _folder_walk(hass, config_dir, resources, blueprints, False))
        return {
            "storage": _empty_storage(),
            "sizes": {},
            "bp_sizes": [None] * len(blueprints),
            "read_at": None,
            "read_seconds": None,
            "truncated": False,
            "cached": False,
            "stale": True,
            "pending": True,
        }
    async with walk.lock:
        age = time.monotonic() - walk.at
        max_age = WALK_TRUNCATED_AGE if (walk.result or {}).get("truncated") else WALK_MAX_AGE
        if (
            walk.result is not None
            and walk.signature == signature
            and (age < WALK_MIN_GAP or (not fresh and age < max_age))
        ):
            return {**walk.result, "cached": True, "stale": False}
        began = time.monotonic()
        budget = _Budget(WALK_BUDGET)
        storage, sizes, bp_sizes = await asyncio.gather(
            hass.async_add_executor_job(safe_storage_breakdown, config_dir, budget),
            hass.async_add_executor_job(
                card_sizes, config_dir, [r["url"] for r in resources], budget
            ),
            hass.async_add_executor_job(
                blueprint_sizes, config_dir, [(b["domain"], b["path"]) for b in blueprints]
            ),
        )
        walk.result = {
            "storage": storage,
            "sizes": sizes,
            "bp_sizes": bp_sizes,
            "read_at": datetime.now(UTC).isoformat(),
            "read_seconds": round(time.monotonic() - began, 2),
            "truncated": budget.cut,
        }
        walk.signature, walk.at = signature, time.monotonic()
        return {**walk.result, "cached": False, "stale": False}


async def system_usage(
    hass: HomeAssistant,
    used_card_types: set[str] | None = None,
    fresh: bool = False,
    quick: bool = False,
) -> dict[str, Any]:
    """Storage and system: everything the "Storage & system" page shows.

    ``used_card_types`` are the ``custom:`` card types of all dashboards (``None`` when unknown).
    The live values (CPU, memory, disk, apps) are read every time; the folder sizes and the disk
    use by category are reused for a few minutes (see ``_folder_walk`` and ``_disk_usage``).
    ``quick`` (a page being opened) takes them as kept, however old, and says with ``stale`` that
    the page should ask once more for new ones.
    """
    config_dir = hass.config.config_dir

    async def walked_part() -> tuple[list[dict[str, Any]], list[dict[str, Any]], dict[str, Any]]:
        # The walk needs only the resources and blueprints, so it runs beside the Supervisor part.
        resources, blueprints = await asyncio.gather(
            dashboard_resources(hass), blueprint_list(hass)
        )
        return (
            resources,
            blueprints,
            await _folder_walk(hass, config_dir, resources, blueprints, fresh, quick),
        )

    local, supervisor, (resources, blueprints, walked) = await asyncio.gather(
        hass.async_add_executor_job(collect_local, config_dir, False),
        supervisor_part(hass, fresh, quick),
        walked_part(),
    )
    sizes, bp_sizes = walked["sizes"], walked["bp_sizes"]
    cards = []
    for resource in resources:
        size = sizes.get(resource["url"]) or {}
        cards.append(
            {
                **resource,
                "bytes": size.get("bytes"),
                "scope": size.get("scope"),
                "path": size.get("path"),
                "local": size.get("local", False),
                "exists": size.get("exists", False),
                "elements": size.get("elements", []),
            }
        )
    for blueprint, size in zip(blueprints, bp_sizes, strict=True):
        blueprint["bytes"] = size

    storage = walked["storage"]
    cards_total = merge_cards(storage["breakdown"], cards, config_dir)
    # The host's data disk says more than the container's file system where a Supervisor runs.
    disk = supervisor.get("disk") or local["disk"]
    apps = supervisor.get("apps") or []
    return {
        "supervisor": bool(supervisor.get("available")),
        "cpu": local["cpu"],
        "load": local["load"],
        "ram": local["ram"],
        "swap": local["swap"],
        "disk": disk,
        "categories": supervisor.get("categories") or {},
        "breakdown": storage["breakdown"],
        "custom_integrations": storage["custom_integrations"],
        "other": storage["other"],
        "other_rest": storage["other_rest"],
        "apps": apps,
        "apps_memory": sum(app.get("memory_usage") or 0 for app in apps),
        # Paths are relative to the configuration directory; the absolute path stays on the server.
        "cards": [
            {
                **{k: v for k, v in card.items() if k not in ("path", "local", "exists")},
                "status": card_status(card, used_card_types),
            }
            for card in cards
        ],
        "cards_total": cards_total,
        "blueprints": blueprints,
        # When the sizes were read, how long that took and whether this answer reused an earlier walk.
        "read_at": walked["read_at"],
        "read_seconds": walked["read_seconds"],
        "cached": walked["cached"],
        # True when the walk hit its time limit: every size is then a minimum, some may be missing.
        "truncated": walked["truncated"],
        # True when an old result was handed out at once (``quick``): the page asks again.
        "stale": walked["stale"] or bool(supervisor.get("stale")),
        # True when nothing was read yet and the first read runs behind this answer.
        "pending": bool(walked.get("pending")),
    }


async def system_light(hass: HomeAssistant) -> dict[str, Any]:
    """Disk, memory and CPU only, for the overview; no folder is walked (system_usage does that)."""
    config_dir = hass.config.config_dir

    def local() -> dict[str, Any]:
        mem = memory()
        return {
            "cpu": cpu_percent(),
            "ram": mem["ram"],
            "swap": mem["swap"],
            "disk": disk_usage(config_dir),
        }

    read, info = await asyncio.gather(
        hass.async_add_executor_job(local), supervisor_get(hass, "/host/info")
    )
    # The host's data disk says more than the container's file system where a Supervisor runs.
    return {
        "disk": host_disk(info) or read["disk"],
        "ram": read["ram"],
        "swap": read["swap"],
        "cpu": {"percent": read["cpu"]},
    }
