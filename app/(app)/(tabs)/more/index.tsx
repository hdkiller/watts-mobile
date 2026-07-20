import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import * as Linking from 'expo-linking';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import * as WebBrowser from 'expo-web-browser';
import { useState, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { useAuth } from '@/src/auth/AuthContext';
import { Button } from '@/src/components/Button';
import {
  PRIVACY_POLICY_URL,
  SUPPORT_URL,
  TERMS_OF_SERVICE_URL,
} from '@/src/features/account/paths';
import { useUnreadNotificationsCount } from '@/src/features/notifications/useNotifications';
import { useTabScrollPadding } from '@/src/hooks/useTabScrollPadding';
import { useThemeColors } from '@/src/theme/useThemeColors';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';

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

function RowIcon({ sf, emoji }: { sf: SFSymbol; emoji: string }) {
  const theme = useThemeColors();
  return (
    <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-border-strong">
      {Platform.OS === 'ios' ? (
        <SymbolView name={sf} size={18} tintColor={theme.textBody} />
      ) : (
        <Text style={{ fontSize: 16 }}>{emoji}</Text>
      )}
    </View>
  );
}

function Chevron() {
  const theme = useThemeColors();
  if (Platform.OS === 'ios') {
    return <SymbolView name="chevron.right" size={14} tintColor={theme.textMuted} />;
  }
  return <Text className="text-base text-text-muted">›</Text>;
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

export default function MoreScreen() {
  const theme = useThemeColors();

  const { user, instanceUrl, signOut, refreshUser } = useAuth();
  const unreadCount = useUnreadNotificationsCount();
  const tabBottomPad = useTabScrollPadding();
  const [busy, setBusy] = useState(false);

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
          emoji: '🔒',
          onPress: () => void openExternal(PRIVACY_POLICY_URL),
        }
      : null,
    TERMS_OF_SERVICE_URL
      ? {
          key: 'terms',
          title: 'Terms',
          sf: 'doc.text' as const,
          emoji: '📄',
          onPress: () => void openExternal(TERMS_OF_SERVICE_URL),
        }
      : null,
    SUPPORT_URL
      ? {
          key: 'support',
          title: 'Support',
          sf: 'questionmark.circle' as const,
          emoji: '❓',
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

        <View className="mt-6 rounded-xl border border-border bg-card/80 p-4">
          <Text className="text-xs uppercase tracking-wide text-text-muted">Signed in as</Text>
          <Text className="mt-1 text-lg text-text-primary">{user?.name || user?.email || 'Athlete'}</Text>
          {user?.email ? <Text className="mt-1 text-sm text-text-muted">{user.email}</Text> : null}
          <Pressable className="mt-3 self-start" hitSlop={8} onPress={() => void refreshUser()}>
            <Text className="text-sm font-medium text-brand">Refresh profile</Text>
          </Pressable>
        </View>

        <Section title="Training">
          <MenuRow
            title="Recent activity"
            sf="list.bullet"
            emoji="📋"
            onPress={() => router.push('/(app)/(tabs)/today/activity' as Href)}
          />
          <MenuRow
            title="Upcoming"
            sf="calendar"
            emoji="📅"
            onPress={() => router.push('/(app)/(tabs)/today/upcoming' as Href)}
            isLast
          />
        </Section>

        <Section title="Account">
          <MenuRow
            title="Athlete profile"
            detail="AI summary & metrics"
            sf="person.crop.circle"
            emoji="👤"
            onPress={() => router.push('/(app)/(tabs)/more/athlete' as Href)}
          />
          <MenuRow
            title="Notifications"
            detail={unreadCount > 0 ? `${unreadCount} unread` : 'Inbox'}
            sf="bell"
            emoji="🔔"
            onPress={() => router.push('/(app)/(tabs)/more/notifications' as Href)}
          />
          <MenuRow
            title="Settings"
            sf="gearshape"
            emoji="⚙️"
            onPress={() => router.push('/(app)/(tabs)/more/settings' as Href)}
          />
          <MenuRow
            title="Open web"
            sf="globe"
            emoji="🌐"
            onPress={() => void openWeb()}
            isLast
          />
        </Section>

        <Button
          variant="danger"
          className="mt-8"
          label="Sign out"
          onPress={() => void onSignOut()}
          loading={busy}
        />

        {aboutRows.length > 0 ? (
          <Section title="About">
            {aboutRows.map((row, index) => (
              <MenuRow
                key={row.key}
                title={row.title}
                sf={row.sf}
                emoji={row.emoji}
                onPress={row.onPress}
                isLast={index === aboutRows.length - 1}
              />
            ))}
          </Section>
        ) : null}

        <Text className="mt-8 text-center text-sm text-text-muted">{appVersionLabel()}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
