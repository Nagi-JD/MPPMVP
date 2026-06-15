import type { DataProvider, FixtureBoard } from "@/lib/data/provider";
import type { Group, League, LeaderboardRow, Prediction, Profile, SeasonStats } from "@/lib/types";
import { http } from "@/lib/data/http";

/** Talks to the sports-api Node service; responses already match the mobile model. */
export class SportsApiProvider implements DataProvider {
  listLeagues(): Promise<League[]> {
    return http.get<League[]>("/v1/app/leagues");
  }
  getBoard(leagueId: string): Promise<FixtureBoard[]> {
    return http.get<FixtureBoard[]>(`/v1/app/leagues/${leagueId}/board`);
  }
  getPredictions(userId: string): Promise<Prediction[]> {
    return http.get<Prediction[]>(`/v1/app/predictions?userId=${encodeURIComponent(userId)}`);
  }
  async submitPrediction(userId: string, marketId: string, value: string): Promise<Prediction> {
    return http.post<Prediction>("/v1/app/predictions", { userId, marketId, value });
  }
  async settleMarket(): Promise<void> {
    /* server-side; no-op on client */
  }
  seasonStats(userId: string, leagueId: string): Promise<SeasonStats> {
    return http.get<SeasonStats>(`/v1/app/users/${encodeURIComponent(userId)}/seasons/${leagueId}`);
  }
  leaderboard(leagueId: string): Promise<LeaderboardRow[]> {
    return http.get<LeaderboardRow[]>(`/v1/app/leagues/${leagueId}/leaderboard`);
  }
  getProfile(userId: string): Promise<Profile | null> {
    return http.get<Profile | null>(`/v1/app/users/${encodeURIComponent(userId)}/profile`);
  }
  // Groups are a local feature (no backend yet) — keep a local stub so the Leagues UI works.
  async createGroup(ownerId: string, name: string): Promise<Group> {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    return { id: `grp_${code}`, name, inviteCode: code, ownerId };
  }
  async joinGroup(_userId: string, inviteCode: string): Promise<Group> {
    return { id: `grp_${inviteCode}`, name: "Groupe rejoint", inviteCode, ownerId: "unknown" };
  }
}
