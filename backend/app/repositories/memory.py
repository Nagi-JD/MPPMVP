"""In-memory Repository implementation, seeded with the domain data."""

from __future__ import annotations

import dataclasses

from app.domain.enums import MarketStatus
from app.domain.models import Fixture, League, Market, Prediction
from app.domain.scoring import SeasonStats, compute_season_stats, score_market
from app.repositories.base import (
    MarketAlreadySettledError,
    MarketLockedError,
    MarketNotFoundError,
)
from app.repositories.seed import BOT_PREDICTIONS, FIXTURES, LEAGUES


class InMemoryRepository:
    """Thread-unsafe, single-process in-memory store.

    Satisfies the `Repository` Protocol. Seeded on construction.
    """

    def __init__(self, *, seed: bool = True) -> None:
        self._leagues: dict[str, League] = {}
        self._fixtures: dict[str, Fixture] = {}
        self._markets: dict[str, Market] = {}
        self._fixture_id_for_market: dict[str, str] = {}
        # (user_id, market_id) -> Prediction
        self._predictions: dict[tuple[str, str], Prediction] = {}

        if seed:
            self._load_seed()

    # ----- seeding -----------------------------------------------------------

    def _load_seed(self) -> None:
        for league in LEAGUES:
            self._leagues[league.id] = league
        for fixture in FIXTURES:
            self._index_fixture(fixture)
        for pred in BOT_PREDICTIONS:
            self._predictions[(pred.user_id, pred.market_id)] = pred

    def _index_fixture(self, fixture: Fixture) -> None:
        self._fixtures[fixture.id] = fixture
        for market in fixture.markets:
            self._markets[market.id] = market
            self._fixture_id_for_market[market.id] = fixture.id

    def _replace_market(self, updated: Market) -> None:
        """Replace a market in both the market index and its parent fixture."""
        self._markets[updated.id] = updated
        fixture = self._fixtures[updated.fixture_id]
        new_markets = tuple(updated if m.id == updated.id else m for m in fixture.markets)
        self._fixtures[fixture.id] = dataclasses.replace(fixture, markets=new_markets)

    # ----- reads -------------------------------------------------------------

    def list_leagues(self) -> list[League]:
        return list(self._leagues.values())

    def get_league(self, league_id: str) -> League | None:
        return self._leagues.get(league_id)

    def list_fixtures(self, league_id: str) -> list[Fixture]:
        return [f for f in self._fixtures.values() if f.league_id == league_id]

    def get_market(self, market_id: str) -> Market | None:
        return self._markets.get(market_id)

    # ----- writes ------------------------------------------------------------

    def upsert_prediction(self, prediction: Prediction) -> Prediction:
        market = self._markets.get(prediction.market_id)
        if market is None:
            raise MarketNotFoundError(prediction.market_id)
        if market.status is not MarketStatus.SCHEDULED:
            raise MarketLockedError(
                f"market {market.id} is {market.status.value}; predictions closed"
            )
        self._predictions[(prediction.user_id, prediction.market_id)] = prediction
        return prediction

    def settle_market(self, market_id: str, result: str) -> tuple[Market, int]:
        market = self._markets.get(market_id)
        if market is None:
            raise MarketNotFoundError(market_id)
        if market.status is MarketStatus.SETTLED:
            # Idempotency guard: never double-award.
            raise MarketAlreadySettledError(market_id)

        settled = dataclasses.replace(market, status=MarketStatus.SETTLED, result=result)
        self._replace_market(settled)

        awarded = sum(
            score_market(settled, pred.value)
            for (_, m_id), pred in self._predictions.items()
            if m_id == market_id
        )
        return settled, awarded

    # ----- aggregates --------------------------------------------------------

    def _user_league_predictions(self, user_id: str, league_id: str) -> list[tuple[Market, str]]:
        scored: list[tuple[Market, str]] = []
        for (u_id, m_id), pred in self._predictions.items():
            if u_id != user_id:
                continue
            market = self._markets.get(m_id)
            if market is None:
                continue
            if self._fixtures[market.fixture_id].league_id != league_id:
                continue
            scored.append((market, pred.value))
        return scored

    def season_stats(self, user_id: str, league_id: str) -> SeasonStats:
        scored = self._user_league_predictions(user_id, league_id)
        return compute_season_stats(user_id, league_id, scored)

    def leaderboard(self, league_id: str) -> list[SeasonStats]:
        users_in_league: set[str] = set()
        for (u_id, m_id), _ in self._predictions.items():
            market = self._markets.get(m_id)
            if market is None:
                continue
            if self._fixtures[market.fixture_id].league_id == league_id:
                users_in_league.add(u_id)

        rows = [self.season_stats(u, league_id) for u in users_in_league]
        rows.sort(key=lambda s: (s.points, s.accuracy), reverse=True)
        return rows
