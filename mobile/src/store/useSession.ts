import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Sport } from "@/lib/types";

interface SessionState {
  userId: string;
  displayName: string;
  favorites: Sport[];
  onboarded: boolean;
  hydrated: boolean;
  setUser: (id: string, name: string) => void;
  setFavorites: (sports: Sport[]) => void;
  completeOnboarding: (sports: Sport[]) => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      userId: "demo-user",
      displayName: "Demo Player",
      favorites: [],
      onboarded: false,
      hydrated: false,
      setUser: (userId, displayName) => set({ userId, displayName }),
      setFavorites: (favorites) => set({ favorites }),
      completeOnboarding: (favorites) => set({ favorites, onboarded: true }),
    }),
    {
      name: "mpp-session",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ userId: s.userId, displayName: s.displayName, favorites: s.favorites, onboarded: s.onboarded }),
      onRehydrateStorage: () => (state) => state && (state.hydrated = true),
    }
  )
);
