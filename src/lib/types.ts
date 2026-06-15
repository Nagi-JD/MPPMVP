export type CategorySlug = "football" | "esports" | "basketball" | "tennis";

export interface Category { slug: CategorySlug; name: string; enabled: boolean; }

export type EventStatus = "scheduled" | "locked" | "settled";

export interface GameEvent {
  id: string;
  externalId: string;
  category: CategorySlug;
  title: string; // "Team A vs Team B"
  home: string;
  away: string;
  startTime: string; // ISO
  lockTime: string; // ISO
  status: EventStatus;
  result: Outcome | null; // null until settled
}

export type Outcome = "home" | "draw" | "away";

export interface Prediction {
  id: string;
  userId: string;
  eventId: string;
  choice: Outcome;
  pointsAwarded: number;
  settled: boolean;
}

export interface Profile {
  id: string;
  displayName: string;
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
}

export interface Group { id: string; name: string; inviteCode: string; ownerId: string; }
