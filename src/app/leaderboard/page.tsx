"use client";
import { useEffect, useMemo, useState } from "react";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import { RankBadge } from "@/components/RankBadge";
import { SportLogo } from "@/components/SportLogo";
import { SPORTS } from "@/lib/catalog";
import type { League, LeaderboardRow } from "@/lib/types";

const MEDAL = ["text-lime", "text-violet-light", "text-amber"];

export default function LeaderboardPage() {
  const { userId, favorites } = useSession();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [active, setActive] = useState("");
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const provider = getProvider();

  useEffect(() => {
    provider.listLeagues().then(setLeagues);
  }, [provider]);

  const visible = useMemo(
    () => leagues.filter((l) => favorites.length === 0 || favorites.includes(l.sport)),
    [leagues, favorites]
  );
  useEffect(() => {
    if (visible.length && !visible.some((l) => l.id === active)) setActive(visible[0].id);
  }, [visible, active]);

  useEffect(() => {
    if (active) provider.leaderboard(active).then(setRows);
  }, [active, provider]);

  const league = visible.find((l) => l.id === active);

  return (
    <div className="px-5 pt-7">
      <p className="eyebrow">Standings</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Season Ranking</h1>
      <p className="mt-1 mb-4 text-sm text-muted">Rank rewards accuracy, volume and difficulty per season.</p>

      <div className="mb-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visible.map((l) => {
          const meta = SPORTS[l.sport];
          const on = l.id === active;
          return (
            <button
              key={l.id}
              onClick={() => setActive(l.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${on ? `${meta.border} bg-white/[0.05] text-white` : "border-line text-muted"}`}
            >
              <SportLogo sport={l.sport} className="h-3.5 w-auto" />
              {l.org} {l.season}
            </button>
          );
        })}
      </div>

      {league && (
        <ol className="overflow-hidden rounded-2xl border border-line bg-ink-800/60">
          {rows.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-muted">No predictions resolved yet this season.</li>
          ) : (
            rows.map((r, i) => {
              const me = r.user.id === userId;
              return (
                <li key={r.user.id} className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-line" : ""} ${me ? "bg-violet/10" : i < 3 ? "bg-white/[0.02]" : ""}`}>
                  <span className={`w-6 font-mono text-sm font-bold ${MEDAL[i] ?? "text-muted"}`}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 truncate font-semibold">
                    {r.user.displayName}
                    {me && <span className="ml-1.5 text-[0.65rem] text-violet-light">you</span>}
                  </span>
                  <RankBadge tier={r.tier} />
                  <span className="hidden w-10 text-right font-mono text-xs text-muted xs:inline">{Math.round(r.accuracy * 100)}%</span>
                  <span className="w-12 text-right font-mono text-sm font-bold text-white">{r.points}</span>
                </li>
              );
            })
          )}
        </ol>
      )}
    </div>
  );
}
