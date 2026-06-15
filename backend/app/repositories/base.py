"""Repository Protocol and domain-level repository errors."""

from __future__ import annotations

from typing import Protocol, runtime_checkable

from app.domain.models import Fixture, League, Market, Prediction
from app.domain.scoring import SeasonStats


class RepositoryError(Exception):
    """Base class for repository errors."""


class MarketNotFoundError(RepositoryError):
    """Raised when a market id is unknown."""


class LeagueNotFoundError(RepositoryError):
    """Raised when a league id is unknown."""


class MarketLockedError(RepositoryError):
    """Raised when attempting to predict on a locked or settled market."""


class MarketAlreadySettledError(RepositoryError):
    """Raised when attempting to settle an already-settled market (idempotency guard)."""


@runtime_checkable
class Repository(Protocol):
    """Persistence boundary for the prediction domain.

    Implementations: InMemoryRepository (default), and a future SQLAlchemy-backed
    impl using the models in `app.repositories.sql`.
    """

    def list_leagues(self) -> list[League]: ...

    def get_league(self, league_id: str) -> League | None: ...

    def list_fixtures(self, league_id: str) -> list[Fixture]: ...

    def get_market(self, market_id: str) -> Market | None: ...

    def upsert_prediction(self, prediction: Prediction) -> Prediction:
        """Insert or update a prediction before the market locks.

        Raises:
            MarketNotFoundError: if the market id is unknown.
            MarketLockedError: if the market is locked or settled.
        """
        ...

    def settle_market(self, market_id: str, result: str) -> tuple[Market, int]:
        """Settle a market with a result and award points.

        Returns the updated market and the total points awarded.

        Raises:
            MarketNotFoundError: if the market id is unknown.
            MarketAlreadySettledError: if the market is already settled (idempotent guard).
        """
        ...

    def season_stats(self, user_id: str, league_id: str) -> SeasonStats: ...

    def leaderboard(self, league_id: str) -> list[SeasonStats]:
        """Return season stats per user in a league, sorted by points then accuracy desc."""
        ...
