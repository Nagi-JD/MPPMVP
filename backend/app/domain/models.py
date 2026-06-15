"""Pure domain models. Frozen dataclasses + market metadata. No framework imports."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime

from app.domain.enums import (
    MarketInput,
    MarketKind,
    MarketScope,
    MarketStatus,
    Sport,
)

# kind -> (input, difficulty, scope)
MARKET_META: dict[MarketKind, tuple[MarketInput, int, MarketScope]] = {
    # Basketball
    MarketKind.MATCH_WINNER: (MarketInput.CHOICE, 1, MarketScope.MATCH),
    MarketKind.EXACT_SCORE: (MarketInput.SCORE, 3, MarketScope.MATCH),
    MarketKind.TOP_SCORER: (MarketInput.CHOICE, 2, MarketScope.MATCH),
    MarketKind.SEASON_CHAMPION: (MarketInput.CHOICE, 3, MarketScope.SEASON),
    # F1
    MarketKind.QUALI_PODIUM: (MarketInput.PODIUM, 2, MarketScope.WEEKEND),
    MarketKind.SPRINT_PODIUM: (MarketInput.PODIUM, 2, MarketScope.WEEKEND),
    MarketKind.RACE_PODIUM: (MarketInput.PODIUM, 2, MarketScope.WEEKEND),
    MarketKind.FASTEST_LAP: (MarketInput.CHOICE, 2, MarketScope.WEEKEND),
    MarketKind.TOP_SPEED: (MarketInput.CHOICE, 1, MarketScope.WEEKEND),
    MarketKind.BEST_SECTORS: (MarketInput.CHOICE, 1, MarketScope.WEEKEND),
    MarketKind.DRIVER_CHAMPION: (MarketInput.CHOICE, 3, MarketScope.SEASON),
    MarketKind.CONSTRUCTOR_CHAMPION: (MarketInput.CHOICE, 3, MarketScope.SEASON),
}


@dataclass(frozen=True, slots=True)
class Market:
    """One predictable question within a fixture."""

    id: str
    fixture_id: str
    kind: MarketKind
    label: str
    input: MarketInput
    difficulty: int
    scope: MarketScope
    lock_time: datetime
    status: MarketStatus = MarketStatus.SCHEDULED
    result: str | None = None
    options: tuple[str, ...] = field(default_factory=tuple)

    @classmethod
    def create(
        cls,
        *,
        id: str,
        fixture_id: str,
        kind: MarketKind,
        label: str,
        lock_time: datetime,
        status: MarketStatus = MarketStatus.SCHEDULED,
        result: str | None = None,
        options: tuple[str, ...] = (),
    ) -> Market:
        """Build a market, deriving input/difficulty/scope from MARKET_META."""
        market_input, difficulty, scope = MARKET_META[kind]
        return cls(
            id=id,
            fixture_id=fixture_id,
            kind=kind,
            label=label,
            input=market_input,
            difficulty=difficulty,
            scope=scope,
            lock_time=lock_time,
            status=status,
            result=result,
            options=options,
        )


@dataclass(frozen=True, slots=True)
class Fixture:
    """A match / race-weekend / season that groups markets."""

    id: str
    league_id: str
    name: str
    start_time: datetime
    markets: tuple[Market, ...] = field(default_factory=tuple)


@dataclass(frozen=True, slots=True)
class League:
    id: str
    sport: Sport
    org: str
    season: int


@dataclass(frozen=True, slots=True)
class Prediction:
    user_id: str
    market_id: str
    value: str
