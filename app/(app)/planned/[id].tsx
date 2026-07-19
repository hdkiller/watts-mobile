import { Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ScrollView, Text, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { Button } from '@/src/components/Button';
import { HeroStatTiles, type HeroStat } from '@/src/components/HeroStatTiles';
import { formatLastUpdated, OfflineBanner } from '@/src/components/OfflineBanner';
import { DetailSkeleton } from '@/src/components/Skeleton';
import { SportIcon } from '@/src/components/SportIcon';
import { StructureProfile } from '@/src/features/activity/charts/StructureProfile';
import {
  absoluteInstanceUrl,
  formatActivityDate,
  formatDuration,
  plannedWorkoutWebPath,
  zoneIndexFromBandName,
} from '@/src/features/activity/mapActivity';
import { usePlannedDetailQuery } from '@/src/features/activity/useActivity';
import { zoneColor } from '@/src/theme/colors';

function plannedHeroStats(data: {
  durationSec: number | null;
  tss: number | null;
  workIntensityLabel: string | null;
}): HeroStat[] {
  const stats: HeroStat[] = [];
  const duration = formatDuration(data.durationSec);
  if (duration) stats.push({ label: 'Duration', value: duration });
  if (data.tss != null && Number.isFinite(data.tss)) {
    stats.push({ label: 'TSS', value: String(Math.round(data.tss)) });
  }
  if (data.workIntensityLabel) {
    const ifValue = data.workIntensityLabel.replace(/^IF\s+/i, '').trim();
    stats.push({ label: 'IF', value: ifValue || data.workIntensityLabel });
  }
  return stats.slice(0, 3);
}

export default function PlannedWorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { instanceUrl } = useAuth();
  const { data, isLoading, isError, error, dataUpdatedAt } = usePlannedDetailQuery(id);
  const showCachedOffline = Boolean(isError && data);

  const openWeb = async () => {
    if (!instanceUrl) return;
    const path = id ? plannedWorkoutWebPath(id) : '/';
    await WebBrowser.openBrowserAsync(absoluteInstanceUrl(instanceUrl, path));
  };

  const statusLine = data
    ? [data.completionLabel, data.syncLabel].filter(Boolean).join(' · ')
    : null;

  return (
    <>
      <Stack.Screen options={{ title: 'Workout', headerShown: true }} />
      {isLoading && !data ? (
        <DetailSkeleton />
      ) : isError && !data ? (
        <View className="flex-1 bg-surface-dark px-6 pt-6">
          <Text className="text-red-400">
            {friendlyError(error, 'Failed to load workout')}
          </Text>
        </View>
      ) : data ? (
        <ScrollView className="flex-1 bg-surface-dark" contentContainerClassName="px-6 pb-10 pt-4">
          <OfflineBanner
            visible={showCachedOffline}
            lastUpdatedLabel={formatLastUpdated(dataUpdatedAt)}
          />
          <View className="flex-row items-center gap-3">
            <SportIcon type={data.type} size={18} />
            <Text className="min-w-0 flex-1 text-2xl font-semibold text-white">{data.title}</Text>
          </View>
          <Text className="mt-2 text-sm text-ink-muted">
            {[formatActivityDate(data.date), data.type].filter(Boolean).join(' · ')}
          </Text>
          <HeroStatTiles stats={plannedHeroStats(data)} />
          {statusLine ? (
            <Text className="mt-3 text-sm text-ink-muted">{statusLine}</Text>
          ) : null}

          {data.coachInstructions ? (
            <View className="mt-6">
              <Text className="text-xs uppercase tracking-wide text-ink-muted">Coach cues</Text>
              <Text className="mt-2 text-base leading-6 text-zinc-200">{data.coachInstructions}</Text>
            </View>
          ) : null}

          {data.structureSteps.length > 0 ? (
            <View className="mt-6">
              <Text className="text-xs uppercase tracking-wide text-ink-muted">Structure</Text>
              <StructureProfile steps={data.structureSteps} />
              {data.structureSteps.map((step, index) => {
                const meta = [formatDuration(step.durationSec), step.intensityLabel]
                  .filter(Boolean)
                  .join(' · ');
                return (
                  <View
                    key={`${step.name}-${index}`}
                    className="mt-3 border-b border-zinc-800 pb-3"
                  >
                    <Text className="text-base text-zinc-100">{step.name}</Text>
                    {meta ? <Text className="mt-1 text-sm text-ink-muted">{meta}</Text> : null}
                  </View>
                );
              })}
            </View>
          ) : null}

          {data.zoneSummary ? (
            <View className="mt-6">
              <Text className="text-xs uppercase tracking-wide text-ink-muted">
                Zones · {data.zoneSummary.channelLabel}
              </Text>
              {data.zoneSummary.bands.map((band, index) => {
                const color = zoneColor(zoneIndexFromBandName(band.name, index));
                return (
                  <View
                    key={`${band.name}-${band.rangeLabel}`}
                    className="mt-3 flex-row items-center justify-between border-b border-zinc-800 pb-3"
                  >
                    <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
                      <View
                        className="h-3 w-3 rounded-sm"
                        style={{ backgroundColor: color }}
                        accessibilityLabel={`${band.name} color`}
                      />
                      <Text className="text-base text-zinc-100">{band.name}</Text>
                    </View>
                    <Text className="text-sm text-ink-muted">{band.rangeLabel}</Text>
                  </View>
                );
              })}
            </View>
          ) : null}

          {data.description ? (
            <Text className="mt-6 text-base leading-6 text-zinc-200">{data.description}</Text>
          ) : data.structureSteps.length === 0 && !data.coachInstructions ? (
            <Text className="mt-6 text-sm text-ink-muted">
              No structure summary available. Open the web app for full planned-workout detail.
            </Text>
          ) : null}

          <Button
            variant="secondary"
            className="mt-8"
            label="Open in Coach Watts"
            onPress={() => void openWeb()}
          />
        </ScrollView>
      ) : null}
    </>
  );
}
