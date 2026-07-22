import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { Button } from '@/src/components/Button';
import { applyHealthPrefill } from '@/src/features/log/applyHealthPrefill';
import { fetchHealthPrefill } from '@/src/features/log/healthPrefill';
import { emptyLogForm, formHasContent, toWellnessPayload } from '@/src/features/log/mapLogForm';
import { SleepDurationInput } from '@/src/features/log/SleepDurationInput';
import { WeightInput } from '@/src/features/log/WeightInput';
import type { LogFormValues } from '@/src/features/log/types';
import { useSaveWellnessCheckin } from '@/src/features/log/useLog';
import {
  getFatigueHelp,
  getMoodLabel,
  getSorenessHelp,
  getStressLabel,
} from '@/src/features/log/wellnessLabels';
import { WellnessScoreCard } from '@/src/features/log/WellnessScoreCard';

import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

import type { WeightUnits } from '@/src/features/profile/types';

type SubjectiveKey = 'mood' | 'stress' | 'fatigue' | 'soreness';

interface WellnessCheckinSheetProps {
  visible: boolean;
  onClose: () => void;
  initialValues?: LogFormValues;
  weightUnits?: WeightUnits;
  weightUnitLabel?: string;
}

export function WellnessCheckinSheet({
  visible,
  onClose,
  initialValues,
  weightUnits = 'Kilograms',
  weightUnitLabel = 'kg',
}: WellnessCheckinSheetProps) {
  const theme = useThemeColors();
  const saveMutation = useSaveWellnessCheckin();

  const [values, setValues] = useState<LogFormValues>(initialValues ?? emptyLogForm());
  const [error, setError] = useState<string | null>(null);
  const [healthBusy, setHealthBusy] = useState(false);
  const [healthHint, setHealthHint] = useState<string | null>(null);
  const [isAutoSynced, setIsAutoSynced] = useState(Boolean(initialValues?.sleepHours));

  useEffect(() => {
    if (initialValues) {
      setValues(initialValues);
      if (initialValues.sleepHours) setIsAutoSynced(true);
    } else {
      // Auto-attempt prefill on open if empty
      void autoPrefill();
    }
  }, [initialValues]);

  const autoPrefill = async () => {
    try {
      const prefill = await fetchHealthPrefill();
      if (prefill?.sleepHours || prefill?.weightKg) {
        setValues((prev) =>
          applyHealthPrefill(prev, prefill, {
            weightUnit: weightUnitLabel === 'lbs' ? 'lb' : 'kg',
          })
        );
        setIsAutoSynced(true);
        setHealthHint('Auto-synced from Health');
      }
    } catch {
      // Silent catch for auto-prefill
    }
  };

  const updateSubjective = (key: SubjectiveKey) => (next: number) => {
    setError(null);
    setValues((prev) => ({ ...prev, [key]: next }));
  };

  const updateField = (key: 'sleepHours' | 'weight' | 'notes') => (text: string) => {
    setError(null);
    setValues((prev) => ({ ...prev, [key]: text }));
  };

  const onStepSleep = (delta: number) => {
    hapticLight();
    const parsed = Number(values.sleepHours.trim());
    const base = Number.isFinite(parsed) ? parsed : 0;
    const next = Math.max(0, Math.round((base + delta) * 10) / 10);
    setValues((prev) => ({ ...prev, sleepHours: String(next) }));
  };

  const onPrefillFromHealth = async () => {
    hapticLight();
    setHealthBusy(true);
    setHealthHint(null);
    setError(null);
    try {
      const prefill = await fetchHealthPrefill();
      if (!prefill) {
        setHealthHint('No sleep or weight found in Health.');
        return;
      }
      setValues((prev) =>
        applyHealthPrefill(prev, prefill, {
          weightUnit: weightUnitLabel === 'lbs' ? 'lb' : 'kg',
        })
      );
      hapticSuccess();
      setHealthHint('Prefilled from Health');
    } catch (err) {
      hapticError();
      setError(friendlyError(err, 'Could not read Health data'));
    } finally {
      setHealthBusy(false);
    }
  };

  const onSave = async () => {
    if (!formHasContent(values)) {
      hapticError();
      setError('Select at least one metric before saving.');
      return;
    }
    setError(null);
    try {
      await saveMutation.mutateAsync(toWellnessPayload(values, undefined, weightUnits));
      hapticSuccess();
      onClose();
    } catch (err) {
      hapticError();
      setError(friendlyError(err, 'Save failed'));
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <Pressable className="rounded-t-3xl bg-surface px-6 pt-4 pb-10" style={{ maxHeight: '90%' }}>
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-border-strong" />

          <View className="flex-row items-center justify-between mb-2">
            <View>
              <Text className="text-xl font-bold text-text-primary">Daily Wellness Check-in</Text>
              <Text className="text-xs text-text-muted">Target completion &lt; 20 seconds</Text>
            </View>

            <Pressable hitSlop={8} onPress={onClose} className="p-1 active:opacity-70">
              <Text className="text-base font-semibold text-text-muted">Cancel</Text>
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled">
            {/* Health Sync Trigger */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Prefill from Health"
              className="mt-2 mb-1 self-start rounded-full border border-border bg-card px-3 py-1.5 active:opacity-70"
              disabled={healthBusy}
              onPress={() => void onPrefillFromHealth()}
            >
              <Text className="text-xs font-semibold text-brand">
                {healthBusy ? 'Reading Health…' : '⚡ Prefill from Health Sync'}
              </Text>
            </Pressable>
            {healthHint ? <Text className="mb-2 text-xs text-text-muted">{healthHint}</Text> : null}

            <WellnessScoreCard
              label="Mood"
              help={getMoodLabel(values.mood ?? 5)}
              value={values.mood}
              tintColor={Colors.brand}
              onChange={updateSubjective('mood')}
            />
            <WellnessScoreCard
              label="Stress"
              help={getStressLabel(values.stress ?? 5)}
              value={values.stress}
              tintColor={Colors.modify}
              onChange={updateSubjective('stress')}
            />
            <WellnessScoreCard
              label="Fatigue"
              help={getFatigueHelp(values.fatigue ?? 5)}
              value={values.fatigue}
              tintColor={theme.textMuted}
              onChange={updateSubjective('fatigue')}
            />
            <WellnessScoreCard
              label="Soreness"
              help={getSorenessHelp(values.soreness ?? 5)}
              value={values.soreness}
              tintColor={Colors.danger}
              onChange={updateSubjective('soreness')}
            />

            <SleepDurationInput
              value={values.sleepHours}
              isAutoSynced={isAutoSynced}
              onChangeText={updateField('sleepHours')}
              onStep={onStepSleep}
            />

            <WeightInput
              value={values.weight}
              unitLabel={weightUnitLabel}
              isAutoSynced={isAutoSynced}
              onChangeText={updateField('weight')}
            />

            {error ? <Text className="mt-3 text-xs text-red-400">{error}</Text> : null}

            <Button
              className="mt-6"
              label="Save Check-in"
              onPress={() => void onSave()}
              loading={saveMutation.isPending}
              disabled={!formHasContent(values)}
            />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
