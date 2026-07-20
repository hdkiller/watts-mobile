import { humanizeWorkoutType } from '@/src/lib/humanizeWorkoutType';

import type { SportProfile, SportThresholdFormValues, SportThresholdPatch } from './types';

function asFiniteNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value;
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return value;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export function sportSettingsWebPath(): string {
  return '/profile/settings?tab=sports';
}

export function parseSportProfile(raw: unknown): SportProfile | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.id !== 'string' || !row.id) return null;

  return {
    id: row.id,
    name: asNullableString(row.name),
    isDefault: Boolean(row.isDefault),
    types: asStringArray(row.types),
    ftp: asFiniteNumber(row.ftp),
    lthr: asFiniteNumber(row.lthr),
    maxHr: asFiniteNumber(row.maxHr),
    thresholdPace: asFiniteNumber(row.thresholdPace),
    raw: { ...row },
  };
}

export function parseSportProfilesFromProfileResponse(json: unknown): SportProfile[] {
  if (!json || typeof json !== 'object') return [];
  const root = json as Record<string, unknown>;
  const profile =
    root.profile && typeof root.profile === 'object'
      ? (root.profile as Record<string, unknown>)
      : root;
  const list = profile.sportSettings;
  if (!Array.isArray(list)) return [];
  return list
    .map(parseSportProfile)
    .filter((item): item is SportProfile => !!item)
    .sort((a, b) => {
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
      return (a.name || '').localeCompare(b.name || '');
    });
}

export function displaySportName(profile: SportProfile): string {
  if (profile.name?.trim()) return profile.name.trim();
  if (profile.isDefault) return 'Default';
  if (profile.types.length > 0) {
    return humanizeWorkoutType(profile.types[0]) ?? profile.types[0]!;
  }
  return 'Sport profile';
}

/** Secondary types beyond the primary title, humanized (or null when redundant). */
export function sportTypesSubtitle(profile: SportProfile): string | null {
  if (profile.types.length === 0) return null;
  const primary = displaySportName(profile).toLowerCase();
  const extras = profile.types
    .slice(profile.name?.trim() ? 0 : 1)
    .map((t) => humanizeWorkoutType(t) ?? t)
    .filter((label) => label.toLowerCase() !== primary);
  if (extras.length === 0) return null;
  return `Also: ${extras.join(' · ')}`;
}

export function formFromSportProfile(profile: SportProfile): SportThresholdFormValues {
  return {
    ftp: profile.ftp != null ? String(profile.ftp) : '',
    lthr: profile.lthr != null ? String(profile.lthr) : '',
    maxHr: profile.maxHr != null ? String(profile.maxHr) : '',
    thresholdPace: profile.thresholdPace != null ? String(profile.thresholdPace) : '',
  };
}

export function showThresholdPace(profile: SportProfile): boolean {
  return profile.thresholdPace != null;
}

function parseOptionalInt(value: string): number | null | undefined {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return undefined;
  return Math.round(n);
}

function parseOptionalFloat(value: string): number | null | undefined {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

export function formHasInvalidNumbers(
  values: SportThresholdFormValues,
  includePace: boolean
): boolean {
  if (values.ftp.trim() && parseOptionalInt(values.ftp) === undefined) return true;
  if (values.lthr.trim() && parseOptionalInt(values.lthr) === undefined) return true;
  if (values.maxHr.trim() && parseOptionalInt(values.maxHr) === undefined) return true;
  if (includePace && values.thresholdPace.trim() && parseOptionalFloat(values.thresholdPace) === undefined) {
    return true;
  }
  return false;
}

export function toSportThresholdPatch(
  values: SportThresholdFormValues,
  includePace: boolean
): SportThresholdPatch | null {
  const patch: SportThresholdPatch = {};
  const ftp = parseOptionalInt(values.ftp);
  const lthr = parseOptionalInt(values.lthr);
  const maxHr = parseOptionalInt(values.maxHr);
  if (ftp === undefined || lthr === undefined || maxHr === undefined) return null;
  patch.ftp = ftp;
  patch.lthr = lthr;
  patch.maxHr = maxHr;
  if (includePace) {
    const pace = parseOptionalFloat(values.thresholdPace);
    if (pace === undefined) return null;
    patch.thresholdPace = pace;
  }
  return patch;
}

/** Build a single-profile upsert row: original API object + lite field overrides. */
export function buildSportSettingsUpsertPayload(
  profile: SportProfile,
  patch: SportThresholdPatch
): Record<string, unknown>[] {
  return [
    {
      ...profile.raw,
      id: profile.id,
      ftp: patch.ftp !== undefined ? patch.ftp : profile.ftp,
      lthr: patch.lthr !== undefined ? patch.lthr : profile.lthr,
      maxHr: patch.maxHr !== undefined ? patch.maxHr : profile.maxHr,
      thresholdPace:
        patch.thresholdPace !== undefined ? patch.thresholdPace : profile.thresholdPace,
    },
  ];
}

export function thresholdSummary(profile: SportProfile): string {
  const parts: string[] = [];
  if (profile.ftp != null) parts.push(`FTP ${profile.ftp}`);
  if (profile.lthr != null) parts.push(`LTHR ${profile.lthr}`);
  if (profile.maxHr != null) parts.push(`Max HR ${profile.maxHr}`);
  if (parts.length === 0) return 'No thresholds set';
  return parts.join(' · ');
}
