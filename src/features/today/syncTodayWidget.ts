import { Platform } from 'react-native';

import { formatDuration } from '@/src/features/today/mapTodayPayload';
import type { TodayViewModel } from '@/src/features/today/types';
import { humanizeWorkoutType } from '@/src/lib/humanizeWorkoutType';

/** Push Today payload into the iOS home-screen widget (no-op on other platforms). */
export async function syncTodayWidget(data: TodayViewModel | undefined): Promise<void> {
  if (Platform.OS !== 'ios' || !data) return;
  try {
    const widget = (await import('../../../widgets/TodaySessionWidget')).default;
    const planned = data.plannedWorkout;
    const meta = planned
      ? [
            humanizeWorkoutType(planned.type),
            formatDuration(planned.durationSec),
            planned.tss != null ? `TSS ${Math.round(planned.tss)}` : null,
          ]
          .filter(Boolean)
          .join(' · ')
      : data.action === 'rest'
        ? 'Rest day'
        : '';
    widget.updateSnapshot({
      actionLabel: data.actionLabel || (data.action === 'rest' ? 'Rest' : 'Train'),
      sessionTitle: planned?.title ?? (data.action === 'rest' ? 'Recovery' : 'No planned workout'),
      metaLine: meta,
    });
  } catch {
    // Widget native target missing until rebuild — ignore.
  }
}
