import { router, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useState } from 'react';

import { useAuth } from '@/src/auth/AuthContext';
import { Colors } from '@/src/theme/colors';

export default function MoreScreen() {
  const { user, instanceUrl, signOut, refreshUser } = useAuth();
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
    <View className="flex-1 bg-surface-dark px-6 pt-4">
      <Text className="text-2xl font-semibold text-white">More</Text>

      <View className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
        <Text className="text-xs uppercase tracking-wide text-ink-muted">Signed in as</Text>
        <Text className="mt-1 text-lg text-white">{user?.name || user?.email || 'Athlete'}</Text>
        {user?.email ? <Text className="mt-1 text-sm text-ink-muted">{user.email}</Text> : null}
        <Pressable className="mt-3 self-start" onPress={() => void refreshUser()}>
          <Text className="text-sm font-medium text-brand">Refresh profile</Text>
        </Pressable>
      </View>

      <Pressable
        className="mt-4 flex-row items-center justify-between rounded-xl border border-zinc-700 px-4 py-3.5 active:opacity-80"
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

      <Pressable
        className="mt-3 items-center rounded-xl border border-zinc-700 py-3.5 active:opacity-80"
        onPress={() => void openWeb()}
      >
        <Text className="text-base font-semibold text-white">Open web</Text>
      </Pressable>

      <Pressable
        className="mt-3 items-center rounded-xl bg-zinc-800 py-3.5 active:opacity-80"
        onPress={() => void onSignOut()}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color={Colors.brand} />
        ) : (
          <Text className="text-base font-semibold text-red-400">Sign out</Text>
        )}
      </Pressable>

      <Text className="mt-6 text-xs text-ink-muted">Instance: {instanceUrl}</Text>
    </View>
  );
}
