import type {
  ActivityRecommendationApi,
  RecommendationDriverRow,
  RecommendationRecoveryAnalysis,
} from './types';

type RecoveryAnalysis = RecommendationRecoveryAnalysis;

function trimLabel(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function recoveryRows(analysis: RecoveryAnalysis | null | undefined): RecommendationDriverRow[] {
  if (!analysis) return [];

  const rows: RecommendationDriverRow[] = [];
  const sleep = trimLabel(analysis.sleep_quality);
  if (sleep) {
    rows.push({ id: 'sleep_quality', kind: 'recovery', label: 'Sleep quality', value: sleep });
  }
  const hrv = trimLabel(analysis.hrv_status);
  if (hrv) {
    rows.push({ id: 'hrv_status', kind: 'recovery', label: 'HRV status', value: hrv });
  }
  const fatigue = trimLabel(analysis.fatigue_level);
  if (fatigue) {
    rows.push({ id: 'fatigue_level', kind: 'recovery', label: 'Fatigue', value: fatigue });
  }
  if (analysis.readiness_score != null && Number.isFinite(analysis.readiness_score)) {
    rows.push({
      id: 'readiness_score',
      kind: 'recovery',
      label: 'Readiness',
      value: String(analysis.readiness_score),
    });
  }
  return rows;
}

function normalizeForDedupe(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** True when a free-text factor clearly restates a recovery-analysis value already shown. */
function factorOverlapsRecovery(factor: string, recovery: RecommendationDriverRow[]): boolean {
  const factorNorm = normalizeForDedupe(factor);
  if (!factorNorm) return true;

  return recovery.some((row) => {
    const valueNorm = normalizeForDedupe(row.value);
    const labelNorm = normalizeForDedupe(row.label ?? '');
    if (!valueNorm) return false;
    if (factorNorm === valueNorm) return true;
    if (factorNorm === normalizeForDedupe(`${row.label} ${row.value}`)) return true;
    // e.g. "poor sleep" vs Sleep quality · poor; "critically low sleep" vs sleep_quality "poor"
    const labelToken = labelNorm.split(' ')[0] ?? '';
    if (
      valueNorm.length >= 3 &&
      factorNorm.includes(valueNorm) &&
      labelToken.length >= 3 &&
      factorNorm.includes(labelToken)
    ) {
      return true;
    }
    return false;
  });
}

/**
 * Build ordered plain-language driver rows for the recommendation detail sheet.
 * Uses recovery_analysis labels + key_factors only — does not invent metrics.
 */
export function mapRecommendationDrivers(input: {
  recoveryAnalysis?: RecoveryAnalysis | null;
  keyFactors?: string[] | null;
  /** Optional quiet fuel row; omit when tracking off / unknown. */
  fuelStateLabel?: string | null;
}): RecommendationDriverRow[] {
  const recovery = recoveryRows(input.recoveryAnalysis);
  const rows: RecommendationDriverRow[] = [...recovery];

  const factors = Array.isArray(input.keyFactors) ? input.keyFactors : [];
  for (const [index, raw] of factors.entries()) {
    const factor = trimLabel(raw);
    if (!factor) continue;
    if (factorOverlapsRecovery(factor, recovery)) continue;
    rows.push({
      id: `factor-${index}`,
      kind: 'factor',
      label: null,
      value: factor,
    });
  }

  const fuel = trimLabel(input.fuelStateLabel ?? null);
  if (fuel) {
    rows.push({
      id: 'fuel_state',
      kind: 'fuel',
      label: 'Fueling',
      value: fuel,
    });
  }

  return rows;
}

/** Convenience: drivers from a raw recommendation payload (+ optional fuel label). */
export function mapRecommendationDriversFromApi(
  raw: ActivityRecommendationApi | null | undefined,
  fuelStateLabel?: string | null
): RecommendationDriverRow[] {
  return mapRecommendationDrivers({
    recoveryAnalysis: raw?.analysisJson?.recovery_analysis ?? null,
    keyFactors: raw?.analysisJson?.key_factors ?? null,
    fuelStateLabel,
  });
}

export function formatDriverRowText(row: RecommendationDriverRow): string {
  if (row.label) return `${row.label} · ${row.value}`;
  return row.value;
}
