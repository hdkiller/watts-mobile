import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useAuth } from '@/src/auth/AuthContext';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { UpdateAccessCard } from '@/src/features/account/UpdateAccessCard';

import {
  formatTsb,
  formStatusTextClass,
  mapPmcTrends,
  performanceWebPath,
  roundLoad,
} from './mapPmc';
import { TrainingLoadSheet } from './TrainingLoadSheet';
import { usePmcQuery } from './usePmc';

function TrendBadge({
  value,
  lowerIsBetter = false,
}: {
  value: number | null;
  lowerIsBetter?: boolean;
}) {
  if (value == null || value === 0) return null;

  const isGood = lowerIsBetter ? value < 0 : value > 0;
  const sign = value > 0 ? '↑' : '↓';
  const percent = Math.abs(value);
  const bgClass = isGood
    ? 'bg-emerald-500/10 border border-emerald-500/20'
    : 'bg-red-500/10 border border-red-500/20';
  const textClass = isGood ? 'text-emerald-400' : 'text-red-400';

  return (
    <View className={`rounded-full px-1.5 py-0.5 ${bgClass}`}>
      <Text className={`text-[9px] font-bold ${textClass}`}>
        {sign} {percent}%
      </Text>
    </View>
  );
}

export function TrainingLoadGlance() {
  const { instanceUrl } = useAuth();
  const query = usePmcQuery(90);
  const [open, setOpen] = useState(false);

  if (query.isLoading && !query.data) {
    return (
      // key forces a remount when swapping to content — see MonthlyProgressGlance.
      <View key="skeleton" className="mt-6 h-24 animate-pulse rounded-xl border border-border bg-card/40" />
    );
  }

  const status = (query.error as { status?: number } | null)?.status;
  const forbidden = query.isError && (status === 401 || status === 403);

  if (forbidden) {
    return (
      <UpdateAccessCard
        key="forbidden"
        sectionLabel="Training Load & Form"
        onOpenWeb={() => void openInstanceWeb(instanceUrl, performanceWebPath())}
      />
    );
  }

  if (query.isError || !query.data) {
    return null;
  }

  const { summary } = query.data;
  const trends = mapPmcTrends(query.data);
  const statusClass = formStatusTextClass(summary.formColor);

  return (
    <View key="content" className="mt-6">
      <Text className="text-xs uppercase tracking-wide text-text-muted">
        Training Load & Form
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open training load and form"
        onPress={() => setOpen(true)}
        className="mt-3 rounded-xl border border-border/80 bg-card px-4 py-3.5 active:opacity-90"
      >
        <View className="flex-row items-end justify-between gap-3">
          <LoadCell
            label="Fitness"
            sublabel="CTL"
            value={String(roundLoad(summary.currentCTL))}
            trend={trends.ctl}
          />
          <LoadCell
            label="Fatigue"
            sublabel="ATL"
            value={String(roundLoad(summary.currentATL))}
            trend={trends.atl}
            lowerIsBetter
          />
          <LoadCell
            label="Form"
            sublabel="TSB"
            value={formatTsb(summary.currentTSB)}
            trend={trends.tsb}
          />
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
  sublabel,
  value,
  trend,
  lowerIsBetter = false,
}: {
  label: string;
  sublabel: string;
  value: string;
  trend: number | null;
  lowerIsBetter?: boolean;
}) {
  return (
    <View className="flex-1">
      <Text className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
        {label}
      </Text>
      <Text className="text-[9px] font-normal lowercase text-text-muted">({sublabel})</Text>
      <View className="mt-1 flex-row flex-wrap items-center gap-1.5">
        <Text className="text-xl font-black text-text-primary">{value}</Text>
        <TrendBadge value={trend} lowerIsBetter={lowerIsBetter} />
      </View>
    </View>
  );
}
