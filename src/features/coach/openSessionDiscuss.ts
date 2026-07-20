import { router, type Href } from 'expo-router';

import { formatDuration } from '@/src/features/activity/mapActivity';
import type { ActivitySummary, PlannedDetail } from '@/src/features/activity/types';

import { setSessionDiscuss } from './sessionDiscussStore';

function metricsLineFromPlanned(data: PlannedDetail): string | null {
  const bits = [
    formatDuration(data.durationSec),
    data.tss != null ? `TSS ${Math.round(data.tss)}` : null,
    data.workIntensityLabel,
  ].filter(Boolean);
  return bits.length ? bits.join(' · ') : null;
}

function metricsLineFromActivity(data: ActivitySummary): string | null {
  const bits = [
    formatDuration(data.durationSec),
    data.tss != null
      ? `TSS ${Math.round(data.tss)}`
      : data.loadLabel
        ? `Load ${data.loadLabel}`
        : null,
  ].filter(Boolean);
  return bits.length ? bits.join(' · ') : null;
}

export function openPlannedSessionDiscuss(data: PlannedDetail): void {
  setSessionDiscuss({
    kind: 'planned',
    id: data.id,
    title: data.title,
    type: data.type,
    date: data.date,
    metricsLine: metricsLineFromPlanned(data),
  });
  router.push('/(app)/(tabs)/coach?discuss=session' as Href);
}

export function openActivitySessionDiscuss(data: ActivitySummary): void {
  const adherence =
    data.planAdherence?.overallScore != null
      ? `${data.planAdherence.overallScore}%${
          data.planAdherence.summary ? ` — ${data.planAdherence.summary}` : ''
        }`
      : data.planAdherence?.summary || null;
  setSessionDiscuss({
    kind: 'activity',
    id: data.id,
    title: data.title,
    type: data.type,
    date: data.date,
    metricsLine: metricsLineFromActivity(data),
    adherenceLine: adherence,
  });
  router.push('/(app)/(tabs)/coach?discuss=session' as Href);
}
