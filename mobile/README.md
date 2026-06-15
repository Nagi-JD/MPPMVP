# MPP+ Mobile (React Native / Expo)

The production-target native client. This package currently ships the **per-sport theming
system** and the themed UI component library.

## Theming

Every sport/league gets a palette derived from its official colours (colours only — no logo
assets). Tokens: `primary, secondary, background, surface, surfaceAlt, text, mutedText,
border, accent, success, danger`.

- `src/theme/sportThemes.ts` — the palettes (`f1`, `nba`, `euroleague`, `lnb`, `default`).
- `src/theme/useSportTheme.tsx` — `SportThemeProvider` + `useSportTheme(sportId?)`.

```tsx
// Page-level: wrap a route so everything below uses that sport's palette.
<SportThemeProvider sport="f1">
  <RaceWeekendScreen />
</SportThemeProvider>

// Component-level: read the active theme, or force one.
const t = useSportTheme();        // active (from provider)
const f1 = useSportTheme("f1");   // explicit
```

F1 renders dark red/black racing; NBA renders blue/red scoreboard — switching the active
sport re-themes the entire UI.

## Themed components (`src/components`)

`SportHeader · SportCard · LeagueCard · EventCard · PredictionCard · PredictionButton ·
LeaderboardRow · RankBadge · ResultCard · RewardCard · SeasonProgressBar`

All consume `useSportTheme()` and accept an optional `sportId` override.

## Run

```bash
cd mobile
npm install
npm start        # Expo dev server (press i / a / w)
npm run typecheck
```

`App.tsx` is a demo screen with a sport switcher showing the full re-theme.

## Aperçu mobile dans Cursor (sans iPhone, sans Chrome)

```bash
cd mobile
npm run preview
```

Puis dans Cursor :

1. `Ctrl+Shift+P` → **Simple Browser: Show**
2. URL : `http://localhost:3100`

L’aperçu s’ouvre dans un **onglet de l’éditeur** (cadre type iPhone). Les changements
de code se reflètent en direct via Expo Web + Fast Refresh.

Alternative : quand le serveur démarre, Cursor peut proposer d’ouvrir l’URL dans le
navigateur intégré — acceptez pour le même effet.
