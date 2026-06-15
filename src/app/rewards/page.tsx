"use client";

const BADGES = [
  { icon: "🎯", name: "Sharp Shooter", desc: "80%+ accuracy over a season", tone: "text-lime" },
  { icon: "🔥", name: "Hot Streak", desc: "10 correct calls in a row", tone: "text-amber" },
  { icon: "🏀", name: "Court Vision", desc: "Nail an exact NBA score", tone: "text-amber" },
  { icon: "🏎️", name: "Pole Sitter", desc: "Perfect qualifying podium", tone: "text-magenta" },
  { icon: "👑", name: "Oracle", desc: "Call a season champion", tone: "text-violet-light" },
  { icon: "🤝", name: "League Boss", desc: "Win a private mini-league", tone: "text-violet-light" },
];

export default function RewardsPage() {
  return (
    <div className="px-5 pt-7">
      <p className="eyebrow">Coming soon</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Rewards</h1>
      <p className="mt-1 mb-5 text-sm text-muted">
        Earn badges, climb seasonal prize tiers, and unlock premium perks. Social bragging rights only — never real-money betting.
      </p>

      <h2 className="eyebrow mb-2">Badges to chase</h2>
      <div className="grid grid-cols-2 gap-3">
        {BADGES.map((b) => (
          <div key={b.name} className="relative rounded-2xl border border-line bg-ink-800/60 p-4">
            <span className="absolute right-3 top-3 rounded-full border border-line px-1.5 py-0.5 font-mono text-[0.55rem] uppercase text-muted/70">Soon</span>
            <div className={`text-2xl ${b.tone}`} aria-hidden>{b.icon}</div>
            <div className="mt-2 font-display text-sm font-bold">{b.name}</div>
            <div className="mt-0.5 text-xs text-muted">{b.desc}</div>
          </div>
        ))}
      </div>

      <h2 className="eyebrow mb-2 mt-6">Seasonal prizes</h2>
      <div className="rounded-2xl border border-line bg-gradient-to-br from-violet/15 to-transparent p-5">
        <p className="font-display text-lg font-bold">Top of the table, top of the rewards.</p>
        <p className="mt-1 text-sm text-muted">Finish each season highly ranked to earn exclusive badges and profile flair. Premium tier with deeper stats is on the roadmap.</p>
        <button disabled className="mt-4 w-full rounded-xl border border-line py-3 text-sm font-bold text-muted/70">Premium — coming soon</button>
      </div>
    </div>
  );
}
