/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: docs/DESIGN.md · designed-as-app
 * Goals lite create — minimum fields; EVENT always sends eventData.
 */
import { router, Stack, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { Button } from '@/src/components/Button';
import { DateYmdField } from '@/src/components/DateYmdField';
import {
  buildCreateGoalInput,
  defaultGoalTargetDateYmd,
  validateGoalCreateForm,
} from '@/src/features/goals/buildCreateGoal';
import type { GoalType } from '@/src/features/goals/types';
import { useCreateGoalMutation } from '@/src/features/goals/useGoals';
import { useKeyboardOverlap } from '@/src/hooks/useKeyboardOverlap';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { APP_HREFS } from '@/src/linking/appHrefs';
import { useThemeColors } from '@/src/theme/useThemeColors';

const TYPES: { id: GoalType; label: string; hint: string }[] = [
  { id: 'EVENT', label: 'Race / event', hint: 'Train toward a date on the calendar' },
  { id: 'PERFORMANCE', label: 'Performance', hint: 'FTP, pace, or another metric' },
  { id: 'CONSISTENCY', label: 'Consistency', hint: 'Show up week after week' },
  { id: 'BODY_COMPOSITION', label: 'Body composition', hint: 'Weight or body-fat target' },
];

const PRIORITIES: { id: 'LOW' | 'MEDIUM' | 'HIGH'; label: string }[] = [
  { id: 'LOW', label: 'Low' },
  { id: 'MEDIUM', label: 'Medium' },
  { id: 'HIGH', label: 'High' },
];

export default function NewGoalScreen() {
  const theme = useThemeColors();
  const createGoal = useCreateGoalMutation();
  const { containerRef, overlap } = useKeyboardOverlap();
  const [type, setType] = useState<GoalType>('EVENT');
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState(() => defaultGoalTargetDateYmd());
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [description, setDescription] = useState('');
  const [metric, setMetric] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [startValue, setStartValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const showMetricFields = type === 'PERFORMANCE' || type === 'BODY_COMPOSITION';

  const values = useMemo(
    () => ({
      type,
      title,
      targetDate,
      priority,
      description,
      metric,
      targetValue,
      startValue,
    }),
    [type, title, targetDate, priority, description, metric, targetValue, startValue]
  );

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
      hapticSuccess();
      router.replace(APP_HREFS.goalDetail(goal.id) as Href);
    } catch (err) {
      hapticError();
      setError(friendlyError(err, 'Could not create goal'));
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'New goal', headerShown: true }} />
      <View ref={containerRef} testID="goal-create-screen" className="flex-1 bg-surface">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pt-4"
          contentContainerStyle={{ paddingBottom: 40 + overlap }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-sm text-text-muted">
            Add a goal here. Edit, delete, and AI tools stay on Coach Watts web.
          </Text>

          <View className="mt-6 gap-2">
            {TYPES.map((item) => {
              const selected = type === item.id;
              return (
                <AnimatedPressable
                  key={item.id}
                  testID={`goal-create-type-${item.id}`}
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
            testID="goal-create-title"
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
              testID="goal-create-target-date"
            />
          </View>

          <Text className="mt-4 text-sm font-medium text-text-muted">Priority</Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {PRIORITIES.map((item) => {
              const selected = priority === item.id;
              return (
                <AnimatedPressable
                  key={item.id}
                  testID={`goal-create-priority-${item.id}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  hitSlop={8}
                  onPress={() => {
                    hapticLight();
                    setPriority(item.id);
                  }}
                  className={`rounded-xl border px-3 py-2 ${
                    selected ? 'border-brand bg-brand/15' : 'border-border bg-card/60'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selected ? 'text-brand' : 'text-text-primary'
                    }`}
                  >
                    {item.label}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          {showMetricFields ? (
            <>
              <Text className="mt-4 text-sm font-medium text-text-muted">Metric (optional)</Text>
              <TextInput
                testID="goal-create-metric"
                className="mt-2 rounded-xl border border-border-strong bg-card px-4 py-3 text-base text-text-primary"
                placeholder="e.g. FTP"
                placeholderTextColor={theme.textMuted}
                value={metric}
                onChangeText={setMetric}
              />
              <View className="mt-4 flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-text-muted">Start</Text>
                  <TextInput
                    testID="goal-create-start-value"
                    className="mt-2 rounded-xl border border-border-strong bg-card px-4 py-3 text-base text-text-primary"
                    placeholder="250"
                    placeholderTextColor={theme.textMuted}
                    value={startValue}
                    onChangeText={setStartValue}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-text-muted">Target</Text>
                  <TextInput
                    testID="goal-create-target-value"
                    className="mt-2 rounded-xl border border-border-strong bg-card px-4 py-3 text-base text-text-primary"
                    placeholder="280"
                    placeholderTextColor={theme.textMuted}
                    value={targetValue}
                    onChangeText={setTargetValue}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </>
          ) : null}

          <Text className="mt-4 text-sm font-medium text-text-muted">Notes (optional)</Text>
          <TextInput
            testID="goal-create-notes"
            className="mt-2 min-h-[88px] rounded-xl border border-border-strong bg-card px-4 py-3 text-base text-text-primary"
            placeholder="Anything useful for coaching context"
            placeholderTextColor={theme.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />

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
                testID="goal-create-retry"
              >
                <Text className="text-sm font-semibold text-brand">Retry</Text>
              </AnimatedPressable>
            </View>
          ) : null}

          <Button
            className="mt-8"
            label="Create goal"
            testID="goal-create-submit"
            disabled={createGoal.isPending}
            loading={createGoal.isPending}
            onPress={() => void onSubmit()}
          />
        </ScrollView>
      </View>
    </>
  );
}
