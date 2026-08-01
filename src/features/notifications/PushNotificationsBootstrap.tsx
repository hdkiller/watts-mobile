import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';

import { useAuth } from '@/src/auth/AuthContext';

import { invalidateQueriesForPush } from './invalidateFromPush';
import { registerPushForAuthenticatedSession } from './pushRegistration';
import { pushDataFromNotificationContent, resolvePushOpen } from './resolvePushOpen';

function captureRegistrationFailure(error: string) {
  try {
    // Lazy require so builds without Sentry stay lightweight (matches src/sentry.ts).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require('@sentry/react-native') as typeof import('@sentry/react-native');
    Sentry.captureException(new Error(`Push device registration failed: ${error}`), {
      tags: {
        feature: 'push_notifications',
        platform: Platform.OS,
      },
      extra: {
        error,
      },
    });
  } catch {
    // Sentry unavailable — ignore.
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function navigateFromPushData(data: Record<string, unknown> | undefined) {
  const resolved = resolvePushOpen(pushDataFromNotificationContent(data));
  if (resolved.kind !== 'app') {
    return;
  }
  try {
    // Include tab-stack anchors (e.g. More root) so nested screens keep a back target.
    router.push(resolved.href as Href, { withAnchor: true });
  } catch (error) {
    console.warn('Push navigation failed', error);
  }
}

export function PushNotificationsBootstrap() {
  const { status } = useAuth();
  const queryClient = useQueryClient();
  const handledResponseIds = useRef(new Set<string>());
  const lastRegistrationStateRef = useRef<'failed' | 'succeeded' | null>(null);
  const registrationInFlightRef = useRef(false);

  const attemptPushRegistration = useCallback((cancelledRef: { current: boolean }) => {
    if (registrationInFlightRef.current) return;
    registrationInFlightRef.current = true;
    void (async () => {
      try {
        const result = await registerPushForAuthenticatedSession();
        if (cancelledRef.current) return;
        if (result.state === 'failed') {
          console.warn('Push device registration failed:', result.error);
          captureRegistrationFailure(result.error);
          lastRegistrationStateRef.current = 'failed';
        } else {
          lastRegistrationStateRef.current = 'succeeded';
        }
      } finally {
        registrationInFlightRef.current = false;
      }
    })();
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || Platform.OS === 'web') {
      return;
    }

    const cancelledRef = { current: false };

    // Attempt registration on this auth transition / app launch.
    attemptPushRegistration(cancelledRef);

    // Retry on subsequent foregrounds until it succeeds — registration can
    // fail transiently (network, backend outage) and should not require a
    // fresh auth transition to recover.
    const appStateSub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next !== 'active') return;
      if (lastRegistrationStateRef.current === 'succeeded') return;
      attemptPushRegistration(cancelledRef);
    });

    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      void invalidateQueriesForPush(
        queryClient,
        notification.request.content.data as Record<string, unknown> | undefined,
      );
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const responseId = response.notification.request.identifier;
      if (handledResponseIds.current.has(responseId)) {
        return;
      }
      handledResponseIds.current.add(responseId);
      navigateFromPushData(response.notification.request.content.data as Record<string, unknown>);
    });

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response || cancelledRef.current) return;
      const responseId = response.notification.request.identifier;
      if (handledResponseIds.current.has(responseId)) return;
      handledResponseIds.current.add(responseId);
      navigateFromPushData(response.notification.request.content.data as Record<string, unknown>);
      void Notifications.clearLastNotificationResponseAsync();
    });

    return () => {
      cancelledRef.current = true;
      appStateSub.remove();
      receivedSub.remove();
      responseSub.remove();
    };
  }, [status, queryClient, attemptPushRegistration]);

  return null;
}
