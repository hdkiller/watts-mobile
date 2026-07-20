import { apiFetch } from '@/src/api/client';
import { ApiError } from '@/src/api/errors';

export type AdHocWorkoutRequest = {
  type: 'Ride' | 'Run' | 'Swim' | 'WeightTraining';
  durationMinutes: number;
  intensity: 'Recovery' | 'Endurance' | 'Tempo' | 'Threshold' | 'VO2Max' | 'Anaerobic';
  notes?: string;
};

export type AdHocWorkoutResponse = {
  success: boolean;
  jobId?: string;
  message?: string;
};

async function readApiError(response: Response, fallback: string): Promise<ApiError> {
  let message = fallback;
  let body: unknown;
  try {
    body = await response.json();
    const parsed = body as { message?: string; statusMessage?: string };
    message = parsed.message || parsed.statusMessage || message;
  } catch {
    // keep fallback
  }
  return new ApiError(message, response.status, body);
}

/** Trigger AI ad-hoc planned workout generation for today. */
export async function generateAdHocWorkout(
  payload: AdHocWorkoutRequest
): Promise<AdHocWorkoutResponse> {
  const response = await apiFetch('/api/workouts/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await readApiError(response, `Ad-hoc generation failed (${response.status})`);
    if (response.status === 429) {
      throw new ApiError(
        err.message || 'Quota exceeded for workout generation.',
        429,
        err.body
      );
    }
    throw err;
  }

  return response.json();
}

export async function fetchAdHocGenerateStatus(jobId?: string): Promise<{
  isRunning: boolean;
  task: string | null;
}> {
  const path = jobId
    ? `/api/workouts/generate-status?jobId=${encodeURIComponent(jobId)}`
    : '/api/workouts/generate-status';
  const response = await apiFetch(path);
  if (!response.ok) {
    throw new ApiError(`Failed to load ad-hoc status (${response.status})`, response.status);
  }
  return response.json();
}
