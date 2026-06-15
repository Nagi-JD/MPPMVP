import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { brand: { DEFAULT: "#5A0FC8", dark: "#3d0a87" } } } },
  plugins: [],
} satisfies Config;
