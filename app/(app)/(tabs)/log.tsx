import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  emptyLogForm,
  formFromWellness,
  formHasContent,
  toWellnessPayload,
} from '@/src/features/log/mapLogForm';
import { useSaveWellnessCheckin, useTodayWellnessQuery } from '@/src/features/log/useLog';
import type { LogFormValues } from '@/src/features/log/types';
import { NutritionSection } from '@/src/features/nutrition/NutritionSection';
import { useActiveRecoveryQuery } from '@/src/features/recovery/useRecovery';
import type { RecoveryContextItem } from '@/src/features/recovery/types';
import { Colors } from '@/src/theme/colors';

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
  multiline?: boolean;
}) {
  return (
    <View className="mt-4">
      <Text className="mb-2 text-sm text-ink-muted">{label}</Text>
      <TextInput
        className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white"
        placeholderTextColor={Colors.textMuted}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        style={multiline ? { minHeight: 88, textAlignVertical: 'top' } : undefined}
      />
    </View>
  );
}

function openRecoveryEvent(item?: RecoveryContextItem) {
  if (item) {
    router.push(`/(app)/recovery-event?id=${encodeURIComponent(item.sourceRecordId)}` as Href);
    return;
  }
  router.push('/(app)/recovery-event' as Href);
}

function RecoveryChip({ item }: { item: RecoveryContextItem }) {
  const readOnly = item.sourceType === 'imported' || !item.editable;
  return (
    <Pressable
      className="mr-2 mt-2 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-2 active:opacity-80"
      onPress={() => openRecoveryEvent(item)}
    >
      <Text className="text-xs font-semibold text-white">
        {item.label}
        {item.severity != null ? ` · ${item.severity}/10` : ''}
        {readOnly ? ' · view' : ''}
      </Text>
    </Pressable>
  );
}

export default function LogScreen() {
  const { data: todayWellness, isLoading: wellnessLoading } = useTodayWellnessQuery();
  const {
    data: activeRecovery,
    isLoading: recoveryLoading,
    isError: recoveryError,
    error: recoveryErr,
    refetch: refetchRecovery,
  } = useActiveRecoveryQuery();
  const saveMutation = useSaveWellnessCheckin();
  const [values, setValues] = useState<LogFormValues>(emptyLogForm());
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (todayWellness) {
      setValues(formFromWellness(todayWellness));
    }
  }, [todayWellness]);

  const update = (key: keyof LogFormValues) => (text: string) => {
    setSaved(false);
    setError(null);
    setValues((prev) => ({ ...prev, [key]: text }));
  };

  const onSave = async () => {
    if (!formHasContent(values)) {
      setError('Enter at least one field before saving.');
      return;
    }
    setError(null);
    try {
      await saveMutation.mutateAsync(toWellnessPayload(values));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  if (wellnessLoading && !todayWellness) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark">
        <ActivityIndicator color={Colors.brand} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface-dark"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12 pt-4">
        <Text className="text-2xl font-semibold text-white">Log</Text>
        <Text className="mt-2 text-base text-ink-muted">
          Check in for today, log recovery context, or quick-log nutrition and hydration.
        </Text>

        <Text className="mb-1 mt-8 text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Recovery events
        </Text>
        <Text className="text-sm text-ink-muted">
          Illness, fatigue, sleep, stress — context Coach Watts uses for guidance.
        </Text>

        {recoveryLoading && !activeRecovery ? (
          <ActivityIndicator className="mt-4" color={Colors.brand} />
        ) : null}

        {recoveryError ? (
          <View className="mt-3 rounded-xl border border-red-900/50 bg-red-950/40 p-3">
            <Text className="text-sm text-red-300">
              {recoveryErr instanceof Error
                ? recoveryErr.message
                : 'Could not load recovery context'}
            </Text>
            <Pressable className="mt-2" onPress={() => void refetchRecovery()}>
              <Text className="font-semibold text-brand">Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {!recoveryError && activeRecovery && activeRecovery.length === 0 ? (
          <Text className="mt-3 text-sm text-ink-muted">No active recovery context for today.</Text>
        ) : null}

        {activeRecovery && activeRecovery.length > 0 ? (
          <View className="mt-1 flex-row flex-wrap">
            {activeRecovery.map((item) => (
              <RecoveryChip key={item.id} item={item} />
            ))}
          </View>
        ) : null}

        <Pressable
          className="mt-4 items-center rounded-xl border border-zinc-700 py-3.5 active:opacity-80"
          onPress={() => openRecoveryEvent()}
        >
          <Text className="text-base font-semibold text-white">Log recovery event</Text>
        </Pressable>

        <Text className="mb-1 mt-10 text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Daily wellness
        </Text>
        <Text className="text-sm text-ink-muted">Sleep, feel, and notes for today.</Text>

        <Field
          label="Feel / readiness (1–10)"
          value={values.readiness}
          onChangeText={update('readiness')}
          placeholder="7"
          keyboardType="number-pad"
        />
        <Field
          label="Sleep hours"
          value={values.sleepHours}
          onChangeText={update('sleepHours')}
          placeholder="7.5"
          keyboardType="decimal-pad"
        />
        <Field
          label="Sleep quality (1–5)"
          value={values.sleepQuality}
          onChangeText={update('sleepQuality')}
          placeholder="4"
          keyboardType="number-pad"
        />
        <Field
          label="Notes"
          value={values.notes}
          onChangeText={update('notes')}
          placeholder="How did you feel this morning?"
          multiline
        />
        <Field
          label="Weight (optional)"
          value={values.weight}
          onChangeText={update('weight')}
          placeholder="kg"
          keyboardType="decimal-pad"
        />

        {error ? <Text className="mt-4 text-sm text-red-400">{error}</Text> : null}
        {saved ? (
          <Text className="mt-4 text-sm font-semibold text-green-400">Saved for today.</Text>
        ) : null}

        <Pressable
          className="mt-6 items-center rounded-xl bg-brand-action py-3.5 active:opacity-80"
          onPress={() => void onSave()}
          disabled={saveMutation.isPending || !formHasContent(values)}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator color="#09090b" />
          ) : (
            <Text className="text-base font-semibold text-ink">Save check-in</Text>
          )}
        </Pressable>

        <NutritionSection />

        <Pressable
          className="mt-6 items-center rounded-xl border border-zinc-700 py-3.5"
          onPress={() => router.push('/(app)/(tabs)/today')}
        >
          <Text className="text-base font-semibold text-white">Back to Today</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
