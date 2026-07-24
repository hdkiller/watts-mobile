function titleCaseWords(value: string): string {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Human labels for plan strategy enums from coach-wattz. */
export function humanizePlanStrategy(strategy: string | null | undefined): string | null {
  if (!strategy) return null;
  const key = strategy.trim().toUpperCase();
  const map: Record<string, string> = {
    LINEAR: 'Linear',
    UNDULATING: 'Undulating',
    BLOCK: 'Block',
    POLARIZED: 'Polarized',
    REVERSE: 'Reverse',
    MAINTENANCE: 'Maintenance',
  };
  return map[key] ?? titleCaseWords(strategy.trim());
}

/** Training block type enums → athlete-facing label. */
export function humanizeBlockType(type: string | null | undefined): string | null {
  if (!type) return null;
  const key = type.trim().toUpperCase();
  const map: Record<string, string> = {
    BASE: 'Base',
    BUILD: 'Build',
    PEAK: 'Peak',
    RACE: 'Race',
    TRANSITION: 'Transition',
  };
  return map[key] ?? titleCaseWords(type.trim());
}

/** Nutrition meal status enums. */
export function humanizeMealStatus(status: string | null | undefined): string | null {
  if (!status) return null;
  const key = status.trim().toUpperCase();
  const map: Record<string, string> = {
    PLANNED: 'Planned',
    DONE: 'Done',
    COMPLETED: 'Done',
    SKIPPED: 'Skipped',
    LOCKED: 'Locked',
  };
  return map[key] ?? titleCaseWords(status.trim());
}

/** Fueling window type → short label. */
export function humanizeWindowType(windowType: string | null | undefined): string | null {
  if (!windowType) return null;
  return titleCaseWords(windowType.trim());
}

/** Volume target minutes → compact "7h" / "45m". */
export function formatVolumeHours(minutes: number | null | undefined): string | null {
  if (minutes == null || !Number.isFinite(minutes) || minutes <= 0) return null;
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = minutes / 60;
  const rounded = Math.round(hours * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}h` : `${rounded}h`;
}

/** Block type accent — delegates to theme `blockTypeColor`. */
export { blockTypeColor as blockTypeAccent } from '@/src/theme/colors';

/** First token of a block name for dense timeline labels. */
export function shortBlockLabel(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'Phase';
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

/** "Jul 22–28" or "Jul 28 – Aug 3" from YYYY-MM-DD keys. */
export function formatWeekRangeLabel(
  startKey: string | null | undefined,
  endKey: string | null | undefined
): string | null {
  if (!startKey) return null;
  const start = parseLocal(startKey);
  const end = parseLocal(endKey ?? startKey);
  if (!start || !end) return null;
  const startMonth = start.toLocaleDateString(undefined, { month: 'short' });
  const endMonth = end.toLocaleDateString(undefined, { month: 'short' });
  const startDay = start.getDate();
  const endDay = end.getDate();
  if (startMonth === endMonth) return `${startMonth} ${startDay}–${endDay}`;
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
}

/** Short chip label: "Wed 23". */
export function formatDayChipLabel(dateKey: string): string {
  const d = parseLocal(dateKey);
  if (!d) return dateKey;
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
}

/** Next N local calendar days as YYYY-MM-DD, starting today. */
export function upcomingLocalDateKeys(count: number, from: Date = new Date()): string[] {
  const keys: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    keys.push(localYmd(d));
  }
  return keys;
}

function parseLocal(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function localYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
