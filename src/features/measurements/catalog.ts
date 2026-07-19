import type { CanonicalUnit, MeasurementMetricOption, MetricCategory } from './types';

/** Same predefined keys as coach-wattz `MeasurementsSettings.vue`. */
export const MEASUREMENT_METRICS: MeasurementMetricOption[] = [
  { key: 'weight', label: 'Weight', unit: 'kg', category: 'mass' },
  { key: 'height', label: 'Height', unit: 'cm', category: 'height' },
  { key: 'body_fat_pct', label: 'Body Fat %', unit: 'pct', category: 'percent' },
  { key: 'neck', label: 'Neck', unit: 'cm', category: 'length' },
  { key: 'shoulders', label: 'Shoulders', unit: 'cm', category: 'length' },
  { key: 'waist', label: 'Waist', unit: 'cm', category: 'length' },
  { key: 'abdomen', label: 'Abdomen', unit: 'cm', category: 'length' },
  { key: 'hips', label: 'Hips', unit: 'cm', category: 'length' },
  { key: 'glutes', label: 'Glutes', unit: 'cm', category: 'length' },
  { key: 'chest', label: 'Chest', unit: 'cm', category: 'length' },
  { key: 'underbust', label: 'Underbust', unit: 'cm', category: 'length' },
  { key: 'left_arm', label: 'Left Arm', unit: 'cm', category: 'length' },
  { key: 'right_arm', label: 'Right Arm', unit: 'cm', category: 'length' },
  { key: 'left_forearm', label: 'Left Forearm', unit: 'cm', category: 'length' },
  { key: 'right_forearm', label: 'Right Forearm', unit: 'cm', category: 'length' },
  { key: 'left_wrist', label: 'Left Wrist', unit: 'cm', category: 'length' },
  { key: 'right_wrist', label: 'Right Wrist', unit: 'cm', category: 'length' },
  { key: 'left_thigh', label: 'Left Thigh', unit: 'cm', category: 'length' },
  { key: 'right_thigh', label: 'Right Thigh', unit: 'cm', category: 'length' },
  { key: 'left_calf', label: 'Left Calf', unit: 'cm', category: 'length' },
  { key: 'right_calf', label: 'Right Calf', unit: 'cm', category: 'length' },
  { key: 'left_ankle', label: 'Left Ankle', unit: 'cm', category: 'length' },
  { key: 'right_ankle', label: 'Right Ankle', unit: 'cm', category: 'length' },
  { key: 'inseam', label: 'Inseam', unit: 'cm', category: 'length' },
  { key: 'muscle_mass_kg', label: 'Muscle Mass', unit: 'kg', category: 'mass' },
  { key: 'bone_mass_kg', label: 'Bone Mass', unit: 'kg', category: 'mass' },
  { key: 'custom', label: 'Custom', unit: 'cm', category: 'length' },
];

export const CUSTOM_UNIT_OPTIONS: { value: CanonicalUnit; label: string }[] = [
  { value: 'cm', label: 'Length (cm/in)' },
  { value: 'kg', label: 'Mass (kg/lbs)' },
  { value: 'pct', label: 'Percentage' },
];

export const DEFAULT_METRIC_KEY = 'waist';

export function findMetricOption(metricKey: string): MeasurementMetricOption | undefined {
  if (metricKey.startsWith('custom:')) {
    return { key: 'custom', label: 'Custom', unit: 'cm', category: 'length' };
  }
  return MEASUREMENT_METRICS.find((m) => m.key === metricKey);
}

export function metricCategoryFor(
  metricKey: string,
  canonicalUnit?: string
): MetricCategory {
  if (metricKey === 'custom' || metricKey.startsWith('custom:')) {
    if (canonicalUnit === 'kg') return 'mass';
    if (canonicalUnit === 'pct') return 'percent';
    return 'length';
  }
  return findMetricOption(metricKey)?.category ?? 'length';
}

export function slugifyCustomMetric(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
