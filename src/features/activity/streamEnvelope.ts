/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
export type EnvelopePoint = {
  x: number;
  min: number;
  max: number;
  mean: number;
  count: number;
};

type Point = { x: number; y: number };

function finitePoints(points: readonly Point[]): Point[] {
  return points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
}

/**
 * Aggregate a stream into rendered x-axis columns without discarding extrema.
 * Empty columns are omitted, so the result never exceeds either the requested
 * column count or the number of input samples.
 */
export function bucketStreamEnvelope(
  points: readonly Point[],
  columnCount: number,
  domainStart?: number,
  domainEnd?: number,
): EnvelopePoint[] {
  const usable = finitePoints(points);
  const columns = Math.min(Math.max(1, Math.floor(columnCount)), usable.length);
  if (columns === 0) return [];

  const firstX = usable[0]!.x;
  const lastX = usable[usable.length - 1]!.x;
  const x0 = Number.isFinite(domainStart) ? domainStart! : firstX;
  const x1 = Number.isFinite(domainEnd) ? domainEnd! : lastX;
  const span = Math.max(x1 - x0, 1);
  const buckets: (
    { min: number; max: number; sum: number; xSum: number; count: number } | undefined
  )[] = Array.from({ length: columns });

  for (const point of usable) {
    const fraction = (point.x - x0) / span;
    const index = Math.min(columns - 1, Math.max(0, Math.floor(fraction * columns)));
    const bucket = buckets[index];
    if (bucket) {
      bucket.min = Math.min(bucket.min, point.y);
      bucket.max = Math.max(bucket.max, point.y);
      bucket.sum += point.y;
      bucket.xSum += point.x;
      bucket.count += 1;
    } else {
      buckets[index] = {
        min: point.y,
        max: point.y,
        sum: point.y,
        xSum: point.x,
        count: 1,
      };
    }
  }

  return buckets.flatMap((bucket) =>
    bucket
      ? [
          {
            x: bucket.xSum / bucket.count,
            min: bucket.min,
            max: bucket.max,
            mean: bucket.sum / bucket.count,
            count: bucket.count,
          },
        ]
      : [],
  );
}

function nextNiceStep(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const factor = [1, 2, 2.5, 4, 5, 10].find((candidate) => candidate >= normalized) ?? 10;
  return factor * magnitude;
}

/** Three clean, evenly spaced y-axis values that fully contain the data. */
export function niceThreeTickDomain(min: number, max: number): [number, number, number] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 0.5, 1];
  if (max < min) [min, max] = [max, min];
  if (max === min) {
    const padding = Math.max(Math.abs(max) * 0.1, 1);
    min -= padding;
    max += padding;
  }

  let step = nextNiceStep((max - min) / 2);
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const middle = Math.round((min + max) / 2 / step) * step;
    const low = middle - step;
    const high = middle + step;
    if (low <= min && high >= max) return [low, middle, high];
    step = nextNiceStep(step * 1.01);
  }

  return [min, (min + max) / 2, max];
}
