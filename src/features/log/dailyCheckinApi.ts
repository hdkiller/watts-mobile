import { apiFetch } from '@/src/api/client';

export type DailyCheckinQuestion = {
  id: string;
  text: string;
  category?: string;
  answer?: 'YES' | 'NO' | null;
};

export type DailyCheckin = {
  id: string;
  userId: string;
  date: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'SAVED';
  questions: DailyCheckinQuestion[];
  userNotes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchTodayDailyCheckin(): Promise<DailyCheckin | null> {
  const response = await apiFetch('/api/checkin/today');
  if (response.status === 204 || response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to load today's check-in (${response.status})`);
  }
  const text = await response.text();
  if (!text || text === 'null') return null;
  return JSON.parse(text) as DailyCheckin;
}

export async function generateDailyCheckin(force = false): Promise<DailyCheckin> {
  const response = await apiFetch('/api/checkin/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ force }),
  });

  if (!response.ok) {
    let message = `Generation failed (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string; statusMessage?: string };
      if (response.status === 429) {
        throw new Error(body.message || 'Quota exceeded for daily check-in.');
      }
      message = body.message || body.statusMessage || message;
    } catch (e: any) {
      if (e.message) throw e;
    }
    throw new Error(message);
  }

  return response.json();
}

export async function submitDailyCheckinAnswers(
  checkinId: string,
  answers: Record<string, 'YES' | 'NO'>,
  userNotes?: string
): Promise<DailyCheckin> {
  const response = await apiFetch('/api/checkin/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checkinId, answers, userNotes }),
  });

  if (!response.ok) {
    let message = `Failed to save answers (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string; statusMessage?: string };
      message = body.message || body.statusMessage || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.json();
}
