"""Seed data: leagues, fixtures, markets, bot users and their predictions.

Mirrors the frontend domain. Includes a couple of already-settled fixtures and
2-3 bot users with resolved predictions so leaderboards are populated out of the box.
"""

from __future__ import annotations

from datetime import UTC, datetime

from app.domain.enums import MarketKind, MarketStatus, Sport
from app.domain.models import Fixture, League, Market, Prediction


def _dt(month: int, day: int, hour: int = 19) -> datetime:
    return datetime(2026, month, day, hour, 0, tzinfo=UTC)


LEAGUES: list[League] = [
    League(id="nba-2026", sport=Sport.BASKETBALL, org="NBA", season=2026),
    League(id="euroleague-2026", sport=Sport.BASKETBALL, org="EuroLeague", season=2026),
    League(id="lnb-2026", sport=Sport.BASKETBALL, org="LNB France", season=2026),
    League(id="f1-2026", sport=Sport.F1, org="Formula 1", season=2026),
]


def _build_fixtures() -> list[Fixture]:
    fixtures: list[Fixture] = []

    # --- NBA: one SETTLED match, one upcoming match ---
    nba_settled = Fixture(
        id="nba-fix-1",
        league_id="nba-2026",
        name="Lakers @ Celtics",
        start_time=_dt(1, 10),
        markets=(
            Market.create(
                id="nba-1-winner",
                fixture_id="nba-fix-1",
                kind=MarketKind.MATCH_WINNER,
                label="Match winner",
                lock_time=_dt(1, 10),
                status=MarketStatus.SETTLED,
                result="Celtics",
                options=("Lakers", "Celtics"),
            ),
            Market.create(
                id="nba-1-score",
                fixture_id="nba-fix-1",
                kind=MarketKind.EXACT_SCORE,
                label="Exact final score",
                lock_time=_dt(1, 10),
                status=MarketStatus.SETTLED,
                result="108-112",
            ),
            Market.create(
                id="nba-1-scorer",
                fixture_id="nba-fix-1",
                kind=MarketKind.TOP_SCORER,
                label="Top scorer",
                lock_time=_dt(1, 10),
                status=MarketStatus.SETTLED,
                result="Tatum",
                options=("LeBron", "Tatum", "Davis", "Brown"),
            ),
        ),
    )

    nba_upcoming = Fixture(
        id="nba-fix-2",
        league_id="nba-2026",
        name="Warriors @ Nuggets",
        start_time=_dt(6, 20),
        markets=(
            Market.create(
                id="nba-2-winner",
                fixture_id="nba-fix-2",
                kind=MarketKind.MATCH_WINNER,
                label="Match winner",
                lock_time=_dt(6, 20),
                status=MarketStatus.SCHEDULED,
                options=("Warriors", "Nuggets"),
            ),
            # A locked-but-unsettled market to exercise the 409-on-predict path.
            Market.create(
                id="nba-2-scorer",
                fixture_id="nba-fix-2",
                kind=MarketKind.TOP_SCORER,
                label="Top scorer",
                lock_time=_dt(1, 1),
                status=MarketStatus.LOCKED,
                options=("Curry", "Jokic", "Murray"),
            ),
        ),
    )

    # NBA season market.
    nba_season = Fixture(
        id="nba-season",
        league_id="nba-2026",
        name="NBA 2026 Season",
        start_time=_dt(1, 1),
        markets=(
            Market.create(
                id="nba-season-champ",
                fixture_id="nba-season",
                kind=MarketKind.SEASON_CHAMPION,
                label="Season champion",
                lock_time=_dt(1, 1),
                status=MarketStatus.SCHEDULED,
                options=("Celtics", "Nuggets", "Lakers", "Warriors"),
            ),
        ),
    )

    fixtures += [nba_settled, nba_upcoming, nba_season]

    # --- F1: one SETTLED weekend, one upcoming weekend ---
    f1_settled = Fixture(
        id="f1-fix-1",
        league_id="f1-2026",
        name="Bahrain Grand Prix",
        start_time=_dt(3, 8),
        markets=(
            Market.create(
                id="f1-1-quali",
                fixture_id="f1-fix-1",
                kind=MarketKind.QUALI_PODIUM,
                label="Qualifying podium (top 3)",
                lock_time=_dt(3, 7),
                status=MarketStatus.SETTLED,
                result="Verstappen,Leclerc,Hamilton",
            ),
            Market.create(
                id="f1-1-race",
                fixture_id="f1-fix-1",
                kind=MarketKind.RACE_PODIUM,
                label="Race podium (top 3)",
                lock_time=_dt(3, 8),
                status=MarketStatus.SETTLED,
                result="Verstappen,Norris,Leclerc",
            ),
            Market.create(
                id="f1-1-fastest",
                fixture_id="f1-fix-1",
                kind=MarketKind.FASTEST_LAP,
                label="Fastest lap",
                lock_time=_dt(3, 8),
                status=MarketStatus.SETTLED,
                result="Norris",
                options=("Verstappen", "Norris", "Leclerc", "Hamilton"),
            ),
        ),
    )

    f1_upcoming = Fixture(
        id="f1-fix-2",
        league_id="f1-2026",
        name="Monaco Grand Prix",
        start_time=_dt(5, 24),
        markets=(
            Market.create(
                id="f1-2-race",
                fixture_id="f1-fix-2",
                kind=MarketKind.RACE_PODIUM,
                label="Race podium (top 3)",
                lock_time=_dt(5, 24),
                status=MarketStatus.SCHEDULED,
            ),
            Market.create(
                id="f1-2-topspeed",
                fixture_id="f1-fix-2",
                kind=MarketKind.TOP_SPEED,
                label="Top speed",
                lock_time=_dt(5, 24),
                status=MarketStatus.SCHEDULED,
                options=("Verstappen", "Norris", "Leclerc"),
            ),
        ),
    )

    f1_season = Fixture(
        id="f1-season",
        league_id="f1-2026",
        name="Formula 1 2026 Season",
        start_time=_dt(1, 1),
        markets=(
            Market.create(
                id="f1-season-driver",
                fixture_id="f1-season",
                kind=MarketKind.DRIVER_CHAMPION,
                label="Drivers' champion",
                lock_time=_dt(1, 1),
                status=MarketStatus.SCHEDULED,
                options=("Verstappen", "Norris", "Leclerc", "Hamilton"),
            ),
            Market.create(
                id="f1-season-constructor",
                fixture_id="f1-season",
                kind=MarketKind.CONSTRUCTOR_CHAMPION,
                label="Constructors' champion",
                lock_time=_dt(1, 1),
                status=MarketStatus.SCHEDULED,
                options=("Red Bull", "McLaren", "Ferrari", "Mercedes"),
            ),
        ),
    )

    fixtures += [f1_settled, f1_upcoming, f1_season]

    # --- EuroLeague & LNB: lightweight scheduled fixtures (no settled data) ---
    euro = Fixture(
        id="euro-fix-1",
        league_id="euroleague-2026",
        name="Real Madrid @ Olympiacos",
        start_time=_dt(4, 12),
        markets=(
            Market.create(
                id="euro-1-winner",
                fixture_id="euro-fix-1",
                kind=MarketKind.MATCH_WINNER,
                label="Match winner",
                lock_time=_dt(4, 12),
                status=MarketStatus.SCHEDULED,
                options=("Real Madrid", "Olympiacos"),
            ),
        ),
    )
    lnb = Fixture(
        id="lnb-fix-1",
        league_id="lnb-2026",
        name="ASVEL @ Monaco",
        start_time=_dt(4, 15),
        markets=(
            Market.create(
                id="lnb-1-winner",
                fixture_id="lnb-fix-1",
                kind=MarketKind.MATCH_WINNER,
                label="Match winner",
                lock_time=_dt(4, 15),
                status=MarketStatus.SCHEDULED,
                options=("ASVEL", "Monaco"),
            ),
        ),
    )
    fixtures += [euro, lnb]

    return fixtures


FIXTURES: list[Fixture] = _build_fixtures()


# Bot predictions on SETTLED markets so the leaderboard is populated immediately.
# (user_id, market_id, value)
BOT_PREDICTIONS: list[Prediction] = [
    # alice: strong NBA + F1
    Prediction("bot-alice", "nba-1-winner", "Celtics"),  # correct  -> 10
    Prediction("bot-alice", "nba-1-score", "108-112"),  # correct  -> 30
    Prediction("bot-alice", "nba-1-scorer", "Tatum"),  # correct  -> 20
    Prediction("bot-alice", "f1-1-quali", "Verstappen,Leclerc,Hamilton"),  # 3/3 -> 30
    Prediction("bot-alice", "f1-1-race", "Verstappen,Norris,Leclerc"),  # 3/3 -> 30
    Prediction("bot-alice", "f1-1-fastest", "Norris"),  # correct  -> 20
    # bob: mixed
    Prediction("bot-bob", "nba-1-winner", "Lakers"),  # wrong    -> 0
    Prediction("bot-bob", "nba-1-score", "110-105"),  # wrong    -> 0
    Prediction("bot-bob", "nba-1-scorer", "Tatum"),  # correct  -> 20
    Prediction("bot-bob", "f1-1-quali", "Verstappen,Hamilton,Leclerc"),  # 1/3 (pos0) -> 10
    Prediction("bot-bob", "f1-1-race", "Norris,Verstappen,Leclerc"),  # 1/3 (pos2) -> 10
    Prediction("bot-bob", "f1-1-fastest", "Verstappen"),  # wrong   -> 0
    # carol: f1 only
    Prediction("bot-carol", "f1-1-quali", "Verstappen,Leclerc,Norris"),  # 2/3 -> 20
    Prediction("bot-carol", "f1-1-race", "Hamilton,Norris,Leclerc"),  # 2/3 (pos1,2) -> 20
    Prediction("bot-carol", "f1-1-fastest", "Norris"),  # correct  -> 20
]
