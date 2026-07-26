/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { trackActivationEvent } from '@/src/features/activation/analytics';
import { useAdvanceActivationStatus } from '@/src/features/activation/useActivationStatus';
import { EventGoalWizard } from '@/src/features/goals/EventGoalWizard';
import { useKeyboardOverlap } from '@/src/hooks/useKeyboardOverlap';

export default function ActivationGoalScreen() {
  const router = useRouter();
  const advance = useAdvanceActivationStatus();
  const { containerRef, overlap } = useKeyboardOverlap();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']}>
      <View ref={containerRef} testID="activation-goal-screen" className="flex-1">
        <ScrollView
          contentContainerClassName="px-6 pt-2"
          contentContainerStyle={{ paddingBottom: 40 + overlap }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-2xl font-semibold text-text-primary">
            What are you training for?
          </Text>
          <Text className="mb-6 mt-2 text-base text-text-muted">
            Pick a primary goal. You can refine it later on Goals.
          </Text>
          <EventGoalWizard
            testID="activation-event-goal-wizard"
            onCreateEvent={null}
            onCreated={async (goal) => {
              trackActivationEvent('activation_goal_created', { type: String(goal.type) });
              await advance({ mobileActivationStep: 'plan', primaryGoalId: goal.id });
              router.replace('/(activation)/plan');
            }}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
