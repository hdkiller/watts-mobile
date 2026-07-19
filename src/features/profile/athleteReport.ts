import { apiFetch } from '@/src/api/client';

import {
  mapAthleteProfileReport,
  type AthleteProfileReport,
} from './mapAthleteReport';

export type { AthleteProfileReport, AthleteScoreChip } from './mapAthleteReport';
export { mapAthleteProfileReport } from './mapAthleteReport';

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as {
      message?: string;
      statusMessage?: string;
    };
    if (body.message || body.statusMessage) {
      return body.message || body.statusMessage || fallback;
    }
  } catch {
    // ignore
  }
  return fallback;
}

export async function fetchLatestAthleteProfileReport(): Promise<AthleteProfileReport | null> {
  const response = await apiFetch('/api/reports?type=ATHLETE_PROFILE&limit=1');
  if (response.status === 401 || response.status === 403) {
    const err = new Error('Athlete profile reports require sign-in with profile access') as Error & {
      status?: number;
    };
    err.status = response.status;
    throw err;
  }
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to load report (${response.status})`));
  }
  const json = await response.json();
  const first = Array.isArray(json) ? json[0] : null;
  if (!first) return null;
  return mapAthleteProfileReport(first);
}

export async function generateAthleteProfile(): Promise<{ reportId: string }> {
  const response = await apiFetch('/api/profile/generate', { method: 'POST' });
  if (response.status === 429) {
    const err = new Error(
      await readErrorMessage(response, 'Quota exceeded for athlete profile generation.')
    ) as Error & { status?: number };
    err.status = 429;
    throw err;
  }
  if (!response.ok) {
    const err = new Error(
      await readErrorMessage(response, `Failed to start profile sync (${response.status})`)
    ) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }
  const json = (await response.json()) as { reportId?: string };
  if (!json.reportId) {
    throw new Error('Generate response missing reportId');
  }
  return { reportId: json.reportId };
}

export async function pollAthleteProfileReport(
  opts: { timeoutMs?: number; intervalMs?: number } = {}
): Promise<AthleteProfileReport | null> {
  const timeoutMs = opts.timeoutMs ?? 120_000;
  const intervalMs = opts.intervalMs ?? 3_000;
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const report = await fetchLatestAthleteProfileReport();
    if (!report) {
      await sleep(intervalMs);
      continue;
    }
    if (report.status === 'COMPLETED' || report.status === 'FAILED') {
      return report;
    }
    await sleep(intervalMs);
  }

  return fetchLatestAthleteProfileReport();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
