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
