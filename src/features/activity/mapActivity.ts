import type {
  ActivityAnalysis,
  ActivityListItem,
  ActivityRowStatus,
  ActivitySummary,
  AnalysisPhase,
  AnalysisRecommendation,
  AnalysisScore,
  AnalysisSection,
  PlannedDetail,
  PlannedDetailApi,
  PlannedListItem,
  PlannedListItemApi,
  PlannedStructureStep,
  PlannedZoneBand,
  PlannedZoneSummary,
  SummaryMetric,
  WorkoutListItemApi,
  WorkoutSummaryApi,
} from './types';

const COACH_INSTRUCTIONS_MAX = 400;
const ZONE_BAND_MAX = 8;
const ANALYSIS_SECTION_MAX = 6;
const ANALYSIS_REC_MAX = 5;
const ANALYSIS_BULLET_MAX = 5;
const ANALYSIS_POINT_MAX = 4;

export function formatDuration(durationSec: number | null | undefined): string | null {
  if (durationSec == null || durationSec <= 0) return null;
  const minutes = Math.round(durationSec / 60);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export type StepIntensity = {
  /** 0-based zone index when confidently known */
  zoneIndex?: number;
  /** 0–1+ intensity fraction for profile height when known */
  fraction?: number;
};

/** Coggan-style %FTP → 0-based zone index. */
function zoneIndexFromFtpPercent(pct: number): number {
  if (pct < 55) return 0;
  if (pct < 75) return 1;
  if (pct < 90) return 2;
  if (pct < 105) return 3;
  if (pct < 120) return 4;
  if (pct < 150) return 5;
  return 6;
}

const NAMED_ZONE_INDEX: Record<string, number> = {
  recovery: 0,
  'active recovery': 0,
  endurance: 1,
  easy: 1,
  tempo: 2,
  'sweet spot': 2,
  sst: 2,
  threshold: 3,
  ftp: 3,
  lt: 3,
  vo2: 4,
  vo2max: 4,
  'vo2 max': 4,
  anaerobic: 5,
  neuromuscular: 6,
};

/**
 * Best-effort intensity from a structure step's label.
 * Only confident matches (`Z<n>`, `%FTP` / bare `%`, named zones) get color/height hints.
 */
export function stepIntensity(step: {
  intensityLabel?: string | null;
}): StepIntensity {
  const raw = step.intensityLabel?.trim();
  if (!raw) return {};

  const zoneMatch = /^Z\s*(\d+)\b/i.exec(raw);
  if (zoneMatch) {
    const n = Number(zoneMatch[1]);
    if (Number.isFinite(n) && n >= 1 && n <= 9) {
      const zoneIndex = n - 1;
      return { zoneIndex, fraction: Math.min(n / 7, 1) };
    }
  }

  const ftpMatch = /^(\d+(?:\.\d+)?)\s*%(?:\s*FTP)?(?:\b|$)/i.exec(raw);
  if (ftpMatch) {
    const pct = Number(ftpMatch[1]);
    if (Number.isFinite(pct) && pct > 0 && pct <= 250) {
      return {
        zoneIndex: zoneIndexFromFtpPercent(pct),
        fraction: Math.min(pct / 100, 1.2) / 1.2,
      };
    }
  }

  const named = NAMED_ZONE_INDEX[raw.toLowerCase()];
  if (named != null) {
    return { zoneIndex: named, fraction: Math.min((named + 1) / 7, 1) };
  }

  return {};
}

/** Resolve a 0-based zone index from a zone band name (`Z2`, `Zone 3`, etc.). */
export function zoneIndexFromBandName(name: string, fallbackIndex: number): number {
  const fromLabel = stepIntensity({ intensityLabel: name }).zoneIndex;
  if (fromLabel != null) return fromLabel;
  const digits = /(\d+)/.exec(name);
  if (digits) {
    const n = Number(digits[1]);
    if (Number.isFinite(n) && n >= 1 && n <= 9) return n - 1;
  }
  return fallbackIndex;
}

/** Format IF-like intensity (workout `intensity` / planned `workIntensity`). */
export function formatIntensityFactor(value: unknown): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  if (value < 0.1 || value > 2) return null;
  return `IF ${value.toFixed(2)}`;
}

export function formatDistanceMeters(meters: unknown): string | null {
  if (typeof meters !== 'number' || !Number.isFinite(meters) || meters <= 0) return null;
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

export function formatElevationMeters(meters: unknown): string | null {
  if (typeof meters !== 'number' || !Number.isFinite(meters) || meters <= 0) return null;
  return `${Math.round(meters)} m`;
}

function formatWatts(watts: unknown): string | null {
  if (typeof watts !== 'number' || !Number.isFinite(watts) || watts <= 0) return null;
  return `${Math.round(watts)} W`;
}

function formatHr(bpm: unknown): string | null {
  if (typeof bpm !== 'number' || !Number.isFinite(bpm) || bpm <= 0) return null;
  return `${Math.round(bpm)} bpm`;
}

function truncateDisplay(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function titleCaseToken(raw: string): string {
  const lower = raw.toLowerCase().replace(/_/g, ' ');
  return lower.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function mapCompletionLabel(status: string | null | undefined): string | null {
  if (typeof status !== 'string' || !status.trim()) return null;
  const upper = status.trim().toUpperCase();
  switch (upper) {
    case 'PENDING':
      return 'Pending';
    case 'COMPLETED':
      return 'Completed';
    case 'SKIPPED':
      return 'Skipped';
    case 'PARTIAL':
      return 'Partial';
    default:
      return titleCaseToken(status.trim());
  }
}

export function mapSyncLabel(status: string | null | undefined): string | null {
  if (typeof status !== 'string' || !status.trim()) return null;
  const upper = status.trim().toUpperCase();
  switch (upper) {
    case 'SYNCED':
      return 'Synced';
    case 'PENDING':
      return 'Sync pending';
    case 'ERROR':
    case 'FAILED':
      return 'Sync failed';
    default:
      return titleCaseToken(status.trim());
  }
}

export function mapWorkoutSummaryMetrics(raw: WorkoutSummaryApi): SummaryMetric[] {
  const metrics: SummaryMetric[] = [];
  const distance = formatDistanceMeters(raw.distanceMeters);
  if (distance) metrics.push({ key: 'distance', label: 'Distance', value: distance });

  const avgPower = formatWatts(raw.averageWatts);
  if (avgPower) metrics.push({ key: 'avgPower', label: 'Avg power', value: avgPower });

  const np = formatWatts(raw.normalizedPower);
  if (np) metrics.push({ key: 'np', label: 'NP', value: np });

  const hr = formatHr(raw.averageHr);
  if (hr) metrics.push({ key: 'avgHr', label: 'Avg HR', value: hr });

  const elev = formatElevationMeters(raw.elevationGain);
  if (elev) metrics.push({ key: 'elevation', label: 'Elevation', value: elev });

  const intensity = formatIntensityFactor(raw.intensity);
  if (intensity) metrics.push({ key: 'intensity', label: 'Intensity', value: intensity });

  return metrics;
}

export function mapCoachInstructions(structuredWorkout: unknown): string | null {
  if (!structuredWorkout || typeof structuredWorkout !== 'object') return null;
  const value = (structuredWorkout as { coachInstructions?: unknown }).coachInstructions;
  if (typeof value !== 'string' || !value.trim()) return null;
  return truncateDisplay(value, COACH_INSTRUCTIONS_MAX);
}

function formatPaceMps(mps: number): string {
  const minPerKm = 1000 / (mps * 60);
  if (!Number.isFinite(minPerKm) || minPerKm <= 0) return `${mps.toFixed(2)} m/s`;
  const mins = Math.floor(minPerKm);
  const secs = Math.round((minPerKm - mins) * 60);
  const safeSecs = secs === 60 ? 0 : secs;
  const safeMins = secs === 60 ? mins + 1 : mins;
  return `${safeMins}:${String(safeSecs).padStart(2, '0')}/km`;
}

function mapZoneBands(
  ranges: unknown,
  formatBound: (n: number) => string
): PlannedZoneBand[] {
  if (!Array.isArray(ranges)) return [];
  const bands: PlannedZoneBand[] = [];
  for (let i = 0; i < ranges.length && bands.length < ZONE_BAND_MAX; i++) {
    const row = ranges[i];
    if (!row || typeof row !== 'object') continue;
    const r = row as { min?: unknown; max?: unknown; name?: unknown };
    const min = typeof r.min === 'number' && Number.isFinite(r.min) ? r.min : null;
    const max = typeof r.max === 'number' && Number.isFinite(r.max) ? r.max : null;
    if (min == null && max == null) continue;
    const name =
      typeof r.name === 'string' && r.name.trim() ? r.name.trim() : `Z${bands.length + 1}`;
    const lo = min != null ? formatBound(min) : '?';
    const hi = max != null ? formatBound(max) : '?';
    bands.push({ name, rangeLabel: `${lo}–${hi}` });
  }
  return bands;
}

/**
 * Compact zone summary from `structuredWorkout.zoneProfileSnapshot`.
 * Prefers power → heart rate → pace. Returns null when absent/empty.
 */
export function mapZoneSummary(structuredWorkout: unknown): PlannedZoneSummary | null {
  if (!structuredWorkout || typeof structuredWorkout !== 'object') return null;
  const snapshot = (structuredWorkout as { zoneProfileSnapshot?: unknown }).zoneProfileSnapshot;
  if (!snapshot || typeof snapshot !== 'object') return null;
  const s = snapshot as {
    power?: { ranges?: unknown };
    heartRate?: { ranges?: unknown };
    pace?: { ranges?: unknown };
  };

  const powerBands = mapZoneBands(s.power?.ranges, (n) => `${Math.round(n)} W`);
  if (powerBands.length > 0) return { channelLabel: 'Power', bands: powerBands };

  const hrBands = mapZoneBands(s.heartRate?.ranges, (n) => `${Math.round(n)} bpm`);
  if (hrBands.length > 0) return { channelLabel: 'Heart rate', bands: hrBands };

  const paceBands = mapZoneBands(s.pace?.ranges, formatPaceMps);
  if (paceBands.length > 0) return { channelLabel: 'Pace', bands: paceBands };

  return null;
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

function scoreEntry(key: string, label: string, value: unknown): AnalysisScore | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const n = Math.round(value);
  if (n < 1 || n > 10) return null;
  return { key, label, value: n };
}

function mapAnalysisPhase(status: string | null | undefined): AnalysisPhase {
  const upper = (status || '').toUpperCase();
  switch (upper) {
    case 'COMPLETED':
      return 'ready';
    case 'PENDING':
    case 'PROCESSING':
      return 'analyzing';
    case 'FAILED':
      return 'failed';
    case 'QUOTA_EXCEEDED':
      return 'quota';
    case 'NOT_STARTED':
    case '':
      return 'not_started';
    default:
      return 'unknown';
  }
}

function analysisStatusLabel(phase: AnalysisPhase): string {
  switch (phase) {
    case 'ready':
      return 'Analysis ready';
    case 'analyzing':
      return 'Analyzing…';
    case 'failed':
      return 'Analysis failed';
    case 'quota':
      return 'Analysis quota exceeded';
    case 'not_started':
      return 'Not analyzed yet';
    default:
      return 'Analysis status unknown';
  }
}

function stringList(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string' || !item.trim()) continue;
    out.push(item.trim());
    if (out.length >= max) break;
  }
  return out;
}

export function mapActivityAnalysis(raw: WorkoutSummaryApi): ActivityAnalysis {
  const phase = mapAnalysisPhase(raw.aiAnalysisStatus);
  const scores: AnalysisScore[] = [];
  for (const entry of [
    scoreEntry('overall', 'Overall', raw.overallScore),
    scoreEntry('technical', 'Technical', raw.technicalScore),
    scoreEntry('effort', 'Effort', raw.effortScore),
    scoreEntry('pacing', 'Pacing', raw.pacingScore),
    scoreEntry('execution', 'Execution', raw.executionScore),
  ]) {
    if (entry) scores.push(entry);
  }

  let executiveSummary: string | null = null;
  const sections: AnalysisSection[] = [];
  const recommendations: AnalysisRecommendation[] = [];
  let strengths: string[] = [];
  let weaknesses: string[] = [];

  const json = raw.aiAnalysisJson;
  if (json && typeof json === 'object') {
    const body = json as Record<string, unknown>;
    if (typeof body.executive_summary === 'string' && body.executive_summary.trim()) {
      executiveSummary = body.executive_summary.trim();
    }

    if (Array.isArray(body.sections)) {
      for (const row of body.sections) {
        if (!row || typeof row !== 'object') continue;
        const s = row as Record<string, unknown>;
        const title = typeof s.title === 'string' ? s.title.trim() : '';
        if (!title) continue;
        const statusLabel =
          typeof s.status_label === 'string' && s.status_label.trim()
            ? s.status_label.trim()
            : typeof s.status === 'string' && s.status.trim()
              ? titleCaseToken(s.status)
              : null;
        const points = stringList(s.analysis_points, ANALYSIS_POINT_MAX);
        sections.push({ title, statusLabel, points });
        if (sections.length >= ANALYSIS_SECTION_MAX) break;
      }
    }

    if (Array.isArray(body.recommendations)) {
      for (const row of body.recommendations) {
        if (!row || typeof row !== 'object') continue;
        const r = row as Record<string, unknown>;
        const title = typeof r.title === 'string' ? r.title.trim() : '';
        const description = typeof r.description === 'string' ? r.description.trim() : '';
        if (!title && !description) continue;
        recommendations.push({
          title: title || 'Recommendation',
          description,
          priority: typeof r.priority === 'string' ? r.priority : null,
        });
        if (recommendations.length >= ANALYSIS_REC_MAX) break;
      }
    }

    strengths = stringList(body.strengths, ANALYSIS_BULLET_MAX);
    weaknesses = stringList(body.weaknesses, ANALYSIS_BULLET_MAX);

    // Prefer top-level score columns; fill from JSON scores if missing.
    if (scores.length === 0 && body.scores && typeof body.scores === 'object') {
      const nested = body.scores as Record<string, unknown>;
      for (const entry of [
        scoreEntry('overall', 'Overall', nested.overall),
        scoreEntry('technical', 'Technical', nested.technical),
        scoreEntry('effort', 'Effort', nested.effort),
        scoreEntry('pacing', 'Pacing', nested.pacing),
        scoreEntry('execution', 'Execution', nested.execution),
      ]) {
        if (entry) scores.push(entry);
      }
    }
  }

  const markdownFallback =
    !executiveSummary && typeof raw.aiAnalysis === 'string' && raw.aiAnalysis.trim()
      ? truncateDisplay(raw.aiAnalysis, 1200)
      : null;

  const analyzedAt =
    raw.aiAnalyzedAt != null
      ? typeof raw.aiAnalyzedAt === 'string'
        ? raw.aiAnalyzedAt
        : raw.aiAnalyzedAt.toISOString()
      : null;

  const hasContent = Boolean(
    scores.length > 0 ||
      executiveSummary ||
      sections.length > 0 ||
      recommendations.length > 0 ||
      strengths.length > 0 ||
      weaknesses.length > 0 ||
      markdownFallback
  );

  return {
    phase,
    statusLabel: analysisStatusLabel(phase),
    scores,
    executiveSummary,
    sections,
    recommendations,
    strengths,
    weaknesses,
    markdownFallback,
    analyzedAt,
    hasContent,
  };
}

export function mapWorkoutSummary(raw: WorkoutSummaryApi): ActivitySummary {
  const base = mapWorkoutListItem(raw);
  return {
    ...base,
    description: typeof raw.description === 'string' ? raw.description : null,
    loadLabel: loadLabel(base.tss, base.trainingLoad),
    metrics: mapWorkoutSummaryMetrics(raw),
    analysis: mapActivityAnalysis(raw),
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
    workIntensityLabel: formatIntensityFactor(raw.workIntensity),
    completionLabel: mapCompletionLabel(raw.completionStatus),
    syncLabel: mapSyncLabel(raw.syncStatus),
    coachInstructions: mapCoachInstructions(raw.structuredWorkout),
    zoneSummary: mapZoneSummary(raw.structuredWorkout),
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
