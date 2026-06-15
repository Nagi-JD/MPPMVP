"use client";
import { useEffect, useState } from "react";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import { RankBadge } from "@/components/RankBadge";
import { SportLogo } from "@/components/SportLogo";
import { SPORTS } from "@/lib/catalog";
import type { League, Profile, SeasonStats } from "@/lib/types";

export default function ProfilePage() {
  const { userId, displayName } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [seasons, setSeasons] = useState<Array<{ league: League; stats: SeasonStats }>>([]);
  const provider = getProvider();

  useEffect(() => {
    (async () => {
      setProfile(await provider.getProfile(userId));
      const leagues = await provider.listLeagues();
      const rows = await Promise.all(
        leagues.map(async (league) => ({ league, stats: await provider.seasonStats(userId, league.id) }))
      );
      setSeasons(rows.filter((r) => r.stats.made > 0));
    })();
  }, [userId, provider]);

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
        <div className="ml-auto text-right">
          <div className="font-mono text-2xl font-bold text-lime">{profile?.totalPoints ?? 0}</div>
          <div className="text-[0.65rem] text-muted">total pts</div>
        </div>
      </div>

      <h2 className="eyebrow mb-2 mt-7">Rank by season</h2>
      {seasons.length === 0 ? (
        <p className="rounded-xl border border-line bg-ink-800/60 px-4 py-6 text-center text-sm text-muted">
          Make some predictions to start a seasonal rank.
        </p>
      ) : (
        <div className="space-y-3">
          {seasons.map(({ league, stats }) => {
            const meta = SPORTS[league.sport];
            return (
              <div key={league.id} className={`rounded-2xl border ${meta.border} bg-ink-800/60 p-4`}>
                <div className="flex items-center gap-2">
                  <SportLogo sport={league.sport} className="h-5 w-6" />
                  <span className="font-display font-bold">{league.org} {league.season}</span>
                  <RankBadge tier={stats.tier} className="ml-auto" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <Cell value={stats.points} label="Points" tone="text-lime" />
                  <Cell value={`${Math.round(stats.accuracy * 100)}%`} label="Accuracy" tone={meta.accent} />
                  <Cell value={`${stats.correct}/${stats.settled}`} label="Correct" tone="text-white" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Cell({ value, label, tone }: { value: number | string; label: string; tone: string }) {
  return (
    <div className="rounded-xl border border-line bg-ink px-2 py-3">
      <div className={`font-mono text-lg font-bold ${tone}`}>{value}</div>
      <div className="mt-0.5 text-[0.65rem] text-muted">{label}</div>
    </div>
  );
}
