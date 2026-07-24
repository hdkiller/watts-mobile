import { localDateYmd } from '@/src/features/log/mapLogForm';
import { localDateKey } from '@/src/features/today/weekGlance';

import type { AvailabilityDay } from './api';
import type {
  PlanInitializeResult,
  PlanStrategy,
  StartingPhase,
  VolumePreference,
} from './types';

/** Web PlanWizard mapping: ≤5 LOW, ≥10 HIGH, else MID. */
export function volumePreferenceFromHours(hours: number): VolumePreference {
  if (hours <= 5) return 'LOW';
  if (hours >= 10) return 'HIGH';
  return 'MID';
}

export function clampVolumeHours(hours: number): number {
  if (!Number.isFinite(hours)) return 6;
  return Math.min(20, Math.max(3, Math.round(hours * 2) / 2));
}

export type PlanEndMode = 'goal' | 'duration';

export type PhaseGlance = {
  id: string;
  title: string;
  weeksLabel: string;
  rangeLabel: string | null;
  /** Plan block type for `blockTypeColor` accents (BASE, BUILD, …). */
  type: string | null;
};

/** Local calendar YYYY-MM-DD → initialize/activate ISO at UTC noon (matches goal create). */
export function planDateIsoNoon(ymd: string): string {
  return new Date(`${ymd}T12:00:00.000Z`).toISOString();
}

/** End-of-day ISO for initialize `endDate` (web PlanWizard uses 23:59:59). */
export function planEndDateIso(ymd: string): string {
  return new Date(`${ymd}T23:59:59.000Z`).toISOString();
}

export function addWeeksToYmd(ymd: string, weeks: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  if (!y || !m || !d) return ymd;
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + Math.round(weeks) * 7);
  return localDateYmd(date);
}

/** Next Monday after `from` (if today is Monday, returns next week). */
export function nextMondayYmd(from = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const day = d.getDay();
  const daysUntil = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
  d.setDate(d.getDate() + daysUntil);
  return localDateYmd(d);
}

export function clampDurationWeeks(weeks: number): number {
  if (!Number.isFinite(weeks)) return 12;
  return Math.min(52, Math.max(4, Math.round(weeks)));
}

/** Whole weeks from start→end (calendar days / 7, floored). */
export function weeksBetweenYmd(startYmd: string, endYmd: string): number {
  const [sy, sm, sd] = startYmd.split('-').map(Number);
  const [ey, em, ed] = endYmd.split('-').map(Number);
  if (!sy || !sm || !sd || !ey || !em || !ed) return 0;
  const start = new Date(sy, sm - 1, sd).getTime();
  const end = new Date(ey, em - 1, ed).getTime();
  if (end < start) return 0;
  return Math.floor((end - start) / (7 * 86400000));
}

export function resolvePlanEndDateYmd(input: {
  mode: PlanEndMode;
  startYmd: string;
  goalEndYmd: string | null | undefined;
  durationWeeks: number;
}): string | null {
  if (input.mode === 'duration') {
    return addWeeksToYmd(input.startYmd, clampDurationWeeks(input.durationWeeks));
  }
  const goalEnd = input.goalEndYmd?.trim() || null;
  return goalEnd && /^\d{4}-\d{2}-\d{2}$/.test(goalEnd) ? goalEnd : null;
}

/** Server initialize requires ≥4 weeks start→end. */
export function isPlanSpanValid(startYmd: string, endYmd: string): boolean {
  return weeksBetweenYmd(startYmd, endYmd) >= 4;
}

export function defaultSelectedGoalId(
  goalIds: string[],
  preferredId?: string | null,
  primaryId?: string | null
): string | null {
  if (goalIds.length === 0) return null;
  if (goalIds.length === 1) return goalIds[0] ?? null;
  if (preferredId && goalIds.includes(preferredId)) return preferredId;
  if (primaryId && goalIds.includes(primaryId)) return primaryId;
  return goalIds[0] ?? null;
}

export function mapPhaseGlance(
  blocks: NonNullable<PlanInitializeResult['plan']>['blocks'] | undefined
): PhaseGlance[] {
  if (!Array.isArray(blocks)) return [];
  return blocks
    .map((block, index) => {
      const id = typeof block.id === 'string' ? block.id : `block-${index}`;
      const name =
        (typeof block.name === 'string' && block.name.trim()) ||
        (typeof block.type === 'string' && block.type.trim()) ||
        `Phase ${index + 1}`;
      const weeks =
        typeof block.durationWeeks === 'number' && block.durationWeeks > 0
          ? block.durationWeeks
          : Array.isArray(block.weeks)
            ? block.weeks.length
            : 0;
      const startKey = localDateKey(block.startDate);
      let rangeLabel: string | null = null;
      if (startKey && weeks > 0) {
        const endKey = addWeeksToYmd(startKey, weeks);
        rangeLabel = `${startKey} → ${endKey}`;
      } else if (startKey) {
        rangeLabel = startKey;
      }
      const type =
        typeof block.type === 'string' && block.type.trim() ? block.type.trim() : null;
      return {
        id,
        title: name,
        weeksLabel: weeks > 0 ? `${weeks} wk` : '—',
        rangeLabel,
        type,
      };
    })
    .filter((b) => Boolean(b.title));
}

export const DURATION_WEEK_CHIPS = [8, 12, 16, 20, 24] as const;

/** Afternoon training slot so week gen does not treat the day as rest. */
export function buildAvailabilityDays(
  dayOfWeeks: number[],
  sports: string[]
): AvailabilityDay[] {
  const activityTypes = sports.length > 0 ? sports : ['Ride'];
  const gymAccess = activityTypes.some((s) => /gym|weight/i.test(s));
  const bikeAccess = activityTypes.some((s) => /ride|bike/i.test(s));

  return dayOfWeeks.map((dayOfWeek) => ({
    dayOfWeek,
    morning: false,
    afternoon: true,
    evening: false,
    slots: [
      {
        name: 'Afternoon',
        startTime: '14:00',
        duration: 90,
        activityTypes,
        gymAccess,
        bikeAccess,
        indoorOnly: gymAccess && !bikeAccess,
      },
    ],
  }));
}

export const PLAN_STRATEGY_OPTIONS: {
  id: PlanStrategy;
  label: string;
  hint: string;
}[] = [
  { id: 'LINEAR', label: 'Linear', hint: 'Steady progression' },
  { id: 'POLARIZED', label: 'Polarized', hint: 'Mostly easy, some hard' },
  { id: 'BLOCK', label: 'Block', hint: 'Concentrated intensity' },
  { id: 'UNDULATING', label: 'Undulating', hint: 'Varied daily focus' },
  { id: 'REVERSE', label: 'Reverse', hint: 'Hard early, long later' },
  { id: 'MAINTENANCE', label: 'Maintain', hint: 'Stay fit between goals' },
];

export const RECOVERY_RHYTHM_OPTIONS: { id: number; label: string; hint: string }[] = [
  { id: 2, label: '1:1', hint: 'Work · recover' },
  { id: 3, label: '2:1', hint: 'Two on · one off' },
  { id: 4, label: '3:1', hint: 'Classic load cycle' },
  { id: 5, label: '4:1', hint: 'Longer load block' },
];

export const STARTING_PHASE_OPTIONS: {
  id: StartingPhase;
  label: string;
  hint: string;
}[] = [
  { id: 'BASE', label: 'Fresh', hint: 'Start in Base' },
  { id: 'BUILD', label: 'Ready', hint: 'Skip into Build' },
  { id: 'PEAK', label: 'Race-ready', hint: 'Short Peak path' },
];

export const VOLUME_HOUR_CHIPS = [4, 5, 6, 8, 10, 12, 14, 16] as const;
