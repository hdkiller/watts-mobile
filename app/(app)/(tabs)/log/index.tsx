import { Slider } from '@expo/ui/community/slider';
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
import {
  logTabOrder,
  resolveDefaultLogTab,
  type LogSection,
} from '@/src/features/log/logTabPreference';
import {
  clampSubjectiveScore,
  getFatigueHelp,
  getMoodLabel,
  getSorenessHelp,
  getStressLabel,
} from '@/src/features/log/wellnessLabels';
import { Button } from '@/src/components/Button';
import { useSaveWellnessCheckin, useTodayWellnessQuery } from '@/src/features/log/useLog';
import { useLogTabPreference } from '@/src/features/log/useLogTabPreference';
import type { LogFormValues } from '@/src/features/log/types';
import { MeasurementsSection } from '@/src/features/measurements/MeasurementsSection';
import { NutritionSection } from '@/src/features/nutrition/NutritionSection';
import { isNutritionTrackingEnabled, weightUnit } from '@/src/features/profile/mapProfile';
import { useAthleteProfileQuery } from '@/src/features/profile/useProfile';
import { filterActiveToday } from '@/src/features/recovery/mapRecovery';
import { useRecoveryContextQuery } from '@/src/features/recovery/useRecovery';
import type { RecoveryContextItem } from '@/src/features/recovery/types';
import { useKeyboardOverlap } from '@/src/hooks/useKeyboardOverlap';
import { hapticError, hapticSuccess } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';

const TAB_LABELS: Record<LogSection, string> = {
  nutrition: 'Nutrition',
  recovery: 'Recovery',
  wellness: 'Wellness',
  measurements: 'Measure',
};

const SUBJECTIVE_DEFAULT = 5;
const SAVED_FLASH_MS = 2000;

type StringFormKey = 'sleepHours' | 'notes' | 'weight';
type SubjectiveKey = 'mood' | 'stress' | 'fatigue' | 'soreness';

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

function MetricSlider({
  label,
  help,
  value,
  tintColor,
  onChange,
}: {
  label: string;
  help: string;
  value: number | null;
  tintColor: string;
  onChange: (next: number) => void;
}) {
  const display = value ?? SUBJECTIVE_DEFAULT;
  return (
    <View className="mt-5">
      <View className="mb-1 flex-row items-baseline justify-between">
        <Text className="text-sm text-ink-muted">{label}</Text>
        <Text className={`text-sm font-semibold ${value != null ? 'text-white' : 'text-ink-muted'}`}>
          {value != null ? display : '—'}
        </Text>
      </View>
      <Text className="mb-2 text-xs text-ink-muted">{help}</Text>
      <Slider
        value={display}
        minimumValue={1}
        maximumValue={10}
        step={1}
        minimumTrackTintColor={tintColor}
        maximumTrackTintColor="#3f3f46"
        thumbTintColor={tintColor}
        style={{ width: '100%', height: 36 }}
        onValueChange={(next) => onChange(clampSubjectiveScore(next))}
      />
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
  if (
    raw === 'recovery' ||
    raw === 'wellness' ||
    raw === 'nutrition' ||
    raw === 'measurements'
  ) {
    return raw;
  }
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
  const savedFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { containerRef, overlap } = useKeyboardOverlap();

  const { data: athleteProfile } = useAthleteProfileQuery();
  const nutritionEnabled = isNutritionTrackingEnabled(athleteProfile);
  const weightUnitLabel = weightUnit(athleteProfile);
  const { preference: logTabPreference, ready: logTabPreferenceReady } = useLogTabPreference();
  const resolvedSection =
    targetSection === 'nutrition' && !nutritionEnabled ? null : targetSection;

  const [activeTab, setActiveTab] = useState<LogSection>(() =>
    resolveDefaultLogTab('auto', false)
  );
  const userPickedTab = useRef(false);

  const { data: todayWellness, isLoading: wellnessLoading } = useTodayWellnessQuery();
  const {
    data: recoveryItems,
    isLoading: recoveryLoading,
    isError: recoveryError,
    error: recoveryErr,
    refetch: refetchRecovery,
  } = useRecoveryContextQuery();
  const activeToday = recoveryItems ? filterActiveToday(recoveryItems) : undefined;
  const recentOnly =
    recoveryItems && activeToday
      ? recoveryItems.filter((item) => !activeToday.some((a) => a.id === item.id))
      : undefined;
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
    if (resolvedSection) {
      userPickedTab.current = true;
      setActiveTab(resolvedSection);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      });
      return;
    }
    if (!logTabPreferenceReady) return;
    setActiveTab((current) => {
      const order = logTabOrder(nutritionEnabled);
      if (!order.includes(current) || !userPickedTab.current) {
        return resolveDefaultLogTab(logTabPreference, nutritionEnabled);
      }
      return current;
    });
  }, [resolvedSection, logTabPreferenceReady, logTabPreference, nutritionEnabled]);

  const touchForm = () => {
    setJustSaved(false);
    setError(null);
    if (savedFlashTimer.current) {
      clearTimeout(savedFlashTimer.current);
      savedFlashTimer.current = null;
    }
  };

  const update = (key: StringFormKey) => (text: string) => {
    touchForm();
    setValues((prev) => ({ ...prev, [key]: text }));
  };

  const updateSubjective = (key: SubjectiveKey) => (next: number) => {
    touchForm();
    setValues((prev) => ({ ...prev, [key]: next }));
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

  if (wellnessLoading && !todayWellness) {
    return (
      <SafeAreaView
        testID="log-screen"
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

  const tabs = logTabOrder(nutritionEnabled).map((key) => ({
    key,
    label: TAB_LABELS[key],
  }));

  return (
    <SafeAreaView
      testID="log-screen"
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
            ? 'Check in, recovery, nutrition, or body measurements for today.'
            : 'Check in, recovery events, or body measurements for today.'}
        </Text>

        <View className="mt-5 flex-row rounded-xl bg-zinc-900 p-1 border border-zinc-800">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                className="flex-1 items-center justify-center py-2.5 rounded-lg"
                style={
                  active
                    ? {
                        backgroundColor: '#27272a',
                        borderWidth: 1,
                        borderColor: 'rgba(63, 63, 70, 0.8)',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.18,
                        shadowRadius: 1.0,
                        elevation: 1,
                      }
                    : undefined
                }
                onPress={() => {
                  userPickedTab.current = true;
                  setActiveTab(tab.key);
                }}
              >
                <Text
                  className={`text-center text-xs font-semibold ${active ? 'text-brand' : 'text-zinc-400'}`}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {activeTab === 'recovery' && (
          <View className="mt-6">
            <Text className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-muted">
              Recovery events
            </Text>
            <Text className="text-sm text-ink-muted">
              Illness, fatigue, sleep, stress — context Coach Watts uses for guidance.
            </Text>

            {recoveryLoading && !recoveryItems ? (
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

            {!recoveryError && recoveryItems ? (
              recoveryItems.length === 0 ? (
                <Text className="mt-4 text-sm text-ink-muted">
                  No recovery context in the last 7 days. Log an event when something affects
                  training.
                </Text>
              ) : (
                <>
                  <Text className="mt-5 text-xs font-semibold uppercase tracking-widest text-ink-muted">
                    Active today
                  </Text>
                  {activeToday && activeToday.length > 0 ? (
                    <View className="mt-1 flex-row flex-wrap">
                      {activeToday.map((item) => (
                        <RecoveryChip key={item.id} item={item} />
                      ))}
                    </View>
                  ) : (
                    <Text className="mt-2 text-sm text-ink-muted">
                      Nothing active for today yet.
                    </Text>
                  )}

                  {recentOnly && recentOnly.length > 0 ? (
                    <>
                      <Text className="mt-5 text-xs font-semibold uppercase tracking-widest text-ink-muted">
                        Recent
                      </Text>
                      <View className="mt-1 flex-row flex-wrap">
                        {recentOnly.map((item) => (
                          <RecoveryChip key={item.id} item={item} />
                        ))}
                      </View>
                    </>
                  ) : null}
                </>
              )
            ) : null}

            <Button
              variant="secondary"
              className="mt-6"
              label="Log recovery event"
              onPress={() => openRecoveryEvent()}
            />
          </View>
        )}

        {activeTab === 'wellness' && (
          <View className="mt-6">
            <Text className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-muted">
              Daily logs & subjective metrics
            </Text>
            <Text className="text-sm text-ink-muted">
              Mood, stress, fatigue, and soreness — plus sleep and weight for today.
            </Text>

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

            <MetricSlider
              label="Mood"
              help={getMoodLabel(values.mood ?? SUBJECTIVE_DEFAULT)}
              value={values.mood}
              tintColor={Colors.modify}
              onChange={updateSubjective('mood')}
            />
            <MetricSlider
              label="Stress"
              help={getStressLabel(values.stress ?? SUBJECTIVE_DEFAULT)}
              value={values.stress}
              tintColor={Colors.modify}
              onChange={updateSubjective('stress')}
            />
            <MetricSlider
              label="Fatigue"
              help={getFatigueHelp(values.fatigue ?? SUBJECTIVE_DEFAULT)}
              value={values.fatigue}
              tintColor="#a1a1aa"
              onChange={updateSubjective('fatigue')}
            />
            <MetricSlider
              label="Soreness"
              help={getSorenessHelp(values.soreness ?? SUBJECTIVE_DEFAULT)}
              value={values.soreness}
              tintColor={Colors.danger}
              onChange={updateSubjective('soreness')}
            />

            <SleepHoursField
              value={values.sleepHours}
              onChangeText={update('sleepHours')}
              onStep={onStepSleepHours}
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
        )}

        {activeTab === 'measurements' && (
          <View className="mt-6">
            <MeasurementsSection />
          </View>
        )}

        {activeTab === 'nutrition' && nutritionEnabled && (
          <View className="mt-6">
            <NutritionSection />
          </View>
        )}
      </ScrollView>
    </View>
    </SafeAreaView>
  );
}
