/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { router, Stack } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { ScrollView, Text, View } from 'react-native';

import { useActivationStatus } from '@/src/features/activation/useActivationStatus';
import { usePrimaryGoalQuery } from '@/src/features/goals/useGoals';
import { PlanGeneratorPanel } from '@/src/features/plans/PlanGeneratorPanel';
import { ACTIVE_PLAN_QUERY_KEY, invalidatePlanCaches } from '@/src/features/plans/usePlans';
import { useKeyboardOverlap } from '@/src/hooks/useKeyboardOverlap';
import { APP_HREFS } from '@/src/linking/appHrefs';

export default function PlanCreateScreen() {
  const { data: activation } = useActivationStatus();
  const primaryGoal = usePrimaryGoalQuery();
  const queryClient = useQueryClient();
  const preferredGoalId = activation?.primaryGoalId ?? primaryGoal.data?.id ?? null;
  const { containerRef, overlap } = useKeyboardOverlap();

  return (
    <>
      <Stack.Screen options={{ title: 'Create plan', headerShown: true }} />
      <View ref={containerRef} className="flex-1 bg-surface">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pt-4"
          contentContainerStyle={{ paddingBottom: 48 + overlap }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="mb-4 text-sm text-text-muted">
            Build a plan you can activate. We’ll preview the first week before it goes live.
          </Text>
          <PlanGeneratorPanel
            preferredGoalId={preferredGoalId}
            onCreateGoal={() => router.push(APP_HREFS.goalsNew as never)}
            onActivated={async () => {
              await invalidatePlanCaches(queryClient);
              await queryClient.invalidateQueries({ queryKey: ACTIVE_PLAN_QUERY_KEY });
              router.replace(APP_HREFS.plan as never);
            }}
          />
        </ScrollView>
      </View>
    </>
  );
}
