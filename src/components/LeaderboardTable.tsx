import type { Profile } from "@/lib/types";

export function LeaderboardTable({ rows }: { rows: Profile[] }) {
  if (rows.length === 0) return <p className="text-sm text-gray-500">No players yet. Make a prediction!</p>;
  return (
    <ol className="divide-y rounded-xl border bg-white">
      {rows.map((p, i) => (
        <li key={p.id} className="flex items-center justify-between px-4 py-3">
          <span className="flex items-center gap-3">
            <b className="w-5 text-gray-400">{i + 1}</b>
            {p.displayName}
          </span>
          <span className="font-semibold text-brand">{p.totalPoints} pts</span>
        </li>
      ))}
    </ol>
  );
}
