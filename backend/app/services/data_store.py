import json
from pathlib import Path
from typing import Any

from app.config import Settings


def _users_path(settings: Settings) -> Path:
    root = Path(__file__).resolve().parent.parent.parent / settings.data_dir
    root.mkdir(parents=True, exist_ok=True)
    return root / "users.json"


def _logs_path(settings: Settings) -> Path:
    root = Path(__file__).resolve().parent.parent.parent / settings.data_dir
    root.mkdir(parents=True, exist_ok=True)
    return root / "logs.json"


def load_users(settings: Settings) -> dict[str, Any]:
    p = _users_path(settings)
    if not p.exists():
        return {}
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (json.JSONDecodeError, OSError):
        return {}


def save_users(settings: Settings, users: dict[str, Any]) -> None:
    p = _users_path(settings)
    p.write_text(json.dumps(users, indent=2), encoding="utf-8")


def load_all_logs(settings: Settings) -> dict[str, list]:
    p = _logs_path(settings)
    if not p.exists():
        return {}
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (json.JSONDecodeError, OSError):
        return {}


def save_all_logs(settings: Settings, logs: dict[str, list]) -> None:
    p = _logs_path(settings)
    p.write_text(json.dumps(logs, indent=2), encoding="utf-8")