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
    <div className="space-y-3 p-4">
      <h1 className="text-2xl font-bold text-brand">Ranking</h1>
      <LeaderboardTable rows={rows} />
    </div>
  );
}
