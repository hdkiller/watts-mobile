import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { deleteItemAsync, getItemAsync, setItemAsync } from '@/src/storage/secureStorage';

import type { DevicePlatform } from './types';

const PUSH_TOKEN_KEY = 'watts.push.expoToken';

export type PushPermissionState = 'granted' | 'denied' | 'undetermined';

export async function getStoredPushToken(): Promise<string | null> {
  return getItemAsync(PUSH_TOKEN_KEY);
}

export async function storePushToken(token: string): Promise<void> {
  await setItemAsync(PUSH_TOKEN_KEY, token);
}

export async function clearStoredPushToken(): Promise<void> {
  await deleteItemAsync(PUSH_TOKEN_KEY);
}

export function resolveDevicePlatform(): DevicePlatform | null {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return null;
}

export function getAppVersion(): string | undefined {
  return Constants.expoConfig?.version ?? undefined;
}

function resolveEasProjectId(): string | undefined {
  return (
    Constants.easConfig?.projectId ??
    (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)?.projectId
  );
}

export async function getPushPermissionState(): Promise<PushPermissionState> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

export async function acquireExpoPushToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (status !== 'granted') {
    return null;
  }

  try {
    const projectId = resolveEasProjectId();
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const token = tokenResponse.data?.trim();
    return token || null;
  } catch (error) {
    console.warn('Failed to acquire Expo push token', error);
    return null;
  }
}
