import { useMemo, useState } from 'react';
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
import {
  CUSTOM_UNIT_OPTIONS,
  DEFAULT_METRIC_KEY,
  MEASUREMENT_METRICS,
  findMetricOption,
} from '@/src/features/measurements/catalog';
import {
  displayUnitLabel,
  emptyMeasurementForm,
  measurementFormHasContent,
  prefersImperialMass,
  toCreatePayload,
} from '@/src/features/measurements/mapMeasurements';
import type { CanonicalUnit, MeasurementFormValues } from '@/src/features/measurements/types';
import { useCreateBodyMeasurement } from '@/src/features/measurements/useMeasurements';
import { weightUnit } from '@/src/features/profile/mapProfile';
import { useAthleteProfileQuery } from '@/src/features/profile/useProfile';

import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

const METRIC_CATEGORIES = [
  { id: 'all', label: 'All Metrics' },
  { id: 'body', label: 'Body Comp', keys: ['weight', 'body_fat_pct', 'muscle_mass_kg'] },
  { id: 'vitals', label: 'Vitals', keys: ['resting_hr', 'hrv_sdnn_ms', 'blood_pressure_sys', 'blood_glucose_mg_dl', 'spo2_pct'] },
  { id: 'dimensions', label: 'Dimensions', keys: ['waist_cm', 'chest_cm', 'thigh_cm', 'arm_cm', 'hips_cm'] },
];

interface MeasurementSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function MeasurementSheet({ visible, onClose }: MeasurementSheetProps) {
  const theme = useThemeColors();
  const { data: profile } = useAthleteProfileQuery();
  const createMutation = useCreateBodyMeasurement();

  const weightUnits = profile?.weightUnits ?? 'Kilograms';
  const distanceUnits = profile?.distanceUnits ?? 'Kilometers';
  const unitOpts = useMemo(
    () => ({ weightUnits, distanceUnits }),
    [weightUnits, distanceUnits]
  );

  const [activeCategory, setActiveCategory] = useState('all');
  const [form, setForm] = useState<MeasurementFormValues>(
    emptyMeasurementForm(DEFAULT_METRIC_KEY)
  );
  const [error, setError] = useState<string | null>(null);

  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      setActiveCategory('all');
      setForm(emptyMeasurementForm(DEFAULT_METRIC_KEY));
      setError(null);
    }
  }

  const selectedOption = findMetricOption(form.metricKey);
  const canonicalUnit: CanonicalUnit =
    form.metricKey === 'custom' ? form.customUnit : (selectedOption?.unit ?? 'cm');
  const unitLabel = displayUnitLabel(
    form.metricKey === 'custom' ? `custom:${form.customName || 'x'}` : form.metricKey,
    canonicalUnit,
    unitOpts
  );

  const filteredMetrics = useMemo(() => {
    if (activeCategory === 'all') return MEASUREMENT_METRICS;
    const cat = METRIC_CATEGORIES.find((c) => c.id === activeCategory);
    if (!cat?.keys) return MEASUREMENT_METRICS;
    return MEASUREMENT_METRICS.filter((m) => cat.keys.includes(m.key) || m.key === 'custom');
  }, [activeCategory]);

  const touch = () => {
    setError(null);
  };

  const onSave = async () => {
    if (!measurementFormHasContent(form)) {
      hapticError();
      setError('Enter a value before saving.');
      return;
    }
    const payload = toCreatePayload(form, unitOpts);
    if (!payload) {
      hapticError();
      setError('Enter a valid number.');
      return;
    }
    setError(null);
    try {
      await createMutation.mutateAsync(payload);
      hapticSuccess();
      setForm(emptyMeasurementForm(form.metricKey));
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
        <Pressable className="rounded-t-3xl bg-surface px-6 pt-4 pb-10" style={{ maxHeight: '85%' }}>
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-border-strong" />

          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xl font-bold text-text-primary">Add Measurement</Text>
            <Pressable hitSlop={8} onPress={onClose} className="p-1 active:opacity-70">
              <Text className="text-base font-semibold text-text-muted">Cancel</Text>
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled">
            {/* Category Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3 flex-row">
              <View className="flex-row gap-2">
                {METRIC_CATEGORIES.map((cat) => {
                  const active = activeCategory === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      className="rounded-full px-3 py-1.5 active:opacity-80"
                      style={{
                        backgroundColor: active ? theme.borderStrong : theme.border,
                      }}
                      onPress={() => {
                        hapticLight();
                        setActiveCategory(cat.id);
                      }}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          active ? 'text-text-primary' : 'text-text-muted'
                        }`}
                      >
                        {cat.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Metric Option Grid */}
            <View className="flex-row flex-wrap gap-2 mb-4">
              {filteredMetrics.map((metric) => {
                const active = form.metricKey === metric.key;
                return (
                  <Pressable
                    key={metric.key}
                    className="rounded-full border px-3 py-2 active:opacity-80"
                    style={
                      active
                        ? {
                            borderColor: Colors.brand,
                            backgroundColor: 'rgba(0, 220, 130, 0.1)',
                          }
                        : {
                            borderColor: theme.borderStrong,
                            backgroundColor: theme.card,
                          }
                    }
                    onPress={() => {
                      hapticLight();
                      touch();
                      setForm((prev) => ({
                        ...emptyMeasurementForm(metric.key),
                        notes: prev.notes,
                      }));
                    }}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        active ? 'text-brand' : 'text-text-primary'
                      }`}
                    >
                      {metric.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Custom Metric Form */}
            {form.metricKey === 'custom' ? (
              <View className="mb-4">
                <Text className="mb-1 text-xs text-text-muted">Custom Metric Name</Text>
                <TextInput
                  className="rounded-xl border border-border-strong bg-card px-4 py-3 text-base text-text-primary mb-3"
                  placeholderTextColor={theme.textMuted}
                  placeholder="e.g. Left bicep flexed"
                  value={form.customName}
                  onChangeText={(text) => {
                    touch();
                    setForm((prev) => ({ ...prev, customName: text }));
                  }}
                />

                <Text className="mb-2 text-xs text-text-muted">Unit Type</Text>
                <View className="flex-row flex-wrap gap-2">
                  {CUSTOM_UNIT_OPTIONS.map((option) => {
                    const active = form.customUnit === option.value;
                    return (
                      <Pressable
                        key={option.value}
                        className="rounded-full border px-3 py-1.5"
                        style={
                          active
                            ? {
                                borderColor: Colors.brand,
                                backgroundColor: 'rgba(0, 220, 130, 0.1)',
                              }
                            : { borderColor: theme.borderStrong }
                        }
                        onPress={() => {
                          touch();
                          setForm((prev) => ({ ...prev, customUnit: option.value }));
                        }}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            active ? 'text-brand' : 'text-text-primary'
                          }`}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {/* Value Input */}
            <View className="mb-4">
              <Text className="mb-1 text-xs font-semibold text-text-muted">
                Value ({unitLabel})
              </Text>
              <TextInput
                className="rounded-xl border border-border-strong bg-card px-4 py-3 text-base font-semibold text-text-primary"
                placeholderTextColor={theme.textMuted}
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
                <Text className="mt-1 text-xs text-text-muted">
                  Using profile unit ({weightUnit(profile)}).
                </Text>
              ) : null}
            </View>

            {/* Notes */}
            <View className="mb-4">
              <Text className="mb-1 text-xs font-semibold text-text-muted">Notes (optional)</Text>
              <TextInput
                className="rounded-xl border border-border-strong bg-card px-4 py-3 text-base text-text-primary"
                placeholderTextColor={theme.textMuted}
                placeholder="Morning, post-ride, fasting…"
                value={form.notes}
                onChangeText={(text) => {
                  touch();
                  setForm((prev) => ({ ...prev, notes: text }));
                }}
              />
            </View>

            {error ? <Text className="mb-3 text-xs text-red-400">{error}</Text> : null}

            <Button
              className="mt-2"
              label="Save Measurement"
              loading={createMutation.isPending}
              disabled={!measurementFormHasContent(form)}
              onPress={() => void onSave()}
            />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
