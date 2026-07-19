import { Platform } from 'react-native';

export type HealthAuthStatus =
  | 'loading'
  | 'not_available'
  | 'should_request'
  | 'unnecessary' // iOS: requested, but read permissions are managed in Apple Health
  | 'connected' // Android: fully connected (all permissions granted)
  | 'partially_connected' // Android: sleep or weight granted, but not both
  | 'not_connected'; // Android: no permissions granted

export interface HealthStatusResult {
  status: HealthAuthStatus;
  details?: {
    sleepGranted?: boolean;
    weightGranted?: boolean;
    sdkStatus?: number;
  };
}

async function getHealthKitAuthStatus(): Promise<HealthStatusResult> {
  try {
    const HK = await import('@kingstinct/react-native-healthkit');
    const available = await HK.isHealthDataAvailable();
    if (!available) {
      return { status: 'not_available' };
    }

    const { AuthorizationRequestStatus } = await import('@kingstinct/react-native-healthkit');

    const requestStatus = await HK.getRequestStatusForAuthorization({
      toRead: ['HKQuantityTypeIdentifierBodyMass', 'HKCategoryTypeIdentifierSleepAnalysis'],
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

    const hasSleep = granted.some(
      (p) => p.recordType === 'SleepSession' && p.accessType === 'read'
    );
    const hasWeight = granted.some(
      (p) => p.recordType === 'Weight' && p.accessType === 'read'
    );

    if (hasSleep && hasWeight) {
      return { status: 'connected', details: { sleepGranted: true, weightGranted: true } };
    } else if (hasSleep || hasWeight) {
      return {
        status: 'partially_connected',
        details: { sleepGranted: hasSleep, weightGranted: hasWeight },
      };
    } else {
      return {
        status: 'not_connected',
        details: { sleepGranted: false, weightGranted: false },
      };
    }
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
 * Prompt the user for health store access.
 */
export async function requestHealthAuth(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      const HK = await import('@kingstinct/react-native-healthkit');
      const available = await HK.isHealthDataAvailable();
      if (!available) return false;

      await HK.requestAuthorization({
        toRead: ['HKQuantityTypeIdentifierBodyMass', 'HKCategoryTypeIdentifierSleepAnalysis'],
      });
      return true;
    }

    if (Platform.OS === 'android') {
      const HC = await import('react-native-health-connect');
      const status = await HC.getSdkStatus();
      if (status !== 3) return false;

      await HC.initialize();
      const granted = await HC.requestPermission([
        { accessType: 'read', recordType: 'SleepSession' },
        { accessType: 'read', recordType: 'Weight' },
      ]);
      return granted != null && granted.length > 0;
    }
  } catch (err) {
    console.warn('[HealthAuth] Error requesting authorization:', err);
  }
  return false;
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
 * Opens Health Connect system settings on Android.
 */
export async function openHealthSettings(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    const HC = await import('react-native-health-connect');
    await HC.openHealthConnectSettings();
    return true;
  } catch (err) {
    console.warn('[HealthConnect] Error opening settings:', err);
    return false;
  }
}
