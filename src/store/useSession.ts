import { create } from "zustand";

interface SessionState {
  userId: string;
  displayName: string;
  setUser: (id: string, name: string) => void;
}

// MVP: a local demo identity until Supabase auth lands.
export const useSession = create<SessionState>((set) => ({
  userId: "demo-user",
  displayName: "Demo Player",
  setUser: (userId, displayName) => set({ userId, displayName }),
}));
