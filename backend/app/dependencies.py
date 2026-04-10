from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import Settings, get_settings
from app.schemas.auth_api import UserProfileOut
from app.services.data_store import load_users

security = HTTPBearer(auto_error=False)


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(security),
    settings: Settings = Depends(get_settings),
) -> UserProfileOut:
    if creds is None or not creds.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    from app.services.jwt_tokens import decode_username

    username = decode_username(settings, creds.credentials)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    users = load_users(settings)
    row = users.get(username)
    if not row or "profile" not in row:
        raise HTTPException(status_code=401, detail="User not found")
    return UserProfileOut.model_validate(row["profile"])
