import type {
  ActivityListItem,
  ActivityRowStatus,
  ActivitySummary,
  PlannedDetail,
  PlannedDetailApi,
  PlannedListItem,
  PlannedListItemApi,
  PlannedStructureStep,
  WorkoutListItemApi,
} from './types';

export function formatDuration(durationSec: number | null | undefined): string | null {
  if (durationSec == null || durationSec <= 0) return null;
  const minutes = Math.round(durationSec / 60);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatActivityDate(date: string | Date | null | undefined): string | null {
  if (date == null) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Honest sync/analysis status from server fields only.
 * Workout list exposes `aiAnalysisStatus`; there is no workout `syncStatus` on the list DTO.
 */
export function mapWorkoutStatus(raw: {
  aiAnalysisStatus?: string | null;
  streams?: { id?: string } | null;
}): ActivityRowStatus {
  const status = (raw.aiAnalysisStatus || '').toUpperCase();

  switch (status) {
    case 'COMPLETED':
      return { kind: 'ready', label: 'Ready' };
    case 'PROCESSING':
    case 'PENDING':
      return { kind: 'processing', label: 'Processing…' };
    case 'FAILED':
      return { kind: 'failed', label: 'Analysis failed' };
    case 'NOT_STARTED':
      return { kind: 'uploaded', label: 'Uploaded' };
    default:
      if (raw.streams?.id) {
        return { kind: 'uploaded', label: 'Uploaded' };
      }
      if (!raw.aiAnalysisStatus) {
        return { kind: 'unknown', label: 'Uploaded' };
      }
      return { kind: 'unknown', label: 'Uploaded' };
  }
}

function loadLabel(tss: number | null, trainingLoad: number | null): string | null {
  if (tss != null && Number.isFinite(tss)) return `TSS ${Math.round(tss)}`;
  if (trainingLoad != null && Number.isFinite(trainingLoad)) {
    return `Load ${Math.round(trainingLoad)}`;
  }
  return null;
}

export function mapWorkoutListItem(raw: WorkoutListItemApi): ActivityListItem {
  const tss = typeof raw.tss === 'number' ? raw.tss : null;
  const trainingLoad = typeof raw.trainingLoad === 'number' ? raw.trainingLoad : null;
  return {
    id: raw.id,
    title: raw.title?.trim() || 'Workout',
    date: raw.date ? String(raw.date) : null,
    type: raw.type ?? null,
    durationSec: typeof raw.durationSec === 'number' ? raw.durationSec : null,
    tss,
    trainingLoad,
    status: mapWorkoutStatus(raw),
  };
}

export function mapWorkoutSummary(raw: WorkoutListItemApi & { description?: string | null }): ActivitySummary {
  const base = mapWorkoutListItem(raw);
  return {
    ...base,
    description: typeof raw.description === 'string' ? raw.description : null,
    loadLabel: loadLabel(base.tss, base.trainingLoad),
  };
}

export function mapPlannedListItem(raw: PlannedListItemApi): PlannedListItem {
  return {
    id: raw.id,
    title: raw.title?.trim() || 'Planned workout',
    date: raw.date ? String(raw.date) : null,
    type: raw.type ?? null,
    durationSec: typeof raw.durationSec === 'number' ? raw.durationSec : null,
    tss: typeof raw.tss === 'number' ? raw.tss : null,
  };
}

function intensityFromStep(step: Record<string, unknown>): string | null {
  const rpe = step.rpe;
  if (typeof rpe === 'number') return `RPE ${rpe}`;

  const power = step.power as { value?: number; range?: { min?: number; max?: number } } | undefined;
  if (power && typeof power.value === 'number') return `${Math.round(power.value)} W`;
  if (power?.range && (power.range.min != null || power.range.max != null)) {
    const min = power.range.min != null ? Math.round(power.range.min) : '?';
    const max = power.range.max != null ? Math.round(power.range.max) : '?';
    return `${min}–${max} W`;
  }

  const hr = step.heartRate as { value?: number; range?: { min?: number; max?: number } } | undefined;
  if (hr && typeof hr.value === 'number') return `${Math.round(hr.value)} bpm`;
  if (hr?.range && (hr.range.min != null || hr.range.max != null)) {
    const min = hr.range.min != null ? Math.round(hr.range.min) : '?';
    const max = hr.range.max != null ? Math.round(hr.range.max) : '?';
    return `${min}–${max} bpm`;
  }

  const pace = step.pace as { value?: number } | undefined;
  if (pace && typeof pace.value === 'number') return `Pace ${pace.value}`;

  const pct = step.intensity ?? step.percentFtp ?? step.ftpPercent;
  if (typeof pct === 'number') return `${Math.round(pct)}%`;

  return null;
}

function stepDurationSec(step: Record<string, unknown>): number | null {
  const sec = step.durationSeconds ?? step.durationSec ?? step.duration;
  if (typeof sec === 'number' && sec > 0) {
    // Some payloads store duration in minutes when < 1000 and labeled oddly; prefer seconds when large.
    return sec;
  }
  return null;
}

function stepName(step: Record<string, unknown>, index: number): string {
  const name = step.name ?? step.title ?? step.type ?? step.intent;
  if (typeof name === 'string' && name.trim()) return name.trim();
  return `Step ${index + 1}`;
}

function flattenSteps(nodes: unknown[], out: PlannedStructureStep[], depth = 0): void {
  if (depth > 3) return;
  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue;
    const step = node as Record<string, unknown>;
    const nested = step.steps;
    if (Array.isArray(nested) && nested.length > 0) {
      const reps =
        typeof step.reps === 'number'
          ? step.reps
          : typeof step.repeat === 'number'
            ? step.repeat
            : null;
      if (reps != null && reps > 1) {
        out.push({
          name: `${stepName(step, out.length)} ×${reps}`,
          durationSec: null,
          intensityLabel: null,
        });
      }
      flattenSteps(nested, out, depth + 1);
      continue;
    }
    out.push({
      name: stepName(step, out.length),
      durationSec: stepDurationSec(step),
      intensityLabel: intensityFromStep(step),
    });
  }
}

/**
 * Compact structure summary from `structuredWorkout`. Returns [] when absent — never invents steps.
 */
export function mapPlannedStructure(structuredWorkout: unknown): PlannedStructureStep[] {
  if (!structuredWorkout || typeof structuredWorkout !== 'object') return [];
  const root = structuredWorkout as { steps?: unknown[]; intervals?: unknown[] };
  const out: PlannedStructureStep[] = [];
  if (Array.isArray(root.steps) && root.steps.length > 0) {
    flattenSteps(root.steps, out);
  } else if (Array.isArray(root.intervals) && root.intervals.length > 0) {
    flattenSteps(root.intervals, out);
  }
  return out.slice(0, 24);
}

export function mapPlannedDetail(raw: PlannedDetailApi): PlannedDetail {
  const base = mapPlannedListItem(raw);
  return {
    ...base,
    description: typeof raw.description === 'string' ? raw.description : null,
    structureSteps: mapPlannedStructure(raw.structuredWorkout),
  };
}

export function workoutWebPath(id: string): string {
  return `/workouts/${id}`;
}

export function plannedWorkoutWebPath(id: string): string {
  return `/workouts/planned/${id}`;
}

export function absoluteInstanceUrl(instanceUrl: string, path: string): string {
  const base = instanceUrl.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
