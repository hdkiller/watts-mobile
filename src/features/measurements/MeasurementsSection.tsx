import * as WebBrowser from 'expo-web-browser';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { Button } from '@/src/components/Button';
import { absoluteInstanceUrl } from '@/src/features/activity/mapActivity';
import { weightUnit } from '@/src/features/profile/mapProfile';
import { useAthleteProfileQuery } from '@/src/features/profile/useProfile';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';

import {
  CUSTOM_UNIT_OPTIONS,
  DEFAULT_METRIC_KEY,
  MEASUREMENT_METRICS,
  findMetricOption,
} from './catalog';
import {
  displayUnitLabel,
  emptyMeasurementForm,
  formatMetricName,
  formatRecordedAt,
  formatSource,
  measurementFormHasContent,
  measurementsWebPath,
  prefersImperialMass,
  toCreatePayload,
  toDisplayValue,
} from './mapMeasurements';
import type { BodyMeasurementEntry, CanonicalUnit, MeasurementFormValues } from './types';
import {
  useBodyMeasurementsQuery,
  useCreateBodyMeasurement,
  useSoftDeleteBodyMeasurement,
} from './useMeasurements';

function MetricPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = findMetricOption(value);

  return (
    <View className="mt-4">
      <Text className="mb-2 text-sm text-ink-muted">Measurement</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 active:opacity-80"
        onPress={() => {
          hapticLight();
          setOpen((prev) => !prev);
        }}
      >
        <Text className="text-base font-semibold text-white">
          {selected?.label ?? 'Select metric'}
        </Text>
      </Pressable>
      {open ? (
        <View className="mt-2 rounded-xl border border-zinc-800 bg-zinc-950">
          <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled>
            <View className="flex-row flex-wrap gap-2 p-3">
              {MEASUREMENT_METRICS.map((metric) => {
                const active = value === metric.key;
                return (
                  <Pressable
                    key={metric.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    className="rounded-full border px-3 py-1.5"
                    style={
                      active
                        ? {
                            borderColor: Colors.brand,
                            backgroundColor: 'rgba(0, 220, 130, 0.1)',
                          }
                        : { borderColor: '#3f3f46' }
                    }
                    onPress={() => {
                      hapticLight();
                      onChange(metric.key);
                      setOpen(false);
                    }}
                  >
                    <Text
                      className={`text-xs font-semibold ${active ? 'text-brand' : 'text-white'}`}
                    >
                      {metric.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

function LatestCard({
  entry,
  unitLabel,
  displayValue,
  onDelete,
  deleting,
}: {
  entry: BodyMeasurementEntry;
  unitLabel: string;
  displayValue: number;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <View className="mb-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-semibold text-white">{formatMetricName(entry)}</Text>
          <Text className="mt-1 text-lg font-semibold text-white">
            {displayValue}{' '}
            <Text className="text-sm font-medium text-ink-muted">{unitLabel}</Text>
          </Text>
          <Text className="mt-1 text-xs text-ink-muted">
            {formatRecordedAt(entry.recordedAt)} · {formatSource(entry.source)}
          </Text>
          {entry.notes ? (
            <Text className="mt-1 text-xs text-ink-muted" numberOfLines={2}>
              {entry.notes}
            </Text>
          ) : null}
        </View>
        {entry.source === 'manual_measurement' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete ${formatMetricName(entry)}`}
            disabled={deleting}
            className="py-1 active:opacity-70"
            hitSlop={8}
            onPress={onDelete}
          >
            <Text className="text-sm font-semibold text-red-400">
              {deleting ? '…' : 'Delete'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function MeasurementsSection() {
  const { instanceUrl } = useAuth();
  const { data: profile } = useAthleteProfileQuery();
  const weightUnits = profile?.weightUnits ?? 'Kilograms';
  const distanceUnits = profile?.distanceUnits ?? 'Kilometers';
  const unitOpts = useMemo(
    () => ({ weightUnits, distanceUnits }),
    [weightUnits, distanceUnits]
  );

  const { data, isLoading, isError, error, refetch } = useBodyMeasurementsQuery();
  const createMutation = useCreateBodyMeasurement();
  const deleteMutation = useSoftDeleteBodyMeasurement();

  const [form, setForm] = useState<MeasurementFormValues>(emptyMeasurementForm(DEFAULT_METRIC_KEY));
  const [formError, setFormError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedOption = findMetricOption(form.metricKey);
  const canonicalUnit: CanonicalUnit =
    form.metricKey === 'custom' ? form.customUnit : (selectedOption?.unit ?? 'cm');
  const unitLabel = displayUnitLabel(
    form.metricKey === 'custom' ? `custom:${form.customName || 'x'}` : form.metricKey,
    canonicalUnit,
    unitOpts
  );

  const touch = () => {
    setJustSaved(false);
    setFormError(null);
  };

  const onSave = async () => {
    if (!measurementFormHasContent(form)) {
      hapticError();
      setFormError(
        form.metricKey === 'custom'
          ? 'Enter a custom name and value.'
          : 'Enter a value before saving.'
      );
      return;
    }
    const payload = toCreatePayload(form, unitOpts);
    if (!payload) {
      hapticError();
      setFormError('Enter a valid number.');
      return;
    }
    setFormError(null);
    try {
      await createMutation.mutateAsync(payload);
      hapticSuccess();
      setForm(emptyMeasurementForm(form.metricKey));
      setJustSaved(true);
    } catch (err) {
      hapticError();
      setFormError(friendlyError(err, 'Save failed'));
    }
  };

  const confirmDelete = (entry: BodyMeasurementEntry) => {
    Alert.alert(
      'Delete measurement?',
      `${formatMetricName(entry)} from ${formatRecordedAt(entry.recordedAt)} will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setDeletingId(entry.id);
              try {
                await deleteMutation.mutateAsync(entry.id);
                hapticSuccess();
              } catch (err) {
                hapticError();
                setFormError(friendlyError(err, 'Delete failed'));
              } finally {
                setDeletingId(null);
              }
            })();
          },
        },
      ]
    );
  };

  const openWeb = async () => {
    if (!instanceUrl) return;
    await WebBrowser.openBrowserAsync(
      absoluteInstanceUrl(instanceUrl, measurementsWebPath())
    );
  };

  return (
    <View className="mt-4">
      <Text className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-muted">
        Measurements
      </Text>
      <Text className="text-sm text-ink-muted">
        Log weight, body fat, and circumferences. Full history and preferred sources stay on web.
      </Text>

      <Pressable
        accessibilityRole="button"
        className="mt-2 self-start py-1 active:opacity-70"
        hitSlop={8}
        onPress={() => void openWeb()}
      >
        <Text className="text-sm font-semibold text-brand">Open on web</Text>
      </Pressable>

      {isLoading && !data ? (
        <ActivityIndicator className="mt-4" color={Colors.brand} />
      ) : null}

      {isError ? (
        <View className="mt-3 rounded-xl border border-red-900/50 bg-red-950/40 p-3">
          <Text className="text-sm text-red-300">
            {friendlyError(error, 'Could not load measurements')}
          </Text>
          <Pressable className="mt-2" hitSlop={8} onPress={() => void refetch()}>
            <Text className="font-semibold text-brand">Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <MetricPicker
        value={form.metricKey}
        onChange={(next) => {
          touch();
          setForm((prev) => ({
            ...emptyMeasurementForm(next),
            notes: prev.notes,
          }));
        }}
      />

      {form.metricKey === 'custom' ? (
        <>
          <View className="mt-4">
            <Text className="mb-2 text-sm text-ink-muted">Custom name</Text>
            <TextInput
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white"
              placeholderTextColor={Colors.textMuted}
              placeholder="e.g. Left bicep flexed"
              value={form.customName}
              onChangeText={(text) => {
                touch();
                setForm((prev) => ({ ...prev, customName: text }));
              }}
            />
          </View>
          <Text className="mb-2 mt-4 text-sm text-ink-muted">Type</Text>
          <View className="flex-row flex-wrap gap-2">
            {CUSTOM_UNIT_OPTIONS.map((option) => {
              const active = form.customUnit === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  className="rounded-full border px-3 py-2"
                  style={
                    active
                      ? {
                          borderColor: Colors.brand,
                          backgroundColor: 'rgba(0, 220, 130, 0.1)',
                        }
                      : { borderColor: '#3f3f46' }
                  }
                  onPress={() => {
                    touch();
                    setForm((prev) => ({ ...prev, customUnit: option.value }));
                  }}
                >
                  <Text
                    className={`text-xs font-semibold ${active ? 'text-brand' : 'text-white'}`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      <View className="mt-4">
        <Text className="mb-2 text-sm text-ink-muted">Value ({unitLabel})</Text>
        <TextInput
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white"
          placeholderTextColor={Colors.textMuted}
          placeholder={
            form.metricKey === 'weight'
              ? prefersImperialMass(weightUnits)
                ? '165'
                : '75'
              : '0'
          }
          value={form.value}
          onChangeText={(text) => {
            touch();
            setForm((prev) => ({ ...prev, value: text }));
          }}
          keyboardType="decimal-pad"
        />
        {form.metricKey === 'weight' ? (
          <Text className="mt-1 text-xs text-ink-muted">
            Using profile unit ({weightUnit(profile)}). Also available on Wellness check-in.
          </Text>
        ) : null}
      </View>

      <View className="mt-4">
        <Text className="mb-2 text-sm text-ink-muted">Notes (optional)</Text>
        <TextInput
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white"
          placeholderTextColor={Colors.textMuted}
          placeholder="Morning, after ride…"
          value={form.notes}
          onChangeText={(text) => {
            touch();
            setForm((prev) => ({ ...prev, notes: text }));
          }}
        />
      </View>

      {formError ? <Text className="mt-4 text-sm text-red-400">{formError}</Text> : null}

      <Button
        className="mt-6"
        label={justSaved ? '✓ Saved' : 'Add measurement'}
        loading={createMutation.isPending}
        disabled={!measurementFormHasContent(form) || justSaved}
        onPress={() => {
          if (justSaved) return;
          void onSave();
        }}
      />

      <Text className="mb-2 mt-8 text-xs font-semibold uppercase tracking-widest text-ink-muted">
        Latest
      </Text>
      {data && data.latestByMetric.length === 0 ? (
        <Text className="text-sm text-ink-muted">No measurements yet — add one above.</Text>
      ) : null}
      {data?.latestByMetric.map((entry) => (
        <LatestCard
          key={entry.id}
          entry={entry}
          unitLabel={displayUnitLabel(entry.metricKey, entry.unit, unitOpts)}
          displayValue={toDisplayValue(entry.value, entry.metricKey, entry.unit, unitOpts)}
          deleting={deletingId === entry.id}
          onDelete={() => confirmDelete(entry)}
        />
      ))}
    </View>
  );
}
