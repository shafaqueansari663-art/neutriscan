from typing import Literal

from pydantic import BaseModel, Field


class UserProfileOut(BaseModel):
    username: str
    age: int
    weight: float
    weightUnit: str
    condition: str = ""
    conditionDescription: str = ""

    model_config = {"populate_by_name": True}


class SignupRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=6)
    age: int = Field(..., ge=1, le=120)
    weight: float = Field(..., gt=0)
    weightUnit: Literal["kg", "lbs"]
    condition: str = ""
    conditionDescription: str = ""


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    profile: UserProfileOut
