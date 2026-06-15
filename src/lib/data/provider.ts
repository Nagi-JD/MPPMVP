import type { GameEvent, Prediction, Profile, Group } from "@/lib/types";

export interface DataProvider {
  listEvents(): Promise<GameEvent[]>;
  getPredictions(userId: string): Promise<Prediction[]>;
  submitPrediction(userId: string, eventId: string, choice: Prediction["choice"]): Promise<Prediction>;
  settleEvent(eventId: string, result: NonNullable<GameEvent["result"]>): Promise<void>;
  leaderboard(): Promise<Profile[]>;
  getProfile(userId: string): Promise<Profile | null>;
  createGroup(ownerId: string, name: string): Promise<Group>;
  joinGroup(userId: string, inviteCode: string): Promise<Group>;
}
