"""Basketball data-source adapters (stubs): NBA, EuroLeague, LNB France."""

from __future__ import annotations

from app.adapters.base import RawEvent


class NBAAdapter:
    """NBA events adapter.

    Intended live data sources:
      - nba_api      (https://github.com/swar/nba_api)  - stats.nba.com wrapper
      - balldontlie  (https://www.balldontlie.io)        - games, scores, players

    Currently a stub: returns no events.
    """

    league_id = "nba-2026"

    def fetch_upcoming(self) -> list[RawEvent]:
        return []

    def fetch_results(self, external_id: str) -> dict[str, str]:
        return {}


class EuroLeagueAdapter:
    """EuroLeague events adapter.

    Intended live data source:
      - euroleague_api (https://github.com/giasemidis/euroleague_api) - official feed wrapper

    Currently a stub: returns no events.
    """

    league_id = "euroleague-2026"

    def fetch_upcoming(self) -> list[RawEvent]:
        return []

    def fetch_results(self, external_id: str) -> dict[str, str]:
        return {}


class LNBAdapter:
    """LNB France (Betclic Elite) events adapter.

    Intended live data sources:
      - API-SPORTS  (https://api-sports.io)              - basketball fixtures/results
      - Highlightly (https://highlightly.net)            - scores and highlights

    Currently a stub: returns no events.
    """

    league_id = "lnb-2026"

    def fetch_upcoming(self) -> list[RawEvent]:
        return []

    def fetch_results(self, external_id: str) -> dict[str, str]:
        return {}
