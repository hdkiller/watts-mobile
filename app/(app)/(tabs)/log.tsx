import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
import { SafeAreaView } from 'react-native-screens/experimental';

import { friendlyError } from '@/src/api/errors';
import {
  emptyLogForm,
  formFromWellness,
  formHasContent,
  toWellnessPayload,
} from '@/src/features/log/mapLogForm';
import { Button } from '@/src/components/Button';
import { useSaveWellnessCheckin, useTodayWellnessQuery } from '@/src/features/log/useLog';
import type { LogFormValues } from '@/src/features/log/types';
import { NutritionSection } from '@/src/features/nutrition/NutritionSection';
import { isNutritionTrackingEnabled } from '@/src/features/profile/mapProfile';
import { useAthleteProfileQuery } from '@/src/features/profile/useProfile';
import { useActiveRecoveryQuery } from '@/src/features/recovery/useRecovery';
import type { RecoveryContextItem } from '@/src/features/recovery/types';
import { Colors } from '@/src/theme/colors';

type LogSection = 'recovery' | 'wellness' | 'nutrition';

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

function parseLogSection(value: string | string[] | undefined): LogSection | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'recovery' || raw === 'wellness' || raw === 'nutrition') return raw;
  return null;
}

export default function LogScreen() {
  const params = useLocalSearchParams<{ section?: string | string[] }>();
  const targetSection = parseLogSection(params.section);
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Partial<Record<LogSection, number>>>({});
  const scrolledForSection = useRef<string | null>(null);

  const { data: athleteProfile } = useAthleteProfileQuery();
  const nutritionEnabled = isNutritionTrackingEnabled(athleteProfile);
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
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (todayWellness) {
      setValues(formFromWellness(todayWellness));
    }
  }, [todayWellness]);

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

  return (
    <SafeAreaView
      edges={{ top: true }}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
    <KeyboardAvoidingView
      className="flex-1 bg-surface-dark"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="px-6 pb-12 pt-4"
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

          <Button
            className="mt-6"
            label="Save check-in"
            onPress={() => void onSave()}
            loading={saveMutation.isPending}
            disabled={!formHasContent(values)}
          />
        </View>

        {nutritionEnabled ? (
          <View onLayout={rememberSectionOffset('nutrition')}>
            <NutritionSection />
          </View>
        ) : null}

        <Button
          variant="secondary"
          className="mt-6"
          label="Back to Today"
          onPress={() => router.push('/(app)/(tabs)/today')}
        />
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
