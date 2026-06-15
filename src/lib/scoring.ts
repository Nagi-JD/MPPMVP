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
