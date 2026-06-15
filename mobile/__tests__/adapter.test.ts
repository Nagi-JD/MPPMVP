import { toFixture, splitMatchup, toMarket, type FixtureWire, type LeagueWire, type MarketWire } from "@/lib/data/adapter";

const league: LeagueWire = { id: "nba-2026", sport: "basketball", org: "NBA", season: 2026 };
const market: MarketWire = {
  id: "m1", fixture_id: "f1", kind: "match_winner", label: "Match winner",
  input: "choice", difficulty: 1, scope: "match", lock_time: "2026-01-01T00:00:00Z",
  status: "scheduled", result: null, options: ["Lakers", "Celtics"],
};

describe("splitMatchup", () => {
  it("splits 'A vs B'", () => expect(splitMatchup("Lakers vs Celtics")).toEqual({ home: "Lakers", away: "Celtics" }));
  it("returns {} for non-matchup names", () => expect(splitMatchup("Miami Grand Prix")).toEqual({}));
});

describe("toMarket", () => {
  it("maps snake_case to camelCase and stamps leagueId", () => {
    const m = toMarket(market, "nba-2026");
    expect(m.fixtureId).toBe("f1");
    expect(m.leagueId).toBe("nba-2026");
    expect(m.lockTime).toBe("2026-01-01T00:00:00Z");
  });
});

describe("toFixture", () => {
  it("derives home/away/scope/status/lockTime from name + markets", () => {
    const wire: FixtureWire = { id: "f1", league_id: "nba-2026", name: "Lakers vs Celtics", start_time: "2026-01-01T00:00:00Z", markets: [market] };
    const { fixture, markets } = toFixture(wire, league);
    expect(fixture.home).toBe("Lakers");
    expect(fixture.sport).toBe("basketball");
    expect(fixture.scope).toBe("match");
    expect(fixture.lockTime).toBe("2026-01-01T00:00:00Z");
    expect(markets).toHaveLength(1);
  });
});
