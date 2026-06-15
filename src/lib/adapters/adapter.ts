import type { GameEvent, Outcome } from "@/lib/types";

export interface CategoryAdapter {
  slug: GameEvent["category"];
  fetchUpcoming(): Promise<GameEvent[]>;
  fetchResult(event: GameEvent): Promise<Outcome | null>;
}

/** Map a home/away score into an Outcome. Pure, shared by adapters. */
export function outcomeFromScore(homeScore: number, awayScore: number): Outcome {
  if (homeScore > awayScore) return "home";
  if (homeScore < awayScore) return "away";
  return "draw";
}
