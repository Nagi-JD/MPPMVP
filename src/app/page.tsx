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

  const present = useMemo(() => [...new Set(events.map((e) => e.category))] as CategorySlug[], [events]);
  const shown = events.filter((e) => filter === "all" || e.category === filter);
  const openCount = events.filter((e) => e.status === "scheduled").length;

  return (
    <div>
      {/* hero — the floodlight thesis */}
      <header className="px-5 pb-2 pt-7">
        <p className="eyebrow">Match day</p>
        <h1 className="mt-2 font-display text-[2rem] font-extrabold leading-[1.05] tracking-tight">
          Call it before
          <br />
          the whistle, <span className="text-violet-light">{displayName.split(" ")[0]}</span>.
        </h1>

        <div className="mt-5 flex gap-3">
          <Stat value={openCount} label={openCount === 1 ? "match open" : "matches open"} />
          <Stat value={preds.length} label="picks made" tone="violet" />
        </div>
      </header>

      {/* category filter */}
      <div className="sticky top-0 z-10 -mx-0 flex gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip active={filter === "all"} onClick={() => setFilter("all")} label="All" emoji="✦" />
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
      <div className="space-y-4 px-5 pt-1">
        {shown.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">Nothing on the slate here yet. Try another sport.</p>
        ) : (
          shown.map((e, i) => (
            <div key={e.id} className="animate-riseIn" style={{ animationDelay: `${i * 45}ms` }}>
              <EventCard event={e} existing={preds.find((p) => p.eventId === e.id)} onSubmit={(o) => submit(e.id, o)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Stat({ value, label, tone }: { value: number; label: string; tone?: "violet" }) {
  return (
    <div className="flex-1 rounded-xl border border-line bg-ink-800/60 px-4 py-3">
      <div className={`font-mono text-2xl font-bold ${tone === "violet" ? "text-violet-light" : "text-lime"}`}>
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-0.5 text-xs text-muted">{label}</div>
    </div>
  );
}

function Chip({ active, onClick, label, emoji }: { active: boolean; onClick: () => void; label: string; emoji: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
        active ? "border-violet bg-violet/15 text-white" : "border-line text-muted hover:text-white"
      }`}
    >
      <span aria-hidden>{emoji}</span>
      {label}
    </button>
  );
}
