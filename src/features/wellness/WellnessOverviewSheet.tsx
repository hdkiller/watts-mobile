import { router, type Href } from 'expo-router';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { Colors } from '@/src/theme/colors';

import { wellnessDayWebPath } from './mapWellnessOverview';
import type { WellnessBarSeries, WellnessOverviewMetric } from './types';
import { useWellnessOverviewQuery } from './useWellnessOverview';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';

function formatOverviewDate(dateKey: string): string {
  try {
    const d = new Date(`${dateKey}T12:00:00`);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric' });
  } catch {
    return dateKey;
  }
}

function TrendText({
  value,
  lowerIsBetter }: {
  value: number | null;
  lowerIsBetter: boolean;
}) {
  if (value == null || value === 0) return null;
  const isGood = lowerIsBetter ? value < 0 : value > 0;
  const sign = value > 0 ? '+' : '';
  return (
    <Text className={`mt-1 text-[11px] font-semibold ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
      {sign}
      {value}%
    </Text>
  );
}

function MetricTile({ metric }: { metric: WellnessOverviewMetric }) {
  return (
    <View className="w-[48%] rounded-xl border border-border bg-card px-3 py-3">
      <Text className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
        {metric.label}
      </Text>
      <View className="mt-2 flex-row items-baseline gap-1">
        <Text className="text-xl font-black text-text-primary">{metric.value}</Text>
        {metric.unit ? (
          <Text className="text-[10px] font-semibold text-text-muted">{metric.unit}</Text>
        ) : null}
      </View>
      <TrendText value={metric.trendPercent} lowerIsBetter={metric.lowerIsBetter} />
    </View>
  );
}

function TrendBars({ series }: { series: WellnessBarSeries }) {
  const values = series.points.map((p) => p.value).filter((v): v is number => v != null);
  const max = values.length ? Math.max(...values) : 0;
  if (max <= 0) return null;

  return (
    <View className="mt-4">
      <Text className="text-xs font-semibold text-text-body">
        {series.label} · 7 days
      </Text>
      <View className="mt-2 h-16 flex-row items-end gap-1.5">
        {series.points.map((point) => {
          const height =
            point.value != null && max > 0 ? Math.max(4, (point.value / max) * 56) : 4;
          return (
            <View key={point.date} className="flex-1 items-center justify-end">
              <View
                className="w-full rounded-t-sm bg-brand/70"
                style={{ height, opacity: point.value == null ? 0.2 : 1 }}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function WellnessOverviewSheet({
  visible,
  date,
  onClose }: {
  visible: boolean;
  date: string | null;
  onClose: () => void;
}) {
  const { instanceUrl } = useAuth();
  const query = useWellnessOverviewQuery(date, visible);

  const openWeb = async () => {
    if (!date) return;
    await openInstanceWeb(instanceUrl, wellnessDayWebPath(date));
  };

  const onCheckIn = () => {
    onClose();
    router.push('/(app)/(tabs)/log' as Href);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-surface">
        <View className="flex-row items-start justify-between border-b border-border px-5 py-4">
          <View className="min-w-0 flex-1 pr-3">
            <Text className="text-xl font-semibold text-text-primary">Wellness Overview</Text>
            {date ? (
              <Text className="mt-1 text-sm text-text-muted">{formatOverviewDate(date)}</Text>
            ) : null}
            {query.data?.isStale ? (
              <Text className="mt-1 text-xs font-semibold text-amber-400">
                Not from today
              </Text>
            ) : null}
          </View>
          <Pressable onPress={onClose} className="active:opacity-70" hitSlop={8}>
            <Text className="text-sm font-semibold text-brand">Done</Text>
          </Pressable>
        </View>

        {query.isLoading && !query.data ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={Colors.brand} />
          </View>
        ) : query.isError ? (
          <View className="flex-1 px-5 pt-8">
            <Text className="text-red-400">
              {friendlyError(query.error, 'Failed to load wellness overview')}
            </Text>
            <Pressable
              className="mt-4 items-center rounded-xl border border-border-strong py-3.5 active:opacity-80"
              onPress={() => void query.refetch()}
            >
              <Text className="text-base font-semibold text-text-primary">Retry</Text>
            </Pressable>
          </View>
        ) : !query.data ? (
          <View className="flex-1 px-5 pt-8">
            <Text className="text-base text-text-muted">No wellness data for this day.</Text>
            <Pressable
              className="mt-6 items-center rounded-xl bg-brand py-3.5 active:opacity-80"
              onPress={onCheckIn}
            >
              <Text className="text-base font-semibold text-ink">Check in</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-5 pb-10 pt-5"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row flex-wrap justify-between gap-y-3">
              {query.data.metrics.map((m) => (
                <MetricTile key={m.key} metric={m} />
              ))}
            </View>

            {query.data.barSeries.length > 0 ? (
              <View className="mt-8">
                <Text className="text-xs uppercase tracking-wide text-text-muted">
                  7-day trends
                </Text>
                {query.data.barSeries.map((series) => (
                  <TrendBars key={series.key} series={series} />
                ))}
              </View>
            ) : null}

            {query.data.coachNote ? (
              <View className="mt-8 rounded-xl border border-border bg-card/80 px-4 py-4">
                <Text className="text-xs uppercase tracking-wide text-text-muted">
                  Coach note
                </Text>
                <Text className="mt-2 text-sm leading-5 text-text-body">
                  {query.data.coachNote}
                </Text>
              </View>
            ) : null}

            <Pressable
              className="mt-8 items-center rounded-xl bg-brand py-3.5 active:opacity-80"
              onPress={onCheckIn}
            >
              <Text className="text-base font-semibold text-ink">Check in</Text>
            </Pressable>
            <Pressable
              className="mt-3 items-center rounded-xl border border-border-strong py-3.5 active:opacity-80"
              onPress={() => void openWeb()}
            >
              <Text className="text-base font-semibold text-text-primary">Open web</Text>
            </Pressable>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}
