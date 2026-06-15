import type { MarketInput, MarketKind, Sport } from "@/lib/types";

export interface SportMeta {
  label: string;
  emoji: string;
  /** Tailwind text-color token for accents. */
  accent: string;
  /** Tailwind border token used on themed cards. */
  border: string;
  /** Soft background gradient for the fixture header. */
  grad: string;
  /** Validation animation class — distinct per sport. */
  anim: string;
  /** Short verb shown on a confirmed pick. */
  confirm: string;
}

export const SPORTS: Record<Sport, SportMeta> = {
  // Basketball: warm amber, a ball-bounce on validation.
  basketball: {
    label: "Basketball",
    emoji: "🏀",
    accent: "text-amber",
    border: "border-amber/30",
    grad: "from-amber/15 to-transparent",
    anim: "animate-bounceIn",
    confirm: "Swish",
  },
  // F1: electric magenta, a speed-streak sweep on validation.
  f1: {
    label: "Formula 1",
    emoji: "🏎️",
    accent: "text-magenta",
    border: "border-magenta/30",
    grad: "from-magenta/15 to-transparent",
    anim: "animate-speedSweep",
    confirm: "Lights out",
  },
};

export interface MarketMeta {
  label: string;
  short: string;
  input: MarketInput;
  difficulty: 1 | 2 | 3;
  scope: "match" | "weekend" | "season";
  sport: Sport;
}

export const MARKET_META: Record<MarketKind, MarketMeta> = {
  // basketball
  match_winner: { label: "Match winner", short: "Winner", input: "choice", difficulty: 1, scope: "match", sport: "basketball" },
  exact_score: { label: "Exact final score", short: "Score", input: "score", difficulty: 3, scope: "match", sport: "basketball" },
  top_scorer: { label: "Top scorer", short: "Top scorer", input: "choice", difficulty: 2, scope: "match", sport: "basketball" },
  season_champion: { label: "Season champion", short: "Champion", input: "choice", difficulty: 3, scope: "season", sport: "basketball" },
  // f1
  quali_podium: { label: "Qualifying podium", short: "Quali", input: "podium", difficulty: 2, scope: "weekend", sport: "f1" },
  sprint_podium: { label: "Sprint podium", short: "Sprint", input: "podium", difficulty: 2, scope: "weekend", sport: "f1" },
  race_podium: { label: "Race podium", short: "Podium", input: "podium", difficulty: 2, scope: "weekend", sport: "f1" },
  fastest_lap: { label: "Fastest lap", short: "Fastest lap", input: "choice", difficulty: 2, scope: "weekend", sport: "f1" },
  top_speed: { label: "Top speed", short: "Top speed", input: "choice", difficulty: 1, scope: "weekend", sport: "f1" },
  best_sectors: { label: "Best sectors", short: "Sectors", input: "choice", difficulty: 1, scope: "weekend", sport: "f1" },
  driver_champion: { label: "Drivers' champion", short: "Driver title", input: "choice", difficulty: 3, scope: "season", sport: "f1" },
  constructor_champion: { label: "Constructors' champion", short: "Constructor title", input: "choice", difficulty: 3, scope: "season", sport: "f1" },
};

/** Shared option pools used by the seed + UI selects. */
export const F1_DRIVERS = [
  "Verstappen", "Norris", "Leclerc", "Piastri", "Russell", "Hamilton", "Sainz", "Alonso",
];
export const F1_CONSTRUCTORS = ["Red Bull", "McLaren", "Ferrari", "Mercedes", "Aston Martin"];

export const TIER_STYLE: Record<string, string> = {
  Diamond: "text-lime",
  Platinum: "text-violet-light",
  Gold: "text-amber",
  Silver: "text-muted",
  Bronze: "text-[#C98A5E]",
  Rookie: "text-muted/70",
};
