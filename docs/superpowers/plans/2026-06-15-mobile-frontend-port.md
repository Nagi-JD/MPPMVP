# Mobile Frontend Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the MPP+ Next.js web frontend to the Expo/React Native app at full parity — 5 tab screens, onboarding, and a data layer wired to the FastAPI backend with local fallbacks for uncovered features.

**Architecture:** expo-router file routes mirror the web routes. A `DataProvider` interface (identical shape to web) is implemented by `backendProvider` over the FastAPI API, with an adapter mapping snake_case + thin fixtures into the web domain shapes, and AsyncStorage/local fallbacks for predictions/profile/rewards/groups. Screens reuse the existing themed RN components.

**Tech Stack:** Expo SDK 52, React Native 0.76, expo-router 4, TypeScript, zustand + AsyncStorage, jest-expo (pure-logic tests only).

**Build assist:** During execution, dispatch the `wshobson/agents` React Native / frontend specialist for the screen-porting tasks (Tasks 8–12) and the API-integration specialist for the data-layer tasks (Tasks 3–4). Pure-logic tasks use TDD; UI tasks verify via `npm run typecheck` + runtime.

**Conventions:** All commands run from `mobile/` unless stated. The `@/` alias maps to `mobile/src/` (see `mobile/tsconfig.json`). Commit after every task.

---

## File Structure

```
mobile/
  app/                          # expo-router (replaces App.tsx as entry)
    _layout.tsx                 # fonts, SportThemeProvider, onboarding gate, floodlight bg
    (tabs)/_layout.tsx          # bottom tab navigator, themed
    (tabs)/index.tsx            # Home
    (tabs)/leagues.tsx          # Leagues
    (tabs)/leaderboard.tsx      # Leaderboard
    (tabs)/rewards.tsx          # Rewards
    (tabs)/profile.tsx          # Profile
  src/
    lib/
      types.ts                  # ported domain types
      scoring.ts                # ported pure scoring (TESTED)
      time.ts                   # ported pure time (TESTED)
      catalog.ts                # market meta, option pools, reward catalog
      data/
        provider.ts             # DataProvider interface + FixtureBoard
        http.ts                 # base-URL resolver + fetch wrapper + typed errors
        adapter.ts              # backend snake_case -> web domain shapes (TESTED)
        backendProvider.ts      # DataProvider over API + local fallbacks
        predictionsCache.ts     # AsyncStorage cache for "my predictions"
        client.ts               # getProvider() singleton
    store/
      useSession.ts             # zustand + AsyncStorage persist
    components/
      OnboardingModal.tsx       # NEW: RN onboarding modal
      index.ts                  # add OnboardingModal export
  __tests__/                    # jest-expo tests for pure logic
    scoring.test.ts
    time.test.ts
    adapter.test.ts
backend/app/main.py             # add CORSMiddleware
```

Files removed at the end: `mobile/App.tsx`, `mobile/index.ts` (replaced by expo-router entry).

---

## Task 1: Dependencies, entry point, and test harness

**Files:**
- Modify: `mobile/package.json`
- Modify: `mobile/app.json`
- Create: `mobile/jest.config.js`
- Create: `mobile/.env.example`

- [ ] **Step 1: Add runtime + dev dependencies**

Run (from `mobile/`):
```bash
npx expo install zustand @react-native-async-storage/async-storage @react-native-community/netinfo
npm install -D jest jest-expo @types/jest
```
Expected: installs succeed; `package.json` gains the deps.

- [ ] **Step 2: Switch the entry point to expo-router and add the test script**

In `mobile/package.json`, set `"main"` and add `"test"`:
```json
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "typecheck": "tsc --noEmit",
    "test": "jest"
  },
```

- [ ] **Step 3: Configure expo-router scheme + plugin in `mobile/app.json`**

Ensure the `expo` block contains a `scheme` and the router plugin (merge into existing keys, do not duplicate):
```json
    "scheme": "mppplus",
    "plugins": ["expo-router"]
```

- [ ] **Step 4: Create `mobile/jest.config.js`**

```js
module.exports = {
  preset: "jest-expo",
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
```

- [ ] **Step 5: Create `mobile/.env.example`**

```
# Base URL of the FastAPI backend. Defaults to http://localhost:8000.
# Android emulator automatically rewrites localhost -> 10.0.2.2 at runtime.
EXPO_PUBLIC_API_URL=http://localhost:8000
```

- [ ] **Step 6: Verify typecheck still passes**

Run: `npm run typecheck`
Expected: PASS (no type errors; App.tsx still present at this point).

- [ ] **Step 7: Commit**

```bash
git add mobile/package.json mobile/package-lock.json mobile/app.json mobile/jest.config.js mobile/.env.example
git commit -m "chore(mobile): expo-router entry, zustand/async-storage deps, jest harness"
```

---

## Task 2: Port pure domain libs (types, scoring, time) with tests

**Files:**
- Create: `mobile/src/lib/types.ts`
- Create: `mobile/src/lib/scoring.ts`
- Create: `mobile/src/lib/time.ts`
- Create: `mobile/__tests__/scoring.test.ts`
- Create: `mobile/__tests__/time.test.ts`

- [ ] **Step 1: Create `mobile/src/lib/types.ts`** (ported from web `src/lib/types.ts`)

```ts
export type Sport = "basketball" | "f1";
export type EventStatus = "scheduled" | "locked" | "settled";

export interface League {
  id: string;
  sport: Sport;
  org: string;
  season: number;
}

export interface Fixture {
  id: string;
  leagueId: string;
  sport: Sport;
  scope: "match" | "weekend" | "season";
  title: string;
  home?: string;
  away?: string;
  venue?: string;
  startTime: string;
  lockTime: string;
  status: EventStatus;
}

export type MarketKind =
  | "match_winner" | "exact_score" | "top_scorer" | "season_champion"
  | "quali_podium" | "sprint_podium" | "race_podium" | "fastest_lap"
  | "top_speed" | "best_sectors" | "driver_champion" | "constructor_champion";

export type MarketInput = "choice" | "score" | "podium";

export interface Market {
  id: string;
  fixtureId: string;
  leagueId: string;
  kind: MarketKind;
  label: string;
  input: MarketInput;
  difficulty: 1 | 2 | 3;
  options?: string[];
  lockTime: string;
  status: EventStatus;
  result: string | null;
}

export interface Prediction {
  id: string;
  userId: string;
  marketId: string;
  value: string;
  pointsAwarded: number;
  settled: boolean;
  correct: boolean;
}

export interface Profile {
  id: string;
  displayName: string;
  totalPoints: number;
}

export type RankTier = "Rookie" | "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";

export interface SeasonStats {
  leagueId: string;
  points: number;
  made: number;
  settled: number;
  correct: number;
  accuracy: number;
  tier: RankTier;
}

export interface LeaderboardRow {
  user: Profile;
  points: number;
  made: number;
  accuracy: number;
  tier: RankTier;
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
}
```

- [ ] **Step 2: Create `mobile/src/lib/time.ts`** (verbatim from web)

```ts
/** Human "time until" a future ISO timestamp, e.g. "in 2h 5m" or "Locked". Pure. */
export function timeUntil(iso: string, now: number = Date.now()): string {
  const ms = new Date(iso).getTime() - now;
  if (Number.isNaN(ms)) return "";
  if (ms <= 0) return "Locked";
  const mins = Math.floor(ms / 60000);
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${m}m`;
  return `in ${m}m`;
}
```

- [ ] **Step 3: Create `mobile/src/lib/scoring.ts`** (verbatim from web; import path uses `@/`)

```ts
import type { Market, RankTier } from "@/lib/types";

const CHOICE_UNIT = 10;
const PODIUM_UNIT = 5;

export function parsePodium(value: string): string[] {
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

export function scoreMarket(market: Market, value: string): number {
  if (!market.result) return 0;
  if (market.input === "podium") {
    const got = parsePodium(value);
    const want = parsePodium(market.result);
    let hits = 0;
    for (let i = 0; i < want.length; i++) if (got[i] && got[i] === want[i]) hits++;
    return hits * market.difficulty * PODIUM_UNIT;
  }
  return value === market.result ? market.difficulty * CHOICE_UNIT : 0;
}

export function isCorrect(market: Market, value: string): boolean {
  return scoreMarket(market, value) > 0;
}

export function accuracy(correct: number, settled: number): number {
  return settled === 0 ? 0 : correct / settled;
}

export function rankTier(acc: number, settled: number): RankTier {
  if (settled < 5) return "Rookie";
  if (acc >= 0.8) return "Diamond";
  if (acc >= 0.65) return "Platinum";
  if (acc >= 0.5) return "Gold";
  if (acc >= 0.35) return "Silver";
  return "Bronze";
}
```

- [ ] **Step 4: Write failing tests**

`mobile/__tests__/time.test.ts`:
```ts
import { timeUntil } from "@/lib/time";

describe("timeUntil", () => {
  const now = 1_000_000_000_000;
  it("returns Locked for past timestamps", () => {
    expect(timeUntil(new Date(now - 1000).toISOString(), now)).toBe("Locked");
  });
  it("formats hours and minutes", () => {
    expect(timeUntil(new Date(now + (2 * 60 + 5) * 60000).toISOString(), now)).toBe("in 2h 5m");
  });
  it("formats days and hours", () => {
    expect(timeUntil(new Date(now + (26 * 60) * 60000).toISOString(), now)).toBe("in 1d 2h");
  });
});
```

`mobile/__tests__/scoring.test.ts`:
```ts
import { scoreMarket, rankTier } from "@/lib/scoring";
import type { Market } from "@/lib/types";

const base: Market = {
  id: "m", fixtureId: "f", leagueId: "l", kind: "match_winner",
  label: "Winner", input: "choice", difficulty: 2, lockTime: "", status: "settled", result: "Lakers",
};

describe("scoreMarket", () => {
  it("awards difficulty*10 for a correct choice", () => {
    expect(scoreMarket(base, "Lakers")).toBe(20);
  });
  it("awards 0 for a wrong choice", () => {
    expect(scoreMarket(base, "Celtics")).toBe(0);
  });
  it("scores podium per correct position", () => {
    const m: Market = { ...base, input: "podium", difficulty: 2, result: "A,B,C" };
    expect(scoreMarket(m, "A,X,C")).toBe(2 * 2 * 5); // 2 hits
  });
});

describe("rankTier", () => {
  it("is Rookie below 5 settled", () => {
    expect(rankTier(1, 4)).toBe("Rookie");
  });
  it("is Diamond at 80%+ with volume", () => {
    expect(rankTier(0.85, 10)).toBe("Diamond");
  });
});
```

- [ ] **Step 5: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — modules not yet resolvable / or PASS only after step files exist. (If files from steps 1–3 are written, tests should PASS; if you reordered, expect module-not-found.)

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — 2 suites, all green.

- [ ] **Step 7: Commit**

```bash
git add mobile/src/lib/types.ts mobile/src/lib/scoring.ts mobile/src/lib/time.ts mobile/__tests__/scoring.test.ts mobile/__tests__/time.test.ts
git commit -m "feat(mobile): port pure domain libs (types, scoring, time) with tests"
```

---

## Task 3: Catalog, HTTP client, and backend→domain adapter (TDD)

**Files:**
- Create: `mobile/src/lib/catalog.ts`
- Create: `mobile/src/lib/data/http.ts`
- Create: `mobile/src/lib/data/adapter.ts`
- Create: `mobile/__tests__/adapter.test.ts`

- [ ] **Step 1: Create `mobile/src/lib/catalog.ts`**

Market metadata + option pools (from web), plus a static reward catalog used by the Rewards fallback.

```ts
import type { MarketInput, MarketKind } from "@/lib/types";

export interface MarketMeta {
  label: string;
  short: string;
  input: MarketInput;
  difficulty: 1 | 2 | 3;
  scope: "match" | "weekend" | "season";
  sport: "basketball" | "f1";
}

export const MARKET_META: Record<MarketKind, MarketMeta> = {
  match_winner: { label: "Match winner", short: "Winner", input: "choice", difficulty: 1, scope: "match", sport: "basketball" },
  exact_score: { label: "Exact final score", short: "Score", input: "score", difficulty: 3, scope: "match", sport: "basketball" },
  top_scorer: { label: "Top scorer", short: "Top scorer", input: "choice", difficulty: 2, scope: "match", sport: "basketball" },
  season_champion: { label: "Season champion", short: "Champion", input: "choice", difficulty: 3, scope: "season", sport: "basketball" },
  quali_podium: { label: "Qualifying podium", short: "Quali", input: "podium", difficulty: 2, scope: "weekend", sport: "f1" },
  sprint_podium: { label: "Sprint podium", short: "Sprint", input: "podium", difficulty: 2, scope: "weekend", sport: "f1" },
  race_podium: { label: "Race podium", short: "Podium", input: "podium", difficulty: 2, scope: "weekend", sport: "f1" },
  fastest_lap: { label: "Fastest lap", short: "Fastest lap", input: "choice", difficulty: 2, scope: "weekend", sport: "f1" },
  top_speed: { label: "Top speed", short: "Top speed", input: "choice", difficulty: 1, scope: "weekend", sport: "f1" },
  best_sectors: { label: "Best sectors", short: "Sectors", input: "choice", difficulty: 1, scope: "weekend", sport: "f1" },
  driver_champion: { label: "Drivers' champion", short: "Driver title", input: "choice", difficulty: 3, scope: "season", sport: "f1" },
  constructor_champion: { label: "Constructors' champion", short: "Constructor title", input: "choice", difficulty: 3, scope: "season", sport: "f1" },
};

export const F1_DRIVERS = ["Verstappen", "Norris", "Leclerc", "Piastri", "Russell", "Hamilton", "Sainz", "Alonso"];
export const F1_CONSTRUCTORS = ["Red Bull", "McLaren", "Ferrari", "Mercedes", "Aston Martin"];

export interface RewardDef {
  id: string;
  icon: string;
  name: string;
  desc: string;
  /** Returns true when the reward is unlocked for the given stats. */
  unlocked: (s: { accuracy: number; points: number; made: number }) => boolean;
}

export const REWARDS: RewardDef[] = [
  { id: "sharp", icon: "🎯", name: "Sharp Shooter", desc: "80%+ accuracy", unlocked: (s) => s.accuracy >= 0.8 },
  { id: "century", icon: "💯", name: "Centurion", desc: "100+ season points", unlocked: (s) => s.points >= 100 },
  { id: "regular", icon: "📅", name: "Regular", desc: "20+ predictions placed", unlocked: (s) => s.made >= 20 },
  { id: "boss", icon: "🏆", name: "Season Boss", desc: "Win a mini-league", unlocked: () => false },
];
```

- [ ] **Step 2: Create `mobile/src/lib/data/http.ts`**

```ts
import { Platform } from "react-native";

/** Resolve the API base URL, rewriting localhost for the Android emulator. */
export function apiBaseUrl(): string {
  let base = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";
  if (Platform.OS === "android") {
    base = base.replace("localhost", "10.0.2.2").replace("127.0.0.1", "10.0.2.2");
  }
  return base.replace(/\/$/, "");
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBaseUrl()}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body || `${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
};
```

- [ ] **Step 3: Create `mobile/src/lib/data/adapter.ts`** (pure functions; the riskiest logic)

```ts
import type { Fixture, League, Market } from "@/lib/types";

// ---- Backend wire shapes (snake_case) ----
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
    id: w.id,
    fixtureId: w.fixture_id,
    leagueId,
    kind: w.kind,
    label: w.label,
    input: w.input,
    difficulty: (Math.min(3, Math.max(1, w.difficulty)) as 1 | 2 | 3),
    options: w.options ?? [],
    lockTime: w.lock_time,
    status: w.status,
    result: w.result,
  };
}

/** Split "Home vs Away" into parts; returns undefined when there is no "vs". */
export function splitMatchup(name: string): { home?: string; away?: string } {
  const m = name.split(/\s+vs\.?\s+/i);
  return m.length === 2 ? { home: m[0].trim(), away: m[1].trim() } : {};
}

export function toFixture(w: FixtureWire, league: LeagueWire): { fixture: Fixture; markets: Market[] } {
  const markets = w.markets.map((m) => toMarket(m, league.id));
  // Derive fixture-level fields the backend doesn't send, from its markets.
  const scope = markets[0]?.scope ?? "match";
  const status = markets[0]?.status ?? "scheduled";
  const lockTime = markets[0]?.lockTime ?? w.start_time;
  const fixture: Fixture = {
    id: w.id,
    leagueId: league.id,
    sport: league.sport,
    scope,
    title: w.name,
    ...splitMatchup(w.name),
    startTime: w.start_time,
    lockTime,
    status,
  };
  return { fixture, markets };
}
```

- [ ] **Step 4: Write failing adapter tests**

`mobile/__tests__/adapter.test.ts`:
```ts
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
```

- [ ] **Step 5: Run tests — expect them to fail, then pass once files exist**

Run: `npm test`
Expected: all suites PASS (scoring, time, adapter).

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add mobile/src/lib/catalog.ts mobile/src/lib/data/http.ts mobile/src/lib/data/adapter.ts mobile/__tests__/adapter.test.ts
git commit -m "feat(mobile): catalog, http client, and tested backend->domain adapter"
```

---

## Task 4: DataProvider interface, predictions cache, backend provider, client

**Files:**
- Create: `mobile/src/lib/data/provider.ts`
- Create: `mobile/src/lib/data/predictionsCache.ts`
- Create: `mobile/src/lib/data/backendProvider.ts`
- Create: `mobile/src/lib/data/client.ts`

- [ ] **Step 1: Create `mobile/src/lib/data/provider.ts`** (interface identical to web)

```ts
import type { Fixture, Group, League, LeaderboardRow, Market, Prediction, Profile, SeasonStats } from "@/lib/types";

export interface FixtureBoard {
  fixture: Fixture;
  markets: Market[];
}

export interface DataProvider {
  listLeagues(): Promise<League[]>;
  getBoard(leagueId: string): Promise<FixtureBoard[]>;
  getPredictions(userId: string): Promise<Prediction[]>;
  submitPrediction(userId: string, marketId: string, value: string): Promise<Prediction>;
  settleMarket(marketId: string, result: string): Promise<void>;
  seasonStats(userId: string, leagueId: string): Promise<SeasonStats>;
  leaderboard(leagueId: string): Promise<LeaderboardRow[]>;
  getProfile(userId: string): Promise<Profile | null>;
  createGroup(ownerId: string, name: string): Promise<Group>;
  joinGroup(userId: string, inviteCode: string): Promise<Group>;
}
```

- [ ] **Step 2: Create `mobile/src/lib/data/predictionsCache.ts`** (AsyncStorage-backed "my predictions")

```ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Prediction } from "@/lib/types";

const key = (userId: string) => `mpp-preds-${userId}`;

export async function loadPredictions(userId: string): Promise<Prediction[]> {
  const raw = await AsyncStorage.getItem(key(userId));
  return raw ? (JSON.parse(raw) as Prediction[]) : [];
}

export async function savePrediction(userId: string, pred: Prediction): Promise<void> {
  const all = await loadPredictions(userId);
  const next = all.filter((p) => p.marketId !== pred.marketId);
  next.push(pred);
  await AsyncStorage.setItem(key(userId), JSON.stringify(next));
}
```

- [ ] **Step 3: Create `mobile/src/lib/data/backendProvider.ts`**

```ts
import type { DataProvider, FixtureBoard } from "@/lib/data/provider";
import type { Group, League, LeaderboardRow, Prediction, Profile, SeasonStats } from "@/lib/types";
import { http } from "@/lib/data/http";
import { toFixture, toLeague, type BoardWire, type LeagueWire } from "@/lib/data/adapter";
import { loadPredictions, savePrediction } from "@/lib/data/predictionsCache";

interface SeasonStatsWire {
  user_id: string; league_id: string; points: number; made: number;
  settled: number; correct: number; accuracy: number; tier: SeasonStats["tier"];
}
interface LeaderboardWire {
  user_id: string; points: number; made: number; accuracy: number; tier: SeasonStats["tier"];
}

export class BackendProvider implements DataProvider {
  async listLeagues(): Promise<League[]> {
    const wire = await http.get<LeagueWire[]>("/leagues");
    return wire.map(toLeague);
  }

  async getBoard(leagueId: string): Promise<FixtureBoard[]> {
    const board = await http.get<BoardWire>(`/leagues/${leagueId}/board`);
    return board.fixtures.map((f) => toFixture(f, board.league));
  }

  async getPredictions(userId: string): Promise<Prediction[]> {
    // Local fallback: backend has no list endpoint yet.
    return loadPredictions(userId);
  }

  async submitPrediction(userId: string, marketId: string, value: string): Promise<Prediction> {
    await http.post("/predictions", { user_id: userId, market_id: marketId, value });
    const pred: Prediction = {
      id: `${userId}:${marketId}`, userId, marketId, value,
      pointsAwarded: 0, settled: false, correct: false,
    };
    await savePrediction(userId, pred);
    return pred;
  }

  async settleMarket(marketId: string, result: string): Promise<void> {
    await http.post(`/markets/${marketId}/settle`, { result });
  }

  async seasonStats(userId: string, leagueId: string): Promise<SeasonStats> {
    const s = await http.get<SeasonStatsWire>(`/users/${userId}/seasons/${leagueId}`);
    return {
      leagueId: s.league_id, points: s.points, made: s.made, settled: s.settled,
      correct: s.correct, accuracy: s.accuracy, tier: s.tier,
    };
  }

  async leaderboard(leagueId: string): Promise<LeaderboardRow[]> {
    const rows = await http.get<LeaderboardWire[]>(`/leagues/${leagueId}/leaderboard`);
    return rows.map((r) => ({
      // Display name fallback: backend sends only user_id.
      user: { id: r.user_id, displayName: r.user_id, totalPoints: r.points },
      points: r.points, made: r.made, accuracy: r.accuracy, tier: r.tier,
    }));
  }

  async getProfile(userId: string): Promise<Profile | null> {
    // Derived fallback: backend has no profile endpoint.
    return { id: userId, displayName: userId, totalPoints: 0 };
  }

  async createGroup(ownerId: string, name: string): Promise<Group> {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    return { id: `grp_${code}`, name, inviteCode: code, ownerId };
  }

  async joinGroup(_userId: string, inviteCode: string): Promise<Group> {
    return { id: `grp_${inviteCode}`, name: "Joined group", inviteCode, ownerId: "unknown" };
  }
}
```

- [ ] **Step 4: Create `mobile/src/lib/data/client.ts`**

```ts
import { BackendProvider } from "@/lib/data/backendProvider";
import type { DataProvider } from "@/lib/data/provider";

let instance: DataProvider | null = null;
export function getProvider(): DataProvider {
  if (!instance) instance = new BackendProvider();
  return instance;
}
```

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add mobile/src/lib/data/provider.ts mobile/src/lib/data/predictionsCache.ts mobile/src/lib/data/backendProvider.ts mobile/src/lib/data/client.ts
git commit -m "feat(mobile): DataProvider + backend provider with local fallbacks"
```

---

## Task 5: Session store (zustand + AsyncStorage)

**Files:**
- Create: `mobile/src/store/useSession.ts`

- [ ] **Step 1: Create `mobile/src/store/useSession.ts`** (web store ported to AsyncStorage persist)

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Sport } from "@/lib/types";

interface SessionState {
  userId: string;
  displayName: string;
  favorites: Sport[];
  onboarded: boolean;
  hydrated: boolean;
  setUser: (id: string, name: string) => void;
  setFavorites: (sports: Sport[]) => void;
  completeOnboarding: (sports: Sport[]) => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      userId: "demo-user",
      displayName: "Demo Player",
      favorites: [],
      onboarded: false,
      hydrated: false,
      setUser: (userId, displayName) => set({ userId, displayName }),
      setFavorites: (favorites) => set({ favorites }),
      completeOnboarding: (favorites) => set({ favorites, onboarded: true }),
    }),
    {
      name: "mpp-session",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ userId: s.userId, displayName: s.displayName, favorites: s.favorites, onboarded: s.onboarded }),
      onRehydrateStorage: () => (state) => state && (state.hydrated = true),
    }
  )
);
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add mobile/src/store/useSession.ts
git commit -m "feat(mobile): session store with AsyncStorage persistence"
```

---

## Task 6: Onboarding modal component

**Files:**
- Create: `mobile/src/components/OnboardingModal.tsx`
- Modify: `mobile/src/components/index.ts`

- [ ] **Step 1: Create `mobile/src/components/OnboardingModal.tsx`**

RN port of the web onboarding: pick favorite sports, then continue.

```tsx
import React, { useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { useSportTheme } from "@/theme/useSportTheme";
import { FONTS } from "@/theme/fonts";
import type { Sport } from "@/lib/types";

const SPORT_OPTIONS: { id: Sport; label: string; emoji: string }[] = [
  { id: "basketball", label: "Basketball", emoji: "🏀" },
  { id: "f1", label: "Formula 1", emoji: "🏎️" },
];

export function OnboardingModal({ onDone }: { onDone: (sports: Sport[]) => void }) {
  const t = useSportTheme();
  const [picked, setPicked] = useState<Sport[]>([]);
  const toggle = (s: Sport) =>
    setPicked((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.scrim}>
        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          <Text style={[styles.eyebrow, { color: t.mutedText }]}>WELCOME TO MPP+</Text>
          <Text style={[styles.title, { color: t.text }]}>Pick your sports</Text>
          <Text style={[styles.sub, { color: t.mutedText }]}>We'll tailor your match day board.</Text>
          <View style={styles.options}>
            {SPORT_OPTIONS.map((o) => {
              const on = picked.includes(o.id);
              return (
                <Pressable
                  key={o.id}
                  onPress={() => toggle(o.id)}
                  style={[styles.opt, { borderColor: on ? t.primary : t.border, backgroundColor: on ? t.primary + "22" : "transparent" }]}
                >
                  <Text style={styles.emoji}>{o.emoji}</Text>
                  <Text style={[styles.optLabel, { color: t.text }]}>{o.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            onPress={() => onDone(picked)}
            style={[styles.cta, { backgroundColor: t.primary }]}
          >
            <Text style={styles.ctaText}>{picked.length ? "Start predicting" : "Skip for now"}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", maxWidth: 420, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, padding: 22 },
  eyebrow: { fontFamily: FONTS.mono, fontSize: 11, letterSpacing: 2 },
  title: { fontFamily: FONTS.display, fontSize: 26, marginTop: 8 },
  sub: { fontFamily: FONTS.body, fontSize: 13, marginTop: 6 },
  options: { flexDirection: "row", gap: 12, marginTop: 20 },
  opt: { flex: 1, borderWidth: 1, borderRadius: 16, paddingVertical: 18, alignItems: "center", gap: 8 },
  emoji: { fontSize: 28 },
  optLabel: { fontFamily: FONTS.bodyMed, fontSize: 14 },
  cta: { marginTop: 22, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  ctaText: { fontFamily: FONTS.displayBold, fontSize: 15, color: "#fff" },
});
```

- [ ] **Step 2: Export it from `mobile/src/components/index.ts`** — append:

```ts
export { OnboardingModal } from "./OnboardingModal";
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add mobile/src/components/OnboardingModal.tsx mobile/src/components/index.ts
git commit -m "feat(mobile): onboarding modal component"
```

---

## Task 7: expo-router layout, theme/onboarding gate, and tab bar

**Files:**
- Create: `mobile/app/_layout.tsx`
- Create: `mobile/app/(tabs)/_layout.tsx`

- [ ] **Step 1: Create `mobile/app/_layout.tsx`**

Loads fonts, wraps in `SportThemeProvider` (theme derived from the first favorite), paints the floodlight background, gates onboarding, and renders the router `Slot`.

```tsx
import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Archivo_700Bold, Archivo_800ExtraBold } from "@expo-google-fonts/archivo";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { JetBrainsMono_500Medium, JetBrainsMono_700Bold } from "@expo-google-fonts/jetbrains-mono";
import { SportThemeProvider, useSportTheme } from "@/theme/useSportTheme";
import { SPORT_THEMES } from "@/theme/sportThemes";
import { OnboardingModal } from "@/components";
import { useSession } from "@/store/useSession";

function sportToThemeId(fav: string | undefined): string {
  if (fav === "f1") return "f1";
  if (fav === "basketball") return "nba";
  return "default";
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Archivo_700Bold, Archivo_800ExtraBold,
    Inter_400Regular, Inter_600SemiBold,
    JetBrainsMono_500Medium, JetBrainsMono_700Bold,
  });
  const { favorites, onboarded, hydrated, completeOnboarding } = useSession();

  if (!loaded || !hydrated) {
    return (
      <View style={[styles.center, { backgroundColor: SPORT_THEMES.default.background }]}>
        <ActivityIndicator color={SPORT_THEMES.default.primary} />
      </View>
    );
  }

  return (
    <SportThemeProvider sport={sportToThemeId(favorites[0])}>
      <Background>
        <Slot />
        {!onboarded && <OnboardingModal onDone={completeOnboarding} />}
      </Background>
      <StatusBar style="light" />
    </SportThemeProvider>
  );
}

function Background({ children }: { children: React.ReactNode }) {
  const t = useSportTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <LinearGradient
        colors={[t.primary + "2E", t.background, t.background]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
```

- [ ] **Step 2: Create `mobile/app/(tabs)/_layout.tsx`**

Bottom tab navigator themed by the active sport. Uses text labels (no icon dependency).

```tsx
import React from "react";
import { Text } from "react-native";
import { Tabs } from "expo-router";
import { useSportTheme } from "@/theme/useSportTheme";
import { FONTS } from "@/theme/fonts";

const TABS: { name: string; title: string }[] = [
  { name: "index", title: "Match Day" },
  { name: "leagues", title: "Leagues" },
  { name: "leaderboard", title: "Ranks" },
  { name: "rewards", title: "Rewards" },
  { name: "profile", title: "Profile" },
];

export default function TabsLayout() {
  const t = useSportTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.text,
        tabBarInactiveTintColor: t.mutedText,
        tabBarStyle: {
          backgroundColor: t.surface,
          borderTopColor: t.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontFamily: FONTS.bodyMed, fontSize: 11 },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>●</Text>,
          }}
        />
      ))}
    </Tabs>
  );
}
```

- [ ] **Step 3: Typecheck** — will FAIL until the 5 tab screens exist (next tasks). That is expected.

Run: `npm run typecheck`
Expected: errors about missing routes `(tabs)/index` etc. — proceed to Task 8.

- [ ] **Step 4: Commit**

```bash
git add mobile/app/_layout.tsx "mobile/app/(tabs)/_layout.tsx"
git commit -m "feat(mobile): expo-router root layout, theme/onboarding gate, tab bar"
```

---

## Task 8: Home screen (Match Day)

**Files:**
- Create: `mobile/app/(tabs)/index.tsx`

Port of web `src/app/page.tsx`: league chip selector, season-stat banner, fixtures list with prediction markets.

- [ ] **Step 1: Create `mobile/app/(tabs)/index.tsx`**

```tsx
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useSportControls, useSportTheme } from "@/theme/useSportTheme";
import { resolveSportId } from "@/theme/sportThemes";
import { FONTS } from "@/theme/fonts";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import { timeUntil } from "@/lib/time";
import {
  SportHeader, EventCard, PredictionCard, PredictionButton, ResultCard, RankBadge,
} from "@/components";
import type { FixtureBoard } from "@/lib/data/provider";
import type { League, Prediction, SeasonStats } from "@/lib/types";

export default function HomeScreen() {
  const t = useSportTheme();
  const { setSport } = useSportControls();
  const { userId, favorites } = useSession();
  const provider = getProvider();

  const [leagues, setLeagues] = useState<League[]>([]);
  const [activeLeague, setActiveLeague] = useState("");
  const [board, setBoard] = useState<FixtureBoard[]>([]);
  const [preds, setPreds] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<SeasonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    provider.listLeagues().then(setLeagues).catch((e) => setError(String(e)));
  }, [provider]);

  const visible = useMemo(
    () => leagues.filter((l) => favorites.length === 0 || favorites.includes(l.sport)),
    [leagues, favorites]
  );

  useEffect(() => {
    if (visible.length && !visible.some((l) => l.id === activeLeague)) setActiveLeague(visible[0].id);
  }, [visible, activeLeague]);

  // Re-theme the whole app when the active league changes.
  useEffect(() => {
    if (activeLeague) setSport(resolveSportId(activeLeague));
  }, [activeLeague, setSport]);

  useEffect(() => {
    if (!activeLeague) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [b, p, s] = await Promise.all([
          provider.getBoard(activeLeague),
          provider.getPredictions(userId),
          provider.seasonStats(userId, activeLeague),
        ]);
        setBoard(b); setPreds(p); setStats(s);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [activeLeague, userId, provider]);

  async function submit(marketId: string, value: string) {
    await provider.submitPrediction(userId, marketId, value);
    setPreds(await provider.getPredictions(userId));
  }

  const predFor = (marketId: string) => preds.find((p) => p.marketId === marketId);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <SportHeader title="Match Day" subtitle="Call it before the lights go out." />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {visible.map((l) => {
          const on = l.id === activeLeague;
          const st = useSportThemeFor(l.id);
          return (
            <Pressable
              key={l.id}
              onPress={() => setActiveLeague(l.id)}
              style={[styles.chip, { borderColor: on ? st.primary : t.border, backgroundColor: on ? st.primary + "22" : "transparent" }]}
            >
              <Text style={{ color: on ? t.text : t.mutedText, fontFamily: FONTS.bodyMed, fontSize: 13 }}>
                {l.org} {l.season}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {stats && (
        <View style={[styles.banner, { backgroundColor: t.surface, borderColor: t.border }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <RankBadge tier={stats.tier} />
            <Text style={{ color: t.mutedText, fontFamily: FONTS.mono, fontSize: 12 }}>
              {stats.correct}/{stats.settled} correct · {Math.round(stats.accuracy * 100)}%
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: t.accent, fontFamily: FONTS.monoBold, fontSize: 18 }}>{stats.points}</Text>
            <Text style={{ color: t.mutedText, fontFamily: FONTS.mono, fontSize: 10 }}>SEASON PTS</Text>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={t.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={[styles.empty, { color: t.danger }]}>Couldn't load the board. Is the backend running?</Text>
      ) : board.length === 0 ? (
        <Text style={[styles.empty, { color: t.mutedText }]}>No fixtures on the board yet.</Text>
      ) : (
        board.map((b) => (
          <View key={b.fixture.id} style={styles.section}>
            <EventCard
              title={b.fixture.title}
              scopeLabel={b.fixture.scope === "match" ? "Match" : b.fixture.scope === "weekend" ? "Race weekend" : "Season"}
              countdown={timeUntil(b.fixture.lockTime)}
              status={b.fixture.status}
            >
              {b.markets.map((m) => {
                const settled = m.status === "settled";
                const mine = predFor(m.id);
                if (settled) {
                  return (
                    <ResultCard
                      key={m.id}
                      marketLabel={m.label}
                      result={m.result ?? "—"}
                      correct={mine ? mine.value === m.result : undefined}
                      points={mine?.pointsAwarded}
                    />
                  );
                }
                return (
                  <PredictionCard
                    key={m.id}
                    label={m.label}
                    difficulty={m.difficulty}
                    lockedLabel={mine ? `Locked: ${mine.value}` : undefined}
                  >
                    {(m.options ?? []).map((o) => (
                      <PredictionButton
                        key={o}
                        label={o}
                        state={mine?.value === o ? "selected" : "idle"}
                        onPress={() => submit(m.id, o)}
                      />
                    ))}
                  </PredictionCard>
                );
              })}
            </EventCard>
          </View>
        ))
      )}
    </ScrollView>
  );
}

// Helper: a non-hook-rule-violating theme lookup for chips (pure function).
import { getSportTheme } from "@/theme/sportThemes";
function useSportThemeFor(id: string) {
  return getSportTheme(id);
}

const styles = StyleSheet.create({
  chips: { gap: 8, paddingHorizontal: 20, paddingVertical: 14 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  banner: { marginHorizontal: 20, marginBottom: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 12 },
  section: { paddingHorizontal: 20, paddingTop: 12 },
  empty: { textAlign: "center", marginTop: 40, fontFamily: FONTS.body, fontSize: 13 },
});
```

> Note: `useSportThemeFor`/`getSportTheme` is a pure function, safe to call in a `.map`. Do NOT call the `useSportTheme()` hook inside the chip loop.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS for this file (other tab routes still missing — errors only about `leagues`/`leaderboard`/`rewards`/`profile`).

- [ ] **Step 3: Commit**

```bash
git add "mobile/app/(tabs)/index.tsx"
git commit -m "feat(mobile): Home (Match Day) screen wired to backend"
```

---

## Task 9: Leagues screen

**Files:**
- Create: `mobile/app/(tabs)/leagues.tsx`

Port of web `src/app/leagues/page.tsx`: list all leagues as themed `LeagueCard`s.

- [ ] **Step 1: Create `mobile/app/(tabs)/leagues.tsx`**

```tsx
import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SportHeader, LeagueCard } from "@/components";
import { useSportTheme } from "@/theme/useSportTheme";
import { resolveSportId } from "@/theme/sportThemes";
import { FONTS } from "@/theme/fonts";
import { getProvider } from "@/lib/data/client";
import type { League } from "@/lib/types";

export default function LeaguesScreen() {
  const t = useSportTheme();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getProvider().listLeagues()
      .then(setLeagues)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <SportHeader title="Leagues" subtitle="Every competition you can call." />
      {loading ? (
        <ActivityIndicator color={t.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={[styles.empty, { color: t.danger }]}>Couldn't load leagues.</Text>
      ) : (
        leagues.map((l) => (
          <View key={l.id} style={styles.section}>
            <LeagueCard org={l.org} season={l.season} sportId={resolveSportId(l.id)} />
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 20, paddingTop: 12 },
  empty: { textAlign: "center", marginTop: 40, fontFamily: FONTS.body, fontSize: 13 },
});
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS for this file.

- [ ] **Step 3: Commit**

```bash
git add "mobile/app/(tabs)/leagues.tsx"
git commit -m "feat(mobile): Leagues screen"
```

---

## Task 10: Leaderboard screen

**Files:**
- Create: `mobile/app/(tabs)/leaderboard.tsx`

Port of web `src/app/leaderboard/page.tsx`: league selector + ranked rows.

- [ ] **Step 1: Create `mobile/app/(tabs)/leaderboard.tsx`**

```tsx
import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { SportHeader, LeaderboardRow } from "@/components";
import { useSportTheme } from "@/theme/useSportTheme";
import { getSportTheme, resolveSportId } from "@/theme/sportThemes";
import { FONTS } from "@/theme/fonts";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import type { League, LeaderboardRow as Row } from "@/lib/types";

export default function LeaderboardScreen() {
  const t = useSportTheme();
  const { userId } = useSession();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [active, setActive] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProvider().listLeagues().then((ls) => {
      setLeagues(ls);
      if (ls.length) setActive(ls[0].id);
    });
  }, []);

  useEffect(() => {
    if (!active) return;
    setLoading(true);
    getProvider().leaderboard(active).then(setRows).finally(() => setLoading(false));
  }, [active]);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <SportHeader title="Ranks" subtitle="Who's calling it best this season." />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {leagues.map((l) => {
          const on = l.id === active;
          const st = getSportTheme(resolveSportId(l.id));
          return (
            <Pressable
              key={l.id}
              onPress={() => setActive(l.id)}
              style={[styles.chip, { borderColor: on ? st.primary : t.border, backgroundColor: on ? st.primary + "22" : "transparent" }]}
            >
              <Text style={{ color: on ? t.text : t.mutedText, fontFamily: FONTS.bodyMed, fontSize: 13 }}>
                {l.org}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={t.primary} style={{ marginTop: 40 }} />
      ) : rows.length === 0 ? (
        <Text style={[styles.empty, { color: t.mutedText }]}>No standings yet.</Text>
      ) : (
        <View style={[styles.board, { backgroundColor: t.surface, borderColor: t.border }]}>
          {rows.map((r, i) => (
            <LeaderboardRow
              key={r.user.id}
              rank={i + 1}
              name={r.user.id === userId ? "You" : r.user.displayName}
              points={r.points}
              tier={r.tier}
              accuracy={r.accuracy}
              me={r.user.id === userId}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chips: { gap: 8, paddingHorizontal: 20, paddingVertical: 14 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  board: { marginHorizontal: 20, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  empty: { textAlign: "center", marginTop: 40, fontFamily: FONTS.body, fontSize: 13 },
});
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS for this file.

- [ ] **Step 3: Commit**

```bash
git add "mobile/app/(tabs)/leaderboard.tsx"
git commit -m "feat(mobile): Leaderboard screen"
```

---

## Task 11: Rewards screen

**Files:**
- Create: `mobile/app/(tabs)/rewards.tsx`

Port of web `src/app/rewards/page.tsx`: reward grid, unlocked state derived from season stats (fallback).

- [ ] **Step 1: Create `mobile/app/(tabs)/rewards.tsx`**

```tsx
import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { SportHeader, RewardCard } from "@/components";
import { useSportTheme } from "@/theme/useSportTheme";
import { FONTS } from "@/theme/fonts";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import { REWARDS } from "@/lib/catalog";

export default function RewardsScreen() {
  const t = useSportTheme();
  const { userId } = useSession();
  const [stat, setStat] = useState({ accuracy: 0, points: 0, made: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const leagues = await getProvider().listLeagues();
      if (!leagues.length) { setLoading(false); return; }
      // Aggregate across leagues for unlock checks.
      const all = await Promise.all(leagues.map((l) => getProvider().seasonStats(userId, l.id).catch(() => null)));
      const points = all.reduce((n, s) => n + (s?.points ?? 0), 0);
      const made = all.reduce((n, s) => n + (s?.made ?? 0), 0);
      const best = all.reduce((a, s) => Math.max(a, s?.accuracy ?? 0), 0);
      setStat({ accuracy: best, points, made });
      setLoading(false);
    })();
  }, [userId]);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <SportHeader title="Rewards" subtitle="Badges you unlock by calling it right." />
      {loading ? (
        <ActivityIndicator color={t.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.grid}>
          {REWARDS.map((r) => (
            <View key={r.id} style={styles.cell}>
              <RewardCard icon={r.icon} name={r.name} desc={r.desc} locked={!r.unlocked(stat)} />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 14, paddingTop: 12 },
  cell: { width: "50%", padding: 6 },
});
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS for this file.

- [ ] **Step 3: Commit**

```bash
git add "mobile/app/(tabs)/rewards.tsx"
git commit -m "feat(mobile): Rewards screen"
```

---

## Task 12: Profile screen

**Files:**
- Create: `mobile/app/(tabs)/profile.tsx`

Port of web `src/app/profile/page.tsx`: identity, favorites, per-league season stats (fallback-derived profile).

- [ ] **Step 1: Create `mobile/app/(tabs)/profile.tsx`**

```tsx
import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SportHeader, RankBadge, SeasonProgressBar } from "@/components";
import { useSportTheme } from "@/theme/useSportTheme";
import { resolveSportId } from "@/theme/sportThemes";
import { FONTS } from "@/theme/fonts";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import type { League, SeasonStats } from "@/lib/types";

export default function ProfileScreen() {
  const t = useSportTheme();
  const { userId, displayName, favorites } = useSession();
  const [rows, setRows] = useState<{ league: League; stats: SeasonStats }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const leagues = await getProvider().listLeagues();
      const withStats = await Promise.all(
        leagues.map(async (league) => ({ league, stats: await getProvider().seasonStats(userId, league.id) }))
      );
      setRows(withStats);
      setLoading(false);
    })().catch(() => setLoading(false));
  }, [userId]);

  const totalPoints = rows.reduce((n, r) => n + r.stats.points, 0);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <SportHeader title={displayName} subtitle="Your season at a glance." />

      <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Text style={[styles.label, { color: t.mutedText }]}>TOTAL POINTS</Text>
        <Text style={[styles.points, { color: t.accent }]}>{totalPoints}</Text>
        <Text style={[styles.favs, { color: t.mutedText }]}>
          Favorites: {favorites.length ? favorites.join(", ") : "none yet"}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={t.primary} style={{ marginTop: 40 }} />
      ) : (
        rows.map(({ league, stats }) => (
          <View key={league.id} style={[styles.row, { backgroundColor: t.surface, borderColor: t.border }]}>
            <View style={styles.rowHead}>
              <Text style={[styles.org, { color: t.text }]}>{league.org} {league.season}</Text>
              <RankBadge tier={stats.tier} sportId={resolveSportId(league.id)} />
            </View>
            <Text style={[styles.meta, { color: t.mutedText }]}>
              {stats.correct}/{stats.settled} correct · {Math.round(stats.accuracy * 100)}% · {stats.points} pts
            </Text>
            <View style={{ marginTop: 10 }}>
              <SeasonProgressBar value={stats.accuracy} sportId={resolveSportId(league.id)} />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, marginTop: 12, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 18 },
  label: { fontFamily: FONTS.mono, fontSize: 10, letterSpacing: 1.5 },
  points: { fontFamily: FONTS.display, fontSize: 36, marginTop: 4 },
  favs: { fontFamily: FONTS.body, fontSize: 12, marginTop: 8 },
  row: { marginHorizontal: 20, marginTop: 12, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 16 },
  rowHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  org: { fontFamily: FONTS.display, fontSize: 16 },
  meta: { fontFamily: FONTS.mono, fontSize: 12, marginTop: 8 },
});
```

- [ ] **Step 2: Typecheck (all routes now exist)**

Run: `npm run typecheck`
Expected: PASS (entire app, including `(tabs)/_layout.tsx` which now resolves all 5 routes).

- [ ] **Step 3: Commit**

```bash
git add "mobile/app/(tabs)/profile.tsx"
git commit -m "feat(mobile): Profile screen"
```

---

## Task 13: Backend CORS

**Files:**
- Modify: `backend/app/main.py`

- [ ] **Step 1: Add `CORSMiddleware` in `create_app`**

In `backend/app/main.py`, add the import and middleware (allow all origins; acceptable for the demo/dev API):

```python
from fastapi.middleware.cors import CORSMiddleware
```

Inside `create_app`, after `app = FastAPI(...)` and before `app.include_router(api_router)`:

```python
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
```

- [ ] **Step 2: Verify backend still boots and tests pass**

Run (from `backend/`): `uv run pytest -q`
Expected: existing tests PASS.

- [ ] **Step 3: Commit**

```bash
git add backend/app/main.py
git commit -m "feat(backend): enable CORS for the mobile client"
```

---

## Task 14: Remove old entry, full verification, runtime smoke test

**Files:**
- Delete: `mobile/App.tsx`
- Delete: `mobile/index.ts`

- [ ] **Step 1: Remove the obsolete single-screen entry**

```bash
git rm mobile/App.tsx mobile/index.ts
```
(The entry is now `expo-router/entry` from Task 1.)

- [ ] **Step 2: Full typecheck + tests**

Run (from `mobile/`):
```bash
npm run typecheck && npm test
```
Expected: typecheck PASS; 3 test suites (scoring, time, adapter) PASS.

- [ ] **Step 3: Runtime smoke test against the backend**

Terminal A (from `backend/`): `uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
Terminal B (from `mobile/`): `npm run web`

Verify in the browser:
- Onboarding modal appears on first load; picking a sport + "Start predicting" dismisses it and persists across reload.
- All 5 tabs render: Match Day, Leagues, Ranks, Rewards, Profile.
- Match Day lists leagues as chips and loads fixtures from the API; switching a chip re-themes the app.
- Tapping a prediction option marks it selected and shows "Locked: <value>" after round-trip; it survives a reload (AsyncStorage cache).
- Leaderboard switches by league; Profile shows per-league season stats.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore(mobile): remove legacy App.tsx entry; finalize frontend port"
```

---

## Self-Review

**Spec coverage:**
- 5 pages + nav + onboarding → Tasks 7–12 ✓
- Backend for covered endpoints → Task 4 (`listLeagues/getBoard/leaderboard/seasonStats/submitPrediction/settleMarket`) ✓
- Local fallbacks (predictions/profile/rewards/groups/names) → Tasks 3,4 (`predictionsCache`, derived profile, `REWARDS`, stubbed groups, name fallback) ✓
- Reuse existing components → Tasks 8–12 use `EventCard/PredictionCard/PredictionButton/ResultCard/LeagueCard/LeaderboardRow/RewardCard/RankBadge/SeasonProgressBar/SportHeader` ✓
- expo-router navigation → Tasks 1,7 ✓
- Env API base + Android rewrite → Task 3 `http.ts` ✓
- CORS → Task 13 ✓
- Ported pure libs (types/scoring/time/catalog) → Tasks 2,3 ✓
- Session store w/ AsyncStorage → Task 5 ✓

**Type consistency:** `DataProvider` method names match web; `FixtureBoard { fixture, markets }` used identically in `backendProvider` and Home; adapter wire types (`FixtureWire/MarketWire/LeagueWire/BoardWire`) consistent between `adapter.ts` and `backendProvider.ts`; component props match the real signatures read from source (e.g. `LeaderboardRow {rank,name,points,tier,accuracy,me}`, `EventCard {title,scopeLabel,countdown,status}`, `RewardCard {icon,name,desc,locked}`).

**Placeholder scan:** No TBD/TODO; every code step contains complete file content.

**Known follow-ups (out of scope, noted for later):** backend endpoints for predictions-list / profile / rewards / display-names would let the fallbacks be replaced; `settleMarket` is wired but unused by any screen (kept for interface parity with web).

---

# REVISION 2 — Visual Fidelity to the Web (src/) Design

**Why:** The first screen pass reused the mobile starter's per-sport *full reskin* theme (F1=red, NBA=blue) and choice-only inputs. The user's canonical design is `src/` — a single ink/violet/lime brand with floodlight glow, "ticket" cards, hand-drawn SportLogos, and choice/score/podium inputs. Sport is a SMALL accent only (basketball→amber, F1→magenta). This revision rebuilds the visual layer to mirror `src/` 1:1 and removes the mismatched starter components.

**Keep (already correct):** data layer (`lib/data/*`, `predictionsCache`), `store/useSession`, pure libs (`types/scoring/time`), expo-router routing skeleton, backend CORS, `theme/fonts.ts`.

**Replace:** `theme/sportThemes.ts` + `theme/useSportTheme.tsx` (per-sport reskin) → fixed web tokens. All `components/*` starter components → web-faithful ports. All 5 screens rewired.

**Design tokens (from tailwind.config.ts):** ink {DEFAULT #0B0916, 800 #15112A, 700 #1E1838, 600 #272047}, line rgba(255,255,255,0.08), violet #8B5CF6 / light #A78BFA / dark #6D28D9, magenta #E879F9, lime #B6FF3C, amber #FFB020, muted #A89FC9, bronze #C98A5E. Glow shadow rgba(139,92,246,0.55). Fonts: Archivo display, Inter sans, JetBrains mono (already loaded).

**Catalog SPORTS meta (accent COLOR + emoji + confirm word):** basketball → accent amber #FFB020, 🏀, "Swish"; f1 → accent magenta #E879F9, 🏎️, "Lights out". TIER_COLOR: Diamond lime, Platinum violet-light, Gold amber, Silver muted, Bronze #C98A5E, Rookie muted@60%.

## Revised Tasks

- **R1 — Foundation:** `expo install react-native-svg @react-native-picker/picker`. Create `mobile/src/theme/tokens.ts` (COLORS, RADIUS, GLOW). Extend `mobile/src/lib/catalog.ts` with `SPORTS` (accent/emoji/label/confirm) and `TIER_COLOR`. Typecheck. Commit.
- **R2 — Atoms:** `SportLogo.tsx` (react-native-svg port of the F1 wedge + basketball SVGs), `RankBadge.tsx` (tier-colored pill), `Eyebrow.tsx` (mono uppercase label), `Floodlight.tsx` (layered LinearGradient approximating the violet/magenta radial wash). Commit.
- **R3 — Market + ticket:** `MarketRow.tsx` (choice chips violet-selected; score = two numeric inputs with ` : `; podium = 3 Pickers P1/P2/P3; Confirm/Update violet button; "Locked: …"; settled view with result + ±pts; validation flash overlay with sport emoji + confirm word) and `FixtureCard.tsx` (ticket: sport-tinted header gradient, SportLogo, scope label, lime pulse dot / "Settled", title, venue, MarketRows). Commit.
- **R4 — OnboardingModal:** web-faithful (eyebrow, "Pick your sports", sport rows with SportLogo + accent subtitle + lime check, violet "Start predicting"). Commit.
- **R5 — Shell:** root `_layout.tsx` uses `Floodlight` over ink bg (drop per-sport provider); `(tabs)/_layout.tsx` restyled as the web BottomNav (ink-800 bar, lime active icon, glyphs ◎ ▦ ⬡ ✦ ◆, labels Predict/Ranking/Leagues/Rewards/You). Commit.
- **R6 — Home:** rewire to FixtureCard/MarketRow; eyebrow "Match day" + "Call it, {name}." title; league chips (SportLogo + org+season, accent border when active); season-stat banner (RankBadge + correct% + lime points). Commit.
- **R7 — Leaderboard:** eyebrow "Standings" + "Season Ranking"; league chips; ordered rows with padded rank, medal colors [lime,violet-light,amber], "you" highlight (violet/10 bg), RankBadge, accuracy%, points. Commit.
- **R8 — Leagues:** eyebrow "Competitions"; official seasons list (SportLogo + org + accent label); private mini-leagues create (name input → createGroup) + join (code input → joinGroup) with violet buttons + message + created groups list. Commit.
- **R9 — Profile:** avatar initial tile, displayName, total pts (lime); per-season cards (filter made>0) with SportLogo + org + RankBadge + 3 cells (Points lime / Accuracy accent / Correct white). Commit.
- **R10 — Rewards:** static badges grid (6 badges with tone colors + "Soon" pill) + seasonal-prizes gradient card + disabled "Premium — coming soon". Commit.
- **R11 — Cleanup:** delete unused starter components (EventCard, PredictionCard, PredictionButton, LeaderboardRow, LeagueCard, ResultCard, RewardCard, SeasonProgressBar, SportHeader, SportCard) + `theme/sportThemes.ts` + `theme/useSportTheme.tsx`; rewrite `components/index.ts`; full typecheck + tests + runtime smoke. Commit.
