from fastapi import APIRouter, Depends

from app.config import Settings, get_settings
from app.dependencies import get_current_user
from app.schemas.auth_api import UserProfileOut
from app.schemas.meal_log import MealLogIn, MealLogsResponse
from app.services.data_store import load_all_logs, save_all_logs

router = APIRouter(prefix="/api/logs", tags=["logs"])


@router.get("", response_model=MealLogsResponse)
def list_logs(
    user: UserProfileOut = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
):
    all_l = load_all_logs(settings)
    raw = all_l.get(user.username, [])
    logs = raw if isinstance(raw, list) else []
    return MealLogsResponse(logs=logs)


@router.post("", status_code=201)
def append_log(
    entry: MealLogIn,
    user: UserProfileOut = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
):
    all_l = load_all_logs(settings)
    lst = all_l.get(user.username)
    if not isinstance(lst, list):
        lst = []
    lst.insert(0, entry.model_dump())
    all_l[user.username] = lst
    save_all_logs(settings, all_l)
    return {"ok": True}
