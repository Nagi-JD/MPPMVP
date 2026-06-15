import { timeUntil } from "@/lib/time";

describe("timeUntil", () => {
  const now = 1_000_000_000_000;
  it("returns Locked for past timestamps", () => {
    expect(timeUntil(new Date(now - 1000).toISOString(), now)).toBe("Locked");
  });
  it("formats hours and minutes", () => {
    expect(timeUntil(new Date(now + (2 * 60 + 5) * 60000).toISOString(), now)).toBe("in 2h 5m");
  });
  it("formats days and hours", () => {
    expect(timeUntil(new Date(now + (26 * 60) * 60000).toISOString(), now)).toBe("in 1d 2h");
  });
});
