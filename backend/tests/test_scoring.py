"""Unit tests for the pure scoring + ranking domain logic."""

from __future__ import annotations

from datetime import UTC, datetime

import pytest

from app.domain.enums import MarketKind, MarketStatus, RankTier
from app.domain.models import Market
from app.domain.scoring import (
    accuracy,
    compute_season_stats,
    is_correct,
    rank_tier,
    score_market,
)

LOCK = datetime(2026, 1, 1, tzinfo=UTC)


def _market(kind: MarketKind, result: str | None) -> Market:
    return Market.create(
        id=f"m-{kind.value}",
        fixture_id="fx",
        kind=kind,
        label=kind.value,
        lock_time=LOCK,
        status=MarketStatus.SETTLED if result is not None else MarketStatus.SCHEDULED,
        result=result,
    )


# ----- score_market ----------------------------------------------------------


def test_choice_correct_awards_difficulty_times_10() -> None:
    m = _market(MarketKind.MATCH_WINNER, "Celtics")  # difficulty 1
    assert score_market(m, "Celtics") == 10


def test_choice_wrong_awards_zero() -> None:
    m = _market(MarketKind.MATCH_WINNER, "Celtics")
    assert score_market(m, "Lakers") == 0


def test_choice_higher_difficulty() -> None:
    m = _market(MarketKind.TOP_SCORER, "Tatum")  # difficulty 2
    assert score_market(m, "Tatum") == 20


def test_score_exact_only_full_points() -> None:
    m = _market(MarketKind.EXACT_SCORE, "108-112")  # difficulty 3
    assert score_market(m, "108-112") == 30


def test_score_near_miss_is_zero() -> None:
    m = _market(MarketKind.EXACT_SCORE, "108-112")
    assert score_market(m, "108-111") == 0


def test_podium_perfect_full_credit() -> None:
    m = _market(MarketKind.RACE_PODIUM, "A,B,C")  # difficulty 2 -> 5 per slot
    assert score_market(m, "A,B,C") == 30


def test_podium_partial_credit_by_position() -> None:
    m = _market(MarketKind.RACE_PODIUM, "A,B,C")  # difficulty 2
    # pos0 A matches (+10), pos1 C != B (0), pos2 B != C (0)
    assert score_market(m, "A,C,B") == 10


def test_podium_two_of_three() -> None:
    m = _market(MarketKind.QUALI_PODIUM, "A,B,C")  # difficulty 2
    # pos0 A (+10), pos1 X (0), pos2 C (+10)
    assert score_market(m, "A,X,C") == 20


def test_unsettled_market_scores_zero() -> None:
    m = _market(MarketKind.MATCH_WINNER, None)
    assert score_market(m, "Celtics") == 0


def test_is_correct_matches_positive_score() -> None:
    m = _market(MarketKind.MATCH_WINNER, "Celtics")
    assert is_correct(m, "Celtics") is True
    assert is_correct(m, "Lakers") is False


# ----- accuracy --------------------------------------------------------------


def test_accuracy_zero_when_no_settled() -> None:
    assert accuracy(0, 0) == 0.0


def test_accuracy_ratio() -> None:
    assert accuracy(3, 4) == pytest.approx(0.75)


# ----- rank_tier -------------------------------------------------------------


@pytest.mark.parametrize(
    ("acc", "settled", "expected"),
    [
        (1.0, 4, RankTier.ROOKIE),  # settled < 5 always Rookie
        (0.0, 4, RankTier.ROOKIE),
        (0.8, 5, RankTier.DIAMOND),
        (0.79, 5, RankTier.PLATINUM),
        (0.65, 10, RankTier.PLATINUM),
        (0.64, 10, RankTier.GOLD),
        (0.5, 10, RankTier.GOLD),
        (0.49, 10, RankTier.SILVER),
        (0.35, 10, RankTier.SILVER),
        (0.34, 10, RankTier.BRONZE),
        (0.0, 10, RankTier.BRONZE),
    ],
)
def test_rank_tier_thresholds(acc: float, settled: int, expected: RankTier) -> None:
    assert rank_tier(acc, settled) == expected


# ----- compute_season_stats --------------------------------------------------


def test_compute_season_stats_aggregates() -> None:
    winner = _market(MarketKind.MATCH_WINNER, "Celtics")  # diff 1
    scorer = _market(MarketKind.TOP_SCORER, "Tatum")  # diff 2
    unsettled = _market(MarketKind.MATCH_WINNER, None)

    stats = compute_season_stats(
        "u1",
        "nba-2026",
        [(winner, "Celtics"), (scorer, "LeBron"), (unsettled, "Anyone")],
    )

    assert stats.made == 3
    assert stats.settled == 2
    assert stats.correct == 1
    assert stats.points == 10
    assert stats.accuracy == pytest.approx(0.5)
    assert stats.tier == RankTier.ROOKIE  # settled < 5
