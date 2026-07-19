import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  applyTimePreset,
  emptyRecoveryEventForm,
  eventTypeBadgeLabel,
  formFromRecoveryItem,
  isDescriptionValid,
  toJourneyPayload,
} from '@/src/features/recovery/mapRecovery';
import {
  DESCRIPTION_MAX,
  JOURNEY_EVENT_OPTIONS,
  SEVERITY_PRESETS,
  optionById,
} from '@/src/features/recovery/taxonomy';
import {
  useActiveRecoveryQuery,
  useCreateJourneyEvent,
  useDeleteJourneyEvent,
  useUpdateJourneyEvent,
} from '@/src/features/recovery/useRecovery';
import type {
  JourneyEventOptionId,
  RecoveryEventFormValues,
  SeverityPresetId,
  TimePresetId,
} from '@/src/features/recovery/types';
import { Colors } from '@/src/theme/colors';

const TIME_PRESETS: { id: TimePresetId; label: string }[] = [
  { id: 'now', label: 'Now' },
  { id: 'earlier-today', label: 'Earlier today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'custom', label: 'Custom' },
];

export default function RecoveryEventScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const sourceRecordId = typeof params.id === 'string' ? params.id : undefined;
  const isEdit = Boolean(sourceRecordId);

  const { data: activeItems, isLoading } = useActiveRecoveryQuery();
  const createMutation = useCreateJourneyEvent();
  const updateMutation = useUpdateJourneyEvent();
  const deleteMutation = useDeleteJourneyEvent();

  const existing = useMemo(
    () => activeItems?.find((item) => item.sourceRecordId === sourceRecordId) ?? null,
    [activeItems, sourceRecordId]
  );

  const [values, setValues] = useState<RecoveryEventFormValues>(emptyRecoveryEventForm());
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(!isEdit);

  useEffect(() => {
    if (!isEdit) {
      setValues(emptyRecoveryEventForm());
      setHydrated(true);
      return;
    }
    if (existing) {
      setValues(formFromRecoveryItem(existing));
      setHydrated(true);
    }
  }, [isEdit, existing]);

  const selectedOption = optionById(values.optionId);
  const pending =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const canSave = isDescriptionValid(values.description) && !pending;

  const patch = <K extends keyof RecoveryEventFormValues>(key: K, value: RecoveryEventFormValues[K]) => {
    setError(null);
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const onSelectTimePreset = (preset: TimePresetId) => {
    setError(null);
    setValues((prev) => ({
      ...prev,
      timePreset: preset,
      localTimestamp: preset === 'custom' ? prev.localTimestamp : applyTimePreset(preset),
    }));
  };

  const onSave = async () => {
    if (!isDescriptionValid(values.description)) {
      setError(`Notes must be ${DESCRIPTION_MAX} characters or fewer.`);
      return;
    }
    setError(null);
    try {
      const payload = toJourneyPayload(values);
      if (isEdit && sourceRecordId) {
        await updateMutation.mutateAsync({ id: sourceRecordId, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const onDelete = () => {
    if (!sourceRecordId || !existing?.deletable) return;
    Alert.alert('Delete recovery event?', 'This removes the event from your recovery context.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteMutation.mutateAsync(sourceRecordId);
              router.back();
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Delete failed');
            }
          })();
        },
      },
    ]);
  };

  if (isEdit && isLoading && !hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark">
        <ActivityIndicator color={Colors.brand} />
      </View>
    );
  }

  if (isEdit && hydrated && !existing) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark px-6">
        <Text className="text-center text-base text-ink-muted">
          This recovery event is no longer available.
        </Text>
        <Pressable className="mt-4" onPress={() => router.back()}>
          <Text className="font-semibold text-brand">Go back</Text>
        </Pressable>
      </View>
    );
  }

  if (isEdit && existing && !existing.editable) {
    return (
      <View className="flex-1 bg-surface-dark px-6 pt-4">
        <Text className="text-2xl font-semibold text-white">{existing.label}</Text>
        <Text className="mt-2 text-sm text-ink-muted">
          Imported context is read-only. Open the web app to review the source.
        </Text>
        <Text className="mt-4 text-base text-zinc-200">
          {existing.description || 'No additional context provided.'}
        </Text>
        <Pressable
          className="mt-8 items-center rounded-xl border border-zinc-700 py-3.5"
          onPress={() => router.back()}
        >
          <Text className="text-base font-semibold text-white">Close</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface-dark"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12 pt-4">
        <Text className="text-2xl font-semibold text-white">
          {isEdit ? 'Edit recovery event' : 'Log recovery event'}
        </Text>
        <Text className="mt-2 text-base text-ink-muted">
          Capture what helps explain unusual recovery, sleep, or training response.
        </Text>

        <Text className="mb-2 mt-6 text-xs font-semibold uppercase tracking-widest text-ink-muted">
          What happened?
        </Text>
        <View className="gap-2">
          {JOURNEY_EVENT_OPTIONS.map((option) => {
            const active = values.optionId === option.id;
            return (
              <Pressable
                key={option.id}
                className={`rounded-xl border px-4 py-3 ${
                  active ? 'border-brand bg-brand/10' : 'border-zinc-800 bg-zinc-900/60'
                }`}
                onPress={() => patch('optionId', option.id as JourneyEventOptionId)}
              >
                <Text className="text-sm font-semibold text-white">{option.title}</Text>
                <Text className="mt-1 text-xs text-ink-muted">{option.subtitle}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mt-3 text-xs text-ink-muted">
          Logged as {eventTypeBadgeLabel(selectedOption.eventType).toLowerCase()}
        </Text>

        <Text className="mb-2 mt-6 text-xs font-semibold uppercase tracking-widest text-ink-muted">
          How much did it affect you?
        </Text>
        <View className="gap-2">
          {SEVERITY_PRESETS.map((level) => {
            const active = values.severityPreset === level.id;
            return (
              <Pressable
                key={level.id}
                className={`rounded-xl border px-4 py-3 ${
                  active ? 'border-brand bg-brand/10' : 'border-zinc-800 bg-zinc-900/60'
                }`}
                onPress={() => patch('severityPreset', level.id as SeverityPresetId)}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-white">{level.label}</Text>
                  <Text className="text-xs text-ink-muted">{level.value}/10</Text>
                </View>
                <Text className="mt-1 text-xs text-ink-muted">{level.description}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mb-2 mt-6 text-xs font-semibold uppercase tracking-widest text-ink-muted">
          When did this happen?
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {TIME_PRESETS.map((preset) => {
            const active = values.timePreset === preset.id;
            return (
              <Pressable
                key={preset.id}
                className={`rounded-full border px-3 py-2 ${
                  active ? 'border-brand bg-brand/10' : 'border-zinc-700'
                }`}
                onPress={() => onSelectTimePreset(preset.id)}
              >
                <Text className={`text-xs font-semibold ${active ? 'text-brand' : 'text-white'}`}>
                  {preset.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          className="mt-3 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white"
          placeholderTextColor={Colors.textMuted}
          placeholder="YYYY-MM-DDTHH:mm"
          value={values.localTimestamp}
          onChangeText={(text) => {
            setError(null);
            setValues((prev) => ({ ...prev, timePreset: 'custom', localTimestamp: text }));
          }}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text className="mb-2 mt-6 text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Tell Coach Watts more
        </Text>
        <TextInput
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white"
          placeholderTextColor={Colors.textMuted}
          placeholder="Symptoms, trigger, what changed…"
          value={values.description}
          onChangeText={(text) => patch('description', text)}
          multiline
          style={{ minHeight: 100, textAlignVertical: 'top' }}
        />
        <Text className="mt-1 text-xs text-ink-muted">
          {values.description.length}/{DESCRIPTION_MAX}
        </Text>

        {error ? <Text className="mt-4 text-sm text-red-400">{error}</Text> : null}

        <Pressable
          className="mt-6 items-center rounded-xl bg-brand-action py-3.5 active:opacity-80"
          onPress={() => void onSave()}
          disabled={!canSave}
        >
          {createMutation.isPending || updateMutation.isPending ? (
            <ActivityIndicator color="#09090b" />
          ) : (
            <Text className="text-base font-semibold text-ink">
              {isEdit ? 'Save changes' : 'Log event'}
            </Text>
          )}
        </Pressable>

        {isEdit && existing?.deletable ? (
          <Pressable
            className="mt-3 items-center rounded-xl border border-red-900/60 py-3.5"
            onPress={onDelete}
            disabled={pending}
          >
            {deleteMutation.isPending ? (
              <ActivityIndicator color="#f87171" />
            ) : (
              <Text className="text-base font-semibold text-red-400">Delete</Text>
            )}
          </Pressable>
        ) : null}

        <Pressable
          className="mt-3 items-center rounded-xl border border-zinc-700 py-3.5"
          onPress={() => router.back()}
        >
          <Text className="text-base font-semibold text-white">Cancel</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
