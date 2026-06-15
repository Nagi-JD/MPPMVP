"""Common Protocol for external sport data-source adapters."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol, runtime_checkable


@dataclass(frozen=True, slots=True)
class RawEvent:
    """A normalized event pulled from an external sport data source.

    Adapters translate provider-specific payloads into this neutral shape; the
    application layer maps RawEvents into domain Fixtures/Markets.
    """

    external_id: str
    name: str
    starts_at: str  # ISO-8601 string as returned upstream; parsed by caller.


@runtime_checkable
class SportDataSource(Protocol):
    """A read-only source of upcoming/recent events for one league.

    All concrete adapters currently return [] (no live integration yet).
    """

    league_id: str

    def fetch_upcoming(self) -> list[RawEvent]:
        """Return upcoming events for this league (currently empty stub)."""
        ...

    def fetch_results(self, external_id: str) -> dict[str, str]:
        """Return resolved market results keyed by market kind (currently empty stub)."""
        ...
