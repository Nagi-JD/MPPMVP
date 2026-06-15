// Settlement + stats: resolve stored predictions against current market state.

import * as store from "./store.js";
import { getMarketsIndex, leagueIdFromMarketId } from "./markets.js";
import { listLeagues } from "./leagues.js";
import { scorePrediction, isCorrect, accuracy, tier } from "./scoring.js";

/**
 * Resolve a single raw prediction record against a market.
 * Returns Prediction shape: { id, userId, marketId, value, pointsAwarded, settled, correct }
 */
export function resolvePrediction(record, market) {
  // Settled when the market is settled AND a result exists.
  const hasResult = market && market.status === "settled" && market.result != null;
  if (!hasResult) {
    return {
      id: record.id,
      userId: record.userId,
      marketId: record.marketId,
      value: record.value,
      pointsAwarded: 0,
      settled: false,
      correct: false,
    };
  }
  const points = scorePrediction(market, record.value);
  return {
    id: record.id,
    userId: record.userId,
    marketId: record.marketId,
    value: record.value,
    pointsAwarded: points,
    settled: true,
    correct: isCorrect(points),
  };
}

/**
 * Build a market index covering all leagues referenced by the given records.
 * Returns Map(marketId -> market).
 */
async function buildIndexForRecords(records) {
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
      // upstream failure for one league shouldn't kill the whole resolve
    }
  }
  return index;
}

/**
 * Resolved predictions for a user across all their markets.
 */
export async function getPredictions(userId) {
  const records = await store.getByUser(userId);
  const index = await buildIndexForRecords(records);
  return records.map((r) => resolvePrediction(r, index.get(r.marketId)));
}

/**
 * SeasonStats for a user in a league.
 * { leagueId, points, made, settled, correct, accuracy, tier }
 */
export async function seasonStats(userId, leagueId) {
  const records = (await store.getByUser(userId)).filter(
    (r) => leagueIdFromMarketId(r.marketId) === leagueId
  );
  let index;
  try {
    index = await getMarketsIndex(leagueId);
  } catch {
    index = new Map();
  }

  let points = 0;
  let settled = 0;
  let correct = 0;
  const made = records.length;
  for (const r of records) {
    const resolved = resolvePrediction(r, index.get(r.marketId));
    points += resolved.pointsAwarded;
    if (resolved.settled) {
      settled++;
      if (resolved.correct) correct++;
    }
  }
  const acc = accuracy(correct, settled);
  return {
    leagueId,
    points,
    made,
    settled,
    correct,
    accuracy: acc,
    tier: tier(acc, settled),
  };
}

/**
 * Leaderboard for a league: aggregate per userId across that league's markets.
 * Real users only (no bots). displayName = userId for now.
 */
export async function leaderboard(leagueId) {
  const all = await store.loadAll();
  const records = all.filter((r) => leagueIdFromMarketId(r.marketId) === leagueId);
  let index;
  try {
    index = await getMarketsIndex(leagueId);
  } catch {
    index = new Map();
  }

  const byUser = new Map(); // userId -> { points, made, settled, correct }
  for (const r of records) {
    const resolved = resolvePrediction(r, index.get(r.marketId));
    const agg = byUser.get(r.userId) || { points: 0, made: 0, settled: 0, correct: 0 };
    agg.points += resolved.pointsAwarded;
    agg.made++;
    if (resolved.settled) {
      agg.settled++;
      if (resolved.correct) agg.correct++;
    }
    byUser.set(r.userId, agg);
  }

  const rows = [];
  for (const [userId, agg] of byUser.entries()) {
    const acc = accuracy(agg.correct, agg.settled);
    rows.push({
      user: { id: userId, displayName: userId, totalPoints: agg.points },
      points: agg.points,
      made: agg.made,
      accuracy: acc,
      tier: tier(acc, agg.settled),
    });
  }
  rows.sort((a, b) => b.points - a.points);
  return rows;
}

/**
 * Profile: totalPoints summed across ALL leagues for a user.
 * { id, displayName, totalPoints }
 */
export async function profile(userId) {
  let total = 0;
  for (const l of listLeagues()) {
    const stats = await seasonStats(userId, l.id);
    total += stats.points;
  }
  return { id: userId, displayName: userId, totalPoints: total };
}
