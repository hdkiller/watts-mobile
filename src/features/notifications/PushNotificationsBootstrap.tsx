import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';

import { useAuth } from '@/src/auth/AuthContext';

import { invalidateQueriesForPush } from './invalidateFromPush';
import {
  registerPushForAuthenticatedSession,
  retryPendingPushUnregistration,
} from './pushRegistration';
import { pushDataFromNotificationContent, resolvePushOpen } from './resolvePushOpen';
import { useUnreadNotificationsCount } from './useNotifications';

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
  const unreadCount = useUnreadNotificationsCount();

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

    let cancelled = false;

    void (async () => {
      const result = await registerPushForAuthenticatedSession();
      if (cancelled) return;
      if (result.state === 'failed') {
        console.warn('Push device registration failed:', result.error);
      }
    })();

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
      if (!response || cancelled) return;
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
      cancelled = true;
      receivedSub.remove();
      responseSub.remove();
    };
  }, [status, queryClient]);

  return null;
}
