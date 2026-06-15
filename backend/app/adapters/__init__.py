"""Sport data-source adapters behind a common Protocol."""

from app.adapters.base import RawEvent, SportDataSource
from app.adapters.basketball import (
    EuroLeagueAdapter,
    LNBAdapter,
    NBAAdapter,
)
from app.adapters.f1 import F1Adapter

__all__ = [
    "EuroLeagueAdapter",
    "F1Adapter",
    "LNBAdapter",
    "NBAAdapter",
    "RawEvent",
    "SportDataSource",
]
