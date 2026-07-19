import { router, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState, type ReactNode } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { Button } from '@/src/components/Button';
import { Skeleton, SkeletonScreen } from '@/src/components/Skeleton';
import { SportIcon } from '@/src/components/SportIcon';
import { useRecentActivityQuery, useUpcomingPlannedQuery } from '@/src/features/activity/useActivity';
import { NutritionGlance } from '@/src/features/nutrition/NutritionGlance';
import { useTodayNutritionQuery } from '@/src/features/nutrition/useNutrition';
import { isNutritionTrackingEnabled } from '@/src/features/profile/mapProfile';
import { useAthleteProfileQuery } from '@/src/features/profile/useProfile';
import { useActiveRecoveryQuery } from '@/src/features/recovery/useRecovery';
import { ActiveRecoveryBand } from '@/src/features/today/active-recovery-band';
import { ComingUpStrip } from '@/src/features/today/coming-up-strip';
import {
  confidenceFilledCount,
  formatDuration,
  heroToneForAction,
  type HeroTone,
} from '@/src/features/today/mapTodayPayload';
import { RecentlyTeaser } from '@/src/features/today/recently-teaser';
import type { RecoverySentiment, TodayPlannedWorkout } from '@/src/features/today/types';
import { useAcceptRecommendation, useTodayQuery } from '@/src/features/today/useToday';
import { Colors } from '@/src/theme/colors';

function openPlannedWorkout(id: string) {
  router.push(`/(app)/planned/${id}` as Href);
}

function openDiscussWithCoach() {
  router.push('/(app)/(tabs)/coach?discuss=1' as Href);
}

const SENTIMENT_DOT: Record<RecoverySentiment, string> = {
  good: 'bg-green-400',
  ok: 'bg-modify',
  poor: 'bg-red-400',
};

function RecoveryMetricTile({
  label,
  value,
  sentiment,
}: {
  label: string;
  value: string;
  sentiment: RecoverySentiment | null | undefined;
}) {
  return (
    <View className="flex-1 rounded-lg border border-zinc-800 px-3 py-2">
      <View className="flex-row items-center gap-1.5">
        {sentiment ? (
          <View
            accessibilityLabel={`${label} ${sentiment}`}
            className={`h-1.5 w-1.5 rounded-full ${SENTIMENT_DOT[sentiment]}`}
          />
        ) : null}
        <Text className="text-[10px] uppercase text-ink-muted">{label}</Text>
      </View>
      <Text className="mt-0.5 text-sm text-white">{value}</Text>
    </View>
  );
}

const HERO_TONE_CLASSES: Record<
  HeroTone,
  { accent: string; kicker: string; tint: string; fill: string }
> = {
  train: {
    accent: 'border-l-brand',
    kicker: 'text-brand',
    tint: 'bg-brand/10',
    fill: 'bg-brand',
  },
  rest: {
    accent: 'border-l-recovery',
    kicker: 'text-recovery',
    tint: 'bg-recovery/10',
    fill: 'bg-recovery',
  },
  modify: {
    accent: 'border-l-modify',
    kicker: 'text-modify',
    tint: 'bg-modify/10',
    fill: 'bg-modify',
  },
};

function ConfidenceDots({
  confidence,
  fillClass,
}: {
  confidence: number;
  fillClass: string;
}) {
  const filled = confidenceFilledCount(confidence);
  if (filled == null) return null;
  return (
    <View
      accessibilityLabel={`Confidence ${filled} of 3`}
      className="ml-2 flex-row items-center gap-1"
    >
      {[1, 2, 3].map((n) => (
        <View
          key={n}
          className={`h-1.5 w-1.5 rounded-full ${n <= filled ? fillClass : 'bg-zinc-600'}`}
        />
      ))}
    </View>
  );
}

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function PlannedSummaryCard({
  planned,
  hero = false,
}: {
  planned: TodayPlannedWorkout;
  hero?: boolean;
}) {
  return (
    <AnimatedPressable
      className={`${hero ? 'mt-6 rounded-2xl' : 'mt-4 rounded-xl'} border border-zinc-800 bg-zinc-900/80 p-4`}
      onPress={() => openPlannedWorkout(planned.id)}
    >
      <View className="flex-row items-start gap-3">
        <SportIcon type={planned.type} size={hero ? 18 : 14} />
        <View className="min-w-0 flex-1">
          <Text className="text-xs uppercase tracking-wide text-ink-muted">
            {hero ? 'Today’s planned workout' : 'Planned workout'}
          </Text>
          <Text className={`${hero ? 'mt-2 text-2xl' : 'mt-1 text-lg'} font-semibold text-white`}>
            {planned.title}
          </Text>
          <Text className="mt-2 text-sm text-ink-muted">
            {[
              planned.type,
              formatDuration(planned.durationSec),
              planned.tss != null ? `TSS ${Math.round(planned.tss)}` : null,
              planned.structureSummary,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
          {hero && planned.description ? (
            <Text className="mt-3 text-base leading-6 text-zinc-200" numberOfLines={3}>
              {planned.description}
            </Text>
          ) : null}
        </View>
      </View>
    </AnimatedPressable>
  );
}

/** Staggered fade-in-up used for the Today sections; `order` sets the delay slot. */
function EnterSection({ order, children }: { order: number; children: ReactNode }) {
  return (
    <Animated.View entering={FadeInDown.duration(300).delay(order * 60)}>{children}</Animated.View>
  );
}

export default function TodayScreen() {
  const { instanceUrl } = useAuth();
  const { data, isLoading, isError, error, refetch, isRefetching } = useTodayQuery();
  const {
    data: activeRecovery,
    isError: recoveryError,
    error: recoveryErr,
    refetch: refetchRecovery,
    isRefetching: recoveryRefetching,
  } = useActiveRecoveryQuery();
  const upcomingQuery = useUpcomingPlannedQuery();
  const recentQuery = useRecentActivityQuery();
  const profileQuery = useAthleteProfileQuery();
  const nutritionEnabled = isNutritionTrackingEnabled(profileQuery.data);
  const nutritionQuery = useTodayNutritionQuery({ enabled: nutritionEnabled });
  const acceptMutation = useAcceptRecommendation();
  const [actionError, setActionError] = useState<string | null>(null);

  const onAccept = async () => {
    if (!data?.recommendationId || !data.canAccept) return;
    setActionError(null);
    try {
      await acceptMutation.mutateAsync(data.recommendationId);
    } catch (err) {
      setActionError(friendlyError(err, 'Accept failed'));
    }
  };

  const openWeb = async () => {
    if (!instanceUrl) return;
    await WebBrowser.openBrowserAsync(instanceUrl);
  };

  const onRefresh = () => {
    void refetch();
    void refetchRecovery();
    void upcomingQuery.refetch();
    void recentQuery.refetch();
    void profileQuery.refetch();
    if (nutritionEnabled) void nutritionQuery.refetch();
  };

  if (isLoading && !data) {
    return (
      <SkeletonScreen>
        <View className="flex-1 bg-surface-dark px-6 pt-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-7 w-48" />
          <Skeleton className="mt-6 h-44 rounded-2xl" />
          <View className="mt-4 flex-row gap-2">
            <Skeleton className="h-14 flex-1" />
            <Skeleton className="h-14 flex-1" />
            <Skeleton className="h-14 flex-1" />
          </View>
          <Skeleton className="mt-6 h-12 rounded-xl" />
          <Skeleton className="mt-3 h-12 rounded-xl" />
        </View>
      </SkeletonScreen>
    );
  }

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const hasRecoveryMetrics =
    data?.recovery.sleepLabel || data?.recovery.hrvLabel || data?.recovery.feelLabel;
  const hasRecommendation = Boolean(data?.recommendationId);
  const planned = data?.plannedWorkout ?? null;
  const plannedOnlyHero = !isError && !hasRecommendation && Boolean(planned);
  const emptyNoDecision = !isError && !hasRecommendation && !planned;
  const heroTone = heroToneForAction(data?.action);
  const heroToneClasses = HERO_TONE_CLASSES[heroTone];

  return (
    <ScrollView
      className="flex-1 bg-surface-dark"
      contentContainerClassName="px-6 pb-10 pt-4"
      refreshControl={
        <RefreshControl
          refreshing={
            isRefetching ||
            recoveryRefetching ||
            upcomingQuery.isRefetching ||
            recentQuery.isRefetching ||
            profileQuery.isRefetching ||
            nutritionQuery.isRefetching
          }
          onRefresh={onRefresh}
          tintColor={Colors.brand}
        />
      }
    >
      <EnterSection order={0}>
        <Text className="text-sm text-ink-muted">{dateLabel}</Text>
        <Text className="mt-1 text-2xl font-semibold text-white">{greetingForNow()}</Text>
      </EnterSection>

      {isError ? (
        <View className="mt-6 rounded-xl border border-red-900/50 bg-red-950/40 p-4">
          <Text className="text-base text-red-300">
            {friendlyError(error, 'Could not load today')}
          </Text>
          <Pressable className="mt-3" hitSlop={8} onPress={() => void refetch()}>
            <Text className="font-semibold text-brand">Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {emptyNoDecision ? (
        <View className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
          <Text className="text-lg font-semibold text-white">No recommendation yet</Text>
          <Text className="mt-2 text-sm leading-5 text-ink-muted">
            Waiting for today’s AI recommendation (or sync). Pull to refresh, or open the web app to
            generate guidance.
          </Text>
          <View className="mt-4 flex-row flex-wrap gap-x-4 gap-y-2">
            <Pressable className="py-1 active:opacity-70" hitSlop={8} onPress={() => void refetch()}>
              <Text className="font-semibold text-brand">Retry</Text>
            </Pressable>
            {instanceUrl ? (
              <Pressable className="py-1 active:opacity-70" hitSlop={8} onPress={() => void openWeb()}>
                <Text className="font-semibold text-brand">Open web</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      {hasRecommendation ? (
        <EnterSection order={1}>
          <View
            className={`mt-6 rounded-2xl border border-zinc-800 border-l-4 ${heroToneClasses.accent} ${heroToneClasses.tint} p-5`}
          >
            <View className="flex-row items-center">
              <Text className="text-xs uppercase tracking-wide text-ink-muted">Today’s call</Text>
              {data!.confidence != null ? (
                <ConfidenceDots confidence={data!.confidence} fillClass={heroToneClasses.fill} />
              ) : null}
            </View>
            <Text className={`mt-2 text-2xl font-semibold ${heroToneClasses.kicker}`}>
              {data!.actionLabel}
            </Text>
            {data!.rationale ? (
              <Text className="mt-3 text-base leading-6 text-zinc-200">{data!.rationale}</Text>
            ) : null}
            {data!.modificationSummary && !data!.userAccepted ? (
              <Text className="mt-3 text-sm text-zinc-400">
                Proposed change: {data!.modificationSummary}
              </Text>
            ) : null}
          </View>
        </EnterSection>
      ) : null}

      {plannedOnlyHero && planned ? (
        <EnterSection order={1}>
          <PlannedSummaryCard planned={planned} hero />
        </EnterSection>
      ) : null}

      {hasRecommendation && planned ? (
        <EnterSection order={2}>
          <PlannedSummaryCard planned={planned} />
        </EnterSection>
      ) : null}

      {hasRecoveryMetrics ? (
        <EnterSection order={3}>
          <View className="mt-4 flex-row gap-2">
            {data?.recovery.sleepLabel ? (
              <RecoveryMetricTile
                label="Sleep"
                value={data.recovery.sleepLabel}
                sentiment={data.recovery.sleepSentiment}
              />
            ) : null}
            {data?.recovery.hrvLabel ? (
              <RecoveryMetricTile
                label="HRV"
                value={data.recovery.hrvLabel}
                sentiment={data.recovery.hrvSentiment}
              />
            ) : null}
            {data?.recovery.feelLabel ? (
              <RecoveryMetricTile
                label="Feel"
                value={data.recovery.feelLabel}
                sentiment={data.recovery.feelSentiment}
              />
            ) : null}
          </View>
        </EnterSection>
      ) : null}

      <ActiveRecoveryBand
        items={activeRecovery}
        isError={recoveryError}
        errorMessage={friendlyError(recoveryErr, 'Could not load recovery context')}
        onRetry={() => void refetchRecovery()}
      />

      {actionError ? <Text className="mt-4 text-sm text-red-400">{actionError}</Text> : null}

      {hasRecommendation ? (
        <EnterSection order={4}>
          <View className="mt-6 gap-3">
            {data?.userAccepted ? (
              planned ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Accepted — view workout"
                  className="flex-row items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3.5 active:opacity-70"
                  onPress={() => openPlannedWorkout(planned.id)}
                >
                  <Text className="text-base font-semibold text-green-400">✓</Text>
                  <Text className="text-base font-semibold text-green-400">
                    Accepted — view workout
                  </Text>
                </Pressable>
              ) : (
                <View className="flex-row items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3.5">
                  <Text className="text-base font-semibold text-green-400">✓</Text>
                  <Text className="text-base font-semibold text-green-400">
                    {data.action === 'rest' ? 'Rest day accepted' : 'Accepted'}
                  </Text>
                </View>
              )
            ) : (
              <>
                {data?.canAccept ? (
                  <Button
                    label={data.action === 'rest' ? 'Accept rest day' : 'Accept recommendation'}
                    onPress={() => void onAccept()}
                    loading={acceptMutation.isPending}
                  />
                ) : null}
                {planned ? (
                  <Button
                    variant="secondary"
                    label="View workout details"
                    onPress={() => openPlannedWorkout(planned.id)}
                  />
                ) : null}
              </>
            )}
            <Button
              variant="secondary"
              label="Discuss with Coach"
              onPress={openDiscussWithCoach}
            />
          </View>
        </EnterSection>
      ) : null}

      {plannedOnlyHero && planned ? (
        <EnterSection order={2}>
          <View className="mt-6 gap-3">
            <Button label="View workout details" onPress={() => openPlannedWorkout(planned.id)} />
            {instanceUrl ? (
              <Button variant="secondary" label="Open web" onPress={() => void openWeb()} />
            ) : null}
          </View>
        </EnterSection>
      ) : null}

      <EnterSection order={5}>
        <ComingUpStrip excludePlannedId={planned?.id} />
        <RecentlyTeaser />
        <NutritionGlance />
      </EnterSection>
    </ScrollView>
  );
}
