import type { StreamSeries } from '@/src/features/activity/chartTypes';
import { Colors } from '@/src/theme/colors';

import type { PmcPayload, PmcPoint, PmcSummary } from './types';

function asFiniteNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
}

function dateKey(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export function formStatusTextClass(color: string): string {
  switch (color) {
    case 'green':
      return 'text-emerald-400';
    case 'yellow':
      return 'text-amber-300';
    case 'blue':
      return 'text-sky-400';
    case 'orange':
      return 'text-orange-400';
    case 'red':
      return 'text-red-400';
    default:
      return 'text-text-muted';
  }
}

export function mapPmcPayload(json: unknown): PmcPayload {
  const root = asRecord(json);
  if (!root) throw new Error('Invalid PMC response');

  const summaryRaw = asRecord(root.summary) || {};
  const summary: PmcSummary = {
    currentCTL: asFiniteNumber(summaryRaw.currentCTL) ?? 0,
    currentATL: asFiniteNumber(summaryRaw.currentATL) ?? 0,
    currentTSB: asFiniteNumber(summaryRaw.currentTSB) ?? 0,
    avgTSS: asFiniteNumber(summaryRaw.avgTSS),
    formStatus:
      typeof summaryRaw.formStatus === 'string' && summaryRaw.formStatus
        ? summaryRaw.formStatus
        : 'Unknown',
    formColor:
      typeof summaryRaw.formColor === 'string' && summaryRaw.formColor
        ? summaryRaw.formColor
        : 'gray',
    formDescription:
      typeof summaryRaw.formDescription === 'string' ? summaryRaw.formDescription : '',
    lastUpdated:
      typeof summaryRaw.lastUpdated === 'string' ? summaryRaw.lastUpdated : null,
  };

  const rows = Array.isArray(root.data) ? root.data : [];
  const data: PmcPoint[] = rows
    .map((row) => {
      const obj = asRecord(row);
      if (!obj) return null;
      const date = dateKey(obj.date);
      if (!date) return null;
      return {
        date,
        ctl: asFiniteNumber(obj.ctl) ?? 0,
        atl: asFiniteNumber(obj.atl) ?? 0,
        tsb: asFiniteNumber(obj.tsb) ?? 0,
        tss: asFiniteNumber(obj.tss) ?? 0,
      };
    })
    .filter((p): p is PmcPoint => p != null);

  return { data, summary };
}

export function mapPmcChartSeries(points: PmcPoint[]): {
  series: StreamSeries[];
  durationSec: number;
} {
  if (points.length === 0) {
    return { series: [], durationSec: 1 };
  }

  const durationSec = Math.max(points.length - 1, 1);
  const series: StreamSeries[] = [
    {
      key: 'ctl',
      label: 'Fitness',
      unit: 'CTL',
      color: Colors.brand,
      points: points.map((p, i) => ({ x: i, y: p.ctl })),
    },
    {
      key: 'atl',
      label: 'Fatigue',
      unit: 'ATL',
      color: Colors.modify,
      points: points.map((p, i) => ({ x: i, y: p.atl })),
    },
    {
      key: 'tsb',
      label: 'Form',
      unit: 'TSB',
      color: Colors.recovery,
      points: points.map((p, i) => ({ x: i, y: p.tsb })),
    },
  ];

  return { series, durationSec };
}

export function performanceWebPath(): string {
  return '/performance';
}

export function roundLoad(value: number): number {
  return Math.round(value);
}

export function formatTsb(value: number): string {
  const rounded = roundLoad(value);
  return rounded > 0 ? `+${rounded}` : String(rounded);
}

/**
 * Web dashboard TrendIndicator parity for PMC: current vs mean of prior series.
 * Unlike wellness `calculateTrend`, allows signed baselines (TSB) and uses divisor 1 when mean is 0.
 */
export function calculateLoadTrend(
  current: number | null | undefined,
  history: (number | null | undefined)[]
): number | null {
  if (current == null || !Number.isFinite(current)) return null;
  const valid = history.filter((v): v is number => v != null && Number.isFinite(v));
  if (valid.length === 0) return null;
  let mean = valid.reduce((a, b) => a + b, 0) / valid.length;
  if (mean === 0) mean = 1;
  return Math.round(((current - mean) / Math.abs(mean)) * 100);
}

/** Prior ~7 days: series tip excluded via slice(-8, -1), matching web AthleteProfileCard. */
export function mapPmcTrends(payload: PmcPayload): {
  ctl: number | null;
  atl: number | null;
  tsb: number | null;
} {
  const prior = payload.data.slice(-8, -1);
  return {
    ctl: calculateLoadTrend(
      payload.summary.currentCTL,
      prior.map((p) => p.ctl)
    ),
    atl: calculateLoadTrend(
      payload.summary.currentATL,
      prior.map((p) => p.atl)
    ),
    tsb: calculateLoadTrend(
      payload.summary.currentTSB,
      prior.map((p) => p.tsb)
    ),
  };
}
