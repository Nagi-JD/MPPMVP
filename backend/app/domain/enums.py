"""Pure domain enums. No framework imports."""

from __future__ import annotations

from enum import StrEnum


class Sport(StrEnum):
    BASKETBALL = "basketball"
    F1 = "f1"


class MarketKind(StrEnum):
    # Basketball
    MATCH_WINNER = "match_winner"
    EXACT_SCORE = "exact_score"
    TOP_SCORER = "top_scorer"
    SEASON_CHAMPION = "season_champion"
    # F1
    QUALI_PODIUM = "quali_podium"
    SPRINT_PODIUM = "sprint_podium"
    RACE_PODIUM = "race_podium"
    FASTEST_LAP = "fastest_lap"
    TOP_SPEED = "top_speed"
    BEST_SECTORS = "best_sectors"
    DRIVER_CHAMPION = "driver_champion"
    CONSTRUCTOR_CHAMPION = "constructor_champion"


class MarketInput(StrEnum):
    CHOICE = "choice"
    SCORE = "score"
    PODIUM = "podium"


class MarketScope(StrEnum):
    MATCH = "match"
    WEEKEND = "weekend"
    SEASON = "season"


class MarketStatus(StrEnum):
    SCHEDULED = "scheduled"
    LOCKED = "locked"
    SETTLED = "settled"


class RankTier(StrEnum):
    ROOKIE = "Rookie"
    BRONZE = "Bronze"
    SILVER = "Silver"
    GOLD = "Gold"
    PLATINUM = "Platinum"
    DIAMOND = "Diamond"
