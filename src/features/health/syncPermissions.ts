import { Platform } from 'react-native';

/** HealthKit types for wellness + workout sync (read-only). */
export const HEALTHKIT_SYNC_READ_TYPES = [
  'HKQuantityTypeIdentifierBodyMass',
  'HKCategoryTypeIdentifierSleepAnalysis',
  'HKQuantityTypeIdentifierRestingHeartRate',
  'HKQuantityTypeIdentifierHeartRate',
  'HKQuantityTypeIdentifierHeartRateVariabilitySdnn',
  'HKQuantityTypeIdentifierBodyFatPercentage',
  'HKQuantityTypeIdentifierOxygenSaturation',
  'HKQuantityTypeIdentifierRespiratoryRate',
  'HKQuantityTypeIdentifierVO2Max',
  'HKQuantityTypeIdentifierStepCount',
  'HKQuantityTypeIdentifierBasalEnergyBurned',
  'HKQuantityTypeIdentifierActiveEnergyBurned',
  'HKQuantityTypeIdentifierDistanceWalkingRunning',
  'HKQuantityTypeIdentifierAppleExerciseTime',
  'HKQuantityTypeIdentifierFlightsClimbed',
  'HKQuantityTypeIdentifierCyclingPower',
  'HKQuantityTypeIdentifierRunningPower',
  'HKQuantityTypeIdentifierCyclingCadence',
  'HKQuantityTypeIdentifierRunningSpeed',
  'HKQuantityTypeIdentifierCyclingSpeed',
  'HKWorkoutTypeIdentifier',
  'HKWorkoutRouteTypeIdentifier',
] as const;

/** Types registered for HealthKit background delivery when sync is on. */
export const HEALTHKIT_BACKGROUND_DELIVERY_TYPES = [
  'HKQuantityTypeIdentifierHeartRate',
  'HKQuantityTypeIdentifierRestingHeartRate',
  'HKQuantityTypeIdentifierHeartRateVariabilitySdnn',
  'HKQuantityTypeIdentifierBodyMass',
  'HKQuantityTypeIdentifierBodyFatPercentage',
  'HKQuantityTypeIdentifierOxygenSaturation',
  'HKQuantityTypeIdentifierRespiratoryRate',
  'HKQuantityTypeIdentifierVO2Max',
  'HKQuantityTypeIdentifierStepCount',
  'HKQuantityTypeIdentifierDistanceWalkingRunning',
  'HKQuantityTypeIdentifierAppleExerciseTime',
  'HKQuantityTypeIdentifierFlightsClimbed',
  'HKQuantityTypeIdentifierBasalEnergyBurned',
  'HKQuantityTypeIdentifierActiveEnergyBurned',
  'HKQuantityTypeIdentifierCyclingPower',
  'HKQuantityTypeIdentifierRunningPower',
  'HKQuantityTypeIdentifierCyclingCadence',
  'HKQuantityTypeIdentifierRunningSpeed',
  'HKQuantityTypeIdentifierCyclingSpeed',
  'HKCategoryTypeIdentifierSleepAnalysis',
  'HKWorkoutTypeIdentifier',
] as const;

/** Health Connect record types for wellness + workout sync. */
export const HEALTH_CONNECT_SYNC_PERMISSIONS = [
  { accessType: 'read', recordType: 'SleepSession' },
  { accessType: 'read', recordType: 'Weight' },
  { accessType: 'read', recordType: 'RestingHeartRate' },
  { accessType: 'read', recordType: 'HeartRate' },
  { accessType: 'read', recordType: 'HeartRateVariabilityRmssd' },
  { accessType: 'read', recordType: 'BodyFat' },
  { accessType: 'read', recordType: 'OxygenSaturation' },
  { accessType: 'read', recordType: 'RespiratoryRate' },
  { accessType: 'read', recordType: 'Vo2Max' },
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'Distance' },
  { accessType: 'read', recordType: 'FloorsClimbed' },
  { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
  { accessType: 'read', recordType: 'TotalCaloriesBurned' },
  { accessType: 'read', recordType: 'BasalMetabolicRate' },
  { accessType: 'read', recordType: 'ExerciseSession' },
  { accessType: 'read', recordType: 'Power' },
  { accessType: 'read', recordType: 'Speed' },
  { accessType: 'read', recordType: 'CyclingPedalingCadence' },
  { accessType: 'read', recordType: 'StepsCadence' },
  // GPS workout routes — declared so `ExerciseSession.exerciseRoute` is populated
  // in bulk reads instead of falling back to the per-record consent dialog.
  { accessType: 'read', recordType: 'ExerciseRoute' },
  // Change-driven / background reads (best-effort; ignored if unsupported).
  { accessType: 'read', recordType: 'BackgroundAccessPermission' },
] as const;

/**
 * Requested but never required to enable sync — declining these degrades the
 * data set (no routes / no background wake) rather than blocking sync.
 */
const OPTIONAL_HEALTH_CONNECT_RECORD_TYPES: readonly string[] = [
  'BackgroundAccessPermission',
  'ExerciseRoute',
];

type HealthConnectPermissionLike = { accessType?: string; recordType?: string };

/** Background access and route reads are best-effort; the remaining record reads are required. */
export function hasRequiredHealthConnectPermissions(
  granted: readonly HealthConnectPermissionLike[]
): boolean {
  const keys = new Set(granted.map((p) => `${p.accessType}:${p.recordType}`));
  return HEALTH_CONNECT_SYNC_PERMISSIONS.filter(
    (permission) => !OPTIONAL_HEALTH_CONNECT_RECORD_TYPES.includes(permission.recordType)
  ).every((permission) => keys.has(`${permission.accessType}:${permission.recordType}`));
}

/**
 * Request the full Health Sync read set (wellness + workouts).
 * Used by Connect and when enabling Sync to Coach Watts / Sync workouts.
 */
export async function requestHealthSyncPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      const HK = await import('@kingstinct/react-native-healthkit');
      const available = await HK.isHealthDataAvailable();
      if (!available) return false;
      await HK.requestAuthorization({
        toRead: [...HEALTHKIT_SYNC_READ_TYPES] as never,
      });
      return true;
    }

    if (Platform.OS === 'android') {
      const HC = await import('react-native-health-connect');
      const status = await HC.getSdkStatus();
      if (status !== 3) return false;
      await HC.initialize();
      const granted = await HC.requestPermission([
        ...HEALTH_CONNECT_SYNC_PERMISSIONS,
      ] as Parameters<typeof HC.requestPermission>[0]);
      return Array.isArray(granted) && hasRequiredHealthConnectPermissions(granted);
    }
  } catch (err) {
    console.warn('[HealthSync] permission request failed', err);
  }
  return false;
}
