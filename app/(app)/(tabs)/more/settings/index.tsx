import { router, type Href, Stack } from 'expo-router';
import type { SFSymbol } from 'expo-symbols';
import { useState, useEffect, type ReactNode } from 'react';
import { Alert, AppState, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { useAuth } from '@/src/auth/AuthContext';
import { AppSymbol } from '@/src/components/AppSymbol';
import { getHealthAuthStatus } from '@/src/features/log/healthAuth';
import {
  logTabPreferenceLabel } from '@/src/features/log/logTabPreference';
import { useLogTabPreference } from '@/src/features/log/useLogTabPreference';
import {
  dangerZoneWebPath,
  isNutritionTrackingEnabled,
  profileSettingsWebPath } from '@/src/features/profile/mapProfile';
import { useAthleteProfileQuery } from '@/src/features/profile/useProfile';
import { themePreferenceLabel } from '@/src/theme/themePreference';
import { useThemeColors } from '@/src/theme/useThemeColors';
import { useThemePreference } from '@/src/theme/useThemePreference';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { connectedAppsHubDetail } from '@/src/features/integrations/mapCatalog';
import { useIntegrationStatus } from '@/src/features/integrations/useIntegrationStatus';
import { APP_HREFS } from '@/src/linking/appHrefs';

function RowIcon({ sf, emoji }: { sf: SFSymbol; emoji: string }) {
  const theme = useThemeColors();
  return (
    <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-border-strong">
      <AppSymbol sf={sf} size={18} tintColor={theme.textBody} fallback={emoji} />
    </View>
  );
}

function Chevron() {
  const theme = useThemeColors();
  return (
    <AppSymbol sf="chevron.right" size={14} tintColor={theme.textMuted} fallback="›" />
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mt-8">
      <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
        {title}
      </Text>
      <View className="overflow-hidden rounded-xl border border-border bg-card">{children}</View>
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
  isLast = false }: {
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
        isLast ? '' : 'border-b border-border/80'
      }`}
    >
      <RowIcon sf={sf} emoji={emoji} />
      <View className="min-w-0 flex-1">
        <Text className="text-base font-medium text-text-primary">{title}</Text>
        {detail ? (
          <Text className="mt-0.5 text-sm text-text-muted" numberOfLines={1}>
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
  const theme = useThemeColors();

  const { instanceUrl, signOut } = useAuth();
  const { data: athleteProfile } = useAthleteProfileQuery();
  const nutritionEnabled = isNutritionTrackingEnabled(athleteProfile);
  const { preference: logTabPreference } = useLogTabPreference();
  const { preference: themePreference } = useThemePreference();
  const {
    rows: integrationRows,
    isLoading: integrationsLoading,
    isError: integrationsError,
  } = useIntegrationStatus();
  const connectedAppsDetail = connectedAppsHubDetail(integrationRows, {
    isLoading: integrationsLoading,
    isError: integrationsError,
  });
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
    await openInstanceWeb(instanceUrl, path);
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
          } },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'You’ll finish account deletion in Coach Watts. You may need to sign in again in the browser.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Coach Watts',
          style: 'destructive',
          onPress: () => void openWebPath(dangerZoneWebPath()) },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: true }}
      />
      <SafeAreaView
        edges={{ bottom: true }}
        style={{ flex: 1, backgroundColor: theme.surface }}
      >
        <ScrollView
          className="flex-1 bg-surface"
          contentContainerClassName="px-6 pb-12 pt-4"
        >
          <Text className="text-sm text-text-muted">
            Preferences for this device.
          </Text>

          <Section title="Integrations & Data">
            <MenuRow
              title="Health Sync"
              detail={healthStatus}
              sf="heart"
              emoji="❤️"
              onPress={() => router.push(APP_HREFS.settingsHealth as Href)}
            />
            <MenuRow
              title="Connected Apps"
              detail={connectedAppsDetail}
              sf="link.circle"
              emoji="🔌"
              onPress={() => router.push(APP_HREFS.settingsConnectedApps as Href)}
              isLast
            />
          </Section>

          <Section title="App Preferences">
            <MenuRow
              title="Appearance"
              detail={themePreferenceLabel(themePreference)}
              sf="circle.lefthalf.filled"
              emoji="🌓"
              onPress={() => router.push('/(app)/(tabs)/more/settings/appearance' as Href)}
            />
            <MenuRow
              title="Notification preferences"
              detail="Push & email alerts"
              sf="bell"
              emoji="🔔"
              onPress={() => router.push('/(app)/(tabs)/more/settings/notifications' as Href)}
            />
            <MenuRow
              title="Units & locale"
              sf="ruler"
              emoji="📏"
              onPress={() => router.push('/(app)/(tabs)/more/settings/units' as Href)}
            />
            <MenuRow
              title="Log defaults"
              detail={logTabPreferenceLabel(logTabPreference, nutritionEnabled)}
              sf="list.bullet.rectangle"
              emoji="📋"
              onPress={() => router.push('/(app)/(tabs)/more/settings/log' as Href)}
              isLast
            />
          </Section>

          <Section title="Coaching & Sport">
            <MenuRow
              title="Coach identity"
              detail="Persona, nickname, About me"
              sf="bubble.left.and.bubble.right"
              emoji="💬"
              onPress={() => router.push('/(app)/(tabs)/more/settings/coach' as Href)}
            />
            <MenuRow
              title="Sports"
              detail="Per-sport FTP, LTHR, Max HR"
              sf="figure.run"
              emoji="🏃"
              onPress={() => router.push('/(app)/(tabs)/more/settings/sports' as Href)}
              isLast
            />
          </Section>

          <Section title="Account & Billing">
            <MenuRow
              title="Subscription & Billing"
              detail="Plan, billing provider, restore purchases"
              sf="creditcard"
              emoji="💳"
              onPress={() => router.push(APP_HREFS.settingsSubscription as Href)}
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

          <Section title="Account Management">
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
              title="Open Profile Settings"
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
