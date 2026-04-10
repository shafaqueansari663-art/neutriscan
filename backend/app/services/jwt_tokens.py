from datetime import datetime, timedelta, timezone

import jwt

from app.config import Settings

ALGO = "HS256"
TTL_DAYS = 30


def create_access_token(settings: Settings, username: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": username,
        "iat": now,
        "exp": now + timedelta(days=TTL_DAYS),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGO)


def decode_username(settings: Settings, token: str) -> str | None:
    try:
        data = jwt.decode(token, settings.jwt_secret, algorithms=[ALGO])
        sub = data.get("sub")
        return str(sub) if sub else None
    except jwt.PyJWTError:
        return None
