from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    gemini_api_key: str
    # gemini-1.5-flash was retired from the API; use current stable Flash.
    gemini_model: str = "gemini-2.5-flash"
    jwt_secret: str = "dev-change-me-nutri-scan"
    data_dir: str = "data"


def get_settings() -> Settings:
    return Settings()
