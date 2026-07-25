/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app
 * Host for EventGoalWizard (web Create Goal parity).
 */
import { router, Stack, type Href } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { EventGoalWizard } from '@/src/features/goals/EventGoalWizard';
import { useKeyboardOverlap } from '@/src/hooks/useKeyboardOverlap';
import { APP_HREFS } from '@/src/linking/appHrefs';

export default function NewGoalScreen() {
  const { containerRef, overlap } = useKeyboardOverlap();

  return (
    <>
      <Stack.Screen options={{ title: 'Create goal', headerShown: true }} />
      <View ref={containerRef} testID="goal-create-screen" className="flex-1 bg-surface">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pt-4"
          contentContainerStyle={{ paddingBottom: 40 + overlap }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="mb-4 text-sm text-text-muted">
            Define a new training goal to focus your plan. AI suggest/review stay on Coach Watts
            web.
          </Text>
          <EventGoalWizard
            onCreateEvent={() => router.push(APP_HREFS.eventsNew as Href)}
            onCreated={(goal) => {
              router.replace(APP_HREFS.goalDetail(goal.id) as Href);
            }}
          />
        </ScrollView>
      </View>
    </>
  );
}
