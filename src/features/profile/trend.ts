/**
 * Calculates the percentage change between a current value and the average of prior values.
 * Returns null if the current value or history is invalid/empty.
 */
export function calculateTrend(
  current: number | null | undefined,
  history: (number | null | undefined)[]
): number | null {
  if (current == null || !Number.isFinite(current)) return null;

  const validHistory = history.filter(
    (val): val is number => val != null && Number.isFinite(val)
  );

  if (validHistory.length === 0) return null;

  const sum = validHistory.reduce((acc, v) => acc + v, 0);
  const mean = sum / validHistory.length;

  if (mean <= 0) return null;

  const diff = current - mean;
  return Math.round((diff / mean) * 100);
}
