"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Predict" },
  { href: "/leaderboard", label: "Ranking" },
  { href: "/groups", label: "Groups" },
  { href: "/profile", label: "Profile" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 mx-auto max-w-md grid grid-cols-4 border-t bg-white">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`py-3 text-center text-xs font-medium ${path === t.href ? "text-brand" : "text-gray-500"}`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
