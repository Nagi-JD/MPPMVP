import type { Market, RankTier } from "@/lib/types";

const CHOICE_UNIT = 10;
const PODIUM_UNIT = 5;

export function parsePodium(value: string): string[] {
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

export function scoreMarket(market: Market, value: string): number {
  if (!market.result) return 0;
  if (market.input === "podium") {
    const got = parsePodium(value);
    const want = parsePodium(market.result);
    let hits = 0;
    for (let i = 0; i < want.length; i++) if (got[i] && got[i] === want[i]) hits++;
    return hits * market.difficulty * PODIUM_UNIT;
  }
  return value === market.result ? market.difficulty * CHOICE_UNIT : 0;
}

export function isCorrect(market: Market, value: string): boolean {
  return scoreMarket(market, value) > 0;
}

export function accuracy(correct: number, settled: number): number {
  return settled === 0 ? 0 : correct / settled;
}

export function rankTier(acc: number, settled: number): RankTier {
  if (settled < 5) return "Rookie";
  if (acc >= 0.8) return "Diamond";
  if (acc >= 0.65) return "Platinum";
  if (acc >= 0.5) return "Gold";
  if (acc >= 0.35) return "Silver";
  return "Bronze";
}
