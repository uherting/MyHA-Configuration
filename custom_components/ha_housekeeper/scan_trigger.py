"""When a scan may be started from outside the panel: the service and the button.

The panel scans through its own command. The service and the button share this decision so that
many calls make one scan, a scan never starts inside a plan or while Home Assistant is booting, and
a call right after a scan does not run another one.
"""

from __future__ import annotations

SCAN_MIN_GAP = 60  # seconds between the end of a scan and the next requested one


class ScanRefused(Exception):
    """A requested scan is not allowed now; ``reason`` is the key of the message."""

    def __init__(self, reason: str) -> None:
        super().__init__(reason)
        self.reason = reason


def scan_request(
    *,
    running: bool,
    cleanup_busy: bool,
    warming_up: bool,
    since_last: float | None,
    gap: float = SCAN_MIN_GAP,
) -> str:
    """``start``, ``join`` (one is running), ``recent`` (one just finished); or ScanRefused.

    ``cleanup_busy``: a plan runs and scans itself, a scan in between would record intermediate
    states. ``warming_up``: a scan while Home Assistant starts is preliminary and records nothing.
    ``since_last``: seconds since the last scan ended, None when there was none yet.
    """
    if cleanup_busy:
        raise ScanRefused("cleanup_busy")
    if warming_up:
        raise ScanRefused("starting")
    if running:
        return "join"
    if since_last is not None and since_last < gap:
        return "recent"
    return "start"
