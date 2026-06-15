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
  const settled = event.status === "settled" && event.result != null;

  function cls(o: Outcome): string {
    if (settled) {
      if (o === event.result) return "bg-lime text-ink shadow-glow-lime";
      if (o === choice) return "text-magenta/70 line-through";
      return "text-muted/50";
    }
    return choice === o
      ? "bg-violet text-white shadow-glow"
      : "text-muted hover:text-white";
  }

  return (
    <div className="grid gap-1.5 rounded-xl border border-line bg-ink p-1.5"
      style={{ gridTemplateColumns: `repeat(${opts.length}, minmax(0,1fr))` }}>
      {opts.map((o) => (
        <button
          key={o}
          disabled={disabled}
          onClick={() => onPick(o)}
          className={`rounded-lg px-2 py-2.5 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed ${cls(o)}`}
        >
          <span className="block truncate">{labels[o](event)}</span>
        </button>
      ))}
    </div>
  );
}
