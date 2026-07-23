/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: docs/DESIGN.md · designed-as-app
 * Goals hub — type-code list fingerprint (Events keep date tile).
 */
import { router, Stack, type Href } from 'expo-router';
import { RefreshControl, ScrollView, Text, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { AppSymbol } from '@/src/components/AppSymbol';
import { OfflineBanner } from '@/src/components/OfflineBanner';
import { ListSkeleton } from '@/src/components/Skeleton';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { goalsWebPath } from '@/src/features/goals/mapGoals';
import type { GoalGlance } from '@/src/features/goals/types';
import { useGoalsQuery } from '@/src/features/goals/useGoals';
import { useOfflineCached } from '@/src/hooks/useOfflineCached';
import { hapticLight } from '@/src/lib/haptics';
import { APP_HREFS } from '@/src/linking/appHrefs';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

export default function GoalsListScreen() {
  const { instanceUrl } = useAuth();
  const { data, isLoading, isError, error, refetch, isRefetching, dataUpdatedAt } = useGoalsQuery();
  const { showCachedOffline, lastUpdatedLabel } = useOfflineCached({
    data,
    isError,
    dataUpdatedAt,
  });

  const openWeb = async () => {
    hapticLight();
    await openInstanceWeb(instanceUrl, goalsWebPath());
  };

  const openCreate = () => {
    hapticLight();
    router.push(APP_HREFS.goalsNew as Href);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Goals',
          headerShown: true,
          headerRight: () => (
            <AnimatedPressable
              accessibilityRole="button"
              accessibilityLabel="Create goal"
              hitSlop={8}
              className="px-1"
              onPress={openCreate}
            >
              <Text className="text-sm font-semibold text-brand">Add</Text>
            </AnimatedPressable>
          ),
        }}
      />
      {isLoading && !data ? (
        <ListSkeleton />
      ) : isError && !data ? (
        <View className="flex-1 bg-surface px-6 pt-6">
          <Text className="text-red-400">{friendlyError(error, 'Failed to load goals')}</Text>
          <AnimatedPressable className="mt-4" hitSlop={8} onPress={() => void refetch()}>
            <Text className="text-sm font-semibold text-brand">Try again</Text>
          </AnimatedPressable>
        </View>
      ) : (
        <ScrollView
          className="flex-1 bg-surface"
          contentContainerClassName="px-6 pb-10 pt-4"
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
              tintColor={Colors.brand}
            />
          }
        >
          <OfflineBanner visible={showCachedOffline} lastUpdatedLabel={lastUpdatedLabel} />

          {!data || data.length === 0 ? (
            <View className="pt-8">
              <Text className="text-base text-text-muted">No goals yet.</Text>
              <AnimatedPressable className="mt-4" hitSlop={8} onPress={openCreate}>
                <Text className="text-sm font-semibold text-brand">Create goal</Text>
              </AnimatedPressable>
              {instanceUrl ? (
                <AnimatedPressable className="mt-3" hitSlop={8} onPress={() => void openWeb()}>
                  <Text className="text-sm font-semibold text-brand">Manage goals on web</Text>
                </AnimatedPressable>
              ) : null}
            </View>
          ) : (
            <View>
              {data.map((goal) => (
                <GoalListRow key={goal.id} goal={goal} />
              ))}
              {instanceUrl ? (
                <AnimatedPressable className="mt-4" hitSlop={8} onPress={() => void openWeb()}>
                  <Text className="text-sm font-semibold text-brand">Manage goals on web</Text>
                </AnimatedPressable>
              ) : null}
            </View>
          )}
        </ScrollView>
      )}
    </>
  );
}

function GoalListRow({ goal }: { goal: GoalGlance }) {
  const theme = useThemeColors();
  const meta = [goal.typeLabel, goal.targetDateLabel, goal.statusLabel].filter(Boolean).join(' · ');

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={goal.title}
      className="mb-3 flex-row items-center gap-3 rounded-xl border border-border bg-card/80 px-4 py-3.5"
      onPress={() => {
        hapticLight();
        router.push(APP_HREFS.goalDetail(goal.id) as Href);
      }}
    >
      <View className="h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface">
        <Text className="text-[10px] font-bold uppercase leading-none text-brand">
          {goal.typeShort}
        </Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-base font-medium text-text-primary" numberOfLines={2}>
          {goal.title}
        </Text>
        {meta ? (
          <Text className="mt-1 text-sm text-text-muted" numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
      <AppSymbol sf="chevron.right" size={14} tintColor={theme.textMuted} fallback="›" />
    </AnimatedPressable>
  );
}
