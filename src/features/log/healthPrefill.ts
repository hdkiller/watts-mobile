import { Platform } from 'react-native';

import { lastNightSleepWindow, mergeIntervalDurationMs } from './sleepIntervals';
import type { HealthPrefill } from './healthPrefillTypes';

export type { HealthPrefill } from './healthPrefillTypes';
export { applyHealthPrefill } from './applyHealthPrefill';

function addLocalDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

/** Asleep category values in HealthKit (core/deep/rem/asleepUnspecified). */
const ASLEEP_UNSPECIFIED = 1;
const STAGE_VALUES = new Set([3, 4, 5]); // core / deep / rem
const ALL_ASLEEP_VALUES = new Set([ASLEEP_UNSPECIFIED, 3, 4, 5]);

async function prefillFromHealthKit(): Promise<HealthPrefill | null> {
  const HK = await import('@kingstinct/react-native-healthkit');
  const available = await HK.isHealthDataAvailable();
  if (!available) return null;

  await HK.requestAuthorization({
    toRead: ['HKQuantityTypeIdentifierBodyMass', 'HKCategoryTypeIdentifierSleepAnalysis'],
  });

  const result: HealthPrefill = { source: 'healthkit' };

  const weight = await HK.getMostRecentQuantitySample('HKQuantityTypeIdentifierBodyMass', 'kg');
  if (weight?.quantity != null && Number.isFinite(weight.quantity)) {
    result.weightKg = String(Math.round(weight.quantity * 10) / 10);
  }

  const { from, to: now } = lastNightSleepWindow();
  const samples = await HK.queryCategorySamples('HKCategoryTypeIdentifierSleepAnalysis', {
    limit: 80,
    ascending: false,
    filter: {
      date: {
        startDate: from,
        endDate: now,
      },
    },
  });

  const parsed = samples
    .map((sample) => {
      const value = typeof sample.value === 'number' ? sample.value : Number(sample.value);
      const start = new Date(sample.startDate).getTime();
      const end = new Date(sample.endDate).getTime();
      return { value, start, end };
    })
    .filter((s) => ALL_ASLEEP_VALUES.has(s.value) && s.end > s.start);

  // Prefer stage samples when present so watch stages + phone "asleep" don't double-count.
  const hasStages = parsed.some((s) => STAGE_VALUES.has(s.value));
  const accepted = hasStages
    ? parsed.filter((s) => STAGE_VALUES.has(s.value))
    : parsed.filter((s) => ALL_ASLEEP_VALUES.has(s.value));

  const asleepMs = mergeIntervalDurationMs(accepted.map((s) => ({ start: s.start, end: s.end })));
  if (asleepMs > 0) {
    const hours = asleepMs / (1000 * 60 * 60);
    result.sleepHours = String(Math.round(hours * 10) / 10);
  }

  if (!result.sleepHours && !result.weightKg) return null;
  return result;
}

async function prefillFromHealthConnect(): Promise<HealthPrefill | null> {
  const HC = await import('react-native-health-connect');
  const status = await HC.getSdkStatus();
  // 3 = SDK_AVAILABLE
  if (status !== 3) return null;

  await HC.initialize();
  const granted = await HC.requestPermission([
    { accessType: 'read', recordType: 'SleepSession' },
    { accessType: 'read', recordType: 'Weight' },
  ]);
  if (!granted?.length) return null;

  const result: HealthPrefill = { source: 'health_connect' };
  const { from, to: now } = lastNightSleepWindow();

  const weightRes = await HC.readRecords('Weight', {
    timeRangeFilter: {
      operator: 'between',
      startTime: addLocalDays(from, -30).toISOString(),
      endTime: now.toISOString(),
    },
    ascendingOrder: false,
    pageSize: 1,
  });
  const weightRecord = weightRes?.records?.[0] as
    | { weight?: { inKilograms?: number } }
    | undefined;
  const kg = weightRecord?.weight?.inKilograms;
  if (kg != null && Number.isFinite(kg)) {
    result.weightKg = String(Math.round(kg * 10) / 10);
  }

  const sleepRes = await HC.readRecords('SleepSession', {
    timeRangeFilter: {
      operator: 'between',
      startTime: from.toISOString(),
      endTime: now.toISOString(),
    },
    ascendingOrder: false,
    pageSize: 10,
  });
  const intervals = (sleepRes?.records ?? [])
    .map((rec) => {
      const r = rec as { startTime?: string; endTime?: string };
      if (!r.startTime || !r.endTime) return null;
      return {
        start: new Date(r.startTime).getTime(),
        end: new Date(r.endTime).getTime(),
      };
    })
    .filter((i): i is { start: number; end: number } => i != null);

  const asleepMs = mergeIntervalDurationMs(intervals);
  if (asleepMs > 0) {
    const hours = asleepMs / (1000 * 60 * 60);
    result.sleepHours = String(Math.round(hours * 10) / 10);
  }

  if (!result.sleepHours && !result.weightKg) return null;
  return result;
}

/**
 * Read last night's sleep + latest weight for Log prefill.
 * Never throws into analytics — caller handles errors with friendly copy.
 * Health values stay on-device until the athlete saves the check-in.
 */
export async function fetchHealthPrefill(): Promise<HealthPrefill | null> {
  try {
    if (Platform.OS === 'ios') return await prefillFromHealthKit();
    if (Platform.OS === 'android') return await prefillFromHealthConnect();
    return null;
  } catch {
    return null;
  }
}
