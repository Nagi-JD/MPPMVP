import { describe, it, expect } from "vitest";
import { outcomeFromScore } from "@/lib/adapters/adapter";

describe("outcomeFromScore", () => {
  it("home win", () => expect(outcomeFromScore(2, 1)).toBe("home"));
  it("away win", () => expect(outcomeFromScore(0, 3)).toBe("away"));
  it("draw", () => expect(outcomeFromScore(1, 1)).toBe("draw"));
});
