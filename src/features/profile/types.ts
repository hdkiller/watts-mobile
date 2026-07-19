export type WeightUnits = 'Kilograms' | 'Pounds';

export type AthleteProfile = {
  name: string | null;
  nickname: string | null;
  email: string | null;
  weightKg: number | null;
  weightUnits: WeightUnits;
  ftp: number | null;
  maxHr: number | null;
  lthr: number | null;
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
