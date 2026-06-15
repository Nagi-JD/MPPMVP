# MPP+ Backend

FastAPI backend for the MPP+ social sports-prediction app.

Sports: basketball (NBA, EuroLeague, LNB France) and Formula 1.

## Architecture

Layered, with strict separation of concerns:

```
app/
  main.py            create_app() factory + module-level `app`; GET /health
  core/config.py     pydantic-settings Settings + cached get_settings()
  domain/            PURE python (no framework imports)
    enums.py         Sport, MarketKind, MarketInput, MarketScope, MarketStatus, RankTier
    models.py        frozen dataclasses (Market, Fixture, League, Prediction) + MARKET_META
    scoring.py       score_market, is_correct, accuracy, rank_tier, SeasonStats, compute_season_stats
  schemas/           Pydantic v2 request/response models
  repositories/      Repository Protocol + InMemoryRepository (seeded) + sql.py (future Postgres models)
  adapters/          SportDataSource Protocol + typed stub adapters (F1/NBA/EuroLeague/LNB)
  api/
    deps.py          get_repo() DI provider (module-level InMemoryRepository singleton)
    routes/          endpoint routers
```

The domain layer (`app/domain/`) is pure: no fastapi / pydantic / sqlalchemy imports.
It is fully unit-tested. The app runs on the in-memory repository by default;
the SQLAlchemy models in `app/repositories/sql.py` are defined but NOT wired up.

## Run

```bash
uv sync
uv run uvicorn app.main:app --reload
```

## Test

```bash
uv run pytest
```

## Lint / Format

```bash
uv run ruff check
uv run ruff format
uv run ruff format --check
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/health` | health check |
| GET  | `/leagues` | list all leagues |
| GET  | `/leagues/{league_id}/board` | fixtures + their markets (404 if unknown) |
| GET  | `/leagues/{league_id}/leaderboard` | rows sorted by points desc, accuracy desc |
| GET  | `/users/{user_id}/seasons/{league_id}` | season stats for a user in a league |
| POST | `/predictions` | upsert a prediction before lock; 409 if locked/settled, 404 if unknown |
| POST | `/markets/{market_id}/settle` | settle market + award points; **409 if already settled** (idempotent), 404 if unknown |

### Settle idempotency

Settling a market that is already `settled` returns **HTTP 409 Conflict** and does
not re-award points. This is the documented behavior.
