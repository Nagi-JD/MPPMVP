"use client";
import type { FixtureBoard } from "@/lib/data/provider";
import type { Prediction } from "@/lib/types";
import { SPORTS } from "@/lib/catalog";
import { timeUntil } from "@/lib/time";
import { MarketRow } from "./MarketRow";
import { SportLogo } from "./SportLogo";

export function FixtureCard({
  board,
  predictions,
  onSubmit,
}: {
  board: FixtureBoard;
  predictions: Prediction[];
  onSubmit: (marketId: string, value: string) => Promise<void>;
}) {
  const { fixture, markets } = board;
  const meta = SPORTS[fixture.sport];
  const settled = fixture.status === "settled";
  const countdown = timeUntil(fixture.lockTime);
  const byMarket = (id: string) => predictions.find((p) => p.marketId === id);

  return (
    <article className={`overflow-hidden rounded-2xl border ${meta.border} bg-ink-800/80 backdrop-blur`}>
      {/* sport-themed header */}
      <header className={`bg-gradient-to-br ${meta.grad} px-4 py-3.5`}>
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-2 text-xs font-semibold ${meta.accent}`}>
            <SportLogo sport={fixture.sport} className="h-4 w-auto" />
            <span className="uppercase tracking-wide">
              {fixture.scope === "season" ? "Season" : fixture.scope === "weekend" ? "Race weekend" : "Match"}
            </span>
          </span>
          {settled ? (
            <span className="eyebrow text-muted/70">Settled</span>
          ) : (
            <span className="flex items-center gap-1.5 font-mono text-xs text-violet-light">
              <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulseDot" aria-hidden />
              {countdown === "Locked" ? "LOCKED" : countdown}
            </span>
          )}
        </div>
        <h3 className="mt-2 font-display text-lg font-bold leading-tight">{fixture.title}</h3>
        {fixture.venue && <p className="text-xs text-muted">{fixture.venue}</p>}
      </header>

      {/* markets */}
      <div className="space-y-2 p-3">
        {markets.map((m) => (
          <MarketRow key={m.id} market={m} sport={fixture.sport} existing={byMarket(m.id)} onSubmit={(v) => onSubmit(m.id, v)} />
        ))}
      </div>
    </article>
  );
}
