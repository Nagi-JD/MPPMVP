# MPP+ MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first PWA where users predict football/esports/sports outcomes, earn points and streaks, and compete on global and private-league leaderboards.

**Architecture:** Next.js (App Router, TypeScript) front end styled mobile-first and configured as a PWA. Data layer is abstracted behind a `DataProvider` interface with two implementations: a **mock provider** (in-memory + seeded fixtures, runs with zero external setup) and a **Supabase provider** (Postgres + Auth + Realtime + RLS). Pure, unit-tested scoring/settlement logic is provider-independent. Category data arrives via per-source **adapters** that normalize external free APIs into our `events` shape.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Zustand (client state), Vitest (tests), Supabase JS, next-pwa. Free APIs: football-data.org, PandaScore, TheSportsDB.

---

## File Structure

```
src/
  app/                      # Next.js routes
    layout.tsx              # root layout, PWA meta, providers
    page.tsx                # event feed (home)
    leaderboard/page.tsx    # global + group leaderboards
    groups/page.tsx         # list/create/join groups
    profile/page.tsx        # profile + stats
    login/page.tsx          # auth
  components/
    BottomNav.tsx           # mobile tab bar
    EventCard.tsx           # one predictable event
    PredictionControls.tsx  # win/draw/lose or scoreline input
    LeaderboardTable.tsx
  lib/
    types.ts                # shared domain types
    scoring.ts              # PURE scoring/settlement logic (unit tested)
    data/
      provider.ts           # DataProvider interface
      mock.ts               # in-memory mock provider + seed
      supabase.ts           # Supabase-backed provider
      client.ts             # selects provider from env
    adapters/
      adapter.ts            # CategoryAdapter interface
      football.ts           # football-data.org
      esports.ts            # PandaScore
      sports.ts             # TheSportsDB
  store/
    useSession.ts           # current user/session (Zustand)
supabase/
  schema.sql                # tables + RLS policies
  seed.sql                  # demo data
tests/
  scoring.test.ts
  mock-provider.test.ts
```

---

## Task 1: Scaffold Next.js + Tailwind + Vitest

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "mpp-plus",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "15.1.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "zustand": "5.0.2",
    "@supabase/supabase-js": "2.47.0"
  },
  "devDependencies": {
    "typescript": "5.7.2",
    "@types/react": "19.0.1",
    "@types/react-dom": "19.0.1",
    "@types/node": "22.10.1",
    "tailwindcss": "3.4.16",
    "postcss": "8.4.49",
    "autoprefixer": "10.4.20",
    "vitest": "2.1.8",
    "eslint": "9.16.0",
    "eslint-config-next": "15.1.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create config files**

`next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true };
export default nextConfig;
```

`postcss.config.mjs`:
```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

`tailwind.config.ts`:
```ts
import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { brand: { DEFAULT: "#5A0FC8", dark: "#3d0a87" } } } },
  plugins: [],
} satisfies Config;
```

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import path from "node:path";
export default defineConfig({
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
```

- [ ] **Step 4: Create `src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
:root { color-scheme: light dark; }
body { @apply bg-gray-50 text-gray-900 antialiased; }
```

- [ ] **Step 5: Create `src/app/layout.tsx`**

```tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "MPP+ — The Social Predictor",
  description: "Predict football, esports & sports. Earn points. Climb leaderboards.",
  manifest: "/manifest.webmanifest",
};
export const viewport: Viewport = { themeColor: "#5A0FC8" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto max-w-md min-h-screen pb-16">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Create temporary `src/app/page.tsx`**

```tsx
export default function Home() {
  return <h1 className="p-4 text-2xl font-bold text-brand">MPP+</h1>;
}
```

- [ ] **Step 7: Install and verify build**

Run: `npm install && npm run typecheck`
Expected: typecheck passes (BottomNav import will fail until Task 5 — temporarily stub `src/components/BottomNav.tsx` with `export function BottomNav() { return null; }`).

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: scaffold Next.js + Tailwind + Vitest"
```

---

## Task 2: Domain types

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Write `src/lib/types.ts`**

```ts
export type CategorySlug = "football" | "esports" | "basketball" | "tennis";

export interface Category { slug: CategorySlug; name: string; enabled: boolean; }

export type EventStatus = "scheduled" | "locked" | "settled";

export interface GameEvent {
  id: string;
  externalId: string;
  category: CategorySlug;
  title: string;          // "Team A vs Team B"
  home: string;
  away: string;
  startTime: string;      // ISO
  lockTime: string;       // ISO
  status: EventStatus;
  result: Outcome | null; // null until settled
}

export type Outcome = "home" | "draw" | "away";

export interface Prediction {
  id: string;
  userId: string;
  eventId: string;
  choice: Outcome;
  pointsAwarded: number;
  settled: boolean;
}

export interface Profile {
  id: string;
  displayName: string;
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
}

export interface Group { id: string; name: string; inviteCode: string; ownerId: string; }
```

- [ ] **Step 2: Typecheck & commit**

Run: `npm run typecheck` → PASS
```bash
git add src/lib/types.ts && git commit -m "feat: add domain types"
```

---

## Task 3: Pure scoring logic (TDD)

**Files:**
- Create: `src/lib/scoring.ts`, `tests/scoring.test.ts`

- [ ] **Step 1: Write failing test `tests/scoring.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { scorePrediction, applyStreak } from "@/lib/scoring";
import type { GameEvent, Prediction, Profile } from "@/lib/types";

const event = (result: GameEvent["result"]): GameEvent => ({
  id: "e1", externalId: "x", category: "football", title: "A vs B",
  home: "A", away: "B", startTime: "", lockTime: "", status: "settled", result,
});
const pred = (choice: Prediction["choice"]): Prediction => ({
  id: "p1", userId: "u1", eventId: "e1", choice, pointsAwarded: 0, settled: false,
});

describe("scorePrediction", () => {
  it("awards 3 points for a correct pick", () => {
    expect(scorePrediction(event("home"), pred("home"))).toBe(3);
  });
  it("awards 0 for an incorrect pick", () => {
    expect(scorePrediction(event("away"), pred("home"))).toBe(0);
  });
  it("awards 0 when the event has no result", () => {
    expect(scorePrediction(event(null), pred("home"))).toBe(0);
  });
});

describe("applyStreak", () => {
  const base: Profile = { id: "u1", displayName: "U", totalPoints: 0, currentStreak: 2, bestStreak: 5 };
  it("increments streak and adds points on a win", () => {
    const r = applyStreak(base, 3);
    expect(r.totalPoints).toBe(3);
    expect(r.currentStreak).toBe(3);
    expect(r.bestStreak).toBe(5);
  });
  it("raises bestStreak when current passes it", () => {
    const r = applyStreak({ ...base, currentStreak: 5 }, 3);
    expect(r.bestStreak).toBe(6);
  });
  it("resets current streak to 0 on a loss", () => {
    const r = applyStreak(base, 0);
    expect(r.currentStreak).toBe(0);
    expect(r.totalPoints).toBe(0);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test` → FAIL ("scorePrediction is not a function").

- [ ] **Step 3: Implement `src/lib/scoring.ts`**

```ts
import type { GameEvent, Prediction, Profile } from "@/lib/types";

export const POINTS_CORRECT = 3;

/** Points for a single prediction against a settled event. Pure. */
export function scorePrediction(event: GameEvent, prediction: Prediction): number {
  if (!event.result) return 0;
  return prediction.choice === event.result ? POINTS_CORRECT : 0;
}

/** Apply awarded points to a profile, updating streaks. Pure (returns new profile). */
export function applyStreak(profile: Profile, awarded: number): Profile {
  const won = awarded > 0;
  const currentStreak = won ? profile.currentStreak + 1 : 0;
  return {
    ...profile,
    totalPoints: profile.totalPoints + awarded,
    currentStreak,
    bestStreak: Math.max(profile.bestStreak, currentStreak),
  };
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `npm test` → PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/scoring.ts tests/scoring.test.ts
git commit -m "feat: add pure scoring and streak logic with tests"
```

---

## Task 4: DataProvider interface + mock provider (TDD)

**Files:**
- Create: `src/lib/data/provider.ts`, `src/lib/data/mock.ts`, `tests/mock-provider.test.ts`

- [ ] **Step 1: Write `src/lib/data/provider.ts`**

```ts
import type { GameEvent, Prediction, Profile, Group } from "@/lib/types";

export interface DataProvider {
  listEvents(): Promise<GameEvent[]>;
  getPredictions(userId: string): Promise<Prediction[]>;
  submitPrediction(userId: string, eventId: string, choice: Prediction["choice"]): Promise<Prediction>;
  settleEvent(eventId: string, result: NonNullable<GameEvent["result"]>): Promise<void>;
  leaderboard(): Promise<Profile[]>;
  getProfile(userId: string): Promise<Profile | null>;
  createGroup(ownerId: string, name: string): Promise<Group>;
  joinGroup(userId: string, inviteCode: string): Promise<Group>;
}
```

- [ ] **Step 2: Write failing test `tests/mock-provider.test.ts`**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { MockProvider } from "@/lib/data/mock";

let p: MockProvider;
beforeEach(() => { p = new MockProvider(); });

describe("MockProvider", () => {
  it("seeds events", async () => {
    expect((await p.listEvents()).length).toBeGreaterThan(0);
  });
  it("records a prediction", async () => {
    const events = await p.listEvents();
    const pred = await p.submitPrediction("u1", events[0].id, "home");
    expect(pred.choice).toBe("home");
    expect((await p.getPredictions("u1")).length).toBe(1);
  });
  it("rejects a second prediction on the same event", async () => {
    const events = await p.listEvents();
    await p.submitPrediction("u1", events[0].id, "home");
    await expect(p.submitPrediction("u1", events[0].id, "away")).rejects.toThrow();
  });
  it("awards points and updates leaderboard on settle", async () => {
    const events = await p.listEvents();
    await p.submitPrediction("u1", events[0].id, "home");
    await p.settleEvent(events[0].id, "home");
    const profile = await p.getProfile("u1");
    expect(profile?.totalPoints).toBe(3);
  });
  it("settle is idempotent (no double award)", async () => {
    const events = await p.listEvents();
    await p.submitPrediction("u1", events[0].id, "home");
    await p.settleEvent(events[0].id, "home");
    await p.settleEvent(events[0].id, "home");
    expect((await p.getProfile("u1"))?.totalPoints).toBe(3);
  });
});
```

- [ ] **Step 3: Run, verify fail**

Run: `npm test` → FAIL ("Cannot find module mock").

- [ ] **Step 4: Implement `src/lib/data/mock.ts`**

```ts
import type { DataProvider } from "@/lib/data/provider";
import type { GameEvent, Prediction, Profile, Group } from "@/lib/types";
import { scorePrediction, applyStreak } from "@/lib/scoring";

let counter = 0;
const id = (p: string) => `${p}_${++counter}`;

function seedEvents(): GameEvent[] {
  const base = (n: number) => new Date(Date.now() + n * 3600_000).toISOString();
  return [
    { id: "e1", externalId: "f1", category: "football", title: "PSG vs OM", home: "PSG", away: "OM", startTime: base(2), lockTime: base(2), status: "scheduled", result: null },
    { id: "e2", externalId: "x1", category: "esports", title: "G2 vs FNC", home: "G2", away: "FNC", startTime: base(3), lockTime: base(3), status: "scheduled", result: null },
    { id: "e3", externalId: "b1", category: "basketball", title: "LAL vs BOS", home: "LAL", away: "BOS", startTime: base(5), lockTime: base(5), status: "scheduled", result: null },
  ];
}

export class MockProvider implements DataProvider {
  private events = seedEvents();
  private predictions: Prediction[] = [];
  private profiles = new Map<string, Profile>();
  private groups: Group[] = [];

  private profile(userId: string): Profile {
    if (!this.profiles.has(userId))
      this.profiles.set(userId, { id: userId, displayName: userId, totalPoints: 0, currentStreak: 0, bestStreak: 0 });
    return this.profiles.get(userId)!;
  }

  async listEvents() { return this.events; }
  async getPredictions(userId: string) { return this.predictions.filter((p) => p.userId === userId); }

  async submitPrediction(userId: string, eventId: string, choice: Prediction["choice"]) {
    if (this.predictions.some((p) => p.userId === userId && p.eventId === eventId))
      throw new Error("Already predicted this event");
    const pred: Prediction = { id: id("p"), userId, eventId, choice, pointsAwarded: 0, settled: false };
    this.predictions.push(pred);
    return pred;
  }

  async settleEvent(eventId: string, result: NonNullable<GameEvent["result"]>) {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) throw new Error("No such event");
    event.result = result; event.status = "settled";
    for (const pred of this.predictions.filter((p) => p.eventId === eventId && !p.settled)) {
      const pts = scorePrediction(event, pred);
      pred.pointsAwarded = pts; pred.settled = true;
      this.profiles.set(pred.userId, applyStreak(this.profile(pred.userId), pts));
    }
  }

  async leaderboard() { return [...this.profiles.values()].sort((a, b) => b.totalPoints - a.totalPoints); }
  async getProfile(userId: string) { return this.profiles.get(userId) ?? null; }

  async createGroup(ownerId: string, name: string) {
    const g: Group = { id: id("g"), name, inviteCode: Math.random().toString(36).slice(2, 8).toUpperCase(), ownerId };
    this.groups.push(g); return g;
  }
  async joinGroup(_userId: string, inviteCode: string) {
    const g = this.groups.find((x) => x.inviteCode === inviteCode);
    if (!g) throw new Error("Invalid invite code");
    return g;
  }
}
```

> Note: `Math.random` is fine in app runtime; it is NOT used in tests' assertions.

- [ ] **Step 5: Run, verify pass**

Run: `npm test` → PASS (all scoring + provider tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/data/provider.ts src/lib/data/mock.ts tests/mock-provider.test.ts
git commit -m "feat: add DataProvider interface and tested mock provider"
```

---

## Task 5: Mobile shell — BottomNav + session store

**Files:**
- Create: `src/store/useSession.ts`, `src/components/BottomNav.tsx`
- Modify: `src/lib/data/client.ts` (create)

- [ ] **Step 1: Create `src/store/useSession.ts`**

```ts
import { create } from "zustand";

interface SessionState {
  userId: string;
  displayName: string;
  setUser: (id: string, name: string) => void;
}

// MVP: a local demo identity until Supabase auth lands (Task 8).
export const useSession = create<SessionState>((set) => ({
  userId: "demo-user",
  displayName: "Demo Player",
  setUser: (userId, displayName) => set({ userId, displayName }),
}));
```

- [ ] **Step 2: Create `src/lib/data/client.ts`**

```ts
import { MockProvider } from "@/lib/data/mock";
import type { DataProvider } from "@/lib/data/provider";

// Single shared instance for the session. Swap to SupabaseProvider (Task 9)
// when NEXT_PUBLIC_SUPABASE_URL is set.
let instance: DataProvider | null = null;
export function getProvider(): DataProvider {
  if (!instance) instance = new MockProvider();
  return instance;
}
```

- [ ] **Step 3: Replace stub `src/components/BottomNav.tsx`**

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Predict" },
  { href: "/leaderboard", label: "Ranking" },
  { href: "/groups", label: "Groups" },
  { href: "/profile", label: "Profile" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 mx-auto max-w-md grid grid-cols-4 border-t bg-white">
      {tabs.map((t) => (
        <Link key={t.href} href={t.href}
          className={`py-3 text-center text-xs font-medium ${path === t.href ? "text-brand" : "text-gray-500"}`}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Typecheck & commit**

Run: `npm run typecheck` → PASS
```bash
git add -A && git commit -m "feat: add mobile bottom nav and session store"
```

---

## Task 6: Event feed + prediction flow

**Files:**
- Create: `src/components/EventCard.tsx`, `src/components/PredictionControls.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create `src/components/PredictionControls.tsx`**

```tsx
"use client";
import type { GameEvent, Outcome } from "@/lib/types";

const labels: Record<Outcome, (e: GameEvent) => string> = {
  home: (e) => e.home, draw: () => "Draw", away: (e) => e.away,
};

export function PredictionControls({
  event, choice, onPick, disabled,
}: { event: GameEvent; choice?: Outcome; onPick: (o: Outcome) => void; disabled?: boolean }) {
  const opts: Outcome[] = event.category === "football" ? ["home", "draw", "away"] : ["home", "away"];
  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {opts.map((o) => (
        <button key={o} disabled={disabled} onClick={() => onPick(o)}
          className={`rounded-lg border px-2 py-2 text-sm font-medium disabled:opacity-50
            ${choice === o ? "border-brand bg-brand text-white" : "border-gray-300 bg-white"}`}>
          {labels[o](event)}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/EventCard.tsx`**

```tsx
"use client";
import { useState } from "react";
import type { GameEvent, Outcome, Prediction } from "@/lib/types";
import { PredictionControls } from "./PredictionControls";

export function EventCard({
  event, existing, onSubmit,
}: { event: GameEvent; existing?: Prediction; onSubmit: (o: Outcome) => Promise<void> }) {
  const [choice, setChoice] = useState<Outcome | undefined>(existing?.choice);
  const [saving, setSaving] = useState(false);
  const locked = !!existing || event.status !== "scheduled";

  async function pick(o: Outcome) {
    if (locked || saving) return;
    setChoice(o); setSaving(true);
    try { await onSubmit(o); } finally { setSaving(false); }
  }

  return (
    <article className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">{event.category}</span>
        <time className="text-xs text-gray-400">{new Date(event.startTime).toLocaleString()}</time>
      </div>
      <h2 className="mt-2 text-base font-semibold">{event.title}</h2>
      <PredictionControls event={event} choice={choice} onPick={pick} disabled={locked} />
      {existing && <p className="mt-2 text-xs text-gray-500">Pick locked in ✓</p>}
    </article>
  );
}
```

- [ ] **Step 3: Replace `src/app/page.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import { EventCard } from "@/components/EventCard";
import type { GameEvent, Outcome, Prediction } from "@/lib/types";

export default function Home() {
  const { userId } = useSession();
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [preds, setPreds] = useState<Prediction[]>([]);
  const provider = getProvider();

  useEffect(() => {
    (async () => {
      setEvents(await provider.listEvents());
      setPreds(await provider.getPredictions(userId));
    })();
  }, [userId, provider]);

  async function submit(eventId: string, choice: Outcome) {
    await provider.submitPrediction(userId, eventId, choice);
    setPreds(await provider.getPredictions(userId));
  }

  return (
    <div className="space-y-3 p-4">
      <h1 className="text-2xl font-bold text-brand">Predict</h1>
      {events.map((e) => (
        <EventCard key={e.id} event={e}
          existing={preds.find((p) => p.eventId === e.id)}
          onSubmit={(o) => submit(e.id, o)} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run dev, verify manually**

Run: `npm run dev` → open http://localhost:3000 → see 3 events, tap a pick → "Pick locked in ✓".

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: event feed and prediction flow"
```

---

## Task 7: Leaderboard, Groups, Profile screens

**Files:**
- Create: `src/components/LeaderboardTable.tsx`, `src/app/leaderboard/page.tsx`, `src/app/groups/page.tsx`, `src/app/profile/page.tsx`

- [ ] **Step 1: Create `src/components/LeaderboardTable.tsx`**

```tsx
import type { Profile } from "@/lib/types";

export function LeaderboardTable({ rows }: { rows: Profile[] }) {
  if (rows.length === 0) return <p className="text-sm text-gray-500">No players yet. Make a prediction!</p>;
  return (
    <ol className="divide-y rounded-xl border bg-white">
      {rows.map((p, i) => (
        <li key={p.id} className="flex items-center justify-between px-4 py-3">
          <span className="flex items-center gap-3">
            <b className="w-5 text-gray-400">{i + 1}</b>{p.displayName}
          </span>
          <span className="font-semibold text-brand">{p.totalPoints} pts</span>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 2: Create `src/app/leaderboard/page.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { getProvider } from "@/lib/data/client";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import type { Profile } from "@/lib/types";

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Profile[]>([]);
  useEffect(() => { getProvider().leaderboard().then(setRows); }, []);
  return (
    <div className="space-y-3 p-4">
      <h1 className="text-2xl font-bold text-brand">Ranking</h1>
      <LeaderboardTable rows={rows} />
    </div>
  );
}
```

- [ ] **Step 3: Create `src/app/groups/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import type { Group } from "@/lib/types";

export default function GroupsPage() {
  const { userId } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const provider = getProvider();

  async function create() {
    if (!name) return;
    const g = await provider.createGroup(userId, name);
    setGroups((s) => [...s, g]); setName(""); setMsg(`Created ${g.name} — invite code ${g.inviteCode}`);
  }
  async function join() {
    try { const g = await provider.joinGroup(userId, code.toUpperCase()); setGroups((s) => [...s, g]); setMsg(`Joined ${g.name}`); }
    catch (e) { setMsg((e as Error).message); }
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold text-brand">Groups</h1>
      <div className="space-y-2 rounded-xl border bg-white p-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New league name"
          className="w-full rounded border px-3 py-2" />
        <button onClick={create} className="w-full rounded bg-brand py-2 text-white">Create league</button>
      </div>
      <div className="space-y-2 rounded-xl border bg-white p-4">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Invite code"
          className="w-full rounded border px-3 py-2" />
        <button onClick={join} className="w-full rounded border border-brand py-2 text-brand">Join league</button>
      </div>
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
      <ul className="space-y-1">{groups.map((g) => <li key={g.id} className="rounded bg-white px-3 py-2 text-sm">{g.name} — <b>{g.inviteCode}</b></li>)}</ul>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/app/profile/page.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import type { Profile } from "@/lib/types";

export default function ProfilePage() {
  const { userId, displayName } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => { getProvider().getProfile(userId).then(setProfile); }, [userId]);

  const stat = (label: string, value: number | string) => (
    <div className="rounded-xl border bg-white p-4 text-center">
      <div className="text-2xl font-bold text-brand">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold text-brand">{displayName}</h1>
      <div className="grid grid-cols-3 gap-2">
        {stat("Points", profile?.totalPoints ?? 0)}
        {stat("Streak", profile?.currentStreak ?? 0)}
        {stat("Best", profile?.bestStreak ?? 0)}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify & commit**

Run: `npm run dev` → navigate all four tabs. Make a prediction, then (temporarily) call settle via a dev button is not needed — leaderboard reflects after Task 10 admin settle. For now verify pages render.
Run: `npm run typecheck` → PASS
```bash
git add -A && git commit -m "feat: leaderboard, groups, and profile screens"
```

---

## Task 8: PWA manifest + icons

**Files:**
- Create: `public/manifest.webmanifest`, `public/icon-192.png`, `public/icon-512.png` (placeholder solid-color PNGs)

- [ ] **Step 1: Create `public/manifest.webmanifest`**

```json
{
  "name": "MPP+ — The Social Predictor",
  "short_name": "MPP+",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#5A0FC8",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: Generate placeholder icons**

Run (Node, no extra deps — writes a 1x1 purple PNG scaled by the browser; replace later with real art):
```bash
node -e "const fs=require('fs');const b=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==','base64');fs.writeFileSync('public/icon-192.png',b);fs.writeFileSync('public/icon-512.png',b);"
```

- [ ] **Step 3: Verify & commit**

Run: `npm run build` → PASS (manifest linked from layout metadata).
```bash
git add -A && git commit -m "feat: add PWA manifest and placeholder icons"
```

---

## Task 9: Supabase schema + RLS

**Files:**
- Create: `supabase/schema.sql`, `supabase/seed.sql`

- [ ] **Step 1: Write `supabase/schema.sql`**

```sql
-- Profiles mirror auth.users
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null,
  total_points int not null default 0,
  current_streak int not null default 0,
  best_streak int not null default 0
);

create table categories (
  slug text primary key,
  name text not null,
  enabled boolean not null default true
);

create table events (
  id uuid primary key default gen_random_uuid(),
  external_id text not null,
  category text not null references categories(slug),
  title text not null,
  home text not null,
  away text not null,
  start_time timestamptz not null,
  lock_time timestamptz not null,
  status text not null default 'scheduled',
  result text,
  settled_at timestamptz,
  unique (category, external_id)
);

create table predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  choice text not null,
  points_awarded int not null default 0,
  settled boolean not null default false,
  unique (user_id, event_id)
);

create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  owner_id uuid not null references profiles(id)
);

create table group_members (
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text not null default 'member',
  primary key (group_id, user_id)
);

-- RLS
alter table profiles enable row level security;
alter table predictions enable row level security;
alter table events enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;

create policy "profiles readable" on profiles for select using (true);
create policy "own profile update" on profiles for update using (auth.uid() = id);
create policy "events readable" on events for select using (true);

-- Predictions: a user manages only their own, and ONLY before lock_time.
create policy "own predictions read" on predictions for select using (auth.uid() = user_id);
create policy "insert before lock" on predictions for insert
  with check (
    auth.uid() = user_id
    and (select lock_time from events e where e.id = event_id) > now()
  );
```

- [ ] **Step 2: Write `supabase/seed.sql`**

```sql
insert into categories (slug, name) values
  ('football','Football'), ('esports','Esports'),
  ('basketball','Basketball'), ('tennis','Tennis')
on conflict do nothing;
```

- [ ] **Step 3: Commit**

```bash
git add supabase/ && git commit -m "feat: add Supabase schema, RLS policies, and seed"
```

> Note: applying this requires a Supabase project (`supabase db push` or paste in SQL editor). The app runs on the mock provider until `NEXT_PUBLIC_SUPABASE_URL` is set.

---

## Task 10: Category adapters (football, esports, sports)

**Files:**
- Create: `src/lib/adapters/adapter.ts`, `src/lib/adapters/football.ts`, `src/lib/adapters/esports.ts`, `src/lib/adapters/sports.ts`, `tests/adapters.test.ts`

- [ ] **Step 1: Write `src/lib/adapters/adapter.ts`**

```ts
import type { GameEvent, Outcome } from "@/lib/types";

export interface CategoryAdapter {
  slug: GameEvent["category"];
  fetchUpcoming(): Promise<GameEvent[]>;
  fetchResult(event: GameEvent): Promise<Outcome | null>;
}

/** Map a home/away score into an Outcome. Pure, shared by adapters. */
export function outcomeFromScore(homeScore: number, awayScore: number): Outcome {
  if (homeScore > awayScore) return "home";
  if (homeScore < awayScore) return "away";
  return "draw";
}
```

- [ ] **Step 2: Write failing test `tests/adapters.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { outcomeFromScore } from "@/lib/adapters/adapter";

describe("outcomeFromScore", () => {
  it("home win", () => expect(outcomeFromScore(2, 1)).toBe("home"));
  it("away win", () => expect(outcomeFromScore(0, 3)).toBe("away"));
  it("draw", () => expect(outcomeFromScore(1, 1)).toBe("draw"));
});
```

- [ ] **Step 3: Run, verify fail**

Run: `npm test` → FAIL (module not found).

- [ ] **Step 4: Implement adapters**

`src/lib/adapters/football.ts`:
```ts
import type { CategoryAdapter } from "./adapter";
import { outcomeFromScore } from "./adapter";
import type { GameEvent, Outcome } from "@/lib/types";

const API = "https://api.football-data.org/v4";

export const footballAdapter: CategoryAdapter = {
  slug: "football",
  async fetchUpcoming(): Promise<GameEvent[]> {
    const key = process.env.FOOTBALL_DATA_API_KEY;
    if (!key) return [];
    const res = await fetch(`${API}/matches?status=SCHEDULED`, { headers: { "X-Auth-Token": key } });
    if (!res.ok) return [];
    const data = (await res.json()) as { matches: any[] };
    return data.matches.map((m) => ({
      id: `football_${m.id}`, externalId: String(m.id), category: "football",
      title: `${m.homeTeam.shortName} vs ${m.awayTeam.shortName}`,
      home: m.homeTeam.shortName, away: m.awayTeam.shortName,
      startTime: m.utcDate, lockTime: m.utcDate, status: "scheduled", result: null,
    }));
  },
  async fetchResult(event: GameEvent): Promise<Outcome | null> {
    const key = process.env.FOOTBALL_DATA_API_KEY;
    if (!key) return null;
    const res = await fetch(`${API}/matches/${event.externalId}`, { headers: { "X-Auth-Token": key } });
    if (!res.ok) return null;
    const m = (await res.json()) as any;
    if (m.status !== "FINISHED") return null;
    return outcomeFromScore(m.score.fullTime.home, m.score.fullTime.away);
  },
};
```

`src/lib/adapters/esports.ts`:
```ts
import type { CategoryAdapter } from "./adapter";
import { outcomeFromScore } from "./adapter";
import type { GameEvent, Outcome } from "@/lib/types";

const API = "https://api.pandascore.co";

export const esportsAdapter: CategoryAdapter = {
  slug: "esports",
  async fetchUpcoming(): Promise<GameEvent[]> {
    const key = process.env.PANDASCORE_API_KEY;
    if (!key) return [];
    const res = await fetch(`${API}/matches/upcoming?per_page=20`, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) return [];
    const data = (await res.json()) as any[];
    return data
      .filter((m) => m.opponents?.length === 2)
      .map((m) => ({
        id: `esports_${m.id}`, externalId: String(m.id), category: "esports",
        title: m.name, home: m.opponents[0].opponent.name, away: m.opponents[1].opponent.name,
        startTime: m.begin_at, lockTime: m.begin_at, status: "scheduled", result: null,
      }));
  },
  async fetchResult(event: GameEvent): Promise<Outcome | null> {
    const key = process.env.PANDASCORE_API_KEY;
    if (!key) return null;
    const res = await fetch(`${API}/matches/${event.externalId}`, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) return null;
    const m = (await res.json()) as any;
    if (m.status !== "finished" || m.results?.length !== 2) return null;
    return outcomeFromScore(m.results[0].score, m.results[1].score);
  },
};
```

`src/lib/adapters/sports.ts`:
```ts
import type { CategoryAdapter } from "./adapter";
import { outcomeFromScore } from "./adapter";
import type { GameEvent, Outcome } from "@/lib/types";

const KEY = process.env.THESPORTSDB_API_KEY ?? "3";
const API = `https://www.thesportsdb.com/api/v1/json/${KEY}`;

// Basketball (NBA, league id 4387) as the "other sports" example.
export const sportsAdapter: CategoryAdapter = {
  slug: "basketball",
  async fetchUpcoming(): Promise<GameEvent[]> {
    const res = await fetch(`${API}/eventsnextleague.php?id=4387`);
    if (!res.ok) return [];
    const data = (await res.json()) as { events: any[] | null };
    return (data.events ?? []).map((e) => ({
      id: `basketball_${e.idEvent}`, externalId: String(e.idEvent), category: "basketball",
      title: e.strEvent, home: e.strHomeTeam, away: e.strAwayTeam,
      startTime: `${e.dateEvent}T${e.strTime ?? "00:00:00"}Z`,
      lockTime: `${e.dateEvent}T${e.strTime ?? "00:00:00"}Z`, status: "scheduled", result: null,
    }));
  },
  async fetchResult(event: GameEvent): Promise<Outcome | null> {
    const res = await fetch(`${API}/lookupevent.php?id=${event.externalId}`);
    if (!res.ok) return null;
    const e = ((await res.json()) as { events: any[] }).events?.[0];
    if (!e || e.intHomeScore == null || e.intAwayScore == null) return null;
    return outcomeFromScore(Number(e.intHomeScore), Number(e.intAwayScore));
  },
};
```

- [ ] **Step 5: Run, verify pass**

Run: `npm test` → PASS (scoring + provider + adapters).

- [ ] **Step 6: Commit**

```bash
git add src/lib/adapters tests/adapters.test.ts
git commit -m "feat: add football, esports, and sports category adapters"
```

---

## Task 11: README + CI flip to real run

**Files:**
- Modify: `README.md` (mark roadmap items done), `.github/workflows/ci.yml` (drop the skip guards now that `package.json` exists)

- [ ] **Step 1: Simplify CI `build` job steps**

Replace the guarded steps with direct calls:
```yaml
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
```

- [ ] **Step 2: Check off completed roadmap items in `README.md`.**

- [ ] **Step 3: Verify full local pipeline**

Run: `npm run lint && npm run typecheck && npm test && npm run build` → all PASS.

- [ ] **Step 4: Commit & push**

```bash
git add -A && git commit -m "ci: run real pipeline; update roadmap"
git push
```

---

## Self-Review Notes

- **Spec coverage:** auth onboarding (full Supabase auth) is intentionally staged — Task 5 ships a local demo identity; the schema/RLS (Task 9) and a `SupabaseProvider` are the documented next increment after MVP screens work end-to-end on the mock provider. This keeps every task runnable. Money/chat/push remain out of scope per spec.
- **Type consistency:** `GameEvent`, `Outcome`, `Prediction`, `Profile`, `Group`, `DataProvider`, `CategoryAdapter` names are used identically across all tasks.
- **No placeholders:** every code step contains complete code.
- **Settlement in production** (cron edge function) reuses `scorePrediction`/`applyStreak` + adapter `fetchResult`; wiring it to Supabase is the post-MVP increment noted in ARCHITECTURE.md.
