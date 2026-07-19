import { Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ScrollView, Text, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { Button } from '@/src/components/Button';
import { HeroStatTiles, type HeroStat } from '@/src/components/HeroStatTiles';
import { DetailSkeleton, Skeleton } from '@/src/components/Skeleton';
import { SportIcon } from '@/src/components/SportIcon';
import { ActivityCharts } from '@/src/features/activity/ActivityCharts';
import {
  absoluteInstanceUrl,
  formatActivityDate,
  formatDuration,
  workoutWebPath,
} from '@/src/features/activity/mapActivity';
import type { ActivityAnalysis, ActivitySummary } from '@/src/features/activity/types';
import {
  useActivitySummaryQuery,
  useRequestWorkoutAnalysis,
} from '@/src/features/activity/useActivity';

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

function AnalysisBlock({
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
      <Text className="text-xs uppercase tracking-wide text-ink-muted">AI analysis</Text>
      <Text
        className={`mt-2 text-sm ${
          analysis.phase === 'failed' || analysis.phase === 'quota'
            ? 'text-red-400'
            : 'text-ink-muted'
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
            <View key={score.key} className="mb-2 mr-3 min-w-[64px]">
              <Text className="text-xs text-ink-muted">{score.label}</Text>
              <Text className="mt-0.5 text-lg font-semibold text-white">{score.value}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {!waiting && analysis.executiveSummary ? (
        <Text className="mt-3 text-base leading-6 text-zinc-200">{analysis.executiveSummary}</Text>
      ) : null}

      {!waiting && analysis.markdownFallback && !analysis.executiveSummary ? (
        <Text className="mt-3 text-base leading-6 text-zinc-200">{analysis.markdownFallback}</Text>
      ) : null}

      {!waiting
        ? analysis.sections.map((section) => (
            <View key={section.title} className="mt-4 border-b border-zinc-800 pb-3">
              <Text className="text-base font-medium text-zinc-100">{section.title}</Text>
              {section.statusLabel ? (
                <Text className="mt-1 text-xs text-ink-muted">{section.statusLabel}</Text>
              ) : null}
              {section.points.map((point) => (
                <Text key={point} className="mt-1.5 text-sm leading-5 text-zinc-300">
                  • {point}
                </Text>
              ))}
            </View>
          ))
        : null}

      {!waiting && analysis.recommendations.length > 0 ? (
        <View className="mt-4">
          <Text className="text-xs uppercase tracking-wide text-ink-muted">Recommendations</Text>
          {analysis.recommendations.map((rec) => (
            <View key={`${rec.title}-${rec.description.slice(0, 24)}`} className="mt-3">
              <Text className="text-base text-zinc-100">{rec.title}</Text>
              {rec.description ? (
                <Text className="mt-1 text-sm leading-5 text-zinc-300">{rec.description}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {!waiting && analysis.strengths.length > 0 ? (
        <View className="mt-4">
          <Text className="text-xs uppercase tracking-wide text-ink-muted">Strengths</Text>
          {analysis.strengths.map((item) => (
            <Text key={item} className="mt-1.5 text-sm leading-5 text-zinc-300">
              • {item}
            </Text>
          ))}
        </View>
      ) : null}

      {!waiting && analysis.weaknesses.length > 0 ? (
        <View className="mt-4">
          <Text className="text-xs uppercase tracking-wide text-ink-muted">Focus areas</Text>
          {analysis.weaknesses.map((item) => (
            <Text key={item} className="mt-1.5 text-sm leading-5 text-zinc-300">
              • {item}
            </Text>
          ))}
        </View>
      ) : null}

      {!waiting && !analysis.hasContent && analysis.phase === 'not_started' ? (
        <Text className="mt-3 text-sm text-ink-muted">
          Run analysis to get scores and coaching takeaways for this workout.
        </Text>
      ) : null}

      {!waiting && analysis.phase === 'quota' ? (
        <Text className="mt-3 text-sm text-red-400">
          Analysis quota exceeded. Open Coach Watts on the web to review plan limits.
        </Text>
      ) : null}

      {analyzeError ? <Text className="mt-3 text-sm text-red-400">{analyzeError}</Text> : null}

      {showCta ? (
        <Button className="mt-4" label={ctaLabel} onPress={onAnalyze} loading={analyzing} />
      ) : null}
    </View>
  );
}

export default function ActivitySummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { instanceUrl } = useAuth();
  const { data, isLoading, isError, error } = useActivitySummaryQuery(id);
  const analyzeMutation = useRequestWorkoutAnalysis(id);

  const openWeb = async () => {
    if (!instanceUrl) return;
    const path = id ? workoutWebPath(id) : '/';
    await WebBrowser.openBrowserAsync(absoluteInstanceUrl(instanceUrl, path));
  };

  const analyzeError = analyzeMutation.error
    ? friendlyError(analyzeMutation.error, 'Failed to start analysis')
    : null;

  return (
    <>
      <Stack.Screen options={{ title: 'Activity', headerShown: true }} />
      {isLoading ? (
        <DetailSkeleton />
      ) : isError ? (
        <View className="flex-1 bg-surface-dark px-6 pt-6">
          <Text className="text-red-400">
            {friendlyError(error, 'Failed to load activity')}
          </Text>
        </View>
      ) : data ? (
        <ScrollView className="flex-1 bg-surface-dark" contentContainerClassName="px-6 pb-10 pt-4">
          <View className="flex-row items-center gap-3">
            <SportIcon type={data.type} size={18} />
            <Text className="min-w-0 flex-1 text-2xl font-semibold text-white">{data.title}</Text>
          </View>
          <Text className="mt-2 text-sm text-ink-muted">
            {[formatActivityDate(data.date), data.type].filter(Boolean).join(' · ')}
          </Text>
          <HeroStatTiles stats={activityHeroStats(data)} />
          <Text className={`mt-3 text-sm ${data.status.kind === 'failed' ? 'text-red-400' : 'text-ink-muted'}`}>
            {data.status.label}
          </Text>

          {data.metrics.length > 0 ? (
            <View className="mt-6">
              <Text className="text-xs uppercase tracking-wide text-ink-muted">Summary</Text>
              <View className="mt-3 flex-row flex-wrap">
                {data.metrics.map((metric) => (
                  <View key={metric.key} className="mb-3 w-1/2 pr-3">
                    <Text className="text-xs text-ink-muted">{metric.label}</Text>
                    <Text className="mt-0.5 text-base text-zinc-100">{metric.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <AnalysisBlock
            analysis={data.analysis}
            analyzing={analyzeMutation.isPending}
            analyzeError={analyzeError}
            onAnalyze={() => analyzeMutation.mutate()}
          />

          {id ? <ActivityCharts workoutId={id} /> : null}

          {data.description ? (
            <Text className="mt-6 text-base leading-6 text-zinc-200">{data.description}</Text>
          ) : null}

          <Button
            variant="secondary"
            className="mt-8"
            label="Open in Coach Watts for map & more"
            onPress={() => void openWeb()}
          />
        </ScrollView>
      ) : null}
    </>
  );
}
