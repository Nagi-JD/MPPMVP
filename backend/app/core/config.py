"""Application configuration via pydantic-settings."""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Environment-driven settings with sensible defaults."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "MPP+ Backend"
    debug: bool = False

    # In-memory repo is the default; this is for the future Postgres impl.
    database_url: str = "sqlite+pysqlite:///./mpp.db"
    redis_url: str = "redis://localhost:6379/0"


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()
