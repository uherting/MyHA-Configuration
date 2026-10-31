"""What the world looks like after a plan, calculated before anything runs.

Only the actions that could run (``executable``) count. The numbers come from the last scan and
from the previews of the replacements; they say what Housekeeper can see. References inside
templates and anything outside Home Assistant stay uncertain, and the report says so.
"""

from __future__ import annotations

from typing import Any

SHOWN = 20
REMOVING = {"remove_entity", "remove_device", "forget_device"}
DISABLING = {"disable_entity", "disable_device"}
# Actions that change nothing the other counters show; each gets a count of its own.
OTHER_KINDS = {
    "reload_integration": "reloaded",
    "add_label": "labeled",
    "set_area": "area_set",
    "refactor_automation": "refactored",
}
STATE_KEYS = {"enable": "enabled", "hide": "hidden", "unhide": "unhidden"}
OTHER_KEYS = (*OTHER_KINDS.values(), *STATE_KEYS.values())


def simulate(actions: list[dict[str, Any]]) -> dict[str, Any]:
    """Summarize the end state of ``actions`` (as built by ``build_plan``)."""
    runnable = [a for a in actions if a.get("executable")]
    removed: set[str] = set()
    disabled: set[str] = set()
    devices = {"removed": 0, "disabled": 0}
    changed: dict[tuple[str, str], int] = {}
    meters = 0
    repaired = 0
    purged: set[str] = set()
    trimmed = 0
    backups_deleted = 0
    backup_bytes = 0
    automations_deleted = 0
    certain: set[tuple[str, str]] = set()
    uncertain: set[tuple[str, str]] = set()
    statistics: set[str] = set()
    manual = 0
    other = dict.fromkeys(OTHER_KEYS, 0)
    purge_rows = kept_rows = purge_stat_rows = purge_states_rows = 0
    kept_states = kept_stats = 0
    counted = False
    for action in runnable:
        kind, object_id = action["kind"], action["object_id"]
        entities = action.get("entities") or [object_id]
        if kind in REMOVING:
            removed.update(entities)
            devices["removed"] += kind != "remove_entity"
        elif kind in DISABLING or (
            kind == "set_entity_state" and action.get("target") == "disable"
        ):
            disabled.update(entities)
            devices["disabled"] += kind == "disable_device"
        if kind in OTHER_KINDS:
            other[OTHER_KINDS[kind]] += 1
        elif kind == "set_entity_state" and action.get("target") in STATE_KEYS:
            other[STATE_KEYS[action["target"]]] += 1
        if kind in REMOVING and action.get("has_statistics") and not action.get("recorder"):
            statistics.add(object_id)
        history = action.get("history")
        counted = counted or history is not None
        if kind == "purge_statistics":
            purged.add(object_id)
            if history:
                states_rows = history["states"] if action.get("states") else 0
                purge_rows += history["statistics"] + states_rows
                purge_stat_rows += history["statistics"]
                purge_states_rows += states_rows
        elif kind == "delete_backup":
            backups_deleted += 1
            backup_bytes += (action.get("backup") or {}).get("size") or 0
        elif kind == "delete_automation":
            automations_deleted += 1
            for use in action.get("used_by") or []:
                (certain if use["confidence"] == "certain" else uncertain).add(
                    (use["source"], object_id)
                )
        elif kind == "trim_history":
            trimmed += 1
            purge_rows += (action.get("trim") or {}).get("rows", 0)
        elif kind in REMOVING and history:
            choice = action.get("recorder")
            if choice:
                purge_rows += history["statistics"] + (
                    history["states"] if choice == "states" else 0
                )
                kept_rows += 0 if choice == "states" else history["states"]
                kept_states += 0 if choice == "states" else history["states"]
            else:
                kept_rows += history["statistics"] + history["states"]
                kept_states += history["states"]
                kept_stats += history["statistics"]
        if kind == "migrate_meter":
            meters += 1
        if kind in ("repair_counter", "repair_range"):
            repaired += 1
        if kind in ("replace_references", "rename_entity"):
            for source in action.get("sources") or []:
                if source.get("writable") and source.get("changes"):
                    key = (source["name"], source["type"])
                    changed[key] = changed.get(key, 0) + source.get("change_count", 0)
                else:
                    manual += 1
                manual += len(source.get("manual") or [])
        elif kind in REMOVING | DISABLING:
            for use in action.get("used_by") or []:
                (certain if use["confidence"] == "certain" else uncertain).add(
                    (use["source"], object_id)
                )
    return {
        "removed": len(removed),
        "removed_devices": devices["removed"],
        "disabled": len(disabled),
        "disabled_devices": devices["disabled"],
        "replaced": sum(changed.values()),
        "replaced_by_source": [
            {"name": name, "type": kind, "count": count}
            for (name, kind), count in sorted(changed.items(), key=lambda i: (-i[1], i[0]))[:SHOWN]
        ],
        "meters": meters,
        "repaired": repaired,
        "purged": len(purged),
        "trimmed": trimmed,
        "backups_deleted": backups_deleted,
        "backup_bytes": backup_bytes,
        "automations_deleted": automations_deleted,
        "remaining_certain": len(certain),
        "remaining_uncertain": len(uncertain) + manual,
        "remaining_sources": sorted({source for source, _ in certain})[:SHOWN],
        "statistics_orphaned": sorted(statistics)[:SHOWN],
        "statistics_orphaned_count": len(statistics),
        **other,
        "blocked": len(actions) - len(runnable),
        "rows_counted": counted,
        "purge_rows": purge_rows,
        "purge_stat_rows": purge_stat_rows,
        "purge_states_rows": purge_states_rows,
        "history_rows_kept": kept_rows,
        # The recorder purges kept states after its retention; long-term statistics it keeps.
        "history_states_kept": kept_states,
        "history_stats_kept": kept_stats,
    }
