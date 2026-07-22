import { Linking, Platform } from 'react-native';

import {
  hasRequiredHealthConnectPermissions,
  HEALTHKIT_SYNC_READ_TYPES,
  requestHealthSyncPermissions,
} from '@/src/features/health/syncPermissions';

export type HealthAuthStatus =
  | 'loading'
  | 'not_available'
  | 'should_request'
  | 'unnecessary' // iOS: requested, but read permissions are managed in Apple Health
  | 'connected' // Android: required sync read permissions granted
  | 'partially_connected' // Android: some reads granted, but not the full sync set
  | 'not_connected'; // Android: no permissions granted

export interface HealthStatusResult {
  status: HealthAuthStatus;
  details?: {
    sleepGranted?: boolean;
    weightGranted?: boolean;
    workoutsGranted?: boolean;
    heartGranted?: boolean;
    caloriesGranted?: boolean;
    stepsGranted?: boolean;
    sdkStatus?: number;
  };
}

function hasRead(
  granted: readonly { recordType?: string; accessType?: string }[],
  recordType: string
): boolean {
  return granted.some((p) => p.recordType === recordType && p.accessType === 'read');
}

async function getHealthKitAuthStatus(): Promise<HealthStatusResult> {
  try {
    const HK = await import('@kingstinct/react-native-healthkit');
    const available = await HK.isHealthDataAvailable();
    if (!available) {
      return { status: 'not_available' };
    }

    const { AuthorizationRequestStatus } = await import('@kingstinct/react-native-healthkit');

    // Full Health Sync read set — same types requested on Connect.
    const requestStatus = await HK.getRequestStatusForAuthorization({
      toRead: [...HEALTHKIT_SYNC_READ_TYPES] as never,
    });

    if (requestStatus === AuthorizationRequestStatus.shouldRequest) {
      return { status: 'should_request' };
    } else if (requestStatus === AuthorizationRequestStatus.unnecessary) {
      return { status: 'unnecessary' };
    }
    return { status: 'should_request' };
  } catch (err) {
    console.warn('[HealthKit] Error checking auth status:', err);
    return { status: 'not_available' };
  }
}

async function getHealthConnectAuthStatus(): Promise<HealthStatusResult> {
  try {
    const HC = await import('react-native-health-connect');
    const status = await HC.getSdkStatus();
    if (status !== 3) {
      // 3 = SDK_AVAILABLE
      return { status: 'not_available', details: { sdkStatus: status } };
    }

    await HC.initialize();
    const granted = await HC.getGrantedPermissions();

    const details = {
      sleepGranted: hasRead(granted, 'SleepSession'),
      weightGranted: hasRead(granted, 'Weight'),
      workoutsGranted: hasRead(granted, 'ExerciseSession'),
      heartGranted: hasRead(granted, 'HeartRate') || hasRead(granted, 'RestingHeartRate'),
      caloriesGranted:
        hasRead(granted, 'ActiveCaloriesBurned') || hasRead(granted, 'TotalCaloriesBurned'),
      stepsGranted: hasRead(granted, 'Steps'),
    };

    if (hasRequiredHealthConnectPermissions(granted)) {
      return { status: 'connected', details };
    }

    const anyGranted = Object.values(details).some(Boolean);
    if (anyGranted) {
      return { status: 'partially_connected', details };
    }

    return { status: 'not_connected', details };
  } catch (err) {
    console.warn('[HealthConnect] Error checking auth status:', err);
    return { status: 'not_available' };
  }
}

/**
 * Checks the current device permission / authorization status for Health data.
 */
export async function getHealthAuthStatus(): Promise<HealthStatusResult> {
  if (Platform.OS === 'ios') {
    return await getHealthKitAuthStatus();
  }
  if (Platform.OS === 'android') {
    return await getHealthConnectAuthStatus();
  }
  return { status: 'not_available' };
}

/**
 * Prompt the user for the full Health Sync read set (wellness + workouts).
 */
export async function requestHealthAuth(): Promise<boolean> {
  return requestHealthSyncPermissions();
}

/**
 * Revokes all Health Connect permissions on Android.
 */
export async function disconnectHealth(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    const HC = await import('react-native-health-connect');
    await HC.revokeAllPermissions();
    return true;
  } catch (err) {
    console.warn('[HealthConnect] Error disconnecting:', err);
    return false;
  }
}

/**
 * Opens the platform health settings surface so the athlete can fix denials.
 * Android → Health Connect settings; iOS → Apple Health (read grants are edited there).
 */
export async function openHealthSettings(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const HC = await import('react-native-health-connect');
      await HC.openHealthConnectSettings();
      return true;
    } catch (err) {
      console.warn('[HealthConnect] Error opening settings:', err);
      return false;
    }
  }

  if (Platform.OS === 'ios') {
    try {
      // Health app deep link; falls back to failing closed if the scheme is unavailable.
      await Linking.openURL('x-apple-health://');
      return true;
    } catch (err) {
      console.warn('[HealthKit] Error opening Apple Health:', err);
      return false;
    }
  }

  return false;
}
