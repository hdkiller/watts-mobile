export type EventPriority = 'A' | 'B' | 'C';

export type CreateEventInput = {
  title: string;
  date: string;
  type?: string;
  subType?: string;
  priority?: EventPriority | null;
  location?: string;
  city?: string;
  country?: string;
  description?: string;
  startTime?: string;
};

export type EventGoalApi = {
  id: string;
  title?: string | null;
  status?: string | null;
  targetDate?: string | Date | null;
  targetValue?: number | null;
  metric?: string | null;
  priority?: string | null;
};

export type EventApi = {
  id: string;
  title?: string | null;
  date?: string | Date | null;
  type?: string | null;
  subType?: string | null;
  distance?: number | null;
  elevation?: number | null;
  expectedDuration?: number | null;
  terrain?: string | null;
  source?: string | null;
  city?: string | null;
  country?: string | null;
  location?: string | null;
  description?: string | null;
  startTime?: string | null;
  websiteUrl?: string | null;
  /** Priority A/B/C when present on the Event model / goals join */
  priority?: string | null;
  goals?: EventGoalApi[] | null;
};

export type CalendarEventGlance = {
  id: string;
  title: string;
  date: string | null;
  type: string | null;
  subType: string | null;
  /** Web-parity meta: `subType|type · city, country` (location fallback). */
  meta: string;
  /** Local month abbreviation for date block (e.g. Jul). */
  monthLabel: string | null;
  /** Local day-of-month for date block. */
  dayLabel: string | null;
  priority: string | null;
  /** Whole local days until event (0 = today). */
  daysUntil: number;
  countdownLabel: string;
};

export type EventGoalGlance = {
  id: string;
  title: string;
  status: string | null;
  targetDateLabel: string | null;
};

export type EventDetail = {
  id: string;
  title: string;
  date: string | null;
  dateLabel: string | null;
  type: string | null;
  subType: string | null;
  typeLine: string | null;
  priority: string | null;
  distanceKm: number | null;
  elevationM: number | null;
  locationLabel: string | null;
  startTime: string | null;
  description: string | null;
  websiteUrl: string | null;
  daysUntil: number | null;
  countdownLabel: string | null;
  goals: EventGoalGlance[];
};
