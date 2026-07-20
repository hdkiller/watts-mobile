import type { DailyCheckin, DailyCheckinQuestion } from './dailyCheckinApi';

/**
 * True when the athlete has nothing left to answer for today's coach check-in.
 * A check-in with zero questions counts as complete ("nothing needed") so Today
 * does not advertise questions that do not exist.
 */
export function isDailyCheckinCompleted(
  checkin: Pick<DailyCheckin, 'questions'> | null | undefined
): boolean {
  if (!checkin) return false;
  const questions = checkin.questions;
  if (!questions || questions.length === 0) return true;
  return questions.every((q: DailyCheckinQuestion) => q.answer != null);
}
