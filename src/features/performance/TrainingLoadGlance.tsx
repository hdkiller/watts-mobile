import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { formStatusTextClass, roundLoad } from './mapPmc';
import { TrainingLoadSheet } from './TrainingLoadSheet';
import { usePmcQuery } from './usePmc';

export function TrainingLoadGlance() {
  const query = usePmcQuery(90);
  const [open, setOpen] = useState(false);

  if (query.isLoading && !query.data) {
    return (
      <View className="mt-6 h-24 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/40" />
    );
  }

  if (query.isError || !query.data) {
    return null;
  }

  const { summary } = query.data;
  const statusClass = formStatusTextClass(summary.formColor);

  return (
    <View className="mt-6">
      <Text className="text-xs uppercase tracking-wide text-ink-muted">
        Training Load & Form
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open training load and form"
        onPress={() => setOpen(true)}
        className="mt-3 rounded-xl border border-zinc-800/80 bg-zinc-900 px-4 py-3.5 active:opacity-90"
      >
        <View className="flex-row items-end justify-between gap-3">
          <LoadCell label="Fitness" value={roundLoad(summary.currentCTL)} unit="CTL" />
          <LoadCell label="Fatigue" value={roundLoad(summary.currentATL)} unit="ATL" />
          <LoadCell label="Form" value={roundLoad(summary.currentTSB)} unit="TSB" />
        </View>
        <Text className={`mt-3 text-xs font-semibold ${statusClass}`}>
          {summary.formStatus}
          {summary.formDescription ? ` · ${summary.formDescription}` : ''}
        </Text>
      </Pressable>

      <TrainingLoadSheet visible={open} onClose={() => setOpen(false)} />
    </View>
  );
}

function LoadCell({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <View className="flex-1">
      <Text className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">
        {label}
      </Text>
      <View className="mt-1 flex-row items-baseline gap-1">
        <Text className="text-xl font-black text-white">{value}</Text>
        <Text className="text-[10px] font-semibold text-zinc-500">{unit}</Text>
      </View>
    </View>
  );
}
