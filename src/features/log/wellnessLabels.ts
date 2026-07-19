/** Labels match coach-wattz `app/utils/wellness.ts` (Daily Logs & Subjective Metrics). */

export function normalizeStressScore(score: number | null | undefined): number | null {
  if (score == null || !Number.isFinite(score)) return null;
  if (score > 10) return Math.max(0, Math.min(10, Math.round(score) / 10));
  return score;
}

export function getMoodLabel(score: number): string {
  if (score >= 8) return 'Great';
  if (score >= 6) return 'Good';
  if (score >= 4) return 'OK';
  return 'Grumpy';
}

export function getStressLabel(score: number): string {
  const normalized = normalizeStressScore(score) ?? 0;
  if (normalized >= 8) return 'Extreme';
  if (normalized >= 6) return 'High';
  if (normalized >= 4) return 'Average';
  return 'Low';
}

export function getFatigueHelp(score: number): string {
  return score > 7 ? 'Feeling very tired' : 'Normal fatigue';
}

export function getSorenessHelp(score: number): string {
  return score > 7 ? 'Significant muscle pain' : 'Normal recovery';
}

export function clampSubjectiveScore(score: number): number {
  return Math.max(1, Math.min(10, Math.round(score)));
}
