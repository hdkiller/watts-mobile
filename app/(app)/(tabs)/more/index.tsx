/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import * as Linking from 'expo-linking';
import type { SFSymbol } from 'expo-symbols';
import * as WebBrowser from 'expo-web-browser';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { useAuth } from '@/src/auth/AuthContext';
import { AppSymbol } from '@/src/components/AppSymbol';
import {
  helpCenterWebPath,
  PRIVACY_POLICY_URL,
  SUPPORT_URL,
  TERMS_OF_SERVICE_URL,
} from '@/src/features/account/paths';
import { useUnreadNotificationsCount } from '@/src/features/notifications/useNotifications';
import { useTabScrollPadding } from '@/src/hooks/useTabScrollPadding';
import { APP_HREFS } from '@/src/linking/appHrefs';
import { useThemeColors } from '@/src/theme/useThemeColors';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { canUseAthleteReferralShare } from '@/src/features/referrals/isHostedReferralInstance';

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
  testID,
}: {
  title: string;
  detail?: string;
  sf: SFSymbol;
  onPress?: () => void;
  showChevron?: boolean;
  isLast?: boolean;
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
      {showChevron && !isDestructive ? (
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
  const showInviteFriends = canUseAthleteReferralShare(instanceUrl);

  const openWeb = async () => {
    await openInstanceWeb(instanceUrl, '/');
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
    SUPPORT_URL
      ? {
          key: 'support',
          title: 'Support',
          sf: 'questionmark.circle' as const,
          onPress: () => void openExternal(SUPPORT_URL),
        }
      : null,
  ].filter((row): row is NonNullable<typeof row> => row != null);

  return (
    <SafeAreaView
      testID="more-screen"
      edges={{ top: true }}
      style={{ flex: 1, backgroundColor: theme.surface }}
    >
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="px-6 pt-4"
        contentContainerStyle={{ paddingBottom: tabBottomPad }}
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
            <Text className="mt-1 text-xs font-medium text-brand">View profile & biometrics ›</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refresh profile"
            className="ml-2 h-9 w-9 items-center justify-center rounded-full bg-border-strong active:opacity-60"
            hitSlop={8}
            onPress={(e) => {
              e.stopPropagation();
              void refreshUser();
            }}
          >
            <AppSymbol sf="arrow.clockwise" size={16} tintColor={theme.textMuted} fallback="↻" />
          </Pressable>
        </Pressable>

        <Section title="Account & Hub">
          <MenuRow
            title="Notification inbox"
            detail={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            sf="bell"
            onPress={() => router.push('/(app)/(tabs)/more/notifications' as Href)}
          />
          {showInviteFriends ? (
            <MenuRow
              testID="more-invite-friends"
              title="Invite friends"
              detail="QR & link so others can join"
              sf="qrcode"
              onPress={() => router.push(APP_HREFS.invite as Href)}
            />
          ) : null}
          <MenuRow
            title="Help Center & Support"
            detail="Documentation, tickets & community"
            sf="questionmark.circle"
            onPress={() => void openInstanceWeb(instanceUrl, helpCenterWebPath())}
          />
          <MenuRow
            testID="more-settings"
            title="Settings"
            detail="Preferences, integrations & coach"
            sf="gearshape"
            onPress={() => router.push('/(app)/(tabs)/more/settings' as Href)}
          />
          <MenuRow
            title="Open Coach Watts"
            detail="Web control room & deep tools"
            sf="globe"
            onPress={() => void openWeb()}
            isLast
          />
        </Section>

        <Section title="Training & Schedule">
          <MenuRow
            title="Recent activity"
            detail="Completed workouts & analysis"
            sf="list.bullet"
            onPress={() => router.push(APP_HREFS.activityList as Href)}
          />
          <MenuRow
            title="Upcoming planned"
            detail="Scheduled workouts"
            sf="calendar"
            onPress={() => router.push(APP_HREFS.upcoming as Href)}
          />
          <MenuRow
            title="Goals"
            detail="Browse goals · manage on web"
            sf="flag"
            onPress={() => router.push(APP_HREFS.goalsList as Href)}
          />
          <MenuRow
            title="Events"
            detail="Race & life events · manage on web"
            sf="calendar.badge.clock"
            onPress={() => router.push(APP_HREFS.eventsList as Href)}
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
                isLast={index === aboutRows.length - 1}
              />
            ))}
          </Section>
        ) : null}

        <Section title="Account Session">
          <MenuRow
            title="Sign out"
            detail={busy ? 'Signing out…' : 'Disconnect this device'}
            sf="rectangle.portrait.and.arrow.right"
            onPress={() => void onSignOut()}
            isDestructive
            isLast
          />
        </Section>

        <Text className="mt-8 text-center text-sm text-text-muted">{appVersionLabel()}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
