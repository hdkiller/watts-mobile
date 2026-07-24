/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { router, Stack } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { ScrollView, Text } from 'react-native';

import { useActivationStatus } from '@/src/features/activation/useActivationStatus';
import { usePrimaryGoalQuery } from '@/src/features/goals/useGoals';
import { PlanGeneratorPanel } from '@/src/features/plans/PlanGeneratorPanel';
import { ACTIVE_PLAN_QUERY_KEY, invalidatePlanCaches } from '@/src/features/plans/usePlans';
import { APP_HREFS } from '@/src/linking/appHrefs';

export default function PlanCreateScreen() {
  const { data: activation } = useActivationStatus();
  const primaryGoal = usePrimaryGoalQuery();
  const queryClient = useQueryClient();
  const goalId = activation?.primaryGoalId ?? primaryGoal.data?.id ?? null;

  return (
    <>
      <Stack.Screen options={{ title: 'Create plan', headerShown: true }} />
      <ScrollView className="flex-1 bg-surface" contentContainerClassName="px-6 pb-12 pt-4">
        <Text className="mb-4 text-sm text-text-muted">
          Choose availability and volume, preview the first week, then activate.
        </Text>
        <PlanGeneratorPanel
          goalId={goalId}
          onActivated={async () => {
            await invalidatePlanCaches(queryClient);
            await queryClient.invalidateQueries({ queryKey: ACTIVE_PLAN_QUERY_KEY });
            router.replace(APP_HREFS.plan as never);
          }}
        />
      </ScrollView>
    </>
  );
}
