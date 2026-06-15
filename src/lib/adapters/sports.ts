import type { CategoryAdapter } from "./adapter";
import { outcomeFromScore } from "./adapter";
import type { GameEvent, Outcome } from "@/lib/types";

const KEY = process.env.THESPORTSDB_API_KEY ?? "3";
const API = `https://www.thesportsdb.com/api/v1/json/${KEY}`;

// Basketball (NBA, league id 4387) as the "other sports" example.
export const sportsAdapter: CategoryAdapter = {
  slug: "basketball",
  async fetchUpcoming(): Promise<GameEvent[]> {
    const res = await fetch(`${API}/eventsnextleague.php?id=4387`);
    if (!res.ok) return [];
    const data = (await res.json()) as { events: any[] | null };
    return (data.events ?? []).map((e) => ({
      id: `basketball_${e.idEvent}`,
      externalId: String(e.idEvent),
      category: "basketball",
      title: e.strEvent,
      home: e.strHomeTeam,
      away: e.strAwayTeam,
      startTime: `${e.dateEvent}T${e.strTime ?? "00:00:00"}Z`,
      lockTime: `${e.dateEvent}T${e.strTime ?? "00:00:00"}Z`,
      status: "scheduled",
      result: null,
    }));
  },
  async fetchResult(event: GameEvent): Promise<Outcome | null> {
    const res = await fetch(`${API}/lookupevent.php?id=${event.externalId}`);
    if (!res.ok) return null;
    const e = ((await res.json()) as { events: any[] }).events?.[0];
    if (!e || e.intHomeScore == null || e.intAwayScore == null) return null;
    return outcomeFromScore(Number(e.intHomeScore), Number(e.intAwayScore));
  },
};
