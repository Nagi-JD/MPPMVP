"""User season-stats endpoint."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_repo
from app.repositories import Repository
from app.schemas import SeasonStatsOut

router = APIRouter(tags=["users"])

RepoDep = Annotated[Repository, Depends(get_repo)]


@router.get("/users/{user_id}/seasons/{league_id}", response_model=SeasonStatsOut)
def user_season(user_id: str, league_id: str, repo: RepoDep) -> SeasonStatsOut:
    if repo.get_league(league_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"unknown league: {league_id}")
    return SeasonStatsOut.from_domain(repo.season_stats(user_id, league_id))
