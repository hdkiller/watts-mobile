import { Stack, type Href, router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { Button } from '@/src/components/Button';
import { formatLedgerStatusLabel } from '@/src/features/health/ledgerHelpers';
import {
  syncUnsyncedWorkouts,
  syncWorkoutByPlatformSessionId,
} from '@/src/features/health/orchestrator';
import {
  isUnsyncedRecentStatus,
  type RecentWorkoutRow,
} from '@/src/features/health/recentWorkoutRows';
import { listRecentPlatformWorkoutsWithStatus } from '@/src/features/health/recentWorkouts';
import type { SyncLedgerStatus } from '@/src/features/health/types';
import { useHealthSyncPreferences } from '@/src/features/health/useHealthSyncPreferences';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

function statusColor(status: SyncLedgerStatus): string {
  switch (status) {
    case 'synced':
      return 'text-emerald-400';
    case 'failed':
      return 'text-red-400';
    case 'needs_sync':
      return 'text-amber-400';
    case 'pending':
      return 'text-amber-400';
    case 'syncing':
      return 'text-brand';
    default:
      return 'text-text-muted';
  }
}

function formatWhen(iso: string): string {
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

export default function HealthRecentWorkoutsScreen() {
  const theme = useThemeColors();
  const { preferences } = useHealthSyncPreferences();
  const [rows, setRows] = useState<RecentWorkoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);

  const uploadsEnabled = preferences.syncEnabled && preferences.syncWorkouts;
  const platformLabel = Platform.OS === 'ios' ? 'Apple Health' : 'Health Connect';

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'refresh') setRefreshing(true);
    else setLoading(true);
    setLoadError(null);
    try {
      const next = await listRecentPlatformWorkoutsWithStatus();
      setRows(next);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load workouts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load('initial');
  }, [load]);

  const unsyncedCount = useMemo(
    () => rows.filter((row) => isUnsyncedRecentStatus(row.status)).length,
    [rows]
  );

  const handleSyncOne = async (row: RecentWorkoutRow, force: boolean) => {
    if (!uploadsEnabled) {
      setActionError(
        !preferences.syncEnabled
          ? 'Enable Sync to Coach Watts first'
          : 'Enable Sync workouts first'
      );
      hapticError();
      return;
    }
    hapticLight();
    setBusyId(row.platformSessionId);
    setActionError(null);
    try {
      await syncWorkoutByPlatformSessionId(row.platformSessionId, { force });
      await load('refresh');
      hapticSuccess();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Sync failed');
      hapticError();
      await load('refresh');
    } finally {
      setBusyId(null);
    }
  };

  const handleSyncAll = async () => {
    if (!uploadsEnabled) {
      setActionError(
        !preferences.syncEnabled
          ? 'Enable Sync to Coach Watts first'
          : 'Enable Sync workouts first'
      );
      hapticError();
      return;
    }
    hapticLight();
    setSyncingAll(true);
    setActionError(null);
    try {
      const result = await syncUnsyncedWorkouts();
      await load('refresh');
      if (result.failed > 0) {
        setActionError('Some workouts could not be synced');
        hapticError();
      } else {
        hapticSuccess();
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Sync all failed');
      hapticError();
      await load('refresh');
    } finally {
      setSyncingAll(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Recent workouts', headerShown: true }} />
      <SafeAreaView edges={{ bottom: true }} style={{ flex: 1, backgroundColor: theme.surface }}>
        <View className="px-6 pt-4 pb-2">
          <Text className="text-sm text-text-muted leading-5">
            Workouts on this phone from {platformLabel}, and whether they are in Coach Watts.
          </Text>
          {!uploadsEnabled ? (
            <Pressable
              onPress={() => {
                hapticLight();
                router.push('/(app)/(tabs)/more/settings/health' as Href);
              }}
              className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-3"
            >
              <Text className="text-xs text-amber-400 leading-4.5">
                {!preferences.syncEnabled
                  ? 'Sync to Coach Watts is off. You can browse workouts here; turn sync on to upload.'
                  : 'Sync workouts is off. Turn it on in Health Sync to upload from this list.'}
              </Text>
            </Pressable>
          ) : null}
          {unsyncedCount > 0 ? (
            <View className="mt-3">
              <Button
                label={`Sync all (${unsyncedCount})`}
                onPress={() => void handleSyncAll()}
                loading={syncingAll}
                variant="secondary"
                disabled={!uploadsEnabled || busyId != null}
              />
            </View>
          ) : null}
          {actionError ? (
            <Text className="mt-2 text-xs text-red-400 leading-4.5">{actionError}</Text>
          ) : null}
          {loadError ? (
            <Text className="mt-2 text-xs text-red-400 leading-4.5">{loadError}</Text>
          ) : null}
        </View>

        {loading && !refreshing ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={Colors.brand} size="large" />
            <Text className="mt-3 text-sm text-text-muted">Reading workouts…</Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-6 pb-12 pt-2"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void load('refresh')}
                tintColor={Colors.brand}
              />
            }
          >
            {rows.length === 0 ? (
              <View className="mt-10 items-center px-4">
                <Text className="text-base font-semibold text-text-primary text-center">
                  No workouts on this phone
                </Text>
                <Text className="mt-2 text-sm text-text-muted text-center leading-5">
                  Recent {platformLabel} workouts from the last two weeks appear here once Coach
                  Watts has read access and sessions exist on the device.
                </Text>
              </View>
            ) : (
              rows.map((row) => {
                const unsynced = isUnsyncedRecentStatus(row.status);
                const isBusy =
                  busyId === row.platformSessionId ||
                  row.status === 'syncing' ||
                  (syncingAll && unsynced);
                return (
                  <View
                    key={row.platformSessionId}
                    className="mb-3 rounded-xl border border-border bg-card/60 px-4 py-3.5"
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 mr-3">
                        <Text className="text-sm font-semibold text-text-primary">{row.title}</Text>
                        <Text className="mt-1 text-xs text-text-muted">
                          On phone · {formatWhen(row.startedAt)}
                        </Text>
                        {row.lastError ? (
                          <Text className="mt-1.5 text-xs text-red-400" numberOfLines={2}>
                            {row.lastError}
                          </Text>
                        ) : null}
                      </View>
                      <Text className={`text-xs font-semibold ${statusColor(row.status)}`}>
                        {formatLedgerStatusLabel(row.status)}
                      </Text>
                    </View>
                    <View className="mt-3">
                      {isBusy ? (
                        <ActivityIndicator color={Colors.brand} />
                      ) : unsynced ? (
                        <Button
                          label="Sync"
                          variant="secondary"
                          onPress={() => void handleSyncOne(row, true)}
                          disabled={!uploadsEnabled || syncingAll}
                        />
                      ) : row.status === 'synced' ? (
                        <Button
                          label="Resync"
                          variant="secondary"
                          onPress={() => void handleSyncOne(row, true)}
                          disabled={!uploadsEnabled || syncingAll}
                        />
                      ) : null}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}
