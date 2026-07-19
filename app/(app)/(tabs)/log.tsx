import { router, useLocalSearchParams, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { friendlyError } from '@/src/api/errors';
import {
  emptyLogForm,
  formFromWellness,
  formHasContent,
  toWellnessPayload,
} from '@/src/features/log/mapLogForm';
import { applyHealthPrefill } from '@/src/features/log/applyHealthPrefill';
import { fetchHealthPrefill } from '@/src/features/log/healthPrefill';
import { Button } from '@/src/components/Button';
import { useSaveWellnessCheckin, useTodayWellnessQuery } from '@/src/features/log/useLog';
import type { LogFormValues } from '@/src/features/log/types';
import { NutritionSection } from '@/src/features/nutrition/NutritionSection';
import { isNutritionTrackingEnabled, weightUnit } from '@/src/features/profile/mapProfile';
import { useAthleteProfileQuery } from '@/src/features/profile/useProfile';
import { useActiveRecoveryQuery } from '@/src/features/recovery/useRecovery';
import type { RecoveryContextItem } from '@/src/features/recovery/types';
import { useKeyboardOverlap } from '@/src/hooks/useKeyboardOverlap';
import { hapticError, hapticSuccess } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';

type LogSection = 'recovery' | 'wellness' | 'nutrition';

const READINESS_CHIPS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const;
const SLEEP_QUALITY_CHIPS = ['1', '2', '3', '4', '5'] as const;
const SAVED_FLASH_MS = 2000;

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

function ChipRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <View className="mt-4">
      <Text className="mb-2 text-sm text-ink-muted">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className={`min-w-[40px] items-center rounded-full border px-3 py-2 ${
                active ? 'border-brand bg-brand/10' : 'border-zinc-700'
              }`}
              onPress={() => onChange(active ? '' : option)}
            >
              <Text className={`text-xs font-semibold ${active ? 'text-brand' : 'text-white'}`}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function SleepHoursField({
  value,
  onChangeText,
  onStep,
}: {
  value: string;
  onChangeText: (v: string) => void;
  onStep: (delta: number) => void;
}) {
  return (
    <View className="mt-4">
      <Text className="mb-2 text-sm text-ink-muted">Sleep hours</Text>
      <View className="flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Decrease sleep hours by 0.5"
          className="h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 active:opacity-80"
          onPress={() => onStep(-0.5)}
        >
          <Text className="text-lg font-semibold text-white">−</Text>
        </Pressable>
        <TextInput
          className="min-h-12 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-center text-base text-white"
          placeholderTextColor={Colors.textMuted}
          placeholder="7.5"
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Increase sleep hours by 0.5"
          className="h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 active:opacity-80"
          onPress={() => onStep(0.5)}
        >
          <Text className="text-lg font-semibold text-white">+</Text>
        </Pressable>
      </View>
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
      accessibilityRole="button"
      accessibilityLabel={
        readOnly
          ? `${item.label}${item.severity != null ? `, severity ${item.severity} of 10` : ''}, read-only`
          : undefined
      }
      className="mr-2 mt-2 flex-row items-center rounded-full border border-zinc-700 bg-zinc-900 px-3 py-2 active:opacity-80"
      onPress={() => openRecoveryEvent(item)}
    >
      <Text className="text-xs font-semibold text-white">
        {item.label}
        {item.severity != null ? ` · ${item.severity}/10` : ''}
      </Text>
      {readOnly ? (
        Platform.OS === 'ios' ? (
          <SymbolView name="eye" size={11} tintColor={Colors.textMuted} style={{ marginLeft: 5 }} />
        ) : (
          <Text className="ml-1 text-[10px] text-ink-muted" accessibilityElementsHidden>
            👁
          </Text>
        )
      ) : null}
    </Pressable>
  );
}

function parseLogSection(value: string | string[] | undefined): LogSection | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'recovery' || raw === 'wellness' || raw === 'nutrition') return raw;
  return null;
}

function stepSleepHours(current: string, delta: number): string {
  const parsed = Number(current.trim());
  const base = Number.isFinite(parsed) ? parsed : 0;
  const next = Math.max(0, Math.round((base + delta) * 10) / 10);
  return String(next);
}

export default function LogScreen() {
  const params = useLocalSearchParams<{ section?: string | string[] }>();
  const targetSection = parseLogSection(params.section);
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Partial<Record<LogSection, number>>>({});
  const scrolledForSection = useRef<string | null>(null);
  const savedFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { containerRef, overlap } = useKeyboardOverlap();

  const { data: athleteProfile } = useAthleteProfileQuery();
  const nutritionEnabled = isNutritionTrackingEnabled(athleteProfile);
  const weightUnitLabel = weightUnit(athleteProfile);
  const resolvedSection =
    targetSection === 'nutrition' && !nutritionEnabled ? null : targetSection;

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
  const [wasPrefilled, setWasPrefilled] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [healthBusy, setHealthBusy] = useState(false);
  const [healthHint, setHealthHint] = useState<string | null>(null);

  useEffect(() => {
    if (todayWellness) {
      const next = formFromWellness(todayWellness);
      setValues(next);
      setWasPrefilled(formHasContent(next));
    }
  }, [todayWellness]);

  useEffect(() => {
    return () => {
      if (savedFlashTimer.current) clearTimeout(savedFlashTimer.current);
    };
  }, []);

  useEffect(() => {
    scrolledForSection.current = null;
  }, [resolvedSection]);

  useEffect(() => {
    if (!resolvedSection || wellnessLoading) return;
    if (scrolledForSection.current === resolvedSection) return;
    const y = sectionOffsets.current[resolvedSection];
    if (y == null) return;
    scrolledForSection.current = resolvedSection;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
    });
  }, [resolvedSection, wellnessLoading, activeRecovery, todayWellness, nutritionEnabled]);

  const touchForm = () => {
    setJustSaved(false);
    setError(null);
    if (savedFlashTimer.current) {
      clearTimeout(savedFlashTimer.current);
      savedFlashTimer.current = null;
    }
  };

  const update = (key: keyof LogFormValues) => (text: string) => {
    touchForm();
    setValues((prev) => ({ ...prev, [key]: text }));
  };

  const onStepSleepHours = (delta: number) => {
    touchForm();
    setValues((prev) => ({ ...prev, sleepHours: stepSleepHours(prev.sleepHours, delta) }));
  };

  const onPrefillFromHealth = async () => {
    setHealthBusy(true);
    setHealthHint(null);
    setError(null);
    try {
      const prefill = await fetchHealthPrefill();
      if (!prefill) {
        setHealthHint('No sleep or weight found in Health, or permission was denied.');
        return;
      }
      touchForm();
      setValues((prev) =>
        applyHealthPrefill(prev, prefill, {
          weightUnit: weightUnitLabel === 'lbs' ? 'lb' : 'kg',
        })
      );
      setHealthHint('Prefilled from Health — review and save when ready.');
    } catch (err) {
      setError(friendlyError(err, 'Could not read Health data'));
    } finally {
      setHealthBusy(false);
    }
  };

  const onSave = async () => {
    if (!formHasContent(values)) {
      hapticError();
      setError('Enter at least one field before saving.');
      return;
    }
    setError(null);
    try {
      await saveMutation.mutateAsync(toWellnessPayload(values));
      hapticSuccess();
      setWasPrefilled(true);
      setJustSaved(true);
      if (savedFlashTimer.current) clearTimeout(savedFlashTimer.current);
      savedFlashTimer.current = setTimeout(() => {
        setJustSaved(false);
        savedFlashTimer.current = null;
      }, SAVED_FLASH_MS);
    } catch (err) {
      hapticError();
      setError(friendlyError(err, 'Save failed'));
    }
  };

  const rememberSectionOffset = (section: LogSection) => (event: { nativeEvent: { layout: { y: number } } }) => {
    sectionOffsets.current[section] = event.nativeEvent.layout.y;
    if (resolvedSection === section && scrolledForSection.current !== section) {
      scrolledForSection.current = section;
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, event.nativeEvent.layout.y - 8),
          animated: true,
        });
      });
    }
  };

  if (wellnessLoading && !todayWellness) {
    return (
      <SafeAreaView
        edges={{ top: true }}
        style={{ flex: 1, backgroundColor: Colors.background }}
      >
        <View className="flex-1 items-center justify-center bg-surface-dark">
          <ActivityIndicator color={Colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

  const saveLabel = justSaved
    ? '✓ Saved'
    : wasPrefilled
      ? 'Update check-in'
      : 'Save check-in';

  return (
    <SafeAreaView
      edges={{ top: true }}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
    <View ref={containerRef} className="flex-1 bg-surface-dark">
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="px-6 pt-4"
        contentContainerStyle={{ paddingBottom: 48 + overlap }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-2xl font-semibold text-white">Log</Text>
        <Text className="mt-2 text-base text-ink-muted">
          {nutritionEnabled
            ? 'Check in for today, log recovery context, or quick-log nutrition and hydration.'
            : 'Check in for today or log recovery context.'}
        </Text>

        <View onLayout={rememberSectionOffset('recovery')}>
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
                {friendlyError(recoveryErr, 'Could not load recovery context')}
              </Text>
              <Pressable className="mt-2" hitSlop={8} onPress={() => void refetchRecovery()}>
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

          <Button
            variant="secondary"
            className="mt-4"
            label="Log recovery event"
            onPress={() => openRecoveryEvent()}
          />
        </View>

        <View onLayout={rememberSectionOffset('wellness')}>
          <Text className="mb-1 mt-10 text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Daily wellness
          </Text>
          <Text className="text-sm text-ink-muted">Sleep, feel, and notes for today.</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Prefill sleep and weight from Health"
            className="mt-3 self-start py-1 active:opacity-70"
            hitSlop={8}
            disabled={healthBusy}
            onPress={() => void onPrefillFromHealth()}
          >
            <Text className="text-sm font-semibold text-brand">
              {healthBusy ? 'Reading Health…' : 'Prefill from Health'}
            </Text>
          </Pressable>
          {healthHint ? <Text className="mt-1 text-sm text-ink-muted">{healthHint}</Text> : null}

          <ChipRow
            label="Feel / readiness (1–10)"
            options={READINESS_CHIPS}
            value={values.readiness}
            onChange={update('readiness')}
          />
          <SleepHoursField
            value={values.sleepHours}
            onChangeText={update('sleepHours')}
            onStep={onStepSleepHours}
          />
          <ChipRow
            label="Sleep quality (1–5)"
            options={SLEEP_QUALITY_CHIPS}
            value={values.sleepQuality}
            onChange={update('sleepQuality')}
          />
          <Field
            label="Notes"
            value={values.notes}
            onChangeText={update('notes')}
            placeholder="How did you feel this morning?"
            multiline
          />
          <Field
            label={`Weight (${weightUnitLabel}, optional)`}
            value={values.weight}
            onChangeText={update('weight')}
            placeholder={weightUnitLabel}
            keyboardType="decimal-pad"
          />

          {error ? <Text className="mt-4 text-sm text-red-400">{error}</Text> : null}

          <Button
            className="mt-6"
            label={saveLabel}
            onPress={() => {
              if (justSaved) return;
              void onSave();
            }}
            loading={saveMutation.isPending}
            disabled={!formHasContent(values)}
          />
        </View>

        {nutritionEnabled ? (
          <View onLayout={rememberSectionOffset('nutrition')}>
            <NutritionSection />
          </View>
        ) : null}
      </ScrollView>
    </View>
    </SafeAreaView>
  );
}
