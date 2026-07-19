import { router, type Href } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { useActiveRecoveryQuery } from '@/src/features/recovery/useRecovery';
import type { RecoveryContextItem } from '@/src/features/recovery/types';
import { formatDuration } from '@/src/features/today/mapTodayPayload';
import { useAcceptRecommendation, useTodayQuery } from '@/src/features/today/useToday';
import { Colors } from '@/src/theme/colors';

function openPlannedWorkout(id: string) {
  router.push(`/(app)/planned/${id}` as Href);
}

function openRecoveryEvent(item?: RecoveryContextItem) {
  if (item) {
    router.push(`/(app)/recovery-event?id=${encodeURIComponent(item.sourceRecordId)}` as Href);
    return;
  }
  router.push('/(app)/recovery-event' as Href);
}

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function TodayScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useTodayQuery();
  const {
    data: activeRecovery,
    refetch: refetchRecovery,
    isRefetching: recoveryRefetching,
  } = useActiveRecoveryQuery();
  const acceptMutation = useAcceptRecommendation();
  const [actionError, setActionError] = useState<string | null>(null);

  const onAccept = async () => {
    if (!data?.recommendationId || !data.canAccept) return;
    setActionError(null);
    try {
      await acceptMutation.mutateAsync(data.recommendationId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Accept failed');
    }
  };

  const onRefresh = () => {
    void refetch();
    void refetchRecovery();
  };

  if (isLoading && !data) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark">
        <ActivityIndicator color={Colors.brand} size="large" />
      </View>
    );
  }

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const hasRecoveryMetrics =
    data?.recovery.sleepLabel || data?.recovery.hrvLabel || data?.recovery.feelLabel;
  const hasActiveContext = Boolean(activeRecovery?.length);

  return (
    <ScrollView
      className="flex-1 bg-surface-dark"
      contentContainerClassName="px-6 pb-10 pt-4"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching || recoveryRefetching}
          onRefresh={onRefresh}
          tintColor={Colors.brand}
        />
      }
    >
      <Text className="text-sm text-ink-muted">{dateLabel}</Text>
      <Text className="mt-1 text-2xl font-semibold text-white">{greetingForNow()}</Text>

      {isError ? (
        <View className="mt-6 rounded-xl border border-red-900/50 bg-red-950/40 p-4">
          <Text className="text-base text-red-300">
            {error instanceof Error ? error.message : 'Could not load today'}
          </Text>
          <Pressable className="mt-3" onPress={() => void refetch()}>
            <Text className="font-semibold text-brand">Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {!isError && data && !data.recommendationId ? (
        <View className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
          <Text className="text-lg font-semibold text-white">No recommendation yet</Text>
          <Text className="mt-2 text-sm leading-5 text-ink-muted">
            Waiting for today’s AI recommendation (or sync). Pull to refresh, or open the web app to
            generate guidance.
          </Text>
        </View>
      ) : null}

      {data?.recommendationId ? (
        <View className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <Text className="text-xs uppercase tracking-wide text-ink-muted">Today’s call</Text>
          <Text className="mt-2 text-2xl font-semibold text-brand">{data.actionLabel}</Text>
          {data.rationale ? (
            <Text className="mt-3 text-base leading-6 text-zinc-200">{data.rationale}</Text>
          ) : null}
          {data.confidence != null ? (
            <Text className="mt-3 text-xs text-ink-muted">
              Confidence {Math.round(data.confidence * (data.confidence <= 1 ? 100 : 1))}%
            </Text>
          ) : null}
          {data.userAccepted ? (
            <Text className="mt-3 text-sm font-semibold text-green-400">Accepted</Text>
          ) : null}
          {data.modificationSummary && !data.userAccepted ? (
            <Text className="mt-3 text-sm text-zinc-400">
              Proposed change: {data.modificationSummary}
            </Text>
          ) : null}
        </View>
      ) : null}

      {data?.plannedWorkout ? (
        <Pressable
          className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 active:opacity-80"
          onPress={() => openPlannedWorkout(data.plannedWorkout!.id)}
        >
          <Text className="text-xs uppercase tracking-wide text-ink-muted">Planned workout</Text>
          <Text className="mt-1 text-lg font-semibold text-white">{data.plannedWorkout.title}</Text>
          <Text className="mt-2 text-sm text-ink-muted">
            {[
              data.plannedWorkout.type,
              formatDuration(data.plannedWorkout.durationSec),
              data.plannedWorkout.tss != null ? `TSS ${Math.round(data.plannedWorkout.tss)}` : null,
              data.plannedWorkout.structureSummary,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </Pressable>
      ) : null}

      {hasRecoveryMetrics ? (
        <View className="mt-4 flex-row gap-2">
          {data?.recovery.sleepLabel ? (
            <View className="flex-1 rounded-lg border border-zinc-800 px-3 py-2">
              <Text className="text-[10px] uppercase text-ink-muted">Sleep</Text>
              <Text className="text-sm text-white">{data.recovery.sleepLabel}</Text>
            </View>
          ) : null}
          {data?.recovery.hrvLabel ? (
            <View className="flex-1 rounded-lg border border-zinc-800 px-3 py-2">
              <Text className="text-[10px] uppercase text-ink-muted">HRV</Text>
              <Text className="text-sm text-white">{data.recovery.hrvLabel}</Text>
            </View>
          ) : null}
          {data?.recovery.feelLabel ? (
            <View className="flex-1 rounded-lg border border-zinc-800 px-3 py-2">
              <Text className="text-[10px] uppercase text-ink-muted">Feel</Text>
              <Text className="text-sm text-white">{data.recovery.feelLabel}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {hasActiveContext ? (
        <View className="mt-3 flex-row flex-wrap">
          {activeRecovery!.map((item) => (
            <Pressable
              key={item.id}
              className="mr-2 mt-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 active:opacity-80"
              onPress={() => openRecoveryEvent(item)}
            >
              <Text className="text-xs font-semibold text-zinc-200">
                {item.label}
                {item.severity != null ? ` · ${item.severity}/10` : ''}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {actionError ? <Text className="mt-4 text-sm text-red-400">{actionError}</Text> : null}

      {data?.recommendationId ? (
        <View className="mt-6 gap-3">
          {data.canAccept ? (
            <Pressable
              className="items-center rounded-xl bg-brand-action py-3.5 active:opacity-80"
              onPress={() => void onAccept()}
              disabled={acceptMutation.isPending}
            >
              {acceptMutation.isPending ? (
                <ActivityIndicator color="#09090b" />
              ) : (
                <Text className="text-base font-semibold text-ink">
                  {data.action === 'rest' ? 'Accept rest day' : 'Accept recommendation'}
                </Text>
              )}
            </Pressable>
          ) : null}

          {data.plannedWorkout ? (
            <Pressable
              className="items-center rounded-xl border border-zinc-700 py-3.5"
              onPress={() => openPlannedWorkout(data.plannedWorkout!.id)}
            >
              <Text className="text-base font-semibold text-white">View workout details</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <Pressable
        className="mt-5 self-start py-1 active:opacity-70"
        onPress={() => openRecoveryEvent()}
      >
        <Text className="text-sm font-semibold text-brand">Log recovery event</Text>
      </Pressable>
    </ScrollView>
  );
}
