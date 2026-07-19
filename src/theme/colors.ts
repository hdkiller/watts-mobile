/** Coach Watts brand tokens — see coach-wattz BRANDING.md */
export const Colors = {
  brand: '#00DC82',
  brandAction: '#00C16A',
  brandDeep: '#00A155',
  background: '#09090b',
  backgroundLight: '#FFFFFF',
  text: '#FAFAFA',
  textMuted: '#71717a',
  border: '#27272a',
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

/** 0-based zone index; clamps to the last ramp entry for overflow zones. */
export function zoneColor(index: number): string {
  const zones: readonly string[] = Colors.zones;
  if (!Number.isFinite(index) || index < 0) return zones[0] ?? Colors.zoneNeutral;
  if (index >= zones.length) return zones[zones.length - 1] ?? Colors.zoneNeutral;
  return zones[index] ?? Colors.zoneNeutral;
}
