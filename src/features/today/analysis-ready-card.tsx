import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { ActivityListItem } from '@/src/features/activity/types';
import {
  isAnalysisSeenSync,
  loadSeenAnalysisIds,
  markAnalysisSeen,
} from '@/src/features/today/analysisReadyStore';

type AnalysisReadyCardProps = {
  recent: ActivityListItem[] | undefined;
};

function pickReadyActivity(recent: ActivityListItem[] | undefined): ActivityListItem | null {
  if (!recent?.length) return null;
  // Most recent first (API already returns newest-first typically).
  for (const item of recent) {
    if (item.status.kind !== 'ready') continue;
    if (isAnalysisSeenSync(item.id)) continue;
    return item;
  }
  return null;
}

export function AnalysisReadyCard({ recent }: AnalysisReadyCardProps) {
  const [ready, setReady] = useState<ActivityListItem | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await loadSeenAnalysisIds();
      if (cancelled) return;
      setHydrated(true);
      setReady(pickReadyActivity(recent));
    })();
    return () => {
      cancelled = true;
    };
  }, [recent]);

  if (!hydrated || !ready) return null;

  const title = ready.title.trim() || 'Workout';

  return (
    <View className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3">
      <View className="flex-row items-start justify-between gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${title} analyzed, view`}
          className="min-w-0 flex-1 active:opacity-80"
          hitSlop={8}
          onPress={() => {
            void markAnalysisSeen(ready.id);
            setReady(null);
            router.push(`/(app)/activity/${ready.id}` as Href);
          }}
        >
          <Text className="text-xs uppercase tracking-wide text-ink-muted">Analysis ready</Text>
          <Text className="mt-1 text-sm leading-5 text-zinc-200" numberOfLines={2}>
            {title} analyzed → view
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss analysis ready"
          className="px-1 py-0.5 active:opacity-70"
          hitSlop={8}
          onPress={() => {
            void markAnalysisSeen(ready.id);
            setReady(null);
          }}
        >
          <Text className="text-base text-ink-muted">✕</Text>
        </Pressable>
      </View>
    </View>
  );
}
