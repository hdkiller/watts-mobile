import { router, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import type { RecoveryContextItem } from '@/src/features/recovery/types';

function openRecoveryEvent(item?: RecoveryContextItem) {
  if (item) {
    router.push(`/(app)/recovery-event?id=${encodeURIComponent(item.sourceRecordId)}` as Href);
    return;
  }
  router.push('/(app)/recovery-event' as Href);
}

type ActiveRecoveryBandProps = {
  items: RecoveryContextItem[] | undefined;
  isError?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
};

export function ActiveRecoveryBand({
  items,
  isError,
  errorMessage,
  onRetry,
}: ActiveRecoveryBandProps) {
  const hasItems = Boolean(items?.length);

  return (
    <View className="mt-6">
      <Text className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
        Active Recovery Context
      </Text>
      <Text className="mt-1.5 text-sm leading-5 text-ink-muted">
        Coach Watts will use this when generating today’s guidance.
      </Text>

      {isError ? (
        <View className="mt-3 rounded-xl border border-red-900/50 bg-red-950/40 p-3">
          <Text className="text-sm text-red-300">
            {errorMessage || 'Could not load recovery context'}
          </Text>
          {onRetry ? (
            <Pressable className="mt-2" onPress={onRetry}>
              <Text className="font-semibold text-brand">Retry</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {!isError && hasItems ? (
        <View className="mt-2 flex-row flex-wrap">
          {items!.map((item) => (
            <Pressable
              key={item.id}
              className="mr-2 mt-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 active:opacity-80"
              onPress={() => openRecoveryEvent(item)}
            >
              <Text className="text-xs font-semibold text-zinc-200">
                {item.label}
                {item.severity != null ? ` · ${item.severity}/10` : ''}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {!isError && !hasItems ? (
        <Text className="mt-3 text-sm text-ink-muted">No active recovery context for today.</Text>
      ) : null}

      <View className="mt-4 flex-row flex-wrap items-center gap-x-4 gap-y-2">
        <Pressable className="py-1 active:opacity-70" onPress={() => openRecoveryEvent()}>
          <Text className="text-sm font-semibold text-brand">Log event</Text>
        </Pressable>
        <Pressable
          className="py-1 active:opacity-70"
          onPress={() => router.push('/(app)/(tabs)/log?section=wellness' as Href)}
        >
          <Text className="text-sm font-semibold text-brand">Check in</Text>
        </Pressable>
        <Pressable
          className="py-1 active:opacity-70"
          onPress={() => router.push('/(app)/(tabs)/log?section=recovery' as Href)}
        >
          <Text className="text-sm text-ink-muted">History</Text>
        </Pressable>
      </View>
    </View>
  );
}
