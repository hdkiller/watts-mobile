import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/src/api/errors';

import { waitForPlanJob } from '../api';

const { apiFetch } = vi.hoisted(() => ({ apiFetch: vi.fn() }));

vi.mock('@/src/api/client', () => ({ apiFetch }));

describe('waitForPlanJob', () => {
  beforeEach(() => {
    apiFetch.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

  it('polls until the job completes successfully', async () => {
    apiFetch
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: 'EXECUTING', completed: false }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: 'COMPLETED', completed: true }), { status: 200 })
      );

    const done = waitForPlanJob('run-1', { pollMs: 10, timeoutMs: 1_000 });
    await vi.advanceTimersByTimeAsync(10);
    await done;

    expect(apiFetch).toHaveBeenCalledTimes(2);
    expect(apiFetch).toHaveBeenNthCalledWith(1, '/api/plans/status?jobId=run-1');
  });

  it('throws when the job fails', async () => {
    apiFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'FAILURE', completed: true }), { status: 200 })
    );

    await expect(waitForPlanJob('run-fail', { pollMs: 10, timeoutMs: 1_000 })).rejects.toBeInstanceOf(
      ApiError
    );
  });
});
