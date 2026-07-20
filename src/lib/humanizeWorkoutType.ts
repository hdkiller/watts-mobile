const ACRONYMS = new Set([
  'ftp',
  'hr',
  'hrv',
  'rpe',
  'tss',
  'if',
  'vo2',
  'mtb',
  'xc',
  'tt',
]);

/**
 * Athlete-facing workout type from server enums like `WeightTraining` / `VirtualRun`.
 */
export function humanizeWorkoutType(type: string | null | undefined): string | null {
  if (type == null) return null;
  const trimmed = type.trim();
  if (!trimmed) return null;

  const spaced = trimmed
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = spaced.split(' ').map((word, index) => {
    const lower = word.toLowerCase();
    if (ACRONYMS.has(lower)) return lower.toUpperCase();
    if (index === 0) return lower.charAt(0).toUpperCase() + lower.slice(1);
    return lower;
  });

  return words.join(' ');
}
