"""System access and data flow of the integrations, and the rights of the apps.

Read-only. The classification goes by the integration's domain and its IoT class, so it is a
hint, not a proof: an integration may do less (or more) than its kind suggests. No credential
is read here.
"""

from __future__ import annotations

import asyncio
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from .system_usage import supervisor_get, supervisor_token

# Domain tokens and what they reach: (access kind, detail). The detail is a product or vendor name
# and is shown as it is; the kind is translated by the panel. A token matches the whole domain or
# one part of it between underscores ("alexa" matches "alexa_media", not "metalexa").
SYSTEM_ACCESS: dict[str, tuple[str, str | None]] = {
    "hassio": ("system_root", "Supervisor"),
    "supervisor": ("system_root", "Supervisor"),
    "samba": ("system_root", "Samba"),
    "ssh": ("system_root", "SSH"),
    "shell_command": ("shell", None),
    "command_line": ("shell", None),
    "zwave_js": ("radio", "Z-Wave"),
    "zwave": ("radio", "Z-Wave"),
    "zha": ("radio", "Zigbee"),
    "deconz": ("radio", "ConBee"),
    "bluetooth": ("radio", "Bluetooth"),
    "otbr": ("radio", "Thread"),
    "thread": ("radio", "Thread"),
    "usb": ("hardware", "USB"),
    "serial": ("hardware", "Serial"),
    "gpio": ("hardware", "GPIO"),
    "mqtt": ("network", "MQTT"),
    "network": ("network", None),
    "recorder": ("database", None),
    "influxdb": ("database", "InfluxDB"),
    "sql": ("database", "SQL"),
    "camera": ("camera", None),
    "ffmpeg": ("camera", "FFmpeg"),
    "stream": ("camera", None),
    "ring": ("camera", "Ring"),
    "reolink": ("camera", "Reolink"),
    "onvif": ("camera", "ONVIF"),
    "go2rtc": ("camera", "go2rtc"),
    "frigate": ("camera", "Frigate"),
    "unifiprotect": ("camera", "UniFi Protect"),
    "geo_location": ("location", None),
    "device_tracker": ("location", None),
    "mobile_app": ("location", "Companion App"),
    "gps": ("location", None),
    "google_maps": ("location", "Google"),
    "life360": ("location", "Life360"),
    "owntracks": ("location", "OwnTracks"),
    "nominatim": ("geocoding", None),
    "openweathermap": ("weather", "OpenWeatherMap"),
    "met": ("weather", "Met.no"),
    "google_assistant": ("cloud_api", "Google"),
    "google": ("cloud_api", "Google"),
    "nest": ("cloud_api", "Google Nest"),
    "alexa": ("cloud_api", "Amazon"),
    "amazon": ("cloud_api", "Amazon"),
    "ifttt": ("cloud_api", "IFTTT"),
    "twilio": ("cloud_api", "Twilio"),
    "pushover": ("cloud_api", "Pushover"),
    "pushbullet": ("cloud_api", "Pushbullet"),
    "telegram": ("cloud_api", "Telegram"),
    "openai": ("cloud_api", "OpenAI"),
    "anthropic": ("cloud_api", "Anthropic"),
    "google_generative": ("cloud_api", "Google AI"),
    "aws": ("cloud_api", "AWS"),
    "cloud": ("cloud", "Nabu Casa"),
    "spotify": ("cloud", "Spotify"),
    "sonos": ("network", "Sonos"),
    "cast": ("network", "Cast"),
    "matter": ("network", "Matter"),
    "esphome": ("network", "ESPHome"),
    "homekit": ("network", "HomeKit"),
    "emulated_hue": ("network", "Emulated Hue"),
}

# Tokens that are common words in other domains: they only match a domain of that exact name.
EXACT_ONLY = frozenset({"cloud", "met", "network", "stream", "camera", "gps", "sql", "serial"})

# Access kinds that reach the system itself or its radios: they make an integration "high".
SYSTEM_KINDS = frozenset({"system_root", "shell", "radio"})

# Where the data of an integration goes, by domain token.
DATAFLOW: dict[str, frozenset[str]] = {
    "hassio": frozenset({"local", "system"}),
    "supervisor": frozenset({"local", "system"}),
    "recorder": frozenset({"local", "database"}),
    "influxdb": frozenset({"local", "database", "external"}),
    "sql": frozenset({"local", "database"}),
    "google_assistant": frozenset({"external", "cloud"}),
    "google": frozenset({"external", "cloud"}),
    "nest": frozenset({"external", "cloud"}),
    "alexa": frozenset({"external", "cloud"}),
    "ifttt": frozenset({"external", "cloud"}),
    "twilio": frozenset({"external", "phone"}),
    "pushover": frozenset({"external", "push"}),
    "telegram": frozenset({"external", "push"}),
    "openai": frozenset({"external", "cloud"}),
    "anthropic": frozenset({"external", "cloud"}),
    "aws": frozenset({"external", "cloud"}),
    "cloud": frozenset({"external", "cloud"}),
    "spotify": frozenset({"external", "network"}),
    "sonos": frozenset({"external", "network", "local"}),
    "mqtt": frozenset({"local", "network"}),
    "camera": frozenset({"local", "storage"}),
    "mobile_app": frozenset({"local", "external", "gps"}),
    "google_maps": frozenset({"external", "gps", "cloud"}),
    "life360": frozenset({"external", "gps", "cloud"}),
    "owntracks": frozenset({"local", "gps"}),
    "nominatim": frozenset({"external", "gps"}),
    "ollama": frozenset({"local"}),  # the model runs in the house
    "llama_cpp": frozenset({"local"}),
}

RISK_ORDER = {"high": 0, "medium": 1, "low": 2}

# Where a device tracker gets its position from (its ``source_type``). Only "gps" is a location;
# a router or Bluetooth tracker only tells whether a device is at home.
PRESENCE_SOURCES = frozenset({"router", "bluetooth", "bluetooth_le"})


def matches(domain: str, token: str) -> bool:
    """Whether ``token`` is the domain or a part of it between underscores.

    Generic words only match the whole domain: "cloud" is Nabu Casa, "tuya_cloud" is not.
    """
    if domain == token:
        return True
    if token in EXACT_ONLY:
        return False
    return f"_{token}_" in f"_{domain}_"


def classify(
    domain: str,
    iot_class: str | None,
    entity_domains: set[str],
    trackers: set[str] | None = None,
    custom: bool = False,
) -> dict[str, Any]:
    """System access, data flow, external reach and a risk level for one integration.

    ``trackers`` are the sources of its device trackers ("gps", "router", ... or "unknown" for one
    without a readable state). Without them every tracker counts as a location, as does one whose
    source is unknown: a doubt never lowers the level. ``custom`` is an integration that is not
    part of Home Assistant (HACS or custom_components): its code runs with all the rights of Home
    Assistant itself, so it is at least "medium".
    """
    access: list[dict[str, Any]] = []
    for token, (kind, detail) in SYSTEM_ACCESS.items():
        item = {"kind": kind, "detail": detail}
        if matches(domain, token) and item not in access:
            access.append(item)
    if custom:
        access.append({"kind": "custom_code", "detail": None})
    flows: set[str] = set()
    for token, tags in DATAFLOW.items():
        if matches(domain, token):
            flows |= tags
    if trackers is None:
        trackers = {"unknown"} if "device_tracker" in entity_domains else set()
    gps = bool(trackers - PRESENCE_SOURCES) or "gps" in flows
    presence = not gps and bool(trackers & PRESENCE_SOURCES)
    camera = "camera" in entity_domains
    cloud_class = "cloud" in (iot_class or "")
    external = cloud_class or bool(flows & {"external", "cloud"})
    if gps or camera or any(a["kind"] in SYSTEM_KINDS for a in access):
        risk = "high"
    elif external or access:
        risk = "medium"
    else:
        risk = "low"
    reasons: list[str] = []
    kinds = list(dict.fromkeys(a["kind"] for a in access))
    if risk == "high":
        reasons = [kind for kind in kinds if kind in SYSTEM_KINDS]
        reasons += (["gps"] if gps else []) + (["camera"] if camera else [])
    elif risk == "medium":
        reasons = kinds + (["cloud"] if external else [])
    return {
        "access": access,
        "risk_reasons": reasons,
        "flows": sorted(flows),
        "gps": gps,
        "presence": presence,
        "camera": camera,
        "external": external,
        "cloud_class": cloud_class,
        "risk": risk,
    }


async def _integration_facts(
    hass: HomeAssistant, domains: set[str]
) -> dict[str, tuple[str | None, bool]]:
    """Per domain: its IoT class and whether it is custom code. One that fails to load is neither."""
    from homeassistant.loader import async_get_integrations

    found = await async_get_integrations(hass, domains)
    facts: dict[str, tuple[str | None, bool]] = {}
    for domain, integration in found.items():
        if isinstance(integration, Exception):
            facts[domain] = (None, False)
        else:
            facts[domain] = (
                getattr(integration, "iot_class", None),
                getattr(integration, "is_built_in", True) is False,
            )
    return facts


def _entity_domains(hass: HomeAssistant) -> tuple[dict[str, set[str]], dict[str, set[str]]]:
    """Per config entry: the domains of its entities and the sources of its device trackers."""
    by_entry: dict[str, set[str]] = {}
    trackers: dict[str, set[str]] = {}
    for entity in er.async_get(hass).entities.values():
        if not entity.config_entry_id:
            continue
        by_entry.setdefault(entity.config_entry_id, set()).add(entity.domain)
        if entity.domain == "device_tracker":
            state = hass.states.get(entity.entity_id)
            source = state.attributes.get("source_type") if state else None
            trackers.setdefault(entity.config_entry_id, set()).add(
                source if isinstance(source, str) else "unknown"
            )
    return by_entry, trackers


APP_INFO_TIMEOUT = 15  # seconds per app


def classify_app(info: dict[str, Any]) -> dict[str, Any]:
    """The rights of one app (add-on) from the Supervisor's ``/addons/<slug>/info`` and a risk level.

    Each right has a level: "high" for what equals root on the host (full hardware access,
    privileges, Docker, the host's process namespace, Supervisor admin, protection mode off),
    "medium" for access to the host network, open ports on the host, Home Assistant, logins or
    without AppArmor, "low" for the rest. A field the Supervisor does not send adds nothing.
    """
    access: list[dict[str, Any]] = []

    def add(kind: str, level: str, detail: str | None = None) -> None:
        access.append({"kind": kind, "detail": detail, "level": level})

    if info.get("full_access"):
        add("full_access", "high")
    privileged = [str(p) for p in info.get("privileged") or []]
    if privileged:
        add("privileged", "high", ", ".join(privileged))
    if info.get("host_pid"):
        add("host_pid", "high")
    if info.get("docker_api"):
        add("docker_api", "high")
    if info.get("host_ipc"):
        add("host_ipc", "low")
    if info.get("host_dbus"):
        add("host_dbus", "low")
    if info.get("protected") is False:
        add("protection_off", "high")
    if info.get("host_network"):
        add("host_network", "medium")
    else:
        network = info.get("network")
        ports = sorted(
            {
                p
                for p in (network.values() if isinstance(network, dict) else [])
                if isinstance(p, int)
            }
        )
        if ports:
            add("ports", "medium", ", ".join(str(p) for p in ports))
    role = info.get("hassio_role")
    if info.get("hassio_api"):
        add(
            "supervisor_api",
            "high" if role in ("admin", "manager") else "medium",
            str(role or "default"),
        )
    if info.get("homeassistant_api"):
        add("ha_api", "medium")
    if info.get("auth_api"):
        add("auth_api", "medium")
    if info.get("gpio"):
        add("gpio", "low")
    if info.get("usb"):
        add("usb", "low")
    devices = [str(d) for d in info.get("devices") or []]
    if devices:
        add("devices", "low", ", ".join(devices))
    if info.get("apparmor") in (False, "disable", "disabled"):
        add("apparmor_off", "medium")
    levels = {a["level"] for a in access}
    risk = "high" if "high" in levels else "medium" if "medium" in levels else "low"
    return {"access": access, "risk": risk}


def app_origin(info: dict[str, Any]) -> dict[str, str | None]:
    """Where an app comes from: "core" (official), "local" (built here) or "community", and its
    stage when it is not stable. Unknown when the Supervisor names no repository."""
    repository = info.get("repository")
    origin = None
    if isinstance(repository, str) and repository:
        origin = repository if repository in ("core", "local") else "community"
    stage = info.get("stage")
    return {"origin": origin, "stage": stage if stage in ("experimental", "deprecated") else None}


async def apps_report(hass: HomeAssistant) -> dict[str, Any]:
    """The rights of every installed app; ``available`` is False without a Supervisor."""
    if not supervisor_token():
        return {"available": False, "apps": []}
    listing = await supervisor_get(hass, "/addons")
    if listing is None:
        return {"available": False, "apps": []}
    installed = [a for a in listing.get("addons") or [] if isinstance(a, dict) and a.get("slug")]

    async def one(app: dict[str, Any]) -> dict[str, Any]:
        slug = str(app["slug"])
        info = await supervisor_get(hass, f"/addons/{slug}/info", timeout=APP_INFO_TIMEOUT)
        # An app the Supervisor does not describe is "not checked", never "low".
        result = classify_app(info) if info is not None else {"access": [], "risk": None}
        return {
            "slug": slug,
            "name": str((info or app).get("name") or slug),
            "state": (info or app).get("state"),
            "version": (info or app).get("version"),
            "checked": info is not None,
            **app_origin(info or app),
            **result,
        }

    apps = list(await asyncio.gather(*(one(app) for app in installed)))
    apps.sort(key=lambda a: (RISK_ORDER.get(a["risk"], len(RISK_ORDER)), a["name"].lower()))
    return {"available": True, "apps": apps}


def webhook_triggers(automations: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Automations that a webhook can start: a call from outside reaches them unless ``local_only``.

    Home Assistant answers a webhook for anyone who knows its ID; ``local_only`` (the default)
    limits that to the local network. The ID is never returned, only whether it is open.
    """
    found = []
    for item in automations:
        if item["object_type"] != "automation":
            continue
        triggers = [
            t
            for t in item.get("triggers") or []
            if isinstance(t, dict) and (t.get("trigger") or t.get("platform")) == "webhook"
        ]
        if not triggers:
            continue
        # One row per automation: a single open trigger makes it reachable from outside.
        methods: list[str] = []
        for trigger in triggers:
            if isinstance(trigger.get("allowed_methods"), list):
                methods += [str(m) for m in trigger["allowed_methods"] if str(m) not in methods]
        found.append(
            {
                "object_id": item["object_id"],
                "name": item.get("name") or item["object_id"],
                "enabled": item["status"] != "disabled",
                "local_only": all(t.get("local_only") is not False for t in triggers),
                "methods": methods,
            }
        )
    found.sort(key=lambda w: (w["local_only"], str(w["name"]).lower()))
    return found


# Apps that open a way in from outside, by a part of their slug: a public tunnel, a reverse proxy,
# a dynamic DNS name, or a private VPN (only members of the network reach it).
INBOUND_APPS: dict[str, str] = {
    "cloudflared": "tunnel",
    "ngrok": "tunnel",
    "nginx_proxy": "proxy",
    "nginxproxymanager": "proxy",
    "duckdns": "dyndns",
    "tailscale": "vpn",
    "zerotier": "vpn",
    "wireguard": "vpn",
}


def _nabu_casa(hass: HomeAssistant) -> dict[str, Any] | None:
    """Whether the remote UI of Nabu Casa is on. None without the cloud; "unknown" if unreadable."""
    if "cloud" not in hass.config.components:
        return None
    cloud = hass.data.get("cloud")
    try:
        remote = cloud.client.prefs.remote_enabled  # type: ignore[union-attr]
        logged_in = cloud.is_logged_in  # type: ignore[union-attr]
    except Exception:  # noqa: BLE001 - another cloud version: say so, never guess "off"
        return {"kind": "nabu_casa", "name": "Nabu Casa", "state": "unknown", "level": "mute"}
    state = "logged_out" if not logged_in else "on" if remote is True else "off"
    return {
        "kind": "nabu_casa",
        "name": "Nabu Casa",
        "state": state,
        "level": "warn" if state == "on" else "ok",
    }


def inbound_paths(
    hass: HomeAssistant,
    entries: list[dict[str, Any]],
    apps: list[dict[str, Any]],
    webhooks: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Ways in from outside that Housekeeper can see: the remote UI of Nabu Casa, tunnel, proxy,
    dynamic DNS and VPN apps (by name), the MCP server and webhooks open beyond the local network.
    A port forwarding on the router is not visible from here."""
    found: list[dict[str, Any]] = []
    nabu = _nabu_casa(hass)
    if nabu:
        found.append(nabu)
    for app in apps:
        kind = next((k for token, k in INBOUND_APPS.items() if matches(app["slug"], token)), None)
        if kind is None:
            continue
        running = app.get("state") == "started"
        level = "ok" if kind == "vpn" or not running else "warn"
        found.append(
            {
                "kind": kind,
                "name": app["name"],
                "slug": app["slug"],
                "state": "running" if running else "stopped",
                "level": level,
            }
        )
    for entry in entries:
        if entry["domain"] == "mcp_server" and not entry["disabled"]:
            found.append(
                {
                    "kind": "mcp_server",
                    "name": entry["title"],
                    "domain": entry["domain"],
                    "state": "set_up",
                    "level": "warn",
                }
            )
    if webhooks:
        opened = sum(1 for w in webhooks if not w["local_only"] and w["enabled"])
        found.append(
            {
                "kind": "webhooks",
                "name": "Webhooks",
                "state": "open" if opened else "local",
                "count": opened,
                "level": "warn" if opened else "ok",
            }
        )
    return found


async def access_report(
    hass: HomeAssistant, automations: list[dict[str, Any]] | None = None
) -> dict[str, Any]:
    """System access and data flow of every config entry (ignored discoveries left out) and the
    rights of the installed apps (only with a Supervisor)."""
    entries = [e for e in hass.config_entries.async_entries() if e.source != "ignore"]
    facts = await _integration_facts(hass, {e.domain for e in entries})
    entity_domains, trackers = _entity_domains(hass)
    items = []
    for entry in entries:
        result = classify(
            entry.domain,
            facts.get(entry.domain, (None, False))[0],
            entity_domains.get(entry.entry_id, set()),
            trackers.get(entry.entry_id, set()),
            custom=facts.get(entry.domain, (None, False))[1],
        )
        items.append(
            {
                "entry_id": entry.entry_id,
                "domain": entry.domain,
                "title": entry.title,
                "iot_class": facts.get(entry.domain, (None, False))[0],
                "disabled": entry.disabled_by is not None,
                **result,
            }
        )
    items.sort(key=lambda i: (RISK_ORDER[i["risk"]], i["domain"], str(i["title"]).lower()))
    apps = await apps_report(hass)
    webhooks = webhook_triggers(automations or [])
    return {
        "entries": items,
        "apps": apps["apps"],
        "apps_available": apps["available"],
        "webhooks": webhooks,
        "inbound": inbound_paths(hass, items, apps["apps"], webhooks),
        "with_access": sum(1 for i in items if i["access"]),
        "external": sum(1 for i in items if i["external"]),
        "high": sum(1 for i in items if i["risk"] == "high"),
    }
