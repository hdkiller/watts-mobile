import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { Button } from '@/src/components/Button';
import { HeroStatTiles, type HeroStat } from '@/src/components/HeroStatTiles';
import { OfflineBanner } from '@/src/components/OfflineBanner';
import { DetailSkeleton } from '@/src/components/Skeleton';
import { SportIcon } from '@/src/components/SportIcon';
import { StructureProfile } from '@/src/features/activity/charts/StructureProfile';
import {
  formatActivityDate,
  formatDuration,
  plannedWorkoutWebPath,
  zoneIndexFromBandName,
  stepIntensity } from '@/src/features/activity/mapActivity';
import { usePlannedDetailQuery } from '@/src/features/activity/useActivity';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { useOfflineCached } from '@/src/hooks/useOfflineCached';
import { humanizeWorkoutType } from '@/src/lib/humanizeWorkoutType';
import { zoneColor, Colors } from '@/src/theme/colors';

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
  const { showCachedOffline, lastUpdatedLabel } = useOfflineCached({
    data,
    isError,
    dataUpdatedAt,
  });
  const [zonesExpanded, setZonesExpanded] = useState(false);

  const openWeb = async () => {
    const path = id ? plannedWorkoutWebPath(id) : '/';
    await openInstanceWeb(instanceUrl, path);
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
        <View className="flex-1 bg-surface px-6 pt-6">
          <Text className="text-red-400">
            {friendlyError(error, 'Failed to load workout')}
          </Text>
        </View>
      ) : data ? (
        <ScrollView className="flex-1 bg-surface" contentContainerClassName="px-6 pb-10 pt-4">
          <OfflineBanner
            visible={showCachedOffline}
            lastUpdatedLabel={lastUpdatedLabel}
          />
          <View className="flex-row items-center gap-3">
            <SportIcon type={data.type} size={18} />
            <Text className="min-w-0 flex-1 text-2xl font-semibold text-text-primary">{data.title}</Text>
          </View>
          <Text className="mt-2 text-sm text-text-muted">
            {[formatActivityDate(data.date), humanizeWorkoutType(data.type)]
              .filter(Boolean)
              .join(' · ')}
          </Text>
          <HeroStatTiles stats={plannedHeroStats(data)} />
          {statusLine ? (
            <Text className="mt-3 text-sm text-text-muted">{statusLine}</Text>
          ) : null}

          {data.coachInstructions ? (
            <View className="mt-6">
              <Text className="text-xs uppercase tracking-wide text-text-muted">Coach cues</Text>
              <Text className="mt-2 text-base leading-6 text-text-body">{data.coachInstructions}</Text>
            </View>
          ) : null}

          {data.structureSteps.length > 0 ? (
            <View className="mt-6">
              <Text className="text-xs uppercase tracking-wide text-text-muted">
                {data.structureIsStrength ? 'Exercises' : 'Structure'}
              </Text>
              {!data.structureIsStrength ? (
                <StructureProfile steps={data.structureSteps} />
              ) : null}
              {data.structureSteps.map((step, index) => {
                const meta = [formatDuration(step.durationSec), step.intensityLabel]
                  .filter(Boolean)
                  .join(' · ');
                const intensity = stepIntensity(step);
                const color =
                  intensity.zoneIndex !== undefined
                    ? zoneColor(intensity.zoneIndex)
                    : Colors.zoneNeutral;
                const isSectionCue = Boolean(step.isSection);
                return (
                  <View
                    key={`${step.name}-${index}`}
                    className="mt-3 flex-row items-stretch gap-3 border-b border-border pb-3"
                  >
                    {!isSectionCue ? (
                      <View
                        className="w-1 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ) : null}
                    <View className="flex-1">
                      <Text
                        className={
                          isSectionCue
                            ? 'text-xs uppercase tracking-wide text-text-muted'
                            : 'text-base text-text-body'
                        }
                      >
                        {step.name}
                      </Text>
                      {meta ? <Text className="mt-1 text-sm text-text-muted">{meta}</Text> : null}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}

          {data.zoneSummary ? (
            <View className="mt-6">
              {data.structureSteps.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: zonesExpanded }}
                  accessibilityLabel={`Zones · ${data.zoneSummary.channelLabel}`}
                  onPress={() => setZonesExpanded((v) => !v)}
                  className="flex-row items-center justify-between py-1 active:opacity-80"
                  hitSlop={8}
                >
                  <Text className="text-xs uppercase tracking-wide text-text-muted">
                    Zones · {data.zoneSummary.channelLabel}
                  </Text>
                  <Text className="text-xs font-semibold text-brand">
                    {zonesExpanded ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              ) : (
                <Text className="text-xs uppercase tracking-wide text-text-muted">
                  Zones · {data.zoneSummary.channelLabel}
                </Text>
              )}
              {(data.structureSteps.length === 0 || zonesExpanded) &&
                data.zoneSummary.bands.map((band, index) => {
                  const color = zoneColor(zoneIndexFromBandName(band.name, index));
                  return (
                    <View
                      key={`${band.name}-${band.rangeLabel}`}
                      className="mt-3 flex-row items-center justify-between border-b border-border pb-3"
                    >
                      <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
                        <View
                          className="h-3 w-3 rounded-sm"
                          style={{ backgroundColor: color }}
                          accessibilityLabel={`${band.name} color`}
                        />
                        <Text className="text-base text-text-body">{band.name}</Text>
                      </View>
                      <Text className="text-sm text-text-muted">{band.rangeLabel}</Text>
                    </View>
                  );
                })}
            </View>
          ) : null}

          {data.description ? (
            <Text className="mt-6 text-base leading-6 text-text-body">{data.description}</Text>
          ) : data.structureSteps.length === 0 && !data.coachInstructions ? (
            <Text className="mt-6 text-sm text-text-muted">
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
