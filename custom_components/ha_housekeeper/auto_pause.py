"""Pause an integration that keeps failing to set up, and try it again later.

Home Assistant retries a failing setup about every 80 seconds for as long as it fails. For an
integration that reads a website or a cloud service that is a thousand requests a day against a
service that is down. Auto-pause disables the entry (``disabled_by`` user, the only value Home
Assistant knows) and keeps its own record of what it paused, so it never enables an entry that the
user disabled. It then enables the entry now and then, looks whether it loads, and disables it
again if not: 3 times after 1 hour, 3 times after 3 hours, 12 times after 6 hours, then daily, up
to 7 days from the start. After that the entry stays paused and the user is asked to look.

The automatic start is off until the user switches it on; then it applies to every candidate that is
not excluded. Only entries that cloud-poll and only provide data (no switches, locks, cameras) are
candidates. A pause the user starts by hand needs no switch.
"""

from __future__ import annotations

import asyncio
from collections.abc import Callable
from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING, Any

from homeassistant.config_entries import ConfigEntry, ConfigEntryDisabler, ConfigEntryState
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.event import async_track_point_in_utc_time
from homeassistant.helpers.storage import Store

from .const import AUTO_PAUSE_STORAGE_KEY, DOMAIN, PANEL_URL, STORAGE_VERSION
from .sensitive_fields import reauth_entry_ids
from .texts import pick

if TYPE_CHECKING:
    from .inventory import InventoryScanner

SAVE_DELAY = 5
END_HOURS = 168
GRACE_SECONDS = 60  # how long an enabled entry may take to load before it is paused again
LOG_MAX = 40
DATA_DOMAINS = frozenset(
    {"sensor", "binary_sensor", "calendar", "weather", "todo", "event", "image"}
)
CLOUD_CLASSES = frozenset({"cloud_polling"})
# Entries Housekeeper never pauses, by hand or by itself.
NEVER = frozenset(
    {
        DOMAIN,
        "recorder",
        "cloud",
        "hassio",
        "backup",
        "http",
        "frontend",
        "homeassistant",
        "websocket_api",
        "api",
        "config",
        "person",
    }
)
LIMITS = {"attempts": (3, 500), "hours": (1, 48)}
DEFAULTS: dict[str, Any] = {
    "enabled": False,
    "attempts": 20,
    "hours": 6,
    "house_functions": False,
}


def _offsets() -> tuple[int, ...]:
    """Hours after the start of the pause at which the entry is tried again."""
    out: list[int] = []
    t = 0
    for step in [1] * 3 + [3] * 3 + [6] * 12:
        t += step
        out.append(t)
    while t + 24 < END_HOURS:
        t += 24
        out.append(t)
    return tuple(out)


OFFSETS = _offsets()

TEXTS = {
    "de": {
        "paused": (
            "HA Housekeeper: {title} pausiert",
            "{title} ({domain}) ist pausiert: {why}. Housekeeper versucht es {n} Mal wieder, höchstens {days} Tage lang. [Auto-Pause öffnen](/{url}?view=reliability&tab=autopause)",
        ),
        "why_auto": "{n} Fehlversuche in {hours} Std.",
        "why_manual": "von dir pausiert",
        "back": (
            "HA Housekeeper: {title} läuft wieder",
            "{title} ({domain}) hat sich nach {span} wieder eingerichtet und ist nicht mehr pausiert.",
        ),
        "ended": (
            "HA Housekeeper: Pause von {title} beendet",
            "{title} ({domain}) ist nicht mehr pausiert.",
        ),
        "exhausted": (
            "HA Housekeeper: {title} seit {days} Tagen pausiert",
            "{title} ({domain}) ließ sich in {days} Tagen nicht mehr einrichten. Bitte prüfen: Protokoll, Update der Integration, die Quelle selbst. [Auto-Pause öffnen](/{url}?view=reliability&tab=autopause)",
        ),
    },
    "en": {
        "paused": (
            "HA Housekeeper: {title} paused",
            "{title} ({domain}) is paused: {why}. Housekeeper tries it again {n} times, for up to {days} days. [Open Auto-pause](/{url}?view=reliability&tab=autopause)",
        ),
        "why_auto": "{n} failed attempts in {hours} h",
        "why_manual": "paused by you",
        "back": (
            "HA Housekeeper: {title} is back",
            "{title} ({domain}) set itself up again after {span} and is no longer paused.",
        ),
        "ended": (
            "HA Housekeeper: pause of {title} ended",
            "{title} ({domain}) is no longer paused.",
        ),
        "exhausted": (
            "HA Housekeeper: {title} paused for {days} days",
            "{title} ({domain}) could not be set up in {days} days. Please look: the log, an update of the integration, the source itself. [Open Auto-pause](/{url}?view=reliability&tab=autopause)",
        ),
    },
}


class AutoPauseError(Exception):
    """A refused request; the message is a code the panel translates."""


def _now() -> datetime:
    return datetime.now(UTC)


def _span(start: datetime, end: datetime) -> str:
    hours = max(1, round((end - start).total_seconds() / 3600))
    return f"{hours // 24} d {hours % 24} h" if hours >= 24 else f"{hours} h"


class AutoPause:
    """The settings, the exclusions and the paused entries."""

    def __init__(self, hass: HomeAssistant, scanner: InventoryScanner) -> None:
        self.hass = hass
        self.scanner = scanner
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, AUTO_PAUSE_STORAGE_KEY)
        self.settings: dict[str, Any] = dict(DEFAULTS)
        self.exclude: set[str] = set()
        self.paused: dict[str, dict[str, Any]] = {}
        # Where an entry's outage began before it was paused: the pause must not start it afresh.
        self.carry: dict[str, str] = {}
        self.log: list[list[str]] = []
        self._busy: set[str] = set()
        self._unsub: Callable[[], None] | None = None

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if not isinstance(data, dict):
            return
        settings = data.get("settings")
        if isinstance(settings, dict):
            for key, default in DEFAULTS.items():
                value = settings.get(key)
                if (
                    isinstance(default, bool)
                    and isinstance(value, bool)
                    or (
                        not isinstance(default, bool)
                        and isinstance(value, int)
                        and not isinstance(value, bool)
                        and LIMITS[key][0] <= value <= LIMITS[key][1]
                    )
                ):
                    self.settings[key] = value
        value = data.get("exclude")
        if isinstance(value, list):
            self.exclude = {v for v in value if isinstance(v, str)}
        carry = data.get("carry")
        if isinstance(carry, dict):
            self.carry = {
                k: v for k, v in carry.items() if isinstance(k, str) and isinstance(v, str)
            }
        paused = data.get("paused")
        for entry_id, rec in (paused if isinstance(paused, dict) else {}).items():
            if (
                isinstance(entry_id, str)
                and isinstance(rec, dict)
                and isinstance(rec.get("since"), str)
            ):
                self.paused[entry_id] = {
                    "since": rec["since"],
                    "reason": "manual" if rec.get("reason") == "manual" else "auto",
                    "failures": rec["failures"] if isinstance(rec.get("failures"), int) else None,
                    "done": rec["done"] if isinstance(rec.get("done"), int) else 0,
                    "trying": rec.get("trying") is True,
                    "exhausted": rec.get("exhausted") is True,
                    "title": str(rec.get("title") or ""),
                    "domain": str(rec.get("domain") or ""),
                }
        log = data.get("log")
        if isinstance(log, list):
            self.log = [r for r in log if isinstance(r, list) and len(r) == 3][-LOG_MAX:]

    def _save(self) -> None:
        self._store.async_delay_save(
            lambda: {
                "settings": self.settings,
                "exclude": sorted(self.exclude),
                "paused": self.paused,
                "carry": self.carry,
                "log": self.log,
            },
            SAVE_DELAY,
        )

    def _note(self, action: str, entry_id: str) -> None:
        rec = self.paused.get(entry_id) or {}
        entry = self.hass.config_entries.async_get_entry(entry_id)
        title = rec.get("title") or (entry.title if entry else entry_id)
        self.log.append([_now().isoformat(), action, str(title)])
        del self.log[:-LOG_MAX]

    # --- start and stop -------------------------------------------------------------------------

    @callback
    def start(self) -> Callable[[], None]:
        """Pick up after a restart and schedule what is due; returns the function that stops it."""
        for entry_id in list(self.paused):
            rec = self.paused[entry_id]
            entry = self.hass.config_entries.async_get_entry(entry_id)
            if entry is None:
                del self.paused[entry_id]
                continue
            if rec["trying"]:
                # Home Assistant stopped in the middle of an attempt: pause it again.
                rec["trying"] = False
                if entry.state is not ConfigEntryState.LOADED:
                    self.hass.async_create_task(self._disable(entry_id))
            elif entry.disabled_by is None:
                # Enabled by hand while paused: the user ended the pause.
                del self.paused[entry_id]
            elif rec["exhausted"]:
                self._issue(entry_id, rec, True)  # hints do not survive a restart
        self._save()
        self._schedule()

        def stop() -> None:
            if self._unsub:
                self._unsub()
                self._unsub = None

        return stop

    def _due(self, rec: dict[str, Any]) -> datetime | None:
        since = datetime.fromisoformat(rec["since"])
        if rec["exhausted"]:
            return None
        if rec["done"] < len(OFFSETS):
            return since + timedelta(hours=OFFSETS[rec["done"]])
        return since + timedelta(hours=END_HOURS)

    @callback
    def _schedule(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None
        times = [t for r in self.paused.values() if (t := self._due(r)) is not None]
        if times:
            self._unsub = async_track_point_in_utc_time(self.hass, self._tick, min(times))

    @callback
    def _tick(self, now: datetime) -> None:
        self._unsub = None
        if getattr(self.scanner, "warming_up", False):
            # An attempt switches the entry on: during the start it would be the slowest one.
            left = max(30, getattr(self.scanner, "warmup_seconds_left", 0))
            self._unsub = async_track_point_in_utc_time(
                self.hass, self._tick, now + timedelta(seconds=left)
            )
            return
        for entry_id, rec in list(self.paused.items()):
            due = self._due(rec)
            if due is None or due > now or entry_id in self._busy:
                continue
            if rec["done"] < len(OFFSETS):
                self.hass.async_create_background_task(
                    self._attempt(entry_id, scheduled=True), f"{DOMAIN}_auto_pause_attempt"
                )
            else:
                rec["exhausted"] = True
                self._note("exhausted", entry_id)
                self._announce("exhausted", entry_id)
                self._issue(entry_id, rec, True)
        self._save()
        self._schedule()

    # --- the work -------------------------------------------------------------------------------

    async def _disable(self, entry_id: str) -> None:
        await self.hass.config_entries.async_set_disabled_by(entry_id, ConfigEntryDisabler.USER)

    async def _attempt(self, entry_id: str, *, scheduled: bool) -> None:
        """Enable the entry, wait a minute for it to load, pause it again if it did not."""
        rec = self.paused.get(entry_id)
        entry = self.hass.config_entries.async_get_entry(entry_id)
        if rec is None or entry is None or entry_id in self._busy:
            return
        self._busy.add(entry_id)
        rec["trying"] = True
        self._save()
        try:
            await self.hass.config_entries.async_set_disabled_by(entry_id, None)
            for _ in range(GRACE_SECONDS // 5):
                if entry.state is ConfigEntryState.LOADED:
                    break
                await asyncio.sleep(5)
            if entry.state is ConfigEntryState.LOADED:
                self._recovered(entry_id)
                return
            await self._disable(entry_id)
            if scheduled and entry_id in self.paused:
                rec["done"] += 1
                self._note("tried", entry_id)
        finally:
            self._busy.discard(entry_id)
            if entry_id in self.paused:
                rec["trying"] = False
            self._save()
            self._schedule()

    def outage_starts(self) -> dict[str, str]:
        """Where the outage of each entry that auto-pause paused began; a pause by hand is no finding."""
        return {
            entry_id: self.carry.get(entry_id) or rec["since"]
            for entry_id, rec in self.paused.items()
            if rec.get("reason") != "manual"
        }

    def outage_start(self, entry_id: str, status: str, since: str | None) -> str | None:
        """The start of an entry's outage, from before its pause if it began earlier.

        Dropped as soon as the entry is not a problem any more: a later outage is a new one.
        """
        began = self.carry.get(entry_id)
        if status == "problem" and began and (since is None or began < since):
            return began
        if status not in ("problem", "disabled") and self.carry.pop(entry_id, None):
            self._save()
        return since

    def _recovered(self, entry_id: str) -> None:
        rec = self.paused.pop(entry_id, None)
        if rec is None:
            return
        self._note("back", entry_id)
        ir.async_delete_issue(self.hass, DOMAIN, self._issue_id(entry_id))
        self._announce("back", entry_id, rec=rec)

    @staticmethod
    def _issue_id(entry_id: str) -> str:
        return f"auto_pause_{entry_id}"

    def _issue(self, entry_id: str, rec: dict[str, Any], on: bool) -> None:
        if not on:
            ir.async_delete_issue(self.hass, DOMAIN, self._issue_id(entry_id))
            return
        link = f"/{PANEL_URL}?view=reliability&tab=autopause"
        ir.async_create_issue(
            self.hass,
            DOMAIN,
            self._issue_id(entry_id),
            is_fixable=False,
            learn_more_url=link,
            severity=ir.IssueSeverity.WARNING,
            translation_key="auto_pause_exhausted",
            translation_placeholders={
                "title": rec["title"],
                "days": str(END_HOURS // 24),
                "link": link,
            },
        )

    def _announce(
        self, kind: str, entry_id: str, *, rec: dict[str, Any] | None = None, **extra: Any
    ) -> None:
        from homeassistant.components import persistent_notification

        rec = rec or self.paused.get(entry_id) or {}
        texts = pick(self.hass, TEXTS)
        title_t, body_t = texts[kind]
        span = ""
        if kind == "back" and rec.get("since"):
            span = _span(datetime.fromisoformat(rec["since"]), _now())
        values = {
            "title": rec.get("title", ""),
            "domain": rec.get("domain", ""),
            "n": len(OFFSETS),
            "days": END_HOURS // 24,
            "url": PANEL_URL,
            "span": span,
            **extra,
        }
        persistent_notification.async_create(
            self.hass,
            body_t.format(**values),
            title=title_t.format(**values),
            notification_id=f"{DOMAIN}_auto_pause_{entry_id}",
        )

    # --- what may be paused ---------------------------------------------------------------------

    def _house_entry_ids(self) -> set[str]:
        """The config entries whose entities or devices a house function relies on."""
        entities = er.async_get(self.hass)
        devices = dr.async_get(self.hass)
        found: set[str] = set()
        for item in self.scanner.monitor.items:
            for member in item.get("members", ()):
                kind, _, ident = str(member.get("object_key", "")).partition(":")
                if kind == "entity" and (reg := entities.async_get(ident)):
                    if reg.config_entry_id:
                        found.add(reg.config_entry_id)
                elif kind == "device" and (dev := devices.async_get(ident)):
                    found.update(dev.config_entries)
        return found

    async def _iot_classes(self, entries: list[ConfigEntry]) -> dict[str, str | None]:
        from homeassistant.loader import async_get_integrations

        integrations = await async_get_integrations(self.hass, {e.domain for e in entries})
        return {
            domain: (
                None
                if integration is None or isinstance(integration, Exception)
                else getattr(integration, "iot_class", None)
            )
            for domain, integration in integrations.items()
        }

    def _blocked(self, entry: ConfigEntry, reauth: set[str]) -> str | None:
        """Why an entry may not be paused at all, by hand or automatically."""
        if entry.domain in NEVER:
            return "core"
        if entry.entry_id in reauth:
            return "reauth"
        if entry.entry_id in self.paused:
            return "paused"
        if entry.disabled_by is not None:
            return "disabled"
        return None

    async def report(self) -> dict[str, Any]:
        """Everything the panel shows: settings, paused entries, candidates, what needs a warning."""
        entries = self.hass.config_entries.async_entries()
        reauth = reauth_entry_ids(self.hass)
        iot = await self._iot_classes(entries)
        registry = er.async_get(self.hass)
        house = self._house_entry_ids()
        offline = {
            key.partition(":")[2]
            for key, mark in self.scanner.marks.items.items()
            if key.startswith("config_entry:") and mark.get("kind") == "expected_offline"
        }
        now = _now()
        pausable: list[dict[str, Any]] = []
        candidates = []
        for entry in entries:
            if self._blocked(entry, reauth):
                continue
            domains = {
                e.domain for e in er.async_entries_for_config_entry(registry, entry.entry_id)
            }
            warn = []
            if domains - DATA_DOMAINS:
                warn.append("control")
            if entry.entry_id in house:
                warn.append("house_function")
            pausable.append(
                {
                    "entry_id": entry.entry_id,
                    "title": entry.title,
                    "domain": entry.domain,
                    "state": entry.state.value,
                    "warn": warn,
                }
            )
            allowed = not warn or (warn == ["house_function"] and self.settings["house_functions"])
            if (
                iot.get(entry.domain) in CLOUD_CLASSES
                and domains
                and allowed
                and entry.entry_id not in offline
            ):
                summary = self.scanner.entry_states.summary(entry.entry_id, now) or {}
                candidates.append(
                    {
                        "entry_id": entry.entry_id,
                        "title": entry.title,
                        "domain": entry.domain,
                        "state": entry.state.value,
                        "attempts": summary.get("attempts") or 0,
                        "window": self.scanner.entry_states.attempts_since(
                            entry.entry_id, now - timedelta(hours=self.settings["hours"])
                        ),
                        "house_function": "house_function" in warn,
                        "excluded": entry.entry_id in self.exclude,
                    }
                )
        candidates.sort(key=lambda c: (-c["attempts"], c["title"].lower()))
        paused = []
        for entry_id, rec in self.paused.items():
            due = self._due(rec)
            paused.append(
                {
                    "entry_id": entry_id,
                    **rec,
                    "next": due.isoformat() if due else None,
                    "total": len(OFFSETS),
                }
            )
        return {
            "settings": self.settings,
            "exclude": sorted(self.exclude),
            "paused": paused,
            "candidates": candidates,
            "pausable": pausable,
            "log": self.log[::-1],
            "schedule": {"offsets": list(OFFSETS), "end_hours": END_HOURS},
        }

    # --- requests -------------------------------------------------------------------------------

    def set_settings(self, values: dict[str, Any]) -> None:
        for key, value in values.items():
            if key not in DEFAULTS:
                continue
            if isinstance(DEFAULTS[key], bool):
                if not isinstance(value, bool):
                    raise AutoPauseError("invalid")
                self.settings[key] = value
            else:
                low, high = LIMITS[key]
                if (
                    not isinstance(value, int)
                    or isinstance(value, bool)
                    or not low <= value <= high
                ):
                    raise AutoPauseError("invalid")
                self.settings[key] = value
        self._save()

    def never(self, entry_id: str, on: bool) -> None:
        (self.exclude.add if on else self.exclude.discard)(entry_id)
        self._save()

    async def pause(
        self, entry_id: str, *, reason: str, failures: int | None = None, confirm: bool = False
    ) -> None:
        entry = self.hass.config_entries.async_get_entry(entry_id)
        if entry is None:
            raise AutoPauseError("not_found")
        if blocked := self._blocked(entry, reauth_entry_ids(self.hass)):
            raise AutoPauseError(blocked)
        if reason == "manual" and not confirm:
            report = await self.report()
            if any(p["entry_id"] == entry_id and p["warn"] for p in report["pausable"]):
                raise AutoPauseError("confirm_needed")
        observed = getattr(self.scanner, "observations", None)
        began = observed.since(f"config_entry:{entry_id}", "problem") if observed else None
        if began:
            self.carry[entry_id] = began
        self.paused[entry_id] = {
            "since": _now().isoformat(),
            "reason": reason,
            "failures": failures,
            "done": 0,
            "trying": False,
            "exhausted": False,
            "title": entry.title,
            "domain": entry.domain,
        }
        await self._disable(entry_id)
        self._note("paused", entry_id)
        texts = pick(self.hass, TEXTS)
        why = (
            texts["why_auto"].format(n=failures, hours=self.settings["hours"])
            if reason == "auto"
            else texts["why_manual"]
        )
        self._announce("paused", entry_id, why=why)
        self._save()
        self._schedule()

    async def resume(self, entry_id: str) -> None:
        rec = self.paused.pop(entry_id, None)
        if rec is None:
            raise AutoPauseError("not_paused")
        self._issue(entry_id, rec, False)
        self._note("ended", entry_id)
        await self.hass.config_entries.async_set_disabled_by(entry_id, None)
        self._announce("ended", entry_id, rec=rec)
        self._save()
        self._schedule()

    def try_now(self, entry_id: str) -> None:
        if entry_id not in self.paused:
            raise AutoPauseError("not_paused")
        if entry_id in self._busy:
            raise AutoPauseError("busy")
        self.hass.async_create_background_task(
            self._attempt(entry_id, scheduled=False), f"{DOMAIN}_auto_pause_try"
        )

    async def check(self, now: datetime) -> None:
        """After a scan: pause the candidates that failed their setup often enough."""
        if not self.settings["enabled"]:
            return
        since = now - timedelta(hours=self.settings["hours"])
        report = None
        for entry in self.hass.config_entries.async_entries():
            entry_id = entry.entry_id
            if entry.state is not ConfigEntryState.SETUP_RETRY or entry_id in self.exclude:
                continue
            failures = self.scanner.entry_states.attempts_since(entry_id, since)
            if failures < self.settings["attempts"]:
                continue
            report = report or await self.report()
            if not any(c["entry_id"] == entry_id for c in report["candidates"]):
                continue
            try:
                await self.pause(entry_id, reason="auto", failures=failures, confirm=True)
            except AutoPauseError:
                continue
