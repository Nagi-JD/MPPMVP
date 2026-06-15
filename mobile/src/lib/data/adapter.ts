import type { Fixture, League, Market } from "@/lib/types";

export interface LeagueWire { id: string; sport: "basketball" | "f1"; org: string; season: number; }
export interface MarketWire {
  id: string; fixture_id: string; kind: Market["kind"]; label: string;
  input: Market["input"]; difficulty: number; scope: Fixture["scope"];
  lock_time: string; status: Market["status"]; result: string | null; options: string[];
}
export interface FixtureWire {
  id: string; league_id: string; name: string; start_time: string; markets: MarketWire[];
}
export interface BoardWire { league: LeagueWire; fixtures: FixtureWire[]; }

export function toLeague(w: LeagueWire): League {
  return { id: w.id, sport: w.sport, org: w.org, season: w.season };
}

export function toMarket(w: MarketWire, leagueId: string): Market {
  return {
    id: w.id, fixtureId: w.fixture_id, leagueId, kind: w.kind, label: w.label,
    input: w.input, difficulty: (Math.min(3, Math.max(1, w.difficulty)) as 1 | 2 | 3),
    options: w.options ?? [], lockTime: w.lock_time, status: w.status, result: w.result,
  };
}

/** Split "Home vs Away" into parts; returns {} when there is no "vs". */
export function splitMatchup(name: string): { home?: string; away?: string } {
  const m = name.split(/\s+vs\.?\s+/i);
  return m.length === 2 ? { home: m[0].trim(), away: m[1].trim() } : {};
}

export function toFixture(w: FixtureWire, league: LeagueWire): { fixture: Fixture; markets: Market[] } {
  const markets = w.markets.map((m) => toMarket(m, league.id));
  const scope = w.markets[0]?.scope ?? "match";
  const status = markets[0]?.status ?? "scheduled";
  const lockTime = markets[0]?.lockTime ?? w.start_time;
  const fixture: Fixture = {
    id: w.id, leagueId: league.id, sport: league.sport, scope, title: w.name,
    ...splitMatchup(w.name), startTime: w.start_time, lockTime, status,
  };
  return { fixture, markets };
}
