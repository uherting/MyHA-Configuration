"""Listen to notify calls and Companion app events, keep the history up to date."""
from __future__ import annotations

from collections.abc import Callable
from datetime import timedelta
import logging
import time
from typing import Any

from homeassistant.components.persistent_notification import (
    Notification,
    UpdateType,
    async_register_callback,
)
from homeassistant.const import EVENT_CALL_SERVICE
from homeassistant.core import CoreState, Event, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.start import async_at_started

from .backfill import async_fetch_past
from .const import (
    EVENT_ACTION,
    EVENT_CLEARED,
    PERSISTENT_TARGET,
    SIGNAL_UPDATED,
    STATUS_ACTION,
    STATUS_CLEARED,
    STATUS_REMOVED,
    STATUS_REPLACED,
    STATUS_SENT,
)
from .normalize import normalize_call
from .store import HistoryStore
from .targets import _legacy_index, resolve

_LOGGER = logging.getLogger(__name__)

# How far back a button tap or a dismissal is matched to its notification.
MATCH_WINDOW = 7 * 86400


class HistoryManager:
    """Owns the store and the event listeners of the config entry."""

    def __init__(
        self,
        hass: HomeAssistant,
        store: HistoryStore,
        targets: list[str],
        logbook: bool,
        persistent: bool = False,
    ) -> None:
        self.hass = hass
        self.store = store
        self.targets = set(targets)  # empty: every target that is not excluded
        self.logbook = logbook
        self.persistent = persistent
        self._unsubs: list[Callable[[], None]] = []

    # --- lifecycle -------------------------------------------------------

    async def async_start(self) -> None:
        hass = self.hass
        self._refresh_names()
        if hass.state is not CoreState.running:
            # Some notify entities (custom integrations) only exist once HA has fully started.
            # async_at_started, not listen_once: its unsub is safe to call after it fired.
            self._unsubs.append(async_at_started(hass, self._refresh_names_started))
        self._unsubs.append(hass.bus.async_listen(EVENT_CALL_SERVICE, self._on_call, self._is_notify))
        self._unsubs.append(hass.bus.async_listen(EVENT_ACTION, self._on_action))
        self._unsubs.append(hass.bus.async_listen(EVENT_CLEARED, self._on_cleared))
        self._unsubs.append(async_track_time_interval(hass, self._purge, timedelta(hours=1)))
        if self.persistent:
            self._unsubs.append(async_register_callback(hass, self._on_persistent))
        if not self.store.backfilled:
            self._unsubs.append(async_at_started(hass, self._start_backfill))
        elif not self.store.channels_filled:
            self._unsubs.append(async_at_started(hass, self._start_fill_channels))

    @callback
    def _refresh_names_started(self, _hass: HomeAssistant) -> None:
        self._refresh_names()

    @callback
    def _start_backfill(self, hass: HomeAssistant) -> None:
        hass.async_create_background_task(self.async_backfill(), "notification_history backfill")

    @callback
    def _start_fill_channels(self, hass: HomeAssistant) -> None:
        hass.async_create_background_task(self.async_fill_channels(), "notification_history channels")

    @callback
    def _refresh_names(self) -> None:
        """Names follow renamed devices and entities (they are stored for the WebSocket list)."""
        index = _legacy_index(self.hass)
        records = [r for r in self.store.records if r["target"] != PERSISTENT_TARGET]
        infos = {t: resolve(self.hass, t, index) for t in {r["target"] for r in records}}
        for record in records:
            info = infos[record["target"]]
            record["target_name"] = info["name"]
            if info["device_id"] is not None:
                record["device_id"] = info["device_id"]
            if info["owner"] is not None:
                record["owner"] = info["owner"]

    async def async_stop(self) -> None:
        while self._unsubs:
            self._unsubs.pop()()
        await self.store.async_save()

    async def async_backfill(self) -> None:
        """Import past notify calls from the recorder, once."""
        rows = await async_fetch_past(self.hass, self.store.max_days)
        index = _legacy_index(self.hass)
        before = len(self.store.records)
        for ts, context_id, user_id, data in rows:
            self._ingest(
                    data.get("service", ""),
                    data.get("service_data") or {},
                    ts,
                    context_id or f"past-{ts}",
                    user_id,
                    index,
                    live=False,
            )
        added = len(self.store.records) - before
        self.store.backfilled = True
        self.store.channels_filled = True  # imported records already have their channel
        self.store.purge()
        await self.store.async_save()
        _LOGGER.info("Imported %s past notifications from the recorder", added)
        async_dispatcher_send(self.hass, SIGNAL_UPDATED, None)

    async def async_fill_channels(self) -> None:
        """Once: add the channel to records made before 1.2.0, from the calls still in the recorder."""
        rows = await async_fetch_past(self.hass, self.store.max_days)
        filled = 0
        for ts, context_id, user_id, data in rows:
            records, _ = normalize_call(
                data.get("service", ""),
                data.get("service_data") or {},
                ts=ts,
                context_id=context_id or f"past-{ts}",
                user_id=user_id,
            )
            for new in records:
                old = self.store.get(new["id"])
                if old is not None and "channel" not in old:
                    old["channel"] = new["channel"]
                    filled += 1
        for record in self.store.records:
            record.setdefault("channel", None)
        self.store.channels_filled = True
        await self.store.async_save()
        _LOGGER.debug("Added the channel to %s recorded notifications", filled)
        async_dispatcher_send(self.hass, SIGNAL_UPDATED, None)

    @callback
    def _purge(self, _now: Any = None) -> None:
        if self.store.purge():
            self.store.schedule_save()
            async_dispatcher_send(self.hass, SIGNAL_UPDATED, None)

    # --- notify calls ----------------------------------------------------

    @callback
    def _is_notify(self, event_data: dict[str, Any]) -> bool:
        return event_data.get("domain") == "notify"

    @callback
    def _on_call(self, event: Event) -> None:
        data = event.data
        changed = self._ingest(
            data.get("service", ""),
            data.get("service_data") or {},
            event.time_fired_timestamp,
            event.context.id,
            event.context.user_id,
            None,
            live=True,
        )
        if changed:
            self.store.schedule_save()

    def _wanted(self, info: dict[str, Any]) -> bool:
        if info["excluded"]:
            return False
        return not self.targets or info["target"] in self.targets

    def _ingest(
        self,
        service: str,
        service_data: dict[str, Any],
        ts: float,
        context_id: str,
        user_id: str | None,
        index: dict | None,
        *,
        live: bool,
    ) -> list[dict[str, Any]]:
        records, removals = normalize_call(service, service_data, ts=ts, context_id=context_id, user_id=user_id)
        if not records and not removals:
            return []
        index = _legacy_index(self.hass) if index is None else index
        changed: list[dict[str, Any]] = []

        for target, tag in removals:
            info = resolve(self.hass, target, index)
            if not self._wanted(info):
                continue
            for record in self._same_device(info, tag, ts):
                if record["status"] in (STATUS_SENT, STATUS_REPLACED):
                    record["status"] = STATUS_REMOVED
                    changed.append(record)

        for record in records:
            info = resolve(self.hass, record["target"], index)
            if not self._wanted(info):
                continue
            record.update(target_name=info["name"], device_id=info["device_id"], owner=info["owner"])
            new = self.store.add(record)
            changed.extend(new)
            if new and live and self.logbook:
                self._log(record)

        if live:
            for record in changed:
                async_dispatcher_send(self.hass, SIGNAL_UPDATED, record)
        return changed

    def _same_device(self, info: dict[str, Any], tag: str | None, ts: float) -> list[dict[str, Any]]:
        """Records of the same device (or target) with this tag, newest first."""
        out = []
        for record in reversed(self.store.records):
            if record["ts"] < ts - MATCH_WINDOW:
                break
            same = record["target"] == info["target"] or (
                info["device_id"] is not None and record.get("device_id") == info["device_id"]
            )
            if same and (tag is None or record.get("tag") == tag):
                out.append(record)
        return out

    def _log(self, record: dict[str, Any]) -> None:
        if "logbook" not in self.hass.config.components:
            return
        text = " — ".join(p for p in (record.get("title"), record.get("message")) if p)
        self.hass.async_create_task(
            self.hass.services.async_call(
                "logbook",
                "log",
                {"name": record["target_name"], "message": text, "entity_id": record["target"]},
            )
        )

    # --- persistent notifications (option) ---------------------------------

    @callback
    def _on_persistent(self, update_type: UpdateType, notifications: dict[str, Notification]) -> None:
        """A notification was added to the sidebar bell, re-created with the same id, or dismissed.

        Only what happens while the integration is loaded is seen: the bell is not read at startup.
        """
        changed: list[dict[str, Any]] = []
        if update_type in (UpdateType.ADDED, UpdateType.UPDATED):
            for notification_id, notification in notifications.items():
                title, message = notification.get("title") or None, notification.get("message") or None
                if title is None and message is None:
                    continue
                ts = round(notification["created_at"].timestamp(), 6)
                record = {
                    "id": f"{PERSISTENT_TARGET}:{notification_id}:{ts}",
                    "ts": ts,
                    "target": PERSISTENT_TARGET,
                    "target_name": None,  # the card shows its own translated label
                    "device_id": None,
                    "owner": None,  # admins only, like the other targets without a device
                    "title": title,
                    "message": message,
                    "image": None,
                    "video": None,
                    "audio": None,
                    "link": None,
                    "actions": [],
                    # Re-creating a notification with the same id replaces it in the bell.
                    "tag": notification_id,
                    "group": None,
                    "channel": None,
                    "camera": None,
                    "sub_targets": [],
                    "context_id": None,
                    "sent_by": None,
                    "status": STATUS_SENT,
                }
                changed.extend(self.store.add(record))
        elif update_type is UpdateType.REMOVED:
            for notification_id in notifications:
                record = self.store.latest(PERSISTENT_TARGET, notification_id, time.time() - MATCH_WINDOW)
                if record is not None and record["status"] == STATUS_SENT:
                    record["status"] = STATUS_CLEARED
                    changed.append(record)
        if changed:
            self.store.schedule_save()
            for record in changed:
                async_dispatcher_send(self.hass, SIGNAL_UPDATED, record)

    # --- Companion app events ---------------------------------------------

    def _candidates(self, user_id: str | None, tag: str | None, now: float) -> list[dict[str, Any]]:
        out = []
        for record in reversed(self.store.records):
            if record["ts"] < now - MATCH_WINDOW:
                break
            if record.get("owner") is None:
                continue
            if user_id is not None and record["owner"] != user_id:
                continue
            if tag is not None and record.get("tag") != tag:
                continue
            out.append(record)
        return out

    def mark_action(self, record: dict[str, Any], action: dict[str, str], ts: float) -> None:
        record.update(status=STATUS_ACTION, action_title=action["title"], action_ts=round(ts, 3))
        self.store.schedule_save()
        async_dispatcher_send(self.hass, SIGNAL_UPDATED, record)

    @callback
    def _on_action(self, event: Event) -> None:
        """A button was tapped on a device: tag the notification it came from."""
        action_id = event.data.get("action")
        if not action_id or event.data.get("source") == "notification_history":
            return
        for record in self._candidates(event.context.user_id, event.data.get("tag"), event.time_fired_timestamp):
            action = next((a for a in record.get("actions", []) if a["action"] == action_id), None)
            if action:
                self.mark_action(record, action, event.time_fired_timestamp)
                return

    @callback
    def _on_cleared(self, event: Event) -> None:
        """Android: a notification was dismissed on the device."""
        data = event.data
        tag, message = data.get("tag"), data.get("message")
        for record in self._candidates(event.context.user_id, tag, event.time_fired_timestamp):
            if tag is None and record.get("message") != message:
                continue
            if record["status"] == STATUS_SENT:
                record["status"] = STATUS_CLEARED
                self.store.schedule_save()
                async_dispatcher_send(self.hass, SIGNAL_UPDATED, record)
            return
