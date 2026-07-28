import type { DailyCheckin, DailyCheckinQuestion } from './dailyCheckinApi';

/**
 * True when the athlete has finished today's coach check-in.
 * A check-in with zero questions only counts as complete if its status is
 * 'COMPLETED' or 'SAVED'. If status is 'PENDING', 'PROCESSING', or 'FAILED',
 * empty questions do NOT mean completed.
 */
export function isDailyCheckinCompleted(
  checkin: Pick<DailyCheckin, 'questions' | 'status'> | null | undefined,
): boolean {
  if (!checkin) return false;

  const { questions, status } = checkin;

  if (status === 'PENDING' || status === 'PROCESSING' || status === 'FAILED') {
    return false;
  }

  if (questions && questions.length > 0) {
    return questions.every((q: DailyCheckinQuestion) => q.answer != null);
  }

  return status === 'COMPLETED' || status === 'SAVED';
}
