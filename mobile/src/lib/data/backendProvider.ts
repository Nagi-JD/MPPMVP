import type { DataProvider, FixtureBoard } from "@/lib/data/provider";
import type { Group, League, LeaderboardRow, Prediction, Profile, SeasonStats } from "@/lib/types";
import { http } from "@/lib/data/http";
import { toFixture, toLeague, type BoardWire, type LeagueWire } from "@/lib/data/adapter";
import { loadPredictions, savePrediction } from "@/lib/data/predictionsCache";

interface SeasonStatsWire {
  user_id: string; league_id: string; points: number; made: number;
  settled: number; correct: number; accuracy: number; tier: SeasonStats["tier"];
}
interface LeaderboardWire {
  user_id: string; points: number; made: number; accuracy: number; tier: SeasonStats["tier"];
}

export class BackendProvider implements DataProvider {
  async listLeagues(): Promise<League[]> {
    const wire = await http.get<LeagueWire[]>("/leagues");
    return wire.map(toLeague);
  }

  async getBoard(leagueId: string): Promise<FixtureBoard[]> {
    const board = await http.get<BoardWire>(`/leagues/${leagueId}/board`);
    return board.fixtures.map((f) => toFixture(f, board.league));
  }

  async getPredictions(userId: string): Promise<Prediction[]> {
    return loadPredictions(userId);
  }

  async submitPrediction(userId: string, marketId: string, value: string): Promise<Prediction> {
    await http.post("/predictions", { user_id: userId, market_id: marketId, value });
    const pred: Prediction = {
      id: `${userId}:${marketId}`, userId, marketId, value,
      pointsAwarded: 0, settled: false, correct: false,
    };
    await savePrediction(userId, pred);
    return pred;
  }

  async settleMarket(marketId: string, result: string): Promise<void> {
    await http.post(`/markets/${marketId}/settle`, { result });
  }

  async seasonStats(userId: string, leagueId: string): Promise<SeasonStats> {
    const s = await http.get<SeasonStatsWire>(`/users/${userId}/seasons/${leagueId}`);
    return {
      leagueId: s.league_id, points: s.points, made: s.made, settled: s.settled,
      correct: s.correct, accuracy: s.accuracy, tier: s.tier,
    };
  }

  async leaderboard(leagueId: string): Promise<LeaderboardRow[]> {
    const rows = await http.get<LeaderboardWire[]>(`/leagues/${leagueId}/leaderboard`);
    return rows.map((r) => ({
      user: { id: r.user_id, displayName: r.user_id, totalPoints: r.points },
      points: r.points, made: r.made, accuracy: r.accuracy, tier: r.tier,
    }));
  }

  async getProfile(userId: string): Promise<Profile | null> {
    return { id: userId, displayName: userId, totalPoints: 0 };
  }

  async createGroup(ownerId: string, name: string): Promise<Group> {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    return { id: `grp_${code}`, name, inviteCode: code, ownerId };
  }

  async joinGroup(_userId: string, inviteCode: string): Promise<Group> {
    return { id: `grp_${inviteCode}`, name: "Joined group", inviteCode, ownerId: "unknown" };
  }
}
