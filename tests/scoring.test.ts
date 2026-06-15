import { describe, it, expect } from "vitest";
import { scoreMarket, isCorrect, accuracy, rankTier, parsePodium } from "@/lib/scoring";
import type { Market } from "@/lib/types";

const market = (over: Partial<Market>): Market => ({
  id: "m", fixtureId: "f", leagueId: "l", kind: "match_winner", label: "x",
  input: "choice", difficulty: 1, lockTime: "", status: "settled", result: null, ...over,
});

describe("scoreMarket", () => {
  it("choice: difficulty × 10 when correct", () => {
    expect(scoreMarket(market({ input: "choice", difficulty: 1, result: "A" }), "A")).toBe(10);
    expect(scoreMarket(market({ input: "choice", difficulty: 3, result: "A" }), "A")).toBe(30);
  });
  it("choice: 0 when wrong or unsettled", () => {
    expect(scoreMarket(market({ result: "A" }), "B")).toBe(0);
    expect(scoreMarket(market({ result: null }), "A")).toBe(0);
  });
  it("score: exact match only", () => {
    const m = market({ input: "score", difficulty: 3, result: "110-108" });
    expect(scoreMarket(m, "110-108")).toBe(30);
    expect(scoreMarket(m, "110-109")).toBe(0);
  });
  it("podium: difficulty × 5 per correctly-placed entry", () => {
    const m = market({ input: "podium", difficulty: 2, result: "Verstappen,Norris,Leclerc" });
    expect(scoreMarket(m, "Verstappen,Norris,Leclerc")).toBe(30); // 3 × 2 × 5
    expect(scoreMarket(m, "Verstappen,Leclerc,Norris")).toBe(10); // only P1 right
    expect(scoreMarket(m, "Norris,Verstappen,Piastri")).toBe(0);
  });
});

describe("isCorrect", () => {
  it("true when any points scored", () => {
    const m = market({ input: "podium", difficulty: 2, result: "A,B,C" });
    expect(isCorrect(m, "A,X,Y")).toBe(true);
    expect(isCorrect(m, "Z,X,Y")).toBe(false);
  });
});

describe("accuracy & rankTier", () => {
  it("accuracy is correct/settled, 0 when none", () => {
    expect(accuracy(3, 4)).toBe(0.75);
    expect(accuracy(0, 0)).toBe(0);
  });
  it("rank requires volume then rewards accuracy", () => {
    expect(rankTier(1, 3)).toBe("Rookie"); // too few resolved
    expect(rankTier(0.85, 10)).toBe("Diamond");
    expect(rankTier(0.66, 10)).toBe("Platinum");
    expect(rankTier(0.5, 10)).toBe("Gold");
    expect(rankTier(0.4, 10)).toBe("Silver");
    expect(rankTier(0.1, 10)).toBe("Bronze");
  });
});

describe("parsePodium", () => {
  it("splits and trims", () => {
    expect(parsePodium("A, B ,C")).toEqual(["A", "B", "C"]);
  });
});
