import { Platform } from 'react-native';

import { eachLocalDateYmd, lookbackStartDate } from '../mapToWellnessPayload';
import { canonicalSportFromHealthKit, sportLabel } from '../sportTypes';
import type { DailyWellnessSample, HealthReadWindow, PlatformWorkoutSession } from '../types';
import { LOOKBACK_DAYS } from '../types';
import { bucketHealthKitSleep, dayWindowLocal, sleepWindowForDate } from './sleepShared';
import {
  summarizeCadence,
  summarizeHeartRate,
  summarizePower,
  summarizeRoute,
  summarizeSpeed,
} from './workoutStreams';

type HkQuantity = { unit?: string; quantity?: number } | number | undefined;

function quantityValue(q: HkQuantity): { value: number; unit?: string } | undefined {
  if (typeof q === 'number') return Number.isFinite(q) ? { value: q } : undefined;
  if (q && typeof q.quantity === 'number' && Number.isFinite(q.quantity)) {
    return { value: q.quantity, unit: q.unit };
  }
  return undefined;
}

function kilocalories(q: HkQuantity): number | undefined {
  const v = quantityValue(q);
  if (!v) return undefined;
  if (v.unit && /kj/i.test(v.unit)) return v.value / 4.184;
  return v.value; // kcal
}

function meters(q: HkQuantity): number | undefined {
  const v = quantityValue(q);
  if (!v) return undefined;
  if (v.unit === 'km') return v.value * 1000;
  if (v.unit === 'mi') return v.value * 1609.344;
  return v.value; // m
}

function resolveFrom(window: HealthReadWindow, today: Date): Date {
  const lookbackDays = window.lookbackDays ?? LOOKBACK_DAYS;
  const lookbackStart = lookbackStartDate(lookbackDays, today);
  if (window.from && window.from.getTime() > lookbackStart.getTime()) {
    const from = new Date(window.from);
    from.setHours(0, 0, 0, 0);
    return from;
  }
  return lookbackStart;
}

async function avgQuantityForDay(
  HK: typeof import('@kingstinct/react-native-healthkit'),
  identifier: string,
  dayStart: Date,
  dayEnd: Date,
  unit?: string
): Promise<number | undefined> {
  try {
    const result = await HK.queryStatisticsForQuantity(
      identifier as never,
      ['discreteAverage'],
      {
        unit: unit as never,
        filter: {
          date: {
            startDate: dayStart,
            endDate: dayEnd,
          },
        },
      }
    );
    const value = result.averageQuantity?.quantity;
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

/** Incremental samples (e.g. energy burned) must be summed, never averaged. */
async function sumQuantityForDay(
  HK: typeof import('@kingstinct/react-native-healthkit'),
  identifier: string,
  dayStart: Date,
  dayEnd: Date,
  unit?: string
): Promise<number | undefined> {
  try {
    // HealthKit statistics apply its source de-duplication rules. Summing raw
    // samples can double-count overlapping phone/watch/app contributions.
    const result = await HK.queryStatisticsForQuantity(
      identifier as never,
      ['cumulativeSum'],
      {
        unit: unit as never,
        filter: {
          date: {
            startDate: dayStart,
            endDate: dayEnd,
          },
        },
      }
    );
    const value = result.sumQuantity?.quantity;
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

async function latestQuantityForDay(
  HK: typeof import('@kingstinct/react-native-healthkit'),
  identifier: string,
  dayStart: Date,
  dayEnd: Date,
  unit?: string
): Promise<number | undefined> {
  try {
    const samples = await HK.queryQuantitySamples(identifier as never, {
      limit: 1,
      ascending: false,
      unit: unit as never,
      filter: {
        date: {
          startDate: dayStart,
          endDate: dayEnd,
        },
      },
    });
    const q = samples?.[0]?.quantity;
    return typeof q === 'number' && Number.isFinite(q) ? q : undefined;
  } catch {
    return undefined;
  }
}

export async function readHealthKitWellness(
  window: HealthReadWindow = { lookbackDays: LOOKBACK_DAYS }
): Promise<DailyWellnessSample[]> {
  if (Platform.OS !== 'ios') return [];

  const HK = await import('@kingstinct/react-native-healthkit');
  const available = await HK.isHealthDataAvailable();
  if (!available) return [];

  const today = new Date();
  const from = resolveFrom(window, today);
  const dates = eachLocalDateYmd(from, today);
  const samples: DailyWellnessSample[] = [];

  for (const date of dates) {
    const sample: DailyWellnessSample = { date, platform: 'healthkit' };
    const { start: dayStart, end: dayEnd } = dayWindowLocal(date);
    const sleepWin = sleepWindowForDate(date);

    try {
      const sleepSamples = await HK.queryCategorySamples('HKCategoryTypeIdentifierSleepAnalysis', {
        // A watch emits one sample per stage segment; a restless night plus a nap
        // can run to several hundred. The 26h date predicate is the real bound.
        limit: 0,
        ascending: true,
        filter: {
          date: {
            startDate: sleepWin.start,
            endDate: sleepWin.end,
          },
        },
      });
      const parsed = (sleepSamples ?? []).map((s) => ({
        value: typeof s.value === 'number' ? s.value : Number(s.value),
        start: new Date(s.startDate).getTime(),
        end: new Date(s.endDate).getTime(),
      }));
      const bucket = bucketHealthKitSleep(parsed);
      if (bucket) {
        sample.sleepSecs = bucket.sleepSecs;
        sample.sleepHours = Math.round((bucket.sleepSecs / 3600) * 10) / 10;
        sample.sleepDeepSecs = bucket.sleepDeepSecs;
        sample.sleepRemSecs = bucket.sleepRemSecs;
        sample.sleepLightSecs = bucket.sleepLightSecs;
        sample.sleepAwakeSecs = bucket.sleepAwakeSecs;
      }
    } catch {
      // ignore sleep read errors
    }

    const rhr = await avgQuantityForDay(
      HK,
      'HKQuantityTypeIdentifierRestingHeartRate',
      dayStart,
      dayEnd,
      'count/min'
    );
    if (rhr != null) sample.restingHr = Math.round(rhr);

    const hrvSdnn = await avgQuantityForDay(
      HK,
      'HKQuantityTypeIdentifierHeartRateVariabilitySdnn',
      dayStart,
      dayEnd,
      'ms'
    );
    if (hrvSdnn != null) sample.hrvSdnn = Math.round(hrvSdnn * 10) / 10;

    const weight = await latestQuantityForDay(
      HK,
      'HKQuantityTypeIdentifierBodyMass',
      dayStart,
      dayEnd,
      'kg'
    );
    if (weight != null) sample.weight = Math.round(weight * 10) / 10;

    const bodyFat = await latestQuantityForDay(
      HK,
      'HKQuantityTypeIdentifierBodyFatPercentage',
      dayStart,
      dayEnd,
      '%'
    );
    if (bodyFat != null) {
      sample.bodyFat = bodyFat <= 1 ? Math.round(bodyFat * 1000) / 10 : Math.round(bodyFat * 10) / 10;
    }

    const spo2 = await avgQuantityForDay(
      HK,
      'HKQuantityTypeIdentifierOxygenSaturation',
      dayStart,
      dayEnd,
      '%'
    );
    if (spo2 != null) {
      sample.spO2 = spo2 <= 1 ? Math.round(spo2 * 1000) / 10 : Math.round(spo2 * 10) / 10;
    }

    const resp = await avgQuantityForDay(
      HK,
      'HKQuantityTypeIdentifierRespiratoryRate',
      dayStart,
      dayEnd,
      'count/min'
    );
    if (resp != null) sample.respiration = Math.round(resp * 10) / 10;

    const vo2 = await latestQuantityForDay(
      HK,
      'HKQuantityTypeIdentifierVO2Max',
      dayStart,
      dayEnd,
      'ml/(kg*min)'
    );
    if (vo2 != null) sample.vo2max = Math.round(vo2 * 10) / 10;

    const basal = await sumQuantityForDay(
      HK,
      'HKQuantityTypeIdentifierBasalEnergyBurned',
      dayStart,
      dayEnd,
      'kcal'
    );
    if (basal != null) sample.restingCaloriesBurned = Math.round(basal);

    const active = await sumQuantityForDay(
      HK,
      'HKQuantityTypeIdentifierActiveEnergyBurned',
      dayStart,
      dayEnd,
      'kcal'
    );
    if (active != null) sample.activeCaloriesBurned = Math.round(active);

    if (basal != null || active != null) {
      sample.totalCaloriesBurned = Math.round((basal ?? 0) + (active ?? 0));
    }

    const steps = await sumQuantityForDay(
      HK,
      'HKQuantityTypeIdentifierStepCount',
      dayStart,
      dayEnd,
      'count'
    );
    if (steps != null) sample.steps = Math.round(steps);

    const distance = await sumQuantityForDay(
      HK,
      'HKQuantityTypeIdentifierDistanceWalkingRunning',
      dayStart,
      dayEnd,
      'm'
    );
    if (distance != null && distance > 0) sample.distanceMeters = Math.round(distance);

    // Apple Exercise Time is already in minutes.
    const exercise = await sumQuantityForDay(
      HK,
      'HKQuantityTypeIdentifierAppleExerciseTime',
      dayStart,
      dayEnd,
      'min'
    );
    if (exercise != null && exercise > 0) sample.exerciseMinutes = Math.round(exercise);

    const floors = await sumQuantityForDay(
      HK,
      'HKQuantityTypeIdentifierFlightsClimbed',
      dayStart,
      dayEnd,
      'count'
    );
    if (floors != null && floors > 0) sample.floors = Math.round(floors);

    samples.push(sample);
  }

  return samples;
}

async function readHkQuantitySeries(
  HK: typeof import('@kingstinct/react-native-healthkit'),
  identifier: string,
  start: Date,
  end: Date,
  unit: string
): Promise<{ t: number; v: number }[]> {
  try {
    const samples = await HK.queryQuantitySamples(identifier as never, {
      // Unbounded: the workout-window predicate is the bound. A capped read
      // would silently truncate long sessions and skew the avg/max computed
      // from the full stream before downsampling.
      limit: 0,
      ascending: true,
      unit: unit as never,
      filter: { date: { startDate: start, endDate: end } },
    });
    return (samples ?? []).map((s) => ({
      t: new Date(s.startDate).getTime(),
      v: typeof s.quantity === 'number' ? s.quantity : NaN,
    }));
  } catch {
    return [];
  }
}

export async function readHealthKitWorkouts(
  window: HealthReadWindow = { lookbackDays: LOOKBACK_DAYS }
): Promise<PlatformWorkoutSession[]> {
  if (Platform.OS !== 'ios') return [];

  const HK = await import('@kingstinct/react-native-healthkit');
  const available = await HK.isHealthDataAvailable();
  if (!available) return [];

  const today = new Date();
  const from = resolveFrom(window, today);

  try {
    const workouts = await HK.queryWorkoutSamples({
      // HealthKit treats a non-positive limit as "all". The date predicate
      // still bounds this to the configured sync lookback.
      limit: 0,
      ascending: false,
      filter: {
        date: {
          startDate: from,
          endDate: today,
        },
      },
    });

    const out: PlatformWorkoutSession[] = [];
    for (const w of workouts ?? []) {
      const start = new Date(w.startDate);
      if (!Number.isFinite(start.getTime())) continue;
      const end = w.endDate ? new Date(w.endDate) : undefined;
      const durationSec =
        typeof w.duration === 'number'
          ? Math.round(w.duration)
          : end
            ? Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000))
            : undefined;
      const uuid = (w as { uuid?: string }).uuid;
      const platformSessionId = uuid ?? `hk-${start.toISOString()}`;
      const activityCode =
        typeof w.workoutActivityType === 'number' ? w.workoutActivityType : undefined;
      const canonical = canonicalSportFromHealthKit(activityCode);
      const sportType = canonical ?? (activityCode != null ? String(activityCode) : undefined);
      const extras = w as { totalEnergyBurned?: HkQuantity; totalDistance?: HkQuantity };
      const activeCalories = kilocalories(extras.totalEnergyBurned);
      const distanceMeters = meters(extras.totalDistance);

      const windowEnd = end ?? start;
      const [hrRaw, cyclingPower, runningPower, cadenceRaw, runSpeed, cycleSpeed] =
        await Promise.all([
          readHkQuantitySeries(HK, 'HKQuantityTypeIdentifierHeartRate', start, windowEnd, 'count/min'),
          readHkQuantitySeries(HK, 'HKQuantityTypeIdentifierCyclingPower', start, windowEnd, 'W'),
          readHkQuantitySeries(HK, 'HKQuantityTypeIdentifierRunningPower', start, windowEnd, 'W'),
          readHkQuantitySeries(HK, 'HKQuantityTypeIdentifierCyclingCadence', start, windowEnd, 'count/min'),
          readHkQuantitySeries(HK, 'HKQuantityTypeIdentifierRunningSpeed', start, windowEnd, 'm/s'),
          readHkQuantitySeries(HK, 'HKQuantityTypeIdentifierCyclingSpeed', start, windowEnd, 'm/s'),
        ]);

      const hr = summarizeHeartRate(hrRaw.map((s) => ({ t: s.t, bpm: s.v })));
      const power = summarizePower(
        [...cyclingPower, ...runningPower].map((s) => ({ t: s.t, watts: s.v }))
      );
      const cadence = summarizeCadence(cadenceRaw.map((s) => ({ t: s.t, rpm: s.v })));
      const speed = summarizeSpeed(
        [...runSpeed, ...cycleSpeed].map((s) => ({ t: s.t, mps: s.v }))
      );

      let routePoints = summarizeRoute([]).samples;
      try {
        const proxy = w as {
          getWorkoutRoutes?: () => Promise<
            readonly { locations: readonly { date: Date; latitude: number; longitude: number; altitude?: number }[] }[]
          >;
        };
        if (typeof proxy.getWorkoutRoutes === 'function') {
          const routes = await proxy.getWorkoutRoutes();
          const locs: { t: number; lat: number; lon: number; altitudeMeters?: number }[] = [];
          for (const route of routes ?? []) {
            for (const loc of route.locations ?? []) {
              locs.push({
                t: new Date(loc.date).getTime(),
                lat: loc.latitude,
                lon: loc.longitude,
                altitudeMeters: loc.altitude,
              });
            }
          }
          routePoints = summarizeRoute(locs).samples;
        }
      } catch {
        // Route optional — summary FIT still valid.
      }

      out.push({
        platformSessionId,
        platform: 'healthkit',
        startedAt: start.toISOString(),
        endedAt: end?.toISOString(),
        durationSec,
        sportType,
        title: sportLabel(canonical),
        activeCalories: activeCalories != null ? Math.round(activeCalories) : undefined,
        distanceMeters: distanceMeters != null ? Math.round(distanceMeters) : undefined,
        avgHeartRate: hr.avg,
        maxHeartRate: hr.max,
        avgPower: power.avg,
        heartRateSamples: hr.samples,
        powerSamples: power.samples,
        cadenceSamples: cadence.samples,
        speedSamples: speed.samples,
        routePoints,
      });
    }
    return out;
  } catch {
    return [];
  }
}
