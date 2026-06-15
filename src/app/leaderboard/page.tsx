"use client";
import { useEffect, useState } from "react";
import { getProvider } from "@/lib/data/client";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import type { Profile } from "@/lib/types";

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Profile[]>([]);
  useEffect(() => {
    getProvider().leaderboard().then(setRows);
  }, []);
  return (
    <div className="px-5 pt-7">
      <p className="eyebrow">Standings</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">The Table</h1>
      <p className="mt-1 mb-5 text-sm text-muted">Every correct call is 3 points. Streaks are bragging rights.</p>
      <LeaderboardTable rows={rows} />
    </div>
  );
}
