"use client";
import { useEffect, useMemo, useState } from "react";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import { OnboardingModal } from "@/components/OnboardingModal";
import { FixtureCard } from "@/components/FixtureCard";
import { RankBadge } from "@/components/RankBadge";
import { SportLogo } from "@/components/SportLogo";
import { SPORTS } from "@/lib/catalog";
import type { FixtureBoard } from "@/lib/data/provider";
import type { League, Prediction, SeasonStats } from "@/lib/types";

export default function Home() {
  const { userId, displayName, favorites, onboarded, completeOnboarding } = useSession();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [activeLeague, setActiveLeague] = useState<string>("");
  const [board, setBoard] = useState<FixtureBoard[]>([]);
  const [preds, setPreds] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<SeasonStats | null>(null);
  const provider = getProvider();

  useEffect(() => {
    provider.listLeagues().then(setLeagues);
  }, [provider]);

  // Leagues filtered to the player's favorite sports (all when none chosen yet).
  const visible = useMemo(
    () => leagues.filter((l) => favorites.length === 0 || favorites.includes(l.sport)),
    [leagues, favorites]
  );

  useEffect(() => {
    if (visible.length && !visible.some((l) => l.id === activeLeague)) setActiveLeague(visible[0].id);
  }, [visible, activeLeague]);

  async function refresh() {
    if (!activeLeague) return;
    setBoard(await provider.getBoard(activeLeague));
    setPreds(await provider.getPredictions(userId));
    setStats(await provider.seasonStats(userId, activeLeague));
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLeague, userId]);

  async function submit(marketId: string, value: string) {
    await provider.submitPrediction(userId, marketId, value);
    await refresh();
  }

  const league = visible.find((l) => l.id === activeLeague);

  return (
    <div>
      {!onboarded && <OnboardingModal onDone={completeOnboarding} />}

      <header className="px-5 pb-1 pt-7">
        <p className="eyebrow">Match day</p>
        <h1 className="mt-2 font-display text-[1.9rem] font-extrabold leading-[1.05] tracking-tight">
          Call it, <span className="text-violet-light">{displayName.split(" ")[0]}</span>.
        </h1>
      </header>

      {/* league selector */}
      <div className="flex gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visible.map((l) => {
          const meta = SPORTS[l.sport];
          const active = l.id === activeLeague;
          return (
            <button
              key={l.id}
              onClick={() => setActiveLeague(l.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                active ? `${meta.border} bg-white/[0.05] text-white` : "border-line text-muted"
              }`}
            >
              <SportLogo sport={l.sport} className="h-3.5 w-auto" />
              {l.org} {l.season}
            </button>
          );
        })}
      </div>

      {/* season stat banner */}
      {league && stats && (
        <div className="mx-5 mb-3 flex items-center justify-between rounded-xl border border-line bg-ink-800/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <RankBadge tier={stats.tier} />
            <div className="text-xs text-muted">
              {stats.correct}/{stats.settled} correct · {Math.round(stats.accuracy * 100)}%
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-lg font-bold text-lime">{stats.points}</div>
            <div className="text-[0.65rem] text-muted">season pts</div>
          </div>
        </div>
      )}

      {/* fixtures */}
      <div className="space-y-4 px-5 pt-1">
        {board.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">No fixtures on the board yet.</p>
        ) : (
          board.map((b, i) => (
            <div key={b.fixture.id} className="animate-riseIn" style={{ animationDelay: `${i * 45}ms` }}>
              <FixtureCard board={b} predictions={preds} onSubmit={submit} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
