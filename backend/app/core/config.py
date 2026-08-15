"""Application configuration loaded from environment variables."""
from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ directory (this file is backend/app/core/config.py) so .env resolves
# regardless of the process working directory.
_BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_BACKEND_DIR / ".env", env_file_encoding="utf-8", extra="ignore"
    )

    app_name: str = "Vedic Horoscope API"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"
    cors_origins: str = "http://localhost:3000"

    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 1440

    database_url: str = "postgresql+psycopg://horoscope:horoscope@localhost:5432/horoscope"

    supabase_url: str = ""
    supabase_jwt_audience: str = "authenticated"
    # Comma-separated emails granted admin rights on login.
    admin_emails: str = ""

    ephemeris_path: str = Field(default="./ephe")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def admin_email_set(self) -> set[str]:
        return {e.strip().lower() for e in self.admin_emails.split(",") if e.strip()}

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
