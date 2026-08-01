/**
 * Shared pace conversion helpers.
 *
 * The API stores pace thresholds/targets in m/s. Humans think in mm:ss per
 * distance unit (km, mile, or 100m depending on sport). These helpers convert
 * between the two so every screen that shows or edits a pace value uses the
 * same math.
 */

/** Format an m/s value as an `M:SS` (minutes-per-km) label. Optional suffix, e.g. `/km`. */
export function mpsToPaceLabel(mps: number, suffix = ''): string {
  const minPerKm = 1000 / (mps * 60);
  if (!Number.isFinite(minPerKm) || minPerKm <= 0) return `${mps.toFixed(2)} m/s`;
  const mins = Math.floor(minPerKm);
  const secs = Math.round((minPerKm - mins) * 60);
  const safeSecs = secs === 60 ? 0 : secs;
  const safeMins = secs === 60 ? mins + 1 : mins;
  return `${safeMins}:${String(safeSecs).padStart(2, '0')}${suffix}`;
}

/**
 * Parse a pace string back to m/s. Accepts `mm:ss` (minutes-per-km, e.g.
 * "5:15") or a plain/decimal number of minutes-per-km (e.g. "5.25").
 * Returns undefined when the input isn't a valid positive pace.
 */
export function parsePaceToMps(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const colonMatch = trimmed.match(/^(\d+):([0-5]?\d)$/);
  let totalMinutes: number;
  if (colonMatch) {
    const mins = Number(colonMatch[1]);
    const secs = Number(colonMatch[2]);
    if (!Number.isFinite(mins) || !Number.isFinite(secs)) return undefined;
    totalMinutes = mins + secs / 60;
  } else {
    const n = Number(trimmed);
    if (!Number.isFinite(n)) return undefined;
    totalMinutes = n;
  }

  if (totalMinutes <= 0) return undefined;
  const mps = 1000 / (totalMinutes * 60);
  return Number.isFinite(mps) && mps > 0 ? mps : undefined;
}
