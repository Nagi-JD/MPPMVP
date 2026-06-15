"""Prediction upsert and market settlement endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_repo
from app.domain.models import Prediction
from app.repositories import Repository
from app.repositories.base import (
    MarketAlreadySettledError,
    MarketLockedError,
    MarketNotFoundError,
)
from app.schemas import PredictionIn, PredictionOut, SettleIn, SettleOut

router = APIRouter(tags=["predictions"])

RepoDep = Annotated[Repository, Depends(get_repo)]


@router.post("/predictions", response_model=PredictionOut, status_code=status.HTTP_200_OK)
def upsert_prediction(body: PredictionIn, repo: RepoDep) -> PredictionOut:
    try:
        saved = repo.upsert_prediction(
            Prediction(user_id=body.user_id, market_id=body.market_id, value=body.value)
        )
    except MarketNotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"unknown market: {body.market_id}") from exc
    except MarketLockedError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc
    return PredictionOut(user_id=saved.user_id, market_id=saved.market_id, value=saved.value)


@router.post("/markets/{market_id}/settle", response_model=SettleOut)
def settle_market(market_id: str, body: SettleIn, repo: RepoDep) -> SettleOut:
    try:
        market, awarded = repo.settle_market(market_id, body.result)
    except MarketNotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"unknown market: {market_id}") from exc
    except MarketAlreadySettledError as exc:
        raise HTTPException(
            status.HTTP_409_CONFLICT, f"market {market_id} already settled"
        ) from exc
    return SettleOut(
        market_id=market.id,
        result=market.result or "",
        status=market.status,
        awarded=awarded,
    )
