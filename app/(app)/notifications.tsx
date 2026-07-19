import { Stack } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, Text, View } from 'react-native';

import { useAuth } from '@/src/auth/AuthContext';
import { notificationsWebPath } from '@/src/features/account/paths';
import { absoluteInstanceUrl } from '@/src/features/profile/mapProfile';
import { t } from '@/src/i18n';

/**
 * Inbox stub so deep links / push `data.path` `/notifications` resolve.
 * Full inbox lands with OpenSpec `phase-2-notifications-push`.
 * Prefs: OS settings + web until granular mobile toggles exist.
 */
export default function NotificationsStubScreen() {
  const { instanceUrl } = useAuth();

  const openSystemSettings = async () => {
    await Linking.openSettings();
  };

  const openWebNotifications = async () => {
    if (!instanceUrl) return;
    await WebBrowser.openBrowserAsync(
      absoluteInstanceUrl(instanceUrl, notificationsWebPath())
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: t('notifications.title') }} />
      <View className="flex-1 bg-surface-dark px-6 pt-6">
        <Text className="text-xl font-semibold text-white">{t('notifications.title')}</Text>
        <Text className="mt-2 text-base text-ink-muted">{t('notifications.stubBody')}</Text>

        <Pressable
          className="mt-6 items-center rounded-xl border border-zinc-700 py-3.5 active:opacity-80"
          onPress={() => void openSystemSettings()}
        >
          <Text className="text-base font-semibold text-white">
            {t('notifications.openSystemSettings')}
          </Text>
        </Pressable>

        <Pressable
          className="mt-3 items-center rounded-xl border border-zinc-700 py-3.5 active:opacity-80"
          onPress={() => void openWebNotifications()}
        >
          <Text className="text-base font-semibold text-white">
            {t('notifications.manageOnWeb')}
          </Text>
        </Pressable>
      </View>
    </>
  );
}
