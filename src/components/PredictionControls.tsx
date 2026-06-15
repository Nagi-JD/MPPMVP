"use client";
import type { GameEvent, Outcome } from "@/lib/types";

const labels: Record<Outcome, (e: GameEvent) => string> = {
  home: (e) => e.home,
  draw: () => "Draw",
  away: (e) => e.away,
};

export function PredictionControls({
  event,
  choice,
  onPick,
  disabled,
}: {
  event: GameEvent;
  choice?: Outcome;
  onPick: (o: Outcome) => void;
  disabled?: boolean;
}) {
  const opts: Outcome[] = event.category === "football" ? ["home", "draw", "away"] : ["home", "away"];
  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {opts.map((o) => (
        <button
          key={o}
          disabled={disabled}
          onClick={() => onPick(o)}
          className={`rounded-lg border px-2 py-2 text-sm font-medium disabled:opacity-50 ${
            choice === o ? "border-brand bg-brand text-white" : "border-gray-300 bg-white"
          }`}
        >
          {labels[o](event)}
        </button>
      ))}
    </div>
  );
}
