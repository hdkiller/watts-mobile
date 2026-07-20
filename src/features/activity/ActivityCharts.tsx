import { ActivityIndicator, Text, View } from 'react-native';

import { Colors } from '@/src/theme/colors';

import { BarSeriesChart, powerCurveToItems, zoneBarsToItems } from './charts/BarSeriesChart';
import { LineSeriesChart } from './charts/LineSeriesChart';
import { useActivityPowerCurveQuery, useActivityStreamsQuery } from './useActivity';

type Props = {
  workoutId: string;
};

/** Title from series actually present (not a hard-coded "Power & heart rate"). */
export function streamSeriesTitle(labels: string[]): string {
  const cleaned = labels.map((l) => l.replace(/\s*\(.*?\)\s*/g, '').trim()).filter(Boolean);
  if (cleaned.length === 0) return 'Streams';
  if (cleaned.length === 1) return cleaned[0]!;
  if (cleaned.length === 2) return `${cleaned[0]} & ${cleaned[1]}`;
  return cleaned.join(' · ');
}

export function ActivityCharts({ workoutId }: Props) {
  const streams = useActivityStreamsQuery(workoutId);
  const curve = useActivityPowerCurveQuery(workoutId);

  const loading = (streams.isLoading || curve.isLoading) && !streams.data && !curve.data;
  const streamData = streams.data;
  const curveData = curve.data;
  const hasAny =
    Boolean(streamData?.series.length) ||
    Boolean(streamData?.zones?.bars.length) ||
    Boolean(curveData?.points.length);

  if (loading) {
    return (
      <View className="mt-6 items-center py-4">
        <ActivityIndicator color={Colors.brand} />
        <Text className="mt-2 text-sm text-text-muted">Loading charts…</Text>
      </View>
    );
  }

  if (streams.isError && curve.isError) {
    return (
      <View className="mt-6">
        <Text className="text-xs uppercase tracking-wide text-text-muted">Charts</Text>
        <Text className="mt-2 text-sm text-text-muted">
          Charts unavailable for this workout.
        </Text>
      </View>
    );
  }

  if (!hasAny) {
    return null;
  }

  return (
    <View className="mt-6">
      <Text className="text-xs uppercase tracking-wide text-text-muted">Charts</Text>

      {streamData && streamData.series.length > 0 ? (
        <View className="mt-4">
          <Text className="mb-2 text-sm font-medium text-text-body">
            {streamSeriesTitle(streamData.series.map((s) => s.label))}
          </Text>
          <LineSeriesChart series={streamData.series} durationSec={streamData.durationSec} />
        </View>
      ) : null}

      {streamData?.zones && streamData.zones.bars.length > 0 ? (
        <View className="mt-6">
          <Text className="mb-1 text-sm font-medium text-text-body">
            {streamData.zones.channelLabel}
          </Text>
          <BarSeriesChart items={zoneBarsToItems(streamData.zones.bars)} />
        </View>
      ) : null}

      {curveData && curveData.points.length > 0 ? (
        <View className="mt-6">
          <Text className="mb-1 text-sm font-medium text-text-body">Power curve</Text>
          {curveData.peak20min != null ? (
            <Text className="mb-2 text-xs text-text-muted">
              Peak 20 min · {curveData.peak20min} W
            </Text>
          ) : null}
          <BarSeriesChart items={powerCurveToItems(curveData.points)} accent={Colors.brandDeep} />
        </View>
      ) : null}
    </View>
  );
}
