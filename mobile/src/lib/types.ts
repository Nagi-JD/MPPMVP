export type Sport = "basketball" | "f1";
export type EventStatus = "scheduled" | "locked" | "settled";

export interface League { id: string; sport: Sport; org: string; season: number; }

export interface Fixture {
  id: string; leagueId: string; sport: Sport;
  scope: "match" | "weekend" | "season";
  title: string; home?: string; away?: string; venue?: string;
  startTime: string; lockTime: string; status: EventStatus;
}

export type MarketKind =
  | "match_winner" | "exact_score" | "top_scorer" | "season_champion"
  | "quali_podium" | "sprint_podium" | "race_podium" | "fastest_lap"
  | "top_speed" | "best_sectors" | "driver_champion" | "constructor_champion";

export type MarketInput = "choice" | "score" | "podium";

export interface Market {
  id: string; fixtureId: string; leagueId: string; kind: MarketKind;
  label: string; input: MarketInput; difficulty: 1 | 2 | 3; options?: string[];
  lockTime: string; status: EventStatus; result: string | null;
}

export interface Prediction {
  id: string; userId: string; marketId: string; value: string;
  pointsAwarded: number; settled: boolean; correct: boolean;
}

export interface Profile { id: string; displayName: string; totalPoints: number; }

export type RankTier = "Rookie" | "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";

export interface SeasonStats {
  leagueId: string; points: number; made: number; settled: number;
  correct: number; accuracy: number; tier: RankTier;
}

export interface LeaderboardRow {
  user: Profile; points: number; made: number; accuracy: number; tier: RankTier;
}

export interface Group { id: string; name: string; inviteCode: string; ownerId: string; }
