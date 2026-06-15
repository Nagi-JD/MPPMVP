import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Sport } from "@/lib/types";

interface SessionState {
  userId: string;
  displayName: string;
  /** Favorite sports chosen at onboarding; empty until the popup is completed. */
  favorites: Sport[];
  onboarded: boolean;
  setUser: (id: string, name: string) => void;
  setFavorites: (sports: Sport[]) => void;
  completeOnboarding: (sports: Sport[]) => void;
}

// MVP: a local demo identity. Favorites + onboarding state persist in the browser.
export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      userId: "demo-user",
      displayName: "Demo Player",
      favorites: [],
      onboarded: false,
      setUser: (userId, displayName) => set({ userId, displayName }),
      setFavorites: (favorites) => set({ favorites }),
      completeOnboarding: (favorites) => set({ favorites, onboarded: true }),
    }),
    { name: "mpp-session" }
  )
);
