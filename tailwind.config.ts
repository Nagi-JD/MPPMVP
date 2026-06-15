import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0B0916", 800: "#15112A", 700: "#1E1838", 600: "#272047" },
        line: "rgba(255,255,255,0.08)",
        violet: { DEFAULT: "#8B5CF6", light: "#A78BFA" },
        magenta: "#E879F9",
        lime: "#B6FF3C",
        amber: "#FFB020",
        muted: "#A89FC9",
        // Kept so any legacy `brand` reference resolves to the floodlight violet.
        brand: { DEFAULT: "#8B5CF6", dark: "#6D28D9" },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: { xl: "0.9rem", "2xl": "1.25rem" },
      boxShadow: {
        glow: "0 10px 40px -12px rgba(139,92,246,0.55)",
        "glow-lime": "0 10px 36px -14px rgba(182,255,60,0.5)",
      },
      keyframes: {
        pulseDot: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.25" } },
        riseIn: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        // Basketball: a bounce.
        bounceIn: {
          "0%": { transform: "scale(0.6) translateY(-8px)", opacity: "0" },
          "55%": { transform: "scale(1.12) translateY(0)", opacity: "1" },
          "75%": { transform: "scale(0.94)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        // F1: a horizontal speed streak.
        speedSweep: {
          "0%": { transform: "translateX(-120%) skewX(-12deg)", opacity: "0" },
          "30%": { opacity: "1" },
          "100%": { transform: "translateX(120%) skewX(-12deg)", opacity: "0" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
        riseIn: "riseIn 0.4s ease-out both",
        bounceIn: "bounceIn 0.6s cubic-bezier(.34,1.56,.64,1) both",
        speedSweep: "speedSweep 0.7s ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;
