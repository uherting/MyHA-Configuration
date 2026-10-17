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
}

RISK_ORDER = {"high": 0, "medium": 1, "low": 2}


def matches(domain: str, token: str) -> bool:
    """Whether ``token`` is the domain or a part of it between underscores.

    Generic words only match the whole domain: "cloud" is Nabu Casa, "tuya_cloud" is not.
    """
    if domain == token:
        return True
    if token in EXACT_ONLY:
        return False
    return f"_{token}_" in f"_{domain}_"


def classify(domain: str, iot_class: str | None, entity_domains: set[str]) -> dict[str, Any]:
    """System access, data flow, external reach and a risk level for one integration."""
    access: list[dict[str, Any]] = []
    for token, (kind, detail) in SYSTEM_ACCESS.items():
        item = {"kind": kind, "detail": detail}
        if matches(domain, token) and item not in access:
            access.append(item)
    flows: set[str] = set()
    for token, tags in DATAFLOW.items():
        if matches(domain, token):
            flows |= tags
    gps = bool(entity_domains & {"device_tracker", "geo_location"}) or "gps" in flows
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
        "camera": camera,
        "external": external,
        "cloud_class": cloud_class,
        "risk": risk,
    }


async def _iot_classes(hass: HomeAssistant, domains: set[str]) -> dict[str, str | None]:
    from homeassistant.loader import async_get_integrations

    found = await async_get_integrations(hass, domains)
    return {
        domain: getattr(integration, "iot_class", None)
        if not isinstance(integration, Exception)
        else None
        for domain, integration in found.items()
    }


def _entity_domains(hass: HomeAssistant) -> dict[str, set[str]]:
    by_entry: dict[str, set[str]] = {}
    for entity in er.async_get(hass).entities.values():
        if entity.config_entry_id:
            by_entry.setdefault(entity.config_entry_id, set()).add(entity.domain)
    return by_entry


APP_INFO_TIMEOUT = 15  # seconds per app


def classify_app(info: dict[str, Any]) -> dict[str, Any]:
    """The rights of one app (add-on) from the Supervisor's ``/addons/<slug>/info`` and a risk level.

    Each right has a level: "high" for what equals root on the host (full hardware access,
    privileges, Docker, the host's process namespace, Supervisor admin), "medium" for access to
    the host network, Home Assistant, logins or without AppArmor, "low" for the rest.
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
    if info.get("host_network"):
        add("host_network", "medium")
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


async def access_report(
    hass: HomeAssistant, automations: list[dict[str, Any]] | None = None
) -> dict[str, Any]:
    """System access and data flow of every config entry (ignored discoveries left out) and the
    rights of the installed apps (only with a Supervisor)."""
    entries = [e for e in hass.config_entries.async_entries() if e.source != "ignore"]
    classes = await _iot_classes(hass, {e.domain for e in entries})
    entity_domains = _entity_domains(hass)
    items = []
    for entry in entries:
        result = classify(
            entry.domain, classes.get(entry.domain), entity_domains.get(entry.entry_id, set())
        )
        items.append(
            {
                "entry_id": entry.entry_id,
                "domain": entry.domain,
                "title": entry.title,
                "iot_class": classes.get(entry.domain),
                "disabled": entry.disabled_by is not None,
                **result,
            }
        )
    items.sort(key=lambda i: (RISK_ORDER[i["risk"]], i["domain"], str(i["title"]).lower()))
    apps = await apps_report(hass)
    return {
        "entries": items,
        "apps": apps["apps"],
        "apps_available": apps["available"],
        "webhooks": webhook_triggers(automations or []),
        "with_access": sum(1 for i in items if i["access"]),
        "external": sum(1 for i in items if i["external"]),
        "high": sum(1 for i in items if i["risk"] == "high"),
    }
