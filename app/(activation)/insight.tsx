import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { friendlyError } from '@/src/api/errors';
import { Button } from '@/src/components/Button';
import { trackActivationEvent } from '@/src/features/activation/analytics';
import { markFirstInsightViewed } from '@/src/features/activation/api';
import { useInvalidateActivationStatus } from '@/src/features/activation/useActivationStatus';
import { fetchUpcomingPlanned } from '@/src/features/plans/api';
import type { PlannedWorkoutPreview } from '@/src/features/plans/types';

export default function ActivationInsightScreen() {
  const router = useRouter();
  const invalidate = useInvalidateActivationStatus();
  const [items, setItems] = useState<PlannedWorkoutPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await fetchUpcomingPlanned(8);
        if (!cancelled) setItems(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onContinue = async () => {
    setError(null);
    setBusy(true);
    try {
      await markFirstInsightViewed();
      trackActivationEvent('activation_insight_viewed');
      trackActivationEvent('activation_soft_activated');
      await invalidate();
      router.replace('/(activation)/connect');
    } catch (err) {
      setError(friendlyError(err, 'Could not continue'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']}>
      <ScrollView contentContainerClassName="px-6 pb-10 pt-2">
        <Text className="text-2xl font-semibold text-text-primary">Here’s your coaching start</Text>
        <Text className="mt-2 text-base text-text-muted">
          Your plan is active. Daily recommendations get sharper after you connect Health Sync or a
          wearable — you can do that next.
        </Text>

        {loading ? (
          <View className="mt-10 items-center">
            <ActivityIndicator />
          </View>
        ) : (
          <View className="mt-6 gap-2">
            <Text className="text-sm font-medium uppercase tracking-wide text-text-muted">
              Coming up
            </Text>
            {items.length === 0 ? (
              <Text className="text-sm text-text-muted">
                Planned sessions will show on Today once the plan finishes materializing.
              </Text>
            ) : (
              items.slice(0, 5).map((w, i) => (
                <View key={w.id ?? `${i}`} className="rounded-xl border border-border bg-card p-3">
                  <Text className="text-base text-text-primary">{w.title || w.type || 'Session'}</Text>
                  {w.date ? <Text className="mt-1 text-sm text-text-muted">{String(w.date)}</Text> : null}
                </View>
              ))
            )}
          </View>
        )}

        {error ? <Text className="mt-4 text-sm text-red-400">{error}</Text> : null}

        <Button className="mt-8" label="Continue" loading={busy} onPress={() => void onContinue()} />
      </ScrollView>
    </SafeAreaView>
  );
}
