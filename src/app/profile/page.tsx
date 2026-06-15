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

  return (
    <div className="px-5 pt-7">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-violet/15 font-display text-xl font-bold text-violet-light">
          {displayName.slice(0, 1)}
        </div>
        <div>
          <p className="eyebrow">Predictor</p>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">{displayName}</h1>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Tile value={profile?.totalPoints ?? 0} label="Points" tone="lime" />
        <Tile value={profile?.currentStreak ?? 0} label="Streak" tone="amber" />
        <Tile value={profile?.bestStreak ?? 0} label="Best" tone="violet" />
      </div>
    </div>
  );
}

const TONE = { lime: "text-lime", amber: "text-amber", violet: "text-violet-light" } as const;

function Tile({ value, label, tone }: { value: number; label: string; tone: keyof typeof TONE }) {
  return (
    <div className="rounded-2xl border border-line bg-ink-800/60 px-3 py-5 text-center">
      <div className={`font-mono text-3xl font-bold ${TONE[tone]}`}>{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}
