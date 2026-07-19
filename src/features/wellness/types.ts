export type WellnessTrendPoint = {
  date: string;
  value: number | null;
};

export type WellnessMetricTrend = {
  value: number | null;
  previous: number | null;
  avg7: number | null;
  avg30: number | null;
  history: WellnessTrendPoint[];
};

export type WellnessOverviewMetricKey =
  | 'hrv'
  | 'sleep'
  | 'restingHr'
  | 'recoveryScore'
  | 'readiness'
  | 'weight'
  | 'stress'
  | 'mood'
  | 'spo2'
  | 'bloodPressure';

export type WellnessOverviewMetric = {
  key: WellnessOverviewMetricKey;
  label: string;
  value: number | string;
  unit: string;
  trendPercent: number | null;
  lowerIsBetter: boolean;
};

export type WellnessBarSeries = {
  key: string;
  label: string;
  unit: string;
  points: WellnessTrendPoint[];
};

export type WellnessOverview = {
  id: string | null;
  date: string;
  isStale: boolean;
  metrics: WellnessOverviewMetric[];
  barSeries: WellnessBarSeries[];
  coachNote: string | null;
};
