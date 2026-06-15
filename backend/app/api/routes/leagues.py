"""League board and leaderboard endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_repo
from app.repositories import Repository
from app.schemas import BoardOut, FixtureOut, LeaderboardRow, LeagueOut

router = APIRouter(tags=["leagues"])

RepoDep = Annotated[Repository, Depends(get_repo)]


@router.get("/leagues", response_model=list[LeagueOut])
def list_leagues(repo: RepoDep) -> list[LeagueOut]:
    return [LeagueOut.from_domain(lg) for lg in repo.list_leagues()]


@router.get("/leagues/{league_id}/board", response_model=BoardOut)
def league_board(league_id: str, repo: RepoDep) -> BoardOut:
    league = repo.get_league(league_id)
    if league is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"unknown league: {league_id}")
    fixtures = repo.list_fixtures(league_id)
    return BoardOut(
        league=LeagueOut.from_domain(league),
        fixtures=[FixtureOut.from_domain(f) for f in fixtures],
    )


@router.get("/leagues/{league_id}/leaderboard", response_model=list[LeaderboardRow])
def league_leaderboard(league_id: str, repo: RepoDep) -> list[LeaderboardRow]:
    if repo.get_league(league_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"unknown league: {league_id}")
    return [LeaderboardRow.from_stats(s) for s in repo.leaderboard(league_id)]
