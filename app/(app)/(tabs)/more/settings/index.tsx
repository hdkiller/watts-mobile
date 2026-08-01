/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { router, type Href, Stack } from 'expo-router';
import type { SFSymbol } from 'expo-symbols';
import { useState, useEffect, type ReactNode } from 'react';
import { Alert, AppState, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { useAuth } from '@/src/auth/AuthContext';
import { AppSymbol } from '@/src/components/AppSymbol';
import { subscriptionRowDetail } from '@/src/features/account/menuDetails';
import { useSubscriptionSummary } from '@/src/features/subscriptions/useSubscriptions';
import { getHealthAuthStatus } from '@/src/features/log/healthAuth';
import { logTabPreferenceLabel } from '@/src/features/log/logTabPreference';
import { useLogTabPreference } from '@/src/features/log/useLogTabPreference';
import {
  dangerZoneWebPath,
  isNutritionTrackingEnabled,
  profileSettingsWebPath,
} from '@/src/features/profile/mapProfile';
import { useAthleteProfileQuery } from '@/src/features/profile/useProfile';
import { themePreferenceLabel } from '@/src/theme/themePreference';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';
import { useThemePreference } from '@/src/theme/useThemePreference';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { connectedAppsHubDetail } from '@/src/features/integrations/mapCatalog';
import { useIntegrationStatus } from '@/src/features/integrations/useIntegrationStatus';
import { useTabScrollPadding } from '@/src/hooks/useTabScrollPadding';
import { APP_HREFS } from '@/src/linking/appHrefs';

function RowIcon({ sf, isDestructive = false }: { sf: SFSymbol; isDestructive?: boolean }) {
  const theme = useThemeColors();
  return (
    <View className="mr-3 h-5 w-5 items-center justify-center">
      <AppSymbol
        sf={sf}
        size={18}
        tintColor={isDestructive ? Colors.danger : theme.textMuted}
        fallback=""
      />
    </View>
  );
}

function Chevron() {
  const theme = useThemeColors();
  return <AppSymbol sf="chevron.right" size={14} tintColor={theme.textMuted} fallback="›" />;
}

/** Marks rows that hand off to the browser so leaving the app is never a surprise. */
function ExternalMark() {
  const theme = useThemeColors();
  return <AppSymbol sf="arrow.up.right" size={13} tintColor={theme.textMuted} fallback="↗" />;
}

/**
 * `index` is the Settings stack's `unstable_settings.anchor`, so when it's
 * pushed from the More root it becomes the sole/first entry in this stack's
 * own navigation state — the auto-generated header back button only looks at
 * that local state, not the parent tree, so it never appears. Supply an
 * explicit one, matching the fallback pattern already used in
 * settings/notifications.tsx.
 */
function goBackToMore() {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace('/(app)/(tabs)/more' as Href);
}

/** Only a handful of preferences are device-local; the rest follow the account. */
function DeviceTag() {
  return (
    <Text className="ml-2 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
      This device
    </Text>
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
  onPress,
  showChevron = true,
  isLast = false,
  isExternal = false,
  isDeviceLocal = false,
  isDestructive = false,
  testID,
}: {
  title: string;
  detail?: string;
  sf: SFSymbol;
  onPress?: () => void;
  showChevron?: boolean;
  isLast?: boolean;
  isExternal?: boolean;
  isDeviceLocal?: boolean;
  isDestructive?: boolean;
  testID?: string;
}) {
  const body = (
    <View
      className={`flex-row items-center px-4 py-3.5 ${isLast ? '' : 'border-b border-border/80'}`}
    >
      <RowIcon sf={sf} isDestructive={isDestructive} />
      <View className="min-w-0 flex-1">
        <Text
          className={`text-base font-medium ${isDestructive ? 'text-danger' : 'text-text-primary'}`}
        >
          {title}
        </Text>
        {detail ? (
          <Text className="mt-0.5 text-sm text-text-muted" numberOfLines={1}>
            {detail}
          </Text>
        ) : null}
      </View>
      {isDeviceLocal ? <DeviceTag /> : null}
      {showChevron && !isDestructive ? (
        <View className="ml-2">{isExternal ? <ExternalMark /> : <Chevron />}</View>
      ) : null}
    </View>
  );

  if (!onPress) {
    return body;
  }

  return (
    <Pressable
      testID={testID}
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
  const renderHeaderLeft = () => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={12}
      onPress={goBackToMore}
      style={{
        minWidth: 44,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: Platform.OS === 'ios' ? -6 : 0,
      }}
    >
      <AppSymbol sf="chevron.left" size={22} tintColor={theme.textPrimary} fallback="←" />
    </Pressable>
  );

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
  const subscriptionQuery = useSubscriptionSummary();
  const tabBottomPad = useTabScrollPadding();
  const [healthStatus, setHealthStatus] = useState<string>('Checking…');
  // Name the platform the athlete actually recognises rather than our pipe name.
  const healthPlatformLabel = Platform.OS === 'ios' ? 'Apple Health' : 'Health Connect';

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
    const opened = await openInstanceWeb(instanceUrl, path);
    if (!opened) {
      Alert.alert(
        'Unable to open browser',
        'We could not open your Coach Watts account page because no server is currently connected. Please sign in again and try once more.',
      );
    }
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
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Coach Watts account?',
      'This action will permanently delete your profile, workout history, AI coaching recommendations, and health sync integrations.\n\nYou will be handed off directly to your authenticated Coach Watts account page to confirm final deletion.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue to Account Deletion',
          style: 'destructive',
          onPress: () => void openWebPath(dangerZoneWebPath()),
        },
      ],
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <SafeAreaView testID="settings-screen" style={{ flex: 1, backgroundColor: theme.surface }}>
        <ScrollView
          className="flex-1 bg-surface"
          contentContainerClassName="px-6 pt-4"
          contentContainerStyle={{ paddingBottom: tabBottomPad }}
        >
          <Text className="text-sm text-text-muted">
            Preferences follow your account unless marked “This device”.
          </Text>

          <Section title="Data sources">
            <MenuRow
              testID="more-health-sync"
              title={healthPlatformLabel}
              detail={healthStatus}
              sf="heart"
              onPress={() => router.push(APP_HREFS.settingsHealth as Href)}
            />
            <MenuRow
              title="Connected apps"
              detail={connectedAppsDetail}
              sf="link.circle"
              onPress={() => router.push(APP_HREFS.settingsConnectedApps as Href)}
              isLast
            />
          </Section>

          <Section title="Preferences">
            <MenuRow
              title="Appearance"
              detail={themePreferenceLabel(themePreference)}
              sf="circle.lefthalf.filled"
              onPress={() => router.push('/(app)/(tabs)/more/settings/appearance' as Href)}
              isDeviceLocal
            />
            <MenuRow
              title="Units & locale"
              sf="ruler"
              onPress={() => router.push('/(app)/(tabs)/more/settings/units' as Href)}
            />
            <MenuRow
              title="Notifications"
              detail="Push & email alerts"
              sf="bell"
              onPress={() => router.push('/(app)/(tabs)/more/settings/notifications' as Href)}
            />
            <MenuRow
              title="Default log view"
              detail={logTabPreferenceLabel(logTabPreference, nutritionEnabled)}
              sf="list.bullet.rectangle"
              onPress={() => router.push(APP_HREFS.settingsLog as Href)}
              isDeviceLocal
            />
            <MenuRow
              title="Nutrition tracking"
              detail={nutritionEnabled ? 'On' : 'Off'}
              sf="leaf"
              onPress={() => router.push(APP_HREFS.settingsNutrition as Href)}
              isLast
            />
          </Section>

          <Section title="Coaching">
            <MenuRow
              title="Coach persona"
              detail="Nickname, tone, About me"
              sf="bubble.left.and.bubble.right"
              onPress={() => router.push('/(app)/(tabs)/more/settings/coach' as Href)}
            />
            <MenuRow
              testID="settings-sports"
              title="Sports & thresholds"
              detail="Per-sport FTP, LTHR, Max HR"
              sf="figure.run"
              onPress={() => router.push(APP_HREFS.settingsSports as Href)}
              isLast
            />
          </Section>

          <Section title="Account">
            <MenuRow
              title="Subscription"
              detail={subscriptionRowDetail(subscriptionQuery.data, {
                isLoading: subscriptionQuery.isLoading,
                isError: subscriptionQuery.isError,
              })}
              sf="creditcard"
              onPress={() => router.push(APP_HREFS.settingsSubscription as Href)}
            />
            <MenuRow
              title="Server"
              detail={instanceUrl ?? 'Not set'}
              sf="link"
              onPress={() => handleInstancePress()}
            />
            <MenuRow
              title="Manage account on the web"
              sf="globe"
              onPress={() => void openWebPath(profileSettingsWebPath())}
              isExternal
            />
            <MenuRow
              title="Export my data"
              sf="square.and.arrow.up"
              onPress={() => void openWebPath(dangerZoneWebPath())}
              isExternal
            />
            <MenuRow
              title="Delete account"
              sf="trash"
              onPress={handleDeleteAccount}
              isDestructive
              isLast
            />
          </Section>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
