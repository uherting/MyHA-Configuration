"""A Markdown report of one cleanup plan for the audit trail.

Everything comes from the stored plan: what was planned, what ran, who confirmed it, the backup,
the checks afterwards, the undo state, the steps left to do by hand, and the follow-up. By default
IDs and names are replaced by placeholders, so the report can be handed on; the same object
always gets the same placeholder.
"""

from __future__ import annotations

from typing import Any

TEXTS: dict[str, dict[str, str]] = {
    "de": {
        "title": "Prüfbericht zum Bereinigungsplan",
        "overview": "Überblick",
        "plan": "Plan",
        "created": "Erstellt",
        "scan": "Grundlage (Scan)",
        "status": "Stand",
        "confirmed": "Bestätigt",
        "by": "von",
        "run": "Ausgeführt",
        "backup": "Backup",
        "no_backup": "kein Backup nötig oder gemacht",
        "simulation": "Erwarteter Endzustand",
        "actions": "Aktionen",
        "verification": "Nachprüfung",
        "undo": "Rückgängig",
        "manual": "Von Hand zu erledigen",
        "followup": "Nachkontrolle",
        "events": "Ablauf",
        "none": "keine",
        "anonymized": "Die IDs und Namen in diesem Bericht sind durch Platzhalter ersetzt.",
        "removed": "Entfernte Entitäten",
        "disabled": "Deaktivierte Entitäten",
        "replaced": "Ersetzte Referenzen",
        "remaining_certain": "Verbleibende sichere Verwendungen",
        "remaining_uncertain": "Verbleibende unsichere Verwendungen",
        "orphaned": "Voraussichtlich verwaiste Statistiken",
        "blocked": "Nicht ausführbare Aktionen",
        "purge_rows": "Zeilen im Recorder, die der Purge entfernt",
        "history_rows_kept": "Zeilen Verlauf, die im Recorder bleiben, bis er sie bereinigt",
        "limits": "Grenzen: Verweise in Vorlagen und außerhalb von Home Assistant sind nicht"
        " sicher prüfbar; eine Speicherersparnis wird nicht geschätzt.",
        "state": "Zustand",
        "result": "Ergebnis",
        "ok": "in Ordnung",
        "failed": "fehlgeschlagen",
    },
    "en": {
        "title": "Audit report for the cleanup plan",
        "overview": "Overview",
        "plan": "Plan",
        "created": "Created",
        "scan": "Based on scan",
        "status": "Status",
        "confirmed": "Confirmed",
        "by": "by",
        "run": "Executed",
        "backup": "Backup",
        "no_backup": "no backup needed or made",
        "simulation": "Expected end state",
        "actions": "Actions",
        "verification": "Verification",
        "undo": "Undo",
        "manual": "To do by hand",
        "followup": "Follow-up",
        "events": "Sequence",
        "none": "none",
        "anonymized": "IDs and names in this report are replaced by placeholders.",
        "removed": "Entities removed",
        "disabled": "Entities disabled",
        "replaced": "References replaced",
        "remaining_certain": "Certain uses remaining",
        "remaining_uncertain": "Uncertain uses remaining",
        "orphaned": "Statistics likely to be orphaned",
        "blocked": "Actions that cannot run",
        "purge_rows": "Recorder rows the purge removes",
        "history_rows_kept": "History rows that stay in the recorder until it cleans them up",
        "limits": "Limits: references inside templates and outside Home Assistant cannot be"
        " checked for certain; saved storage is not estimated.",
        "state": "State",
        "result": "Result",
        "ok": "ok",
        "failed": "failed",
    },
}


class _Names:
    """Placeholders for IDs and names, stable within one report."""

    def __init__(self, anonymize: bool) -> None:
        self.anonymize = anonymize
        self._seen: dict[tuple[str, str], str] = {}

    def __call__(self, kind: str, value: Any) -> str:
        if value is None:
            return "-"
        if not self.anonymize:
            return str(value)
        key = (kind, str(value))
        if key not in self._seen:
            count = sum(1 for k in self._seen if k[0] == kind) + 1
            self._seen[key] = f"{kind}_{count}"
        return self._seen[key]


def _kind_of_source(source: str) -> str:
    return source.split(":", 1)[0] if ":" in source else "source"


def build_report(plan: dict[str, Any], *, anonymize: bool = True, lang: str = "en") -> str:
    """The report for ``plan`` as Markdown."""
    t = TEXTS.get(lang, TEXTS["en"])
    names = _Names(anonymize)
    device_ids = {
        a["object_id"] for a in plan.get("actions", []) if a.get("object_type") == "device"
    }

    def ref(kind: str, value: Any) -> str:
        # The same object keeps one placeholder wherever it appears.
        return names("device" if value in device_ids else kind, value)

    lines = [f"# {t['title']} {plan['plan_id']}", ""]
    if anonymize:
        lines += [f"_{t['anonymized']}_", ""]
    confirmed, run = plan.get("confirmed") or {}, plan.get("run") or {}
    backup = plan.get("backup")
    lines += [
        f"## {t['overview']}",
        "",
        f"- {t['created']}: {plan.get('created_at')}",
        f"- {t['scan']}: {plan.get('scanned_at')}",
        f"- {t['status']}: {plan.get('status')}",
        f"- {t['confirmed']}: {confirmed.get('at') or '-'}"
        + (f" {t['by']} {ref('user', confirmed.get('user_id'))}" if confirmed else ""),
        f"- {t['run']}: {run.get('started_at') or '-'} → {run.get('finished_at') or '-'}",
        f"- {t['backup']}: "
        + (f"{backup['at']} ({ref('backup', backup.get('job_id'))})" if backup else t["no_backup"]),
        "",
    ]
    simulation = plan.get("simulation")
    if simulation:
        lines += [f"## {t['simulation']}", ""]
        for key in ("removed", "disabled", "replaced", "remaining_certain", "remaining_uncertain"):
            lines.append(f"- {t[key]}: {simulation.get(key, 0)}")
        if simulation.get("rows_counted"):
            lines += [
                f"- {t['purge_rows']}: {simulation.get('purge_rows', 0)}",
                f"- {t['history_rows_kept']}: {simulation.get('history_rows_kept', 0)}",
            ]
        lines += [
            f"- {t['orphaned']}: {simulation.get('statistics_orphaned_count', 0)}",
            f"- {t['blocked']}: {simulation.get('blocked', 0)}",
            f"- _{t['limits']}_",
            "",
        ]
    lines += [f"## {t['actions']}", "", f"| # | kind | object | target | verdict | {t['result']} |"]
    lines.append("|---|---|---|---|---|---|")
    manual: list[str] = []
    for index, action in enumerate(plan.get("actions", []), 1):
        kind = "device" if action.get("object_type") == "device" else "entity"
        result = action.get("result") or {}
        target = ref("entity", action["target"]) if action.get("target") else "-"
        lines.append(
            f"| {index} | {action['kind']} | {ref(kind, action['object_id'])} | {target} | "
            f"{action['verdict']} | {result.get('state', '-')}"
            + (f" ({result['reason']})" if result.get("reason") else "")
            + " |"
        )
        for source in action.get("sources") or []:
            if not source.get("writable") or source.get("manual"):
                manual.append(
                    f"{ref(_kind_of_source(source['source']), source['source'])}"
                    f" ({source.get('reason') or 'manual'})"
                )
    lines.append("")
    verification = plan.get("verification")
    if verification:
        lines += [f"## {t['verification']}", ""]
        for check in verification["checks"]:
            mark = t["ok"] if check["ok"] else t["failed"]
            subject = f" {ref('entity', check['object_id'])}" if check.get("object_id") else ""
            lines.append(f"- {check['check']}{subject}: {mark}")
        lines.append("")
    undone = [
        a for a in plan.get("actions", []) if (a.get("result") or {}).get("state") == "undone"
    ]
    lines += [f"## {t['undo']}", ""]
    if undone:
        for action in undone:
            kind = "device" if action.get("object_type") == "device" else "entity"
            at = action["result"].get("undone_at")
            lines.append(f"- {ref(kind, action['object_id'])}: {at}")
    else:
        lines.append(f"- {t['none']}")
    lines += ["", f"## {t['manual']}", ""]
    lines += [f"- {item}" for item in dict.fromkeys(manual)] or [f"- {t['none']}"]
    followup = plan.get("followup")
    if followup:
        lines += ["", f"## {t['followup']}", "", f"- {t['state']}: {followup['state']}"]
        if followup.get("at"):
            lines.append(f"- {followup['at']}")
        for item in followup.get("new") or []:
            lines.append(f"- {item['classification']}: {ref('entity', item['object_id'])}")
    lines += ["", f"## {t['events']}", ""]
    for event in plan.get("events", []):
        extra = event.get("object_id")
        lines.append(
            f"- {event['at']} {event['type']}"
            + (f" {ref('entity', extra)}" if extra else "")
            + (f" ({event['reason']})" if event.get("reason") else "")
        )
    return "\n".join(lines) + "\n"
