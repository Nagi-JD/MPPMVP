"""Application factory and module-level `app`."""

from __future__ import annotations

from fastapi import FastAPI

from app.api.routes import api_router
from app.core.config import Settings, get_settings


def create_app(settings: Settings | None = None) -> FastAPI:
    """Build and configure the FastAPI application."""
    settings = settings or get_settings()
    app = FastAPI(title=settings.app_name, debug=settings.debug)

    @app.get("/health", tags=["meta"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(api_router)
    return app


app = create_app()
