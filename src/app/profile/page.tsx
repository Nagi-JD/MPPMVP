"use client";
import { useEffect, useState } from "react";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import type { Profile } from "@/lib/types";

export default function ProfilePage() {
  const { userId, displayName } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    getProvider().getProfile(userId).then(setProfile);
  }, [userId]);

  const stat = (label: string, value: number | string) => (
    <div className="rounded-xl border bg-white p-4 text-center">
      <div className="text-2xl font-bold text-brand">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold text-brand">{displayName}</h1>
      <div className="grid grid-cols-3 gap-2">
        {stat("Points", profile?.totalPoints ?? 0)}
        {stat("Streak", profile?.currentStreak ?? 0)}
        {stat("Best", profile?.bestStreak ?? 0)}
      </div>
    </div>
  );
}
