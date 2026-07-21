export type VolumePreference = 'LOW' | 'MID' | 'HIGH';

export type PlanInitializeInput = {
  goalId: string;
  startDate: string;
  volumePreference: VolumePreference;
  preferredActivityTypes: string[];
  volumeHours?: number;
};

export type PlannedWorkoutPreview = {
  id?: string;
  title?: string | null;
  type?: string | null;
  date?: string | null;
  duration?: number | null;
  durationSec?: number | null;
};

export type PlanInitializeResult = {
  planId: string;
  plan?: {
    id: string;
    blocks?: {
      id?: string;
      weeks?: {
        id?: string;
        workouts?: PlannedWorkoutPreview[];
        startDate?: string;
        weekNumber?: number;
      }[];
    }[];
  };
};
