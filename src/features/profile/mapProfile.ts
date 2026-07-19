import type {
  AthleteMetricsFormValues,
  AthleteMetricsPatch,
  AthleteProfile,
  AiPersona,
  AiSettingsLite,
  DistanceUnits,
  TemperatureUnits,
  WeightUnits,
} from './types';

/** Matches coach-wattz `LBS_TO_KG`. */
export const LBS_TO_KG = 0.45359237;

const AI_PERSONAS: AiPersona[] = [
  'Analytical',
  'Supportive',
  'Drill Sergeant',
  'Motivational',
];

export function profileSettingsWebPath(): string {
  return '/profile/settings';
}

export function athleteProfileWebPath(): string {
  return '/profile/athlete';
}

/** ISO 3166-1 alpha-2 → regional-indicator flag emoji. */
export function countryFlag(country: string | null | undefined): string | null {
  if (!country || typeof country !== 'string') return null;
  const code = country.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return null;
  return String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0)));
}

export function ageFromDob(dob: string | null | undefined): number | null {
  if (!dob || typeof dob !== 'string') return null;
  const birth = new Date(dob.includes('T') ? dob : `${dob}T12:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 0 && age < 130 ? age : null;
}

export function dangerZoneWebPath(): string {
  return '/settings/danger';
}

export function absoluteInstanceUrl(instanceUrl: string, path: string): string {
  const base = instanceUrl.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function normalizeWeightUnits(raw: unknown): WeightUnits {
  return raw === 'Pounds' ? 'Pounds' : 'Kilograms';
}

export function normalizeDistanceUnits(raw: unknown): DistanceUnits {
  return raw === 'Miles' ? 'Miles' : 'Kilometers';
}

export function normalizeTemperatureUnits(raw: unknown): TemperatureUnits {
  return raw === 'Fahrenheit' ? 'Fahrenheit' : 'Celsius';
}

export function normalizeAiPersona(raw: unknown): AiPersona {
  if (typeof raw === 'string' && (AI_PERSONAS as string[]).includes(raw)) {
    return raw as AiPersona;
  }
  return 'Supportive';
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

export function distanceUnitLabel(units: DistanceUnits): string {
  return units === 'Miles' ? 'mi' : 'km';
}

export function temperatureUnitLabel(units: TemperatureUnits): string {
  return units === 'Fahrenheit' ? '°F' : '°C';
}

/** Display unit for weight fields; falls back to kg when profile is missing. */
export function weightUnit(
  profile: Pick<AthleteProfile, 'weightUnits'> | null | undefined
): string {
  return weightUnitLabel(profile?.weightUnits ?? 'Kilograms');
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
    country: asNullableString(profile.country),
    dob: asNullableString(profile.dob),
    weightKg: asFiniteNumber(profile.weight),
    weightUnits: normalizeWeightUnits(profile.weightUnits),
    distanceUnits: normalizeDistanceUnits(profile.distanceUnits),
    temperatureUnits: normalizeTemperatureUnits(profile.temperatureUnits),
    timezone: asNullableString(profile.timezone),
    aiContext: asNullableString(profile.aiContext),
    ftp: asFiniteNumber(profile.ftp),
    maxHr: asFiniteNumber(profile.maxHr),
    lthr: asFiniteNumber(profile.lthr),
    restingHr: asFiniteNumber(profile.restingHr),
    // Web treats missing/null as enabled (`!== false`).
    nutritionTrackingEnabled: profile.nutritionTrackingEnabled !== false,
  };
}

export function parseAiSettingsLite(json: unknown): AiSettingsLite {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid AI settings response');
  }
  const root = json as Record<string, unknown>;
  return {
    aiPersona: normalizeAiPersona(root.aiPersona),
    aiRequireToolApproval: root.aiRequireToolApproval === true,
    nickname: asNullableString(root.nickname),
    aiContext: asNullableString(root.aiContext),
  };
}

export function aiPersonaOptions(): { value: AiPersona; label: string }[] {
  return AI_PERSONAS.map((value) => ({ value, label: value }));
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
