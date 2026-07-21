import { router, type Href } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-screens/experimental';

import { useOfflineCached } from '@/src/hooks/useOfflineCached';
import { useTabScrollPadding } from '@/src/hooks/useTabScrollPadding';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { Button } from '@/src/components/Button';
import { OfflineBanner } from '@/src/components/OfflineBanner';
import { Skeleton, SkeletonScreen } from '@/src/components/Skeleton';
import { SportIcon } from '@/src/components/SportIcon';
import {
  useCompletePlannedWorkout,
  useRecentActivityQuery,
  useSkipPlannedWorkout,
  useUpcomingPlannedQuery,
} from '@/src/features/activity/useActivity';
import { NutritionGlance } from '@/src/features/nutrition/NutritionGlance';
import { useTodayNutritionQuery } from '@/src/features/nutrition/useNutrition';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { FinishSetupCard } from '@/src/features/activation/FinishSetupCard';
import { useActivationStatus } from '@/src/features/activation/useActivationStatus';
import { useIntegrationStatus } from '@/src/features/integrations/useIntegrationStatus';
import { isDailyCheckinCompleted } from '@/src/features/log/isDailyCheckinCompleted';
import { useDailyCheckinQuery } from '@/src/features/log/useDailyCheckin';
import { isNutritionTrackingEnabled } from '@/src/features/profile/mapProfile';
import { useAthleteProfileQuery } from '@/src/features/profile/useProfile';
import { DASHBOARD_PROFILE_KEY } from '@/src/features/profile/useRecentWellness';
import { useActiveRecoveryQuery } from '@/src/features/recovery/useRecovery';
import { AnalysisReadyCard } from '@/src/features/today/analysis-ready-card';
import { AnalyzeReadinessPanel } from '@/src/features/today/AnalyzeReadinessPanel';
import { ComingUpStrip } from '@/src/features/today/coming-up-strip';
import { MoreActionsSheet, type MoreAction } from '@/src/features/today/more-actions-sheet';
import { UpcomingEventsGlance } from '@/src/features/today/UpcomingEventsGlance';
import { TrainingLoadGlance } from '@/src/features/performance/TrainingLoadGlance';
import { pmcQueryKey } from '@/src/features/performance/usePmc';
import { MonthlyProgressGlance } from '@/src/features/stats/MonthlyProgressGlance';
import { monthlyComparisonQueryKey } from '@/src/features/stats/useMonthlyProgress';
import { WellnessSection } from '@/src/features/today/wellness-section';
import {
  confidenceFilledCount,
  formatDuration,
  heroToneForAction,
  mapRecommendationDetail,
  type HeroTone,
} from '@/src/features/today/mapTodayPayload';
import { RecentlyTeaser } from '@/src/features/today/recently-teaser';
import { CreateAdHocWorkoutSheet } from '@/src/features/today/CreateAdHocWorkoutSheet';
import { RecommendationDetailSheet } from '@/src/features/today/RecommendationDetailSheet';
import { RefineRecommendationSheet } from '@/src/features/today/RefineRecommendationSheet';
import {
  fetchAdHocGenerateStatus,
  type AdHocWorkoutRequest,
} from '@/src/features/today/adHocApi';
import { fetchRecommendationStatus, fetchTodayView } from '@/src/features/today/api';
import { syncTodayWidget } from '@/src/features/today/syncTodayWidget';
import type { ActivityRecommendationApi, TodayPlannedWorkout } from '@/src/features/today/types';
import {
  TODAY_QUERY_KEY,
  useAcceptRecommendation,
  useGenerateAdHocWorkout,
  useGenerateTodayRecommendation,
  useTodayQuery,
} from '@/src/features/today/useToday';
import { WeekGlanceStrip } from '@/src/features/today/week-glance-strip';
import { hapticError, hapticSuccess } from '@/src/lib/haptics';
import { humanizeWorkoutType } from '@/src/lib/humanizeWorkoutType';
import { APP_HREFS } from '@/src/linking/appHrefs';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

function openPlannedWorkout(id: string) {
  router.push(APP_HREFS.plannedDetail(id) as Href);
}

function openDiscussWithCoach() {
  router.push('/(app)/(tabs)/coach?discuss=1' as Href);
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
          className={`h-1.5 w-1.5 rounded-full ${n <= filled ? fillClass : 'bg-border-strong'}`}
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
      className={`${hero ? 'mt-6 rounded-2xl' : 'mt-4 rounded-xl'} border border-border bg-card/80 p-4`}
      onPress={() => openPlannedWorkout(planned.id)}
    >
      <View className="flex-row items-start gap-3">
        <SportIcon type={planned.type} size={hero ? 18 : 14} />
        <View className="min-w-0 flex-1">
          <Text className="text-xs uppercase tracking-wide text-text-muted">
            {hero ? 'Today’s planned workout' : 'Planned workout'}
          </Text>
          <Text className={`${hero ? 'mt-2 text-2xl' : 'mt-1 text-lg'} font-semibold text-text-primary`}>
            {planned.title}
          </Text>
          <Text className="mt-2 text-sm text-text-muted">
            {[
              humanizeWorkoutType(planned.type),
              formatDuration(planned.durationSec),
              planned.tss != null ? `TSS ${Math.round(planned.tss)}` : null,
              planned.structureSummary,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
          {hero && planned.description ? (
            <Text className="mt-3 text-base leading-6 text-text-body" numberOfLines={3}>
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
  const theme = useThemeColors();

  const { instanceUrl } = useAuth();
  const queryClient = useQueryClient();
  const tabBottomPad = useTabScrollPadding();
  const { data, isLoading, isError, error, refetch, isRefetching, dataUpdatedAt } = useTodayQuery();
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
  const dailyCheckinQuery = useDailyCheckinQuery();
  const nutritionEnabled = isNutritionTrackingEnabled(profileQuery.data);
  const nutritionQuery = useTodayNutritionQuery({ enabled: nutritionEnabled });
  const {
    isSuccess: integrationsReady,
    connectedCount,
  } = useIntegrationStatus();
  const { data: activation } = useActivationStatus();
  const showFinishSetup = Boolean(
    activation?.supportsActivation && activation.softActivated && !activation.fullyActivated
  );
  const showConnectDeviceCue =
    !showFinishSetup && integrationsReady && connectedCount === 0;
  const acceptMutation = useAcceptRecommendation();
  const plannedId = data?.plannedWorkout?.id;
  const completePlannedMutation = useCompletePlannedWorkout(plannedId);
  const skipPlannedMutation = useSkipPlannedWorkout(plannedId);

  const checkinCompleted = isDailyCheckinCompleted(dailyCheckinQuery.data);

  const [actionError, setActionError] = useState<string | null>(null);
  const [genState, setGenState] = useState<'idle' | 'generating' | 'error' | 'quota'>('idle');
  const [genError, setGenError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [refineOpen, setRefineOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [adhocOpen, setAdhocOpen] = useState(false);
  const [adhocState, setAdhocState] = useState<'idle' | 'generating' | 'error' | 'quota'>('idle');
  const [adhocError, setAdhocError] = useState<string | null>(null);
  const generateMutation = useGenerateTodayRecommendation();
  const adhocMutation = useGenerateAdHocWorkout();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const adhocPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusFailRef = useRef(0);
  const adhocFailRef = useRef(0);
  const generatingBusy = genState === 'generating' || generateMutation.isPending;
  const adhocBusy = adhocState === 'generating' || adhocMutation.isPending;
  const actionsBusy = generatingBusy || adhocBusy;

  const clearGeneratePoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const clearAdhocPoll = () => {
    if (adhocPollRef.current) {
      clearInterval(adhocPollRef.current);
      adhocPollRef.current = null;
    }
  };

  useEffect(
    () => () => {
      clearGeneratePoll();
      clearAdhocPoll();
    },
    []
  );

  const onGenerate = async (userFeedback?: string) => {
    if (genState === 'generating' || generateMutation.isPending || adhocBusy) return;
    clearGeneratePoll();
    statusFailRef.current = 0;
    setGenState('generating');
    setGenError(null);
    try {
      const trimmed = userFeedback?.trim();
      const res = await generateMutation.mutateAsync(trimmed || undefined);
      if (res.jobId) {
        let attempts = 0;
        const maxAttempts = 30;
        pollRef.current = setInterval(() => {
          void (async () => {
            attempts++;
            try {
              const status = await fetchRecommendationStatus(res.jobId);
              statusFailRef.current = 0;
              if (!status.isRunning) {
                clearGeneratePoll();
                setGenState('idle');
                void refetch();
              } else if (attempts >= maxAttempts) {
                clearGeneratePoll();
                hapticError();
                setGenState('error');
                setGenError('That took too long. Try again, or continue in Coach Watts.');
              }
            } catch {
              statusFailRef.current += 1;
              if (statusFailRef.current >= 3 || attempts >= maxAttempts) {
                clearGeneratePoll();
                hapticError();
                setGenState('error');
                setGenError('Couldn’t check generation status. Try again shortly.');
              }
            }
          })();
        }, 2500);
      } else {
        setGenState('idle');
        void refetch();
      }
    } catch (err: unknown) {
      hapticError();
      const status =
        typeof err === 'object' && err !== null && 'status' in err
          ? (err as { status?: number }).status
          : undefined;
      const message = err instanceof Error ? err.message : '';
      if (status === 429 || message.includes('Quota')) {
        setGenState('quota');
        setGenError(message || 'Quota exceeded for activity recommendation.');
      } else {
        setGenState('error');
        setGenError(friendlyError(err, 'Something went wrong. Try again, or continue in Coach Watts.'));
      }
    }
  };

  const { showCachedOffline, lastUpdatedLabel } = useOfflineCached({
    data,
    isError,
    dataUpdatedAt,
  });

  useEffect(() => {
    void syncTodayWidget(data);
  }, [data]);

  const onAccept = async () => {
    if (!data?.recommendationId || !data.canAccept || actionsBusy) return;
    setActionError(null);
    try {
      await acceptMutation.mutateAsync(data.recommendationId);
      hapticSuccess();
      setDetailOpen(false);
    } catch (err) {
      hapticError();
      setActionError(friendlyError(err, 'Accept failed'));
    }
  };

  const onRefineSubmit = (feedback: string) => {
    setRefineOpen(false);
    void onGenerate(feedback);
  };

  const onAdhocSubmit = async (payload: AdHocWorkoutRequest) => {
    if (adhocBusy || generatingBusy) return;
    setAdhocOpen(false);
    clearAdhocPoll();
    adhocFailRef.current = 0;
    setAdhocState('generating');
    setAdhocError(null);
    const priorPlannedId = data?.plannedWorkout?.id ?? null;
    try {
      const res = await adhocMutation.mutateAsync(payload);
      let attempts = 0;
      const maxAttempts = 30;
      adhocPollRef.current = setInterval(() => {
        void (async () => {
          attempts++;
          try {
            let stillRunning = true;
            if (res.jobId) {
              const status = await fetchAdHocGenerateStatus(res.jobId);
              stillRunning = status.isRunning;
            }
            adhocFailRef.current = 0;

            const latest = await fetchTodayView();
            void queryClient.setQueryData(TODAY_QUERY_KEY, latest);
            void upcomingQuery.refetch();

            const nextId = latest.plannedWorkout?.id ?? null;
            const appeared = Boolean(nextId && nextId !== priorPlannedId);

            if (!stillRunning || appeared) {
              clearAdhocPoll();
              setAdhocState('idle');
              void refetch();
              hapticSuccess();
              return;
            }

            if (attempts >= maxAttempts) {
              clearAdhocPoll();
              hapticError();
              setAdhocState('error');
              setAdhocError('That took too long. Try again, or continue in Coach Watts.');
            }
          } catch {
            adhocFailRef.current += 1;
            if (adhocFailRef.current >= 3 || attempts >= maxAttempts) {
              clearAdhocPoll();
              hapticError();
              setAdhocState('error');
              setAdhocError('Couldn’t check generation status. Try again shortly.');
            }
          }
        })();
      }, 2500);
    } catch (err: unknown) {
      hapticError();
      const status =
        typeof err === 'object' && err !== null && 'status' in err
          ? (err as { status?: number }).status
          : undefined;
      const message = err instanceof Error ? err.message : '';
      if (status === 429 || message.includes('Quota')) {
        setAdhocState('quota');
        setAdhocError(message || 'Quota exceeded for workout generation.');
      } else {
        setAdhocState('error');
        setAdhocError(friendlyError(err, 'Couldn’t start ad-hoc workout generation.'));
      }
    }
  };

  const openWeb = async () => {
    await openInstanceWeb(instanceUrl, '/');
  };

  const onRefresh = () => {
    void refetch();
    void refetchRecovery();
    void upcomingQuery.refetch();
    void recentQuery.refetch();
    void profileQuery.refetch();
    void dailyCheckinQuery.refetch();
    void queryClient.invalidateQueries({ queryKey: DASHBOARD_PROFILE_KEY });
    void queryClient.invalidateQueries({ queryKey: ['wellness'] });
    void queryClient.invalidateQueries({ queryKey: pmcQueryKey(90) });
    void queryClient.invalidateQueries({ queryKey: monthlyComparisonQueryKey('all') });
    void queryClient.invalidateQueries({ queryKey: ['stats', 'monthly-comparison'] });
    if (nutritionEnabled) void nutritionQuery.refetch();
  };

  if (isLoading && !data) {
    return (
      <SafeAreaView
        testID="today-screen"
        edges={{ top: true }}
        style={{ flex: 1, backgroundColor: theme.surface }}
      >
        <SkeletonScreen>
          <View className="flex-1 bg-surface px-6 pt-4">
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
      </SafeAreaView>
    );
  }

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const hasRecommendation = Boolean(data?.recommendationId);
  const planned = data?.plannedWorkout ?? null;
  const hardError = isError && !data;
  const plannedOnlyHero = !hardError && !hasRecommendation && Boolean(planned);
  const emptyNoDecision = !hardError && !hasRecommendation && !planned;
  const heroTone = heroToneForAction(data?.action);
  const heroToneClasses = HERO_TONE_CLASSES[heroTone];
  const recommendationDetail = mapRecommendationDetail(
    (data?.raw as ActivityRecommendationApi | null | undefined) ?? null
  );
  const showGeneratePanel =
    (!showFinishSetup && emptyNoDecision) || (hasRecommendation && genState !== 'idle');
  const moreActions: MoreAction[] = [
    { key: 'details', label: 'View details', onPress: () => setDetailOpen(true) },
    ...(planned
      ? [
          {
            key: 'workout',
            label: 'View workout details',
            onPress: () => openPlannedWorkout(planned.id),
          },
        ]
      : []),
    { key: 'coach', label: 'Discuss with Coach', onPress: openDiscussWithCoach },
    { key: 'adhoc', label: 'Generate ad-hoc workout', onPress: () => setAdhocOpen(true) },
  ];

  return (
    <SafeAreaView
      testID="today-screen"
      edges={{ top: true }}
      style={{ flex: 1, backgroundColor: theme.surface }}
    >
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="px-6 pt-4"
      contentContainerStyle={{ paddingBottom: tabBottomPad }}
      refreshControl={
        <RefreshControl
          refreshing={
            isRefetching ||
            recoveryRefetching ||
            upcomingQuery.isRefetching ||
            recentQuery.isRefetching ||
            profileQuery.isRefetching ||
            dailyCheckinQuery.isRefetching ||
            nutritionQuery.isRefetching
          }
          onRefresh={onRefresh}
          tintColor={Colors.brand}
        />
      }
    >
      <EnterSection order={0}>
        <Text className="text-sm text-text-muted">{dateLabel}</Text>
        <Text className="mt-1 text-2xl font-semibold text-text-primary">{greetingForNow()}</Text>
      </EnterSection>

      {showFinishSetup ? (
        <EnterSection order={0}>
          <View className="mt-4">
            <FinishSetupCard />
          </View>
        </EnterSection>
      ) : null}

      <OfflineBanner visible={showCachedOffline} lastUpdatedLabel={lastUpdatedLabel} />

      {hardError ? (
        <View className="mt-6 rounded-xl border border-danger/40 bg-tint-error p-4">
          <Text className="text-base text-red-300">
            {friendlyError(error, 'Could not load today')}
          </Text>
          <Pressable className="mt-3" hitSlop={8} onPress={() => void refetch()}>
            <Text className="font-semibold text-brand">Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <AnalysisReadyCard recent={recentQuery.data} />

      {!showFinishSetup ? <NutritionGlance /> : null}

      {!showFinishSetup && !checkinCompleted ? (
        <EnterSection order={1}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Do Quick Daily Coach Check-In"
            className="mt-6 flex-row items-center justify-between rounded-xl border border-brand bg-brand/5 p-4"
            onPress={() => router.push(APP_HREFS.dailyCheckin as Href)}
          >
            <View className="flex-1 pr-3">
              <Text className="text-xs uppercase tracking-wide text-brand font-semibold">
                Coach Check-In
              </Text>
              <Text className="mt-1 text-base font-semibold text-text-primary">
                Do Quick Daily Coach Check-In
              </Text>
              <Text className="mt-1 text-xs text-text-muted">
                Coach has questions prepared to adjust today’s recommendation.
              </Text>
            </View>
            <Text className="text-xl text-brand">→</Text>
          </Pressable>
        </EnterSection>
      ) : null}

      {showGeneratePanel ? (
        <AnalyzeReadinessPanel
          state={genState}
          errorMessage={genError}
          generatingPending={generateMutation.isPending}
          onAnalyze={() => void onGenerate()}
          onOpenWeb={() => void openWeb()}
          onDismissQuota={() => setGenState('idle')}
        />
      ) : null}

      {!showFinishSetup && emptyNoDecision && genState === 'idle' ? (
        <View className="mt-3">
          <Button
            variant="secondary"
            label="Generate Ad-Hoc Workout"
            onPress={() => setAdhocOpen(true)}
            disabled={actionsBusy}
          />
        </View>
      ) : null}

      {adhocState === 'generating' ? (
        <View className="mt-6 items-center rounded-2xl border border-border bg-card/80 p-5">
          <Text className="text-base font-semibold text-text-primary">Generating workout…</Text>
          <Text className="mt-1 text-center text-sm leading-5 text-text-muted">
            AI is designing your session for today
          </Text>
        </View>
      ) : null}

      {adhocState === 'quota' ? (
        <View className="mt-6 rounded-2xl border border-amber-900/40 bg-amber-950/25 p-5">
          <Text className="text-xs uppercase tracking-wide text-modify">Plan limit</Text>
          <Text className="mt-2 text-lg font-semibold text-text-primary">
            Workout generation limit reached
          </Text>
          <Text className="mt-2 text-sm leading-5 text-text-body">
            {adhocError || 'Update your plan in Coach Watts to generate more workouts.'}
          </Text>
          <View className="mt-5 gap-3">
            <Button label="Open Coach Watts" onPress={() => void openWeb()} />
            <Button label="Back" variant="secondary" onPress={() => setAdhocState('idle')} />
          </View>
        </View>
      ) : null}

      {adhocState === 'error' ? (
        <View className="mt-6 rounded-2xl border border-danger/40 bg-tint-error p-5">
          <Text className="text-lg font-semibold text-text-primary">Couldn’t generate workout</Text>
          <Text className="mt-2 text-sm leading-5 text-red-300">
            {adhocError || 'Something went wrong. Try again, or continue in Coach Watts.'}
          </Text>
          <View className="mt-5 gap-3">
            <Button label="Try again" onPress={() => setAdhocOpen(true)} />
            <Button label="Open Coach Watts" variant="secondary" onPress={() => void openWeb()} />
            <Button label="Dismiss" variant="secondary" onPress={() => setAdhocState('idle')} />
          </View>
        </View>
      ) : null}

      {hasRecommendation ? (
        <EnterSection order={1}>
          <View className="mt-6">
            <View className="flex-row items-center">
              <Text className="text-xs uppercase tracking-wide text-text-muted">Today’s call</Text>
              {data!.confidence != null ? (
                <ConfidenceDots confidence={data!.confidence} fillClass={heroToneClasses.fill} />
              ) : null}
            </View>
            <View
              className={`mt-3 rounded-2xl border border-border border-l-4 ${heroToneClasses.accent} ${heroToneClasses.tint} p-5`}
            >
              <Text className={`text-2xl font-semibold ${heroToneClasses.kicker}`}>
                {data!.actionLabel}
              </Text>
              {data!.rationale ? (
                <Text className="mt-3 text-base leading-6 text-text-body">{data!.rationale}</Text>
              ) : null}
              {data!.modificationSummary && !data!.userAccepted ? (
                <Text className="mt-3 text-sm text-text-muted">
                  Proposed change: {data!.modificationSummary}
                </Text>
              ) : null}
            </View>
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

      {actionError ? <Text className="mt-4 text-sm text-red-400">{actionError}</Text> : null}

      {hasRecommendation ? (
        <EnterSection order={3}>
          <View className="mt-4 gap-3">
            {data?.userAccepted ? (
              planned ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Accepted — view workout"
                  className="flex-row items-center justify-center gap-2 rounded-xl border border-border-strong bg-card/80 px-4 py-3.5 active:opacity-70"
                  onPress={() => openPlannedWorkout(planned.id)}
                >
                  <Text className="text-base font-semibold text-green-400">✓</Text>
                  <Text className="text-base font-semibold text-green-400">
                    Accepted — view workout
                  </Text>
                </Pressable>
              ) : (
                <View className="flex-row items-center justify-center gap-2 rounded-xl border border-border-strong bg-card/80 px-4 py-3.5">
                  <Text className="text-base font-semibold text-green-400">✓</Text>
                  <Text className="text-base font-semibold text-green-400">
                    {data.action === 'rest' ? 'Rest day accepted' : 'Accepted'}
                  </Text>
                </View>
              )
            ) : data?.canAccept ? (
              <Button
                label={data.action === 'rest' ? 'Accept rest day' : 'Accept recommendation'}
                onPress={() => void onAccept()}
                loading={acceptMutation.isPending}
                disabled={actionsBusy}
              />
            ) : null}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button
                  variant="secondary"
                  label="Refine"
                  onPress={() => setRefineOpen(true)}
                  disabled={actionsBusy}
                />
              </View>
              <View className="flex-1">
                <Button
                  variant="secondary"
                  label="More"
                  onPress={() => setMoreOpen(true)}
                  disabled={actionsBusy}
                />
              </View>
            </View>
          </View>
        </EnterSection>
      ) : null}

      {plannedOnlyHero && planned ? (
        <EnterSection order={2}>
          <View className="mt-4 gap-3">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button
                  label="Complete"
                  onPress={() => {
                    Alert.alert('Mark complete?', 'This marks today’s planned session as completed.', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Complete',
                        onPress: () => {
                          setActionError(null);
                          completePlannedMutation.mutate(undefined, {
                            onError: (err) =>
                              setActionError(friendlyError(err, 'Failed to complete workout')),
                            onSuccess: () => hapticSuccess(),
                          });
                        },
                      },
                    ]);
                  }}
                  loading={completePlannedMutation.isPending}
                  disabled={
                    actionsBusy ||
                    completePlannedMutation.isPending ||
                    skipPlannedMutation.isPending
                  }
                />
              </View>
              <View className="flex-1">
                <Button
                  variant="secondary"
                  label="Skip"
                  onPress={() => {
                    Alert.alert('Skip this workout?', 'This marks today’s planned session as skipped.', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Skip',
                        style: 'destructive',
                        onPress: () => {
                          setActionError(null);
                          skipPlannedMutation.mutate(undefined, {
                            onError: (err) =>
                              setActionError(friendlyError(err, 'Failed to skip workout')),
                            onSuccess: () => hapticSuccess(),
                          });
                        },
                      },
                    ]);
                  }}
                  loading={skipPlannedMutation.isPending}
                  disabled={
                    actionsBusy ||
                    completePlannedMutation.isPending ||
                    skipPlannedMutation.isPending
                  }
                />
              </View>
            </View>
            <Button
              variant="secondary"
              label="View workout details"
              onPress={() => openPlannedWorkout(planned.id)}
              disabled={actionsBusy}
            />
            <Button
              variant="secondary"
              label="Generate Ad-Hoc Workout"
              onPress={() => setAdhocOpen(true)}
              disabled={actionsBusy}
            />
          </View>
        </EnterSection>
      ) : null}

      {showConnectDeviceCue ? (
        <EnterSection order={4}>
          <View className="mt-4">
            <Button
              variant="secondary"
              label="Connect a device"
              onPress={() => router.push(APP_HREFS.settingsConnectedApps as Href)}
            />
          </View>
        </EnterSection>
      ) : null}

      {!showFinishSetup ? (
        <>
          <EnterSection order={5}>
            <WellnessSection
              recoveryItems={activeRecovery}
              recoveryError={recoveryError}
              recoveryErrorMessage={friendlyError(recoveryErr, 'Couldn’t load recovery events')}
              onRetryRecovery={() => void refetchRecovery()}
            />
          </EnterSection>

          {/* No entering animation here: these glances swap fixed-height skeletons for
              async-loaded content, and a layout animation on the shared wrapper leaves
              stale measurements (sections overlapping — issue 058). */}
          <View>
            <TrainingLoadGlance />
            <MonthlyProgressGlance />
            <WeekGlanceStrip recent={recentQuery.data} planned={upcomingQuery.data} />
            <UpcomingEventsGlance />
            <ComingUpStrip excludePlannedId={planned?.id} />
            <RecentlyTeaser />
          </View>
        </>
      ) : null}
    </ScrollView>

    <RecommendationDetailSheet
      visible={detailOpen}
      detail={recommendationDetail}
      recoveryItems={activeRecovery}
      accepting={acceptMutation.isPending}
      onClose={() => setDetailOpen(false)}
      onAccept={() => void onAccept()}
    />
    <RefineRecommendationSheet
      visible={refineOpen}
      submitting={generatingBusy}
      onClose={() => setRefineOpen(false)}
      onSubmit={onRefineSubmit}
    />
    <CreateAdHocWorkoutSheet
      visible={adhocOpen}
      submitting={adhocBusy}
      onClose={() => setAdhocOpen(false)}
      onSubmit={(payload) => void onAdhocSubmit(payload)}
    />
    <MoreActionsSheet visible={moreOpen} actions={moreActions} onClose={() => setMoreOpen(false)} />
    </SafeAreaView>
  );
}
