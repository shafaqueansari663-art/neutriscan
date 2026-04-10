import bcrypt
from fastapi import APIRouter, Depends, HTTPException

from app.config import Settings, get_settings
from app.dependencies import get_current_user
from app.schemas.auth_api import LoginRequest, SignupRequest, TokenResponse, UserProfileOut
from app.services.data_store import load_users, save_users
from app.services.jwt_tokens import create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"),
            password_hash.encode("utf-8"),
        )
    except ValueError:
        return False


@router.post("/signup", response_model=TokenResponse)
def signup(body: SignupRequest, settings: Settings = Depends(get_settings)):
    key = body.username.strip()
    if not key:
        raise HTTPException(status_code=400, detail="Username is required")
    users = load_users(settings)
    if key in users:
        raise HTTPException(status_code=400, detail="An account with this username already exists")
    profile = {
        "username": key,
        "age": body.age,
        "weight": body.weight,
        "weightUnit": body.weightUnit,
        "condition": body.condition or "",
        "conditionDescription": body.conditionDescription or "",
    }
    users[key] = {
        "password_hash": _hash_password(body.password),
        "profile": profile,
    }
    save_users(settings, users)
    token = create_access_token(settings, key)
    return TokenResponse(access_token=token, profile=UserProfileOut.model_validate(profile))


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, settings: Settings = Depends(get_settings)):
    key = body.username.strip()
    users = load_users(settings)
    row = users.get(key)
    if not row or not _verify_password(body.password, row.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_access_token(settings, key)
    return TokenResponse(
        access_token=token,
        profile=UserProfileOut.model_validate(row["profile"]),
    )


@router.get("/me", response_model=UserProfileOut)
def me(user: UserProfileOut = Depends(get_current_user)):
    return user
