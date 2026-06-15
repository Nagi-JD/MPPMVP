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
    expect(scoreMarket(m, "A,X,C")).toBe(2 * 2 * 5);
  });
});

describe("rankTier", () => {
  it("is Rookie below 5 settled", () => { expect(rankTier(1, 4)).toBe("Rookie"); });
  it("is Diamond at 80%+ with volume", () => { expect(rankTier(0.85, 10)).toBe("Diamond"); });
});
