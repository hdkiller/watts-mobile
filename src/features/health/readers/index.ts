import { Platform } from 'react-native';

import type { DailyWellnessSample, HealthReadWindow, PlatformWorkoutSession } from '../types';
import { LOOKBACK_DAYS } from '../types';
import { readHealthConnectWellness, readHealthConnectWorkouts } from './healthConnect';
import { readHealthKitWellness, readHealthKitWorkouts } from './healthKit';

function normalizeWindow(window?: HealthReadWindow | number): HealthReadWindow {
  if (typeof window === 'number') return { lookbackDays: window };
  return window ?? { lookbackDays: LOOKBACK_DAYS };
}

export async function readPlatformWellness(
  window?: HealthReadWindow | number
): Promise<DailyWellnessSample[]> {
  const opts = normalizeWindow(window);
  if (Platform.OS === 'ios') return readHealthKitWellness(opts);
  if (Platform.OS === 'android') return readHealthConnectWellness(opts);
  return [];
}

export async function readPlatformWorkouts(
  window?: HealthReadWindow | number
): Promise<PlatformWorkoutSession[]> {
  const opts = normalizeWindow(window);
  if (Platform.OS === 'ios') return readHealthKitWorkouts(opts);
  if (Platform.OS === 'android') return readHealthConnectWorkouts(opts);
  return [];
}

export { readHealthConnectWellness, readHealthConnectWorkouts } from './healthConnect';
export { readHealthKitWellness, readHealthKitWorkouts } from './healthKit';
