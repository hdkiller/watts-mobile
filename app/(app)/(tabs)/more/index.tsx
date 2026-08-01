/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import * as Linking from 'expo-linking';
import type { SFSymbol } from 'expo-symbols';
import * as WebBrowser from 'expo-web-browser';
import { useState, type ReactNode } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { ScrollViewMarker, SafeAreaView } from 'react-native-screens/experimental';

import { useAuth } from '@/src/auth/AuthContext';
import { AppSymbol } from '@/src/components/AppSymbol';
import {
  inviteRowDetail,
  notificationsRowDetail,
  subscriptionRowDetail,
} from '@/src/features/account/menuDetails';
import {
  helpCenterWebPath,
  PRIVACY_POLICY_URL,
  SUPPORT_URL,
  TERMS_OF_SERVICE_URL,
} from '@/src/features/account/paths';
import { useUnreadNotificationsCount } from '@/src/features/notifications/useNotifications';
import { useSubscriptionSummary } from '@/src/features/subscriptions/useSubscriptions';
import { useTabScrollPadding } from '@/src/hooks/useTabScrollPadding';
import { APP_HREFS } from '@/src/linking/appHrefs';
import { useThemeColors } from '@/src/theme/useThemeColors';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { canUseAthleteReferralShare } from '@/src/features/referrals/isHostedReferralInstance';
import { useMyReferral } from '@/src/features/referrals/useMyReferral';

function appVersionLabel(): string {
  const version = Constants.expoConfig?.version ?? '0.1.0';
  const build =
    Constants.nativeBuildVersion ??
    Constants.expoConfig?.ios?.buildNumber ??
    (Constants.expoConfig?.android?.versionCode != null
      ? String(Constants.expoConfig.android.versionCode)
      : undefined);
  return build ? `v${version} (${build})` : `v${version}`;
}

function RowIcon({ sf, isDestructive = false }: { sf: SFSymbol; isDestructive?: boolean }) {
  const theme = useThemeColors();
  return (
    <View className="mr-3 h-5 w-5 items-center justify-center">
      <AppSymbol
        sf={sf}
        size={18}
        tintColor={isDestructive ? theme.dangerOnSurface : theme.textMuted}
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

function AthleteAvatar({ name }: { name?: string | null }) {
  const initials =
    (name ?? 'A')
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'A';

  return (
    <View className="h-12 w-12 items-center justify-center rounded-full border border-brand/40 bg-brand/20">
      <Text className="text-base font-bold text-brand">{initials}</Text>
    </View>
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
  isDestructive = false,
  isExternal = false,
  testID,
}: {
  title: string;
  detail?: string;
  sf: SFSymbol;
  onPress?: () => void;
  showChevron?: boolean;
  isLast?: boolean;
  isDestructive?: boolean;
  isExternal?: boolean;
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

export default function MoreScreen() {
  const theme = useThemeColors();

  const { user, instanceUrl, signOut, refreshUser } = useAuth();
  const unreadCount = useUnreadNotificationsCount();
  const tabBottomPad = useTabScrollPadding();
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const showInviteFriends = canUseAthleteReferralShare(instanceUrl);
  const referralQuery = useMyReferral(showInviteFriends);
  const subscriptionQuery = useSubscriptionSummary();

  const openWeb = async () => {
    await openInstanceWeb(instanceUrl, '/');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshUser(),
        subscriptionQuery.refetch(),
        showInviteFriends ? referralQuery.refetch() : Promise.resolve(),
      ]);
    } catch {
      // Best-effort refresh — the rows keep their last known detail.
    } finally {
      setRefreshing(false);
    }
  };

  const openExternal = async (url: string) => {
    if (url.startsWith('mailto:')) {
      await Linking.openURL(url);
      return;
    }
    await WebBrowser.openBrowserAsync(url);
  };

  const onSignOut = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signOut();
    } finally {
      setBusy(false);
    }
  };

  const aboutRows = [
    PRIVACY_POLICY_URL
      ? {
          key: 'privacy',
          title: 'Privacy policy',
          sf: 'hand.raised' as const,
          onPress: () => void openExternal(PRIVACY_POLICY_URL),
        }
      : null,
    TERMS_OF_SERVICE_URL
      ? {
          key: 'terms',
          title: 'Terms',
          sf: 'doc.text' as const,
          onPress: () => void openExternal(TERMS_OF_SERVICE_URL),
        }
      : null,
  ].filter((row): row is NonNullable<typeof row> => row != null);

  return (
    <SafeAreaView
      testID="more-screen"
      edges={{ top: true }}
      style={{ flex: 1, backgroundColor: theme.surface }}
    >
      {/* Marks the content ScrollView so the native tab bar's minimize/restore
          tracking (NativeTabs minimizeBehavior) can find it. */}
      <ScrollViewMarker style={{ flex: 1 }}>
        <ScrollView
          className="flex-1 bg-surface"
          contentContainerClassName="px-6 pt-4"
          contentContainerStyle={{ paddingBottom: tabBottomPad }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void onRefresh()}
              tintColor={theme.brandOnSurface}
            />
          }
        >
          <Text className="text-2xl font-semibold text-text-primary">More</Text>

          {/* Interactive Profile Header Card */}
          <Pressable
            testID="more-athlete-profile"
            accessibilityRole="button"
            accessibilityLabel="Athlete profile"
            className="mt-6 flex-row items-center rounded-xl border border-border bg-card p-4 active:opacity-80"
            onPress={() => router.push(APP_HREFS.athlete as Href)}
          >
            <AthleteAvatar name={user?.name} />
            <View className="ml-3.5 min-w-0 flex-1">
              <Text className="text-lg font-semibold text-text-primary" numberOfLines={1}>
                {user?.name || user?.email || 'Athlete'}
              </Text>
              {user?.email ? (
                <Text className="mt-0.5 text-sm text-text-muted" numberOfLines={1}>
                  {user.email}
                </Text>
              ) : null}
              <Text className="mt-1 text-xs font-medium text-brand">
                Body metrics, AI profile & goal ›
              </Text>
            </View>
            <View className="ml-2">
              <Chevron />
            </View>
          </Pressable>

          <Section title="Your training">
            <MenuRow
              title="Activity history"
              detail="Completed workouts & analysis"
              sf="list.bullet"
              onPress={() => router.push(APP_HREFS.activityList as Href)}
            />
            <MenuRow
              title="Upcoming workouts"
              detail="Scheduled sessions"
              sf="calendar"
              onPress={() => router.push(APP_HREFS.upcoming as Href)}
            />
            <MenuRow
              title="Events"
              detail="Races & life events"
              sf="calendar.badge.clock"
              onPress={() => router.push(APP_HREFS.eventsList as Href)}
            />
            <MenuRow
              title="Goals"
              detail="What you’re training for"
              sf="flag"
              onPress={() => router.push(APP_HREFS.goalsList as Href)}
              isLast
            />
          </Section>

          <Section title="Account">
            <MenuRow
              testID="more-settings"
              title="Settings"
              detail="Preferences, integrations & coach"
              sf="gearshape"
              onPress={() => router.push('/(app)/(tabs)/more/settings' as Href)}
            />
            <MenuRow
              title="Notifications"
              detail={notificationsRowDetail(unreadCount)}
              sf="bell"
              onPress={() => router.push('/(app)/(tabs)/more/notifications' as Href)}
            />
            <MenuRow
              testID="more-subscription"
              title="Subscription"
              detail={subscriptionRowDetail(subscriptionQuery.data, {
                isLoading: subscriptionQuery.isLoading,
                isError: subscriptionQuery.isError,
              })}
              sf="creditcard"
              onPress={() => router.push(APP_HREFS.settingsSubscription as Href)}
              isLast={!showInviteFriends}
            />
            {showInviteFriends ? (
              <MenuRow
                testID="more-invite-friends"
                title="Invite a friend"
                detail={inviteRowDetail(referralQuery.data?.stats.attributedCount)}
                sf="qrcode"
                onPress={() => router.push(APP_HREFS.invite as Href)}
                isLast
              />
            ) : null}
          </Section>

          <Section title="Help">
            <MenuRow
              title="Help center"
              detail="Docs, tickets & community"
              sf="questionmark.circle"
              onPress={() => void openInstanceWeb(instanceUrl, helpCenterWebPath())}
              isExternal
            />
            {SUPPORT_URL ? (
              <MenuRow
                title="Contact support"
                sf="envelope"
                onPress={() => void openExternal(SUPPORT_URL)}
                isExternal
              />
            ) : null}
            <MenuRow
              title="Open on the web"
              detail="Full control room & deep tools"
              sf="globe"
              onPress={() => void openWeb()}
              isExternal
              isLast
            />
          </Section>

          {aboutRows.length > 0 ? (
            <Section title="About">
              {aboutRows.map((row, index) => (
                <MenuRow
                  key={row.key}
                  title={row.title}
                  sf={row.sf}
                  onPress={row.onPress}
                  isExternal
                  isLast={index === aboutRows.length - 1}
                />
              ))}
            </Section>
          ) : null}

          <View className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
            <MenuRow
              title="Sign out"
              detail={busy ? 'Signing out…' : 'Disconnect this device'}
              sf="rectangle.portrait.and.arrow.right"
              onPress={() => void onSignOut()}
              isDestructive
              isLast
            />
          </View>

          <Text className="mt-8 text-center text-sm text-text-muted">{appVersionLabel()}</Text>
        </ScrollView>
      </ScrollViewMarker>
    </SafeAreaView>
  );
}
