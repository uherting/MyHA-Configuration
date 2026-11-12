"""Turn a notify service call into history records.

Pure functions, no Home Assistant import: they are tested on real call payloads.
"""
from __future__ import annotations

from typing import Any

from .const import COMMAND_MESSAGES, COMMAND_PREFIXES, STATUS_SENT

VIDEO_EXT = (".mp4", ".mov", ".m4v", ".webm")
AUDIO_EXT = (".mp3", ".m4a", ".wav", ".aac", ".caf")


def _str(value: Any) -> str | None:
    if value is None:
        return None
    value = str(value).strip()
    return value or None


def _as_list(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [v.strip() for v in value.split(",") if v.strip()]
    return [str(v) for v in value if v]


def is_command(message: str | None) -> bool:
    """True for Companion app commands (clear_notification, command_webview…)."""
    if not message:
        return False
    return message in COMMAND_MESSAGES or message.startswith(COMMAND_PREFIXES)


def _media(data: dict[str, Any]) -> dict[str, str | None]:
    """image / video / audio, with iOS attachment.url overriding them."""
    image = _str(data.get("image"))
    video = _str(data.get("video"))
    audio = _str(data.get("audio"))
    attachment = data.get("attachment")
    if isinstance(attachment, dict) and (url := _str(attachment.get("url"))):
        kind = str(attachment.get("content-type") or "").lower()
        path = url.split("?", 1)[0].lower()
        if path.endswith(VIDEO_EXT) or kind in ("mp4", "mov", "m4v", "mpeg4", "video"):
            video = url
        elif path.endswith(AUDIO_EXT) or kind in ("mp3", "m4a", "wav", "aac", "audio"):
            audio = url
        else:
            image = url
    return {"image": image, "video": video, "audio": audio}


def _actions(data: dict[str, Any]) -> list[dict[str, str]]:
    out = []
    for item in data.get("actions") or []:
        if not isinstance(item, dict) or not (action := _str(item.get("action"))):
            continue
        entry = {"action": action, "title": _str(item.get("title")) or action}
        if uri := _str(item.get("uri")):
            entry["uri"] = uri
        out.append(entry)
    return out


def targets_of(service: str, service_data: dict[str, Any]) -> list[str]:
    """Targets of a notify call: `notify.<service>` or the entities of send_message."""
    if service == "send_message":
        return [e for e in _as_list(service_data.get("entity_id")) if e.startswith("notify.")]
    return [f"notify.{service}"]


def normalize_call(
    service: str,
    service_data: dict[str, Any],
    *,
    ts: float,
    context_id: str,
    user_id: str | None = None,
) -> tuple[list[dict[str, Any]], list[tuple[str, str]]]:
    """Return (records, removals).

    records: one per target. removals: (target, tag) pairs for a
    clear_notification command, so the matching notification can be marked.
    """
    message = _str(service_data.get("message"))
    data = service_data.get("data") if isinstance(service_data.get("data"), dict) else {}
    targets = targets_of(service, service_data)

    if is_command(message):
        tag = _str(data.get("tag"))
        if message == "clear_notification" and tag:
            return [], [(t, tag) for t in targets]
        return [], []
    if not targets or (message is None and _str(service_data.get("title")) is None):
        return [], []

    base = {
        "ts": round(ts, 6),
        "title": _str(service_data.get("title")),
        "message": message,
        **_media(data),
        # iOS opens `url`, Android `clickAction`; both are accepted by recent apps.
        "link": _str(data.get("url")) or _str(data.get("clickAction")),
        "actions": _actions(data),
        "tag": _str(data.get("tag")),
        "group": _str(data.get("group")),
        "sub_targets": _as_list(service_data.get("target")),
        "context_id": context_id,
        "sent_by": user_id,
        "status": STATUS_SENT,
    }
    records = [{**base, "id": f"{context_id}:{target}", "target": target} for target in targets]
    return records, []
