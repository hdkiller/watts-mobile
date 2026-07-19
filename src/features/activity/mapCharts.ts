import { Colors } from '@/src/theme/colors';

import type {
  ActivityStreamCharts,
  ChartPoint,
  PowerCurveApi,
  PowerCurveCharts,
  StreamSeries,
  StreamZoneDef,
  WorkoutStreamsApi,
  ZoneBar,
} from './chartTypes';
import { CHART_DISPLAY_MAX_POINTS } from './chartTypes';

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Uniform downsample of parallel series for SVG rendering. */
export function downsamplePoints(
  xs: number[],
  ys: number[],
  maxPoints: number = CHART_DISPLAY_MAX_POINTS
): ChartPoint[] {
  const n = Math.min(xs.length, ys.length);
  if (n <= 0) return [];
  if (n <= maxPoints) {
    const out: ChartPoint[] = [];
    for (let i = 0; i < n; i++) {
      if (!isFiniteNumber(xs[i]) || !isFiniteNumber(ys[i])) continue;
      out.push({ x: xs[i]!, y: ys[i]! });
    }
    return out;
  }

  const out: ChartPoint[] = [];
  for (let i = 0; i < maxPoints; i++) {
    const idx = Math.floor((i * (n - 1)) / (maxPoints - 1));
    const x = xs[idx];
    const y = ys[idx];
    if (!isFiniteNumber(x) || !isFiniteNumber(y)) continue;
    out.push({ x, y });
  }
  return out;
}

function buildTimeAxis(time: number[] | null | undefined, length: number): number[] {
  if (Array.isArray(time) && time.length >= length) {
    return time.slice(0, length).map((t, i) => (isFiniteNumber(t) ? t : i));
  }
  return Array.from({ length }, (_, i) => i);
}

function mapSeries(
  key: 'watts' | 'heartrate',
  label: string,
  unit: string,
  color: string,
  time: number[] | null | undefined,
  values: number[] | null | undefined
): StreamSeries | null {
  if (!Array.isArray(values) || values.length === 0) return null;
  const usable = values.filter(isFiniteNumber);
  if (usable.length < 2) return null;
  const xs = buildTimeAxis(time, values.length);
  const ys = values.map((v) => (isFiniteNumber(v) ? v : 0));
  const points = downsamplePoints(xs, ys);
  if (points.length < 2) return null;
  return { key, label, unit, color, points };
}

export function mapZoneBars(
  times: number[] | null | undefined,
  zones: StreamZoneDef[] | null | undefined,
  unitSuffix: string
): ZoneBar[] {
  if (!Array.isArray(times) || times.length === 0) return [];
  const total = times.reduce((sum, n) => sum + (isFiniteNumber(n) && n > 0 ? n : 0), 0);
  if (total <= 0) return [];

  const bars: ZoneBar[] = [];
  for (let i = 0; i < times.length; i++) {
    const count = times[i];
    if (!isFiniteNumber(count) || count <= 0) continue;
    const zone = Array.isArray(zones) ? zones[i] : undefined;
    const name =
      zone && typeof zone.name === 'string' && zone.name.trim()
        ? zone.name.trim()
        : `Z${i + 1}`;
    const detail =
      zone && isFiniteNumber(zone.min) && isFiniteNumber(zone.max)
        ? `${Math.round(zone.min)}–${Math.round(zone.max)} ${unitSuffix}`
        : unitSuffix;
    const minutes = count / 60;
    bars.push({
      key: `${name}-${i}`,
      label: name,
      detail,
      minutes,
      fraction: count / total,
    });
  }
  return bars;
}

export function mapActivityStreamCharts(raw: WorkoutStreamsApi): ActivityStreamCharts | null {
  const series: StreamSeries[] = [];
  const power = mapSeries('watts', 'Power', 'W', Colors.brand, raw.time, raw.watts ?? null);
  if (power) series.push(power);
  const hr = mapSeries(
    'heartrate',
    'Heart rate',
    'bpm',
    '#38bdf8',
    raw.time,
    raw.heartrate ?? null
  );
  if (hr) series.push(hr);

  const powerBars = mapZoneBars(raw.powerZoneTimes, raw.powerZones, 'W');
  const hrBars = mapZoneBars(raw.hrZoneTimes, raw.hrZones, 'bpm');
  const zones =
    powerBars.length > 0
      ? { channelLabel: 'Power zones', bars: powerBars }
      : hrBars.length > 0
        ? { channelLabel: 'HR zones', bars: hrBars }
        : null;

  if (series.length === 0 && !zones) return null;

  let durationSec = 0;
  for (const s of series) {
    const last = s.points[s.points.length - 1];
    if (last) durationSec = Math.max(durationSec, last.x);
  }
  if (durationSec <= 0 && Array.isArray(raw.time) && raw.time.length > 0) {
    const lastT = raw.time[raw.time.length - 1];
    if (isFiniteNumber(lastT)) durationSec = lastT;
  }

  return { series, durationSec, zones };
}

export function mapPowerCurveCharts(raw: PowerCurveApi): PowerCurveCharts | null {
  if (!raw.hasPowerData || !Array.isArray(raw.powerCurve) || raw.powerCurve.length === 0) {
    return null;
  }
  const points: { label: string; power: number }[] = [];
  for (const row of raw.powerCurve) {
    if (!row || !isFiniteNumber(row.power) || row.power <= 0) continue;
    const label =
      typeof row.durationLabel === 'string' && row.durationLabel.trim()
        ? row.durationLabel.trim()
        : isFiniteNumber(row.duration)
          ? `${row.duration}s`
          : `P${points.length + 1}`;
    points.push({ label, power: Math.round(row.power) });
  }
  if (points.length === 0) return null;
  const peak20 = raw.summary?.peak20min;
  return {
    points,
    peak20min: isFiniteNumber(peak20) ? Math.round(peak20) : null,
  };
}

export function formatChartMinutes(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
