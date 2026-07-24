/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { trackActivationEvent } from '@/src/features/activation/analytics';
import { useActivationStatus, useAdvanceActivationStatus } from '@/src/features/activation/useActivationStatus';
import { usePrimaryGoalQuery } from '@/src/features/goals/useGoals';
import { PlanGeneratorPanel } from '@/src/features/plans/PlanGeneratorPanel';
import { useKeyboardOverlap } from '@/src/hooks/useKeyboardOverlap';

export default function ActivationPlanScreen() {
  const router = useRouter();
  const { data: activation } = useActivationStatus();
  const primaryGoal = usePrimaryGoalQuery();
  const advance = useAdvanceActivationStatus();
  const preferredGoalId = activation?.primaryGoalId ?? primaryGoal.data?.id ?? null;
  const { containerRef, overlap } = useKeyboardOverlap();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']}>
      <View ref={containerRef} className="flex-1">
        <ScrollView
          contentContainerClassName="px-6 pt-2"
          contentContainerStyle={{ paddingBottom: 40 + overlap }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-2xl font-semibold text-text-primary">Build a starter plan</Text>
          <Text className="mt-2 mb-6 text-base text-text-muted">
            Build a plan you can activate. We’ll preview the first week — keep refining anytime on
            the Plan tab.
          </Text>
          <PlanGeneratorPanel
            preferredGoalId={preferredGoalId}
            onCreateGoal={() => router.replace('/(activation)/goal')}
            onActivated={async (planId) => {
              trackActivationEvent('activation_plan_activated');
              await advance({ mobileActivationStep: 'insight', activePlanId: planId });
              router.replace('/(activation)/insight');
            }}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
