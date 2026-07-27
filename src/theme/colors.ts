/** Theme-invariant brand / state accents — see coach-wattz BRANDING.md */
const accents = {
  brand: '#00DC82',
  brandAction: '#00C16A',
  brandDeep: '#00A155',
  /** Rest / recovery hero accent — calm sky on dark surfaces */
  recovery: '#38bdf8',
  /** Modify hero accent */
  modify: '#f59e0b',
  /** Dark ink for text on brand green — never white */
  ink: '#09090b',
  danger: '#ef4444',
  success: '#22c55e',
  /**
   * Nutrition macro / hydration accents (theme-invariant).
   * Prefer these over raw amber/sky/violet hex in nutrition UI.
   * Keep in sync with `macro.*` / `hydration` in `tailwind.config.js`
   * and `src/theme/nutritionAccents.ts`.
   */
  macroCalories: '#fb923c',
  macroCarbs: '#fbbf24',
  macroProtein: '#60a5fa',
  macroFat: '#a78bfa',
  hydration: '#38bdf8', // same value as recovery — fluid accent
  /**
   * Z1→Z7 training-zone ramp (blue → teal → yellow → orange → red → purple → zinc).
   * Z2 is teal (`#14b8a6`) so it stays distinct from brand green.
   */
  zones: [
    '#3b82f6', // Z1 blue
    '#14b8a6', // Z2 teal
    '#eab308', // Z3 yellow
    '#f97316', // Z4 orange
    '#ef4444', // Z5 red
    '#a855f7', // Z6 purple
    '#52525b', // Z7 zinc
  ] as const,
  /** Neutral fill for structure-profile blocks with unknown intensity */
  zoneNeutral: '#52525b',
  /**
   * Plan season block accents (theme-invariant) — Plan tab timeline.
   * Aligned with web PlanDashboard phase colours; prefer `blockTypeColor()`.
   */
  planBlocks: {
    PREP: '#94a3b8',
    BASE: '#3b82f6',
    BUILD: '#f59e0b',
    PEAK: '#ef4444',
    RACE: '#a855f7',
    TRANSITION: '#00DC82',
  } as const,
} as const;

type SemanticNeutrals = {
  /**
   * Accents as a FOREGROUND (text / icon tint) on the theme's own surface.
   *
   * The `*` fills stay invariant — a brand fill always carries ink text
   * (10.95:1), and chart fills are judged as graphics. As foregrounds the accent
   * palette was tuned for dark surfaces and lands at 1.6:1–3.8:1 on light
   * #fafafa, under the 4.5:1 AA floor, so light mode uses the same hue one step
   * darker. Use these for `tintColor` on glyphs and for text.
   * Mirror `--color-*-on-surface` in global.css / `textColor.*` in tailwind.
   */
  brandOnSurface: string;
  modifyOnSurface: string;
  recoveryOnSurface: string;
  hydrationOnSurface: string;
  dangerOnSurface: string;
  successOnSurface: string;
  macroCaloriesOnSurface: string;
  macroCarbsOnSurface: string;
  macroProteinOnSurface: string;
  macroFatOnSurface: string;
  surface: string;
  card: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textBody: string;
  textMuted: string;
  tintError: string;
  tintSuccess: string;
  /** @deprecated Prefer `surface` — kept for call sites during migration */
  background: string;
  /** @deprecated Prefer `textPrimary` */
  text: string;
  /** Splash / adaptive-icon light fallback */
  backgroundLight: string;
};

const darkNeutrals: SemanticNeutrals = {
  brandOnSurface: '#00DC82', // 10.95:1 on #09090b — AAA
  modifyOnSurface: '#f59e0b',
  recoveryOnSurface: '#38bdf8',
  hydrationOnSurface: '#38bdf8',
  // red-400, not the danger accent: lighter, so it also clears the tinted
  // error card (5.84 vs 4.29 on #450a0a).
  dangerOnSurface: '#f87171',
  successOnSurface: '#22c55e',
  macroCaloriesOnSurface: '#fb923c',
  macroCarbsOnSurface: '#fbbf24',
  macroProteinOnSurface: '#60a5fa',
  macroFatOnSurface: '#a78bfa',
  surface: '#09090b',
  card: '#18181b',
  border: '#27272a',
  borderStrong: '#3f3f46',
  textPrimary: '#ffffff',
  textBody: '#e4e4e7',
  textMuted: '#71717a',
  tintError: '#450a0a',
  tintSuccess: '#052e16',
  background: '#09090b',
  text: '#fafafa',
  backgroundLight: '#ffffff',
};

const lightNeutrals: SemanticNeutrals = {
  // Same hue as each accent, one step darker (~Tailwind 700); ratios vs #fafafa.
  brandOnSurface: '#00854E', // 4.51 — AA
  modifyOnSurface: '#b45309', // 4.81 — amber-700
  recoveryOnSurface: '#0369a1', // 5.68 — sky-700
  hydrationOnSurface: '#0369a1', // 5.68 — sky-700
  dangerOnSurface: '#b91c1c', // 6.20 — red-700
  successOnSurface: '#15803d', // 4.81 — green-700
  macroCaloriesOnSurface: '#c2410c', // 4.96 — orange-700
  macroCarbsOnSurface: '#a16207', // 4.72 — yellow-700
  macroProteinOnSurface: '#1d4ed8', // 6.42 — blue-700
  macroFatOnSurface: '#6d28d9', // 6.81 — violet-700
  surface: '#fafafa',
  card: '#ffffff',
  border: '#e4e4e7',
  borderStrong: '#d4d4d8',
  textPrimary: '#09090b',
  textBody: '#3f3f46',
  textMuted: '#52525b', // zinc-600 — AA on #fafafa
  tintError: '#fef2f2',
  tintSuccess: '#f0fdf4',
  background: '#fafafa',
  text: '#09090b',
  backgroundLight: '#ffffff',
};

export const Themes = {
  dark: { ...accents, ...darkNeutrals },
  light: { ...accents, ...lightNeutrals },
} as const;

export type ThemeColors = (typeof Themes)['dark'];

/**
 * Dark theme map (legacy export). Prefer `useThemeColors()` / `Themes` for
 * theme-aware surfaces. Brand *fills* are identical on both maps, but
 * `brandOnSurface` is not — reading brand text/icon colour off this export
 * pins it to the dark value and will fail contrast in light mode.
 */
export const Colors: ThemeColors = Themes.dark;

/** Resolve the active palette for non-React call sites (widget sync, etc.). */
export function themeColors(scheme: string | null | undefined): ThemeColors {
  return scheme === 'light' ? Themes.light : Themes.dark;
}

/** 0-based zone index; clamps to the last ramp entry for overflow zones. */
export function zoneColor(index: number): string {
  const zones: readonly string[] = Colors.zones;
  if (!Number.isFinite(index) || index < 0) return zones[0] ?? Colors.zoneNeutral;
  if (index >= zones.length) return zones[zones.length - 1] ?? Colors.zoneNeutral;
  return zones[index] ?? Colors.zoneNeutral;
}

/** Plan block / phase type → accent hex from `Colors.planBlocks`. */
export function blockTypeColor(type: string | null | undefined): string {
  const key = (type ?? '').trim().toUpperCase() as keyof typeof Colors.planBlocks;
  return Colors.planBlocks[key] ?? Colors.brand;
}
