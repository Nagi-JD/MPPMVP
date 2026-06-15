import { describe, it, expect, beforeEach } from "vitest";
import { MockProvider } from "@/lib/data/mock";

let p: MockProvider;
beforeEach(() => {
  p = new MockProvider();
});

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
