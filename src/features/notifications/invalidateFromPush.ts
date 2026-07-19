import type { QueryClient } from '@tanstack/react-query';

/** Extract a workout id from push `path`/`url` or explicit extra fields. */
export function workoutIdFromPushData(
  data: Record<string, unknown> | undefined | null
): string | null {
  if (!data) return null;

  for (const key of ['workoutId', 'activityId'] as const) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  const candidates = [data.path, data.url];
  for (const candidate of candidates) {
    if (typeof candidate !== 'string' || !candidate.trim()) continue;
    const match =
      candidate.match(/\/activities\/([^/?#]+)/) ||
      candidate.match(/\/(?:\(app\)\/)?activity\/([^/?#]+)/);
    const id = match?.[1];
    if (id) {
      try {
        return decodeURIComponent(id);
      } catch {
        return id;
      }
    }
  }

  return null;
}

/**
 * Inbox always refreshes on receive. Analysis-ready also refreshes activity
 * summary so an open detail screen picks up results without leaving.
 *
 * Query keys are inlined (same as useNotifications / useActivity) so this
 * module stays free of React Native imports for unit tests.
 */
export async function invalidateQueriesForPush(
  queryClient: QueryClient,
  data: Record<string, unknown> | undefined | null
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['notifications', 'inbox'] });

  const type = typeof data?.type === 'string' ? data.type : null;
  if (type !== 'WORKOUT_ANALYSIS_READY') return;

  const workoutId = workoutIdFromPushData(data);
  if (workoutId) {
    await queryClient.invalidateQueries({ queryKey: ['activity', 'detail', workoutId] });
  } else {
    await queryClient.invalidateQueries({ queryKey: ['activity', 'detail'] });
  }
  await queryClient.invalidateQueries({ queryKey: ['activity', 'recent'] });
}
