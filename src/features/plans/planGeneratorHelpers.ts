import type { AvailabilityDay } from './api';
import type { PlanStrategy, StartingPhase, VolumePreference } from './types';

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
