"use client";
import { useState } from "react";
import type { Market, Prediction, Sport } from "@/lib/types";
import { SPORTS } from "@/lib/catalog";

function displayValue(market: Market, value: string): string {
  if (market.input === "score") return value.replace("-", " : ");
  if (market.input === "podium") return value.split(",").join(" › ");
  return value;
}

export function MarketRow({
  market,
  sport,
  existing,
  onSubmit,
}: {
  market: Market;
  sport: Sport;
  existing?: Prediction;
  onSubmit: (value: string) => Promise<void>;
}) {
  const meta = SPORTS[sport];
  const settled = market.status === "settled";
  const locked = settled || new Date(market.lockTime).getTime() <= Date.now();

  // input state
  const init = existing?.value ?? "";
  const [choice, setChoice] = useState(market.input === "choice" ? init : "");
  const [home, setHome] = useState(market.input === "score" ? init.split("-")[0] ?? "" : "");
  const [away, setAway] = useState(market.input === "score" ? init.split("-")[1] ?? "" : "");
  const [podium, setPodium] = useState<string[]>(market.input === "podium" ? init.split(",") : ["", "", ""]);
  const [flash, setFlash] = useState(false);
  const [saving, setSaving] = useState(false);

  function currentValue(): string | null {
    if (market.input === "choice") return choice || null;
    if (market.input === "score") return home !== "" && away !== "" ? `${home}-${away}` : null;
    const [a, b, c] = podium;
    return a && b && c ? `${a},${b},${c}` : null;
  }

  async function confirm() {
    const value = currentValue();
    if (!value || locked || saving) return;
    setSaving(true);
    try {
      await onSubmit(value);
      setFlash(true);
      setTimeout(() => setFlash(false), 700);
    } finally {
      setSaving(false);
    }
  }

  const won = settled && existing && existing.correct;

  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-ink p-3">
      {/* sport-specific validation flash */}
      {flash && (
        <div className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center ${meta.anim}`}>
          <div className={`flex items-center gap-2 rounded-lg bg-ink-700/90 px-3 py-1.5 font-display text-sm font-bold ${meta.accent}`}>
            <span aria-hidden>{meta.emoji}</span> {meta.confirm}!
          </div>
        </div>
      )}

      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold">{market.label}</span>
        <span className="font-mono text-[0.65rem] text-muted" title={`Difficulty ${market.difficulty}`}>
          {"◆".repeat(market.difficulty)}
          <span className="opacity-30">{"◆".repeat(3 - market.difficulty)}</span>
        </span>
      </div>

      {/* settled view */}
      {settled ? (
        <p className="text-xs">
          <span className="text-muted">Result </span>
          <span className="font-mono font-semibold text-white">{displayValue(market, market.result!)}</span>
          {existing && (
            <span className={`ml-2 font-semibold ${won ? "text-lime" : "text-magenta"}`}>
              {won ? `+${existing.pointsAwarded} pts` : "Missed"}
            </span>
          )}
        </p>
      ) : (
        <>
          {/* input by type */}
          {market.input === "choice" && (
            <div className="flex flex-wrap gap-1.5">
              {(market.options ?? []).map((o) => (
                <button
                  key={o}
                  disabled={locked}
                  onClick={() => setChoice(o)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                    choice === o ? "border-violet bg-violet/20 text-white" : "border-line text-muted hover:text-white"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          )}

          {market.input === "score" && (
            <div className="flex items-center gap-2">
              <ScoreInput value={home} onChange={setHome} label="Home" disabled={locked} />
              <span className="font-mono text-muted">:</span>
              <ScoreInput value={away} onChange={setAway} label="Away" disabled={locked} />
            </div>
          )}

          {market.input === "podium" && (
            <div className="grid grid-cols-3 gap-2">
              {["P1", "P2", "P3"].map((pos, i) => (
                <label key={pos} className="text-[0.65rem] text-muted">
                  <span className="font-mono">{pos}</span>
                  <select
                    disabled={locked}
                    value={podium[i] ?? ""}
                    onChange={(e) => setPodium((p) => p.map((v, j) => (j === i ? e.target.value : v)))}
                    className="mt-0.5 w-full rounded-lg border border-line bg-ink-700 px-1.5 py-1.5 text-xs text-white"
                  >
                    <option value="">—</option>
                    {(market.options ?? []).map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          )}

          <div className="mt-2.5 flex items-center justify-between">
            {existing ? (
              <span className="text-[0.7rem] text-violet-light">
                Locked: <span className="font-mono">{displayValue(market, existing.value)}</span>
              </span>
            ) : (
              <span className="text-[0.7rem] text-muted">Not predicted</span>
            )}
            <button
              disabled={locked || !currentValue() || saving}
              onClick={confirm}
              className="rounded-lg bg-violet px-3 py-1.5 text-xs font-bold text-white transition enabled:hover:bg-violet-light disabled:opacity-40"
            >
              {existing ? "Update" : "Confirm"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ScoreInput({ value, onChange, label, disabled }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean }) {
  return (
    <input
      inputMode="numeric"
      aria-label={label}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 3))}
      placeholder="0"
      className="w-14 rounded-lg border border-line bg-ink-700 px-2 py-1.5 text-center font-mono text-sm text-white"
    />
  );
}
