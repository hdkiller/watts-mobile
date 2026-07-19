import type {
  AthleteMetricsFormValues,
  AthleteMetricsPatch,
  AthleteProfile,
  WeightUnits,
} from './types';

/** Matches coach-wattz `LBS_TO_KG`. */
export const LBS_TO_KG = 0.45359237;

export function profileSettingsWebPath(): string {
  return '/profile/settings';
}

export function absoluteInstanceUrl(instanceUrl: string, path: string): string {
  const base = instanceUrl.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function normalizeWeightUnits(raw: unknown): WeightUnits {
  return raw === 'Pounds' ? 'Pounds' : 'Kilograms';
}

export function kgToDisplayWeight(weightKg: number | null, units: WeightUnits): number | null {
  if (weightKg == null || !Number.isFinite(weightKg)) return null;
  if (units === 'Pounds') {
    return Number((weightKg / LBS_TO_KG).toFixed(1));
  }
  return Number(weightKg.toFixed(1));
}

export function weightUnitLabel(units: WeightUnits): string {
  return units === 'Pounds' ? 'lbs' : 'kg';
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value;
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return value;
}

export function parseAthleteProfile(json: unknown): AthleteProfile {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid profile response');
  }
  const root = json as Record<string, unknown>;
  const profile =
    root.profile && typeof root.profile === 'object'
      ? (root.profile as Record<string, unknown>)
      : root;

  return {
    name: asNullableString(profile.name),
    nickname: asNullableString(profile.nickname),
    email: asNullableString(profile.email),
    weightKg: asFiniteNumber(profile.weight),
    weightUnits: normalizeWeightUnits(profile.weightUnits),
    ftp: asFiniteNumber(profile.ftp),
    maxHr: asFiniteNumber(profile.maxHr),
    lthr: asFiniteNumber(profile.lthr),
    // Web treats missing/null as enabled (`!== false`).
    nutritionTrackingEnabled: profile.nutritionTrackingEnabled !== false,
  };
}

/** Same gate as coach-wattz dashboard / nav. */
export function isNutritionTrackingEnabled(
  profile: Pick<AthleteProfile, 'nutritionTrackingEnabled'> | null | undefined
): boolean {
  return profile?.nutritionTrackingEnabled !== false;
}

export function emptyAthleteForm(): AthleteMetricsFormValues {
  return {
    weight: '',
    ftp: '',
    maxHr: '',
    lthr: '',
  };
}

export function formFromAthleteProfile(profile: AthleteProfile): AthleteMetricsFormValues {
  const displayWeight = kgToDisplayWeight(profile.weightKg, profile.weightUnits);
  return {
    weight: displayWeight != null ? String(displayWeight) : '',
    ftp: profile.ftp != null ? String(profile.ftp) : '',
    maxHr: profile.maxHr != null ? String(profile.maxHr) : '',
    lthr: profile.lthr != null ? String(profile.lthr) : '',
  };
}

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

export function parseOptionalInteger(value: string): number | undefined {
  const n = parseOptionalNumber(value);
  if (n == null) return undefined;
  return Math.round(n);
}

export function formHasInvalidNumbers(values: AthleteMetricsFormValues): boolean {
  for (const key of ['weight', 'ftp', 'maxHr', 'lthr'] as const) {
    const trimmed = values[key].trim();
    if (!trimmed) continue;
    if (!Number.isFinite(Number(trimmed))) return true;
  }
  return false;
}

/**
 * Build PATCH body using display units for weight (server converts Pounds → kg
 * when `weightUnits` is Pounds).
 */
export function toAthleteMetricsPatch(
  values: AthleteMetricsFormValues,
  weightUnits: WeightUnits
): AthleteMetricsPatch {
  const patch: AthleteMetricsPatch = {};

  const weight = parseOptionalNumber(values.weight);
  if (weight != null) {
    patch.weight = weight;
    patch.weightUnits = weightUnits;
  }

  const ftp = parseOptionalInteger(values.ftp);
  if (ftp != null) patch.ftp = ftp;

  const maxHr = parseOptionalInteger(values.maxHr);
  if (maxHr != null) patch.maxHr = maxHr;

  const lthr = parseOptionalInteger(values.lthr);
  if (lthr != null) patch.lthr = lthr;

  return patch;
}

export function patchHasFields(patch: AthleteMetricsPatch): boolean {
  return (
    patch.weight !== undefined ||
    patch.ftp !== undefined ||
    patch.maxHr !== undefined ||
    patch.lthr !== undefined
  );
}
