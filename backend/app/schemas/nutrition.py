from pydantic import AliasChoices, BaseModel, Field


class NutritionScanResult(BaseModel):
    food_name: str = Field(..., description="Identified food item(s)")
    portion_estimation: str = Field(
        default="",
        validation_alias=AliasChoices("portion_estimation", "portion_description"),
        description="Estimated portion from visual context",
    )
    calories: float = Field(..., ge=0)
    protein_g: float = Field(
        ...,
        ge=0,
        validation_alias=AliasChoices("protein_g", "protein"),
    )
    carbs_g: float = Field(
        ...,
        ge=0,
        validation_alias=AliasChoices("carbs_g", "carbohydrates", "carbohydrates_g"),
    )
    fats_g: float = Field(
        ...,
        ge=0,
        validation_alias=AliasChoices("fats_g", "fats"),
    )
    fiber_g: float = Field(
        default=0,
        ge=0,
        validation_alias=AliasChoices("fiber_g", "fiber"),
    )

    model_config = {"populate_by_name": True}
