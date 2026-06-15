import type { Fixture, Group, League, LeaderboardRow, Market, Prediction, Profile, SeasonStats } from "@/lib/types";

export interface FixtureBoard {
  fixture: Fixture;
  markets: Market[];
}

export interface DataProvider {
  listLeagues(): Promise<League[]>;
  /** Fixtures (with their markets) for a league, season-ordered. */
  getBoard(leagueId: string): Promise<FixtureBoard[]>;
  getPredictions(userId: string): Promise<Prediction[]>;
  submitPrediction(userId: string, marketId: string, value: string): Promise<Prediction>;
  settleMarket(marketId: string, result: string): Promise<void>;
  seasonStats(userId: string, leagueId: string): Promise<SeasonStats>;
  leaderboard(leagueId: string): Promise<LeaderboardRow[]>;
  getProfile(userId: string): Promise<Profile | null>;
  createGroup(ownerId: string, name: string): Promise<Group>;
  joinGroup(userId: string, inviteCode: string): Promise<Group>;
}
