import type { MarketInput, MarketKind, Sport, RankTier } from "@/lib/types";
import { COLORS } from "@/theme/tokens";

export interface MarketMeta {
  label: string; short: string; input: MarketInput; difficulty: 1 | 2 | 3;
  scope: "match" | "weekend" | "season"; sport: "basketball" | "f1";
}

export const MARKET_META: Record<MarketKind, MarketMeta> = {
  match_winner: { label: "Match winner", short: "Winner", input: "choice", difficulty: 1, scope: "match", sport: "basketball" },
  exact_score: { label: "Exact final score", short: "Score", input: "score", difficulty: 3, scope: "match", sport: "basketball" },
  top_scorer: { label: "Top scorer", short: "Top scorer", input: "choice", difficulty: 2, scope: "match", sport: "basketball" },
  season_champion: { label: "Season champion", short: "Champion", input: "choice", difficulty: 3, scope: "season", sport: "basketball" },
  quali_podium: { label: "Qualifying podium", short: "Quali", input: "podium", difficulty: 2, scope: "weekend", sport: "f1" },
  sprint_podium: { label: "Sprint podium", short: "Sprint", input: "podium", difficulty: 2, scope: "weekend", sport: "f1" },
  race_podium: { label: "Race podium", short: "Podium", input: "podium", difficulty: 2, scope: "weekend", sport: "f1" },
  fastest_lap: { label: "Fastest lap", short: "Fastest lap", input: "choice", difficulty: 2, scope: "weekend", sport: "f1" },
  top_speed: { label: "Top speed", short: "Top speed", input: "choice", difficulty: 1, scope: "weekend", sport: "f1" },
  best_sectors: { label: "Best sectors", short: "Sectors", input: "choice", difficulty: 1, scope: "weekend", sport: "f1" },
  driver_champion: { label: "Drivers' champion", short: "Driver title", input: "choice", difficulty: 3, scope: "season", sport: "f1" },
  constructor_champion: { label: "Constructors' champion", short: "Constructor title", input: "choice", difficulty: 3, scope: "season", sport: "f1" },
};

export const F1_DRIVERS = ["Verstappen", "Norris", "Leclerc", "Piastri", "Russell", "Hamilton", "Sainz", "Alonso"];
export const F1_CONSTRUCTORS = ["Red Bull", "McLaren", "Ferrari", "Mercedes", "Aston Martin"];

export interface RewardDef {
  id: string; icon: string; name: string; desc: string;
  unlocked: (s: { accuracy: number; points: number; made: number }) => boolean;
}

export const REWARDS: RewardDef[] = [
  { id: "sharp", icon: "🎯", name: "Sharp Shooter", desc: "80%+ accuracy", unlocked: (s) => s.accuracy >= 0.8 },
  { id: "century", icon: "💯", name: "Centurion", desc: "100+ season points", unlocked: (s) => s.points >= 100 },
  { id: "regular", icon: "📅", name: "Regular", desc: "20+ predictions placed", unlocked: (s) => s.made >= 20 },
  { id: "boss", icon: "🏆", name: "Season Boss", desc: "Win a mini-league", unlocked: () => false },
];

/** Per-sport small accents (brand stays violet/lime). Mirrors web SPORTS meta. */
export interface SportMeta {
  label: string;
  emoji: string;
  accent: string;   // accent color value
  confirm: string;  // word shown on a confirmed pick
}

export const SPORTS: Record<Sport, SportMeta> = {
  basketball: { label: "Basketball", emoji: "🏀", accent: COLORS.amber, confirm: "Swish" },
  f1: { label: "Formula 1", emoji: "🏎️", accent: COLORS.magenta, confirm: "Lights out" },
};

/** Tier text color (mirrors web TIER_STYLE). */
export const TIER_COLOR: Record<RankTier, string> = {
  Diamond: COLORS.lime,
  Platinum: COLORS.violetLight,
  Gold: COLORS.amber,
  Silver: COLORS.muted,
  Bronze: COLORS.bronze,
  Rookie: "rgba(168,159,201,0.6)",
};
