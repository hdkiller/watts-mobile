/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { friendlyError } from '@/src/api/errors';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { Button } from '@/src/components/Button';
import { DateYmdField } from '@/src/components/DateYmdField';
import { trackActivationEvent } from '@/src/features/activation/analytics';
import { useAdvanceActivationStatus } from '@/src/features/activation/useActivationStatus';
import {
  buildCreateGoalInput,
  defaultGoalTargetDateYmd,
  validateGoalCreateForm,
} from '@/src/features/goals/buildCreateGoal';
import type { GoalType } from '@/src/features/goals/types';
import { useCreateGoalMutation } from '@/src/features/goals/useGoals';
import { useKeyboardOverlap } from '@/src/hooks/useKeyboardOverlap';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { useThemeColors } from '@/src/theme/useThemeColors';

const TYPES: { id: GoalType; label: string; hint: string }[] = [
  { id: 'EVENT', label: 'Race / event', hint: 'Train toward a date on the calendar' },
  { id: 'PERFORMANCE', label: 'Performance', hint: 'FTP, pace, or another metric' },
  { id: 'CONSISTENCY', label: 'Consistency', hint: 'Show up week after week' },
  { id: 'BODY_COMPOSITION', label: 'Body composition', hint: 'Weight or body-fat target' },
];

export default function ActivationGoalScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const advance = useAdvanceActivationStatus();
  const createGoal = useCreateGoalMutation();
  const { containerRef, overlap } = useKeyboardOverlap();
  const [type, setType] = useState<GoalType>('EVENT');
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState(() => defaultGoalTargetDateYmd());
  const [error, setError] = useState<string | null>(null);

  const values = useMemo(
    () => ({
      type,
      title,
      targetDate,
      priority: 'MEDIUM' as const,
      description: '',
      metric: '',
      targetValue: '',
      startValue: '',
    }),
    [type, title, targetDate]
  );

  const canSubmit = useMemo(() => title.trim().length >= 2, [title]);

  const onSubmit = async () => {
    const validation = validateGoalCreateForm(values);
    if (validation) {
      hapticError();
      setError(validation);
      return;
    }
    setError(null);
    try {
      const goal = await createGoal.mutateAsync(buildCreateGoalInput(values));
      trackActivationEvent('activation_goal_created', { type });
      hapticSuccess();
      await advance({ mobileActivationStep: 'plan', primaryGoalId: goal.id });
      router.replace('/(activation)/plan');
    } catch (err) {
      hapticError();
      setError(friendlyError(err, 'Could not save goal'));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']}>
      <View ref={containerRef} testID="activation-goal-screen" className="flex-1">
        <ScrollView
          contentContainerClassName="px-6 pt-2"
          contentContainerStyle={{ paddingBottom: 40 + overlap }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-2xl font-semibold text-text-primary">What are you training for?</Text>
          <Text className="mt-2 text-base text-text-muted">
            Pick one primary goal. You can refine it later.
          </Text>

          <View className="mt-6 gap-2">
            {TYPES.map((item) => {
              const selected = type === item.id;
              return (
                <AnimatedPressable
                  key={item.id}
                  testID={`activation-goal-type-${item.id}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  hitSlop={8}
                  onPress={() => {
                    hapticLight();
                    setType(item.id);
                  }}
                  className={`rounded-xl border p-4 ${
                    selected ? 'border-brand bg-brand/15' : 'border-border bg-card/60'
                  }`}
                >
                  <Text
                    className={`text-base font-medium ${
                      selected ? 'text-brand' : 'text-text-primary'
                    }`}
                  >
                    {item.label}
                  </Text>
                  <Text className="mt-1 text-sm text-text-muted">{item.hint}</Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <Text className="mt-6 text-sm font-medium text-text-muted">Goal title</Text>
          <TextInput
            testID="activation-goal-title"
            className="mt-2 rounded-xl border border-border-strong bg-card px-4 py-3 text-base text-text-primary"
            placeholder="e.g. Autumn gran fondo"
            placeholderTextColor={theme.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          <View className="mt-4">
            <DateYmdField
              label="Target date"
              value={targetDate}
              onChange={setTargetDate}
              testID="activation-goal-target-date"
            />
          </View>

          {error ? (
            <View className="mt-4 rounded-xl border border-danger/40 bg-tint-error p-3">
              <Text className="text-sm text-red-400">{error}</Text>
              <AnimatedPressable
                hitSlop={8}
                onPress={() => {
                  hapticLight();
                  void onSubmit();
                }}
                accessibilityRole="button"
                accessibilityLabel="Retry"
                className="mt-2 self-start"
                testID="activation-goal-retry"
              >
                <Text className="text-sm font-semibold text-brand">Retry</Text>
              </AnimatedPressable>
            </View>
          ) : null}

          <Button
            className="mt-8"
            label="Continue"
            testID="activation-goal-continue"
            disabled={!canSubmit || createGoal.isPending}
            loading={createGoal.isPending}
            onPress={() => void onSubmit()}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
