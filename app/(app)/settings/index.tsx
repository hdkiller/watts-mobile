import { router, type Href, Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useState, useEffect, type ReactNode } from 'react';
import { Alert, AppState, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { useAuth } from '@/src/auth/AuthContext';
import { getHealthAuthStatus } from '@/src/features/log/healthAuth';
import {
  logTabPreferenceLabel,
} from '@/src/features/log/logTabPreference';
import { useLogTabPreference } from '@/src/features/log/useLogTabPreference';
import {
  absoluteInstanceUrl,
  dangerZoneWebPath,
  isNutritionTrackingEnabled,
  profileSettingsWebPath,
} from '@/src/features/profile/mapProfile';
import { useAthleteProfileQuery } from '@/src/features/profile/useProfile';
import { Colors } from '@/src/theme/colors';

function RowIcon({ sf, emoji }: { sf: SFSymbol; emoji: string }) {
  return (
    <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-zinc-800">
      {Platform.OS === 'ios' ? (
        <SymbolView name={sf} size={18} tintColor="#d4d4d8" />
      ) : (
        <Text style={{ fontSize: 16 }}>{emoji}</Text>
      )}
    </View>
  );
}

function Chevron() {
  if (Platform.OS === 'ios') {
    return <SymbolView name="chevron.right" size={14} tintColor={Colors.textMuted} />;
  }
  return <Text className="text-base text-ink-muted">›</Text>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mt-8">
      <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-muted">
        {title}
      </Text>
      <View className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">{children}</View>
    </View>
  );
}

function MenuRow({
  title,
  detail,
  sf,
  emoji,
  onPress,
  showChevron = true,
  isLast = false,
}: {
  title: string;
  detail?: string;
  sf: SFSymbol;
  emoji: string;
  onPress?: () => void;
  showChevron?: boolean;
  isLast?: boolean;
}) {
  const body = (
    <View
      className={`flex-row items-center px-4 py-3.5 ${
        isLast ? '' : 'border-b border-zinc-800/80'
      }`}
    >
      <RowIcon sf={sf} emoji={emoji} />
      <View className="min-w-0 flex-1">
        <Text className="text-base font-medium text-white">{title}</Text>
        {detail ? (
          <Text className="mt-0.5 text-sm text-ink-muted" numberOfLines={1}>
            {detail}
          </Text>
        ) : null}
      </View>
      {showChevron ? (
        <View className="ml-2">
          <Chevron />
        </View>
      ) : null}
    </View>
  );

  if (!onPress) {
    return body;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      className="active:opacity-80"
      onPress={onPress}
    >
      {body}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { instanceUrl, signOut } = useAuth();
  const { data: athleteProfile } = useAthleteProfileQuery();
  const nutritionEnabled = isNutritionTrackingEnabled(athleteProfile);
  const { preference: logTabPreference } = useLogTabPreference();
  const [healthStatus, setHealthStatus] = useState<string>('Checking…');

  useEffect(() => {
    let active = true;

    const updateStatus = async () => {
      try {
        const result = await getHealthAuthStatus();
        if (!active) return;
        if (result.status === 'connected' || result.status === 'unnecessary') {
          setHealthStatus('Connected');
        } else if (result.status === 'partially_connected') {
          setHealthStatus('Partially connected');
        } else if (result.status === 'should_request' || result.status === 'not_connected') {
          setHealthStatus('Not connected');
        } else {
          setHealthStatus('Not available');
        }
      } catch {
        if (active) {
          setHealthStatus('Not available');
        }
      }
    };

    void updateStatus();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        void updateStatus();
      }
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const openWebPath = async (path: string) => {
    if (!instanceUrl) return;
    await WebBrowser.openBrowserAsync(absoluteInstanceUrl(instanceUrl, path));
  };

  const handleInstancePress = () => {
    Alert.alert(
      'Instance settings',
      `You are currently connected to:\n${instanceUrl}\n\nTo connect to a self-hosted instance, you must sign out first.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out & change',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/instance');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'Account deletion is completed on the web Danger Zone. You may need to sign in on the web if session handoff is unavailable.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open web',
          style: 'destructive',
          onPress: () => void openWebPath(dangerZoneWebPath()),
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: true,
        }}
      />
      <SafeAreaView
        edges={{ bottom: true }}
        style={{ flex: 1, backgroundColor: Colors.background }}
      >
        <ScrollView
          className="flex-1 bg-surface-dark"
          contentContainerClassName="px-6 pb-12 pt-4"
        >
          <Text className="text-2xl font-semibold text-white">Settings</Text>
          <Text className="mt-1 text-sm text-ink-muted">
            Field preferences for this device. Planning, integrations, and billing stay on the web.
          </Text>

          <Section title="General">
            <MenuRow
              title="Notifications"
              sf="bell"
              emoji="🔔"
              onPress={() => router.push('/(app)/settings/notifications' as Href)}
            />
            <MenuRow
              title="Health Sync"
              detail={healthStatus}
              sf="heart"
              emoji="❤️"
              onPress={() => router.push('/(app)/settings/health' as Href)}
            />
            <MenuRow
              title="Units & locale"
              sf="ruler"
              emoji="📏"
              onPress={() => router.push('/(app)/settings/units' as Href)}
            />
            <MenuRow
              title="Sports"
              detail="Per-sport FTP, LTHR, Max HR"
              sf="figure.run"
              emoji="🏃"
              onPress={() => router.push('/(app)/settings/sports' as Href)}
            />
            <MenuRow
              title="Log defaults"
              detail={logTabPreferenceLabel(logTabPreference, nutritionEnabled)}
              sf="list.bullet.rectangle"
              emoji="📋"
              onPress={() => router.push('/(app)/settings/log' as Href)}
            />
            <MenuRow
              title="Instance"
              detail={instanceUrl ?? 'Not set'}
              sf="link"
              emoji="🔗"
              onPress={() => handleInstancePress()}
              isLast
            />
          </Section>

          <Section title="Coach">
            <MenuRow
              title="Coach identity"
              detail="Persona, nickname, About me"
              sf="bubble.left.and.bubble.right"
              emoji="💬"
              onPress={() => router.push('/(app)/settings/coach' as Href)}
              isLast
            />
          </Section>

          <Section title="Account">
            <MenuRow
              title="Athlete metrics"
              detail="Weight, FTP, HR"
              sf="person.crop.circle"
              emoji="👤"
              onPress={() => router.push('/(app)/athlete' as Href)}
            />
            <MenuRow
              title="Export my data"
              sf="square.and.arrow.up"
              emoji="📤"
              onPress={() => void openWebPath(dangerZoneWebPath())}
            />
            <MenuRow
              title="Delete account"
              sf="trash"
              emoji="🗑️"
              onPress={handleDeleteAccount}
            />
            <MenuRow
              title="Open web Profile Settings"
              sf="globe"
              emoji="🌐"
              onPress={() => void openWebPath(profileSettingsWebPath())}
              isLast
            />
          </Section>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
