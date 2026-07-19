/** Curated fallback when `Intl.supportedValuesOf('timeZone')` is unavailable. */
const FALLBACK_TIMEZONES = [
  'UTC',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Warsaw',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Pacific/Auckland',
] as const;

export function listTimeZones(): string[] {
  try {
    const intl = Intl as typeof Intl & {
      supportedValuesOf?: (key: string) => string[];
    };
    const values = intl.supportedValuesOf?.('timeZone');
    if (Array.isArray(values) && values.length > 0) {
      return [...values].sort((a, b) => a.localeCompare(b));
    }
  } catch {
    // Hermes / older engines
  }
  return [...FALLBACK_TIMEZONES];
}

export function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function filterTimeZones(query: string, zones: string[] = listTimeZones()): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return zones;
  return zones.filter((z) => z.toLowerCase().includes(q));
}
