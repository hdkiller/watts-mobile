/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-screens/experimental';

import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { AppSymbol } from '@/src/components/AppSymbol';
import { Button } from '@/src/components/Button';
import { Skeleton } from '@/src/components/Skeleton';
import { copyText } from '@/src/features/referrals/copyText';
import { useMyReferral } from '@/src/features/referrals/useMyReferral';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { useThemeColors } from '@/src/theme/useThemeColors';

/** QR modules stay pure B/W for scanner reliability (DESIGN.md exception). */
const QR_MODULE_DARK = '#000000';
const QR_MODULE_LIGHT = '#ffffff';

export default function InviteFriendsScreen() {
  const theme = useThemeColors();
  const { data, isLoading, isError, refetch, isFetching } = useMyReferral(true);
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);

  useEffect(() => {
    if (isError) hapticError();
  }, [isError]);

  const onCopyLink = async () => {
    if (!data?.shareUrl) return;
    hapticLight();
    const how = await copyText(data.shareUrl);
    if (how === 'clipboard') {
      setCopied('link');
      hapticSuccess();
    }
  };

  const onCopyCode = async () => {
    if (!data?.code) return;
    hapticLight();
    const how = await copyText(data.code);
    if (how === 'clipboard') {
      setCopied('code');
      hapticSuccess();
    }
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
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          className="h-10 w-10 items-center justify-center rounded-full"
          onPress={() => router.back()}
        >
          <AppSymbol sf="chevron.left" size={20} tintColor={theme.textPrimary} fallback="‹" />
        </AnimatedPressable>
        <Text className="ml-1 flex-1 text-2xl font-semibold text-text-primary">Invite friends</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-10 pt-2"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Text className="text-sm leading-5 text-text-muted">
          Show this QR at the gym or share the link. Friends create a Coach Watts account from your
          invite.
        </Text>

        {isLoading ? (
          <View className="mt-8 items-center">
            <View className="rounded-3xl border border-border bg-card p-5">
              <Skeleton className="h-[220px] w-[220px] rounded-2xl" />
            </View>
            <Skeleton className="mt-6 h-3 w-16" />
            <Skeleton className="mt-2 h-8 w-44" />
            <Text className="mt-4 text-sm text-text-muted">Preparing your invite…</Text>
          </View>
        ) : null}

        {isError ? (
          <View className="mt-10 rounded-xl border border-danger/40 bg-tint-error p-4">
            <Text className="text-base font-medium text-danger">Couldn’t load invite</Text>
            <Text className="mt-1 text-sm text-red-400">Check your connection and try again.</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retry"
              hitSlop={8}
              className="mt-3 self-start"
              onPress={() => void refetch()}
            >
              <Text className="text-sm font-semibold text-brand">
                {isFetching ? 'Retrying…' : 'Retry'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {data ? (
          <View className="mt-8 items-center">
            <View
              testID="invite-qr"
              className="rounded-3xl border border-border bg-card p-5"
              accessibilityLabel="Invite QR code"
            >
              <View className="rounded-2xl p-2" style={{ backgroundColor: QR_MODULE_LIGHT }}>
                <QRCode
                  value={data.shareUrl}
                  size={220}
                  backgroundColor={QR_MODULE_LIGHT}
                  color={QR_MODULE_DARK}
                  ecl="M"
                />
              </View>
            </View>

            <AnimatedPressable
              testID="invite-code"
              accessibilityRole="button"
              accessibilityLabel={`Invite code ${data.code}. Double tap to copy.`}
              hitSlop={8}
              className="mt-6"
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
            </AnimatedPressable>

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
