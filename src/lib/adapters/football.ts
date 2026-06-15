import type { CategoryAdapter } from "./adapter";
import { outcomeFromScore } from "./adapter";
import type { GameEvent, Outcome } from "@/lib/types";

const API = "https://api.football-data.org/v4";

export const footballAdapter: CategoryAdapter = {
  slug: "football",
  async fetchUpcoming(): Promise<GameEvent[]> {
    const key = process.env.FOOTBALL_DATA_API_KEY;
    if (!key) return [];
    const res = await fetch(`${API}/matches?status=SCHEDULED`, { headers: { "X-Auth-Token": key } });
    if (!res.ok) return [];
    const data = (await res.json()) as { matches: any[] };
    return data.matches.map((m) => ({
      id: `football_${m.id}`,
      externalId: String(m.id),
      category: "football",
      title: `${m.homeTeam.shortName} vs ${m.awayTeam.shortName}`,
      home: m.homeTeam.shortName,
      away: m.awayTeam.shortName,
      startTime: m.utcDate,
      lockTime: m.utcDate,
      status: "scheduled",
      result: null,
    }));
  },
  async fetchResult(event: GameEvent): Promise<Outcome | null> {
    const key = process.env.FOOTBALL_DATA_API_KEY;
    if (!key) return null;
    const res = await fetch(`${API}/matches/${event.externalId}`, { headers: { "X-Auth-Token": key } });
    if (!res.ok) return null;
    const m = (await res.json()) as any;
    if (m.status !== "FINISHED") return null;
    return outcomeFromScore(m.score.fullTime.home, m.score.fullTime.away);
  },
};
