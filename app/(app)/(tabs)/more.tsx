import { router, type Href } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useState } from 'react';

import { useAuth } from '@/src/auth/AuthContext';
import { t } from '@/src/i18n';
import { Colors } from '@/src/theme/colors';

function Row({
  title,
  hint,
  onPress,
}: {
  title: string;
  hint?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="mt-3 flex-row items-center justify-between rounded-xl border border-zinc-700 px-4 py-3.5 active:opacity-80"
      onPress={onPress}
    >
      <Text className="text-base font-semibold text-white">{title}</Text>
      {hint ? <Text className="text-sm text-ink-muted">{hint}</Text> : null}
    </Pressable>
  );
}

export default function MoreScreen() {
  const { user, instanceUrl, signOut, refreshUser } = useAuth();
  const [busy, setBusy] = useState(false);

  const openWeb = async () => {
    if (!instanceUrl) return;
    await WebBrowser.openBrowserAsync(instanceUrl);
  };

  const openSystemNotificationSettings = async () => {
    await Linking.openSettings();
  };

  const onSignOut = async () => {
    setBusy(true);
    try {
      await signOut();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-surface-dark" contentContainerClassName="px-6 pb-10 pt-4">
      <Text className="text-2xl font-semibold text-white">{t('more.title')}</Text>

      <View className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
        <Text className="text-xs uppercase tracking-wide text-ink-muted">
          {t('more.signedInAs')}
        </Text>
        <Text className="mt-1 text-lg text-white">
          {user?.name || user?.email || t('more.athleteFallback')}
        </Text>
        {user?.email ? <Text className="mt-1 text-sm text-ink-muted">{user.email}</Text> : null}

        <Text className="mt-4 text-xs uppercase tracking-wide text-ink-muted">
          {t('more.instance')}
        </Text>
        <Text className="mt-1 text-sm text-white" selectable>
          {instanceUrl || '—'}
        </Text>

        <Pressable className="mt-3 self-start" onPress={() => void refreshUser()}>
          <Text className="text-sm font-medium text-brand">{t('more.refreshProfile')}</Text>
        </Pressable>
      </View>

      <Text className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-ink-muted">
        {t('more.section.workouts')}
      </Text>

      <Row
        title={t('more.athlete')}
        hint={t('more.athleteHint')}
        onPress={() => router.push('/(app)/athlete' as Href)}
      />
      <Row
        title={t('more.recentActivity')}
        hint={t('more.recentActivityHint')}
        onPress={() => router.push('/(app)/activity' as Href)}
      />
      <Row
        title={t('more.upcoming')}
        hint={t('more.upcomingHint')}
        onPress={() => router.push('/(app)/upcoming' as Href)}
      />

      <Text className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-ink-muted">
        {t('more.section.account')}
      </Text>

      <Row
        title={t('more.notifications')}
        hint={t('more.notificationsHint')}
        onPress={() => router.push('/(app)/notifications' as Href)}
      />
      <Row
        title={t('more.notificationPrefs')}
        hint={t('more.notificationPrefsHint')}
        onPress={() => void openSystemNotificationSettings()}
      />

      <Pressable
        className="mt-3 items-center rounded-xl border border-zinc-700 py-3.5 active:opacity-80"
        onPress={() => void openWeb()}
      >
        <Text className="text-base font-semibold text-white">{t('more.openWeb')}</Text>
      </Pressable>

      <Pressable
        className="mt-3 items-center rounded-xl bg-zinc-800 py-3.5 active:opacity-80"
        onPress={() => void onSignOut()}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color={Colors.brand} />
        ) : (
          <Text className="text-base font-semibold text-red-400">{t('more.signOut')}</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
