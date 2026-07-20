import { Stack, useLocalSearchParams, router, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { Button } from '@/src/components/Button';
import { HeroStatTiles, type HeroStat } from '@/src/components/HeroStatTiles';
import { OfflineBanner } from '@/src/components/OfflineBanner';
import { ScoreCell } from '@/src/components/ScoreChip';
import { DetailSkeleton, Skeleton } from '@/src/components/Skeleton';
import { SportIcon } from '@/src/components/SportIcon';
import { ActivityCharts } from '@/src/features/activity/ActivityCharts';
import { ActivityMap } from '@/src/features/activity/ActivityMap';
import {
  formatActivityDate,
  formatDuration,
  workoutWebPath,
} from '@/src/features/activity/mapActivity';
import { resolveActivityRouteCoordinates } from '@/src/features/activity/route';
import type {
  ActivityAnalysis,
  ActivitySummary,
  AnalysisPhase,
  PlanAdherenceGlance,
} from '@/src/features/activity/types';
import {
  useActivityStreamsQuery,
  useActivitySummaryQuery,
  useRequestWorkoutAnalysis,
} from '@/src/features/activity/useActivity';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { openActivitySessionDiscuss } from '@/src/features/coach/openSessionDiscuss';
import { markAnalysisSeen } from '@/src/features/today/analysisReadyStore';
import { useOfflineCached } from '@/src/hooks/useOfflineCached';
import { hapticError, hapticSuccess } from '@/src/lib/haptics';
import { humanizeWorkoutType } from '@/src/lib/humanizeWorkoutType';

function activityHeroStats(data: ActivitySummary): HeroStat[] {
  const stats: HeroStat[] = [];
  const duration = formatDuration(data.durationSec);
  if (duration) stats.push({ label: 'Duration', value: duration });
  if (data.tss != null && Number.isFinite(data.tss)) {
    stats.push({ label: 'TSS', value: String(Math.round(data.tss)) });
  } else if (data.loadLabel) {
    stats.push({ label: 'Load', value: data.loadLabel });
  }
  const intensity = data.metrics.find((metric) => metric.key === 'intensity');
  if (intensity) {
    const ifValue = intensity.value.replace(/^IF\s+/i, '').trim();
    stats.push({ label: 'IF', value: ifValue || intensity.value });
  }
  return stats.slice(0, 3);
}

function looksLikeImportNotes(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.startsWith('--')) return true;
  const lines = trimmed.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return false;
  const keyed = lines.filter((l) => /^[A-Za-z][\w\s/]*:\s*\S/.test(l.trim())).length;
  return keyed >= Math.ceil(lines.length * 0.5);
}

function AnalysisGlance({
  analysis,
  analyzing,
  analyzeError,
  onAnalyze,
}: {
  analysis: ActivityAnalysis;
  analyzing: boolean;
  analyzeError: string | null;
  onAnalyze: () => void;
}) {
  const waiting = analyzing || analysis.phase === 'analyzing';
  const ctaLabel =
    analysis.phase === 'ready' || analysis.hasContent ? 'Regenerate analysis' : 'Analyze workout';
  const showCta = !waiting;

  return (
    <View className="mt-6">
      <Text className="text-xs uppercase tracking-wide text-text-muted">AI analysis</Text>
      <Text
        className={`mt-2 text-sm ${
          analysis.phase === 'failed' || analysis.phase === 'quota'
            ? 'text-red-400'
            : 'text-text-muted'
        }`}
      >
        {waiting ? 'Analyzing…' : analysis.statusLabel}
      </Text>

      {waiting ? (
        <View className="mt-3" accessibilityLabel="Analysis in progress">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
          <Skeleton className="mt-2 h-4 w-3/5" />
        </View>
      ) : null}

      {!waiting && analysis.scores.length > 0 ? (
        <View className="mt-3 flex-row flex-wrap">
          {analysis.scores.map((score) => (
            <ScoreCell key={score.key} label={score.label} score={score.value} />
          ))}
        </View>
      ) : null}

      {!waiting && analysis.executiveSummary ? (
        <Text className="mt-3 text-base leading-6 text-text-body">{analysis.executiveSummary}</Text>
      ) : null}

      {!waiting && analysis.markdownFallback && !analysis.executiveSummary ? (
        <Text className="mt-3 text-base leading-6 text-text-body">{analysis.markdownFallback}</Text>
      ) : null}

      {!waiting && !analysis.hasContent && analysis.phase === 'not_started' ? (
        <Text className="mt-3 text-sm text-text-muted">
          Run analysis to get scores and coaching takeaways for this workout.
        </Text>
      ) : null}

      {!waiting && analysis.phase === 'quota' ? (
        <Text className="mt-3 text-sm text-red-400">
          Analysis quota exceeded. Open Coach Watts to review plan limits.
        </Text>
      ) : null}

      {analyzeError ? <Text className="mt-3 text-sm text-red-400">{analyzeError}</Text> : null}

      {showCta ? (
        <Button className="mt-4" label={ctaLabel} onPress={onAnalyze} loading={analyzing} />
      ) : null}
    </View>
  );
}

function FullAnalysisDisclosure({ analysis }: { analysis: ActivityAnalysis }) {
  const [open, setOpen] = useState(false);
  const hasDetails =
    analysis.sections.length > 0 ||
    analysis.recommendations.length > 0 ||
    analysis.strengths.length > 0 ||
    analysis.weaknesses.length > 0;
  if (!hasDetails || analysis.phase === 'analyzing') return null;

  return (
    <View className="mt-6">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        className="self-start active:opacity-80"
        hitSlop={8}
        onPress={() => setOpen((v) => !v)}
      >
        <Text className="text-sm font-semibold text-brand">
          {open ? 'Hide full analysis' : 'Full analysis'}
        </Text>
      </Pressable>
      {open ? (
        <View className="mt-2">
          {analysis.sections.map((section) => (
            <View key={section.title} className="mt-4 border-b border-border pb-3">
              <Text className="text-base font-medium text-text-body">{section.title}</Text>
              {section.statusLabel ? (
                <Text className="mt-1 text-xs text-text-muted">{section.statusLabel}</Text>
              ) : null}
              {section.points.map((point) => (
                <Text key={point} className="mt-1.5 text-sm leading-5 text-text-body">
                  • {point}
                </Text>
              ))}
            </View>
          ))}

          {analysis.recommendations.length > 0 ? (
            <View className="mt-4">
              <Text className="text-xs uppercase tracking-wide text-text-muted">Recommendations</Text>
              {analysis.recommendations.map((rec) => (
                <View key={`${rec.title}-${rec.description.slice(0, 24)}`} className="mt-3">
                  <Text className="text-base text-text-body">{rec.title}</Text>
                  {rec.description ? (
                    <Text className="mt-1 text-sm leading-5 text-text-body">{rec.description}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {analysis.strengths.length > 0 ? (
            <View className="mt-4">
              <Text className="text-xs uppercase tracking-wide text-text-muted">Strengths</Text>
              {analysis.strengths.map((item) => (
                <Text key={item} className="mt-1.5 text-sm leading-5 text-text-body">
                  • {item}
                </Text>
              ))}
            </View>
          ) : null}

          {analysis.weaknesses.length > 0 ? (
            <View className="mt-4">
              <Text className="text-xs uppercase tracking-wide text-text-muted">Focus areas</Text>
              {analysis.weaknesses.map((item) => (
                <Text key={item} className="mt-1.5 text-sm leading-5 text-text-body">
                  • {item}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function PlanAdherenceBlock({ adherence }: { adherence: PlanAdherenceGlance }) {
  const planId = adherence.plannedWorkoutId;
  return (
    <View className="mt-6">
      <Text className="text-xs uppercase tracking-wide text-text-muted">Plan adherence</Text>
      {adherence.phase === 'pending' || adherence.phase === 'failed' ? (
        <Text
          className={`mt-2 text-sm ${
            adherence.phase === 'failed' ? 'text-red-400' : 'text-text-muted'
          }`}
        >
          {adherence.statusLabel}
        </Text>
      ) : null}
      {adherence.overallScore != null ? (
        <Text className="mt-2 text-2xl font-semibold text-text-primary">
          {adherence.overallScore}%
        </Text>
      ) : null}
      {adherence.summary ? (
        <Text className="mt-2 text-base leading-6 text-text-body">{adherence.summary}</Text>
      ) : null}
      {planId ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View plan"
          className="mt-3 self-start active:opacity-80"
          hitSlop={8}
          onPress={() => router.push(`/(app)/(tabs)/today/planned/${planId}` as Href)}
        >
          <Text className="text-sm font-semibold text-brand">View plan →</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function DescriptionBlock({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  if (looksLikeImportNotes(text)) {
    return (
      <View className="mt-6">
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          className="flex-row items-center justify-between active:opacity-80"
          hitSlop={8}
          onPress={() => setOpen((v) => !v)}
        >
          <Text className="text-xs uppercase tracking-wide text-text-muted">Import notes</Text>
          <Text className="text-xs font-semibold text-brand">{open ? 'Hide' : 'Show'}</Text>
        </Pressable>
        {open ? (
          <Text className="mt-2 text-sm leading-5 text-text-muted">{text.trim()}</Text>
        ) : null}
      </View>
    );
  }
  return <Text className="mt-6 text-base leading-6 text-text-body">{text}</Text>;
}

export default function ActivitySummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { instanceUrl } = useAuth();
  const { data, isLoading, isError, error, dataUpdatedAt } = useActivitySummaryQuery(id);
  const streams = useActivityStreamsQuery(id);
  const analyzeMutation = useRequestWorkoutAnalysis(id);
  const { showCachedOffline, lastUpdatedLabel } = useOfflineCached({
    data,
    isError,
    dataUpdatedAt,
  });
  const prevAnalysisPhase = useRef<AnalysisPhase | undefined>(undefined);

  const coordinates = resolveActivityRouteCoordinates(
    streams.data?.latlng,
    data?.summaryPolyline
  );

  useEffect(() => {
    const phase = data?.analysis.phase;
    if (
      prevAnalysisPhase.current === 'analyzing' &&
      (phase === 'ready' || phase === 'failed' || phase === 'quota')
    ) {
      if (phase === 'ready') hapticSuccess();
      else hapticError();
    }
    prevAnalysisPhase.current = phase;
  }, [data?.analysis.phase]);

  useEffect(() => {
    if (!id || data?.analysis.phase !== 'ready') return;
    void markAnalysisSeen(id);
  }, [id, data?.analysis.phase]);

  const openWeb = async () => {
    const path = id ? workoutWebPath(id) : '/';
    await openInstanceWeb(instanceUrl, path);
  };

  const onAnalyze = () => {
    analyzeMutation.mutate(undefined, {
      onError: () => hapticError(),
    });
  };

  const analyzeError = analyzeMutation.error
    ? friendlyError(analyzeMutation.error, 'Failed to start analysis')
    : null;

  return (
    <>
      <Stack.Screen options={{ title: 'Activity', headerShown: true }} />
      {isLoading && !data ? (
        <DetailSkeleton />
      ) : isError && !data ? (
        <View className="flex-1 bg-surface px-6 pt-6">
          <Text className="text-red-400">
            {friendlyError(error, 'Failed to load activity')}
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
          <HeroStatTiles stats={activityHeroStats(data)} />
          <Text
            className={`mt-3 text-sm ${
              data.status.kind === 'failed' ? 'text-red-400' : 'text-text-muted'
            }`}
          >
            {data.status.label}
          </Text>

          {data.metrics.length > 0 ? (
            <View className="mt-6">
              <Text className="text-xs uppercase tracking-wide text-text-muted">Summary</Text>
              <View className="mt-3 flex-row flex-wrap">
                {data.metrics.map((metric) => (
                  <View key={metric.key} className="mb-3 w-1/2 pr-3">
                    <Text className="text-xs text-text-muted">{metric.label}</Text>
                    <Text className="mt-0.5 text-base text-text-body">{metric.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {data.planAdherence ? <PlanAdherenceBlock adherence={data.planAdherence} /> : null}

          {data.exercises.length > 0 ? (
            <View className="mt-6">
              <Text className="text-xs uppercase tracking-wide text-text-muted">Exercises</Text>
              {data.exercises.map((exercise, index) => (
                <View
                  key={`${exercise.name}-${index}`}
                  className="mt-3 border-b border-border pb-3"
                >
                  <Text className="text-base text-text-body">{exercise.name}</Text>
                  {exercise.prescription ? (
                    <Text className="mt-1 text-sm text-text-muted">{exercise.prescription}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          <AnalysisGlance
            analysis={data.analysis}
            analyzing={analyzeMutation.isPending}
            analyzeError={analyzeError}
            onAnalyze={onAnalyze}
          />

          {coordinates.length > 0 ? <ActivityMap coordinates={coordinates} /> : null}

          {id ? <ActivityCharts workoutId={id} /> : null}

          <FullAnalysisDisclosure analysis={data.analysis} />

          {data.description ? <DescriptionBlock text={data.description} /> : null}

          <Button
            className="mt-8"
            label="Discuss with Coach"
            onPress={() => openActivitySessionDiscuss(data)}
          />
          <Button
            variant="secondary"
            className="mt-3"
            label="Open in Coach Watts"
            onPress={() => void openWeb()}
          />
        </ScrollView>
      ) : null}
    </>
  );
}
