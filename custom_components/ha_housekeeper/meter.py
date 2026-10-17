"""Meter migration: read the long-term statistics of two entities and plan how to join them.

When a meter is replaced, the new entity starts a statistics series of its own. To keep one
continuous history, the hourly long-term statistics of the old entity are copied in front of the
new series and, for counters (``sum``), the new series is shifted by the old final total.
Nothing here writes; the write functions live in ``cleanup_exec``.

Only long-term (hourly) statistics are joined. Raw recorder states and the short-term statistics
of the last days stay as they are. Rows of the old entity that overlap the new series are never
copied, so no existing value is ever overwritten.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from homeassistant.core import HomeAssistant

from .references import text_hash

ROW_TYPES = {"state", "sum", "min", "max", "mean", "last_reset"}
PREVIEW_ROWS = 3
HOUR = 3600


def recorder_ready(hass: HomeAssistant) -> bool:
    """Whether the recorder is running, so statistics can be read and written."""
    try:
        from homeassistant.components.recorder import get_instance

        return get_instance(hass) is not None
    except Exception:
        return False


def read_series(hass: HomeAssistant, statistic_id: str) -> tuple[dict[str, Any] | None, list[dict]]:
    """Blocking: metadata and all hourly rows of one statistic ID, oldest first."""
    from homeassistant.components.recorder.statistics import (
        get_metadata,
        statistics_during_period,
    )

    found = get_metadata(hass, statistic_ids={statistic_id})
    if statistic_id not in found:
        return None, []
    meta = dict(found[statistic_id][1])
    rows = statistics_during_period(
        hass,
        datetime.fromtimestamp(0, UTC),
        None,
        {statistic_id},
        "hour",
        None,
        set(ROW_TYPES),
    ).get(statistic_id, [])
    return meta, sorted(rows, key=lambda row: row["start"])


def _flag(meta: dict[str, Any], key: str) -> Any:
    value = meta.get(key)
    return getattr(value, "value", value)


def _compatibility(old: dict[str, Any], new: dict[str, Any]) -> list[str]:
    reasons = []
    if (old.get("unit_of_measurement") or None) != (new.get("unit_of_measurement") or None):
        reasons.append("stats_unit_differs")
    if bool(old.get("has_sum")) != bool(new.get("has_sum")) or _flag(old, "mean_type") != _flag(
        new, "mean_type"
    ):
        reasons.append("stats_type_differs")
    return reasons


def _brief(row: dict[str, Any] | None) -> dict[str, Any] | None:
    if row is None:
        return None
    return {key: row.get(key) for key in ("start", "state", "sum")}


def _row_key(row: dict[str, Any] | None) -> tuple[Any, ...]:
    """Every value of a row that an import reads or a later check compares."""
    if row is None:
        return ()
    return (row.get("start"), *(row.get(key) for key in sorted(ROW_TYPES)))


def _fingerprint(
    old_meta: dict[str, Any] | None,
    new_meta: dict[str, Any] | None,
    importable: list[dict[str, Any]],
    new_rows: list[dict[str, Any]],
    dropped_overlap: int,
) -> str:
    """Hash of everything the preview judged: a change anywhere in it stops the run.

    That is every importable row of the old series with all of its values, the first row of the
    new series (it decides the switch point and the offset), the rows left out as overlap and
    the properties that make the series compatible. Later rows of the live new series are not
    part of it: an hour compiled meanwhile changes nothing the import does.
    """

    def meta_key(meta: dict[str, Any] | None) -> tuple[Any, ...]:
        if meta is None:
            return ()
        return (
            meta.get("unit_of_measurement") or None,
            bool(meta.get("has_sum")),
            _flag(meta, "mean_type"),
            meta.get("unit_class"),
        )

    parts = [
        repr(meta_key(old_meta)),
        repr(meta_key(new_meta)),
        str(dropped_overlap),
        repr(_row_key(new_rows[0] if new_rows else None)),
        *(repr(_row_key(row)) for row in importable),
    ]
    return text_hash("|".join(parts))


def analyse(
    old_meta: dict[str, Any] | None,
    old_rows: list[dict[str, Any]],
    new_meta: dict[str, Any] | None,
    new_rows: list[dict[str, Any]],
) -> dict[str, Any]:
    """Describe what joining the old series in front of the new one would do.

    ``reasons`` holds codes for the judge: ``stats_missing_old``, ``stats_unit_differs`` and
    ``stats_type_differs`` and ``stats_nothing_to_import`` block; ``stats_overlap``,
    ``stats_gap``, ``stats_no_sum`` and ``stats_new_empty`` need a closer look.
    """
    reasons: list[str] = []
    result: dict[str, Any] = {
        "reasons": reasons,
        "unit": (new_meta or old_meta or {}).get("unit_of_measurement"),
        "has_sum": bool((new_meta or old_meta or {}).get("has_sum")),
        "old_rows": len(old_rows),
        "new_rows": len(new_rows),
        "import_count": 0,
        "dropped_overlap": 0,
        "gap_hours": 0.0,
        "offset": None,
        "switch": None,
        "old_first": old_rows[0]["start"] if old_rows else None,
        "old_last": None,
        "new_first": new_rows[0]["start"] if new_rows else None,
        "preview": {"before": [], "after": []},
    }
    if old_meta is None or not old_rows:
        reasons.append("stats_missing_old")
        result["hash"] = text_hash(f"missing|{len(new_rows)}")
        return result
    if new_meta is not None:
        reasons.extend(_compatibility(old_meta, new_meta))
    switch = new_rows[0]["start"] if new_rows else None
    importable = [row for row in old_rows if switch is None or row["start"] < switch]
    result["dropped_overlap"] = len(old_rows) - len(importable)
    result["import_count"] = len(importable)
    result["switch"] = switch
    if not importable:
        reasons.append("stats_nothing_to_import")
    else:
        last = importable[-1]
        result["old_last"] = last["start"]
        if result["dropped_overlap"]:
            reasons.append("stats_overlap")
        if switch is not None:
            result["gap_hours"] = round((switch - last["start"]) / HOUR - 1, 2)
            if result["gap_hours"] > 0:
                reasons.append("stats_gap")
        else:
            reasons.append("stats_new_empty")
        if result["has_sum"] and switch is not None and last.get("sum") is None:
            reasons.append("stats_no_sum")  # the new totals cannot be continued from the old end
        if result["has_sum"] and switch is not None and last.get("sum") is not None:
            result["offset"] = last["sum"]
            first = new_rows[0]
            result["preview"] = {
                "before": [_brief(row) for row in importable[-PREVIEW_ROWS:]],
                "after": [
                    {**_brief(row), "sum_after": (row.get("sum") or 0) + last["sum"]}
                    for row in new_rows[:PREVIEW_ROWS]
                ],
            }
            result["new_first_sum"] = first.get("sum")
        else:
            result["preview"] = {
                "before": [_brief(row) for row in importable[-PREVIEW_ROWS:]],
                "after": [_brief(row) for row in new_rows[:PREVIEW_ROWS]],
            }
    result["hash"] = _fingerprint(
        old_meta, new_meta, importable, new_rows, result["dropped_overlap"]
    )
    return result


async def analyse_pair(hass: HomeAssistant, old_id: str, new_id: str) -> dict[str, Any]:
    """Read both series and describe the join; reports ``no_recorder`` without a recorder."""
    if not recorder_ready(hass):
        return {
            "reasons": ["no_recorder"],
            "hash": "no_recorder",
            "old_rows": 0,
            "new_rows": 0,
            "import_count": 0,
        }
    from homeassistant.components.recorder import get_instance

    instance = get_instance(hass)
    old_meta, old_rows = await instance.async_add_executor_job(read_series, hass, old_id)
    new_meta, new_rows = await instance.async_add_executor_job(read_series, hass, new_id)
    analysis = analyse(old_meta, old_rows, new_meta, new_rows)
    analysis["old_meta"] = _public_meta(old_meta)
    analysis["new_meta"] = _public_meta(new_meta)
    return analysis


def _public_meta(meta: dict[str, Any] | None) -> dict[str, Any] | None:
    if meta is None:
        return None
    return {
        "unit": meta.get("unit_of_measurement"),
        "has_sum": bool(meta.get("has_sum")),
        "mean_type": _flag(meta, "mean_type"),
    }


def free_alt_id(hass: HomeAssistant, entity_id: str) -> tuple[str, bool]:
    """The ID the old entity moves to (``_alt``, then ``_alt_2``…) and whether one was free."""
    from homeassistant.helpers import entity_registry as er

    registry = er.async_get(hass)
    domain, _, name = entity_id.partition(".")
    for index in range(1, 20):
        candidate = f"{domain}.{name}_alt" + (f"_{index}" if index > 1 else "")
        if registry.async_get(candidate) is None and hass.states.get(candidate) is None:
            return candidate, False
    return f"{domain}.{name}_alt", True


async def prepare_meter(hass: HomeAssistant, old_id: str, new_id: str, mode: str) -> dict[str, Any]:
    """Everything the judge and the runner need to know about one meter migration.

    The fingerprint covers both registry entries and the statistics of both series, so a plan
    whose entities or history changed after the preview is refused at execution.
    """
    from homeassistant.helpers import entity_registry as er

    from .cleanup import registry_fingerprint

    registry = er.async_get(hass)
    old_entry, new_entry = registry.async_get(old_id), registry.async_get(new_id)
    analysis: dict[str, Any] = {}
    if mode in {"both", "statistics"}:
        analysis = await analyse_pair(hass, old_id, new_id)
    alt_id, alt_taken = free_alt_id(hass, old_id)
    parts = [
        mode,
        registry_fingerprint(old_entry) if old_entry else "gone",
        registry_fingerprint(new_entry) if new_entry else "gone",
        analysis.get("hash", "-"),
        alt_id,
    ]
    return {
        "fingerprint": text_hash("|".join(parts)),
        "analysis": analysis,
        "alt_id": alt_id,
        "alt_taken": alt_taken,
        "old_in_registry": old_entry is not None,
        "target_in_registry": new_entry is not None,
    }
