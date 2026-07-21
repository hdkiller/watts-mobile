import type {
  WorkoutCadenceSample,
  WorkoutHeartRateSample,
  WorkoutPowerSample,
  WorkoutRoutePoint,
  WorkoutSpeedSample,
} from '../types';
import { MAX_ROUTE_SAMPLES, MAX_STREAM_SAMPLES } from '../types';

/** @deprecated Use MAX_STREAM_SAMPLES — kept for existing tests/imports. */
export const MAX_HR_SAMPLES = MAX_STREAM_SAMPLES;

export type HeartRateSummary = {
  avg?: number;
  max?: number;
  samples?: WorkoutHeartRateSample[];
};

export type PowerSummary = {
  avg?: number;
  samples?: WorkoutPowerSample[];
};

export type CadenceSummary = {
  samples?: WorkoutCadenceSample[];
};

export type SpeedSummary = {
  samples?: WorkoutSpeedSample[];
};

export type RouteSummary = {
  samples?: WorkoutRoutePoint[];
};

/** Combined FIT record point after merging streams onto one timeline. */
export type MergedStreamPoint = {
  t: number;
  bpm?: number;
  watts?: number;
  rpm?: number;
  mps?: number;
  lat?: number;
  lon?: number;
  altitudeMeters?: number;
  distanceMeters?: number;
};

function downsampleKeepLast<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items;
  const stride = Math.ceil(items.length / max);
  const picked = items.filter((_, i) => i % stride === 0);
  const last = items[items.length - 1]!;
  if (picked[picked.length - 1] !== last) picked.push(last);
  return picked;
}

/**
 * Clean, summarize, and evenly downsample a raw heart-rate stream.
 * Drops physiologically impossible values and keeps the series time-ordered.
 */
export function summarizeHeartRate(raw: { t: number; bpm: number }[]): HeartRateSummary {
  const clean = raw
    .filter((s) => Number.isFinite(s.t) && Number.isFinite(s.bpm) && s.bpm > 0 && s.bpm < 300)
    .sort((a, b) => a.t - b.t);
  if (!clean.length) return {};

  let sum = 0;
  let max = 0;
  for (const s of clean) {
    sum += s.bpm;
    if (s.bpm > max) max = s.bpm;
  }

  return {
    avg: Math.round(sum / clean.length),
    max: Math.round(max),
    samples: downsampleKeepLast(clean, MAX_STREAM_SAMPLES).map((s) => ({
      t: new Date(s.t).toISOString(),
      bpm: Math.round(s.bpm),
    })),
  };
}

export function summarizePower(raw: { t: number; watts: number }[]): PowerSummary {
  const clean = raw
    .filter((s) => Number.isFinite(s.t) && Number.isFinite(s.watts) && s.watts >= 0 && s.watts < 3000)
    .sort((a, b) => a.t - b.t);
  if (!clean.length) return {};
  const sum = clean.reduce((a, s) => a + s.watts, 0);
  return {
    avg: Math.round(sum / clean.length),
    samples: downsampleKeepLast(clean, MAX_STREAM_SAMPLES).map((s) => ({
      t: new Date(s.t).toISOString(),
      watts: Math.round(s.watts),
    })),
  };
}

export function summarizeCadence(raw: { t: number; rpm: number }[]): CadenceSummary {
  const clean = raw
    .filter((s) => Number.isFinite(s.t) && Number.isFinite(s.rpm) && s.rpm >= 0 && s.rpm < 300)
    .sort((a, b) => a.t - b.t);
  if (!clean.length) return {};
  return {
    samples: downsampleKeepLast(clean, MAX_STREAM_SAMPLES).map((s) => ({
      t: new Date(s.t).toISOString(),
      rpm: Math.round(s.rpm),
    })),
  };
}

export function summarizeSpeed(raw: { t: number; mps: number }[]): SpeedSummary {
  const clean = raw
    .filter((s) => Number.isFinite(s.t) && Number.isFinite(s.mps) && s.mps >= 0 && s.mps < 50)
    .sort((a, b) => a.t - b.t);
  if (!clean.length) return {};
  return {
    samples: downsampleKeepLast(clean, MAX_STREAM_SAMPLES).map((s) => ({
      t: new Date(s.t).toISOString(),
      mps: Math.round(s.mps * 1000) / 1000,
    })),
  };
}

export function summarizeRoute(
  raw: { t: number; lat: number; lon: number; altitudeMeters?: number }[]
): RouteSummary {
  const clean = raw
    .filter(
      (s) =>
        Number.isFinite(s.t) &&
        Number.isFinite(s.lat) &&
        Number.isFinite(s.lon) &&
        Math.abs(s.lat) <= 90 &&
        Math.abs(s.lon) <= 180
    )
    .sort((a, b) => a.t - b.t);
  if (!clean.length) return {};
  return {
    samples: downsampleKeepLast(clean, MAX_ROUTE_SAMPLES).map((s) => ({
      t: new Date(s.t).toISOString(),
      lat: s.lat,
      lon: s.lon,
      altitudeMeters: s.altitudeMeters,
    })),
  };
}

/**
 * Merge discrete streams onto a shared timeline for FIT `record` messages.
 * Every stream that exists is nearest-neighbor aligned at every emitted timestamp,
 * because coach-wattz stores FIT streams as parallel arrays.
 */
export function mergeWorkoutStreams(input: {
  heartRate?: WorkoutHeartRateSample[];
  power?: WorkoutPowerSample[];
  cadence?: WorkoutCadenceSample[];
  speed?: WorkoutSpeedSample[];
  route?: WorkoutRoutePoint[];
}): MergedStreamPoint[] {
  const withMs = <T extends { t: string }>(samples: T[] | undefined) =>
    (samples ?? [])
      .map((sample) => ({ sample, t: new Date(sample.t).getTime() }))
      .filter((entry) => Number.isFinite(entry.t))
      .sort((a, b) => a.t - b.t);

  const heartRate = withMs(input.heartRate);
  const power = withMs(input.power);
  const cadence = withMs(input.cadence);
  const speed = withMs(input.speed);
  const route = withMs(input.route);
  const altitude = route.filter((entry) => entry.sample.altitudeMeters != null);
  const timeline = [
    ...heartRate.map((s) => s.t),
    ...power.map((s) => s.t),
    ...cadence.map((s) => s.t),
    ...speed.map((s) => s.t),
    ...route.map((s) => s.t),
  ].sort((a, b) => a - b);
  const uniqueTimeline = timeline.filter((t, index) => index === 0 || timeline[index - 1] !== t);

  const nearest = <T>(samples: { sample: T; t: number }[], t: number): T | undefined => {
    if (!samples.length) return undefined;
    let lo = 0;
    let hi = samples.length - 1;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (samples[mid]!.t < t) lo = mid + 1;
      else hi = mid;
    }
    const next = samples[lo]!;
    const previous = lo > 0 ? samples[lo - 1]! : undefined;
    return previous && Math.abs(previous.t - t) <= Math.abs(next.t - t)
      ? previous.sample
      : next.sample;
  };

  const aligned = uniqueTimeline.map((t): MergedStreamPoint => {
    const hr = nearest(heartRate, t);
    const pwr = nearest(power, t);
    const cad = nearest(cadence, t);
    const spd = nearest(speed, t);
    const loc = nearest(route, t);
    return {
      t,
      bpm: hr?.bpm,
      watts: pwr?.watts,
      rpm: cad?.rpm,
      mps: spd?.mps,
      lat: loc?.lat,
      lon: loc?.lon,
      altitudeMeters: nearest(altitude, t)?.altitudeMeters,
    };
  });

  if (aligned.length > 0 && (route.length > 1 || speed.length > 1)) {
    aligned[0]!.distanceMeters = 0;
    let cumulative = 0;
    for (let i = 1; i < aligned.length; i++) {
      const previous = aligned[i - 1]!;
      const current = aligned[i]!;
      if (
        route.length > 1 &&
        previous.lat != null &&
        previous.lon != null &&
        current.lat != null &&
        current.lon != null
      ) {
        const toRad = Math.PI / 180;
        const dLat = (current.lat - previous.lat) * toRad;
        const dLon = (current.lon - previous.lon) * toRad;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(previous.lat * toRad) *
            Math.cos(current.lat * toRad) *
            Math.sin(dLon / 2) ** 2;
        const clampedA = Math.min(1, Math.max(0, a));
        cumulative +=
          6_371_000 *
          2 *
          Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));
      } else if (speed.length > 1 && current.mps != null) {
        cumulative += current.mps * Math.max(0, (current.t - previous.t) / 1000);
      }
      current.distanceMeters = cumulative;
    }
  }

  return downsampleKeepLast(aligned, MAX_STREAM_SAMPLES);
}
