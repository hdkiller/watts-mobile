export type CanonicalUnit = 'kg' | 'cm' | 'pct';

export type MetricCategory = 'mass' | 'length' | 'percent' | 'height';

export type MeasurementMetricOption = {
  key: string;
  label: string;
  unit: CanonicalUnit;
  category: MetricCategory;
};

export type BodyMeasurementEntry = {
  id: string;
  metricKey: string;
  displayName: string | null;
  value: number;
  unit: CanonicalUnit;
  recordedAt: string;
  source: string;
  notes: string | null;
};

export type BodyMeasurementsSnapshot = {
  items: BodyMeasurementEntry[];
  latestByMetric: BodyMeasurementEntry[];
};

export type MeasurementFormValues = {
  metricKey: string;
  customName: string;
  customUnit: CanonicalUnit;
  value: string;
  notes: string;
};

export type CreateBodyMeasurementPayload = {
  recordedAt: string;
  metricKey: string;
  displayName?: string | null;
  value: number;
  unit: CanonicalUnit;
  notes?: string | null;
};
