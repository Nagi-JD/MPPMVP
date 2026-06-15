import { describe, it, expect, beforeEach } from "vitest";
import { MockProvider } from "@/lib/data/mock";

let p: MockProvider;
beforeEach(() => {
  p = new MockProvider();
});

async function firstOpenMarket(leagueId: string) {
  const board = await p.getBoard(leagueId);
  for (const b of board) {
    for (const m of b.markets) if (m.status === "scheduled") return m;
  }
  throw new Error("no open market");
}

describe("MockProvider", () => {
  it("seeds the four leagues", async () => {
    const ids = (await p.listLeagues()).map((l) => l.id);
    expect(ids).toEqual(["nba-2026", "euroleague-2026", "lnb-2026", "f1-2026"]);
  });

  it("returns boards with markets for a league", async () => {
    const board = await p.getBoard("nba-2026");
    expect(board.length).toBeGreaterThan(0);
    expect(board[0].markets.length).toBeGreaterThan(0);
  });

  it("records and updates a prediction before lock", async () => {
    const m = await firstOpenMarket("nba-2026");
    const choice = m.options?.[0] ?? "118-110";
    await p.submitPrediction("u1", m.id, choice);
    expect((await p.getPredictions("u1")).length).toBe(1);
    // updating the same market does not create a duplicate
    const choice2 = m.options?.[1] ?? "100-99";
    await p.submitPrediction("u1", m.id, choice2);
    const preds = await p.getPredictions("u1");
    expect(preds.length).toBe(1);
    expect(preds[0].value).toBe(choice2);
  });

  it("awards points on settle and reflects in season stats", async () => {
    const m = await firstOpenMarket("nba-2026");
    const value = m.options?.[0] ?? "100-99";
    await p.submitPrediction("u1", m.id, value);
    await p.settleMarket(m.id, value); // settle with the user's exact pick
    const stats = await p.seasonStats("u1", "nba-2026");
    expect(stats.points).toBeGreaterThan(0);
    expect(stats.correct).toBe(1);
  });

  it("rejects predictions on a locked/settled market", async () => {
    const board = await p.getBoard("f1-2026");
    const settled = board.flatMap((b) => b.markets).find((m) => m.status === "settled");
    expect(settled).toBeDefined();
    await expect(p.submitPrediction("u1", settled!.id, "Verstappen,Norris,Leclerc")).rejects.toThrow();
  });

  it("leaderboard is populated by seeded rivals", async () => {
    const rows = await p.leaderboard("nba-2026");
    expect(rows.length).toBeGreaterThan(0);
    // sorted by points desc
    for (let i = 1; i < rows.length; i++) expect(rows[i - 1].points).toBeGreaterThanOrEqual(rows[i].points);
  });
});
