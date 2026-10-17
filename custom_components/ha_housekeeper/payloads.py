"""The shape of what the websocket commands of the newer views send to the panel.

Only descriptions for readers and type checkers: nothing here runs. A field added to a reply is
added here too, and ``tests/test_homeassistant_runtime.py`` keeps the fields the panel reads.
"""

from __future__ import annotations

from typing import Any, NotRequired, TypedDict


class Reply(TypedDict, total=False):
    """Fields every recorder-based reply can carry."""

    available: bool
    busy: bool
    cached: bool
    took_ms: int | None
    thresholds: dict[str, float]
    findings: list[dict[str, Any]]


class ExposureAssistant(TypedDict):
    id: str
    status: str  # ok, inactive or unavailable (never "not exposed")
    exposed: int


class ExposureBridge(TypedDict):
    kind: str
    title: str
    exposed: int


class ExposureItem(TypedDict):
    entity_id: str
    name: str
    assistants: NotRequired[list[str]]


class ExposureFinding(TypedDict):
    kind: str
    level: str
    count: int
    items: NotRequired[list[ExposureItem]]
    assistant: NotRequired[str]
    alias: NotRequired[str]
    domain: NotRequired[str]


class ExposureResult(TypedDict):
    available: bool
    exposed_entities: list[dict[str, Any]]
    exposed_total: int
    assistants: list[ExposureAssistant]
    bridges: list[ExposureBridge]
    webhooks: int  # a count only, never an id or a url
    checked: int
    findings: list[ExposureFinding]


class ReliabilityCoverage(TypedDict):
    known: int
    with_data: int
    observed_share: int | None


class ReliabilityRow(TypedDict):
    entry_id: str
    title: str
    domain: str | None
    state: str | None
    reauth: bool
    entities: int
    permanent: int
    availability: float | None
    shared_outages: int
    longest_outage: int
    layer: str | None
    last_disruption: dict[str, Any] | None
    affected_total: int
    affected: list[dict[str, Any]]
    previous_availability: NotRequired[float | None]
    delta: NotRequired[float | None]


class ReliabilityResult(Reply):
    missing: NotRequired[bool]
    entries: list[ReliabilityRow]
    unstable: dict[str, Any]
    window_days: int
    coverage: ReliabilityCoverage
    comparison: dict[str, bool]
    stale: bool
    age_seconds: int
    computed_at: float


class RunsRow(TypedDict, total=False):
    object_type: str
    entity_id: str
    name: str
    status: str
    runs: int
    ok: int
    errors: int
    conditions: int
    mean_ms: int | None
    max_ms: int | None
    per_day: list[int]
    lower_bound: bool
    change: dict[str, Any] | None
    findings: list[dict[str, Any]]


class RunsResult(TypedDict, total=False):
    items: list[RunsRow]
    conflicts: dict[str, Any]  # checked, total, items: opposing commands and possible loops
    since: str | None
    window_days: int
    total: int
    excluded: dict[str, int]
    thresholds: dict[str, float]


class StormsResult(Reply, total=False):
    stale: bool
    age_seconds: int
    computed_at: float
    window_days: int
    total_rows: int
    per_day: int
    entity_count: int
    excluded: dict[str, int]
    entities: list[dict[str, Any]]
    integrations: list[dict[str, Any]]
    events: list[dict[str, Any]]
    event_total: int
    state_changed_events: int


class DbHealthResult(Reply, total=False):
    keep_days: int | None
    auto_purge: bool | None
    stale: bool
    age_seconds: int
    computed_at: float
    supported: bool
    dialect: str
    db_bytes: int | None
    wal_bytes: int | None
    growth: dict[str, Any]
    restart_gaps: int
    integrity: dict[str, Any]


class StatisticsLastResult(TypedDict):
    available: bool
    busy: bool
    last: dict[str, float | None]  # statistic_id -> start of the newest hourly row (epoch seconds)
    first: dict[str, float | None]  # statistic_id -> start of the oldest hourly row
    rows: dict[str, int]  # statistic_id -> number of hourly rows


class PolicyItem(TypedDict):
    object_type: str
    object_id: str
    name: str
    key: str  # the key for the ignore list
    ignored: bool
    by: str | None  # "label", "user" or None
    also: NotRequired[list[str]]  # duplicate_name: the other entities with the same name
    expected: NotRequired[str]  # naming_scheme: the prefix the id should start with
    rate: NotRequired[int]  # state_rate: state changes per day
    keep_days: NotRequired[int]  # recorder_retention: days the recorder keeps
    db_bytes: NotRequired[int]  # recorder_retention: size of the database
    days: NotRequired[int]  # user_inactive: days since the last login (absent: never)
    idle_days: NotRequired[int]  # companion_silent: days without a report, at least


class PolicyRule(TypedDict):
    id: str
    enabled: bool
    count: int  # violations that are not hidden
    ignored: int
    items: list[PolicyItem]
    pending: NotRequired[bool]  # the numbers the rule reads were never calculated


class PoliciesResult(TypedDict):
    available: bool
    rules: list[PolicyRule]
    violations: int
    enabled: int
    prefixes: dict[str, str]  # naming scheme: domain -> prefix
    limit: int  # state_rate: changes per entity and day from which it counts


class BlueprintsResult(TypedDict):
    available: bool
    domains: list[dict[str, Any]]  # per domain: total, unused, missing, broken (lists of paths)
    unused: int  # blueprints nothing uses
    missing: int  # paths used by automations or scripts that no blueprint file answers
    broken: int  # blueprint files that fail to load


class Snapshot(TypedDict):
    """The result of a scan (``inventory``, ``scan``): everything the overview and lists show."""

    meta: dict[str, Any]
    objects: list[dict[str, Any]]
    edges: list[dict[str, Any]]
    findings: list[dict[str, Any]]
    causes: list[dict[str, Any]]
    reminders: list[dict[str, Any]]
    notes: list[dict[str, Any]]
    regressions: list[dict[str, Any]]
    criteria_alerts: list[dict[str, Any]]
    orphaned_statistics: list[dict[str, Any]]
    statistic_issues: list[dict[str, Any]]
    quarantine: list[dict[str, Any]]
    recurring_devices: list[dict[str, Any]]


class Note(TypedDict):
    """An entry written by the person (``note_set``, ``Snapshot.notes``)."""

    id: str
    title: str
    at: str  # ISO time with zone
    target: str
    note: str
    source: str  # "me" or "housekeeper" (suggested after an action, accepted by the person)
    ref: str  # the plan an entry of source "housekeeper" came from


class PlanSummary(TypedDict):
    """One row of the journal list (``plan_list``): no actions and no restore data."""

    plan_id: str
    created_at: str | None
    status: str | None
    executed: bool
    run: bool
    finished_at: str | None
    undoable: bool
    summary: dict[str, Any] | None
    file_snapshot_dropped: bool
    followup: str | None  # watching, clean, regression, stopped
    followup_until: str | None
    objects: list[str]
    done_objects: list[str]
    done_count: int
    kinds: list[str]


class RecorderSpan(TypedDict):
    """Rows and first and last time (epoch seconds) of one recorder table for one entity."""

    rows: int
    first: float | None
    last: float | None


class EntityRecorderResult(TypedDict):
    """What ``entity_recorder`` sends: raw states, short-term and long-term statistics."""

    available: bool
    busy: bool
    states: NotRequired[RecorderSpan]
    short: NotRequired[RecorderSpan]
    long: NotRequired[RecorderSpan]
    keep_days: NotRequired[int | None]
