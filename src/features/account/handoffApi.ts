import { apiFetch } from '@/src/api/client';

export type AppWebHandoffResponse = {
  url: string;
  expiresIn: number;
};

export async function mintAppWebHandoff(returnTo = '/'): Promise<AppWebHandoffResponse> {
  const response = await apiFetch('/api/auth/app-web-handoff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ returnTo }),
  });

  if (!response.ok) {
    throw new Error(`Handoff mint failed (${response.status})`);
  }

  return (await response.json()) as AppWebHandoffResponse;
}
