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
      // key forces a remount when swapping to content: reusing the native view keeps
      // the skeleton's fixed height and the loaded card overflows into the next section.
      <View key="skeleton" className="mt-6 h-20 animate-pulse rounded-xl border border-border bg-card/40" />
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
        : 'text-text-muted';

  return (
    <View key="content" className="mt-6">
      <Text className="text-xs uppercase tracking-wide text-text-muted">Monthly Progress</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open monthly progress"
        onPress={() => setOpen(true)}
        className="mt-3 rounded-xl border border-border/80 bg-card px-4 py-3.5 active:opacity-90"
      >
        <View className="flex-row items-end justify-between gap-3">
          <View className="flex-1">
            <Text className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
              {query.data.currentMonthName} TSS
            </Text>
            <Text className="mt-1 text-xl font-black text-text-primary">
              {summary.formattedCurrent}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
              vs {query.data.lastMonthName}
            </Text>
            <Text className={`mt-1 text-lg font-black ${deltaClass}`}>
              {formatDeltaPercent(summary.percentDiff)}
            </Text>
          </View>
        </View>
        <Text className="mt-2 text-[11px] text-text-muted">
          Month-to-date through day {query.data.todayDay} · tap for chart & filters
        </Text>
      </Pressable>

      <MonthlyProgressSheet visible={open} onClose={() => setOpen(false)} />
    </View>
  );
}
