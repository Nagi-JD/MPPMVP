// Settlement → push-notification dispatcher.
//
// Predictions settle lazily (resolved on read), so there's no single
// "settlement event". This periodic job scans all stored predictions, finds
// the ones that have become settled/correct since last run, and calls the
// Supabase `send-push` Edge Function (which checks the user's prefs + tokens
// and sends via Expo). It also detects per-league rank-ups and win streaks.
//
// State is persisted to .data/notifications-sent.json so nothing is sent twice.
// All network calls are best-effort: if Supabase/the function is unreachable,
// the job logs and moves on (e.g. before you've deployed send-push).

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as store from "./store.js";
import { getMarketsIndex, leagueIdFromMarketId } from "./markets.js";
import { resolvePrediction } from "./settle.js";
import { accuracy, tier as tierOf } from "./scoring.js";
import { listLeagues } from "./leagues.js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.resolve(__dirname, "../../.data/notifications-sent.json");

const TIER_ORDER = { Rookie: 0, Bronze: 1, Silver: 2, Gold: 3, Platinum: 4, Diamond: 5, Legend: 6 };

async function loadState() {
  try {
    const txt = await fs.readFile(STATE_FILE, "utf8");
    const s = JSON.parse(txt);
    return { results: s.results ?? [], tiers: s.tiers ?? {}, streaks: s.streaks ?? {} };
  } catch {
    return { results: [], tiers: {}, streaks: {} };
  }
}

async function saveState(state) {
  try {
    await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch {
    /* ignore persistence errors */
  }
}

async function callSendPush(userId, type, params) {
  if (!SUPABASE_URL) return;
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ userId, type, params }),
    });
  } catch (e) {
    console.warn(`[notify] send-push failed (${type}) for ${userId}: ${e.message}`);
  }
}

async function buildIndex(records) {
  const leagueIds = new Set();
  for (const r of records) {
    const lid = leagueIdFromMarketId(r.marketId);
    if (lid) leagueIds.add(lid);
  }
  const index = new Map();
  for (const lid of leagueIds) {
    try {
      const li = await getMarketsIndex(lid);
      for (const [k, v] of li.entries()) index.set(k, v);
    } catch {
      /* one league's upstream failure shouldn't kill the run */
    }
  }
  return index;
}

/**
 * Scan all predictions and fire result / rank-up / streak pushes for anything
 * newly settled since the last run. Idempotent via the state file.
 */
export async function runSettlementNotifications() {
  if (!SUPABASE_URL) return; // not configured — nothing to do
  const state = await loadState();
  const sent = new Set(state.results);

  const all = await store.loadAll();
  if (all.length === 0) return;
  const index = await buildIndex(all);

  const sportByLeague = new Map(listLeagues().map((l) => [l.id, l.sport]));
  const perUserLeague = new Map(); // `${user}:${league}` -> {points,settled,correct}
  const perUserSettled = new Map(); // user -> [{correct, createdAt}]

  for (const rec of all) {
    const market = index.get(rec.marketId);
    const resolved = resolvePrediction(rec, market);
    const leagueId = leagueIdFromMarketId(rec.marketId);

    // 1) Result notification — newly settled & correct, not yet sent.
    if (resolved.settled && resolved.correct && resolved.pointsAwarded > 0 && !sent.has(resolved.id)) {
      await callSendPush(resolved.userId, "result", { points: resolved.pointsAwarded });
      sent.add(resolved.id);
    }

    // aggregate for rank-up
    if (leagueId) {
      const key = `${rec.userId}:${leagueId}`;
      const agg = perUserLeague.get(key) || { points: 0, settled: 0, correct: 0, leagueId, userId: rec.userId };
      agg.points += resolved.pointsAwarded;
      if (resolved.settled) {
        agg.settled++;
        if (resolved.correct) agg.correct++;
      }
      perUserLeague.set(key, agg);
    }

    // collect for streak (only settled, ordered later by createdAt)
    if (resolved.settled) {
      const list = perUserSettled.get(rec.userId) || [];
      list.push({ correct: resolved.correct, createdAt: rec.createdAt || "" });
      perUserSettled.set(rec.userId, list);
    }
  }

  // 2) Rank-up notifications (per user per league).
  for (const [key, agg] of perUserLeague.entries()) {
    if (agg.settled < 5) continue;
    const acc = accuracy(agg.correct, agg.settled);
    const newTier = tierOf(acc, agg.settled);
    const prevTier = state.tiers[key];
    if (prevTier && (TIER_ORDER[newTier] ?? 0) > (TIER_ORDER[prevTier] ?? 0)) {
      const sport = sportByLeague.get(agg.leagueId) || "";
      await callSendPush(agg.userId, "rank_up", { tier: newTier, sport });
    }
    state.tiers[key] = newTier;
  }

  // 3) Streak notifications (crossing a multiple of 5).
  for (const [userId, list] of perUserSettled.entries()) {
    list.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
    let streak = 0;
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].correct) streak++;
      else break;
    }
    const prev = state.streaks[userId] || 0;
    if (streak >= 5 && Math.floor(streak / 5) > Math.floor(prev / 5)) {
      await callSendPush(userId, "streak", { count: streak });
    }
    state.streaks[userId] = streak;
  }

  state.results = Array.from(sent);
  await saveState(state);
}

let timer = null;

/** Start the periodic settlement-notification cron. No-op if Supabase isn't configured. */
export function startNotifyCron(intervalMs) {
  if (!SUPABASE_URL) {
    console.log("[notify] SUPABASE_URL not set — settlement notifications disabled.");
    return;
  }
  const run = () => runSettlementNotifications().catch((e) => console.warn(`[notify] run error: ${e.message}`));
  // First pass shortly after boot, then on an interval.
  setTimeout(run, 10_000);
  timer = setInterval(run, intervalMs);
  if (timer.unref) timer.unref();
  console.log(`[notify] settlement-notification cron started (every ${Math.round(intervalMs / 1000)}s).`);
}
