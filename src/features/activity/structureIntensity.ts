/**
 * Target-aware intensity for structured-workout mini charts.
 * Semantics aligned with coach-wattz `shared/workout-render-model.ts`
 * (`resolveStepChartIntensity`) + MiniWorkoutChart rest/fallback heights.
 * No cadence overlay or strength block columns (companion non-goals).
 */

import { Colors } from '@/src/theme/colors';

export type ChartMetric = 'power' | 'hr' | 'pace';

export type ChartTargetRefs = {
  ftp: number;
  lthr: number;
  maxHr: number;
  thresholdPace: number;
};

export type ZoneProfileSnapshot = {
  power?: { ranges?: { min?: number; max?: number; name?: string }[] };
  heartRate?: { ranges?: { min?: number; max?: number; name?: string }[] };
  pace?: {
    ranges?: { min?: number; max?: number; name?: string }[];
    thresholdMps?: number;
  };
};

/** Chartable endurance block after flatten + intensity resolve. */
export type StructureChartBlock = {
  key: string;
  durationSec: number;
  /** Relative intensity 0–~1.5; null when unresolved → neutral fill. */
  intensity: number | null;
  zoneIndex: number | null;
  ramp: { start: number; end: number } | null;
};

const MAX_CHART_DEPTH = 16;
const MAX_CHART_STEPS = 80;
const MAX_REPS = 50;
const MAX_SCALE = 1.2;
const REST_FALLBACK = 0.55;
const GENERIC_FALLBACK = 0.75;

/** Default relative bands when snapshot ranges are absent (web MiniWorkoutChart). */
const DEFAULT_ZONE_ENDS = [0.55, 0.75, 0.9, 1.05, 1.2, 1.5, 2.0];

export function emptyChartRefs(): ChartTargetRefs {
  return { ftp: 0, lthr: 0, maxHr: 0, thresholdPace: 0 };
}

export function refsFromAthlete(profile: {
  ftp?: number | null;
  lthr?: number | null;
  maxHr?: number | null;
}): ChartTargetRefs {
  return {
    ftp: typeof profile.ftp === 'number' && profile.ftp > 0 ? profile.ftp : 0,
    lthr: typeof profile.lthr === 'number' && profile.lthr > 0 ? profile.lthr : 0,
    maxHr: typeof profile.maxHr === 'number' && profile.maxHr > 0 ? profile.maxHr : 0,
    thresholdPace: 0,
  };
}

function isUnresolvedTarget(target: unknown): boolean {
  if (!target || typeof target !== 'object') return false;
  const t = target as { unresolved?: unknown; kind?: unknown };
  return t.unresolved === true || t.kind === 'freeform';
}

function finiteMidpoint(
  value: unknown,
  range?: { start?: unknown; end?: unknown; min?: unknown; max?: unknown },
): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (!range) return null;
  const start =
    typeof range.start === 'number'
      ? range.start
      : typeof range.min === 'number'
        ? range.min
        : null;
  const end =
    typeof range.end === 'number' ? range.end : typeof range.max === 'number' ? range.max : null;
  if (start != null && end != null) return (start + end) / 2;
  return null;
}

function unitsLookLikeZone(units: string | null | undefined): boolean {
  if (!units || typeof units !== 'string') return false;
  const u = units.toLowerCase().trim();
  return (
    u.includes('zone') ||
    u === 'z' ||
    /^z\d/.test(u) ||
    u.startsWith('hr_zone') ||
    u.startsWith('power_zone') ||
    u.startsWith('pace_zone')
  );
}

/** Percent / %FTP style power units (not absolute watts). */
export function unitsLookLikePercentFtp(units: string | null | undefined): boolean {
  if (!units || typeof units !== 'string') return false;
  const u = units.toLowerCase().trim().replace(/\s+/g, '');
  if (unitsLookLikeZone(units)) return false;
  return (
    u === '%' ||
    u === '%ftp' ||
    u.includes('%ftp') ||
    u === 'percent' ||
    u === 'percentftp' ||
    u === 'ftp_percent' ||
    u === 'percent_ftp' ||
    u === 'ftppercent'
  );
}

function toRelativePercent(raw: number): number {
  // Web: values > 3 treated as 0–100 scale; ≤3 as already fractional.
  return raw > 3 ? raw / 100 : raw;
}

function paceToMps(value: unknown, unit: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  const u = String(unit ?? '')
    .toLowerCase()
    .trim();
  switch (u) {
    case 'm/s':
    case 'mps':
    case 'metres/second':
    case 'meters/second':
      return value;
    case 'm/min':
    case 'mpm':
      return value / 60;
    case '/km':
    case 'min/km':
    case 'minutes/km':
      return 1000 / (value * 60);
    case 's/km':
    case 'sec/km':
    case 'seconds/km':
      return 1000 / value;
    default:
      return null;
  }
}

function zoneBounds(
  channel: 'power' | 'heartRate' | 'pace',
  zoneIndex: number,
  snapshot?: ZoneProfileSnapshot,
): { start: number; end: number } | null {
  const index = Math.max(1, Math.round(zoneIndex));
  const ranges = snapshot?.[channel]?.ranges;
  const zone = ranges?.[index - 1];
  if (!zone || !Number.isFinite(zone.min) || !Number.isFinite(zone.max)) return null;
  return { start: zone.min as number, end: zone.max as number };
}

/**
 * Relative intensity (0–~1.5) for chart bars; 0 when target unresolved / missing.
 * Port of coach-wattz `resolveStepChartIntensity`.
 */
export function resolveStepChartIntensity(
  step: Record<string, unknown>,
  metric: ChartMetric,
  refs: ChartTargetRefs,
  snapshot?: ZoneProfileSnapshot,
): number {
  if (metric === 'pace') {
    const pace = step.pace as Record<string, unknown> | undefined;
    if (!pace || isUnresolvedTarget(pace)) return 0;
    if (pace.kind === 'zone' && typeof pace.zone === 'number') {
      const bounds = zoneBounds('pace', pace.zone, snapshot);
      const threshold = Number(snapshot?.pace?.thresholdMps || refs.thresholdPace || 0);
      if (bounds && threshold > 0) return (bounds.start + bounds.end) / 2 / threshold;
      return 0;
    }
    const mps =
      pace.metric === 'pace' && pace.rangeMps && typeof pace.rangeMps === 'object'
        ? (() => {
            const r = pace.rangeMps as { min?: unknown; max?: unknown };
            const min = Number(r.min);
            const max = Number(r.max);
            return Number.isFinite(min) && Number.isFinite(max) ? (min + max) / 2 : null;
          })()
        : paceToMps(
            finiteMidpoint(pace.value, pace.range as { start?: unknown; end?: unknown }),
            pace.units || pace.sourceUnit,
          );
    const threshold = Number(snapshot?.pace?.thresholdMps || refs.thresholdPace || 0);
    return mps != null && threshold > 0 ? mps / threshold : 0;
  }

  if (metric === 'hr') {
    const hr = step.heartRate as Record<string, unknown> | undefined;
    if (!hr || isUnresolvedTarget(hr)) return 0;
    const units = String(hr.units || '').toLowerCase();
    if (unitsLookLikeZone(units)) {
      const bounds = zoneBounds('heartRate', Number(hr.value), snapshot);
      const lthr = Number(refs.lthr || 0);
      if (bounds && lthr > 0) return (bounds.start + bounds.end) / 2 / lthr;
      // Zone without LTHR: estimate mid of default band by zone index.
      const z = Math.max(1, Math.round(Number(hr.value)));
      if (Number.isFinite(z))
        return DEFAULT_ZONE_ENDS[Math.min(z - 1, DEFAULT_ZONE_ENDS.length - 1)]! * 0.9;
      return 0;
    }
    const mid = finiteMidpoint(hr.value, hr.range as { start?: unknown; end?: unknown });
    if (mid === null) return 0;
    if (units === 'bpm' || units === '') {
      const lthr = Number(refs.lthr || 0);
      return lthr > 0 ? mid / lthr : 0;
    }
    return toRelativePercent(mid);
  }

  const power = step.power as Record<string, unknown> | undefined;
  if (!power || isUnresolvedTarget(power)) return 0;
  const units = String(power.units || '').toLowerCase();
  if (unitsLookLikeZone(units)) {
    const bounds = zoneBounds('power', Number(power.value), snapshot);
    const ftp = Number(refs.ftp || 0);
    if (bounds && ftp > 0) return (bounds.start + bounds.end) / 2 / ftp;
    const z = Math.max(1, Math.round(Number(power.value)));
    if (Number.isFinite(z)) {
      return DEFAULT_ZONE_ENDS[Math.min(z - 1, DEFAULT_ZONE_ENDS.length - 1)]! * 0.9;
    }
    return 0;
  }
  const mid = finiteMidpoint(power.value, power.range as { start?: unknown; end?: unknown });
  if (mid === null) return 0;
  if (units === 'w' || units === 'watts' || units === '') {
    // Bare numeric with no units: treat large values as watts when FTP known.
    if (units === '' && mid <= 3) return mid;
    const ftp = Number(refs.ftp || 0);
    return ftp > 0 ? mid / ftp : 0;
  }
  if (unitsLookLikePercentFtp(units)) {
    return toRelativePercent(mid);
  }
  return toRelativePercent(mid);
}

function pickMetric(step: Record<string, unknown>): ChartMetric {
  if (step.power && typeof step.power === 'object') return 'power';
  if (step.heartRate && typeof step.heartRate === 'object') return 'hr';
  if (step.pace && typeof step.pace === 'object') return 'pace';
  return 'power';
}

function stepType(step: Record<string, unknown>): string {
  return String(step.type || step.intent || '').toLowerCase();
}

/**
 * Chart intensity with rest/generic fallbacks (web MiniWorkoutChart getStepIntensity).
 * Returns null only when we should paint neutral (no target and not rest/typed fallback).
 */
export function resolveChartStepIntensity(
  step: Record<string, unknown>,
  refs: ChartTargetRefs,
  snapshot?: ZoneProfileSnapshot,
): number | null {
  const metric = pickMetric(step);
  const resolved = resolveStepChartIntensity(step, metric, refs, snapshot);
  if (resolved > 0) return resolved;

  const pct = step.intensity ?? step.percentFtp ?? step.ftpPercent;
  if (typeof pct === 'number' && Number.isFinite(pct) && pct > 0) {
    return toRelativePercent(pct);
  }

  const t = stepType(step);
  if (t === 'rest' || t.includes('rest')) return REST_FALLBACK;
  if (t === 'warmup' || t === 'cooldown' || t.includes('warm') || t.includes('cool')) {
    return GENERIC_FALLBACK;
  }

  // Target present but unresolved (e.g. absolute watts without FTP) → honest neutral.
  if (step.power || step.heartRate || step.pace) return null;

  // Untargeted timed step — soft fallback (web MiniWorkoutChart default 0.75).
  if (stepDurationSec(step) != null) return GENERIC_FALLBACK;
  return null;
}

/** Map relative intensity → 0-based zone using default Coggan-style ends. */
export function zoneIndexFromIntensity(intensity: number): number {
  for (let i = 0; i < DEFAULT_ZONE_ENDS.length; i++) {
    if (intensity <= DEFAULT_ZONE_ENDS[i]!) return Math.min(i, Colors.zones.length - 1);
  }
  return Colors.zones.length - 1;
}

function stepDurationSec(step: Record<string, unknown>): number | null {
  const sec = step.durationSeconds ?? step.durationSec ?? step.duration;
  if (typeof sec === 'number' && Number.isFinite(sec) && sec > 0) return sec;
  return null;
}

function readRampRange(
  step: Record<string, unknown>,
  refs: ChartTargetRefs,
  snapshot?: ZoneProfileSnapshot,
): { start: number; end: number } | null {
  const isRamp = Boolean(
    step.ramp === true ||
    (step.power as { ramp?: boolean } | undefined)?.ramp ||
    (step.heartRate as { ramp?: boolean } | undefined)?.ramp ||
    (step.pace as { ramp?: boolean } | undefined)?.ramp,
  );
  if (!isRamp) return null;

  const metric = pickMetric(step);
  const target =
    metric === 'hr'
      ? (step.heartRate as Record<string, unknown> | undefined)
      : metric === 'pace'
        ? (step.pace as Record<string, unknown> | undefined)
        : (step.power as Record<string, unknown> | undefined);
  if (!target || isUnresolvedTarget(target)) return null;

  const range = target.range as
    { start?: unknown; end?: unknown; min?: unknown; max?: unknown } | undefined;
  if (!range) return null;
  const startRaw =
    typeof range.start === 'number'
      ? range.start
      : typeof range.min === 'number'
        ? range.min
        : null;
  const endRaw =
    typeof range.end === 'number' ? range.end : typeof range.max === 'number' ? range.max : null;
  if (startRaw == null || endRaw == null) return null;

  const units = String(target.units || '').toLowerCase();
  const toRel = (raw: number): number => {
    if (metric === 'power') {
      if (unitsLookLikeZone(units)) {
        const bounds = zoneBounds('power', raw, snapshot);
        if (bounds && refs.ftp > 0) return (bounds.start + bounds.end) / 2 / refs.ftp;
        return (
          DEFAULT_ZONE_ENDS[
            Math.min(Math.max(Math.round(raw) - 1, 0), DEFAULT_ZONE_ENDS.length - 1)
          ]! * 0.9
        );
      }
      if (unitsLookLikePercentFtp(units) || (units !== 'w' && units !== 'watts' && raw <= 3)) {
        return toRelativePercent(raw);
      }
      return refs.ftp > 0 ? raw / refs.ftp : 0;
    }
    if (metric === 'hr') {
      if (unitsLookLikeZone(units)) {
        const bounds = zoneBounds('heartRate', raw, snapshot);
        if (bounds && refs.lthr > 0) return (bounds.start + bounds.end) / 2 / refs.lthr;
        return (
          DEFAULT_ZONE_ENDS[
            Math.min(Math.max(Math.round(raw) - 1, 0), DEFAULT_ZONE_ENDS.length - 1)
          ]! * 0.9
        );
      }
      if (units === 'bpm' || units === '') {
        return refs.lthr > 0 ? raw / refs.lthr : 0;
      }
      return toRelativePercent(raw);
    }
    return toRelativePercent(raw);
  };

  const start = toRel(startRaw);
  const end = toRel(endRaw);
  if (start <= 0 && end <= 0) return null;
  return { start: Math.max(start, 0.05), end: Math.max(end, 0.05) };
}

function extractSnapshot(structuredWorkout: unknown): ZoneProfileSnapshot | undefined {
  if (!structuredWorkout || typeof structuredWorkout !== 'object') return undefined;
  const snap = (structuredWorkout as { zoneProfileSnapshot?: unknown }).zoneProfileSnapshot;
  if (!snap || typeof snap !== 'object') return undefined;
  return snap as ZoneProfileSnapshot;
}

/**
 * Flatten nested/repeated steps for the chart (expands reps).
 * Caps: depth 16, 50 reps, 80 leaf steps.
 */
export function flattenStepsForChart(
  nodes: unknown[],
  out: Record<string, unknown>[] = [],
  depth = 0,
): Record<string, unknown>[] {
  if (depth > MAX_CHART_DEPTH || out.length >= MAX_CHART_STEPS) return out;
  for (const node of nodes) {
    if (out.length >= MAX_CHART_STEPS) break;
    if (!node || typeof node !== 'object') continue;
    const step = node as Record<string, unknown>;
    const nested = step.steps;
    if (Array.isArray(nested) && nested.length > 0) {
      const repsRaw = Number(step.reps ?? step.repeat ?? step.intervals);
      const reps =
        Number.isFinite(repsRaw) && repsRaw > 1 ? Math.min(Math.floor(repsRaw), MAX_REPS) : 1;
      for (let i = 0; i < reps; i++) {
        flattenStepsForChart(nested, out, depth + 1);
        if (out.length >= MAX_CHART_STEPS) break;
      }
      continue;
    }
    out.push(step);
  }
  return out;
}

export function hasStructuredWorkoutPreviewData(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const sw = value as {
    steps?: unknown;
    intervals?: unknown;
    blocks?: unknown;
    exercises?: unknown;
  };
  if (Array.isArray(sw.steps) && sw.steps.length > 0) return true;
  if (Array.isArray(sw.intervals) && sw.intervals.length > 0) return true;
  if (Array.isArray(sw.blocks) && sw.blocks.length > 0) return true;
  if (Array.isArray(sw.exercises) && sw.exercises.length > 0) return true;
  return false;
}

/**
 * Build endurance chart blocks from structuredWorkout.
 * Returns [] for strength-shaped or empty structure.
 */
export function buildStructureChartBlocks(
  structuredWorkout: unknown,
  refs: ChartTargetRefs = emptyChartRefs(),
): StructureChartBlock[] {
  if (!structuredWorkout || typeof structuredWorkout !== 'object') return [];
  const root = structuredWorkout as {
    blocks?: unknown[];
    exercises?: unknown[];
    steps?: unknown[];
    intervals?: unknown[];
  };
  if (Array.isArray(root.blocks) && root.blocks.length > 0) return [];
  if (Array.isArray(root.exercises) && root.exercises.length > 0) return [];

  const nodes =
    Array.isArray(root.steps) && root.steps.length > 0
      ? root.steps
      : Array.isArray(root.intervals) && root.intervals.length > 0
        ? root.intervals
        : [];
  if (nodes.length === 0) return [];

  const snapshot = extractSnapshot(structuredWorkout);
  const flat = flattenStepsForChart(nodes);
  const blocks: StructureChartBlock[] = [];

  for (let i = 0; i < flat.length; i++) {
    const step = flat[i]!;
    const durationSec = stepDurationSec(step);
    if (durationSec == null) continue;

    const intensity = resolveChartStepIntensity(step, refs, snapshot);
    const metric = pickMetric(step);
    const zoneIndex = intensity != null ? zoneIndexFromIntensity(intensity) : null;
    // Prefer explicit Z label when present on zone-unit targets.
    if (zoneIndex != null && metric !== 'pace') {
      const target =
        metric === 'hr'
          ? (step.heartRate as { units?: string; value?: number } | undefined)
          : (step.power as { units?: string; value?: number } | undefined);
      if (target && unitsLookLikeZone(target.units) && typeof target.value === 'number') {
        const z = Math.round(target.value) - 1;
        if (z >= 0 && z < Colors.zones.length) {
          blocks.push({
            key: `step-${i}`,
            durationSec,
            intensity,
            zoneIndex: z,
            ramp: readRampRange(step, refs, snapshot),
          });
          continue;
        }
      }
    }

    blocks.push({
      key: `step-${i}`,
      durationSec,
      intensity,
      zoneIndex,
      ramp: intensity != null ? readRampRange(step, refs, snapshot) : null,
    });
  }

  return blocks;
}

/** Height fraction 0–1 for a relative intensity (120% scale, min visibility). */
export function heightFractionFromIntensity(intensity: number | null): number {
  if (intensity == null || !Number.isFinite(intensity)) return 0.45;
  return Math.min(Math.max(intensity / MAX_SCALE, 0.1), 1);
}
