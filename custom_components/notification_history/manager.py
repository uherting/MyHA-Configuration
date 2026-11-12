"""Listen to notify calls and Companion app events, keep the history up to date."""
from __future__ import annotations

from collections.abc import Callable
from datetime import timedelta
import logging
from typing import Any

from homeassistant.const import EVENT_CALL_SERVICE
from homeassistant.core import CoreState, Event, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_time_interval

from .backfill import async_fetch_past
from .const import (
    EVENT_ACTION,
    EVENT_CLEARED,
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
    ) -> None:
        self.hass = hass
        self.store = store
        self.targets = set(targets)  # empty: every target that is not excluded
        self.logbook = logbook
        self._unsubs: list[Callable[[], None]] = []

    # --- lifecycle -------------------------------------------------------

    async def async_start(self) -> None:
        hass = self.hass
        self._refresh_names()
        if hass.state is not CoreState.running:
            # Some notify entities (custom integrations) only exist once HA has fully started.
            self._unsubs.append(hass.bus.async_listen_once("homeassistant_started", lambda _: self._refresh_names()))
        self._unsubs.append(hass.bus.async_listen(EVENT_CALL_SERVICE, self._on_call, self._is_notify))
        self._unsubs.append(hass.bus.async_listen(EVENT_ACTION, self._on_action))
        self._unsubs.append(hass.bus.async_listen(EVENT_CLEARED, self._on_cleared))
        self._unsubs.append(async_track_time_interval(hass, self._purge, timedelta(hours=1)))
        if not self.store.backfilled:
            if hass.state is CoreState.running:
                hass.async_create_background_task(self.async_backfill(), "notification_history backfill")
            else:
                self._unsubs.append(
                    hass.bus.async_listen_once(
                        "homeassistant_started",
                        lambda _: hass.async_create_background_task(
                            self.async_backfill(), "notification_history backfill"
                        ),
                    )
                )

    @callback
    def _refresh_names(self) -> None:
        """Names follow renamed devices and entities (they are stored for the WebSocket list)."""
        index = _legacy_index(self.hass)
        infos = {t: resolve(self.hass, t, index) for t in {r["target"] for r in self.store.records}}
        for record in self.store.records:
            info = infos[record["target"]]
            record["target_name"] = info["name"]
            if info["device_id"] is not None:
                record["device_id"] = info["device_id"]
            if info["owner"] is not None:
                record["owner"] = info["owner"]

    async def async_stop(self) -> None:
        while self._unsubs:
            try:
                self._unsubs.pop()()
            except ValueError:  # listen_once already fired
                pass
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
        self.store.purge()
        await self.store.async_save()
        _LOGGER.info("Imported %s past notifications from the recorder", added)
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
