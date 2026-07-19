import { router } from 'expo-router';
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

export default function LogScreen() {
  const { data: todayWellness, isLoading } = useTodayWellnessQuery();
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

  if (isLoading && !todayWellness) {
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
          Quick wellness check-in for today. Save, then head back to Today.
        </Text>

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

        <Pressable
          className="mt-3 items-center rounded-xl border border-zinc-700 py-3.5"
          onPress={() => router.push('/(app)/(tabs)/today')}
        >
          <Text className="text-base font-semibold text-white">Back to Today</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
