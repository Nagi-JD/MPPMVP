"""API happy-path and error-path tests."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_health(client: TestClient) -> None:
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_list_leagues(client: TestClient) -> None:
    r = client.get("/leagues")
    assert r.status_code == 200
    ids = {lg["id"] for lg in r.json()}
    assert ids == {"nba-2026", "euroleague-2026", "lnb-2026", "f1-2026"}


def test_board_returns_fixtures_with_markets(client: TestClient) -> None:
    r = client.get("/leagues/nba-2026/board")
    assert r.status_code == 200
    body = r.json()
    assert body["league"]["id"] == "nba-2026"
    fixtures = body["fixtures"]
    assert any(f["markets"] for f in fixtures)


def test_board_unknown_league_404(client: TestClient) -> None:
    assert client.get("/leagues/nope/board").status_code == 404


def test_seeded_leaderboard_is_sorted(client: TestClient) -> None:
    r = client.get("/leagues/f1-2026/leaderboard")
    assert r.status_code == 200
    rows = r.json()
    assert len(rows) >= 3  # alice, bob, carol all predicted in f1
    points = [row["points"] for row in rows]
    assert points == sorted(points, reverse=True)
    # alice swept f1 (30+30+20) and tops the table.
    assert rows[0]["user_id"] == "bot-alice"


def test_predict_then_settle_updates_leaderboard(client: TestClient) -> None:
    # Predict the NBA upcoming match winner correctly.
    r = client.post(
        "/predictions",
        json={"user_id": "tester", "market_id": "nba-2-winner", "value": "Nuggets"},
    )
    assert r.status_code == 200

    # Before settle, tester has 0 points.
    before = client.get("/users/tester/seasons/nba-2026").json()
    assert before["points"] == 0
    assert before["settled"] == 0

    # Settle the market.
    s = client.post("/markets/nba-2-winner/settle", json={"result": "Nuggets"})
    assert s.status_code == 200
    assert s.json()["awarded"] == 10  # match_winner difficulty 1 * 10

    # After settle, tester reflects the points.
    after = client.get("/users/tester/seasons/nba-2026").json()
    assert after["points"] == 10
    assert after["correct"] == 1
    assert after["settled"] == 1

    # Leaderboard now lists tester.
    lb = client.get("/leagues/nba-2026/leaderboard").json()
    assert any(row["user_id"] == "tester" and row["points"] == 10 for row in lb)


def test_predict_on_locked_market_rejected(client: TestClient) -> None:
    r = client.post(
        "/predictions",
        json={"user_id": "tester", "market_id": "nba-2-scorer", "value": "Jokic"},
    )
    assert r.status_code == 409


def test_predict_unknown_market_404(client: TestClient) -> None:
    r = client.post(
        "/predictions",
        json={"user_id": "tester", "market_id": "ghost", "value": "x"},
    )
    assert r.status_code == 404


def test_settle_is_idempotent(client: TestClient) -> None:
    first = client.post("/markets/nba-2-winner/settle", json={"result": "Nuggets"})
    assert first.status_code == 200

    # Re-settling must NOT double-award; returns 409.
    second = client.post("/markets/nba-2-winner/settle", json={"result": "Nuggets"})
    assert second.status_code == 409


def test_settle_already_seeded_settled_market_409(client: TestClient) -> None:
    # nba-1-winner is seeded as already settled.
    r = client.post("/markets/nba-1-winner/settle", json={"result": "Celtics"})
    assert r.status_code == 409


def test_settle_unknown_market_404(client: TestClient) -> None:
    r = client.post("/markets/ghost/settle", json={"result": "x"})
    assert r.status_code == 404
