/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: docs/DESIGN.md · designed-as-app
 * Goals lite create — minimum fields; EVENT always sends eventData.
 */
import { router, Stack, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { Button } from '@/src/components/Button';
import {
  buildCreateGoalInput,
  defaultGoalTargetDateYmd,
  validateGoalCreateForm,
} from '@/src/features/goals/buildCreateGoal';
import type { GoalType } from '@/src/features/goals/types';
import { useCreateGoalMutation } from '@/src/features/goals/useGoals';
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
  const [type, setType] = useState<GoalType>('EVENT');
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState(defaultGoalTargetDateYmd);
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
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="px-6 pb-10 pt-4"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-sm text-text-muted">
          Add a goal here. Edit, delete, and AI tools stay on Coach Watts web.
        </Text>

        <View className="mt-6 gap-2">
          {TYPES.map((item) => {
            const selected = type === item.id;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  hapticLight();
                  setType(item.id);
                }}
                className={`rounded-xl border p-4 ${selected ? 'border-brand bg-card' : 'border-border bg-card/60'}`}
              >
                <Text className="text-base font-medium text-text-primary">{item.label}</Text>
                <Text className="mt-1 text-sm text-text-muted">{item.hint}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mt-6 text-sm font-medium text-text-muted">Goal title</Text>
        <TextInput
          className="mt-2 rounded-xl border border-border bg-card px-4 py-3 text-base text-text-primary"
          placeholder="e.g. Autumn gran fondo"
          placeholderTextColor={theme.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        <Text className="mt-4 text-sm font-medium text-text-muted">Target date (YYYY-MM-DD)</Text>
        <TextInput
          className="mt-2 rounded-xl border border-border bg-card px-4 py-3 text-base text-text-primary"
          placeholder="2026-10-15"
          placeholderTextColor={theme.textMuted}
          value={targetDate}
          onChangeText={setTargetDate}
          autoCapitalize="none"
        />

        <Text className="mt-4 text-sm font-medium text-text-muted">Priority</Text>
        <View className="mt-2 flex-row flex-wrap gap-2">
          {PRIORITIES.map((item) => {
            const selected = priority === item.id;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  hapticLight();
                  setPriority(item.id);
                }}
                className={`rounded-lg border px-3 py-2 ${selected ? 'border-brand bg-card' : 'border-border bg-card/60'}`}
              >
                <Text className="text-sm font-medium text-text-primary">{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {showMetricFields ? (
          <>
            <Text className="mt-4 text-sm font-medium text-text-muted">Metric (optional)</Text>
            <TextInput
              className="mt-2 rounded-xl border border-border bg-card px-4 py-3 text-base text-text-primary"
              placeholder="e.g. FTP"
              placeholderTextColor={theme.textMuted}
              value={metric}
              onChangeText={setMetric}
            />
            <View className="mt-4 flex-row gap-3">
              <View className="flex-1">
                <Text className="text-sm font-medium text-text-muted">Start</Text>
                <TextInput
                  className="mt-2 rounded-xl border border-border bg-card px-4 py-3 text-base text-text-primary"
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
                  className="mt-2 rounded-xl border border-border bg-card px-4 py-3 text-base text-text-primary"
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
          className="mt-2 min-h-[88px] rounded-xl border border-border bg-card px-4 py-3 text-base text-text-primary"
          placeholder="Anything useful for coaching context"
          placeholderTextColor={theme.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        {error ? <Text className="mt-4 text-sm text-red-400">{error}</Text> : null}

        <Button
          className="mt-8"
          label="Create goal"
          disabled={createGoal.isPending}
          loading={createGoal.isPending}
          onPress={() => void onSubmit()}
        />
      </ScrollView>
    </>
  );
}
