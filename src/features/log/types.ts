export type LogFormValues = {
  readiness: string;
  sleepHours: string;
  sleepQuality: string;
  notes: string;
  weight: string;
};

export type WellnessDay = {
  id: string;
  date: string;
  readiness: number | null;
  sleepHours: number | null;
  sleepQuality: number | null;
  comments: string | null;
  weight: number | null;
};

export type WellnessUploadPayload = {
  date: string;
  readiness?: number;
  sleepHours?: number;
  sleepQuality?: number;
  comments?: string;
  weight?: number;
};
