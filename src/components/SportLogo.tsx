import type { Sport } from "@/lib/types";

/**
 * Original, sport-evocative marks (not the trademarked NBA/F1 logos):
 * - f1: red italic speed bars + forward wedge.
 * - basketball: seamed ball in court orange.
 */
export function SportLogo({ sport, className = "h-5 w-5" }: { sport: Sport; className?: string }) {
  if (sport === "f1") {
    return (
      <svg viewBox="0 0 48 24" className={className} role="img" aria-label="Formula 1">
        <g fill="#E10600">
          <path d="M6 15 L30 15 L27 19 L3 19 Z" />
          <path d="M10 9 L42 9 L39 13 L7 13 Z" />
          <path d="M30 3 L46 3 L43 7 L27 7 Z" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label="Basketball">
      <circle cx="12" cy="12" r="10" fill="#F97316" />
      <g fill="none" stroke="#0B0916" strokeWidth="1.4">
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M4.6 4.6 C9 9 9 15 4.6 19.4" />
        <path d="M19.4 4.6 C15 9 15 15 19.4 19.4" />
      </g>
    </svg>
  );
}
