import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { friendlyError } from '@/src/api/errors';
import { Button } from '@/src/components/Button';
import { trackActivationEvent } from '@/src/features/activation/analytics';
import { useAdvanceActivationStatus } from '@/src/features/activation/useActivationStatus';
import { createGoal } from '@/src/features/goals/api';
import type { GoalType } from '@/src/features/goals/types';
import { useThemeColors } from '@/src/theme/useThemeColors';

const TYPES: { id: GoalType; label: string; hint: string }[] = [
  { id: 'EVENT', label: 'Race / event', hint: 'Train toward a date on the calendar' },
  { id: 'PERFORMANCE', label: 'Performance', hint: 'FTP, pace, or another metric' },
  { id: 'CONSISTENCY', label: 'Consistency', hint: 'Show up week after week' },
  { id: 'BODY_COMPOSITION', label: 'Body composition', hint: 'Weight or body-fat target' },
];

function defaultTargetDateIso(monthsAhead = 3): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsAhead);
  return d.toISOString();
}

export default function ActivationGoalScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const advance = useAdvanceActivationStatus();
  const [type, setType] = useState<GoalType>('EVENT');
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => title.trim().length >= 2, [title]);

  const onSubmit = async () => {
    setError(null);
    setBusy(true);
    try {
      const dateIso = targetDate ? new Date(`${targetDate}T12:00:00.000Z`).toISOString() : defaultTargetDateIso();
      const goal =
        type === 'EVENT'
          ? await createGoal({
              type,
              title: title.trim(),
              targetDate: dateIso,
              eventData: {
                title: title.trim(),
                date: dateIso,
                type: 'RACE',
              },
            })
          : await createGoal({
              type,
              title: title.trim(),
              targetDate: dateIso,
            });
      trackActivationEvent('activation_goal_created', { type });
      await advance({ mobileActivationStep: 'plan', primaryGoalId: goal.id });
      router.replace('/(activation)/plan');
    } catch (err) {
      setError(friendlyError(err, 'Could not save goal'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']}>
      <ScrollView contentContainerClassName="px-6 pb-10 pt-2" keyboardShouldPersistTaps="handled">
        <Text className="text-2xl font-semibold text-text-primary">What are you training for?</Text>
        <Text className="mt-2 text-base text-text-muted">
          Pick one primary goal. You can refine it later.
        </Text>

        <View className="mt-6 gap-2">
          {TYPES.map((item) => {
            const selected = type === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setType(item.id)}
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

        {error ? <Text className="mt-4 text-sm text-red-400">{error}</Text> : null}

        <Button
          className="mt-8"
          label="Continue"
          disabled={!canSubmit}
          loading={busy}
          onPress={() => void onSubmit()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
