import { TIER_STYLE } from "@/lib/catalog";
import type { RankTier } from "@/lib/types";

export function RankBadge({ tier, className = "" }: { tier: RankTier; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-line bg-ink px-2 py-0.5 font-mono text-[0.65rem] font-bold uppercase tracking-wider ${TIER_STYLE[tier]} ${className}`}
    >
      {tier}
    </span>
  );
}
