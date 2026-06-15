import type { DataProvider } from "@/lib/data/provider";
import type { GameEvent, Prediction, Profile, Group } from "@/lib/types";
import { scorePrediction, applyStreak } from "@/lib/scoring";

let counter = 0;
const id = (p: string) => `${p}_${++counter}`;

function seedEvents(): GameEvent[] {
  const base = (n: number) => new Date(Date.now() + n * 3600_000).toISOString();
  return [
    { id: "e1", externalId: "f1", category: "football", title: "PSG vs OM", home: "PSG", away: "OM", startTime: base(2), lockTime: base(2), status: "scheduled", result: null },
    { id: "e2", externalId: "x1", category: "esports", title: "G2 vs FNC", home: "G2", away: "FNC", startTime: base(3), lockTime: base(3), status: "scheduled", result: null },
    { id: "e3", externalId: "b1", category: "basketball", title: "LAL vs BOS", home: "LAL", away: "BOS", startTime: base(5), lockTime: base(5), status: "scheduled", result: null },
  ];
}

export class MockProvider implements DataProvider {
  private events = seedEvents();
  private predictions: Prediction[] = [];
  private profiles = new Map<string, Profile>();
  private groups: Group[] = [];

  private profile(userId: string): Profile {
    if (!this.profiles.has(userId))
      this.profiles.set(userId, { id: userId, displayName: userId, totalPoints: 0, currentStreak: 0, bestStreak: 0 });
    return this.profiles.get(userId)!;
  }

  async listEvents() { return this.events; }
  async getPredictions(userId: string) { return this.predictions.filter((p) => p.userId === userId); }

  async submitPrediction(userId: string, eventId: string, choice: Prediction["choice"]) {
    if (this.predictions.some((p) => p.userId === userId && p.eventId === eventId))
      throw new Error("Already predicted this event");
    const pred: Prediction = { id: id("p"), userId, eventId, choice, pointsAwarded: 0, settled: false };
    this.predictions.push(pred);
    return pred;
  }

  async settleEvent(eventId: string, result: NonNullable<GameEvent["result"]>) {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) throw new Error("No such event");
    event.result = result; event.status = "settled";
    for (const pred of this.predictions.filter((p) => p.eventId === eventId && !p.settled)) {
      const pts = scorePrediction(event, pred);
      pred.pointsAwarded = pts; pred.settled = true;
      this.profiles.set(pred.userId, applyStreak(this.profile(pred.userId), pts));
    }
  }

  async leaderboard() { return [...this.profiles.values()].sort((a, b) => b.totalPoints - a.totalPoints); }
  async getProfile(userId: string) { return this.profiles.get(userId) ?? null; }

  async createGroup(ownerId: string, name: string) {
    const g: Group = { id: id("g"), name, inviteCode: Math.random().toString(36).slice(2, 8).toUpperCase(), ownerId };
    this.groups.push(g); return g;
  }
  async joinGroup(_userId: string, inviteCode: string) {
    const g = this.groups.find((x) => x.inviteCode === inviteCode);
    if (!g) throw new Error("Invalid invite code");
    return g;
  }
}
