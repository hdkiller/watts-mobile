import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/src/api/errors';

import { waitForPlanJob } from '../api';
import { pollUntilDone } from '../jobPoller';

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
        new Response(JSON.stringify({ status: 'EXECUTING', completed: false }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: 'COMPLETED', completed: true }), { status: 200 }),
      );

    const done = waitForPlanJob('run-1', { pollMs: 10, timeoutMs: 1_000 });
    await vi.advanceTimersByTimeAsync(10);
    await done;

    expect(apiFetch).toHaveBeenCalledTimes(2);
    expect(apiFetch).toHaveBeenNthCalledWith(1, '/api/plans/status?jobId=run-1');
  });

  it('throws when the job fails', async () => {
    apiFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'FAILURE', completed: true }), { status: 200 }),
    );

    await expect(
      waitForPlanJob('run-fail', { pollMs: 10, timeoutMs: 1_000 }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('stops polling and rejects once the caller aborts (simulated unmount)', async () => {
    // Simulates a component unmount: the UI aborts its controller mid-poll, and the poller
    // must stop hitting /api/plans/status rather than keep running in the background.
    apiFetch.mockImplementation(
      async () =>
        new Response(JSON.stringify({ status: 'EXECUTING', completed: false }), { status: 200 }),
    );

    const controller = new AbortController();
    const done = waitForPlanJob('run-unmount', {
      pollMs: 10,
      timeoutMs: 1_000,
      signal: controller.signal,
    });
    const assertion = expect(done).rejects.toThrow('Aborted');

    await vi.advanceTimersByTimeAsync(10);
    const callsBeforeAbort = apiFetch.mock.calls.length;
    expect(callsBeforeAbort).toBeGreaterThan(0);

    controller.abort();
    await assertion;

    // Give any stray timers a chance to fire, then confirm no further polling happened.
    await vi.advanceTimersByTimeAsync(100);
    expect(apiFetch).toHaveBeenCalledTimes(callsBeforeAbort);
  });
});

describe('pollUntilDone', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('rejects immediately when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const check = vi.fn().mockResolvedValue({ done: false });

    await expect(
      pollUntilDone(check, { signal: controller.signal, pollMs: 10, timeoutMs: 1_000 }),
    ).rejects.toThrow('Aborted');
    expect(check).not.toHaveBeenCalled();
  });
});
