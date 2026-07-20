import { router, type Href } from 'expo-router';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import { useRecentWellness } from '@/src/features/profile/useRecentWellness';
import { WellnessOverviewSheet } from '@/src/features/wellness/WellnessOverviewSheet';
import { useThemeColors } from '@/src/theme/useThemeColors';

function localTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function staleCaption(
  hasCurrentDayWellness: boolean,
  latestWellnessDate: string | null
): string | null {
  if (hasCurrentDayWellness || !latestWellnessDate) return null;
  const day = latestWellnessDate.slice(0, 10);
  const today = localTodayKey();
  if (day === today) return null;

  const latest = new Date(`${day}T12:00:00`);
  const now = new Date(`${today}T12:00:00`);
  const diffDays = Math.round((now.getTime() - latest.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return null;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
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
  value: string | number;
  unit: string;
  trend: number | null;
  lowerIsBetter?: boolean;
  sfIcon: SFSymbol;
  emojiIcon: string;
}) {
  const theme = useThemeColors();
  return (
    <View className="flex-1 rounded-xl border border-border/80 bg-card px-3 py-3.5 shadow-sm">
      <View className="flex-row items-center gap-1.5">
        {Platform.OS === 'ios' ? (
          <SymbolView name={sfIcon} size={13} tintColor={theme.textMuted} />
        ) : (
          <Text style={{ fontSize: 12 }}>{emojiIcon}</Text>
        )}
        <Text className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
          {label}
        </Text>
      </View>
      <View className="mt-3 flex-row items-baseline gap-0.5">
        <Text className="text-xl font-black text-text-primary">{value}</Text>
        <Text className="text-[10px] font-semibold text-text-muted"> {unit}</Text>
      </View>
      <View className="mt-2 h-4 flex-row items-center">
        <TrendBadge value={trend} lowerIsBetter={lowerIsBetter} />
      </View>
    </View>
  );
}

function goToWellnessCheckIn() {
  router.push('/(app)/(tabs)/log?section=wellness' as Href);
}

export function RecentWellnessGlance() {
  const { profile, sleepTrend, hrvTrend, rhrTrend, isLoading } = useRecentWellness();
  const [overviewOpen, setOverviewOpen] = useState(false);

  if (isLoading && !profile) {
    return (
      <View className="mt-6 flex-row gap-2.5">
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            className="h-24 flex-1 animate-pulse rounded-xl border border-border bg-card/40"
          />
        ))}
      </View>
    );
  }

  const sleepVal =
    profile?.recentSleep != null ? profile.recentSleep.toFixed(1) : null;
  const hrvVal = profile?.recentHRV ?? null;
  const rhrVal = profile?.restingHr ?? null;
  const hasAnyMetric = sleepVal != null || hrvVal != null || rhrVal != null;
  const caption = profile
    ? staleCaption(profile.hasCurrentDayWellness, profile.latestWellnessDate)
    : null;
  const overviewDate = profile?.latestWellnessDate
    ? profile.latestWellnessDate.slice(0, 10)
    : localTodayKey();

  return (
    <View className="mt-6">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs uppercase tracking-wide text-text-muted">
          Recent Wellness
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Check in"
          onPress={goToWellnessCheckIn}
          hitSlop={8}
        >
          <Text className="text-xs font-semibold text-brand">Check in</Text>
        </Pressable>
      </View>

      {!hasAnyMetric ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="No recent wellness. Check in"
          onPress={goToWellnessCheckIn}
          className="mt-3 rounded-xl border border-border bg-card/60 px-4 py-4 active:opacity-90"
        >
          <Text className="text-sm text-text-body">No recent wellness · Check in</Text>
        </Pressable>
      ) : (
        <>
          {caption ? (
            <Text className="mt-1 text-[11px] text-text-muted">{caption}</Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open wellness overview"
            onPress={() => setOverviewOpen(true)}
            className="mt-3 flex-row gap-2.5 active:opacity-90"
          >
            {sleepVal != null ? (
              <WellnessTile
                label="Sleep"
                value={sleepVal}
                unit="hrs"
                trend={sleepTrend}
                sfIcon="moon.stars"
                emojiIcon="🌙"
              />
            ) : null}
            {hrvVal != null ? (
              <WellnessTile
                label="HRV"
                value={hrvVal}
                unit="ms"
                trend={hrvTrend}
                sfIcon="waveform.path.ecg"
                emojiIcon="💓"
              />
            ) : null}
            {rhrVal != null ? (
              <WellnessTile
                label="Resting HR"
                value={rhrVal}
                unit="bpm"
                trend={rhrTrend}
                sfIcon="heart.fill"
                emojiIcon="❤️"
                lowerIsBetter
              />
            ) : null}
          </Pressable>
        </>
      )}

      <WellnessOverviewSheet
        visible={overviewOpen}
        date={overviewDate}
        onClose={() => setOverviewOpen(false)}
      />
    </View>
  );
}
