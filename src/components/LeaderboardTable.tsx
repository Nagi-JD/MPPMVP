import type { Profile } from "@/lib/types";

const MEDAL = ["text-lime", "text-violet-light", "text-amber"];

export function LeaderboardTable({ rows }: { rows: Profile[] }) {
  if (rows.length === 0)
    return <p className="rounded-xl border border-line bg-ink-800/60 px-4 py-6 text-center text-sm text-muted">No players on the board yet. Make the first call.</p>;

  return (
    <ol className="overflow-hidden rounded-2xl border border-line bg-ink-800/60">
      {rows.map((p, i) => (
        <li
          key={p.id}
          className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-line" : ""} ${
            i < 3 ? "bg-white/[0.02]" : ""
          }`}
        >
          <span className={`w-6 font-mono text-sm font-bold ${MEDAL[i] ?? "text-muted"}`}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="flex-1 font-semibold">{p.displayName}</span>
          {p.currentStreak > 0 && (
            <span className="font-mono text-xs text-amber">{p.currentStreak}🔥</span>
          )}
          <span className="font-mono text-sm font-bold text-white">{p.totalPoints}</span>
          <span className="text-xs text-muted">pts</span>
        </li>
      ))}
    </ol>
  );
}
