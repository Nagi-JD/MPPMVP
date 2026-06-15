"use client";
import type { GameEvent, Outcome } from "@/lib/types";

const labels: Record<Outcome, (e: GameEvent) => string> = {
  home: (e) => e.home,
  draw: () => "Draw",
  away: (e) => e.away,
};

const SELECTED = "border-brand bg-brand text-white shadow-sm";
const IDLE = "border-gray-200 bg-white text-gray-700 hover:border-brand/40";
const CORRECT = "border-emerald-500 bg-emerald-500 text-white";
const WRONG = "border-rose-200 bg-rose-50 text-rose-400 line-through";

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
  const settled = event.status === "settled" && event.result != null;

  function cls(o: Outcome): string {
    if (settled) {
      if (o === event.result) return CORRECT;
      if (o === choice) return WRONG;
      return "border-gray-200 bg-white text-gray-400";
    }
    return choice === o ? SELECTED : IDLE;
  }

  return (
    <div className={`mt-3 grid gap-2 ${opts.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
      {opts.map((o) => (
        <button
          key={o}
          disabled={disabled}
          onClick={() => onPick(o)}
          className={`rounded-lg border px-2 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-90 ${cls(o)}`}
        >
          {labels[o](event)}
        </button>
      ))}
    </div>
  );
}
