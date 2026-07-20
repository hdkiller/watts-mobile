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
} as const;

type SemanticNeutrals = {
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
 * theme-aware surfaces; brand accents are identical on both maps.
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
