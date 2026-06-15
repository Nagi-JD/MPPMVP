"use client";
import { useState } from "react";
import type { GameEvent, Outcome, Prediction } from "@/lib/types";
import { PredictionControls } from "./PredictionControls";

export function EventCard({
  event,
  existing,
  onSubmit,
}: {
  event: GameEvent;
  existing?: Prediction;
  onSubmit: (o: Outcome) => Promise<void>;
}) {
  const [choice, setChoice] = useState<Outcome | undefined>(existing?.choice);
  const [saving, setSaving] = useState(false);
  const locked = !!existing || event.status !== "scheduled";

  async function pick(o: Outcome) {
    if (locked || saving) return;
    setChoice(o);
    setSaving(true);
    try {
      await onSubmit(o);
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">{event.category}</span>
        <time className="text-xs text-gray-400">{new Date(event.startTime).toLocaleString()}</time>
      </div>
      <h2 className="mt-2 text-base font-semibold">{event.title}</h2>
      <PredictionControls event={event} choice={choice} onPick={pick} disabled={locked} />
      {existing && <p className="mt-2 text-xs text-gray-500">Pick locked in ✓</p>}
    </article>
  );
}
