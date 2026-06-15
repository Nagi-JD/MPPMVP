"use client";
import { useEffect, useMemo, useState } from "react";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import { EventCard } from "@/components/EventCard";
import { CATEGORY_THEME } from "@/lib/categories";
import type { CategorySlug, GameEvent, Outcome, Prediction } from "@/lib/types";

type Filter = "all" | CategorySlug;

export default function Home() {
  const { userId, displayName } = useSession();
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [preds, setPreds] = useState<Prediction[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const provider = getProvider();

  useEffect(() => {
    (async () => {
      setEvents(await provider.listEvents());
      setPreds(await provider.getPredictions(userId));
    })();
  }, [userId, provider]);

  async function submit(eventId: string, choice: Outcome) {
    await provider.submitPrediction(userId, eventId, choice);
    setPreds(await provider.getPredictions(userId));
  }

  // Categories that actually appear in the feed, for the filter row.
  const present = useMemo(
    () => [...new Set(events.map((e) => e.category))] as CategorySlug[],
    [events]
  );
  const shown = events.filter((e) => filter === "all" || e.category === filter);
  const openCount = events.filter((e) => e.status === "scheduled").length;

  return (
    <div className="pb-4">
      {/* hero */}
      <header className="bg-gradient-to-br from-brand to-brand-dark px-4 pb-5 pt-6 text-white">
        <p className="text-sm/none opacity-80">Welcome back,</p>
        <h1 className="mt-1 text-2xl font-bold">{displayName}</h1>
        <p className="mt-2 text-sm opacity-90">
          {openCount} open {openCount === 1 ? "prediction" : "predictions"} · {preds.length} made
        </p>
      </header>

      {/* category filter */}
      <div className="sticky top-0 z-10 flex gap-2 overflow-x-auto border-b bg-gray-50/95 px-4 py-3 backdrop-blur">
        <Chip active={filter === "all"} onClick={() => setFilter("all")} label="All" emoji="✨" />
        {present.map((c) => (
          <Chip
            key={c}
            active={filter === c}
            onClick={() => setFilter(c)}
            label={CATEGORY_THEME[c].label}
            emoji={CATEGORY_THEME[c].emoji}
          />
        ))}
      </div>

      {/* feed */}
      <div className="space-y-3 p-4">
        {shown.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No events in this category yet.</p>
        ) : (
          shown.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              existing={preds.find((p) => p.eventId === e.id)}
              onSubmit={(o) => submit(e.id, o)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  emoji,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  emoji: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        active ? "border-brand bg-brand text-white" : "border-gray-200 bg-white text-gray-600"
      }`}
    >
      <span>{emoji}</span>
      {label}
    </button>
  );
}
