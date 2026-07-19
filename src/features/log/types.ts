export type LogFormValues = {
  mood: number | null;
  stress: number | null;
  fatigue: number | null;
  soreness: number | null;
  sleepHours: string;
  notes: string;
  weight: string;
};

export type WellnessDay = {
  id: string;
  date: string;
  mood: number | null;
  stress: number | null;
  fatigue: number | null;
  soreness: number | null;
  sleepHours: number | null;
  comments: string | null;
  weight: number | null;
};

export type WellnessUploadPayload = {
  date: string;
  mood?: number;
  stress?: number;
  fatigue?: number;
  soreness?: number;
  sleepHours?: number;
  comments?: string;
  weight?: number;
};
