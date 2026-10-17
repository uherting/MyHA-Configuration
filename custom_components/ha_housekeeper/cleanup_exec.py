"""Executing confirmed cleanup plans. This is the only module that changes Home Assistant.

Entities:

* ``disable_entity`` quarantines an entity by disabling it. Nothing is deleted, history and
  statistics are never touched, and the step can be undone while the entity is unchanged.
* ``remove_entity`` removes the registry entry of an entity that has been in quarantine for at
  least ``QUARANTINE_DAYS``. A Home Assistant backup is created first and must complete, and the
  entry is stored in the journal so that it can be restored.

Devices (same quarantine and backup rules; removing a device also removes its entities):

* ``disable_device`` quarantines a device.
* ``remove_device`` uses the official path: the integration is asked and may refuse.
* ``forget_device`` removes the registry entry although the integration offers no removal, then
  reloads the integration. Hubs and devices with children are never touched.

References:

* ``replace_references`` rewrites exact references to one entity in automations, scripts, scenes,
  storage dashboards and the Energy dashboard. Each source is stored in the journal before it is
  rewritten and put back on undo while it is still exactly as Housekeeper left it.

Meters:

* ``migrate_meter`` joins the long-term statistics of a replaced meter in front of its successor
  (experimental: it writes into the recorder database, so a backup is mandatory and statistics
  cannot be undone) and/or lets the new entity take over the old entity ID. The old entity moves
  to a free ``_alt`` ID; Home Assistant moves history and statistics along with every rename.

Counters:

* ``repair_counter`` replaces the wrong readings of a counter in the raw states and in both
  statistics tables and rebuilds the sums that the wrong readings spoiled. The overwritten values
  stay in the journal, so the repair can be undone while the rows are still as it left them.

Every step is re-checked right before it runs, journaled, and the run stops at the first surprise.
"""

from __future__ import annotations

import asyncio
import contextlib
import copy
import hashlib
import inspect
import logging
import secrets
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any, cast

from homeassistant import loader
from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import label_registry as lr
from homeassistant.util.file import write_utf8_file_atomic
from homeassistant.util.yaml import dump, parse_yaml

from . import counter_repair, followup
from . import refactor as refactor_module
from . import rename as rename_module
from .automation_delete import preview as preview_automation_delete
from .backup_cleanup import backup_exists, delete_backup, list_backups, verify_backup
from .cleanup import (
    AREA_KINDS,
    BACKUP_KINDS,
    DATABASE_KINDS,
    DELETE_AUTOMATION_KINDS,
    DELETE_BACKUP_KINDS,
    DELETE_CANDIDATE_RULES,
    DEVICE_KINDS,
    EXECUTABLE_KINDS,
    INTERNAL_RESULT_KEYS,
    LABEL_KINDS,
    METER_KINDS,
    PLAN_MAX_AGE_HOURS,
    PURGE_KINDS,
    REFACTOR_KINDS,
    REFERENCE_KINDS,
    REMOVAL_KINDS,
    RENAME_KINDS,
    REPAIR_KINDS,
    STATE_KINDS,
    TRIM_KINDS,
    device_fingerprint,
    device_support,
    end_interrupted,
    get_main_device,
    judge_action,
    judge_purge_action,
    judge_rename_action,
    registry_fingerprint,
    trim_is_plain,
)
from .const import DOMAIN, MAX_FILE_BACKUP, MAX_PLAN_SNAPSHOTS
from .db_health import (
    BACKUP_SPACE_SHARE,
    DISK_STOP_BYTES,
    database_files,
    integrity_fresh,
    integrity_problem,
    is_corruption_error,
    start_check,
)
from .issues import async_sync_database_issue
from .meter import analyse, prepare_meter, read_series, recorder_ready
from .notes import NoteError
from .protection import allows, allows_undo
from .recorder_purge import (
    count_older,
    count_trim,
    delete_statistics,
    statistics_left,
    trim_extra,
    trim_states,
)
from .references import (
    ENERGY_PARTS,
    YAML_FILES,
    SourceError,
    find_yaml_item,
    load_file,
    load_source,
    preview_replacement,
    rewrite,
    yaml_hash,
)
from .texts import pick
from .writelock import WriteBusy, acquire_write, release_write, write_holder

TOKEN_TTL = timedelta(minutes=5)
ID_FREE_TIMEOUT = 10.0  # seconds to wait until Home Assistant has removed a renamed entity's state
STATISTIC_KEYS = ("state", "sum", "min", "max", "mean")
_LOGGER = logging.getLogger(__name__)

# The logbook entry of a removed or forgotten device: the sentence and the two words (forgotten, removed).
LOGBOOK_DEVICE = {
    "de": ("Gerät „{}“ {}", ("vergessen", "entfernt")),
    "en": ("Device “{}” {}", ("forgotten", "removed")),
}

LOGBOOK_KINDS = ("remove_device", "forget_device")  # written to the logbook when done
# Recorder steps do not depend on each other: one that fails must not hold back the others,
# unless the cause is shared by all of them.
INDEPENDENT_KINDS = PURGE_KINDS | TRIM_KINDS
GLOBAL_STOPS = {"recorder_busy", "no_recorder"}
LOCAL_AGENT = "backup.local"
BACKUP_TIMEOUT = 30 * 60  # seconds; large installations can take a while
BUSY_BACKUP_STATES = {"create_backup", "receive_backup", "restore_backup", "blocked"}
RECORDER_BACKLOG_STOP = 10_000  # queued recorder writes; the recorder normally keeps this near zero
INTEGRITY_TIMEOUT = (
    5 * 60
)  # seconds; the check of a very large database is not worth waiting longer


def backup_is_local_only(hass: HomeAssistant) -> bool:
    """True when no backup location is set up, so a plan's backup stays in the local storage."""
    try:
        from homeassistant.components.backup import async_get_manager

        return not async_get_manager(hass).config.data.create_backup.agent_ids
    except Exception:
        return False


class CleanupError(Exception):
    """A plan cannot be confirmed, executed or undone; the message code is user-facing."""


class StepAbort(Exception):
    """One step must not run; ``reason`` is the user-facing code recorded in the journal."""

    def __init__(self, reason: str, result: dict[str, Any] | None = None) -> None:
        super().__init__(reason)
        self.reason = reason
        # What was already changed and could not be put back; journalled so it is never lost.
        self.result = result


def _now() -> datetime:
    return datetime.now(UTC)


def _event(plan: dict[str, Any], kind: str, **detail: Any) -> None:
    """Append to the plan's audit log. Entries are only ever added."""
    plan["events"].append({"at": _now().isoformat(), "type": kind, **detail})


def _value(value: Any) -> Any:
    return getattr(value, "value", value)


def entity_restorable(hass: HomeAssistant, entry: Any) -> bool | None:
    """Whether a removed registry entry could be brought back (its config entry still exists)."""
    if entry is None:
        return None
    if entry.config_entry_id is None:
        return True
    return hass.config_entries.async_get_entry(entry.config_entry_id) is not None


def _state_reached(entry: Any, target: str) -> bool:
    """Whether a registry entry shows the state ``target`` asked for."""
    return {
        "disable": entry.disabled_by is not None,
        "enable": entry.disabled_by is None,
        "hide": entry.hidden_by is not None,
        "unhide": entry.hidden_by is None,
    }[target]


def _restore_data(entry: Any) -> dict[str, Any]:
    """Everything needed to recreate a registry entry, stored in the journal before removal."""
    fields = (
        "entity_id",
        "platform",
        "unique_id",
        "config_entry_id",
        "config_subentry_id",
        "device_id",
        "area_id",
        "name",
        "icon",
        "original_name",
        "original_icon",
        "original_device_class",
        "device_class",
        "translation_key",
        "unit_of_measurement",
        "supported_features",
        "has_entity_name",
        "capabilities",
    )
    data = {name: getattr(entry, name, None) for name in fields}
    data.update(
        entity_category=_value(entry.entity_category),
        hidden_by=_value(entry.hidden_by),
        disabled_by=_value(entry.disabled_by),
        labels=sorted(entry.labels),
        aliases=sorted(alias for alias in entry.aliases if isinstance(alias, str)),
        # The "use the computed name" sentinel of newer Home Assistant versions is not text.
        computed_alias=any(not isinstance(alias, str) for alias in entry.aliases),
    )
    return data


def _restored_aliases(data: dict[str, Any]) -> set[Any]:
    """The aliases to put back, including the computed-name marker where there was one."""
    aliases: set[Any] = set(data["aliases"])
    if data.get("computed_alias"):
        try:
            from homeassistant.helpers.entity_registry import COMPUTED_NAME
        except ImportError:  # a Home Assistant version without the marker
            return aliases
        aliases.add(COMPUTED_NAME)
    return aliases


def _device_restore_data(entry: Any) -> dict[str, Any]:
    """The registry fields of a device that a restore needs, stored in the journal."""
    data = {
        name: getattr(entry, name, None)
        for name in (
            "id",
            "name",
            "name_by_user",
            "manufacturer",
            "model",
            "area_id",
            "via_device_id",
        )
    }
    data.update(
        identifiers=sorted(map(list, entry.identifiers)),
        connections=sorted(map(list, entry.connections)),
        config_entry_id=entry.config_entry_id,
        config_subentry_id=entry.config_subentry_id,
        config_entries=[entry.config_entry_id],  # as earlier versions journalled it
        labels=sorted(entry.labels),
        disabled_by=_value(entry.disabled_by),
    )
    return data


def _parameter_names(function: Any) -> set[str]:
    """The names a function takes, read from its code: ``inspect.signature`` evaluates the
    annotations on Python 3.14 and fails on names that Home Assistant imports only for typing."""
    code = getattr(getattr(function, "__func__", function), "__code__", None)
    if code is None:
        return set(inspect.signature(function).parameters)
    return set(code.co_varnames[: code.co_argcount + code.co_kwonlyargcount])


def _bytes_hash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()[:16]


def _write_yaml_item(
    path: str, kind: str, ref: str, expected_hash: str, item: Any
) -> tuple[str, dict[str, Any]]:
    """Blocking: replace one item in a YAML file if it is still as it was read.

    Returns the old item as text and, for files up to ``MAX_FILE_BACKUP``, the whole old file
    with the hash of the new one: writing the file again loses comments and formatting, so
    only the old file itself puts it back exactly.
    """
    data, _ = load_file(path)
    current = find_yaml_item(kind, data, ref)
    if current is None or yaml_hash(current) != expected_hash:
        raise StepAbort("source_changed")
    before = dump(current)
    raw = Path(path).read_bytes()
    if kind == "script":
        data[ref] = item
    else:
        data[next(i for i, existing in enumerate(data) if existing is current)] = item
    write_utf8_file_atomic(path, dump(data))
    extra: dict[str, Any] = {}
    if len(raw) <= MAX_FILE_BACKUP:
        try:
            extra = {
                "file_before": raw.decode("utf-8"),
                "file_after_hash": _bytes_hash(Path(path).read_bytes()),
            }
        except UnicodeDecodeError:
            extra = {}
    return before, extra


def _delete_yaml_item(
    path: str, kind: str, ref: str, expected_hash: str
) -> tuple[str, dict[str, Any]]:
    """Blocking: remove one item from a YAML file if it is still as it was read.

    The whole old file is kept for the undo (writing the file again loses comments and formatting),
    so a file that is too large or not text is refused before anything is written.
    """
    data, _ = load_file(path)
    current = find_yaml_item(kind, data, ref)
    if current is None or yaml_hash(current) != expected_hash:
        raise StepAbort("source_changed")
    raw = Path(path).read_bytes()
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as err:
        raise StepAbort("file_too_large") from err
    if len(raw) > MAX_FILE_BACKUP:
        raise StepAbort("file_too_large")
    before = dump(current)
    if kind == "script":
        del data[ref]
    else:
        del data[next(i for i, existing in enumerate(data) if existing is current)]
    write_utf8_file_atomic(path, dump(data))
    return before, {
        "file_before": text,
        "file_after_hash": _bytes_hash(Path(path).read_bytes()),
    }


def _restore_yaml_file(path: str, text_before: str, expected_hash: str) -> bool:
    """Blocking: put the old file back byte for byte if it is still as Housekeeper wrote it."""
    if _bytes_hash(Path(path).read_bytes()) != expected_hash:
        return False
    write_utf8_file_atomic(path, text_before.encode("utf-8"), mode="wb")
    return True


class CleanupRunner:
    """Confirm, execute and undo plans, one at a time."""

    def __init__(self, hass: HomeAssistant, scanner: Any) -> None:
        self.hass = hass
        self.scanner = scanner
        self._tokens: dict[str, tuple[str, datetime, list[str], str | None]] = {}
        self._cancel = False
        self._lineage: dict[str, dict[str, str]] = {}
        self._task: asyncio.Task[None] | None = None
        self.status: dict[str, Any] = {
            "running": False,
            "plan_id": None,
            "phase": None,
            "done": 0,
            "total": 0,
        }

    @property
    def running(self) -> bool:
        """Whether a plan is being executed or undone right now."""
        return bool(self.status["running"])

    async def wait(self) -> None:
        """Wait until the plan that was started last has finished, including its verification."""
        if self._task is not None:
            await asyncio.shield(self._task)

    def cancel(self) -> None:
        """Stop after the current step."""
        self._cancel = True

    async def _keep_undo_data(self, result: dict[str, Any]) -> None:
        """Save the journal at once when the undo of a step needs data only the journal holds.

        A removed entry or a rewritten file can only be put back from that data, so it must not
        wait for the save delay (a crash in between would lose it). Other steps save delayed.
        """
        if INTERNAL_RESULT_KEYS & result.keys() or result.get("sources"):
            await self.flush_journal()
        else:
            self.scanner.journal.save()

    async def flush_journal(self) -> None:
        """Write the journal now instead of after the save delay (before an unload)."""
        journal = self.scanner.journal
        await journal.store.async_save(journal.data())

    def _drop_expired_tokens(self) -> None:
        """Forget confirmations nobody redeemed in time, so abandoned ones do not pile up."""
        now = _now()
        for plan_id in [key for key, saved in self._tokens.items() if saved[1] < now]:
            del self._tokens[plan_id]

    def confirm(self, plan_id: str, acknowledged: list[str], user_id: str | None) -> dict[str, Any]:
        """Select the actions that may run and hand out a short-lived confirmation token."""
        self._drop_expired_tokens()
        plan = self._plan(plan_id)
        if self.scanner.warming_up:
            raise CleanupError("warming_up")
        if plan["status"] != "dry_run" or plan.get("run"):
            raise CleanupError("plan_not_open")
        age = _now() - datetime.fromisoformat(plan["created_at"])
        if age > timedelta(hours=PLAN_MAX_AGE_HOURS):
            raise CleanupError("plan_too_old")
        acknowledged_set = set(acknowledged)
        selected, needs_ack, skipped = [], [], []
        for action in plan["actions"]:
            if action["kind"] not in EXECUTABLE_KINDS or not action.get("executable"):
                skipped.append(action["object_id"])
            elif action["verdict"] == "ok" or action["object_id"] in acknowledged_set:
                selected.append(action["object_id"])
            else:
                needs_ack.append(action["object_id"])
        if not selected:
            raise CleanupError("nothing_to_do")
        self._check_mode(plan, selected)
        token = secrets.token_urlsafe(16)
        self._tokens[plan_id] = (token, _now() + TOKEN_TTL, selected, user_id)
        plan["confirmed"] = {"at": _now().isoformat(), "user_id": user_id, "object_ids": selected}
        _event(plan, "confirmed", user_id=user_id, count=len(selected))
        self.scanner.journal.save()
        return {
            "plan_id": plan_id,
            "token": token,
            "expires_at": (_now() + TOKEN_TTL).isoformat(),
            "execute": selected,
            "removals": [
                a["object_id"]
                for a in plan["actions"]
                if a["object_id"] in selected and a["kind"] in REMOVAL_KINDS
            ],
            "rewrites": [
                a["object_id"]
                for a in plan["actions"]
                if a["object_id"] in selected
                and a["kind"] in REFERENCE_KINDS | RENAME_KINDS | REFACTOR_KINDS
            ],
            "migrations": [
                a["object_id"]
                for a in plan["actions"]
                if a["object_id"] in selected and a["kind"] in METER_KINDS
            ],
            "needs_acknowledgement": needs_ack,
            "skipped": skipped,
        }

    def start(self, plan_id: str, token: str, user_id: str | None) -> None:
        """Validate the token and run the plan in the background."""
        self._drop_expired_tokens()
        if self.running or write_holder(self.hass):
            raise CleanupError("busy")
        plan = self._plan(plan_id)
        if self.scanner.warming_up:
            raise CleanupError("warming_up")
        saved = self._tokens.get(plan_id)
        if saved is not None and saved[3] != user_id:
            raise CleanupError("wrong_user")
        self._tokens.pop(plan_id, None)
        if saved is None or not secrets.compare_digest(saved[0], token) or saved[1] < _now():
            raise CleanupError("bad_token")
        if plan["status"] != "dry_run" or plan.get("run"):
            raise CleanupError("plan_not_open")
        self._check_mode(plan, saved[2])
        try:
            acquire_write(self.hass, "plan")
        except WriteBusy as busy:
            raise CleanupError("busy") from busy
        self._cancel = False
        self.scanner.paused = True
        self.status = {
            "running": True,
            "plan_id": plan_id,
            "phase": "starting",
            "done": 0,
            "total": len(saved[2]),
        }
        self._task = self.hass.async_create_background_task(
            self._run(plan, saved[2], user_id), "HA Housekeeper cleanup run"
        )

    async def _run(self, plan: dict[str, Any], object_ids: list[str], user_id: str | None) -> None:
        try:
            await self._run_plan(plan, object_ids, user_id)
            await self._verify(plan)
            if self._deleted_from_recorder(plan):
                # In the background, like the check on the Recorder page: a damage the run caused
                # or ran into shows up as a finding and a repair hint, not at the next plan.
                start_check(self.hass, self.scanner.events)
        finally:
            release_write(self.hass, "plan")  # whatever happens, the slot must not stay taken

    @staticmethod
    def _deleted_from_recorder(plan: dict[str, Any]) -> bool:
        return any(
            (action["kind"] in DATABASE_KINDS or action.get("recorder"))
            and (action.get("result") or {}).get("state") == "done"
            for action in plan["actions"]
        )

    async def _run_plan(
        self, plan: dict[str, Any], object_ids: list[str], user_id: str | None
    ) -> None:
        journal = self.scanner.journal
        plan["status"] = "running"
        plan["run"] = {"started_at": _now().isoformat(), "user_id": user_id, "finished_at": None}
        _event(plan, "started", user_id=user_id)
        journal.save()
        try:
            by_id = {action["object_id"]: action for action in plan["actions"]}
            selected = [by_id[object_id] for object_id in object_ids]
            kinds = {action["kind"] for action in selected}
            if kinds & BACKUP_KINDS:
                writes_recorder = bool(kinds & DATABASE_KINDS) or any(
                    action.get("recorder") for action in selected
                )
                if not await self._others_idle(plan, writes_recorder):
                    return
                if writes_recorder and not (
                    await self._disk_has_room(plan) and await self._database_intact(plan)
                ):
                    return
                await self._backup(plan, with_database=writes_recorder)
            if plan["status"] == "running":
                await self._execute(plan, object_ids)
        except asyncio.CancelledError:  # Home Assistant stops: the journal must not say "running"
            end_interrupted(plan, _now().isoformat())
            raise
        except Exception as err:  # Never leave the plan in "running".
            corrupt = is_corruption_error(err)
            _event(
                plan,
                "failed",
                error=f"{type(err).__name__}: {err}",
                **({"reason": "database_corrupt"} if corrupt else {}),
            )
            if corrupt:
                self._note_damage(str(err))
                for action in plan["actions"]:
                    action.setdefault(
                        "result",
                        {
                            "state": "not_run",
                            "at": _now().isoformat(),
                            "reason": "database_corrupt",
                        },
                    )
            plan["status"] = "partial" if plan["executed"] else "aborted"
        finally:
            plan["run"]["finished_at"] = _now().isoformat()
            self.scanner.paused = False
            self.status = {
                "running": False,
                "plan_id": plan["plan_id"],
                "phase": None,
                "done": 0,
                "total": 0,
            }
            journal.save()

    async def _others_idle(self, plan: dict[str, Any], writes_recorder: bool) -> bool:
        """Nothing is started while Home Assistant itself makes a backup or the recorder is struggling.

        A plan that stops here has changed nothing and can be started again a little later.
        What cannot be read (no backup component, no recorder) does not stop it.
        """
        try:
            from homeassistant.components.backup import async_get_manager

            state = getattr(getattr(async_get_manager(self.hass), "state", None), "value", None)
        except Exception:
            state = None
        if state in BUSY_BACKUP_STATES:
            return self._stop_before_start(plan, "backup_running", state=state)
        if writes_recorder and recorder_ready(self.hass):
            try:
                from homeassistant.components.recorder import get_instance

                instance = get_instance(self.hass)
                migrating = getattr(instance, "migration_in_progress", False) is True
                backlog = getattr(instance, "backlog", None)
            except Exception:
                return True
            if migrating:
                return self._stop_before_start(plan, "recorder_migrating")
            if isinstance(backlog, int) and backlog >= RECORDER_BACKLOG_STOP:
                return self._stop_before_start(plan, "recorder_backlog", backlog=backlog)
        return True

    def _stop_before_start(self, plan: dict[str, Any], reason: str, **detail: Any) -> bool:
        _LOGGER.warning("A plan was not started: %s", reason)
        self._backup_failed(plan, reason, **detail)
        return False

    async def _disk_has_room(self, plan: dict[str, Any]) -> bool:
        """A nearly full disk stops the plan: SQLite needs room for its journal, the backup for a copy.

        Less room than about half of the database stops it too.

        A disk that cannot be measured (no recorder, another database) does not stop it.
        """
        if not recorder_ready(self.hass):
            return True
        try:
            files = await self.hass.async_add_executor_job(database_files, self.hass)
        except Exception:
            return True
        free = files.get("disk_free")
        # The backup holds a copy of the database; it is packed, so about half of it is a guess.
        needed = max(DISK_STOP_BYTES, int((files.get("db_bytes") or 0) * BACKUP_SPACE_SHARE))
        if free is None or free >= needed:
            return True
        _LOGGER.warning("Too little free space for the recorder database (%s bytes)", free)
        self._backup_failed(plan, "disk_low", free_bytes=free, needed_bytes=needed)
        return False

    def _note_damage(self, line: str) -> None:
        """Keep a damage the plan ran into like the result of a check: a finding and a repair hint."""
        self.scanner.events.record_integrity(_now(), "damaged", [line])
        async_sync_database_issue(self.hass, self.scanner.events.integrity)

    async def _database_intact(self, plan: dict[str, Any]) -> bool:
        """Check the SQLite file (full integrity check) before anything is deleted; a damaged one stops the plan.

        A check that cannot run (no recorder, another database, timeout) does not stop it.
        """
        if not recorder_ready(self.hass) or integrity_fresh(self.scanner.events, _now()):
            return True  # a clean full check of the last days stands in for this one
        from homeassistant.components.recorder import get_instance

        self.status["phase"] = "check"
        try:
            async with asyncio.timeout(INTEGRITY_TIMEOUT):
                problem = await get_instance(self.hass).async_add_executor_job(
                    integrity_problem, self.hass
                )
        except Exception as err:
            if is_corruption_error(err):
                problem = str(err)
            else:
                _LOGGER.debug("The database check did not run", exc_info=True)
                return True
        if problem is None:
            return True
        _LOGGER.warning("The recorder database is damaged, nothing was changed: %s", problem)
        self._note_damage(problem)
        self._backup_failed(plan, "database_corrupt", error=problem)
        return False

    async def _backup(self, plan: dict[str, Any], with_database: bool = True) -> None:
        """Create a Home Assistant backup and wait for it: Home Assistant only, no apps or folders.

        The backup keeps the agents and the password of the user's automatic backup settings, but
        holds only the Home Assistant configuration, plus the database when the plan writes into
        it. It is a manual backup (no retention, not counted as the regular one). The call returns
        only after the backup has finished and raises if it failed, so reaching the next line
        means the backup exists.
        """
        self.status["phase"] = "backup"
        plan["status"] = "backup"
        self.scanner.journal.save()
        try:
            from homeassistant.components.backup import async_get_manager

            manager = async_get_manager(self.hass)
        except Exception:
            self._backup_failed(plan, "backup_unavailable")
            return
        settings = manager.config.data.create_backup
        # Without automatic backups set up there is no agent and no password: the backup then goes
        # to Home Assistant's own storage and is not encrypted, so nobody has to invent a key first.
        agent_ids = list(settings.agent_ids) or [LOCAL_AGENT]
        _event(plan, "backup_started")
        # A plan asks for the full backup only after the small one failed and the person chose it
        # (a new preview with ``full_backup``). It follows the contents of the user's automatic
        # backup settings but is a manual backup: no retention, no effect on the schedule.
        name = f"Housekeeper {plan['plan_id'][:8]}"
        full = bool(plan.get("full_backup"))
        scope = "full" if full else "database" if with_database else "config"
        try:
            async with asyncio.timeout(BACKUP_TIMEOUT):
                created = await manager.async_create_backup(
                    agent_ids=agent_ids,
                    extra_metadata={"housekeeper": True, "housekeeper_scope": scope},
                    include_addons=list(getattr(settings, "include_addons", None) or [])
                    if full
                    else None,
                    include_all_addons=bool(getattr(settings, "include_all_addons", False))
                    and full,
                    include_database=True if full else with_database,
                    include_folders=list(getattr(settings, "include_folders", None) or [])
                    if full
                    else None,
                    include_homeassistant=True,
                    name=name,
                    password=getattr(settings, "password", None),
                )
        except Exception as err:
            # No automatic way out: a full backup takes much longer, so the person decides.
            _LOGGER.warning("The backup before a plan failed (%s)", scope, exc_info=True)
            reason = "backup_failed" if full else "backup_small_failed"
            self._backup_failed(plan, reason, error=f"{type(err).__name__}: {err}")
            return
        if problem := await verify_backup(self.hass, name, full or with_database):
            # The call came back but the backup is not in the list as it should be: do not rely on it.
            _LOGGER.warning("The backup before a plan could not be verified (%s)", problem)
            self._backup_failed(plan, "backup_unverified", problem=problem)
            return
        plan["backup"] = {
            "name": name,  # how to find it in Home Assistant's backup list when a restore is needed
            "job_id": getattr(created, "backup_job_id", None),
            "at": _now().isoformat(),
            "scope": scope,
            # Without a configured location the backup stays in Home Assistant's own storage.
            "local_only": not settings.agent_ids,
        }
        _event(plan, "backup_done", job_id=plan["backup"]["job_id"])
        plan["status"] = "running"
        self.scanner.journal.save()

    def _backup_failed(self, plan: dict[str, Any], reason: str, **detail: Any) -> None:
        """Without a verified backup nothing is removed or disabled."""
        _event(plan, "aborted", reason=reason, **detail)
        for action in plan["actions"]:
            action.setdefault(
                "result", {"state": "not_run", "at": _now().isoformat(), "reason": reason}
            )
        plan["status"] = "aborted"

    async def _execute(self, plan: dict[str, Any], object_ids: list[str]) -> None:
        self.status["phase"] = "running"
        self._lineage = {}
        snapshot = await self.scanner.async_scan()
        context = {
            "snapshot": snapshot,
            "entities": {
                o["object_id"]: o for o in snapshot["objects"] if o["object_type"] == "entity"
            },
            "devices": {
                o["object_id"]: o for o in snapshot["objects"] if o["object_type"] == "device"
            },
            "quarantine": {q["object_id"]: q["since"] for q in snapshot.get("quarantine", [])},
            "acknowledged": set(object_ids),
        }
        by_id = {action["object_id"]: action for action in plan["actions"]}
        skipped = False  # an independent recorder step that did not run (or did not finish)
        for index, object_id in enumerate(object_ids):
            action = by_id[object_id]
            if self._cancel:
                self._abort(plan, "cancelled", object_ids[index:])
                return
            carry_on = action["kind"] in INDEPENDENT_KINDS
            reason = await self._precheck(action, context)
            if reason:
                if carry_on and reason not in GLOBAL_STOPS:
                    skipped = self._skip(plan, action, reason) or skipped
                    continue
                self._abort(plan, reason, object_ids[index:], object_id)
                return
            try:
                result, event = await self._perform(plan, action)
            except StepAbort as stop:
                carry_on = carry_on and stop.reason not in GLOBAL_STOPS
                if stop.result is None:
                    if carry_on:
                        skipped = self._skip(plan, action, stop.reason) or skipped
                        continue
                    self._abort(plan, stop.reason, object_ids[index:], object_id)
                    return
                # Something stayed changed: keep it as a done step so an undo can retry it.
                action["result"] = {
                    "state": "done",
                    "at": _now().isoformat(),
                    "stopped": stop.reason,
                    **stop.result,
                }
                _event(plan, "rollback_incomplete", object_id=object_id, reason=stop.reason)
                plan["executed"] = True
                await self._keep_undo_data(action["result"])
                if carry_on:
                    skipped = True
                    continue
                self._abort(plan, stop.reason, object_ids[index + 1 :], object_id)
                return
            action["result"] = {"state": "done", "at": _now().isoformat(), **result}
            _event(plan, event, object_id=object_id)
            if action["kind"] in LOGBOOK_KINDS:
                self._write_logbook(plan, action)
            if action.get("recorder"):
                action["result"].update(await self._purge_after_removal(plan, action))
            plan["executed"] = True
            self.status["done"] = index + 1
            await self._keep_undo_data(action["result"])
            if stopped := action["result"].get("stopped"):
                self._abort(plan, stopped, object_ids[index + 1 :], object_id)
                return
        if skipped:
            plan["status"] = "partial" if plan["executed"] else "aborted"
            return
        plan["status"] = "executed"

    def _skip(self, plan: dict[str, Any], action: dict[str, Any], reason: str) -> bool:
        """One independent step stays undone; the run goes on with the next one."""
        action["result"] = {"state": "not_run", "at": _now().isoformat(), "reason": reason}
        _event(plan, "step_skipped", object_id=action["object_id"], reason=reason)
        return True

    def _write_logbook(self, plan: dict[str, Any], action: dict[str, Any]) -> None:
        """Enter a removed or forgotten device in the logbook; the entry outlives the device."""
        name = str(action.get("name") or action["object_id"])
        text, words = pick(self.hass, LOGBOOK_DEVICE)
        forgot = action["kind"] == "forget_device"
        try:
            self.scanner.notes.upsert(
                None,
                text.format(name, words[not forgot])[:80],
                _now().isoformat(),
                f"device:{action['object_id']}",
                "",
                _now(),
                source="housekeeper",
                ref=f"{action['kind']}:{action['object_id']}"[:64],
            )
        except NoteError:
            _LOGGER.debug("Logbook entry for %s not written", action["object_id"])

    async def _perform(self, plan: dict[str, Any], action: dict[str, Any]) -> tuple[dict, str]:
        """Carry out one checked action; returns what to journal and the event name."""
        kind, object_id = action["kind"], action["object_id"]
        if kind == "remove_entity":
            registry = er.async_get(self.hass)
            entry = registry.async_get(object_id)
            restore = _restore_data(entry)
            registry.async_remove(object_id)
            return {"before": registry_fingerprint(entry), "restore": restore}, "removed"
        if kind == "disable_entity":
            registry = er.async_get(self.hass)
            entry = registry.async_get(object_id)
            updated = registry.async_update_entity(
                object_id, disabled_by=er.RegistryEntryDisabler.USER
            )
            return {
                "before": registry_fingerprint(entry),
                "after": registry_fingerprint(updated),
            }, "disabled"
        if kind == "disable_device":
            devices = dr.async_get(self.hass)
            device = get_main_device(devices, object_id)
            disabled = devices.async_update_device(
                object_id, disabled_by=dr.DeviceEntryDisabler.USER
            )
            return {
                "before": device_fingerprint(device),
                "after": device_fingerprint(disabled),
            }, "device_disabled"
        if kind == "remove_device":
            return await self._remove_device(action), "device_removed"
        if kind == "forget_device":
            return await self._forget_device(action), "device_forgotten"
        if kind in METER_KINDS:
            return await self._migrate_meter(action), "meter_migrated"
        if kind in PURGE_KINDS:
            return await self._purge_statistics(action), "statistics_purged"
        if kind in TRIM_KINDS:
            return await self._trim_history(action), "history_trimmed"
        if kind in DELETE_BACKUP_KINDS:
            return await self._delete_backup(action), "backup_deleted"
        if kind in DELETE_AUTOMATION_KINDS:
            return await self._delete_automation(action), "automation_deleted"
        if kind in AREA_KINDS:
            return self._set_area(action), "area_set"
        if kind in RENAME_KINDS:
            return await self._rename_entity(action), "entity_renamed"
        if kind in STATE_KINDS:
            return self._set_entity_state(action), "entity_state_set"
        if kind in LABEL_KINDS:
            registry = er.async_get(self.hass)
            entry = registry.async_get(object_id)
            if entry is None:
                raise StepAbort("entity_gone")
            updated = registry.async_update_entity(
                object_id, labels=set(entry.labels) | {action["target"]}
            )
            return {
                "before": registry_fingerprint(entry),
                "after": registry_fingerprint(updated),
                "label": action["target"],
            }, "labeled"
        if kind in REPAIR_KINDS:
            return await self._repair_counter(action), "counter_repaired"
        if kind in REFACTOR_KINDS:
            return await self._refactor_automation(action), "automation_refactored"
        return await self._replace_references(action), "references_replaced"

    async def _purge_after_removal(self, plan: dict[str, Any], action: dict[str, Any]) -> dict:
        """Delete the recorder data of a removed entity or device as the person chose.

        The removal stays done when this fails: it can be undone, the deleted data cannot. The
        outcome is noted in the result either way.
        """
        ids = action.get("entities") or [action["object_id"]]
        states = action["recorder"] == "states"
        removed, left, error = await delete_statistics(self.hass, ids, states=states)
        reason = error or (left[0]["reason"] if left else None)
        if reason:
            _event(plan, "purge_failed", object_id=action["object_id"], reason=reason)
            return {"purge": {"state": "failed", "reason": reason}}
        self.scanner.replies.clear()
        self.scanner.events.record(
            "purge", _now(), requested=len(ids), removed=len(removed), skipped=0, states=states
        )
        _event(plan, "statistics_purged", object_id=action["object_id"])
        return {"purge": {"state": "done", "states": states}, "irreversible": True}

    async def _purge_statistics(self, action: dict[str, Any]) -> dict[str, Any]:
        """Delete the statistics of one orphaned ID; it is only noted, never undone."""
        statistic_id, states = action["object_id"], bool(action.get("states"))
        removed, left, error = await delete_statistics(self.hass, [statistic_id], states=states)
        if error:
            raise StepAbort(error)
        if left:
            raise StepAbort(left[0]["reason"])
        self.scanner.replies.clear()  # views built on the recorder answered before the purge
        self.scanner.events.record(
            "purge", _now(), requested=1, removed=len(removed), skipped=0, states=states
        )
        return {"states": states, "irreversible": True}

    async def _delete_backup(self, action: dict[str, Any]) -> dict[str, Any]:
        """Delete one of Housekeeper's own backups; final."""
        reason = await delete_backup(self.hass, action["object_id"])
        if reason:
            raise StepAbort(reason)
        return {"size": (action.get("backup") or {}).get("size"), "irreversible": True}

    async def _delete_automation(self, action: dict[str, Any]) -> dict[str, Any]:
        """Remove one automation from automations.yaml, reload, and drop its registry entry.

        The old file is kept whole, so the undo puts it back byte for byte while it is unchanged.
        """
        entity_id, planned = action["object_id"], action["sources"][0]
        try:
            loaded = await load_source(self.hass, self.scanner.snapshot, planned["source"])
        except SourceError as err:
            raise StepAbort(str(err)) from err
        if loaded["hash"] != planned["hash"]:
            raise StepAbort("source_changed")
        registry = er.async_get(self.hass)
        entry = registry.async_get(entity_id)
        before, extra = await self.hass.async_add_executor_job(
            _delete_yaml_item, loaded["path"], "automation", loaded["ref"], planned["hash"]
        )
        source = {
            "source": loaded["source"],
            "type": "automation",
            "format": "yaml",
            "before": before,
            "after_hash": None,
            "state": "done",
            "deleted": True,
            **extra,
        }
        info = (
            {
                "unique_id": entry.unique_id,
                "area_id": entry.area_id,
                "labels": sorted(entry.labels),
                "name": entry.name,
                "icon": entry.icon,
            }
            if entry
            else None
        )
        try:
            await self._reload(loaded)
            if registry.async_get(entity_id) is not None:
                registry.async_remove(entity_id)
        except Exception as err:
            outcome = await self._revert_source(source)
            raise StepAbort(
                "source_write_failed" if outcome == "undone" else "rollback_incomplete",
                {"before": action["fingerprint"], "sources": [source], "registry": info},
            ) from err
        return {"before": action["fingerprint"], "sources": [source], "registry": info}

    async def _undo_automation_delete(self, result: dict[str, Any]) -> str:
        """Put the file back, then give the automation its area, labels and name again."""
        outcome = await self._undo_references(result)
        info = result.get("registry")
        if outcome == "undone" and info:
            registry = er.async_get(self.hass)
            entity_id = registry.async_get_entity_id("automation", "automation", info["unique_id"])
            if entity_id:
                registry.async_update_entity(
                    entity_id,
                    area_id=info["area_id"],
                    labels=set(info["labels"]),
                    name=info["name"],
                    icon=info["icon"],
                )
        return outcome

    async def _trim_history(self, action: dict[str, Any]) -> dict[str, Any]:
        """Delete the state rows of one entity older than ``keep_days``; noted, never undone."""
        entity_id, keep_days = action["object_id"], action["keep_days"]
        if not trim_is_plain(action):
            return await self._trim_extra(action)
        left, error = await trim_states(self.hass, entity_id, keep_days)
        if error:
            raise StepAbort(error)
        # Rows were deleted either way: the step stays done (irreversible) and the plan stops.
        deleted = {"keep_days": keep_days, "irreversible": True}
        if left is None:  # whether all of it is gone cannot be told
            raise StepAbort("trim_unverified", deleted)
        if left:
            raise StepAbort("trim_left", {**deleted, "rows_left": left})
        self.scanner.replies.clear()
        rows = (action.get("trim") or {}).get("rows", 0)
        self.scanner.events.record(
            "purge", _now(), requested=1, removed=0, skipped=0, states=True, rows=rows
        )
        return {"keep_days": keep_days, "rows": rows, "irreversible": True}

    async def _trim_extra(self, action: dict[str, Any]) -> dict[str, Any]:
        """Delete statistics older than ``keep_days`` and/or a stretch of states; noted, never undone."""
        tables = action.get("tables") or ["states"]
        deleted, error = await trim_extra(
            self.hass, action["object_id"], action.get("keep_days"), action.get("range"), tables
        )
        if error or deleted is None:
            raise StepAbort(error or "recorder_busy")
        result: dict[str, Any] = {
            "keep_days": action.get("keep_days"),
            "tables": tables,
            "deleted": deleted,
            "irreversible": True,
        }
        if action.get("range"):
            result["range"] = action["range"]
        left = await count_trim(
            self.hass, action["object_id"], action.get("keep_days"), action.get("range"), tables
        )
        if left is None:  # rows were deleted either way: the step stays done and the plan stops
            raise StepAbort("trim_unverified", result)
        if left["rows"]:
            raise StepAbort("trim_left", {**result, "rows_left": left["rows"]})
        self.scanner.replies.clear()
        rows = sum(deleted.values())
        self.scanner.events.record(
            "purge", _now(), requested=1, removed=0, skipped=0, states="states" in tables, rows=rows
        )
        return {**result, "rows": rows}

    # -- counters --------------------------------------------------------------------------

    async def _recorder_write(self, work: Any) -> Any:
        """Run ``work`` while no slow recorder query reads the tables; the caches are stale after."""
        store = self.hass.data.setdefault(DOMAIN, {})
        lock: asyncio.Lock = store.setdefault("reliability_lock", asyncio.Lock())
        try:
            async with asyncio.timeout(30):
                await lock.acquire()
        except TimeoutError as err:
            raise StepAbort("recorder_busy") from err
        try:
            return await work()
        finally:
            lock.release()
            store.get("query_cache", {}).clear()
            self.scanner.replies.clear()

    async def _repair_counter(self, action: dict[str, Any]) -> dict[str, Any]:
        """Write the repair; the overwritten values go into the result, so it can be undone."""
        written = await self._recorder_write(
            lambda: counter_repair.apply(
                self.hass,
                action["object_id"],
                action["mode"],
                action["fingerprint"],
                rng=action.get("range"),
            )
        )
        if written.get("error"):
            raise StepAbort(written["error"])
        return {"before": action["fingerprint"], "mode": action["mode"], "counter": written}

    async def _undo_counter(self, result: dict[str, Any]) -> str:
        return await self._recorder_write(lambda: counter_repair.undo(self.hass, result["counter"]))

    # -- devices ---------------------------------------------------------------------------

    def _device_entities(self, device_id: str) -> list[Any]:
        registry = er.async_get(self.hass)
        return [e for e in registry.entities.values() if e.device_id == device_id]

    def _device_restore(self, entry: Any) -> dict[str, Any]:
        """Everything needed to recreate a device and the entities that go with it."""
        data = _device_restore_data(entry)
        data["entities"] = [_restore_data(e) for e in self._device_entities(entry.id)]
        return data

    async def _remove_device(self, action: dict[str, Any]) -> dict[str, Any]:
        """Regular removal: the integration behind the device is asked and may refuse."""
        registry = dr.async_get(self.hass)
        entry = get_main_device(registry, action["object_id"])
        if entry is None:
            raise StepAbort("device_gone")
        restore = self._device_restore(entry)
        config_entry = self.hass.config_entries.async_get_entry(entry.config_entry_id)
        if config_entry is None or not config_entry.supports_remove_device:
            raise StepAbort("integration_no_support")
        try:
            integration = await loader.async_get_integration(self.hass, config_entry.domain)
            component = await integration.async_get_component()
            allowed = await component.async_remove_config_entry_device(
                self.hass, config_entry, entry
            )
        except Exception as err:
            raise StepAbort("integration_no_support") from err
        if not allowed:
            raise StepAbort("rejected_by_integration")
        if registry.async_get(entry.id):
            registry.async_remove_device(entry.id)
        return {"before": device_fingerprint(entry), "restore": restore}

    async def _forget_device(self, action: dict[str, Any]) -> dict[str, Any]:
        """Force Forget: drop the registry entry, then let the integrations load again."""
        registry = dr.async_get(self.hass)
        entry = get_main_device(registry, action["object_id"])
        if entry is None:
            raise StepAbort("device_gone")
        restore = self._device_restore(entry)
        registry.async_remove_device(entry.id)
        reloaded = []
        for config_entry_id in restore["config_entries"]:
            if self.hass.config_entries.async_get_entry(config_entry_id) is None:
                continue
            try:
                await self.hass.config_entries.async_reload(config_entry_id)
                reloaded.append(config_entry_id)
            except Exception as err:  # the forget itself succeeded; say that the reload did not
                restore.setdefault("reload_errors", []).append(f"{type(err).__name__}: {err}")
        return {"before": device_fingerprint(entry), "restore": restore, "reloaded": reloaded}

    def _restore_device(self, data: dict[str, Any]) -> str:
        """Recreate a removed device and its entities from the journal, as far as possible.

        Home Assistant itself remembers a deleted device and reapplies area, name and labels
        when the same identifiers are created again; Housekeeper reapplies them as well. Whether
        entities come back depends on the integration, so those that did not are restored from
        the journal.
        """
        registry = dr.async_get(self.hass)
        config_entry_id = data.get("config_entry_id")
        if config_entry_id is None:
            # Journalled before a device belonged to a single config entry.
            legacy = data.get("config_entries") or []
            if len(legacy) != 1:
                return "conflict_unrestorable"
            config_entry_id = legacy[0]
        if self.hass.config_entries.async_get_entry(config_entry_id) is None:
            return "conflict_unrestorable"
        if registry.async_get(data["id"]) is not None:
            return "conflict_taken"
        try:
            device = registry.async_get_or_create(
                config_entry_id=config_entry_id,
                identifiers={tuple(i) for i in data["identifiers"]},
                connections={tuple(c) for c in data["connections"]},
                **(
                    {"config_subentry_id": data["config_subentry_id"]}
                    if data.get("config_subentry_id")
                    else {}
                ),
                **{
                    key: data[key]
                    for key in ("manufacturer", "model", "name")
                    if data.get(key) is not None
                },
            )
            registry.async_update_device(
                device.id,
                area_id=data["area_id"],
                name_by_user=data["name_by_user"],
                labels=set(data["labels"]),
                disabled_by=dr.DeviceEntryDisabler(data["disabled_by"])
                if data["disabled_by"]
                else None,
            )
        except Exception:
            return "conflict_unrestorable"
        entity_registry = er.async_get(self.hass)
        for entity in data["entities"]:
            if entity_registry.async_get(entity["entity_id"]) is None:
                self._restore(entity_registry, entity["entity_id"], entity)
        return "undone"

    # -- meters ----------------------------------------------------------------------------

    async def _migrate_meter(self, action: dict[str, Any]) -> dict[str, Any]:
        """Join the statistics, then let the new entity take the old ID, as the mode asks.

        What was written stays in the result even if a later part stops, so it is never lost.
        """
        mode = action["mode"]
        result: dict[str, Any] = {
            "before": action["fingerprint"],
            "mode": mode,
            "statistics": None,
            "take_id": None,
        }
        if mode in {"both", "statistics"}:
            result["statistics"] = await self._join_statistics(action)
            if not result["statistics"]["verified"]:
                result["stopped"] = "statistics_failed"
                return result
        if mode in {"both", "id"}:
            try:
                result["take_id"] = await self._take_id(action)
            except StepAbort as stop:
                if stop.result is not None:  # the old entity could not be put back
                    result["take_id"] = stop.result
                    result["cause"] = stop.reason
                    result["stopped"] = "rollback_incomplete"
                elif result["statistics"] is None:
                    raise
                else:
                    result["stopped"] = stop.reason
        return result

    async def _join_statistics(self, action: dict[str, Any]) -> dict[str, Any]:
        """Copy the old hourly rows in front of the new series and shift the new sums."""
        from homeassistant.components.recorder import get_instance
        from homeassistant.components.recorder.statistics import async_import_statistics

        old, new = action["object_id"], action["target"]
        instance = get_instance(self.hass)
        old_meta, old_rows = await instance.async_add_executor_job(read_series, self.hass, old)
        new_meta, new_rows = await instance.async_add_executor_job(read_series, self.hass, new)
        analysis = analyse(old_meta, old_rows, new_meta, new_rows)
        if analysis["hash"] != action["statistics"]["hash"]:
            raise StepAbort("statistics_changed")
        blocking = {"stats_missing_old", "stats_unit_differs", "stats_type_differs"}
        if blocking & set(analysis["reasons"]) or not analysis["import_count"]:
            raise StepAbort("statistics_changed")
        switch = new_rows[0]["start"] if new_rows else None
        rows = [row for row in old_rows if switch is None or row["start"] < switch]
        metadata = {
            key: value for key, value in (new_meta or old_meta or {}).items() if key != "has_mean"
        }
        metadata.update(statistic_id=new, source="recorder")
        if new_meta is None:
            metadata["name"] = None
        data = []
        for row in rows:
            point: dict[str, Any] = {"start": datetime.fromtimestamp(row["start"], UTC)}
            point.update({key: row[key] for key in STATISTIC_KEYS if row.get(key) is not None})
            point["last_reset"] = (
                datetime.fromtimestamp(row["last_reset"], UTC) if row.get("last_reset") else None
            )
            data.append(point)
        async_import_statistics(self.hass, cast(Any, metadata), cast(Any, data))
        offset = analysis["offset"]
        if offset is not None and switch is not None:
            instance.async_adjust_statistics(
                new,
                datetime.fromtimestamp(switch, UTC),
                offset,
                cast(str, metadata.get("unit_of_measurement")),
            )
        await instance.async_block_till_done()
        _, after = await instance.async_add_executor_job(read_series, self.hass, new)
        # The new series is live: an hourly value compiled meanwhile is no failure.
        present = {row["start"] for row in after}
        verified = (
            bool(after)
            and after[0]["start"] == rows[0]["start"]
            and all(row["start"] in present for row in (*rows, *new_rows))
        )
        if verified and offset is not None and new_rows:
            moved = next((r for r in after if r["start"] == switch), None)
            verified = (
                moved is not None
                and abs((moved.get("sum") or 0) - ((new_rows[0].get("sum") or 0) + offset)) < 1e-6
            )
        return {
            "imported": len(rows),
            "dropped_overlap": analysis["dropped_overlap"],
            "offset": offset,
            "first": rows[0]["start"],
            "switch": switch,
            "unit": metadata.get("unit_of_measurement"),
            "series_id": new,
            "verified": verified,
        }

    async def _wait_free(self, entity_id: str) -> bool:
        """Wait until the state of a renamed entity is gone, so its ID can be taken."""
        waited = 0.0
        while self.hass.states.get(entity_id) is not None:
            if waited >= ID_FREE_TIMEOUT:
                return False
            await asyncio.sleep(0.1)
            waited += 0.1
        return True

    async def _take_id(self, action: dict[str, Any]) -> dict[str, Any]:
        """Move the old entity to its ``_alt`` ID, then rename the new entity to the old ID."""
        registry = er.async_get(self.hass)
        old, new, alt = action["object_id"], action["target"], action["alt_id"]
        old_entry, new_entry = registry.async_get(old), registry.async_get(new)
        if old_entry is None or new_entry is None:
            raise StepAbort("entity_gone")
        if registry.async_get(alt) is not None or self.hass.states.get(alt) is not None:
            raise StepAbort("alt_id_taken")
        try:
            registry.async_update_entity(old, new_entity_id=alt)
        except ValueError as err:
            raise StepAbort("id_takeover_failed") from err
        try:
            if not await self._wait_free(old):
                raise StepAbort("id_not_freed")
            registry.async_update_entity(new, new_entity_id=old)
        except (StepAbort, ValueError) as err:
            reason = err.reason if isinstance(err, StepAbort) else "id_takeover_failed"
            if await self._put_back(alt, old):
                raise StepAbort(reason) from err
            # The old entity still sits under its other ID: journal that instead of hiding it.
            raise StepAbort(
                reason,
                {
                    "old_id": old,
                    "alt_id": alt,
                    "new_id": new,
                    "partial": True,
                    "old_after": registry_fingerprint(registry.async_get(alt)),
                },
            ) from err
        if recorder_ready(self.hass):
            from homeassistant.components.recorder import get_instance

            await get_instance(self.hass).async_block_till_done()
        return {
            "old_id": old,
            "alt_id": alt,
            "new_id": new,
            "new_unique_id": new_entry.unique_id,
            "old_after": registry_fingerprint(registry.async_get(alt)),
            "new_after": registry_fingerprint(registry.async_get(old)),
        }

    async def _put_back(self, moved_id: str, holder_id: str) -> bool:
        """Give a moved entity the ID ``holder_id`` again; wait for the old state to go first."""
        registry = er.async_get(self.hass)
        await self._wait_free(holder_id)
        try:
            registry.async_update_entity(moved_id, new_entity_id=holder_id)
        except ValueError:
            return False
        return True

    async def _undo_take_id(self, take: dict[str, Any]) -> str:
        """Give both entities their IDs back while they are exactly as Housekeeper left them."""
        registry = er.async_get(self.hass)
        if take.get("partial"):
            # Only the old entity was moved; the new one never took its ID.
            moved = registry.async_get(take["alt_id"])
            if moved is None:
                return "conflict_gone"
            if registry_fingerprint(moved) != take["old_after"]:
                return "conflict_changed"
            await self._wait_free(take["old_id"])
            if registry.async_get(take["old_id"]) is not None or (
                self.hass.states.get(take["old_id"]) is not None
            ):
                return "conflict_taken"
            return (
                "undone"
                if await self._put_back(take["alt_id"], take["old_id"])
                else ("conflict_unrestorable")
            )
        holder, moved = registry.async_get(take["old_id"]), registry.async_get(take["alt_id"])
        if holder is None or moved is None:
            return "conflict_gone"
        if (
            registry_fingerprint(holder) != take["new_after"]
            or registry_fingerprint(moved) != take["old_after"]
        ):
            return "conflict_changed"
        if registry.async_get(take["new_id"]) is not None or (
            self.hass.states.get(take["new_id"]) is not None
        ):
            return "conflict_taken"
        registry.async_update_entity(take["old_id"], new_entity_id=take["new_id"])
        if not await self._wait_free(take["old_id"]) or not await self._put_back(
            take["alt_id"], take["old_id"]
        ):
            # Put the new entity back where it was, as it is the one that moved first.
            if await self._put_back(take["new_id"], take["old_id"]):
                return "conflict_unrestorable"
            # Neither could be moved: say where the new entity sits now.
            take["stuck"] = {"entity_at": take["new_id"], "should_be": take["old_id"]}
            return "conflict_unrestorable"
        if recorder_ready(self.hass):
            from homeassistant.components.recorder import get_instance

            await get_instance(self.hass).async_block_till_done()
        return "undone"

    # -- references ------------------------------------------------------------------------

    async def _replace_references(self, action: dict[str, Any]) -> dict[str, Any]:
        """Rewrite every source of the plan; on a failure put back what was already written."""
        old, new = action["object_id"], action["target"]
        written: list[dict[str, Any]] = []
        snapshot = self.scanner.snapshot
        try:
            for planned in action["sources"]:
                if not planned["writable"] or not planned["change_count"]:
                    continue
                loaded = await load_source(self.hass, snapshot, planned["source"])
                if loaded["hash"] != planned["hash"]:
                    raise StepAbort("source_changed")
                item, changes, _ = rewrite(loaded["item"], old, new)
                if not changes:
                    raise StepAbort("source_changed")
                is_automation = loaded["format"] == "yaml" and planned["type"] == "automation"
                if is_automation and not await refactor_module.is_valid(
                    self.hass, loaded["ref"], item
                ):
                    raise StepAbort("invalid_config")
                before, extra = await self._write_source(loaded, item, planned["hash"])
                kept = sum(len(s.get("file_before") or "") for s in written)
                if extra.get("file_before") is not None and (
                    kept + len(extra["file_before"]) > MAX_PLAN_SNAPSHOTS
                ):
                    # Enough whole files in this plan: this source can still be put back per item.
                    extra = {"file_snapshot_skipped": True}
                # Registered at once: from here on the source is changed, so every failure path
                # must be able to put it back, even if reading it again fails.
                source = {
                    "source": loaded["source"],
                    "type": planned["type"],
                    "format": loaded["format"],
                    "before": before,
                    "after_hash": None,
                    "change_count": len(changes),
                    "state": "written",
                    **extra,
                }
                written.append(source)
                # What Home Assistant now holds is the reference for a later undo: it may
                # normalise what was written (the Energy dashboard adds fields).
                after = await load_source(self.hass, snapshot, planned["source"])
                source["after_hash"] = after["hash"]
                source["state"] = "done"
                self._lineage.setdefault(planned["source"], {})[after["hash"]] = planned["hash"]
                await self._reload(loaded)
                # A reload skips an automation it cannot load instead of failing.
                if (
                    is_automation
                    and self.hass.states.get(planned["source"].split(":", 1)[1]) is None
                ):
                    raise StepAbort("reload_failed")
        except (StepAbort, SourceError) as err:
            reason = err.reason if isinstance(err, StepAbort) else str(err)
            await self._roll_back(written, reason, action)
            raise StepAbort(reason) from err
        except Exception as err:
            await self._roll_back(written, "source_write_failed", action)
            raise StepAbort("source_write_failed") from err
        return {"before": action["fingerprint"], "sources": written}

    async def _refactor_automation(self, action: dict[str, Any]) -> dict[str, Any]:
        """Write one mechanical edit of an automation, reload, and put the file back if it fails."""
        planned, entity_id = action["sources"][0], action["object_id"]
        snapshot = self.scanner.snapshot
        written: list[dict[str, Any]] = []
        try:
            loaded = await load_source(self.hass, snapshot, planned["source"])
            if loaded["hash"] != planned["hash"]:
                raise StepAbort("source_changed")
            try:
                item, _ = refactor_module.apply(loaded["item"], action["fix"], action["values"])
            except ValueError as err:
                raise StepAbort(str(err)) from err
            if not await refactor_module.is_valid(self.hass, loaded["ref"], item):
                raise StepAbort("invalid_config")
            before, extra = await self._write_source(loaded, item, planned["hash"])
            source = {
                "source": loaded["source"],
                "type": "automation",
                "format": loaded["format"],
                "before": before,
                "after_hash": None,
                "change_count": planned["change_count"],
                "state": "written",
                **extra,
            }
            written.append(source)
            after = await load_source(self.hass, snapshot, planned["source"])
            source["after_hash"] = after["hash"]
            source["state"] = "done"
            await self._reload(loaded)
            if self.hass.states.get(entity_id) is None:  # Home Assistant did not load it again
                raise StepAbort("reload_failed")
        except (StepAbort, SourceError) as err:
            reason = err.reason if isinstance(err, StepAbort) else str(err)
            await self._roll_back(written, reason, action)
            raise StepAbort(reason) from err
        except Exception as err:
            await self._roll_back(written, "source_write_failed", action)
            raise StepAbort("source_write_failed") from err
        return {"before": action["fingerprint"], "sources": written}

    async def _roll_back(
        self, written: list[dict[str, Any]], reason: str, action: dict[str, Any]
    ) -> None:
        """Put back what was written, newest first; if a source stays changed, say so.

        A source that cannot be put back is not hidden behind a plain abort: the step is
        journalled with it, so the person sees it and a later undo can try again.
        """
        outcomes = [await self._revert_source(source) for source in reversed(written)]
        if any(outcome != "undone" for outcome in outcomes):
            for source, outcome in zip(reversed(written), outcomes, strict=True):
                source["rollback"] = outcome
            raise StepAbort(
                "rollback_incomplete",
                {"before": action["fingerprint"], "sources": written, "cause": reason},
            )

    async def _write_source(
        self, loaded: dict[str, Any], item: Any, expected_hash: str
    ) -> tuple[Any, dict[str, Any]]:
        """Write one rewritten configuration; return the text/value it replaces and extras to keep."""
        fmt = loaded["format"]
        if fmt == "yaml":
            kind = loaded["type"]
            return await self.hass.async_add_executor_job(
                _write_yaml_item, loaded["path"], kind, loaded["ref"], expected_hash, item
            )
        if fmt == "dashboard":
            before = copy.deepcopy(loaded["item"])
            await loaded["dashboard"].async_save(item)
            return before, {}
        from homeassistant.components.energy.data import async_get_manager

        manager = await async_get_manager(self.hass)
        before = copy.deepcopy(
            {
                key: parts[key]
                for key in ENERGY_PARTS
                if (parts := cast(Any, manager.data)) and key in parts
            }
        )
        await manager.async_update(item)
        return before, {}

    async def _reload(self, loaded: dict[str, Any]) -> None:
        """Let Home Assistant read a rewritten file. Dashboards and Energy apply at once."""
        if loaded["format"] == "yaml":
            await self.hass.services.async_call(loaded["type"], "reload", blocking=True)

    async def _revert_source(self, source: dict[str, Any]) -> str:
        """Put one rewritten source back while it is exactly as Housekeeper left it."""
        if source.get("deleted"):
            path = self.hass.config.path(YAML_FILES[source["type"]])
            try:
                restored = await self.hass.async_add_executor_job(
                    _restore_yaml_file, path, source["file_before"], source["file_after_hash"]
                )
            except Exception:
                return "conflict_unrestorable"
            if not restored:
                return "conflict_changed"
            source["state"] = "undone"
            source["restored_as"] = "file"
            with contextlib.suppress(Exception):
                await self.hass.services.async_call(source["type"], "reload", blocking=True)
            return "undone"
        try:
            loaded = await load_source(self.hass, self.scanner.snapshot, source["source"])
        except SourceError:
            return "conflict_gone"
        # Without a verified hash (reading it after the write failed) the file as it is now
        # is the only reference there is.
        if source.get("file_before") is not None:
            try:
                restored = await self.hass.async_add_executor_job(
                    _restore_yaml_file,
                    loaded["path"],
                    source["file_before"],
                    source["file_after_hash"],
                )
            except Exception:
                return "conflict_unrestorable"
            if restored:
                source["state"] = "undone"
                source["restored_as"] = "file"
                # The old file is back; a failing reload is Home Assistant's to report.
                with contextlib.suppress(Exception):
                    await self._reload(loaded)
                return "undone"
        expected = source["after_hash"] or loaded["hash"]
        if loaded["hash"] != expected:
            return "conflict_changed"
        original = parse_yaml(source["before"]) if source["format"] == "yaml" else source["before"]
        try:
            await self._write_source(loaded, original, expected)
            await self._reload(loaded)
        except Exception:
            return "conflict_unrestorable"
        source["state"] = "undone"
        source["restored_as"] = "item"  # the file changed since, so only this item was put back
        return "undone"

    async def _precheck(self, action: dict[str, Any], context: dict[str, Any]) -> str | None:
        """Re-check one action against the live state. Returns an abort reason or None."""
        kind, object_id, snapshot = action["kind"], action["object_id"], context["snapshot"]
        verdict_args: dict[str, Any] = {}
        restorable = None
        if kind in REFACTOR_KINDS:
            found = await refactor_module.preview(
                self.hass, snapshot, object_id, action["fix"], action["values"]
            )
            if found.get("error") or action.get("fingerprint") != found["fingerprint"]:
                return "source_changed" if not found.get("error") else "now_blocked"
            if not self.scanner.refactor.enabled:
                return "now_blocked"
            action["sources"] = [found["source"]]
            return None if object_id in context["acknowledged"] else "needs_acknowledgement"
        if kind in AREA_KINDS:
            if self._area_entry(object_id) is None:
                return "entity_gone"
            if (
                action.get("fingerprint") is None
                or self._area_print(object_id) != action["fingerprint"]
            ):
                return "entity_changed"
            if ar.async_get(self.hass).async_get_area(action["target"]) is None:
                return "now_blocked"
            return None
        if kind in STATE_KINDS:
            entry = er.async_get(self.hass).async_get(object_id)
            if entry is None:
                return "entity_gone"
            if (
                action.get("fingerprint") is None
                or registry_fingerprint(entry) != action["fingerprint"]
            ):
                return "entity_changed"
            return None
        if kind in LABEL_KINDS:
            entry = er.async_get(self.hass).async_get(object_id)
            if entry is None:
                return "entity_gone"
            if (
                action.get("fingerprint") is None
                or registry_fingerprint(entry) != action["fingerprint"]
            ):
                return "entity_changed"
            if lr.async_get(self.hass).async_get_label(action["target"]) is None:
                return "now_blocked"
            return None
        if kind in REPAIR_KINDS:
            if not recorder_ready(self.hass):
                return "no_recorder"
            found = await counter_repair.prepare(
                self.hass, object_id, action.get("mode") or "hold", rng=action.get("range")
            )
            if found.get("error") or action.get("fingerprint") != found["fingerprint"]:
                return "counter_changed"
            return None if object_id in context["acknowledged"] else "needs_acknowledgement"
        if kind in DELETE_BACKUP_KINDS:
            now_rows = {
                r["backup_id"]: r
                for r in (await list_backups(self.hass, self.scanner.journal.plans, _now()))["rows"]
            }
            row = now_rows.get(object_id)
            if row is None or row["protected"]:
                return "now_blocked"
            return None if object_id in context["acknowledged"] else "needs_acknowledgement"
        if kind in DELETE_AUTOMATION_KINDS:
            found = await preview_automation_delete(self.hass, snapshot, object_id)
            if found["error"] or found["fingerprint"] != action["sources"][0]["hash"]:
                return "source_changed"
            if not any(
                f["object_id"] == object_id and f["rule_id"] in DELETE_CANDIDATE_RULES
                for f in snapshot.get("findings", [])
            ):
                return "now_blocked"
            return None if object_id in context["acknowledged"] else "needs_acknowledgement"
        if kind in TRIM_KINDS:
            if trim_is_plain(action):
                older = await count_older(self.hass, [object_id], action["keep_days"])
                rows = None if older is None else older[object_id]["rows"]
            else:
                found = await count_trim(
                    self.hass,
                    object_id,
                    action.get("keep_days"),
                    action.get("range"),
                    action.get("tables") or ["states"],
                )
                rows = None if found is None else found["rows"]
            if rows is None or not recorder_ready(self.hass):
                return "no_recorder"
            if not rows:
                return "now_blocked"
            return None if object_id in context["acknowledged"] else "needs_acknowledgement"
        if kind in PURGE_KINDS:
            verdict = judge_purge_action(
                object_id,
                {i["statistic_id"]: i for i in snapshot.get("orphaned_statistics", [])},
                er.async_get(self.hass).async_get(object_id) is not None
                or self.hass.states.get(object_id) is not None,
                bool(action.get("states")),
                recorder_ready(self.hass),
            )
            if verdict["verdict"] == "blocked":
                return "now_blocked"
            if object_id not in context["acknowledged"]:
                return "needs_acknowledgement"
            return None
        if kind in DEVICE_KINDS:
            registry = dr.async_get(self.hass)
            entry = get_main_device(registry, object_id)
            if entry is None:
                # A child device (or a composite ID) is still there but not ours to change.
                return "device_unsupported" if registry.async_get(object_id) else "device_gone"
            if (
                action.get("fingerprint") is None
                or device_fingerprint(entry) != action["fingerprint"]
            ):
                return "device_changed"
            verdict_args = {
                "devices": context["devices"],
                "support": device_support(self.hass, entry),
            }
        elif kind in METER_KINDS:
            if not recorder_ready(self.hass) and action["mode"] != "id":
                return "no_recorder"
            meter = await prepare_meter(self.hass, object_id, action["target"], action["mode"])
            if action.get("fingerprint") is None or meter["fingerprint"] != action["fingerprint"]:
                return "meter_changed"
            verdict_args = {
                "target": action["target"],
                "meter": {**meter, "mode": action["mode"]},
            }
        elif kind in RENAME_KINDS:
            found = await rename_module.prepare(
                self.hass, snapshot, object_id, action["target"], self._lineage
            )
            if action.get("fingerprint") is None or found["fingerprint"] != action["fingerprint"]:
                return "source_changed"
            action["sources"] = found["sources"]
            verdict = judge_rename_action(
                object_id, action["target"], context["entities"], snapshot["edges"], found
            )
            if verdict["verdict"] == "blocked":
                return "now_blocked"
            if verdict["verdict"] == "review" and object_id not in context["acknowledged"]:
                return "needs_acknowledgement"
            return None
        elif kind in REFERENCE_KINDS:
            fingerprint, sources = await preview_replacement(
                self.hass, snapshot, object_id, action["target"], self._lineage
            )
            if action.get("fingerprint") is None or fingerprint != action["fingerprint"]:
                return "source_changed"
            action["sources"] = sources
            verdict_args = {"target": action["target"], "sources": sources}
        else:
            entry = er.async_get(self.hass).async_get(object_id)
            if entry is None:
                return "entity_gone"
            if (
                action.get("fingerprint") is None
                or registry_fingerprint(entry) != action["fingerprint"]
            ):
                return "entity_changed"
            restorable = entity_restorable(self.hass, entry)
        verdict = judge_action(
            kind,
            object_id,
            context["entities"],
            snapshot["edges"],
            context["quarantine"],
            restorable,
            _now(),
            **verdict_args,
        )
        if verdict["verdict"] == "blocked":
            return "now_blocked"
        if verdict["verdict"] == "review" and object_id not in context["acknowledged"]:
            return "needs_acknowledgement"
        return None

    def _abort(
        self, plan: dict[str, Any], reason: str, remaining: list[str], object_id: str | None = None
    ) -> None:
        by_id = {action["object_id"]: action for action in plan["actions"]}
        for remaining_id in remaining:
            by_id[remaining_id]["result"] = {
                "state": "not_run",
                "at": _now().isoformat(),
                "reason": reason if remaining_id == (object_id or remaining[0]) else "aborted",
            }
        _event(
            plan,
            "aborted",
            reason=reason,
            object_id=object_id or (remaining[0] if remaining else None),
        )
        plan["status"] = "partial" if plan["executed"] else "aborted"

    async def _verify(self, plan: dict[str, Any]) -> None:
        """Scan again and check that the changed objects are in the expected state."""
        before = {
            f["key"] for f in (self.scanner.snapshot or {}).get("findings", []) if not f["ignored"]
        }
        try:
            snapshot = await self.scanner.async_scan()
        except Exception as err:
            plan["verification"] = {
                "ok": False,
                "checks": [{"check": "scan", "ok": False, "error": str(err)}],
            }
            self.scanner.journal.save()
            return
        registry = er.async_get(self.hass)
        device_registry = dr.async_get(self.hass)
        recurring = {r["device_id"] for r in snapshot.get("recurring_devices", [])}
        checks = []
        for action in plan["actions"]:
            if action.get("result", {}).get("state") != "done":
                continue
            kind, object_id = action["kind"], action["object_id"]
            if kind == "remove_entity":
                entry = registry.async_get(object_id)
                ok = entry is None and self.hass.states.get(object_id) is None
                checks.append({"check": "removed", "object_id": object_id, "ok": ok})
            elif kind == "disable_entity":
                entry = registry.async_get(object_id)
                ok = entry is not None and entry.disabled_by is not None
                checks.append({"check": "disabled", "object_id": object_id, "ok": ok})
            elif kind == "disable_device":
                device = device_registry.async_get(object_id)
                ok = device is not None and device.disabled_by is not None
                checks.append({"check": "device_disabled", "object_id": object_id, "ok": ok})
            elif kind in {"remove_device", "forget_device"}:
                gone = device_registry.async_get(object_id) is None
                checks.append({"check": "device_removed", "object_id": object_id, "ok": gone})
                if kind == "forget_device":
                    checks.append(
                        {
                            "check": "not_recurring",
                            "object_id": object_id,
                            "ok": not recurring,
                        }
                    )
            elif kind in METER_KINDS:
                checks.extend(await self._verify_meter(action))
            elif kind in RENAME_KINDS:
                registry = er.async_get(self.hass)
                done = {
                    s["source"] for s in action["result"]["sources"] if s.get("state") != "undone"
                }
                still = [
                    e
                    for e in snapshot["edges"]
                    if e["source"] in done
                    and e["target"] == f"entity:{object_id}"
                    and e.get("confidence", "certain") == "certain"
                ]
                ok = registry.async_get(action["target"]) is not None and (
                    registry.async_get(object_id) is None
                )
                checks.append({"check": "entity_renamed", "object_id": object_id, "ok": ok})
                checks.append(
                    {"check": "references_replaced", "object_id": object_id, "ok": not still}
                )
            elif kind in AREA_KINDS:
                entry = self._area_entry(object_id)
                ok = entry is not None and entry.area_id == action["target"]
                checks.append({"check": "area_set", "object_id": object_id, "ok": ok})
            elif kind in STATE_KINDS:
                entry = registry.async_get(object_id)
                ok = entry is not None and _state_reached(entry, action["target"])
                checks.append({"check": "entity_state", "object_id": object_id, "ok": ok})
            elif kind in LABEL_KINDS:
                entry = registry.async_get(object_id)
                ok = entry is not None and action["target"] in entry.labels
                checks.append({"check": "labelled", "object_id": object_id, "ok": ok})
            elif kind in REPAIR_KINDS:
                found = await counter_repair.prepare(
                    self.hass, object_id, action["mode"], rng=action.get("range")
                )
                ok = found.get("error") == "nothing_found"
                checks.append({"check": "counter_clean", "object_id": object_id, "ok": ok})
            elif kind in REFACTOR_KINDS:
                checks.append(await self._verify_refactor(action))
            elif kind in DELETE_BACKUP_KINDS:
                checks.append(
                    {
                        "check": "backup_deleted",
                        "object_id": object_id,
                        "ok": await backup_exists(self.hass, object_id) is False,
                    }
                )
            elif kind in DELETE_AUTOMATION_KINDS:
                try:
                    await load_source(self.hass, snapshot, f"automation:{object_id}")
                    gone = False
                except SourceError:
                    gone = True
                checks.append({"check": "automation_gone", "object_id": object_id, "ok": gone})
            elif kind in TRIM_KINDS:
                if trim_is_plain(action):
                    older = await count_older(self.hass, [object_id], action["keep_days"])
                    ok = older is not None and not older[object_id]["rows"]
                else:
                    found = await count_trim(
                        self.hass,
                        object_id,
                        action.get("keep_days"),
                        action.get("range"),
                        action.get("tables") or ["states"],
                    )
                    ok = found is not None and not found["rows"]
                checks.append({"check": "history_trimmed", "object_id": object_id, "ok": ok})
            elif kind in PURGE_KINDS:
                gone = object_id not in await statistics_left(self.hass, [object_id])
                checks.append({"check": "statistics_gone", "object_id": object_id, "ok": gone})
            else:
                done = {
                    s["source"] for s in action["result"]["sources"] if s.get("state") != "undone"
                }
                still = [
                    e
                    for e in snapshot["edges"]
                    if e["source"] in done
                    and e["target"] == f"entity:{object_id}"
                    and e.get("confidence", "certain") == "certain"
                ]
                checks.append(
                    {"check": "references_replaced", "object_id": object_id, "ok": not still}
                )
        new_broken = [
            f["key"]
            for f in snapshot["findings"]
            if f["classification"] == "broken_reference"
            and not f["ignored"]
            and f["key"] not in before
        ]
        checks.append(
            {"check": "no_new_broken_references", "ok": not new_broken, "count": len(new_broken)}
        )
        plan["verification"] = {"ok": all(c["ok"] for c in checks), "checks": checks}
        if plan["status"] == "executed" and plan["verification"]["ok"]:
            plan["status"] = "verified"
        _event(plan, "verified", ok=plan["verification"]["ok"])
        followup.start(plan, snapshot, _now(), self.scanner.runs.errors_since)
        self.scanner.journal.save()

    async def _verify_refactor(self, action: dict[str, Any]) -> dict[str, Any]:
        """The edit is in the file and Home Assistant has the automation loaded."""
        ok = False
        try:
            loaded = await load_source(
                self.hass, self.scanner.snapshot, action["sources"][0]["source"]
            )
            ok = refactor_module.applied(loaded["item"], action["fix"], action["values"])
        except SourceError:
            ok = False
        loaded_now = self.hass.states.get(action["object_id"]) is not None
        return {
            "check": "refactor_applied",
            "object_id": action["object_id"],
            "ok": ok and loaded_now,
        }

    async def _verify_meter(self, action: dict[str, Any]) -> list[dict[str, Any]]:
        result, checks = action["result"], []
        object_id = action["object_id"]
        if (take := result.get("take_id")) and not take.get("partial"):
            registry = er.async_get(self.hass)
            holder, moved = registry.async_get(take["old_id"]), registry.async_get(take["alt_id"])
            ok = (
                holder is not None
                and holder.unique_id == take["new_unique_id"]
                and moved is not None
                and registry.async_get(take["new_id"]) is None
            )
            checks.append({"check": "meter_id_taken", "object_id": object_id, "ok": ok})
        if stats := result.get("statistics"):
            take = result.get("take_id")
            series = take["old_id"] if take and not take.get("partial") else None
            series = series or stats["series_id"]
            ok = False
            if recorder_ready(self.hass):
                from homeassistant.components.recorder import get_instance

                _, rows = await get_instance(self.hass).async_add_executor_job(
                    read_series, self.hass, series
                )
                ok = bool(stats["verified"]) and len(rows) >= stats["imported"]
                ok = ok and bool(rows) and rows[0]["start"] == stats["first"]
            checks.append({"check": "meter_statistics", "object_id": object_id, "ok": ok})
        return checks

    def _check_mode(self, plan: dict[str, Any], object_ids: list[str]) -> None:
        """Refuse what the protection mode does not allow (checked again when the run starts)."""
        mode = self.scanner.protection.mode
        wanted = set(object_ids)
        if not all(allows(mode, a) for a in plan["actions"] if a["object_id"] in wanted):
            raise CleanupError("protection_mode")

    async def undo(self, plan_id: str, object_ids: list[str] | None) -> dict[str, Any]:
        """Revert steps that are still exactly as Housekeeper left them."""
        if self.running:
            raise CleanupError("busy")
        done = [
            a
            for a in self._plan(plan_id)["actions"]
            if (a.get("result") or {}).get("state") == "done"
            and (object_ids is None or a["object_id"] in object_ids)
        ]
        if not allows_undo(self.scanner.protection.mode, done):
            raise CleanupError("protection_mode")
        try:
            acquire_write(self.hass, "undo")
        except WriteBusy as busy:
            raise CleanupError("busy") from busy
        try:
            return await self._undo(plan_id, object_ids)
        finally:
            release_write(self.hass, "undo")

    async def _undo(self, plan_id: str, object_ids: list[str] | None) -> dict[str, Any]:
        plan = self._plan(plan_id)
        registry = er.async_get(self.hass)
        results = []
        for action in plan["actions"]:
            result = action.get("result") or {}
            if result.get("state") != "done" or (
                object_ids and action["object_id"] not in object_ids
            ):
                continue
            kind = action["kind"]
            if kind == "remove_entity":
                outcome = self._restore(registry, action["object_id"], result["restore"])
            elif kind in {"remove_device", "forget_device"}:
                outcome = self._restore_device(result["restore"])
            elif kind == "disable_device":
                outcome = self._reenable_device(action["object_id"], result)
            elif kind in RENAME_KINDS:
                outcome = await self._undo_rename(result)
            elif kind in REFERENCE_KINDS | REFACTOR_KINDS:
                outcome = await self._undo_references(result)
            elif kind in METER_KINDS:
                outcome = await self._undo_meter(result)
            elif kind in AREA_KINDS:
                outcome = self._unset_area(action["object_id"], result)
            elif kind in STATE_KINDS:
                outcome = self._undo_entity_state(registry, action["object_id"], result)
            elif kind in LABEL_KINDS:
                outcome = self._unlabel(registry, action["object_id"], result)
            elif kind in REPAIR_KINDS:
                try:
                    outcome = await self._undo_counter(result)
                except StepAbort as stop:
                    outcome = stop.reason
            elif kind in DELETE_AUTOMATION_KINDS:
                outcome = await self._undo_automation_delete(result)
            elif kind in PURGE_KINDS | TRIM_KINDS | DELETE_BACKUP_KINDS:
                outcome = "irreversible"
            else:
                outcome = self._reenable(registry, action["object_id"], result)
            if outcome == "undone":
                result["state"] = "undone"
                result["undone_at"] = _now().isoformat()
                _event(
                    plan,
                    "restored" if kind in REMOVAL_KINDS else "undone",
                    object_id=action["object_id"],
                )
            results.append({"object_id": action["object_id"], "outcome": outcome})
        if any(r["outcome"] == "undone" for r in results):
            open_actions = [
                a for a in plan["actions"] if (a.get("result") or {}).get("state") == "done"
            ]
            plan["status"] = "partially_undone" if open_actions else "undone"
            followup.stop(plan)
        self.scanner.journal.save()
        if any(r["outcome"] == "undone" for r in results):
            # Refresh the inventory so the quarantine list is current; the undo itself succeeded.
            with contextlib.suppress(Exception):
                await self.scanner.async_scan()
        return {"results": results, "status": plan["status"]}

    async def _undo_meter(self, result: dict[str, Any]) -> str:
        """Only the ID takeover can be undone; joined statistics need the backup."""
        if not result.get("take_id"):
            return "conflict_statistics"
        outcome = await self._undo_take_id(result["take_id"])
        if outcome == "undone" and result.get("statistics"):
            result["statistics_kept"] = True
        return outcome

    async def _rename_entity(self, action: dict[str, Any]) -> dict[str, Any]:
        """Write every reference with the new ID, then rename; a failed rename puts the files back."""
        old, new = action["object_id"], action["target"]
        registry = er.async_get(self.hass)
        before = registry_fingerprint(registry.async_get(old))
        result = await self._replace_references(action)
        try:
            updated = registry.async_update_entity(old, new_entity_id=new)
        except Exception as err:
            await self._undo_references(result)
            raise StepAbort("rename_failed") from err
        return {
            **result,
            "before": before,
            "after": registry_fingerprint(updated),
            "old_id": old,
            "new_id": new,
        }

    async def _undo_rename(self, result: dict[str, Any]) -> str:
        """Files back first (only while they are as left), then the old ID; conflicts stop early."""
        registry = er.async_get(self.hass)
        entry = registry.async_get(result["new_id"])
        if entry is None:
            return "conflict_gone"
        if registry_fingerprint(entry) != result["after"]:
            return "conflict_changed"
        if registry.async_get(result["old_id"]) is not None or not await self._wait_free(
            result["old_id"]
        ):
            return "conflict_taken"
        outcome = await self._undo_references(result)
        if outcome != "undone":
            return outcome
        try:
            registry.async_update_entity(result["new_id"], new_entity_id=result["old_id"])
        except Exception:
            return "conflict_taken"
        return "undone"

    async def _undo_references(self, result: dict[str, Any]) -> str:
        outcomes = [
            await self._revert_source(source)
            for source in result["sources"]
            if source.get("state") != "undone"
        ]
        failed = [o for o in outcomes if o != "undone"]
        if not failed:
            return "undone"
        return failed[0] if len(failed) == len(outcomes) else "conflict_partial"

    def _reenable_device(self, device_id: str, result: dict[str, Any]) -> str:
        registry = dr.async_get(self.hass)
        entry = registry.async_get(device_id)
        if entry is None:
            return "conflict_gone"
        if device_fingerprint(entry) != result["after"]:
            return "conflict_changed"
        registry.async_update_device(device_id, disabled_by=None)
        return "undone"

    @staticmethod
    def _reenable(registry: Any, object_id: str, result: dict[str, Any]) -> str:
        entry = registry.async_get(object_id)
        if entry is None:
            return "conflict_gone"
        if registry_fingerprint(entry) != result["after"]:
            return "conflict_changed"
        registry.async_update_entity(object_id, disabled_by=None)
        return "undone"

    def _area_entry(self, object_id: str) -> Any:
        """The registry entry of an entity (an ID with a dot) or of a device."""
        if "." in object_id:
            return er.async_get(self.hass).async_get(object_id)
        return dr.async_get(self.hass).async_get(object_id)

    def _area_print(self, object_id: str) -> str | None:
        entry = self._area_entry(object_id)
        if entry is None:
            return None
        return registry_fingerprint(entry) if "." in object_id else device_fingerprint(entry)

    def _write_area(self, object_id: str, area_id: str | None) -> None:
        if "." in object_id:
            er.async_get(self.hass).async_update_entity(object_id, area_id=area_id)
        else:
            dr.async_get(self.hass).async_update_device(object_id, area_id=area_id)

    def _set_area(self, action: dict[str, Any]) -> dict[str, Any]:
        object_id = action["object_id"]
        before = self._area_entry(object_id)
        previous, fingerprint = before.area_id, self._area_print(object_id)
        try:
            self._write_area(object_id, action["target"])
        except (
            ValueError
        ) as err:  # an entity without a name of its own can only take its device's area
            raise StepAbort("area_not_allowed") from err
        return {
            "before": fingerprint,
            "after": self._area_print(object_id),
            "area": action["target"],
            "previous": previous,
        }

    def _unset_area(self, object_id: str, result: dict[str, Any]) -> str:
        """Put the area back as it was (empty); a change made since then is left alone."""
        if self._area_entry(object_id) is None:
            return "conflict_gone"
        if self._area_print(object_id) != result["after"]:
            return "conflict_changed"
        self._write_area(object_id, result.get("previous"))
        return "undone"

    def _set_entity_state(self, action: dict[str, Any]) -> dict[str, Any]:
        registry = er.async_get(self.hass)
        entry = registry.async_get(action["object_id"])
        if entry is None:
            raise StepAbort("entity_gone")
        changes = {
            "disable": {"disabled_by": er.RegistryEntryDisabler.USER},
            "enable": {"disabled_by": None},
            "hide": {"hidden_by": er.RegistryEntryHider.USER},
            "unhide": {"hidden_by": None},
        }[action["target"]]
        updated = registry.async_update_entity(action["object_id"], **changes)
        return {
            "before": registry_fingerprint(entry),
            "after": registry_fingerprint(updated),
            "previous": {
                "disabled_by": _value(entry.disabled_by),
                "hidden_by": _value(entry.hidden_by),
            },
        }

    @staticmethod
    def _undo_entity_state(registry: Any, object_id: str, result: dict[str, Any]) -> str:
        """Put the switches back as they were; a change made since then is left alone."""
        entry = registry.async_get(object_id)
        if entry is None:
            return "conflict_gone"
        if registry_fingerprint(entry) != result["after"]:
            return "conflict_changed"
        before = result["previous"]
        registry.async_update_entity(
            object_id,
            disabled_by=er.RegistryEntryDisabler(before["disabled_by"])
            if before["disabled_by"]
            else None,
            hidden_by=er.RegistryEntryHider(before["hidden_by"]) if before["hidden_by"] else None,
        )
        return "undone"

    @staticmethod
    def _unlabel(registry: Any, object_id: str, result: dict[str, Any]) -> str:
        """Take the added label away again; the other labels of the entity stay as they are."""
        entry = registry.async_get(object_id)
        if entry is None:
            return "conflict_gone"
        if registry_fingerprint(entry) != result["after"]:
            return "conflict_changed"
        registry.async_update_entity(object_id, labels=set(entry.labels) - {result["label"]})
        return "undone"

    def _restore(self, registry: Any, object_id: str, data: dict[str, Any]) -> str:
        """Recreate a removed registry entry from the journal. The entity stays quarantined."""
        if registry.async_get(object_id) is not None:
            return "conflict_taken"
        config_entry = None
        if data.get("config_entry_id"):
            config_entry = self.hass.config_entries.async_get_entry(data["config_entry_id"])
            if config_entry is None:
                return "conflict_unrestorable"
        domain, _, name = data["entity_id"].partition(".")
        try:
            created = registry.async_get_or_create(
                domain,
                data["platform"],
                data["unique_id"],
                suggested_object_id=name,
                disabled_by=er.RegistryEntryDisabler(data["disabled_by"])
                if data["disabled_by"]
                else None,
                hidden_by=er.RegistryEntryHider(data["hidden_by"]) if data["hidden_by"] else None,
                **self._creation_kwargs(registry, data, config_entry),
            )
        except Exception:
            return "conflict_unrestorable"
        if created.entity_id != data["entity_id"]:
            registry.async_remove(created.entity_id)  # the ID is taken: do not leave a stray entry
            return "conflict_taken"
        registry.async_update_entity(
            created.entity_id,
            name=data["name"],
            icon=data["icon"],
            area_id=data["area_id"],
            device_class=data["device_class"],
            labels=set(data["labels"]),
            aliases=_restored_aliases(data),
        )
        return "undone"

    @staticmethod
    def _creation_kwargs(registry: Any, data: dict[str, Any], config_entry: Any) -> dict[str, Any]:
        """Only pass what this Home Assistant version accepts; older or newer builds differ."""
        wanted = {
            "config_entry": config_entry,
            "config_subentry_id": data.get("config_subentry_id"),
            "device_id": data.get("device_id"),
            "capabilities": data.get("capabilities"),
            "original_name": data.get("original_name"),
            "original_icon": data.get("original_icon"),
            "original_device_class": data.get("original_device_class"),
            "translation_key": data.get("translation_key"),
            "unit_of_measurement": data.get("unit_of_measurement"),
            "supported_features": data.get("supported_features"),
            "has_entity_name": data.get("has_entity_name"),
            "entity_category": er.EntityCategory(data["entity_category"])
            if data.get("entity_category")
            else None,
        }
        accepted = _parameter_names(registry.async_get_or_create)
        return {
            key: value for key, value in wanted.items() if key in accepted and value is not None
        }

    def _plan(self, plan_id: str) -> dict[str, Any]:
        plan = self.scanner.journal.get(plan_id)
        if plan is None:
            raise CleanupError("not_found")
        return plan
