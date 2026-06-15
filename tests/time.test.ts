import { describe, it, expect } from "vitest";
import { timeUntil } from "@/lib/time";

const NOW = 1_000_000_000_000;
const at = (mins: number) => new Date(NOW + mins * 60_000).toISOString();

describe("timeUntil", () => {
  it("returns Locked at or past the timestamp", () => {
    expect(timeUntil(at(0), NOW)).toBe("Locked");
    expect(timeUntil(at(-5), NOW)).toBe("Locked");
  });
  it("formats minutes only under an hour", () => {
    expect(timeUntil(at(45), NOW)).toBe("in 45m");
  });
  it("formats hours and minutes", () => {
    expect(timeUntil(at(130), NOW)).toBe("in 2h 10m");
  });
  it("formats days and hours past a day", () => {
    expect(timeUntil(at(1500), NOW)).toBe("in 1d 1h");
  });
});
