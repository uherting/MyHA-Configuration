"""What the last scan actually read: one entry per source, so an empty list can be told from a blind one.

A source is *checked* when it was read, *partial* when only a part of it was, *skipped* when it exists
but could not be read, *absent* when the installation does not have it (no Supervisor, no Energy
dashboard) and *unknown* when the scan never got that far. Only reasons are kept, never error texts
or secrets (dashboard paths and a failure category may be named), so the report can go into the diagnostics as it is.
"""

from __future__ import annotations

from typing import Any

SOURCES = (
    "registry",
    "automations",
    "blueprints",
    "dashboards",
    "energy",
    "apps",
    "statistics",
    "database",
)
# What counts against a complete picture: these sources are missing something.
GAPS = ("skipped", "partial")


# A gap that a later scan can close: everything except a component that is not there at all.
PERMANENT_REASONS = ("unavailable",)
RETRY_MINUTES = 5
RETRY_LIMIT = 3


class ScanCoverage:
    """The state of each source in one scan; rebuilt at the start of every scan."""

    def __init__(self) -> None:
        self._items: dict[str, dict[str, Any]] = {}

    def reset(self) -> None:
        self._items = {}

    def _set(self, source: str, state: str, reason: str | None, **extra: Any) -> None:
        self._items[source] = {"source": source, "state": state, "reason": reason, **extra}

    def checked(self, source: str) -> None:
        """Read in full; never overrides a gap noted earlier in the same scan."""
        if self._items.get(source, {}).get("state") not in GAPS:
            self._set(source, "checked", None)

    def skipped(self, source: str, reason: str) -> None:
        self._set(source, "skipped", reason)

    def partial(self, source: str, reason: str, **counts: Any) -> None:
        self._set(source, "partial", reason, **counts)

    def absent(self, source: str, reason: str) -> None:
        self._set(source, "absent", reason)

    def counts(self, source: str, **amounts: int) -> None:
        """How much of a source was read; only for a source that is not absent or skipped."""
        item = self._items.get(source)
        if item and item["state"] in ("checked", "partial"):
            item["counts"] = amounts

    def report(self) -> list[dict[str, Any]]:
        """Every source in a fixed order; one the scan did not reach is ``unknown``."""
        return [
            self._items.get(source) or {"source": source, "state": "unknown", "reason": None}
            for source in SOURCES
        ]


def gaps(report: list[dict[str, Any]]) -> list[str]:
    """The sources that are not fully read: skipped, partial or unknown."""
    return [item["source"] for item in report if item["state"] in (*GAPS, "unknown")]


def retryable_gaps(report: list[dict[str, Any]]) -> list[str]:
    """The skipped or partly read sources that a new scan may well read in full."""
    return [
        item["source"]
        for item in report
        if item["state"] in GAPS and item.get("reason") not in PERMANENT_REASONS
    ]
