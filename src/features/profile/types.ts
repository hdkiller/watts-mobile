export type WeightUnits = 'Kilograms' | 'Pounds';
export type DistanceUnits = 'Kilometers' | 'Miles';
export type TemperatureUnits = 'Celsius' | 'Fahrenheit';

export type AiPersona = 'Analytical' | 'Supportive' | 'Drill Sergeant' | 'Motivational';

export type AthleteProfile = {
  name: string | null;
  nickname: string | null;
  email: string | null;
  country: string | null;
  dob: string | null;
  weightKg: number | null;
  weightUnits: WeightUnits;
  distanceUnits: DistanceUnits;
  temperatureUnits: TemperatureUnits;
  timezone: string | null;
  aiContext: string | null;
  ftp: number | null;
  maxHr: number | null;
  lthr: number | null;
  restingHr: number | null;
  /** Matches web: omit/undefined treated as enabled. */
  nutritionTrackingEnabled: boolean;
};

export type AthleteMetricsFormValues = {
  weight: string;
  ftp: string;
  maxHr: string;
  lthr: string;
};

export type AthleteMetricsPatch = {
  weight?: number | null;
  weightUnits?: WeightUnits;
  ftp?: number | null;
  maxHr?: number | null;
  lthr?: number | null;
};

export type UnitsLocalePatch = {
  distanceUnits?: DistanceUnits;
  weightUnits?: WeightUnits;
  temperatureUnits?: TemperatureUnits;
  timezone?: string | null;
};

export type CoachIdentityProfilePatch = {
  nickname?: string | null;
  aiContext?: string | null;
};

export type AiSettingsLite = {
  aiPersona: AiPersona;
  aiRequireToolApproval: boolean;
  nickname: string | null;
  aiContext: string | null;
};

export type AiSettingsLitePatch = {
  aiPersona?: AiPersona;
  aiRequireToolApproval?: boolean;
};
