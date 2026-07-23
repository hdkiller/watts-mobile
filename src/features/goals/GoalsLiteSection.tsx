/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: docs/DESIGN.md · designed-as-app
 * Athlete teaser — one primary hit (title → detail), one secondary (All goals).
 */
import { router, type Href } from 'expo-router';
import { Text, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { Skeleton } from '@/src/components/Skeleton';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { goalsWebPath } from '@/src/features/goals/mapGoals';
import { usePrimaryGoalQuery } from '@/src/features/goals/useGoals';
import { hapticLight } from '@/src/lib/haptics';
import { APP_HREFS } from '@/src/linking/appHrefs';

/** Compact Athlete teaser → Goals hub / primary detail (no inline rename). */
export function GoalsLiteSection() {
  const { instanceUrl } = useAuth();
  const { data: primary, isLoading, isError, error } = usePrimaryGoalQuery();

  const openWebGoals = () => {
    hapticLight();
    void openInstanceWeb(instanceUrl, goalsWebPath());
  };

  const openGoalsHub = () => {
    hapticLight();
    router.push(APP_HREFS.goalsList as Href);
  };

  const openPrimaryDetail = () => {
    if (!primary) {
      openGoalsHub();
      return;
    }
    hapticLight();
    router.push(APP_HREFS.goalDetail(primary.id) as Href);
  };

  return (
    <View className="mt-8 border-t border-border/80 pt-6">
      <Text className="text-xs uppercase tracking-wide text-text-muted">Goal</Text>

      {isLoading ? (
        <View className="mt-3 gap-2">
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-4 w-1/3" />
        </View>
      ) : isError ? (
        <View className="mt-3 rounded-xl border border-danger/40 bg-tint-error px-4 py-3.5">
          <Text className="text-sm text-red-400">
            {friendlyError(error, 'Could not load goals')}
          </Text>
        </View>
      ) : !primary ? (
        <View className="mt-3">
          <Text className="text-sm text-text-muted">No goal yet. Set one during activation.</Text>
          <View className="mt-3 flex-row flex-wrap items-center gap-x-4 gap-y-2">
            <AnimatedPressable
              accessibilityRole="button"
              accessibilityLabel="Open Goals"
              hitSlop={8}
              onPress={openGoalsHub}
            >
              <Text className="text-sm font-semibold text-brand">View Goals</Text>
            </AnimatedPressable>
            <AnimatedPressable
              accessibilityRole="button"
              accessibilityLabel="Manage goals on web"
              hitSlop={8}
              onPress={openWebGoals}
            >
              <Text className="text-sm font-semibold text-brand">Manage on web</Text>
            </AnimatedPressable>
          </View>
        </View>
      ) : (
        <View className="mt-2">
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel={`Open goal ${primary.title}`}
            onPress={openPrimaryDetail}
          >
            <Text className="text-lg font-semibold text-text-primary">{primary.title}</Text>
            <Text className="mt-1 text-sm text-text-muted">
              {[primary.typeLabel, primary.targetDateLabel, primary.statusLabel]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </AnimatedPressable>
          <AnimatedPressable
            className="mt-3 self-start"
            accessibilityRole="button"
            accessibilityLabel="Open Goals list"
            hitSlop={8}
            onPress={openGoalsHub}
          >
            <Text className="text-sm font-semibold text-brand">All goals</Text>
          </AnimatedPressable>
        </View>
      )}
    </View>
  );
}
