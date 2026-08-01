import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';

import { useAuth } from '@/src/auth/AuthContext';

import { invalidateQueriesForPush } from './invalidateFromPush';
import {
  registerPushForAuthenticatedSession,
  retryPendingPushUnregistration,
} from './pushRegistration';
import { pushDataFromNotificationContent, resolvePushOpen } from './resolvePushOpen';
import { useUnreadNotificationsCount } from './useNotifications';

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

function navigateFromPushData(data: Record<string, unknown> | undefined, isAuthenticated: boolean) {
  if (!isAuthenticated) {
    // Signed out (or auth state not yet resolved) — don't route into authenticated
    // content on behalf of a stale/leaked push notification.
    return;
  }
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
  const unreadCount = useUnreadNotificationsCount();

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
    void Notifications.setBadgeCountAsync(unreadCount);
  }, [status, unreadCount]);

  // Retry any push-device unregistration that failed on a previous sign-out, on launch
  // and whenever the app returns to the foreground — independent of current auth status,
  // since the whole point is clearing out a stale registration left over from before.
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    void retryPendingPushUnregistration();

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        void retryPendingPushUnregistration();
      }
    });

    return () => {
      subscription.remove();
    };
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
      navigateFromPushData(
        response.notification.request.content.data as Record<string, unknown>,
        status === 'authenticated',
      );
    });

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response || cancelledRef.current) return;
      const responseId = response.notification.request.identifier;
      if (handledResponseIds.current.has(responseId)) return;
      handledResponseIds.current.add(responseId);
      navigateFromPushData(
        response.notification.request.content.data as Record<string, unknown>,
        status === 'authenticated',
      );
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
