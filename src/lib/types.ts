export type Sport = "basketball" | "f1";

export type EventStatus = "scheduled" | "locked" | "settled";

/** A seasonal competition, e.g. NBA 2026 or F1 2026. */
export interface League {
  id: string; // "nba-2026"
  sport: Sport;
  org: string; // "NBA", "LNB", "EuroLeague", "Formula 1"
  season: number; // 2026
}

/** A match (basket) or a race weekend / championship (F1) that groups markets. */
export interface Fixture {
  id: string;
  leagueId: string;
  sport: Sport;
  scope: "match" | "weekend" | "season";
  title: string; // "Lakers vs Celtics" | "Miami Grand Prix" | "NBA 2026 — Title"
  home?: string;
  away?: string;
  venue?: string;
  startTime: string; // ISO
  lockTime: string; // ISO
  status: EventStatus;
}

export type MarketKind =
  // basketball
  | "match_winner"
  | "exact_score"
  | "top_scorer"
  | "season_champion"
  // f1
  | "quali_podium"
  | "sprint_podium"
  | "race_podium"
  | "fastest_lap"
  | "top_speed"
  | "best_sectors"
  | "driver_champion"
  | "constructor_champion";

export type MarketInput = "choice" | "score" | "podium";

/** A single predictable question attached to a fixture. */
export interface Market {
  id: string;
  fixtureId: string;
  leagueId: string;
  kind: MarketKind;
  label: string; // "Match winner"
  input: MarketInput;
  difficulty: 1 | 2 | 3; // points multiplier & rank weight
  options?: string[]; // for choice / podium inputs
  lockTime: string;
  status: EventStatus;
  result: string | null; // settled answer (encoding depends on input)
}

export interface Prediction {
  id: string;
  userId: string;
  marketId: string;
  value: string; // encoding depends on market.input
  pointsAwarded: number;
  settled: boolean;
  correct: boolean;
}

export interface Profile {
  id: string;
  displayName: string;
  totalPoints: number; // across all seasons
}

/** A player's standing within one league/season. */
export interface SeasonStats {
  leagueId: string;
  points: number;
  made: number; // predictions placed
  settled: number; // predictions resolved
  correct: number;
  accuracy: number; // 0..1 over settled
  tier: RankTier;
}

export type RankTier = "Rookie" | "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";

export interface LeaderboardRow {
  user: Profile;
  points: number;
  made: number;
  accuracy: number;
  tier: RankTier;
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
}
