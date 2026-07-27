/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import type { ActivityTerrainPoint } from './chartTypes';

const SMOOTHING_WINDOW_M = 120;
const GRADIENT_HALF_WINDOW_M = 40;
const DRAWDOWN_M = 25;

export type TerrainProfilePoint = ActivityTerrainPoint & {
  smoothedAltitudeM: number;
  gradientPct: number;
};

export type ClimbCategory = 'HC' | 'Cat 1' | 'Cat 2' | 'Cat 3' | 'Cat 4' | null;

export type DerivedClimb = {
  index: number;
  startIndex: number;
  endIndex: number;
  startKm: number;
  lengthM: number;
  gainM: number;
  averageGradePct: number;
  maxGradePct: number;
  vam: number;
  durationSec: number;
  averageWatts: number | null;
  averageHeartrate: number | null;
  averageCadence: number | null;
  averageTempC: number | null;
  category: ClimbCategory;
};

export type TerrainAnalysis = {
  profile: TerrainProfilePoint[];
  climbs: DerivedClimb[];
};

export type TerrainColumn = {
  columnIndex: number;
  distanceM: number;
  maxAltitudeM: number;
  meanGradientPct: number;
};

function lowerBoundDistance(points: readonly ActivityTerrainPoint[], target: number): number {
  let low = 0;
  let high = points.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (points[middle]!.distanceM < target) low = middle + 1;
    else high = middle;
  }
  return Math.min(low, points.length - 1);
}

/** Centered moving average whose width is measured in metres, not samples. */
export function smoothAltitudeByDistance(
  points: readonly ActivityTerrainPoint[],
  windowM: number = SMOOTHING_WINDOW_M,
): number[] {
  if (points.length === 0) return [];
  const radius = Math.max(windowM, 0) / 2;
  const smoothed: number[] = [];
  let left = 0;
  let right = -1;
  let sum = 0;

  for (let index = 0; index < points.length; index += 1) {
    const center = points[index]!.distanceM;
    while (right + 1 < points.length && points[right + 1]!.distanceM <= center + radius) {
      right += 1;
      sum += points[right]!.altitudeM;
    }
    while (left <= right && points[left]!.distanceM < center - radius) {
      sum -= points[left]!.altitudeM;
      left += 1;
    }
    smoothed.push(sum / Math.max(right - left + 1, 1));
  }

  return smoothed;
}

function buildGradient(
  points: readonly ActivityTerrainPoint[],
  altitude: readonly number[],
): number[] {
  return points.map((point, index) => {
    let left = lowerBoundDistance(points, point.distanceM - GRADIENT_HALF_WINDOW_M);
    if (left > 0 && points[left]!.distanceM > point.distanceM - GRADIENT_HALF_WINDOW_M) left -= 1;
    const right = lowerBoundDistance(points, point.distanceM + GRADIENT_HALF_WINDOW_M);
    const distance = points[right]!.distanceM - points[left]!.distanceM;
    if (distance <= 0) return points[index]!.gradePct ?? 0;
    const grade = ((altitude[right]! - altitude[left]!) / distance) * 100;
    return Math.max(-25, Math.min(25, grade));
  });
}

function averageMetric(
  profile: readonly TerrainProfilePoint[],
  startIndex: number,
  endIndex: number,
  key: 'watts' | 'heartrate' | 'cadence' | 'tempC',
): number | null {
  let sum = 0;
  let count = 0;
  for (let index = startIndex; index <= endIndex; index += 1) {
    const value = profile[index]?.[key];
    if (value == null || !Number.isFinite(value)) continue;
    if (key === 'heartrate' && value <= 0) continue;
    sum += value;
    count += 1;
  }
  return count > 0 ? sum / count : null;
}

export function climbCategory(lengthM: number, averageGradePct: number): ClimbCategory {
  const score = lengthM * averageGradePct;
  if (score >= 80_000) return 'HC';
  if (score >= 64_000) return 'Cat 1';
  if (score >= 32_000) return 'Cat 2';
  if (score >= 16_000) return 'Cat 3';
  if (score >= 8_000) return 'Cat 4';
  return null;
}

function buildClimb(
  profile: readonly TerrainProfilePoint[],
  startIndex: number,
  endIndex: number,
  index: number,
): DerivedClimb | null {
  if (endIndex <= startIndex) return null;
  const start = profile[startIndex]!;
  const end = profile[endIndex]!;
  const gainM = end.smoothedAltitudeM - start.smoothedAltitudeM;
  const lengthM = end.distanceM - start.distanceM;
  const durationSec = end.timeSec - start.timeSec;
  const averageGradePct = lengthM > 0 ? (gainM / lengthM) * 100 : 0;
  if (gainM < 100 || lengthM < 1_000 || averageGradePct < 3 || durationSec <= 120) {
    return null;
  }

  let maxGradePct = -Infinity;
  for (let pointIndex = startIndex; pointIndex <= endIndex; pointIndex += 1) {
    maxGradePct = Math.max(maxGradePct, profile[pointIndex]!.gradientPct);
  }

  return {
    index,
    startIndex,
    endIndex,
    startKm: start.distanceM / 1_000,
    lengthM,
    gainM,
    averageGradePct,
    maxGradePct: Number.isFinite(maxGradePct) ? maxGradePct : averageGradePct,
    vam: gainM / (durationSec / 3_600),
    durationSec,
    averageWatts: averageMetric(profile, startIndex, endIndex, 'watts'),
    averageHeartrate: averageMetric(profile, startIndex, endIndex, 'heartrate'),
    averageCadence: averageMetric(profile, startIndex, endIndex, 'cadence'),
    averageTempC: averageMetric(profile, startIndex, endIndex, 'tempC'),
    category: climbCategory(lengthM, averageGradePct),
  };
}

export function deriveTerrainAnalysis(points: readonly ActivityTerrainPoint[]): TerrainAnalysis {
  if (points.length < 3) return { profile: [], climbs: [] };
  const smoothedAltitude = smoothAltitudeByDistance(points);
  const gradient = buildGradient(points, smoothedAltitude);
  const profile = points.map<TerrainProfilePoint>((point, index) => ({
    ...point,
    smoothedAltitudeM: smoothedAltitude[index]!,
    gradientPct: gradient[index]!,
  }));

  const segments: { startIndex: number; endIndex: number }[] = [];
  let minIndex = 0;
  let maxIndex = 0;
  for (let index = 1; index < profile.length; index += 1) {
    const altitude = profile[index]!.smoothedAltitudeM;
    if (altitude > profile[maxIndex]!.smoothedAltitudeM) maxIndex = index;

    if (profile[maxIndex]!.smoothedAltitudeM - altitude > DRAWDOWN_M) {
      segments.push({ startIndex: minIndex, endIndex: maxIndex });
      minIndex = index;
      maxIndex = index;
      continue;
    }

    if (
      profile[maxIndex]!.smoothedAltitudeM - profile[minIndex]!.smoothedAltitudeM < DRAWDOWN_M &&
      altitude < profile[minIndex]!.smoothedAltitudeM
    ) {
      minIndex = index;
      maxIndex = index;
    }
  }
  segments.push({ startIndex: minIndex, endIndex: maxIndex });

  const climbs: DerivedClimb[] = [];
  for (const segment of segments) {
    const climb = buildClimb(profile, segment.startIndex, segment.endIndex, climbs.length);
    if (climb) climbs.push(climb);
  }

  return { profile, climbs };
}

/** Distance-axis terrain columns for a one-rectangle-per-rendered-pixel profile. */
export function bucketTerrainProfile(
  profile: readonly TerrainProfilePoint[],
  columnCount: number,
): TerrainColumn[] {
  if (profile.length === 0) return [];
  const columns = Math.max(1, Math.floor(columnCount));
  const startDistance = profile[0]!.distanceM;
  const distanceSpan = Math.max(profile[profile.length - 1]!.distanceM - startDistance, 1);
  const buckets: (
    { maxAltitudeM: number; gradientSum: number; distanceSum: number; count: number } | undefined
  )[] = Array.from({ length: columns });

  for (const point of profile) {
    const fraction = (point.distanceM - startDistance) / distanceSpan;
    const columnIndex = Math.min(columns - 1, Math.max(0, Math.floor(fraction * columns)));
    const bucket = buckets[columnIndex];
    if (bucket) {
      bucket.maxAltitudeM = Math.max(bucket.maxAltitudeM, point.smoothedAltitudeM);
      bucket.gradientSum += point.gradientPct;
      bucket.distanceSum += point.distanceM;
      bucket.count += 1;
    } else {
      buckets[columnIndex] = {
        maxAltitudeM: point.smoothedAltitudeM,
        gradientSum: point.gradientPct,
        distanceSum: point.distanceM,
        count: 1,
      };
    }
  }

  return buckets.map((bucket, columnIndex) => {
    if (bucket) {
      return {
        columnIndex,
        distanceM: bucket.distanceSum / bucket.count,
        maxAltitudeM: bucket.maxAltitudeM,
        meanGradientPct: bucket.gradientSum / bucket.count,
      };
    }

    // A sparse stream can leave a rendered distance column empty. Interpolate
    // that column so the terrain remains a continuous strip across its width.
    const distanceM = startDistance + ((columnIndex + 0.5) / columns) * distanceSpan;
    const rightIndex = lowerBoundDistance(profile, distanceM);
    const leftIndex = Math.max(0, rightIndex - 1);
    const left = profile[leftIndex]!;
    const right = profile[rightIndex]!;
    const pointSpan = right.distanceM - left.distanceM;
    const fraction = pointSpan > 0 ? (distanceM - left.distanceM) / pointSpan : 0;
    return {
      columnIndex,
      distanceM,
      maxAltitudeM:
        left.smoothedAltitudeM + (right.smoothedAltitudeM - left.smoothedAltitudeM) * fraction,
      meanGradientPct: left.gradientPct + (right.gradientPct - left.gradientPct) * fraction,
    };
  });
}
