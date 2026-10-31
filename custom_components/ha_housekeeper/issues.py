"""Repairs hints. One aggregated, non-fixable issue per finding category.

A group whose switch is off (see hints.py) raises no hint and loses the one it has."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir

from .const import DOMAIN, PANEL_URL
from .hints import enabled_hints, hint_minimum
from .outage_levels import is_quiet

ISSUE_FILTERS = {
    "orphaned_entities": "orphaned",
    "unavailable_entities": "unavailable",
    "broken_automations": "broken_reference",
}

ISSUE_IDS = ("orphaned_entities", "unavailable_entities", "broken_automations")
SCAN_ISSUE_ID = "scan_health"
DATABASE_ISSUE_ID = "database_damaged"
BACKUP_ISSUE_ID = "backup_problem"
STATISTICS_ISSUE_ID = "orphaned_statistics"


CATEGORIES = {
    "broken_reference": "broken_automations",
    "orphaned": "orphaned_entities",
    "unavailable": "unavailable_entities",
}


def async_sync_issues(hass: HomeAssistant, findings: list[dict[str, Any]]) -> None:
    """Create, update or clear the hints. Housekeeper never offers a fix."""
    counts = dict.fromkeys(ISSUE_IDS, 0)
    for finding in findings:
        # Only these three kinds are repairs; every other kind (duplicates, unused, stale,
        # failed config entries, ...) stays a finding in the panel, so no hint links to an empty filter.
        category = CATEGORIES.get(finding["classification"])
        if category and not finding.get("ignored") and not is_quiet(finding):
            counts[category] += 1

    enabled = enabled_hints(hass)
    for issue_id, count in counts.items():
        if count > hint_minimum(hass, issue_id) and issue_id in enabled:
            link = f"/{PANEL_URL}?view=findingsNav&filter={ISSUE_FILTERS[issue_id]}"
            ir.async_create_issue(
                hass,
                DOMAIN,
                issue_id,
                is_fixable=False,
                learn_more_url=link,
                severity=ir.IssueSeverity.WARNING,
                translation_key=issue_id,
                translation_placeholders={"count": str(count), "link": link},
            )
        else:
            ir.async_delete_issue(hass, DOMAIN, issue_id)


def async_sync_scan_issue(hass: HomeAssistant, health: dict[str, Any]) -> None:
    """One hint while scans keep failing or none succeeded for too long; it ends with the next success."""
    if not health.get("needs_repair") or SCAN_ISSUE_ID not in enabled_hints(hass):
        ir.async_delete_issue(hass, DOMAIN, SCAN_ISSUE_ID)
        return
    failing = health["state"] == "failed"
    ir.async_create_issue(
        hass,
        DOMAIN,
        SCAN_ISSUE_ID,
        is_fixable=False,
        learn_more_url=f"/{PANEL_URL}",
        severity=ir.IssueSeverity.WARNING,
        translation_key="scan_failing" if failing else "scan_stale",
        translation_placeholders={
            "last": str(health.get("last_success_at") or "-")[:16].replace("T", " "),
            "phase": str(health.get("failed_phase") or "-"),
            "kind": str(health.get("error_class") or "-"),
            "link": f"/{PANEL_URL}",
        },
    )


def async_sync_database_issue(hass: HomeAssistant, integrity: dict[str, Any] | None) -> None:
    """One hint while the last full check of the recorder database found damage; a clean check ends it."""
    if (
        not integrity
        or integrity.get("state") != "damaged"
        or DATABASE_ISSUE_ID not in enabled_hints(hass)
    ):
        ir.async_delete_issue(hass, DOMAIN, DATABASE_ISSUE_ID)
        return
    lines = integrity.get("lines") or []
    link = f"/{PANEL_URL}?view=recorder"
    ir.async_create_issue(
        hass,
        DOMAIN,
        DATABASE_ISSUE_ID,
        is_fixable=False,
        learn_more_url=link,
        severity=ir.IssueSeverity.ERROR,
        translation_key=DATABASE_ISSUE_ID,
        translation_placeholders={
            "at": str(integrity.get("at") or "-")[:16].replace("T", " "),
            "first": str(lines[0] if lines else "-")[:200],
            "link": link,
        },
    )


def async_sync_backup_issue(hass: HomeAssistant, report: dict[str, Any] | None) -> None:
    """One hint while backup protection judges the backups a problem; without a report it stays as it is."""
    if BACKUP_ISSUE_ID not in enabled_hints(hass):
        ir.async_delete_issue(hass, DOMAIN, BACKUP_ISSUE_ID)
        return
    if report is None:
        return
    if not report.get("available") or report.get("overall") != "problem":
        ir.async_delete_issue(hass, DOMAIN, BACKUP_ISSUE_ID)
        return
    link = f"/{PANEL_URL}?view=maintenance&tab=backup"
    ir.async_create_issue(
        hass,
        DOMAIN,
        BACKUP_ISSUE_ID,
        is_fixable=False,
        learn_more_url=link,
        severity=ir.IssueSeverity.WARNING,
        translation_key=BACKUP_ISSUE_ID,
        translation_placeholders={
            "count": str((report.get("counts") or {}).get("problem", 1)),
            "link": link,
        },
    )


def async_sync_statistics_issue(hass: HomeAssistant, count: int) -> None:
    """One hint while more statistics than the minimum exist whose entity is gone."""
    if count <= hint_minimum(hass, STATISTICS_ISSUE_ID) or STATISTICS_ISSUE_ID not in enabled_hints(
        hass
    ):
        ir.async_delete_issue(hass, DOMAIN, STATISTICS_ISSUE_ID)
        return
    link = f"/{PANEL_URL}?view=cleanup&tab=stats"
    ir.async_create_issue(
        hass,
        DOMAIN,
        STATISTICS_ISSUE_ID,
        is_fixable=False,
        learn_more_url=link,
        severity=ir.IssueSeverity.WARNING,
        translation_key=STATISTICS_ISSUE_ID,
        translation_placeholders={"count": str(count), "link": link},
    )


def async_clear_issues(hass: HomeAssistant) -> None:
    """Remove all hints, for example when the integration is unloaded."""
    for issue_id in (
        *ISSUE_IDS,
        SCAN_ISSUE_ID,
        DATABASE_ISSUE_ID,
        BACKUP_ISSUE_ID,
        STATISTICS_ISSUE_ID,
    ):
        ir.async_delete_issue(hass, DOMAIN, issue_id)
