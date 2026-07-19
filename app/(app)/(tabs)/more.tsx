import { router, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, Text, View } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-screens/experimental';

import { useAuth } from '@/src/auth/AuthContext';
import { Button } from '@/src/components/Button';
import { useUnreadNotificationsCount } from '@/src/features/notifications/useNotifications';
import { Colors } from '@/src/theme/colors';

export default function MoreScreen() {
  const { user, instanceUrl, signOut, refreshUser } = useAuth();
  const unreadCount = useUnreadNotificationsCount();
  const [busy, setBusy] = useState(false);

  const openWeb = async () => {
    if (!instanceUrl) return;
    await WebBrowser.openBrowserAsync(instanceUrl);
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
    <SafeAreaView
      edges={{ top: true }}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
    <View className="flex-1 bg-surface-dark px-6 pt-4">
      <Text className="text-2xl font-semibold text-white">More</Text>

      <View className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
        <Text className="text-xs uppercase tracking-wide text-ink-muted">Signed in as</Text>
        <Text className="mt-1 text-lg text-white">{user?.name || user?.email || 'Athlete'}</Text>
        {user?.email ? <Text className="mt-1 text-sm text-ink-muted">{user.email}</Text> : null}
        <Pressable className="mt-3 self-start" hitSlop={8} onPress={() => void refreshUser()}>
          <Text className="text-sm font-medium text-brand">Refresh profile</Text>
        </Pressable>
      </View>


      <Pressable
        className="mt-4 flex-row items-center justify-between rounded-xl border border-zinc-700 px-4 py-3.5 active:opacity-80"
        onPress={() => router.push('/(app)/notifications' as Href)}
      >
        <Text className="text-base font-semibold text-white">Notifications</Text>
        <Text className="text-sm text-ink-muted">
          {unreadCount > 0 ? `${unreadCount} unread` : 'Inbox'}
        </Text>
      </Pressable>

      <Pressable
        className="mt-3 flex-row items-center justify-between rounded-xl border border-zinc-700 px-4 py-3.5 active:opacity-80"
        onPress={() => router.push('/(app)/athlete' as Href)}
      >
        <Text className="text-base font-semibold text-white">Athlete</Text>
        <Text className="text-sm text-ink-muted">Metrics</Text>
      </Pressable>

      <Pressable
        className="mt-3 flex-row items-center justify-between rounded-xl border border-zinc-700 px-4 py-3.5 active:opacity-80"
        onPress={() => router.push('/(app)/activity' as Href)}
      >
        <Text className="text-base font-semibold text-white">Recent activity</Text>
        <Text className="text-sm text-ink-muted">Workouts</Text>
      </Pressable>

      <Pressable
        className="mt-3 flex-row items-center justify-between rounded-xl border border-zinc-700 px-4 py-3.5 active:opacity-80"
        onPress={() => router.push('/(app)/upcoming' as Href)}
      >
        <Text className="text-base font-semibold text-white">Upcoming</Text>
        <Text className="text-sm text-ink-muted">Planned</Text>
      </Pressable>

      <Button variant="secondary" className="mt-3" label="Open web" onPress={() => void openWeb()} />

      <Button
        variant="danger"
        className="mt-3"
        label="Sign out"
        onPress={() => void onSignOut()}
        loading={busy}
      />

      <Text className="mt-6 text-xs text-ink-muted">Instance: {instanceUrl}</Text>
    </View>
    </SafeAreaView>
  );
}
