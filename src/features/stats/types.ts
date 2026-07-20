export type MonthlyMetric = 'tss' | 'duration' | 'distance' | 'elevation' | 'count';
export type MonthlyViewMode = 'cumulative' | 'daily';

export type MonthlyDayMetrics = {
  tss: number;
  duration: number;
  distance: number;
  elevation: number;
  count: number;
};

export type MonthlyComparisonPayload = {
  currentMonthName: string;
  lastMonthName: string;
  todayDay: number;
  currentDaily: Record<number, MonthlyDayMetrics>;
  lastDaily: Record<number, MonthlyDayMetrics>;
  currentCumulative: Record<number, MonthlyDayMetrics | null>;
  lastCumulative: Record<number, MonthlyDayMetrics | null>;
};

export type MonthlyProgressSummary = {
  currentTotal: number;
  lastTotal: number;
  percentDiff: number;
  unitLabel: string;
  formattedCurrent: string;
  formattedLast: string;
};
