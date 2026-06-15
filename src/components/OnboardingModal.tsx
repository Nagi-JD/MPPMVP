"use client";
import { useState } from "react";
import { SPORTS } from "@/lib/catalog";
import { SportLogo } from "./SportLogo";
import type { Sport } from "@/lib/types";

const ALL: Sport[] = ["basketball", "f1"];

export function OnboardingModal({ onDone }: { onDone: (sports: Sport[]) => void }) {
  const [picked, setPicked] = useState<Sport[]>(["basketball", "f1"]);

  function toggle(s: Sport) {
    setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-line bg-ink-800 p-6 shadow-glow animate-riseIn">
        <p className="eyebrow">Welcome to MPP+</p>
        <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight">Pick your sports</h2>
        <p className="mt-1 text-sm text-muted">
          We&apos;ll line up the leagues you care about. Change them anytime.
        </p>

        <div className="mt-5 space-y-3">
          {ALL.map((s) => {
            const meta = SPORTS[s];
            const on = picked.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggle(s)}
                aria-pressed={on}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition ${
                  on ? `${meta.border} bg-white/[0.04]` : "border-line opacity-70"
                }`}
              >
                <SportLogo sport={s} className="h-7 w-8" />
                <span className="flex-1">
                  <span className="block font-display font-bold">{meta.label}</span>
                  <span className={`text-xs ${meta.accent}`}>
                    {s === "basketball" ? "NBA · EuroLeague · LNB" : "Grand Prix · Championship"}
                  </span>
                </span>
                <span className={`grid h-6 w-6 place-items-center rounded-full border ${on ? "border-lime bg-lime text-ink" : "border-line text-transparent"}`}>
                  ✓
                </span>
              </button>
            );
          })}
        </div>

        <button
          disabled={picked.length === 0}
          onClick={() => onDone(picked)}
          className="mt-6 w-full rounded-xl bg-violet py-3.5 font-bold text-white shadow-glow transition enabled:hover:bg-violet-light disabled:opacity-40"
        >
          Start predicting
        </button>
      </div>
    </div>
  );
}
