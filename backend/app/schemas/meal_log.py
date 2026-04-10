from pydantic import BaseModel, Field


class MealLogIn(BaseModel):
    id: str
    date: str
    time: str
    food_name: str
    calories: float = Field(..., ge=0)
    protein_g: float = Field(..., ge=0)
    carbohydrates_g: float = Field(..., ge=0)
    fats_g: float = Field(..., ge=0)
    fiber_g: float = Field(default=0, ge=0)


class MealLogsResponse(BaseModel):
    logs: list[dict]
