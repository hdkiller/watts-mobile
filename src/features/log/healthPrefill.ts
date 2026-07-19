import { Platform } from 'react-native';

import type { HealthPrefill } from './healthPrefillTypes';

export type { HealthPrefill } from './healthPrefillTypes';
export { applyHealthPrefill } from './applyHealthPrefill';

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addLocalDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

/** Asleep category values in HealthKit (core/deep/rem/asleepUnspecified). */
const ASLEEP_VALUES = new Set([1, 3, 4, 5]);

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

  const now = new Date();
  const from = addLocalDays(startOfLocalDay(now), -1);
  const samples = await HK.queryCategorySamples('HKCategoryTypeIdentifierSleepAnalysis', {
    limit: 40,
    ascending: false,
    filter: {
      date: {
        startDate: from,
        endDate: now,
      },
    },
  });

  let asleepMs = 0;
  for (const sample of samples) {
    const value = typeof sample.value === 'number' ? sample.value : Number(sample.value);
    if (!ASLEEP_VALUES.has(value)) continue;
    const start = new Date(sample.startDate).getTime();
    const end = new Date(sample.endDate).getTime();
    if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
      asleepMs += end - start;
    }
  }
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
  const now = new Date();
  const from = addLocalDays(startOfLocalDay(now), -1);

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
    pageSize: 5,
  });
  let asleepMs = 0;
  for (const rec of sleepRes?.records ?? []) {
    const r = rec as { startTime?: string; endTime?: string };
    if (!r.startTime || !r.endTime) continue;
    const start = new Date(r.startTime).getTime();
    const end = new Date(r.endTime).getTime();
    if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
      asleepMs += end - start;
    }
  }
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
