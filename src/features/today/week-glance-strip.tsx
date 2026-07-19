import { Text, View } from 'react-native';

import type { ActivityListItem, PlannedListItem } from '@/src/features/activity/types';
import { computeWeekGlance } from '@/src/features/today/weekGlance';

type WeekGlanceStripProps = {
  recent: ActivityListItem[] | undefined;
  planned: PlannedListItem[] | undefined;
};

export function WeekGlanceStrip({ recent, planned }: WeekGlanceStripProps) {
  const glance = computeWeekGlance(recent, planned);

  return (
    <View className="mt-8">
      <Text className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
        This week
      </Text>
      <Text className="mt-2 text-sm text-zinc-200">{glance.summaryLine.replace(/^This week:\s*/, '')}</Text>
      <View className="mt-3 flex-row items-end justify-between gap-1">
        {glance.days.map((day) => {
          const barH = Math.max(4, Math.round(day.height * 28));
          const fill = day.hasDone
            ? 'bg-brand'
            : day.hasPlanned
              ? 'bg-zinc-600'
              : 'bg-zinc-800';
          return (
            <View key={day.dateKey} className="flex-1 items-center">
              <View className="h-8 w-full items-center justify-end">
                <View
                  accessibilityLabel={`${day.weekday}${day.hasDone ? ', completed' : day.hasPlanned ? ', planned' : ''}`}
                  className={`w-2 rounded-sm ${fill}`}
                  style={{ height: barH }}
                />
              </View>
              <Text className="mt-1 text-[10px] text-ink-muted">{day.weekday.slice(0, 2)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
