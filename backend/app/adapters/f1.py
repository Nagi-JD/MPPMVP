"""Formula 1 data-source adapter (stub)."""

from __future__ import annotations

from app.adapters.base import RawEvent


class F1Adapter:
    """Formula 1 events adapter.

    Intended live data sources (in priority order):
      - OpenF1   (https://openf1.org)         - live timing, sessions, positions
      - Jolpica  (https://jolpi.ca/ergast)    - Ergast successor: schedules, results
      - FastF1   (https://docs.fastf1.dev)    - Python lib: telemetry, lap data

    Currently a stub: returns no events.
    """

    league_id = "f1-2026"

    def fetch_upcoming(self) -> list[RawEvent]:
        return []

    def fetch_results(self, external_id: str) -> dict[str, str]:
        return {}
