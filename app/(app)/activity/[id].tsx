import { Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/src/auth/AuthContext';
import { ActivityCharts } from '@/src/features/activity/ActivityCharts';
import { AnalyzeWorkoutError } from '@/src/features/activity/api';
import {
  absoluteInstanceUrl,
  formatActivityDate,
  formatDuration,
  workoutWebPath,
} from '@/src/features/activity/mapActivity';
import type { ActivityAnalysis } from '@/src/features/activity/types';
import {
  useActivitySummaryQuery,
  useRequestWorkoutAnalysis,
} from '@/src/features/activity/useActivity';
import { Colors } from '@/src/theme/colors';

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
  const ctaLabel =
    analysis.phase === 'ready' || analysis.hasContent ? 'Regenerate analysis' : 'Analyze workout';
  const showCta = analysis.phase !== 'analyzing' && !analyzing;

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
        {analyzing || analysis.phase === 'analyzing' ? 'Analyzing…' : analysis.statusLabel}
      </Text>

      {analysis.scores.length > 0 ? (
        <View className="mt-3 flex-row flex-wrap">
          {analysis.scores.map((score) => (
            <View key={score.key} className="mb-2 mr-3 min-w-[64px]">
              <Text className="text-xs text-ink-muted">{score.label}</Text>
              <Text className="mt-0.5 text-lg font-semibold text-white">{score.value}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {analysis.executiveSummary ? (
        <Text className="mt-3 text-base leading-6 text-zinc-200">{analysis.executiveSummary}</Text>
      ) : null}

      {analysis.markdownFallback && !analysis.executiveSummary ? (
        <Text className="mt-3 text-base leading-6 text-zinc-200">{analysis.markdownFallback}</Text>
      ) : null}

      {analysis.sections.map((section) => (
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
      ))}

      {analysis.recommendations.length > 0 ? (
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

      {analysis.strengths.length > 0 ? (
        <View className="mt-4">
          <Text className="text-xs uppercase tracking-wide text-ink-muted">Strengths</Text>
          {analysis.strengths.map((item) => (
            <Text key={item} className="mt-1.5 text-sm leading-5 text-zinc-300">
              • {item}
            </Text>
          ))}
        </View>
      ) : null}

      {analysis.weaknesses.length > 0 ? (
        <View className="mt-4">
          <Text className="text-xs uppercase tracking-wide text-ink-muted">Focus areas</Text>
          {analysis.weaknesses.map((item) => (
            <Text key={item} className="mt-1.5 text-sm leading-5 text-zinc-300">
              • {item}
            </Text>
          ))}
        </View>
      ) : null}

      {!analysis.hasContent && analysis.phase === 'not_started' ? (
        <Text className="mt-3 text-sm text-ink-muted">
          Run analysis to get scores and coaching takeaways for this workout.
        </Text>
      ) : null}

      {analysis.phase === 'quota' ? (
        <Text className="mt-3 text-sm text-red-400">
          Analysis quota exceeded. Open Coach Watts on the web to review plan limits.
        </Text>
      ) : null}

      {analyzeError ? <Text className="mt-3 text-sm text-red-400">{analyzeError}</Text> : null}

      {showCta ? (
        <Pressable
          className="mt-4 items-center rounded-xl bg-brand py-3.5 active:opacity-80"
          onPress={onAnalyze}
          disabled={analyzing}
        >
          <Text className="text-base font-semibold text-white">{ctaLabel}</Text>
        </Pressable>
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

  const analyzeError =
    analyzeMutation.error instanceof AnalyzeWorkoutError
      ? analyzeMutation.error.message
      : analyzeMutation.error instanceof Error
        ? analyzeMutation.error.message
        : null;

  return (
    <>
      <Stack.Screen options={{ title: 'Activity', headerShown: true }} />
      {isLoading ? (
        <View className="flex-1 items-center justify-center bg-surface-dark">
          <ActivityIndicator color={Colors.brand} />
        </View>
      ) : isError ? (
        <View className="flex-1 bg-surface-dark px-6 pt-6">
          <Text className="text-red-400">
            {error instanceof Error ? error.message : 'Failed to load activity'}
          </Text>
        </View>
      ) : data ? (
        <ScrollView className="flex-1 bg-surface-dark" contentContainerClassName="px-6 pb-10 pt-4">
          <Text className="text-2xl font-semibold text-white">{data.title}</Text>
          <Text className="mt-2 text-sm text-ink-muted">
            {[
              formatActivityDate(data.date),
              data.type,
              formatDuration(data.durationSec),
              data.loadLabel,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
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

          <Pressable
            className="mt-8 items-center rounded-xl border border-zinc-700 py-3.5 active:opacity-80"
            onPress={() => void openWeb()}
          >
            <Text className="text-base font-semibold text-white">
              Open in Coach Watts for map & more
            </Text>
          </Pressable>
        </ScrollView>
      ) : null}
    </>
  );
}
