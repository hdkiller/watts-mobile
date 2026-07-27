/** Warn from this many uses left; above it the hint stays hidden. */
export const LOW_ALLOWANCE_THRESHOLD = 2;

/**
 * Short warning for a metered control ("2 left"), or null while the allowance is
 * comfortable. Deliberately silent above the threshold: the point is to remove
 * the surprise of being blocked mid-task, not to put a counter on every button.
 */
export function formatAllowanceHint(remaining: number | null | undefined): string | null {
  if (remaining === null || remaining === undefined || !Number.isFinite(remaining)) return null;
  if (remaining > LOW_ALLOWANCE_THRESHOLD) return null;
  if (remaining <= 0) return 'None left';
  return remaining === 1 ? '1 left' : `${remaining} left`;
}

/** Turn the server's window ("7 days", "calendar day") into readable copy. */
export function allowanceWindowSuffix(window: string | undefined): string {
  if (!window) return '';
  const normalized = window.toLowerCase();
  if (normalized.includes('calendar') || normalized === '1 day' || normalized === '24 hours') {
    return ' today';
  }
  if (normalized === '7 days') return ' this week';
  if (normalized === '30 days') return ' this month';
  if (normalized.includes('hour'))
    return ` in this ${normalized.replace(' hours', '-hour')} window`;
  return ` in the last ${normalized}`;
}
