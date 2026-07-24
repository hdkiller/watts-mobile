/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-screens/experimental';

import { AppSymbol } from '@/src/components/AppSymbol';
import { Button } from '@/src/components/Button';
import { useMyReferral } from '@/src/features/referrals/useMyReferral';
import { hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { useThemeColors } from '@/src/theme/useThemeColors';

export default function InviteFriendsScreen() {
  const theme = useThemeColors();
  const { data, isLoading, isError, refetch, isFetching } = useMyReferral(true);
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);

  const onCopyLink = async () => {
    if (!data?.shareUrl) return;
    hapticLight();
    await Clipboard.setStringAsync(data.shareUrl);
    setCopied('link');
    hapticSuccess();
  };

  const onCopyCode = async () => {
    if (!data?.code) return;
    hapticLight();
    await Clipboard.setStringAsync(data.code);
    setCopied('code');
    hapticSuccess();
  };

  const onShare = async () => {
    if (!data?.shareUrl) return;
    hapticLight();
    await Share.share({
      message: `Join me on Coach Watts — adaptive training coaching:\n${data.shareUrl}`,
      url: data.shareUrl,
    });
  };

  return (
    <SafeAreaView
      testID="invite-screen"
      edges={{ top: true, bottom: true }}
      style={{ flex: 1, backgroundColor: theme.surface }}
    >
      <View className="flex-row items-center px-4 pb-2 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
          onPress={() => router.back()}
        >
          <AppSymbol sf="chevron.left" size={20} tintColor={theme.textPrimary} fallback="‹" />
        </Pressable>
        <Text className="ml-1 flex-1 text-lg font-semibold text-text-primary">Invite friends</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-10 pt-2"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Text className="text-sm leading-5 text-text-muted">
          Show this QR at the gym or share the link. Friends create a Coach Watts account — your
          invite is tracked so we can reward successful shares later.
        </Text>

        {isLoading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator color={theme.brand} />
            <Text className="mt-3 text-sm text-text-muted">Preparing your invite…</Text>
          </View>
        ) : null}

        {isError ? (
          <View className="mt-10 rounded-xl border border-border bg-card p-4">
            <Text className="text-base font-medium text-text-primary">Couldn’t load invite</Text>
            <Text className="mt-1 text-sm text-text-muted">
              Check your connection and try again.
            </Text>
            <View className="mt-4">
              <Button
                label={isFetching ? 'Retrying…' : 'Retry'}
                onPress={() => void refetch()}
                loading={isFetching}
                variant="secondary"
              />
            </View>
          </View>
        ) : null}

        {data ? (
          <View className="mt-8 items-center">
            <View
              testID="invite-qr"
              className="rounded-3xl border border-border bg-white p-5"
              accessibilityLabel="Invite QR code"
            >
              <QRCode
                value={data.shareUrl}
                size={220}
                backgroundColor="#ffffff"
                color="#000000"
                ecl="M"
              />
            </View>

            <Pressable
              testID="invite-code"
              accessibilityRole="button"
              accessibilityLabel={`Invite code ${data.code}. Double tap to copy.`}
              className="mt-6 active:opacity-80"
              onPress={() => void onCopyCode()}
            >
              <Text className="text-center text-xs font-semibold uppercase tracking-widest text-text-muted">
                Code
              </Text>
              <Text className="mt-1 text-center font-mono text-2xl font-bold tracking-widest text-brand">
                {data.code}
              </Text>
              <Text className="mt-1 text-center text-xs text-text-muted">
                {copied === 'code' ? 'Copied' : 'Tap to copy'}
              </Text>
            </Pressable>

            {data.stats.attributedCount > 0 ? (
              <Text className="mt-4 text-center text-sm text-text-muted">
                {data.stats.attributedCount === 1
                  ? '1 friend joined via your link'
                  : `${data.stats.attributedCount} friends joined via your link`}
              </Text>
            ) : null}

            <View className="mt-8 w-full gap-3">
              <Button testID="invite-share" label="Share link" onPress={() => void onShare()} />
              <Button
                testID="invite-copy-link"
                label={copied === 'link' ? 'Link copied' : 'Copy link'}
                variant="secondary"
                onPress={() => void onCopyLink()}
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
