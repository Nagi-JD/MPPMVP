import type { CategoryAdapter } from "./adapter";
import { outcomeFromScore } from "./adapter";
import type { GameEvent, Outcome } from "@/lib/types";

const API = "https://api.pandascore.co";

export const esportsAdapter: CategoryAdapter = {
  slug: "esports",
  async fetchUpcoming(): Promise<GameEvent[]> {
    const key = process.env.PANDASCORE_API_KEY;
    if (!key) return [];
    const res = await fetch(`${API}/matches/upcoming?per_page=20`, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) return [];
    const data = (await res.json()) as any[];
    return data
      .filter((m) => m.opponents?.length === 2)
      .map((m) => ({
        id: `esports_${m.id}`,
        externalId: String(m.id),
        category: "esports",
        title: m.name,
        home: m.opponents[0].opponent.name,
        away: m.opponents[1].opponent.name,
        startTime: m.begin_at,
        lockTime: m.begin_at,
        status: "scheduled",
        result: null,
      }));
  },
  async fetchResult(event: GameEvent): Promise<Outcome | null> {
    const key = process.env.PANDASCORE_API_KEY;
    if (!key) return null;
    const res = await fetch(`${API}/matches/${event.externalId}`, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) return null;
    const m = (await res.json()) as any;
    if (m.status !== "finished" || m.results?.length !== 2) return null;
    return outcomeFromScore(m.results[0].score, m.results[1].score);
  },
};
