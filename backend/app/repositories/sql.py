"""SQLAlchemy 2.0 ORM models for the future Postgres-backed repository.

These models are DEFINED but NOT wired into the running app. The app uses the
in-memory repository by default. A future `SqlRepository` would implement the
`Repository` Protocol on top of these tables.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""


class LeagueRow(Base):
    __tablename__ = "leagues"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    sport: Mapped[str] = mapped_column(String(32))
    org: Mapped[str] = mapped_column(String(64))
    season: Mapped[int] = mapped_column()

    fixtures: Mapped[list[FixtureRow]] = relationship(
        back_populates="league", cascade="all, delete-orphan"
    )


class FixtureRow(Base):
    __tablename__ = "fixtures"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    league_id: Mapped[str] = mapped_column(ForeignKey("leagues.id"))
    name: Mapped[str] = mapped_column(String(128))
    start_time: Mapped[datetime] = mapped_column()

    league: Mapped[LeagueRow] = relationship(back_populates="fixtures")
    markets: Mapped[list[MarketRow]] = relationship(
        back_populates="fixture", cascade="all, delete-orphan"
    )


class MarketRow(Base):
    __tablename__ = "markets"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    fixture_id: Mapped[str] = mapped_column(ForeignKey("fixtures.id"))
    kind: Mapped[str] = mapped_column(String(32))
    label: Mapped[str] = mapped_column(String(128))
    input: Mapped[str] = mapped_column(String(16))
    difficulty: Mapped[int] = mapped_column()
    scope: Mapped[str] = mapped_column(String(16))
    lock_time: Mapped[datetime] = mapped_column()
    status: Mapped[str] = mapped_column(String(16), default="scheduled")
    result: Mapped[str | None] = mapped_column(String(128), nullable=True)
    # comma-joined options; null when free-form.
    options: Mapped[str | None] = mapped_column(String(512), nullable=True)

    fixture: Mapped[FixtureRow] = relationship(back_populates="markets")
    predictions: Mapped[list[PredictionRow]] = relationship(
        back_populates="market", cascade="all, delete-orphan"
    )


class PredictionRow(Base):
    __tablename__ = "predictions"
    __table_args__ = (UniqueConstraint("user_id", "market_id", name="uq_user_market"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    market_id: Mapped[str] = mapped_column(ForeignKey("markets.id"))
    value: Mapped[str] = mapped_column(String(128))

    market: Mapped[MarketRow] = relationship(back_populates="predictions")
