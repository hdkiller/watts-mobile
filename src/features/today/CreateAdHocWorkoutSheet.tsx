import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Button } from '@/src/components/Button';
import type { AdHocWorkoutRequest } from '@/src/features/today/adHocApi';
import { validateAdHocForm } from '@/src/features/today/adHocForm';
import { useThemeColors } from '@/src/theme/useThemeColors';

const ACTIVITY_OPTIONS: { label: string; value: AdHocWorkoutRequest['type'] }[] = [
  { label: 'Cycling', value: 'Ride' },
  { label: 'Running', value: 'Run' },
  { label: 'Swimming', value: 'Swim' },
  { label: 'Strength', value: 'WeightTraining' },
];

const INTENSITY_OPTIONS: AdHocWorkoutRequest['intensity'][] = [
  'Recovery',
  'Endurance',
  'Tempo',
  'Threshold',
  'VO2Max',
  'Anaerobic',
];

const DEFAULT_FORM: AdHocWorkoutRequest = {
  type: 'Ride',
  durationMinutes: 60,
  intensity: 'Endurance',
  notes: '',
};

function ChipRow<T extends string>({
  options,
  value,
  onChange,
  labelFor,
}: {
  options: T[];
  value: T;
  onChange: (next: T) => void;
  labelFor?: (option: T) => string;
}) {
  return (
    <View className="mt-2 flex-row flex-wrap gap-2">
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            className={`rounded-full px-3 py-1.5 ${
              selected ? 'bg-brand' : 'border border-border-strong bg-card'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${selected ? 'text-ink' : 'text-text-body'}`}
            >
              {labelFor ? labelFor(option) : option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function CreateAdHocWorkoutSheet({
  visible,
  submitting = false,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: AdHocWorkoutRequest) => void;
}) {
  const theme = useThemeColors();
  const [form, setForm] = useState<AdHocWorkoutRequest>(DEFAULT_FORM);
  const [durationText, setDurationText] = useState('60');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setForm(DEFAULT_FORM);
      setDurationText('60');
      setFormError(null);
    }
  }, [visible]);

  const submit = () => {
    const result = validateAdHocForm({
      type: form.type,
      durationText,
      intensity: form.intensity,
      notes: form.notes,
    });
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setFormError(null);
    onSubmit(result.payload);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-surface">
        <View className="flex-row items-start justify-between border-b border-border px-5 py-4">
          <View className="min-w-0 flex-1 pr-3">
            <Text className="text-xl font-semibold text-text-primary">Generate Ad-Hoc Workout</Text>
            <Text className="mt-1 text-sm leading-5 text-text-muted">
              Create a custom workout for today instantly.
            </Text>
          </View>
          <Pressable onPress={onClose} className="active:opacity-70" hitSlop={8} disabled={submitting}>
            <Text className="text-sm font-semibold text-brand">Cancel</Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" contentContainerClassName="px-5 pb-10 pt-5">
          <Text className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Activity Type
          </Text>
          <Text className="mt-1 text-sm text-text-muted">What kind of session is this?</Text>
          <ChipRow
            options={ACTIVITY_OPTIONS.map((o) => o.value)}
            value={form.type}
            onChange={(type) => setForm((prev) => ({ ...prev, type }))}
            labelFor={(value) => ACTIVITY_OPTIONS.find((o) => o.value === value)?.label ?? value}
          />

          <Text className="mt-5 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Duration
          </Text>
          <Text className="mt-1 text-sm text-text-muted">Target time in minutes</Text>
          <TextInput
            className="mt-2 rounded-xl border border-border-strong bg-card px-3 py-3 text-base text-text-primary"
            keyboardType="number-pad"
            value={durationText}
            onChangeText={setDurationText}
            editable={!submitting}
            placeholder="60"
            placeholderTextColor={theme.textMuted}
          />

          <Text className="mt-5 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Intensity
          </Text>
          <Text className="mt-1 text-sm text-text-muted">Effort level for the session</Text>
          <ChipRow
            options={INTENSITY_OPTIONS}
            value={form.intensity}
            onChange={(intensity) => setForm((prev) => ({ ...prev, intensity }))}
          />

          <Text className="mt-5 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Instructions / Focus
          </Text>
          <Text className="mt-1 text-sm text-text-muted">Any specific intervals or goals?</Text>
          <TextInput
            className="mt-2 min-h-[100px] rounded-xl border border-border-strong bg-card px-3 py-3 text-base text-text-primary"
            multiline
            textAlignVertical="top"
            value={form.notes}
            onChangeText={(notes) => setForm((prev) => ({ ...prev, notes }))}
            editable={!submitting}
            placeholder="e.g. 'Focus on high cadence', 'Hill repeats', 'Upper body focus'"
            placeholderTextColor={theme.textMuted}
          />

          {formError ? <Text className="mt-3 text-sm text-red-400">{formError}</Text> : null}
        </ScrollView>

        <View className="gap-3 border-t border-border px-5 py-4">
          <Button label="Generate Workout" onPress={submit} loading={submitting} />
          <Button variant="secondary" label="Cancel" onPress={onClose} disabled={submitting} />
        </View>
      </View>
    </Modal>
  );
}
