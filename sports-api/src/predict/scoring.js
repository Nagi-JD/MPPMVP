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

/**
 * tier(acc, settled):
 *   settled<5 -> Rookie
 *   acc>=.8 Diamond; >=.65 Platinum; >=.5 Gold; >=.35 Silver; else Bronze
 */
export function tier(acc, settled) {
  if (settled < 5) return "Rookie";
  if (acc >= 0.8) return "Diamond";
  if (acc >= 0.65) return "Platinum";
  if (acc >= 0.5) return "Gold";
  if (acc >= 0.35) return "Silver";
  return "Bronze";
}
