"""API routers."""

from fastapi import APIRouter

from app.api.routes import leagues, predictions, users

api_router = APIRouter()
api_router.include_router(leagues.router)
api_router.include_router(users.router)
api_router.include_router(predictions.router)

__all__ = ["api_router"]
