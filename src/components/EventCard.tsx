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
  const countdown = timeUntil(event.lockTime);

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
    <article className="ticket px-4 pb-4 pt-3.5">
      {/* header: category + status */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
          <span aria-hidden>{theme.emoji}</span>
          <span className="uppercase tracking-wide">{theme.label}</span>
        </span>
        {settled ? (
          <span className="eyebrow text-muted/70">Full time</span>
        ) : (
          <span className="flex items-center gap-1.5 font-mono text-xs text-violet-light">
            <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulseDot" aria-hidden />
            {countdown === "Locked" ? "LOCKED" : countdown}
          </span>
        )}
      </div>

      {/* matchup */}
      <div className="my-3.5 flex items-center gap-3">
        <span className="flex-1 text-right font-display text-lg font-bold leading-tight">{event.home}</span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-ink font-mono text-[0.7rem] font-bold text-muted">
          VS
        </span>
        <span className="flex-1 font-display text-lg font-bold leading-tight">{event.away}</span>
      </div>

      {/* perforated seam */}
      <div className="ticket-seam" aria-hidden />

      {/* pick bar */}
      <PredictionControls event={event} choice={choice} onPick={pick} disabled={locked} />

      {/* status line */}
      {existing && !settled && (
        <p className="mt-2.5 text-xs text-muted">
          Pick locked: <span className="font-semibold text-violet-light">{outcomeLabel(event, existing.choice)}</span>
        </p>
      )}
      {settled && (
        <p className="mt-2.5 text-xs">
          {choice == null ? (
            <span className="text-muted">
              No pick · Result <span className="font-semibold text-white">{outcomeLabel(event, event.result!)}</span>
            </span>
          ) : won ? (
            <span className="font-semibold text-lime">Called it · +{existing?.pointsAwarded ?? 3} pts</span>
          ) : (
            <span className="text-magenta">
              Missed · Result <span className="font-semibold text-white">{outcomeLabel(event, event.result!)}</span>
            </span>
          )}
        </p>
      )}
    </article>
  );
}
