import { localDateKey } from '@/src/features/today/weekGlance';

import type { CalendarEventGlance, EventApi } from './types';

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Whole local calendar days from today to event date (can be negative if past). */
export function daysUntilLocal(eventDate: string | Date | null | undefined, now = new Date()): number | null {
  const key = localDateKey(eventDate);
  if (!key) return null;
  const [y, m, d] = key.split('-').map(Number);
  const eventDay = new Date(y, m - 1, d);
  const today = startOfLocalDay(now);
  const ms = eventDay.getTime() - today.getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

export function countdownLabel(daysUntil: number): string {
  if (daysUntil === 0) return 'Today';
  if (daysUntil === 1) return '1 day';
  return `${daysUntil} days`;
}

export function mapEventGlance(raw: EventApi, now = new Date()): CalendarEventGlance | null {
  const days = daysUntilLocal(raw.date, now);
  if (days == null || days < 0) return null;
  const title = raw.title?.trim();
  if (!title) return null;
  return {
    id: raw.id,
    title,
    date: raw.date ? String(raw.date) : null,
    type: raw.type ?? null,
    daysUntil: days,
    countdownLabel: countdownLabel(days),
  };
}

/** Upcoming events sorted soonest-first; past excluded. */
export function mapUpcomingEvents(raw: EventApi[] | undefined, now = new Date()): CalendarEventGlance[] {
  const glances = (raw ?? [])
    .map((e) => mapEventGlance(e, now))
    .filter((e): e is CalendarEventGlance => e != null);
  glances.sort((a, b) => a.daysUntil - b.daysUntil || a.title.localeCompare(b.title));
  return glances;
}

export function pickNextEvent(events: CalendarEventGlance[] | undefined): CalendarEventGlance | null {
  return events?.[0] ?? null;
}
