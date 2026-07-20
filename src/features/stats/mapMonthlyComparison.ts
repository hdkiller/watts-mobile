import type { StreamSeries } from '@/src/features/activity/chartTypes';
import { Colors } from '@/src/theme/colors';

import type {
  MonthlyComparisonPayload,
  MonthlyDayMetrics,
  MonthlyMetric,
  MonthlyProgressSummary,
  MonthlyViewMode,
} from './types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
}

function asFiniteNumber(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return value;
}

function mapDayBucket(raw: unknown): MonthlyDayMetrics {
  const obj = asRecord(raw) || {};
  return {
    tss: asFiniteNumber(obj.tss),
    duration: asFiniteNumber(obj.duration),
    distance: asFiniteNumber(obj.distance),
    elevation: asFiniteNumber(obj.elevation),
    count: asFiniteNumber(obj.count),
  };
}

function mapDayMap(
  raw: unknown,
  allowNull = false
): Record<number, MonthlyDayMetrics | null> {
  const obj = asRecord(raw) || {};
  const out: Record<number, MonthlyDayMetrics | null> = {};
  for (let day = 1; day <= 31; day++) {
    const entry = obj[String(day)] ?? obj[day];
    if (entry == null) {
      out[day] = allowNull ? null : mapDayBucket({});
      continue;
    }
    out[day] = mapDayBucket(entry);
  }
  return out;
}

export function mapMonthlyComparisonPayload(json: unknown): MonthlyComparisonPayload {
  const root = asRecord(json);
  if (!root) throw new Error('Invalid monthly comparison response');

  const current = asRecord(root.currentMonth) || {};
  const last = asRecord(root.lastMonth) || {};

  return {
    currentMonthName:
      typeof current.name === 'string' && current.name ? current.name : 'Current',
    lastMonthName: typeof last.name === 'string' && last.name ? last.name : 'Last month',
    todayDay: Math.max(1, Math.min(31, Math.round(asFiniteNumber(root.todayDay) || 1))),
    currentDaily: mapDayMap(current.daily) as Record<number, MonthlyDayMetrics>,
    lastDaily: mapDayMap(last.daily) as Record<number, MonthlyDayMetrics>,
    currentCumulative: mapDayMap(current.cumulative, true),
    lastCumulative: mapDayMap(last.cumulative, true),
  };
}

export function metricUnitLabel(metric: MonthlyMetric): string {
  switch (metric) {
    case 'duration':
      return 'h';
    case 'distance':
      return 'km';
    case 'elevation':
      return 'm';
    case 'count':
      return '';
    default:
      return 'pts';
  }
}

export function formatMetricValue(value: number, metric: MonthlyMetric): string {
  const rounded = Math.round(value);
  const label = metricUnitLabel(metric);
  return label ? `${rounded.toLocaleString()}${label}` : rounded.toLocaleString();
}

export function summarizeMonthlyProgress(
  payload: MonthlyComparisonPayload,
  metric: MonthlyMetric
): MonthlyProgressSummary {
  const currentAtToday = payload.currentCumulative[payload.todayDay];
  const lastAtToday = payload.lastCumulative[payload.todayDay];
  const currentTotal = currentAtToday ? currentAtToday[metric] : 0;
  const lastTotal = lastAtToday ? lastAtToday[metric] : 0;
  const percentDiff =
    lastTotal === 0 ? (currentTotal > 0 ? 100 : 0) : ((currentTotal - lastTotal) / lastTotal) * 100;

  return {
    currentTotal,
    lastTotal,
    percentDiff,
    unitLabel: metricUnitLabel(metric),
    formattedCurrent: formatMetricValue(currentTotal, metric),
    formattedLast: formatMetricValue(lastTotal, metric),
  };
}

export function mapMonthlyChartSeries(
  payload: MonthlyComparisonPayload,
  metric: MonthlyMetric,
  viewMode: MonthlyViewMode
): { series: StreamSeries[]; durationSec: number; endDay: number } {
  // Match web MonthlyComparisonCard: x-axis is days 1–31. Current month stops at
  // today; last month keeps the full curve so month-over-month shape is visible.
  const endDay = 31;
  const pointsCurrent: { x: number; y: number }[] = [];
  const pointsLast: { x: number; y: number }[] = [];

  for (let day = 1; day <= endDay; day++) {
    const currentPoint =
      viewMode === 'cumulative'
        ? payload.currentCumulative[day]
        : payload.currentDaily[day];
    const lastPoint =
      viewMode === 'cumulative' ? payload.lastCumulative[day] : payload.lastDaily[day];

    if (currentPoint && day <= payload.todayDay) {
      pointsCurrent.push({ x: day - 1, y: currentPoint[metric] });
    }
    if (lastPoint) {
      pointsLast.push({ x: day - 1, y: lastPoint[metric] });
    }
  }

  const series: StreamSeries[] = [
    {
      key: 'current',
      label: payload.currentMonthName,
      unit: metricUnitLabel(metric) || metric.toUpperCase(),
      color: Colors.brand,
      points: pointsCurrent,
    },
    {
      key: 'last',
      label: payload.lastMonthName,
      unit: metricUnitLabel(metric) || metric.toUpperCase(),
      color: Colors.textMuted,
      points: pointsLast,
    },
  ].filter((s) => s.points.length > 0);

  return { series, durationSec: Math.max(endDay - 1, 1), endDay };
}

export function formatSportLabel(sport: string): string {
  return sport
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^([a-z])/, (m) => m.toUpperCase());
}

export function dashboardWebPath(): string {
  return '/dashboard';
}

export function formatDeltaPercent(percentDiff: number): string {
  const abs = Math.abs(percentDiff);
  const rounded = abs >= 10 ? Math.round(abs) : Math.round(abs * 10) / 10;
  const sign = percentDiff > 0 ? '+' : percentDiff < 0 ? '−' : '';
  return `${sign}${rounded}%`;
}
