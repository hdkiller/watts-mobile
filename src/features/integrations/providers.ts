import type { CuratedProviderKey } from './types';

export type CuratedProviderDef = {
  key: CuratedProviderKey;
  label: string;
};

/** Fixed primary set always shown on Connected Apps lite. */
export const CURATED_PROVIDERS: readonly CuratedProviderDef[] = [
  { key: 'garmin', label: 'Garmin' },
  { key: 'whoop', label: 'WHOOP' },
  { key: 'oura', label: 'Oura' },
  { key: 'strava', label: 'Strava' },
  { key: 'intervals', label: 'Intervals.icu' },
  { key: 'polar', label: 'Polar' },
  { key: 'wahoo', label: 'Wahoo' },
  { key: 'fitbit', label: 'Fitbit' },
  { key: 'withings', label: 'Withings' },
] as const;

export const CONNECTED_APPS_WEB_PATH = '/settings/apps';
