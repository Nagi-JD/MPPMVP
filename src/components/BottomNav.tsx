"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Predict", icon: "◎" },
  { href: "/leaderboard", label: "Ranking", icon: "▦" },
  { href: "/leagues", label: "Leagues", icon: "⬡" },
  { href: "/rewards", label: "Rewards", icon: "✦" },
  { href: "/profile", label: "You", icon: "◆" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-line bg-ink-800/80 backdrop-blur-lg">
      <div className="grid grid-cols-5">
        {tabs.map((t) => {
          const active = path === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-col items-center gap-1 py-3 text-[0.68rem] font-semibold transition-colors ${active ? "text-white" : "text-muted"}`}
            >
              <span aria-hidden className={`text-base leading-none ${active ? "text-lime" : ""}`}>{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
