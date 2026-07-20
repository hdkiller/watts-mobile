import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { useAuth } from '@/src/auth/AuthContext';

import { invalidateQueriesForPush } from './invalidateFromPush';
import { registerPushForAuthenticatedSession } from './pushRegistration';
import { pushDataFromNotificationContent, resolvePushOpen } from './resolvePushOpen';

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
        notification.request.content.data as Record<string, unknown> | undefined
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
      if (!response || cancelled) return;
      const responseId = response.notification.request.identifier;
      if (handledResponseIds.current.has(responseId)) return;
      handledResponseIds.current.add(responseId);
      navigateFromPushData(response.notification.request.content.data as Record<string, unknown>);
    });

    return () => {
      cancelled = true;
      receivedSub.remove();
      responseSub.remove();
    };
  }, [status, queryClient]);

  return null;
}
