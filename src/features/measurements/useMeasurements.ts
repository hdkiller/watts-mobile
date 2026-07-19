import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createBodyMeasurement,
  fetchBodyMeasurements,
  softDeleteBodyMeasurement,
} from './api';
import type { CreateBodyMeasurementPayload } from './types';

export const BODY_MEASUREMENTS_KEY = ['body-measurements'] as const;

export function useBodyMeasurementsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: BODY_MEASUREMENTS_KEY,
    queryFn: () => fetchBodyMeasurements(),
    enabled: options?.enabled ?? true,
  });
}

export function useCreateBodyMeasurement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBodyMeasurementPayload) => createBodyMeasurement(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: BODY_MEASUREMENTS_KEY });
    },
  });
}

export function useSoftDeleteBodyMeasurement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => softDeleteBodyMeasurement(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: BODY_MEASUREMENTS_KEY });
    },
  });
}
