/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { useRouter } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { trackActivationEvent } from '@/src/features/activation/analytics';
import { useActivationStatus, useAdvanceActivationStatus } from '@/src/features/activation/useActivationStatus';
import { PlanGeneratorPanel } from '@/src/features/plans/PlanGeneratorPanel';

export default function ActivationPlanScreen() {
  const router = useRouter();
  const { data: activation } = useActivationStatus();
  const advance = useAdvanceActivationStatus();
  const goalId = activation?.primaryGoalId;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']}>
      <ScrollView contentContainerClassName="px-6 pb-10 pt-2">
        <Text className="text-2xl font-semibold text-text-primary">Build a starter plan</Text>
        <Text className="mt-2 mb-6 text-base text-text-muted">
          Build a plan you can activate. We’ll preview the first week — keep refining anytime on
          the Plan tab.
        </Text>
        <PlanGeneratorPanel
          goalId={goalId}
          onActivated={async (planId) => {
            trackActivationEvent('activation_plan_activated');
            await advance({ mobileActivationStep: 'insight', activePlanId: planId });
            router.replace('/(activation)/insight');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
