export type TimeInterval = { start: number; end: number };

/** Merge overlapping/adjacent intervals and return total covered milliseconds. */
export function mergeIntervalDurationMs(intervals: TimeInterval[]): number {
  const valid = intervals
    .filter((i) => Number.isFinite(i.start) && Number.isFinite(i.end) && i.end > i.start)
    .sort((a, b) => a.start - b.start);
  if (valid.length === 0) return 0;

  let total = 0;
  let curStart = valid[0]!.start;
  let curEnd = valid[0]!.end;
  for (let i = 1; i < valid.length; i += 1) {
    const next = valid[i]!;
    if (next.start <= curEnd) {
      curEnd = Math.max(curEnd, next.end);
    } else {
      total += curEnd - curStart;
      curStart = next.start;
      curEnd = next.end;
    }
  }
  total += curEnd - curStart;
  return total;
}

/** Local window for "last night": yesterday 18:00 → now. */
export function lastNightSleepWindow(now = new Date()): { from: Date; to: Date } {
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 18, 0, 0, 0);
  return { from, to: now };
}
