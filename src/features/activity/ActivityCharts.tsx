import { ActivityIndicator, Text, View } from 'react-native';

import { Colors } from '@/src/theme/colors';

import { BarSeriesChart, powerCurveToItems, zoneBarsToItems } from './charts/BarSeriesChart';
import { LineSeriesChart } from './charts/LineSeriesChart';
import { useActivityPowerCurveQuery, useActivityStreamsQuery } from './useActivity';

type Props = {
  workoutId: string;
};

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
        <Text className="mt-2 text-sm text-ink-muted">Loading charts…</Text>
      </View>
    );
  }

  if (streams.isError && curve.isError) {
    return (
      <View className="mt-6">
        <Text className="text-xs uppercase tracking-wide text-ink-muted">Charts</Text>
        <Text className="mt-2 text-sm text-ink-muted">
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
      <Text className="text-xs uppercase tracking-wide text-ink-muted">Charts</Text>

      {streamData && streamData.series.length > 0 ? (
        <View className="mt-4">
          <Text className="mb-2 text-sm font-medium text-zinc-100">Power & heart rate</Text>
          <LineSeriesChart series={streamData.series} durationSec={streamData.durationSec} />
        </View>
      ) : null}

      {streamData?.zones && streamData.zones.bars.length > 0 ? (
        <View className="mt-6">
          <Text className="mb-1 text-sm font-medium text-zinc-100">
            {streamData.zones.channelLabel}
          </Text>
          <BarSeriesChart items={zoneBarsToItems(streamData.zones.bars)} />
        </View>
      ) : null}

      {curveData && curveData.points.length > 0 ? (
        <View className="mt-6">
          <Text className="mb-1 text-sm font-medium text-zinc-100">Power curve</Text>
          {curveData.peak20min != null ? (
            <Text className="mb-2 text-xs text-ink-muted">
              Peak 20 min · {curveData.peak20min} W
            </Text>
          ) : null}
          <BarSeriesChart items={powerCurveToItems(curveData.points)} accent={Colors.brandDeep} />
        </View>
      ) : null}
    </View>
  );
}
