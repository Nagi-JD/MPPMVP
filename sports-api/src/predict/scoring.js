// Pure scoring logic for the prediction model. No I/O.

/**
 * Compute points awarded for a single prediction.
 * @param {object} market  - Market with { kind/input, difficulty, result }
 * @param {string} value   - The user's submitted value.
 * @param {string|null} result - The settled result (market.result).
 * @returns {number} pointsAwarded
 */
export function scorePrediction({ input, difficulty, result }, value) {
  if (result == null || value == null) return 0;
  const diff = Number(difficulty) || 1;

  if (input === "podium") {
    // values are comma-joined "a,b,c"; score = hits-in-correct-position * difficulty * 5
    const guessed = String(value).split(",").map((s) => s.trim());
    const actual = String(result).split(",").map((s) => s.trim());
    let hits = 0;
    for (let i = 0; i < actual.length; i++) {
      if (guessed[i] != null && guessed[i] === actual[i]) hits++;
    }
    return hits * diff * 5;
  }

  // choice / score: exact match
  return String(value) === String(result) ? diff * 10 : 0;
}

export function isCorrect(points) {
  return points > 0;
}

/**
 * accuracy = correct/settled, 0 if settled === 0.
 */
export function accuracy(correct, settled) {
  if (!settled || settled <= 0) return 0;
  return correct / settled;
}

// Rank barème — config table (mirror of mobile src/lib/scoring.ts), highest
// accuracy first. Keep these two tables in sync.
//   0-10% Bronze · 10-20% Argent · 20-30% Or · 30-50% Platine · 50-70% Diamant · 70-100% Légende
export const MIN_SETTLED_FOR_RANK = 5;

export const RANK_THRESHOLDS = [
  { tier: "Legend", minAccuracy: 0.7 },
  { tier: "Diamond", minAccuracy: 0.5 },
  { tier: "Platinum", minAccuracy: 0.3 },
  { tier: "Gold", minAccuracy: 0.2 },
  { tier: "Silver", minAccuracy: 0.1 },
  { tier: "Bronze", minAccuracy: 0.0 },
];

/**
 * tier(acc, settled): "Rookie" until MIN_SETTLED_FOR_RANK settled predictions,
 * then the highest tier whose minAccuracy is met (see RANK_THRESHOLDS).
 */
export function tier(acc, settled) {
  if (settled < MIN_SETTLED_FOR_RANK) return "Rookie";
  for (const t of RANK_THRESHOLDS) {
    if (acc >= t.minAccuracy) return t.tier;
  }
  return "Bronze";
}
