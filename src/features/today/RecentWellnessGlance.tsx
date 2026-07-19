import { router, type Href } from 'expo-router';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import { useRecentWellness } from '@/src/features/profile/useRecentWellness';
import { WellnessOverviewSheet } from '@/src/features/wellness/WellnessOverviewSheet';

function localTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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
    <View className={`rounded-full px-2 py-0.5 ${bgClass}`}>
      <Text className={`text-[9px] font-bold ${textClass}`}>
        {sign} {percent}%
      </Text>
    </View>
  );
}

function WellnessTile({
  label,
  value,
  unit,
  trend,
  lowerIsBetter = false,
  sfIcon,
  emojiIcon,
}: {
  label: string;
  value: string | number | null;
  unit: string;
  trend: number | null;
  lowerIsBetter?: boolean;
  sfIcon: SFSymbol;
  emojiIcon: string;
}) {
  const displayValue = value != null ? `${value}` : 'N/A';
  const displayUnit = value != null ? ` ${unit}` : '';

  return (
    <View className="flex-1 rounded-xl border border-zinc-800/80 bg-zinc-900 px-3 py-3.5 shadow-sm">
      <View className="flex-row items-center gap-1.5">
        {Platform.OS === 'ios' ? (
          <SymbolView name={sfIcon} size={13} tintColor="#a1a1aa" />
        ) : (
          <Text style={{ fontSize: 12 }}>{emojiIcon}</Text>
        )}
        <Text className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">
          {label}
        </Text>
      </View>
      <View className="mt-3 flex-row items-baseline gap-0.5">
        <Text className="text-xl font-black text-white">{displayValue}</Text>
        <Text className="text-[10px] font-semibold text-zinc-500">{displayUnit}</Text>
      </View>
      <View className="mt-2 h-4 flex-row items-center">
        <TrendBadge value={trend} lowerIsBetter={lowerIsBetter} />
      </View>
    </View>
  );
}

export function RecentWellnessGlance() {
  const { profile, sleepTrend, hrvTrend, rhrTrend, isLoading, isError } =
    useRecentWellness();
  const [overviewOpen, setOverviewOpen] = useState(false);

  if (isLoading && !profile) {
    return (
      <View className="mt-6 flex-row gap-2.5">
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            className="h-24 flex-1 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/40"
          />
        ))}
      </View>
    );
  }

  if (isError || !profile) {
    return null;
  }

  const sleepVal =
    profile.recentSleep != null ? profile.recentSleep.toFixed(1) : null;
  const overviewDate = profile.latestWellnessDate
    ? profile.latestWellnessDate.slice(0, 10)
    : localTodayKey();

  return (
    <View className="mt-6">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs uppercase tracking-wide text-ink-muted">
          Recent Wellness
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Check in"
          onPress={() => router.push('/(app)/(tabs)/log' as Href)}
          hitSlop={8}
        >
          <Text className="text-xs font-semibold text-brand">Check in</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open wellness overview"
        onPress={() => setOverviewOpen(true)}
        className="mt-3 flex-row gap-2.5 active:opacity-90"
      >
        <WellnessTile
          label="Sleep"
          value={sleepVal}
          unit="hrs"
          trend={sleepTrend}
          sfIcon="moon.stars"
          emojiIcon="🌙"
        />
        <WellnessTile
          label="HRV"
          value={profile.recentHRV}
          unit="ms"
          trend={hrvTrend}
          sfIcon="waveform.path.ecg"
          emojiIcon="💓"
        />
        <WellnessTile
          label="Resting HR"
          value={profile.restingHr}
          unit="bpm"
          trend={rhrTrend}
          sfIcon="heart.fill"
          emojiIcon="❤️"
          lowerIsBetter
        />
      </Pressable>

      <WellnessOverviewSheet
        visible={overviewOpen}
        date={overviewDate}
        onClose={() => setOverviewOpen(false)}
      />
    </View>
  );
}
