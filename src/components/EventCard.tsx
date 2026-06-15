"use client";
import { useState } from "react";
import type { GameEvent, Outcome, Prediction } from "@/lib/types";
import { PredictionControls } from "./PredictionControls";
import { themeFor } from "@/lib/categories";
import { timeUntil } from "@/lib/time";

function outcomeLabel(event: GameEvent, o: Outcome): string {
  return o === "home" ? event.home : o === "away" ? event.away : "Draw";
}

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
  const theme = themeFor(event.category);
  const settled = event.status === "settled";
  const locked = !!existing || event.status !== "scheduled";
  const won = settled && choice != null && choice === event.result;

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
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* header */}
      <div className="flex items-center justify-between px-4 pt-3">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${theme.chip}`}>
          <span>{theme.emoji}</span>
          {theme.label}
        </span>
        {settled ? (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Final</span>
        ) : (
          <time className="text-xs font-medium text-gray-400">{timeUntil(event.lockTime)}</time>
        )}
      </div>

      {/* matchup */}
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <span className="flex-1 text-right text-sm font-semibold text-gray-900">{event.home}</span>
        <span className="rounded-md bg-gray-50 px-2 py-1 text-xs font-bold text-gray-400">VS</span>
        <span className="flex-1 text-left text-sm font-semibold text-gray-900">{event.away}</span>
      </div>

      {/* picks */}
      <div className="px-4 pb-4">
        <PredictionControls event={event} choice={choice} onPick={pick} disabled={locked} />

        {existing && !settled && (
          <p className="mt-2 text-xs text-gray-500">
            Locked in: <span className="font-semibold text-brand">{outcomeLabel(event, existing.choice)}</span> ✓
          </p>
        )}

        {settled && (
          <p className="mt-2 text-xs">
            {choice == null ? (
              <span className="text-gray-400">
                No pick · Result: <b>{outcomeLabel(event, event.result!)}</b>
              </span>
            ) : won ? (
              <span className="font-semibold text-emerald-600">Correct! +{existing?.pointsAwarded ?? 3} pts 🔥</span>
            ) : (
              <span className="text-rose-500">
                Missed · Result was <b>{outcomeLabel(event, event.result!)}</b>
              </span>
            )}
          </p>
        )}
      </div>
    </article>
  );
}
