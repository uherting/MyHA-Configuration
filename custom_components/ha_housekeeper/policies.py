"""Quality policies: rules you switch on, and the objects that break them.

Only reads. A policy violation is a hint about tidiness, never a defect: it is not part of the
findings, the health ring, the repair hints or the sensors. All rules are off until switched on.
A violation is hidden through the label ``housekeeper_ignore`` on the object or through the ignore
list of Housekeeper (the key is ``policy.<rule>|<object id>|``).
"""

from __future__ import annotations

import re
from datetime import UTC, datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from . import policy_rules as rules_more
from .const import IGNORE_LABEL, POLICIES_STORAGE_KEY, STORAGE_VERSION
from .hygiene import finding_key
from .payloads import PoliciesResult

SAVE_DELAY = 10
ITEM_LIMIT = 200
RULES = (
    "entity_area",
    "device_area",
    "automation_description",
    "battery_device",
    "duplicate_name",
    "automation_label",
    "naming_scheme",
    "state_rate",
    "entity_id_suffix",
    "entity_id_address",
    "default_name",
    "script_description",
    "script_label",
    "device_model",
    "area_empty",
    "label_unused",
    "automation_error_handling",
    "automation_triggers",
    "automation_literal_ids",
    "automation_self_trigger",
    "turn_on_only",
    "exposure_unused",
    "exposure_sensitive",
    "battery_no_automation",
    "recorder_unused",
    "recorder_retention",
    "statistics_unit",
    "statistics_class",
    "dashboard_navigation",
    "dashboard_disabled_entities",
    "dashboard_duplicate_cards",
    "dashboard_size",
    "dashboard_custom_cards",
    "http_trusted_networks",
    "http_external_url",
    "http_proxies",
    "user_inactive",
    "user_old_tokens",
    "user_dead_tokens",
    "companion_silent",
    "hacs_archived",
    "hacs_blocked",
)
# Rules that wait for numbers the Recorder views keep; they never start a recorder query themselves.
NEEDS_LOAD = ("state_rate", "recorder_unused")
NEEDS_DB = ("recorder_retention",)
LIMIT_DEFAULT = 5000
LIMIT_MIN = 100
LIMIT_MAX = 100000
PREFIX_LIMIT = 10
DOMAIN_SHAPE = re.compile(r"^[a-z0-9_]{1,40}$")
PREFIX_SHAPE = re.compile(r"^[a-z0-9_]{1,30}$")
ALSO_LIMIT = 3
KEY_PREFIX = "policy."


def policy_key(rule: str, object_id: str) -> str:
    """The ignore-list key of one violation; same shape as the key of a finding."""
    return finding_key({"rule_id": f"{KEY_PREFIX}{rule}", "object_id": object_id})


class PolicyStore:
    """Which rules are switched on."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, POLICIES_STORAGE_KEY)
        self.enabled: set[str] = set()
        self.prefixes: dict[str, str] = {}  # domain -> the prefix its entity ids must start with
        self.limit = (
            LIMIT_DEFAULT  # state_rate: state changes per entity and day from which it counts
        )

    async def async_load(self) -> None:
        """Load the switches; anything that is not a known rule set to ``true`` is dropped."""
        data = await self._store.async_load()
        if not isinstance(data, dict):
            return
        if isinstance(data.get("enabled"), dict):
            self.enabled = {
                rule for rule, on in data["enabled"].items() if rule in RULES and on is True
            }
        limit = data.get("limit")
        if (
            isinstance(limit, int)
            and not isinstance(limit, bool)
            and LIMIT_MIN <= limit <= LIMIT_MAX
        ):
            self.limit = limit
        if isinstance(data.get("prefixes"), dict):
            self.prefixes = {
                domain: prefix
                for domain, prefix in data["prefixes"].items()
                if isinstance(domain, str)
                and isinstance(prefix, str)
                and DOMAIN_SHAPE.match(domain)
                and PREFIX_SHAPE.match(prefix)
            }
            self.prefixes = dict(sorted(self.prefixes.items())[:PREFIX_LIMIT])

    def set_enabled(self, rule: str, on: bool) -> None:
        """Switch one rule and persist the change."""
        if rule not in RULES:
            raise ValueError(rule)
        if on == (rule in self.enabled):
            return
        (self.enabled.add if on else self.enabled.discard)(rule)
        self._store.async_delay_save(self._data, SAVE_DELAY)

    def set_prefix(self, domain: str, prefix: str) -> None:
        """Set the prefix for a domain; an empty prefix removes it. Raises ``ValueError`` on bad input."""
        if not DOMAIN_SHAPE.match(domain):
            raise ValueError(domain)
        if not prefix:
            if self.prefixes.pop(domain, None) is not None:
                self._store.async_delay_save(self._data, SAVE_DELAY)
            return
        if not PREFIX_SHAPE.match(prefix):
            raise ValueError(prefix)
        if domain not in self.prefixes and len(self.prefixes) >= PREFIX_LIMIT:
            raise ValueError("too many prefixes")
        if self.prefixes.get(domain) != prefix:
            self.prefixes[domain] = prefix
            self._store.async_delay_save(self._data, SAVE_DELAY)

    def set_limit(self, value: int) -> None:
        """Set the daily limit of the state_rate rule. Raises ``ValueError`` outside the range."""
        if isinstance(value, bool) or not LIMIT_MIN <= value <= LIMIT_MAX:
            raise ValueError(value)
        if value != self.limit:
            self.limit = value
            self._store.async_delay_save(self._data, SAVE_DELAY)

    def _data(self) -> dict[str, Any]:
        return {
            "limit": self.limit,
            "enabled": {rule: True for rule in sorted(self.enabled)},
            "prefixes": dict(sorted(self.prefixes.items())),
        }


def _entity_area(objects: dict[str, dict[str, Any]], devices: dict[str, dict[str, Any]]):
    """Physical entities: with a device, no category, not disabled, and no area of their own or from the device."""
    for item in objects.values():
        device = devices.get(item.get("device_id") or "")
        if (
            device is None
            or item.get("disabled_by")
            or item.get("entity_category")
            or device.get("entry_type") == "service"
            or item.get("area_id")
            or device.get("area_id")
        ):
            continue
        yield item


def _device_area(devices: dict[str, dict[str, Any]]):
    """Devices that are used, not services, not sub-devices, without an area."""
    for item in devices.values():
        if (
            item.get("status") == "active"
            and item.get("device_kind") != "child"
            and item.get("entry_type") != "service"
            and not item.get("area_id")
        ):
            yield item


def _automation_description(automations: list[dict[str, Any]]):
    """Automations with a configuration but an empty description."""
    for item in automations:
        if (
            item.get("source") != "state_fallback"
            and not str(item.get("description") or "").strip()
        ):
            yield item


def _battery_device(entities: dict[str, dict[str, Any]]):
    """Battery entities that belong to no device."""
    for item in entities.values():
        if (
            item.get("device_class") == "battery"
            and not item.get("device_id")
            and not item.get("disabled_by")
        ):
            yield item


def _duplicate_name(entities: dict[str, dict[str, Any]]):
    """Active entities that share a display name with another active entity of the same domain."""
    groups: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for item in entities.values():
        name = str(item.get("name") or "").strip().casefold()
        if not name or name == item["object_id"] or item.get("disabled_by"):
            continue
        groups.setdefault((item["object_id"].split(".", 1)[0], name), []).append(item)
    for group in groups.values():
        if len(group) > 1:
            for item in group:
                others = sorted(i["object_id"] for i in group if i is not item)
                yield {**item, "also": others[:ALSO_LIMIT]}


def _automation_label(automations: list[dict[str, Any]], with_labels: dict[str, bool]):
    """Automations that can carry a label (they are in the entity registry) and carry none."""
    for item in automations:
        if with_labels.get(item["object_id"]) is False:
            yield item


def _naming_scheme(entities: dict[str, dict[str, Any]], prefixes: dict[str, str]):
    """Entities whose id does not start with the prefix chosen for their domain."""
    for item in entities.values():
        domain, _, name = item["object_id"].partition(".")
        prefix = prefixes.get(domain)
        if prefix and not name.startswith(prefix) and not item.get("disabled_by"):
            yield {**item, "expected": prefix}


def _state_rate(entities: dict[str, dict[str, Any]], rates: dict[str, int], limit: int):
    """Entities that changed state at least ``limit`` times a day in the last calculated load numbers."""
    for entity_id, per_day in rates.items():
        item = entities.get(entity_id)
        if item is not None and per_day >= limit and not item.get("disabled_by"):
            yield {**item, "rate": per_day}


def evaluate(
    snapshot: dict[str, Any],
    enabled: set[str] | frozenset[str],
    ignored_keys: set[str],
    labelled: set[str],
    automation_labels: dict[str, bool] | None = None,
    prefixes: dict[str, str] | None = None,
    rates: dict[str, int] | None = None,
    limit: int = LIMIT_DEFAULT,
    extra: dict[str, Any] | None = None,
) -> PoliciesResult:
    """Violations per rule. ``labelled`` holds the object ids that carry the ignore label.

    ``automation_labels`` maps an automation to whether it carries any label (only automations in
    the entity registry can carry one); ``prefixes`` is the naming scheme per domain. ``extra`` holds
    what some rules need from outside the snapshot: ``used_labels``, ``exposed`` (entity id to the
    assistants that reach it), ``battery_percent`` and ``db`` (the kept database numbers or ``None``).
    """
    extra = extra or {}
    by_type: dict[str, list[dict[str, Any]]] = {}
    for item in snapshot["objects"]:
        by_type.setdefault(item["object_type"], []).append(item)
    entities = {i["object_id"]: i for i in by_type.get("entity", [])}
    devices = {i["object_id"]: i for i in by_type.get("device", [])}
    integrations = by_type.get("config_entry", [])
    automations = by_type.get("automation", [])
    scripts = by_type.get("script", [])
    dashboards = by_type.get("dashboard", [])
    labels_of = automation_labels or {}
    used = rules_more.referenced(snapshot.get("edges", []))
    exposed = extra.get("exposed") or {}
    auth = extra.get("auth") or {}
    now = extra.get("now") or datetime.now(UTC)
    found = {
        "entity_id_suffix": lambda: rules_more.entity_id_suffix(entities),
        "entity_id_address": lambda: rules_more.entity_id_address(entities),
        "default_name": lambda: rules_more.default_name(automations, scripts),
        "script_description": lambda: rules_more.script_description(scripts),
        "script_label": lambda: rules_more.script_label(scripts, labels_of),
        "device_model": lambda: rules_more.device_model(devices),
        "area_empty": lambda: rules_more.area_empty(by_type.get("area", []), entities, devices),
        "label_unused": lambda: rules_more.label_unused(
            by_type.get("label", []), extra.get("used_labels") or set(), IGNORE_LABEL
        ),
        "automation_error_handling": lambda: rules_more.automation_error_handling(automations),
        "automation_triggers": lambda: rules_more.automation_triggers(automations),
        "automation_literal_ids": lambda: rules_more.automation_literal_ids(automations),
        "automation_self_trigger": lambda: rules_more.automation_self_trigger(automations),
        "turn_on_only": lambda: rules_more.turn_on_only(automations, scripts, entities),
        "exposure_unused": lambda: rules_more.exposure_unused(exposed, entities, used),
        "exposure_sensitive": lambda: rules_more.exposure_sensitive(exposed, entities),
        "battery_no_automation": lambda: rules_more.battery_no_automation(
            entities, used, extra.get("battery_percent", 20)
        ),
        "http_trusted_networks": lambda: rules_more.http_trusted_networks(extra.get("http") or {}),
        "http_external_url": lambda: rules_more.http_external_url(extra.get("http") or {}),
        "http_proxies": lambda: rules_more.http_proxies(extra.get("http") or {}),
        "user_inactive": lambda: rules_more.user_inactive(auth, now),
        "user_old_tokens": lambda: rules_more.user_old_tokens(auth, now),
        "user_dead_tokens": lambda: rules_more.user_dead_tokens(auth, now),
        "companion_silent": lambda: rules_more.companion_silent(devices, entities, now),
        "hacs_archived": lambda: rules_more.hacs_archived(integrations),
        "hacs_blocked": lambda: rules_more.hacs_blocked(integrations),
        "recorder_unused": lambda: rules_more.recorder_unused(entities, rates or {}, used),
        "recorder_retention": lambda: rules_more.recorder_retention(extra.get("db") or {}),
        "statistics_unit": lambda: rules_more.statistics_issue(
            "unit", snapshot.get("statistic_issues") or [], entities
        ),
        "statistics_class": lambda: rules_more.statistics_issue(
            "class", snapshot.get("statistic_issues") or [], entities
        ),
        "dashboard_navigation": lambda: rules_more.dashboard_navigation(dashboards),
        "dashboard_disabled_entities": lambda: rules_more.dashboard_disabled_entities(
            dashboards, entities
        ),
        "dashboard_duplicate_cards": lambda: rules_more.dashboard_duplicate_cards(dashboards),
        "dashboard_size": lambda: rules_more.dashboard_size(dashboards),
        "dashboard_custom_cards": lambda: rules_more.dashboard_custom_cards(dashboards),
        "entity_area": lambda: _entity_area(entities, devices),
        "device_area": lambda: _device_area(devices),
        "automation_description": lambda: _automation_description(by_type.get("automation", [])),
        "battery_device": lambda: _battery_device(entities),
        "duplicate_name": lambda: _duplicate_name(entities),
        "automation_label": lambda: _automation_label(
            by_type.get("automation", []), automation_labels or {}
        ),
        "naming_scheme": lambda: _naming_scheme(entities, prefixes or {}),
        "state_rate": lambda: _state_rate(entities, rates or {}, limit),
    }
    rules = []
    for rule in RULES:
        if rule not in enabled:
            rules.append({"id": rule, "enabled": False, "count": 0, "ignored": 0, "items": []})
            continue
        if (rule in NEEDS_LOAD and rates is None) or (rule in NEEDS_DB and extra.get("db") is None):
            # Never calculated: the rule waits for the load numbers instead of starting a recorder query.
            rules.append(
                {
                    "id": rule,
                    "enabled": True,
                    "count": 0,
                    "ignored": 0,
                    "items": [],
                    "pending": True,
                }
            )
            continue
        items, ignored = [], 0
        for item in found[rule]():
            key = policy_key(rule, item["object_id"])
            hidden = item["object_id"] in labelled or key in ignored_keys
            ignored += hidden
            items.append(
                {
                    "object_type": item["object_type"],
                    "object_id": item["object_id"],
                    "name": item.get("name") or item["object_id"],
                    "key": key,
                    "ignored": bool(hidden),
                    "by": "label" if item["object_id"] in labelled else "user" if hidden else None,
                    "ignore_info": (extra.get("decisions") or {}).get(key),
                    "resurfaced": key in (extra.get("due") or ()),
                    **{
                        k: item[k]
                        for k in (
                            "also",
                            "expected",
                            "rate",
                            "keep_days",
                            "db_bytes",
                            "days",
                            "idle_days",
                        )
                        if k in item
                    },
                }
            )
        items.sort(key=lambda i: (i["ignored"], i["name"].casefold(), i["object_id"]))
        rules.append(
            {
                "id": rule,
                "enabled": True,
                "count": len(items) - ignored,
                "ignored": ignored,
                "items": items[:ITEM_LIMIT],
            }
        )
    return {
        "available": True,
        "rules": rules,  # type: ignore[typeddict-item]
        "violations": sum(r["count"] for r in rules),
        "enabled": len(enabled),
        "prefixes": dict(prefixes or {}),
        "limit": limit,
    }


def policies(
    hass: HomeAssistant,
    snapshot: dict[str, Any],
    store: PolicyStore,
    ignored: Any,
    replies: Any = None,
    battery_percent: int = 20,
    auth: dict[str, Any] | None = None,
) -> PoliciesResult:
    """The result for the panel: the rules, how many objects break each, and which are hidden."""
    from homeassistant.helpers import entity_registry as er

    registry = er.async_get(hass)
    labelled = {
        item["object_id"]
        for item in snapshot["objects"]
        if item["object_type"] in ("entity", "device")
        and IGNORE_LABEL in (item.get("labels") or [])
    }
    for item in snapshot["objects"]:
        if item["object_type"] in ("automation", "script"):
            entry = registry.async_get(item["object_id"])
            if entry is not None and IGNORE_LABEL in entry.labels:
                labelled.add(item["object_id"])
    with_labels = {}
    for item in snapshot["objects"]:
        if item["object_type"] in ("automation", "script"):
            entry = registry.async_get(item["object_id"])
            if entry is not None:
                with_labels[item["object_id"]] = bool(entry.labels)
    object_ids = (
        [item["object_id"] for item in snapshot["objects"]]
        + list(rules_more.SYSTEM_OBJECTS)
        + [user["id"] for user in (auth or {}).get("users") or []]
    )
    keys = {
        policy_key(rule, object_id)
        for rule in RULES
        for object_id in object_ids
        if ignored.is_ignored(policy_key(rule, object_id))
    }
    due = {
        policy_key(rule, object_id)
        for rule in RULES
        for object_id in object_ids
        if ignored.is_due(policy_key(rule, object_id))
    }
    decisions = {key: ignored.info(key) for key in keys}
    return evaluate(
        snapshot,
        store.enabled,
        keys,
        labelled,
        with_labels,
        store.prefixes,
        stored_rates(replies),
        store.limit,
        {
            **_extra(hass, snapshot, store, registry, replies, battery_percent),
            "auth": auth,
            "decisions": decisions,
            "due": due,
        },
    )


def _extra(
    hass: HomeAssistant,
    snapshot: dict[str, Any],
    store: PolicyStore,
    registry: Any,
    replies: Any,
    battery_percent: int,
) -> dict[str, Any]:
    """What some rules need from outside the snapshot; each part only when its rule is on."""
    from homeassistant.helpers import area_registry as ar
    from homeassistant.helpers import device_registry as dr

    from .exposure import exposure

    extra: dict[str, Any] = {"battery_percent": battery_percent}
    if "label_unused" in store.enabled:
        used = {label for entry in registry.entities.values() for label in entry.labels}
        used |= {label for dev in dr.async_get(hass).devices.values() for label in dev.labels}
        used |= {label for area in ar.async_get(hass).async_list_areas() for label in area.labels}
        extra["used_labels"] = used
    if store.enabled & {"exposure_unused", "exposure_sensitive"}:
        result = exposure(hass, snapshot)
        extra["exposed"] = {
            row["entity_id"]: row["assistants"] for row in result["exposed_entities"]
        }
    if store.enabled & {"http_trusted_networks", "http_external_url", "http_proxies"}:
        extra["http"] = http_facts(hass)
    kept = getattr(replies, "replies", {}).get("db_health")
    if isinstance(kept, dict) and "db_bytes" in kept:
        extra["db"] = kept
    return extra


def http_facts(hass: HomeAssistant) -> dict[str, Any]:
    """What the running Home Assistant says about how it can be reached; a key is left out when
    it cannot be read, so its rule reports nothing. Only networks and the host are kept."""
    facts: dict[str, Any] = {"external_url": getattr(hass.config, "external_url", None)}
    proxies = getattr(getattr(hass, "http", None), "trusted_proxies", None)
    if proxies is not None:
        facts["trusted_proxies"] = [str(net) for net in proxies]
    providers = getattr(getattr(hass, "auth", None), "auth_providers", None)
    if providers is not None:
        trusted = [p for p in providers if getattr(p, "type", None) == "trusted_networks"]
        facts["trusted_networks"] = [
            str(net) for p in trusted for net in getattr(p, "trusted_networks", [])
        ]
        facts["bypass_login"] = any(
            (getattr(p, "config", None) or {}).get("allow_bypass_login") for p in trusted
        )
    return facts


USER_RULES = frozenset({"user_inactive", "user_old_tokens", "user_dead_tokens"})


async def auth_facts(hass: HomeAssistant, enabled: Any) -> dict[str, Any] | None:
    """The people of this Home Assistant and their tokens, or ``None`` when no account rule is on.

    Only names, dates and the kind of a token are kept: never a token value, never an address.
    Accounts the system made for itself (Supervisor, add-ons) are left out.
    """
    if not USER_RULES & set(enabled):
        return None
    try:
        users = await hass.auth.async_get_users()
    except Exception:  # noqa: BLE001 - no readable accounts, no hints
        return None
    facts = []
    for user in users:
        if user.system_generated:
            continue
        tokens = list(user.refresh_tokens.values())
        logins = [t for t in tokens if t.token_type == "normal"]
        facts.append(
            {
                "id": user.id,
                "name": user.name or "?",
                "active": user.is_active,
                "tokens": [
                    {"name": t.client_name or "?", "created": t.created_at}
                    for t in tokens
                    if t.token_type == "long_lived_access_token"
                ],
                "logins": bool(logins),
                "last_login": max((t.last_used_at or t.created_at for t in logins), default=None),
            }
        )
    return {"users": facts}


def stored_rates(replies: Any) -> dict[str, int] | None:
    """Changes per day and entity from the newest kept load reply; ``None`` if there is none.

    Only reads what the load view already kept; it never starts a recorder query.
    """
    kept = [
        reply
        for key, reply in getattr(replies, "replies", {}).items()
        if key.startswith("storms:") and isinstance(reply.get("entities"), list)
    ]
    if not kept:
        return None
    newest = max(kept, key=lambda r: r.get("computed_at", 0))
    return {
        row["entity_id"]: int(row["per_day"])
        for row in newest["entities"]
        if isinstance(row.get("entity_id"), str) and isinstance(row.get("per_day"), (int, float))
    }
