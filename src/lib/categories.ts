import type { CategorySlug } from "@/lib/types";

export interface CategoryTheme {
  label: string;
  emoji: string;
  /** Tailwind classes for the category chip. */
  chip: string;
  /** Accent ring used on the selected pick. */
  accent: string;
}

export const CATEGORY_THEME: Record<CategorySlug, CategoryTheme> = {
  football: { label: "Football", emoji: "⚽", chip: "bg-emerald-100 text-emerald-700", accent: "emerald" },
  esports: { label: "Esports", emoji: "🎮", chip: "bg-fuchsia-100 text-fuchsia-700", accent: "fuchsia" },
  basketball: { label: "Basketball", emoji: "🏀", chip: "bg-orange-100 text-orange-700", accent: "orange" },
  tennis: { label: "Tennis", emoji: "🎾", chip: "bg-lime-100 text-lime-700", accent: "lime" },
};

export function themeFor(slug: CategorySlug): CategoryTheme {
  return CATEGORY_THEME[slug];
}
