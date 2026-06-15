import type { DataProvider, FixtureBoard } from "@/lib/data/provider";
import type { Fixture, Group, League, LeaderboardRow, Market, Prediction, Profile, SeasonStats } from "@/lib/types";
import { MARKET_META, F1_DRIVERS, F1_CONSTRUCTORS } from "@/lib/catalog";
import { scoreMarket, isCorrect, accuracy, rankTier } from "@/lib/scoring";

let seq = 0;
const uid = (p: string) => `${p}_${++seq}`;
const hours = (n: number) => new Date(Date.now() + n * 3600_000).toISOString();

const LEAGUES: League[] = [
  { id: "nba-2026", sport: "basketball", org: "NBA", season: 2026 },
  { id: "euroleague-2026", sport: "basketball", org: "EuroLeague", season: 2026 },
  { id: "lnb-2026", sport: "basketball", org: "LNB France", season: 2026 },
  { id: "f1-2026", sport: "f1", org: "Formula 1", season: 2026 },
];

// Build a market from its kind, inheriting metadata from the catalog.
function mk(
  fixtureId: string,
  leagueId: string,
  kind: Market["kind"],
  opts: { options?: string[]; lock: string; status?: Market["status"]; result?: string | null }
): Market {
  const meta = MARKET_META[kind];
  return {
    id: uid("m"),
    fixtureId,
    leagueId,
    kind,
    label: meta.label,
    input: meta.input,
    difficulty: meta.difficulty,
    options: opts.options,
    lockTime: opts.lock,
    status: opts.status ?? "scheduled",
    result: opts.result ?? null,
  };
}

interface Seed {
  fixtures: Fixture[];
  markets: Market[];
}

function buildSeed(): Seed {
  const fixtures: Fixture[] = [];
  const markets: Market[] = [];
  const nbaTeams = ["Lakers", "Celtics", "Nuggets", "Thunder", "Knicks"];

  // ---- NBA 2026: one upcoming match + season title ----
  const f1x: Fixture = { id: "nba-mtl", leagueId: "nba-2026", sport: "basketball", scope: "match", title: "Lakers vs Celtics", home: "Lakers", away: "Celtics", venue: "Crypto.com Arena", startTime: hours(5), lockTime: hours(5), status: "scheduled" };
  fixtures.push(f1x);
  markets.push(
    mk(f1x.id, f1x.leagueId, "match_winner", { options: [f1x.home!, f1x.away!], lock: hours(5) }),
    mk(f1x.id, f1x.leagueId, "exact_score", { lock: hours(5) }),
    mk(f1x.id, f1x.leagueId, "top_scorer", { options: ["L. James", "A. Davis", "J. Tatum", "J. Brown"], lock: hours(5) })
  );
  const nbaSeason: Fixture = { id: "nba-title", leagueId: "nba-2026", sport: "basketball", scope: "season", title: "NBA 2026 — Title race", startTime: hours(24 * 120), lockTime: hours(24 * 90), status: "scheduled" };
  fixtures.push(nbaSeason);
  markets.push(mk(nbaSeason.id, nbaSeason.leagueId, "season_champion", { options: nbaTeams, lock: hours(24 * 90) }));

  // a settled NBA match so leaderboards have history
  const nbaDone: Fixture = { id: "nba-done", leagueId: "nba-2026", sport: "basketball", scope: "match", title: "Nuggets vs Thunder", home: "Nuggets", away: "Thunder", startTime: hours(-30), lockTime: hours(-30), status: "settled" };
  fixtures.push(nbaDone);
  markets.push(
    mk(nbaDone.id, nbaDone.leagueId, "match_winner", { options: ["Nuggets", "Thunder"], lock: hours(-30), status: "settled", result: "Thunder" }),
    mk(nbaDone.id, nbaDone.leagueId, "exact_score", { lock: hours(-30), status: "settled", result: "118-121" })
  );

  // ---- EuroLeague 2026: one upcoming match ----
  const el: Fixture = { id: "el-mtl", leagueId: "euroleague-2026", sport: "basketball", scope: "match", title: "Real Madrid vs Olympiacos", home: "Real Madrid", away: "Olympiacos", venue: "WiZink Center", startTime: hours(8), lockTime: hours(8), status: "scheduled" };
  fixtures.push(el);
  markets.push(
    mk(el.id, el.leagueId, "match_winner", { options: [el.home!, el.away!], lock: hours(8) }),
    mk(el.id, el.leagueId, "exact_score", { lock: hours(8) })
  );

  // ---- LNB France 2026: one upcoming match ----
  const lnb: Fixture = { id: "lnb-mtl", leagueId: "lnb-2026", sport: "basketball", scope: "match", title: "Monaco vs ASVEL", home: "Monaco", away: "ASVEL", venue: "Salle Gaston Médecin", startTime: hours(26), lockTime: hours(26), status: "scheduled" };
  fixtures.push(lnb);
  markets.push(mk(lnb.id, lnb.leagueId, "match_winner", { options: [lnb.home!, lnb.away!], lock: hours(26) }));

  // ---- F1 2026: an upcoming sprint weekend + season titles + a settled round ----
  const gp: Fixture = { id: "f1-miami", leagueId: "f1-2026", sport: "f1", scope: "weekend", title: "Miami Grand Prix", venue: "Miami International Autodrome", startTime: hours(48), lockTime: hours(46), status: "scheduled" };
  fixtures.push(gp);
  markets.push(
    mk(gp.id, gp.leagueId, "quali_podium", { options: F1_DRIVERS, lock: hours(46) }),
    mk(gp.id, gp.leagueId, "sprint_podium", { options: F1_DRIVERS, lock: hours(46) }),
    mk(gp.id, gp.leagueId, "race_podium", { options: F1_DRIVERS, lock: hours(47) }),
    mk(gp.id, gp.leagueId, "fastest_lap", { options: F1_DRIVERS, lock: hours(47) }),
    mk(gp.id, gp.leagueId, "top_speed", { options: F1_DRIVERS, lock: hours(47) }),
    mk(gp.id, gp.leagueId, "best_sectors", { options: F1_DRIVERS, lock: hours(47) })
  );
  const f1Season: Fixture = { id: "f1-title", leagueId: "f1-2026", sport: "f1", scope: "season", title: "F1 2026 — Championship", startTime: hours(24 * 200), lockTime: hours(24 * 30), status: "scheduled" };
  fixtures.push(f1Season);
  markets.push(
    mk(f1Season.id, f1Season.leagueId, "driver_champion", { options: F1_DRIVERS, lock: hours(24 * 30) }),
    mk(f1Season.id, f1Season.leagueId, "constructor_champion", { options: F1_CONSTRUCTORS, lock: hours(24 * 30) })
  );
  const f1Done: Fixture = { id: "f1-bahrain", leagueId: "f1-2026", sport: "f1", scope: "weekend", title: "Bahrain Grand Prix", venue: "Bahrain International Circuit", startTime: hours(-72), lockTime: hours(-74), status: "settled" };
  fixtures.push(f1Done);
  markets.push(
    mk(f1Done.id, f1Done.leagueId, "race_podium", { options: F1_DRIVERS, lock: hours(-74), status: "settled", result: "Verstappen,Norris,Leclerc" }),
    mk(f1Done.id, f1Done.leagueId, "fastest_lap", { options: F1_DRIVERS, lock: hours(-74), status: "settled", result: "Piastri" })
  );

  return { fixtures, markets };
}

export class MockProvider implements DataProvider {
  private leagues = LEAGUES;
  private fixtures: Fixture[];
  private markets: Market[];
  private predictions: Prediction[] = [];
  private profiles = new Map<string, Profile>();

  private groups: Group[] = [];

  constructor() {
    const seed = buildSeed();
    this.fixtures = seed.fixtures;
    this.markets = seed.markets;
    this.seedBots();
  }

  // Pre-fill a few rivals with resolved predictions so leaderboards are alive.
  private seedBots() {
    const bots: Array<[string, Record<string, string>]> = [
      ["Maya", { "nba-done:match_winner": "Thunder", "nba-done:exact_score": "118-121", "f1-bahrain:race_podium": "Verstappen,Norris,Leclerc", "f1-bahrain:fastest_lap": "Piastri" }],
      ["Diego", { "nba-done:match_winner": "Thunder", "nba-done:exact_score": "110-108", "f1-bahrain:race_podium": "Verstappen,Leclerc,Norris", "f1-bahrain:fastest_lap": "Verstappen" }],
      ["Sora", { "nba-done:match_winner": "Nuggets", "f1-bahrain:race_podium": "Norris,Verstappen,Piastri" }],
    ];
    for (const [name, picks] of bots) {
      const id = uid("bot");
      this.profile(id, name);
      for (const [key, value] of Object.entries(picks)) {
        const [fixtureId, kind] = key.split(":");
        const market = this.markets.find((m) => m.fixtureId === fixtureId && m.kind === kind);
        if (!market) continue;
        const pts = market.result ? scoreMarket(market, value) : 0;
        this.predictions.push({ id: uid("p"), userId: id, marketId: market.id, value, pointsAwarded: pts, settled: !!market.result, correct: market.result ? isCorrect(market, value) : false });
      }
      this.recomputeTotal(id);
    }
  }

  private profile(userId: string, name?: string): Profile {
    if (!this.profiles.has(userId))
      this.profiles.set(userId, { id: userId, displayName: name ?? "You", totalPoints: 0 });
    return this.profiles.get(userId)!;
  }

  private recomputeTotal(userId: string) {
    const p = this.profile(userId);
    p.totalPoints = this.predictions.filter((x) => x.userId === userId).reduce((s, x) => s + x.pointsAwarded, 0);
  }

  async listLeagues() {
    return this.leagues;
  }

  async getBoard(leagueId: string): Promise<FixtureBoard[]> {
    return this.fixtures
      .filter((f) => f.leagueId === leagueId)
      .sort((a, b) => (a.status === "settled" ? 1 : 0) - (b.status === "settled" ? 1 : 0) || a.startTime.localeCompare(b.startTime))
      .map((fixture) => ({ fixture, markets: this.markets.filter((m) => m.fixtureId === fixture.id) }));
  }

  async getPredictions(userId: string) {
    return this.predictions.filter((p) => p.userId === userId);
  }

  async submitPrediction(userId: string, marketId: string, value: string) {
    const market = this.markets.find((m) => m.id === marketId);
    if (!market) throw new Error("Unknown market");
    if (new Date(market.lockTime).getTime() <= Date.now()) throw new Error("This market is locked");
    this.profile(userId);
    const existing = this.predictions.find((p) => p.userId === userId && p.marketId === marketId);
    if (existing) {
      existing.value = value; // allow changing a pick until lock
      return existing;
    }
    const pred: Prediction = { id: uid("p"), userId, marketId, value, pointsAwarded: 0, settled: false, correct: false };
    this.predictions.push(pred);
    return pred;
  }

  async settleMarket(marketId: string, result: string) {
    const market = this.markets.find((m) => m.id === marketId);
    if (!market) throw new Error("Unknown market");
    market.result = result;
    market.status = "settled";
    for (const pred of this.predictions.filter((p) => p.marketId === marketId && !p.settled)) {
      pred.pointsAwarded = scoreMarket(market, pred.value);
      pred.correct = isCorrect(market, pred.value);
      pred.settled = true;
      this.recomputeTotal(pred.userId);
    }
  }

  private statsFor(userId: string, leagueId: string): SeasonStats {
    const ids = new Set(this.markets.filter((m) => m.leagueId === leagueId).map((m) => m.id));
    const mine = this.predictions.filter((p) => p.userId === userId && ids.has(p.marketId));
    const settled = mine.filter((p) => p.settled);
    const correct = settled.filter((p) => p.correct).length;
    const points = mine.reduce((s, p) => s + p.pointsAwarded, 0);
    const acc = accuracy(correct, settled.length);
    return { leagueId, points, made: mine.length, settled: settled.length, correct, accuracy: acc, tier: rankTier(acc, settled.length) };
  }

  async seasonStats(userId: string, leagueId: string) {
    this.profile(userId);
    return this.statsFor(userId, leagueId);
  }

  async leaderboard(leagueId: string): Promise<LeaderboardRow[]> {
    const rows: LeaderboardRow[] = [];
    for (const user of this.profiles.values()) {
      const s = this.statsFor(user.id, leagueId);
      if (s.made === 0) continue;
      rows.push({ user, points: s.points, made: s.made, accuracy: s.accuracy, tier: s.tier });
    }
    return rows.sort((a, b) => b.points - a.points || b.accuracy - a.accuracy);
  }

  async getProfile(userId: string) {
    return this.profiles.get(userId) ?? this.profile(userId);
  }

  async createGroup(ownerId: string, name: string) {
    const g: Group = { id: uid("g"), name, inviteCode: Math.random().toString(36).slice(2, 8).toUpperCase(), ownerId };
    this.groups.push(g);
    return g;
  }

  async joinGroup(_userId: string, inviteCode: string) {
    const g = this.groups.find((x) => x.inviteCode === inviteCode);
    if (!g) throw new Error("Invalid invite code");
    return g;
  }
}
