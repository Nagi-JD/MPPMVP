"""Pure scoring + ranking rules. Mirrors the frontend EXACTLY. No framework imports."""

from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass

from app.domain.enums import MarketInput, RankTier
from app.domain.models import Market


def score_market(market: Market, value: str) -> int:
    """Award points for a prediction `value` against a market's result.

    - If market.result is None -> 0.
    - "podium": value and result are comma-joined ordered lists; award
      difficulty*5 for EACH entry in the correct position (position by position,
      only matching positions score).
    - "choice"/"score": difficulty*10 if value == result else 0.
    """
    if market.result is None:
        return 0

    if market.input is MarketInput.PODIUM:
        value_parts = [p.strip() for p in value.split(",")]
        result_parts = [p.strip() for p in market.result.split(",")]
        points = 0
        for v, r in zip(value_parts, result_parts, strict=False):
            if v == r:
                points += market.difficulty * 5
        return points

    # choice / score
    return market.difficulty * 10 if value == market.result else 0


def is_correct(market: Market, value: str) -> bool:
    return score_market(market, value) > 0


def accuracy(correct: int, settled: int) -> float:
    if settled == 0:
        return 0.0
    return correct / settled


def rank_tier(acc: float, settled: int) -> RankTier:
    if settled < 5:
        return RankTier.ROOKIE
    if acc >= 0.8:
        return RankTier.DIAMOND
    if acc >= 0.65:
        return RankTier.PLATINUM
    if acc >= 0.5:
        return RankTier.GOLD
    if acc >= 0.35:
        return RankTier.SILVER
    return RankTier.BRONZE


@dataclass(frozen=True, slots=True)
class SeasonStats:
    """Aggregate stats for a user within a league/season."""

    user_id: str
    league_id: str
    points: int
    made: int
    settled: int
    correct: int
    accuracy: float
    tier: RankTier


def compute_season_stats(
    user_id: str,
    league_id: str,
    scored: Iterable[tuple[Market, str]],
) -> SeasonStats:
    """Compute SeasonStats from (market, predicted_value) pairs for one user/league.

    `scored` should contain every prediction the user made in the league.
    points  = sum of awarded points
    made    = predictions made
    settled = settled markets the user predicted (result is not None)
    correct = predictions scoring > 0
    """
    points = 0
    made = 0
    settled = 0
    correct = 0

    for market, value in scored:
        made += 1
        if market.result is not None:
            settled += 1
            pts = score_market(market, value)
            points += pts
            if pts > 0:
                correct += 1

    acc = accuracy(correct, settled)
    return SeasonStats(
        user_id=user_id,
        league_id=league_id,
        points=points,
        made=made,
        settled=settled,
        correct=correct,
        accuracy=acc,
        tier=rank_tier(acc, settled),
    )
