"""Pydantic v2 request/response models for the API layer."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.domain.enums import (
    MarketInput,
    MarketKind,
    MarketScope,
    MarketStatus,
    RankTier,
    Sport,
)
from app.domain.models import Fixture, League, Market
from app.domain.scoring import SeasonStats


class LeagueOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    sport: Sport
    org: str
    season: int

    @classmethod
    def from_domain(cls, league: League) -> LeagueOut:
        return cls(id=league.id, sport=league.sport, org=league.org, season=league.season)


class MarketOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    fixture_id: str
    kind: MarketKind
    label: str
    input: MarketInput
    difficulty: int
    scope: MarketScope
    lock_time: datetime
    status: MarketStatus
    result: str | None = None
    options: list[str] = Field(default_factory=list)

    @classmethod
    def from_domain(cls, market: Market) -> MarketOut:
        return cls(
            id=market.id,
            fixture_id=market.fixture_id,
            kind=market.kind,
            label=market.label,
            input=market.input,
            difficulty=market.difficulty,
            scope=market.scope,
            lock_time=market.lock_time,
            status=market.status,
            result=market.result,
            options=list(market.options),
        )


class FixtureOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    league_id: str
    name: str
    start_time: datetime
    markets: list[MarketOut] = Field(default_factory=list)

    @classmethod
    def from_domain(cls, fixture: Fixture) -> FixtureOut:
        return cls(
            id=fixture.id,
            league_id=fixture.league_id,
            name=fixture.name,
            start_time=fixture.start_time,
            markets=[MarketOut.from_domain(m) for m in fixture.markets],
        )


class BoardOut(BaseModel):
    """A league board: the league plus its fixtures (each with markets)."""

    league: LeagueOut
    fixtures: list[FixtureOut] = Field(default_factory=list)


class LeaderboardRow(BaseModel):
    user_id: str
    points: int
    made: int
    accuracy: float
    tier: RankTier

    @classmethod
    def from_stats(cls, stats: SeasonStats) -> LeaderboardRow:
        return cls(
            user_id=stats.user_id,
            points=stats.points,
            made=stats.made,
            accuracy=stats.accuracy,
            tier=stats.tier,
        )


class SeasonStatsOut(BaseModel):
    user_id: str
    league_id: str
    points: int
    made: int
    settled: int
    correct: int
    accuracy: float
    tier: RankTier

    @classmethod
    def from_domain(cls, stats: SeasonStats) -> SeasonStatsOut:
        return cls(
            user_id=stats.user_id,
            league_id=stats.league_id,
            points=stats.points,
            made=stats.made,
            settled=stats.settled,
            correct=stats.correct,
            accuracy=stats.accuracy,
            tier=stats.tier,
        )


class PredictionIn(BaseModel):
    user_id: str = Field(min_length=1)
    market_id: str = Field(min_length=1)
    value: str = Field(min_length=1)


class PredictionOut(BaseModel):
    user_id: str
    market_id: str
    value: str


class SettleIn(BaseModel):
    result: str = Field(min_length=1)


class SettleOut(BaseModel):
    market_id: str
    result: str
    status: MarketStatus
    awarded: int = Field(description="Total points awarded across all predictions on settle.")


# Spec-facing aliases (the frontend/API contract names).
PredictionCreate = PredictionIn
SettleRequest = SettleIn
