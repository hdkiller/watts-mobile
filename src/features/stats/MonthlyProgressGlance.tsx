import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { formatDeltaPercent, summarizeMonthlyProgress } from './mapMonthlyComparison';
import { MonthlyProgressSheet } from './MonthlyProgressSheet';
import { useMonthlyComparisonQuery } from './useMonthlyProgress';

export function MonthlyProgressGlance() {
  const query = useMonthlyComparisonQuery('all');
  const [open, setOpen] = useState(false);

  if (query.isLoading && !query.data) {
    return (
      <View className="mt-6 h-20 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/40" />
    );
  }

  if (query.isError || !query.data) {
    return null;
  }

  const summary = summarizeMonthlyProgress(query.data, 'tss');
  const deltaClass =
    summary.percentDiff > 0
      ? 'text-emerald-400'
      : summary.percentDiff < 0
        ? 'text-amber-300'
        : 'text-zinc-400';

  return (
    <View className="mt-6">
      <Text className="text-xs uppercase tracking-wide text-ink-muted">Monthly Progress</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open monthly progress"
        onPress={() => setOpen(true)}
        className="mt-3 rounded-xl border border-zinc-800/80 bg-zinc-900 px-4 py-3.5 active:opacity-90"
      >
        <View className="flex-row items-end justify-between gap-3">
          <View className="flex-1">
            <Text className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">
              {query.data.currentMonthName} TSS
            </Text>
            <Text className="mt-1 text-xl font-black text-white">
              {summary.formattedCurrent}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">
              vs {query.data.lastMonthName}
            </Text>
            <Text className={`mt-1 text-lg font-black ${deltaClass}`}>
              {formatDeltaPercent(summary.percentDiff)}
            </Text>
          </View>
        </View>
        <Text className="mt-2 text-[11px] text-ink-muted">
          Month-to-date through day {query.data.todayDay} · tap for chart & filters
        </Text>
      </Pressable>

      <MonthlyProgressSheet visible={open} onClose={() => setOpen(false)} />
    </View>
  );
}
