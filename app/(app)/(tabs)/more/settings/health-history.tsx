import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { Button } from '@/src/components/Button';
import { filterLedgerByAttention, formatLedgerStatusLabel } from '@/src/features/health/ledgerHelpers';
import { retryLedgerItem, runHealthSyncPass } from '@/src/features/health/orchestrator';
import type { SyncLedgerItem, SyncLedgerStatus } from '@/src/features/health/types';
import { useSyncLedger } from '@/src/features/health/useSyncLedger';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

type Filter = 'all' | 'failed' | 'needs_sync';

function statusColor(status: SyncLedgerStatus): string {
  switch (status) {
    case 'synced':
      return 'text-emerald-400';
    case 'failed':
      return 'text-red-400';
    case 'needs_sync':
      return 'text-amber-400';
    case 'syncing':
      return 'text-brand';
    default:
      return 'text-text-muted';
  }
}

function formatWhen(item: SyncLedgerItem): string {
  const iso = item.lastAttemptAt ?? item.lastSuccessAt ?? item.startedAt ?? item.localDate;
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-3 py-1.5 mr-2 border ${
        active ? 'bg-brand/15 border-brand/40' : 'bg-transparent border-border'
      }`}
    >
      <Text className={`text-xs font-semibold ${active ? 'text-brand' : 'text-text-muted'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function HealthSyncHistoryScreen() {
  const theme = useThemeColors();
  const items = useSyncLedger();
  const [filter, setFilter] = useState<Filter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [resyncing, setResyncing] = useState(false);

  const visible = useMemo(
    () => filterLedgerByAttention(items, filter),
    [items, filter]
  );

  const handleRetry = async (id: string) => {
    hapticLight();
    setBusyId(id);
    try {
      await retryLedgerItem(id);
      hapticSuccess();
    } catch {
      hapticError();
    } finally {
      setBusyId(null);
    }
  };

  const handleSyncNow = async () => {
    hapticLight();
    setSyncingAll(true);
    try {
      await runHealthSyncPass({ force: true });
      hapticSuccess();
    } catch {
      hapticError();
    } finally {
      setSyncingAll(false);
    }
  };

  const handleResyncAll = async () => {
    hapticLight();
    setResyncing(true);
    try {
      // Clears watermarks and backfills the full lookback window.
      await runHealthSyncPass({ fullResync: true });
      hapticSuccess();
    } catch {
      hapticError();
    } finally {
      setResyncing(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Sync history', headerShown: true }} />
      <SafeAreaView edges={{ bottom: true }} style={{ flex: 1, backgroundColor: theme.surface }}>
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center mb-3">
            <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
            <FilterChip
              label="Failed"
              active={filter === 'failed'}
              onPress={() => setFilter('failed')}
            />
            <FilterChip
              label="Needs sync"
              active={filter === 'needs_sync'}
              onPress={() => setFilter('needs_sync')}
            />
          </View>
          <Button
            label="Sync now"
            onPress={() => void handleSyncNow()}
            loading={syncingAll}
            variant="secondary"
          />
          <View className="mt-2">
            <Button
              label="Resync all"
              onPress={() => void handleResyncAll()}
              loading={resyncing}
              variant="secondary"
            />
          </View>
          <Text className="mt-2 text-xs text-text-muted leading-4">
            Resync all re-reads the full lookback window and re-uploads changed items.
          </Text>
        </View>

        <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12 pt-2">
          {visible.length === 0 ? (
            <View className="mt-10 items-center px-4">
              <Text className="text-base font-semibold text-text-primary text-center">
                No sync history yet
              </Text>
              <Text className="mt-2 text-sm text-text-muted text-center leading-5">
                After Sync to Coach Watts runs, wellness days and workouts appear here with status
                and retry.
              </Text>
            </View>
          ) : (
            visible.map((item) => {
              const canRetry = item.status === 'failed' || item.status === 'needs_sync';
              const isBusy = busyId === item.id || item.status === 'syncing';
              return (
                <View
                  key={item.id}
                  className="mb-3 rounded-xl border border-border bg-card/60 px-4 py-3.5"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 mr-3">
                      <Text className="text-sm font-semibold text-text-primary">{item.title}</Text>
                      <Text className="mt-1 text-xs text-text-muted capitalize">
                        {item.kind} · {item.platform.replace('_', ' ')}
                      </Text>
                      <Text className="mt-1 text-xs text-text-muted">{formatWhen(item)}</Text>
                      {item.lastError ? (
                        <Text className="mt-1.5 text-xs text-red-400" numberOfLines={2}>
                          {item.lastError}
                        </Text>
                      ) : null}
                    </View>
                    <Text className={`text-xs font-semibold ${statusColor(item.status)}`}>
                      {formatLedgerStatusLabel(item.status)}
                    </Text>
                  </View>
                  {canRetry ? (
                    <View className="mt-3">
                      {isBusy ? (
                        <ActivityIndicator color={Colors.brand} />
                      ) : (
                        <Button
                          label="Retry"
                          variant="secondary"
                          onPress={() => void handleRetry(item.id)}
                        />
                      )}
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
