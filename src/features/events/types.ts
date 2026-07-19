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
  /** Priority A/B/C when present on the Event model / goals join */
  priority?: string | null;
};

export type CalendarEventGlance = {
  id: string;
  title: string;
  date: string | null;
  type: string | null;
  /** Whole local days until event (0 = today). */
  daysUntil: number;
  countdownLabel: string;
};
