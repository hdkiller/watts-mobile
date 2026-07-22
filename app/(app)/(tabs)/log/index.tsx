import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { friendlyError } from '@/src/api/errors';
import { AppSymbol } from '@/src/components/AppSymbol';
import { Button } from '@/src/components/Button';
import { applyHealthPrefill } from '@/src/features/log/applyHealthPrefill';

import { fetchHealthPrefill } from '@/src/features/log/healthPrefill';
import {
  logTabOrder,
  resolveDefaultLogTab,
  type LogSection,
} from '@/src/features/log/logTabPreference';
import {
  emptyLogForm,
  formFromWellness,
  formHasContent,
  toWellnessPayload,
} from '@/src/features/log/mapLogForm';
import { SleepDurationInput } from '@/src/features/log/SleepDurationInput';
import type { LogFormValues } from '@/src/features/log/types';
import { useSaveWellnessCheckin, useTodayWellnessQuery } from '@/src/features/log/useLog';
import { useLogTabPreference } from '@/src/features/log/useLogTabPreference';
import {
  getFatigueHelp,
  getMoodLabel,
  getSorenessHelp,
  getStressLabel,
} from '@/src/features/log/wellnessLabels';
import { WellnessScoreCard } from '@/src/features/log/WellnessScoreCard';
import { MeasurementsSection } from '@/src/features/measurements/MeasurementsSection';
import { NutritionSection } from '@/src/features/nutrition/NutritionSection';
import { isNutritionTrackingEnabled, weightUnit } from '@/src/features/profile/mapProfile';
import { useAthleteProfileQuery } from '@/src/features/profile/useProfile';
import { filterActiveToday } from '@/src/features/recovery/mapRecovery';
import { RecoveryEventCard } from '@/src/features/recovery/RecoveryEventCard';
import type { RecoveryContextItem } from '@/src/features/recovery/types';
import { useRecoveryContextQuery } from '@/src/features/recovery/useRecovery';

import { useKeyboardOverlap } from '@/src/hooks/useKeyboardOverlap';
import { useTabScrollPadding } from '@/src/hooks/useTabScrollPadding';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

const TAB_CONFIG: Record<
  LogSection,
  { label: string; sf: string; emoji: string }
> = {
  wellness: { label: 'Wellness', sf: 'bolt.fill', emoji: '⚡' },
  recovery: { label: 'Recovery', sf: 'cross.case.fill', emoji: '🩹' },
  nutrition: { label: 'Nutrition', sf: 'fork.knife', emoji: '🍎' },
  measurements: { label: 'Measurements', sf: 'ruler.fill', emoji: '📏' },
};

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
  const theme = useThemeColors();
  return (
    <View className="mt-4 rounded-xl border border-border bg-card p-4">
      <Text className="mb-2 text-sm font-semibold text-text-primary">{label}</Text>
      <TextInput
        className="rounded-xl border border-border-strong bg-surface px-4 py-3 text-base text-text-primary"
        placeholderTextColor={theme.textMuted}
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
  const theme = useThemeColors();

  const params = useLocalSearchParams<{ section?: string | string[] }>();
  const targetSection = parseLogSection(params.section);
  const scrollRef = useRef<ScrollView>(null);
  const savedFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { containerRef, overlap } = useKeyboardOverlap();
  const tabBottomPad = useTabScrollPadding(overlap);

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
  const [savedOffline, setSavedOffline] = useState(false);
  const [healthBusy, setHealthBusy] = useState(false);
  const [healthHint, setHealthHint] = useState<string | null>(null);
  const formDirtyRef = useRef(false);
  const weightUnits = athleteProfile?.weightUnits ?? 'Kilograms';

  useEffect(() => {
    if (todayWellness && !formDirtyRef.current) {
      const next = formFromWellness(todayWellness, weightUnits);
      setValues(next);
      setWasPrefilled(formHasContent(next));
    }
  }, [todayWellness, weightUnits]);

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
    formDirtyRef.current = true;
    setJustSaved(false);
    setSavedOffline(false);
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
    hapticLight();
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
      hapticSuccess();
      setHealthHint('Prefilled from Health — review and save when ready.');
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
      setError('Enter at least one field before saving.');
      return;
    }
    setError(null);
    setSavedOffline(false);
    try {
      const result = await saveMutation.mutateAsync(
        toWellnessPayload(values, undefined, weightUnits)
      );
      hapticSuccess();
      formDirtyRef.current = false;
      setWasPrefilled(true);
      setJustSaved(true);
      setSavedOffline(result.queuedOffline);
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
        style={{ flex: 1, backgroundColor: theme.surface }}
      >
        <View className="flex-1 items-center justify-center bg-surface">
          <ActivityIndicator color={Colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

  const saveLabel = justSaved
    ? savedOffline
      ? '✓ Saved offline'
      : '✓ Saved'
    : wasPrefilled
      ? 'Update check-in'
      : 'Save check-in';

  const tabs = logTabOrder(nutritionEnabled).map((key) => ({
    key,
    ...TAB_CONFIG[key],
  }));

  return (
    <SafeAreaView
      testID="log-screen"
      edges={{ top: true }}
      style={{ flex: 1, backgroundColor: theme.surface }}
    >
      <View ref={containerRef} className="flex-1 bg-surface">
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="px-6 pt-4"
          contentContainerStyle={{ paddingBottom: tabBottomPad }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header & Title */}
          <Text className="text-2xl font-semibold text-text-primary">Log & Check-in</Text>
          <Text className="mt-1 text-base text-text-muted">
            Track daily wellness, recovery context, macros, and body metrics.
          </Text>

          {/* Daily Status Snapshot Banner */}
          <View className="mt-4 flex-row items-center justify-between rounded-xl border border-border bg-card p-3.5">
            <View className="flex-row items-center gap-2.5">
              <View
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: wasPrefilled ? Colors.brand : Colors.modify,
                }}
              />
              <Text className="text-xs font-semibold text-text-primary">
                Today's Status:{' '}
                <Text className="font-normal text-text-muted">
                  {wasPrefilled ? 'Check-in completed' : 'Check-in pending'}
                </Text>
              </Text>
            </View>

            {activeToday && activeToday.length > 0 ? (
              <View className="rounded-full bg-border px-2.5 py-1">
                <Text className="text-[10px] font-bold text-text-primary">
                  {activeToday.length} Active Context
                </Text>
              </View>
            ) : null}
          </View>

          {/* Segmented Tab Bar Switcher */}
          <View className="mt-5 flex-row rounded-xl border border-border bg-card p-1">
            {tabs.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-lg active:opacity-80"
                  style={
                    active
                      ? {
                          backgroundColor: theme.border,
                          borderWidth: 1,
                          borderColor: theme.borderStrong,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.18,
                          shadowRadius: 1.0,
                          elevation: 1,
                        }
                      : undefined
                  }
                  onPress={() => {
                    hapticLight();
                    userPickedTab.current = true;
                    setActiveTab(tab.key);
                  }}
                >
                  <AppSymbol
                    sf={tab.sf as any}
                    size={14}
                    tintColor={active ? Colors.brand : theme.textMuted}
                    fallback={tab.emoji}
                  />
                  <Text
                    className={`text-center text-xs font-semibold ${
                      active ? 'text-brand' : 'text-text-muted'
                    }`}
                    numberOfLines={1}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Wellness Tab */}
          {activeTab === 'wellness' && (
            <View className="mt-6">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                    Daily Wellness Check-in
                  </Text>
                  <Text className="text-sm text-text-muted">
                    Mood, stress, fatigue, soreness, sleep, and weight.
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Prefill sleep and weight from Health"
                  className="rounded-full border border-border bg-card px-3 py-1.5 active:opacity-70"
                  hitSlop={8}
                  disabled={healthBusy}
                  onPress={() => void onPrefillFromHealth()}
                >
                  <Text className="text-xs font-semibold text-brand">
                    {healthBusy ? 'Reading…' : 'Health Sync'}
                  </Text>
                </Pressable>
              </View>

              {healthHint ? (
                <Text className="mt-2 text-xs text-text-muted">{healthHint}</Text>
              ) : null}

              {/* Subjective Score Cards */}
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

              {/* Sleep & Weight */}
              <SleepDurationInput
                value={values.sleepHours}
                onChangeText={update('sleepHours')}
                onStep={onStepSleepHours}
              />
              <Field
                label={`Body Weight (${weightUnitLabel}, optional)`}
                value={values.weight}
                onChangeText={update('weight')}
                placeholder={weightUnitLabel}
                keyboardType="decimal-pad"
              />

              {error ? <Text className="mt-4 text-sm text-red-400">{error}</Text> : null}
              {savedOffline ? (
                <Text className="mt-4 text-sm text-amber-200">
                  Saved offline — will sync when you’re back online.
                </Text>
              ) : null}

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

          {/* Recovery Tab */}
          {activeTab === 'recovery' && (
            <View className="mt-6">
              <Text className="mb-1 text-xs font-semibold uppercase tracking-widest text-text-muted">
                Recovery Events
              </Text>
              <Text className="text-sm text-text-muted">
                Illness, fatigue, sleep, stress, or injury context Coach Watts uses for guidance.
              </Text>

              {recoveryLoading && !recoveryItems ? (
                <ActivityIndicator className="mt-4" color={Colors.brand} />
              ) : null}

              {recoveryError ? (
                <View className="mt-3 rounded-xl border border-danger/40 bg-tint-error p-3">
                  <Text className="text-sm text-red-300">
                    {friendlyError(recoveryErr, 'Couldn’t load recovery events')}
                  </Text>
                  <Pressable className="mt-2" hitSlop={8} onPress={() => void refetchRecovery()}>
                    <Text className="font-semibold text-brand">Retry</Text>
                  </Pressable>
                </View>
              ) : null}

              {!recoveryError && recoveryItems ? (
                recoveryItems.length === 0 ? (
                  <View className="mt-4 rounded-xl border border-border bg-card p-4">
                    <Text className="text-sm text-text-muted">
                      No recovery events logged in the last 7 days. Log one when something affects training.
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text className="mt-5 mb-2.5 text-xs font-semibold uppercase tracking-widest text-text-muted">
                      Active Context Today
                    </Text>
                    {activeToday && activeToday.length > 0 ? (
                      <View className="gap-2">
                        {activeToday.map((item) => (
                          <RecoveryEventCard
                            key={item.id}
                            item={item}
                            onPress={(i) => openRecoveryEvent(i)}
                          />
                        ))}
                      </View>
                    ) : (
                      <View className="rounded-xl border border-border bg-card p-3.5">
                        <Text className="text-xs text-text-muted">
                          Nothing active today. Clean slate for training!
                        </Text>
                      </View>
                    )}

                    {recentOnly && recentOnly.length > 0 ? (
                      <>
                        <Text className="mt-6 mb-2.5 text-xs font-semibold uppercase tracking-widest text-text-muted">
                          Recent History
                        </Text>
                        <View className="gap-2">
                          {recentOnly.map((item) => (
                            <RecoveryEventCard
                              key={item.id}
                              item={item}
                              onPress={(i) => openRecoveryEvent(i)}
                            />
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
                label="Log new recovery event"
                onPress={() => openRecoveryEvent()}
              />
            </View>
          )}

          {/* Measurements Tab */}
          {activeTab === 'measurements' && (
            <View className="mt-6">
              <MeasurementsSection />
            </View>
          )}

          {/* Nutrition Tab */}
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
