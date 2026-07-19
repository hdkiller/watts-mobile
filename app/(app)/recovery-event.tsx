import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { friendlyError } from '@/src/api/errors';
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
  useCreateJourneyEvent,
  useDeleteJourneyEvent,
  useRecoveryContextQuery,
  useUpdateJourneyEvent,
} from '@/src/features/recovery/useRecovery';
import type {
  JourneyEventOptionId,
  RecoveryEventFormValues,
  SeverityPresetId,
  TimePresetId,
} from '@/src/features/recovery/types';
import { Button } from '@/src/components/Button';
import { useKeyboardOverlap } from '@/src/hooks/useKeyboardOverlap';
import { hapticLight } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TIME_PRESETS: { id: TimePresetId; label: string }[] = [
  { id: 'now', label: 'Now' },
  { id: 'earlier-today', label: 'Earlier today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'custom', label: 'Custom' },
];

const LIST_LAYOUT = {
  duration: 240,
  create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
  update: { type: LayoutAnimation.Types.easeInEaseOut },
  delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
};

const activeSelectStyle = {
  borderColor: Colors.brand,
  backgroundColor: 'rgba(0, 220, 130, 0.1)',
} as const;
const idleSelectStyle = {
  borderColor: '#27272a',
  backgroundColor: 'rgba(24, 24, 27, 0.6)',
} as const;

function OptionGlyph({
  sf,
  emoji,
  active,
  size = 'md',
}: {
  sf: SFSymbol;
  emoji: string;
  active?: boolean;
  size?: 'sm' | 'md';
}) {
  const tint = active ? Colors.brand : '#d4d4d8';
  const box = size === 'sm' ? 32 : 36;
  const icon = size === 'sm' ? 15 : 17;
  return (
    <View
      className="mr-3 items-center justify-center rounded-full bg-zinc-800"
      style={{ width: box, height: box }}
    >
      {Platform.OS === 'ios' ? (
        <SymbolView name={sf} size={icon} tintColor={tint} />
      ) : (
        <Text style={{ fontSize: icon - 2 }}>{emoji}</Text>
      )}
    </View>
  );
}

function animateList() {
  LayoutAnimation.configureNext(LIST_LAYOUT);
}

export default function RecoveryEventScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const sourceRecordId =
    typeof params.id === 'string' && params.id && params.id !== 'undefined'
      ? params.id
      : undefined;
  const isEdit = Boolean(sourceRecordId);

  const { data: recoveryItems, isLoading } = useRecoveryContextQuery();
  const createMutation = useCreateJourneyEvent();
  const updateMutation = useUpdateJourneyEvent();
  const deleteMutation = useDeleteJourneyEvent();

  const existing = useMemo(
    () => recoveryItems?.find((item) => item.sourceRecordId === sourceRecordId) ?? null,
    [recoveryItems, sourceRecordId]
  );

  const { containerRef, overlap } = useKeyboardOverlap();
  const [values, setValues] = useState<RecoveryEventFormValues>(emptyRecoveryEventForm());
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(!isEdit);
  /** Full option list with subtitles — create starts open; edit starts settled. */
  const [browsingOptions, setBrowsingOptions] = useState(!isEdit);
  /** After first pick (or edit hydrate), severity / when / notes unlock. */
  const [detailsUnlocked, setDetailsUnlocked] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) {
      setValues(emptyRecoveryEventForm());
      setBrowsingOptions(true);
      setDetailsUnlocked(false);
      setHydrated(true);
      return;
    }
    if (existing) {
      setValues(formFromRecoveryItem(existing));
      setBrowsingOptions(false);
      setDetailsUnlocked(true);
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

  const onSelectOption = (id: JourneyEventOptionId) => {
    hapticLight();
    animateList();
    setError(null);
    setValues((prev) => ({ ...prev, optionId: id }));
    setBrowsingOptions(false);
    setDetailsUnlocked(true);
  };

  const onExpandOptions = () => {
    hapticLight();
    animateList();
    setBrowsingOptions(true);
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
      setError(friendlyError(err, 'Save failed'));
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
              setError(friendlyError(err, 'Delete failed'));
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

  if (isEdit && !isLoading && !existing) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark px-6">
        <Text className="text-center text-base text-ink-muted">
          This recovery event is no longer available.
        </Text>
        <Pressable className="mt-4" hitSlop={8} onPress={() => router.back()}>
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
        <Button variant="secondary" className="mt-8" label="Close" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: isEdit ? 'Edit recovery event' : 'Log recovery event',
          headerShown: true,
        }}
      />
      <View ref={containerRef} className="flex-1 bg-surface-dark">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pt-4"
          contentContainerStyle={{ paddingBottom: 48 + overlap }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-base text-ink-muted">
            Capture what helps explain unusual recovery, sleep, or training response.
          </Text>

          <View className="mt-6 flex-row items-center justify-between">
            <Text className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
              What happened?
            </Text>
            {!browsingOptions ? (
              <Pressable
                hitSlop={8}
                onPress={onExpandOptions}
                accessibilityRole="button"
                accessibilityLabel="Back to all options"
              >
                <Text className="text-sm font-semibold text-brand">Back</Text>
              </Pressable>
            ) : null}
          </View>

          <View className="mt-2 gap-2">
            {(browsingOptions
              ? JOURNEY_EVENT_OPTIONS
              : JOURNEY_EVENT_OPTIONS.filter((option) => option.id === values.optionId)
            ).map((option) => {
              const active = values.optionId === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  className="rounded-xl border px-4 py-3"
                  style={active ? activeSelectStyle : idleSelectStyle}
                  onPress={() => {
                    if (browsingOptions) {
                      onSelectOption(option.id);
                      return;
                    }
                    // Settled: tap selected card to go back to the full list
                    onExpandOptions();
                  }}
                >
                  <View className="flex-row items-start">
                    <OptionGlyph sf={option.sf} emoji={option.emoji} active={active} />
                    <View className="min-w-0 flex-1">
                      <Text className="text-sm font-semibold text-white">{option.title}</Text>
                      <Text className="mt-1 text-xs text-ink-muted">{option.subtitle}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {!browsingOptions ? (
            <Text className="mt-3 text-xs text-ink-muted">
              Logged as {eventTypeBadgeLabel(selectedOption.eventType).toLowerCase()}
            </Text>
          ) : (
            <Text className="mt-3 text-xs text-ink-muted">Tap an option to continue.</Text>
          )}

          {detailsUnlocked ? (
            <Animated.View entering={FadeInDown.duration(280)}>
              <Text className="mb-2 mt-6 text-xs font-semibold uppercase tracking-widest text-ink-muted">
                How much did it affect you?
              </Text>
              <View className="gap-2">
                {SEVERITY_PRESETS.map((level) => {
                  const active = values.severityPreset === level.id;
                  return (
                    <Pressable
                      key={level.id}
                      className="rounded-xl border px-4 py-3"
                      style={active ? activeSelectStyle : idleSelectStyle}
                      onPress={() => {
                        hapticLight();
                        patch('severityPreset', level.id as SeverityPresetId);
                      }}
                    >
                      <View className="flex-row items-start">
                        <OptionGlyph sf={level.sf} emoji={level.emoji} active={active} />
                        <View className="min-w-0 flex-1">
                          <View className="flex-row items-center justify-between">
                            <Text className="text-sm font-semibold text-white">{level.label}</Text>
                            <Text className="text-xs text-ink-muted">{level.value}/10</Text>
                          </View>
                          <Text className="mt-1 text-xs text-ink-muted">{level.description}</Text>
                        </View>
                      </View>
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
                      className="rounded-full border px-3 py-2"
                      style={
                        active
                          ? activeSelectStyle
                          : { borderColor: '#3f3f46', backgroundColor: 'transparent' }
                      }
                      onPress={() => {
                        hapticLight();
                        onSelectTimePreset(preset.id);
                      }}
                    >
                      <Text
                        className={`text-xs font-semibold ${active ? 'text-brand' : 'text-white'}`}
                      >
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

              <Button
                className="mt-6"
                label={isEdit ? 'Save changes' : 'Log event'}
                onPress={() => void onSave()}
                loading={createMutation.isPending || updateMutation.isPending}
                disabled={!canSave}
              />

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
            </Animated.View>
          ) : null}

          <Pressable
            className="mt-3 items-center rounded-xl border border-zinc-700 py-3.5"
            onPress={() => router.back()}
          >
            <Text className="text-base font-semibold text-white">Cancel</Text>
          </Pressable>
        </ScrollView>
      </View>
    </>
  );
}
