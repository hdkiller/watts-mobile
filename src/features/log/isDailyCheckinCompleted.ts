import type { DailyCheckin, DailyCheckinQuestion } from './dailyCheckinApi';

export function isDailyCheckinCompleted(
  checkin: Pick<DailyCheckin, 'questions'> | null | undefined
): boolean {
  const questions = checkin?.questions;
  if (!questions || questions.length === 0) return false;
  return questions.every((q: DailyCheckinQuestion) => q.answer != null);
}
