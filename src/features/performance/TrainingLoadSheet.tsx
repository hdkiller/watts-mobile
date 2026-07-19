import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { LineSeriesChart } from '@/src/features/activity/charts/LineSeriesChart';
import { absoluteInstanceUrl } from '@/src/features/profile/mapProfile';
import { Colors } from '@/src/theme/colors';

import {
  formStatusTextClass,
  mapPmcChartSeries,
  performanceWebPath,
  roundLoad,
} from './mapPmc';
import type { PmcPeriodDays } from './types';
import { usePmcQuery } from './usePmc';

const PERIODS: PmcPeriodDays[] = [30, 60, 90];

export function TrainingLoadSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { instanceUrl } = useAuth();
  const [days, setDays] = useState<PmcPeriodDays>(90);
  const query = usePmcQuery(days, visible);

  const openWeb = async () => {
    if (!instanceUrl) return;
    await WebBrowser.openBrowserAsync(
      absoluteInstanceUrl(instanceUrl, performanceWebPath())
    );
  };

  const chart = query.data ? mapPmcChartSeries(query.data.data) : null;
  const summary = query.data?.summary;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-surface-dark">
        <View className="flex-row items-start justify-between border-b border-zinc-800 px-5 py-4">
          <View className="min-w-0 flex-1 pr-3">
            <Text className="text-xl font-semibold text-white">Training Load & Form</Text>
            <Text className="mt-1 text-sm text-ink-muted">
              Fitness (CTL), Fatigue (ATL), and Form (TSB) over the selected period.
            </Text>
          </View>
          <Pressable onPress={onClose} className="active:opacity-70" hitSlop={8}>
            <Text className="text-sm font-semibold text-brand">Done</Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" contentContainerClassName="px-5 pb-10 pt-5">
          <View className="flex-row gap-2">
            {PERIODS.map((period) => {
              const selected = period === days;
              return (
                <Pressable
                  key={period}
                  onPress={() => setDays(period)}
                  className={`rounded-full px-3 py-1.5 ${
                    selected ? 'bg-brand' : 'border border-zinc-700 bg-zinc-900'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      selected ? 'text-zinc-950' : 'text-zinc-300'
                    }`}
                  >
                    {period}d
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {query.isLoading && !query.data ? (
            <View className="mt-16 items-center">
              <ActivityIndicator color={Colors.brand} />
            </View>
          ) : query.isError ? (
            <View className="mt-8">
              <Text className="text-red-400">
                {friendlyError(query.error, 'Failed to load training load')}
              </Text>
              <Text className="mt-2 text-sm text-ink-muted">
                If this persists after a recent update, sign out and sign in again so the app can
                request performance access.
              </Text>
              <Pressable
                className="mt-4 items-center rounded-xl border border-zinc-700 py-3.5 active:opacity-80"
                onPress={() => void query.refetch()}
              >
                <Text className="text-base font-semibold text-white">Retry</Text>
              </Pressable>
            </View>
          ) : summary ? (
            <>
              <View className="mt-5 flex-row flex-wrap justify-between gap-y-3">
                <SummaryCard label="Fitness" value={roundLoad(summary.currentCTL)} unit="CTL" />
                <SummaryCard label="Fatigue" value={roundLoad(summary.currentATL)} unit="ATL" />
                <SummaryCard label="Form" value={roundLoad(summary.currentTSB)} unit="TSB" />
                {summary.avgTSS != null ? (
                  <SummaryCard label="Avg TSS" value={roundLoad(summary.avgTSS)} unit="" />
                ) : null}
              </View>

              <Text className={`mt-4 text-sm font-semibold ${formStatusTextClass(summary.formColor)}`}>
                {summary.formStatus}
              </Text>
              {summary.formDescription ? (
                <Text className="mt-1 text-sm text-ink-muted">{summary.formDescription}</Text>
              ) : null}

              {chart && chart.series.length > 0 ? (
                <View className="mt-6">
                  <LineSeriesChart
                    series={chart.series}
                    durationSec={chart.durationSec}
                    height={180}
                  />
                </View>
              ) : (
                <Text className="mt-6 text-sm text-ink-muted">
                  Not enough activity TSS history to chart yet.
                </Text>
              )}

              <Pressable
                className="mt-8 items-center rounded-xl border border-zinc-700 py-3.5 active:opacity-80"
                onPress={() => void openWeb()}
              >
                <Text className="text-base font-semibold text-white">
                  Open web Performance
                </Text>
              </Pressable>
            </>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

function SummaryCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <View className="w-[48%] rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3">
      <Text className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">
        {label}
      </Text>
      <View className="mt-2 flex-row items-baseline gap-1">
        <Text className="text-xl font-black text-white">{value}</Text>
        {unit ? <Text className="text-[10px] font-semibold text-zinc-500">{unit}</Text> : null}
      </View>
    </View>
  );
}
