import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { extractFirstWeekPreview, generateFirstWeekPreview } from '../api';
import type { PlanInitializeResult } from '../types';

const { apiFetch } = vi.hoisted(() => ({ apiFetch: vi.fn() }));

vi.mock('@/src/api/client', () => ({ apiFetch }));

const initialized: PlanInitializeResult = {
  planId: 'plan-1',
  plan: {
    id: 'plan-1',
    blocks: [{ id: 'block-1', weeks: [{ id: 'week-1', workouts: [] }] }],
  },
};

describe('plan preview', () => {
  beforeEach(() => {
    apiFetch.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

  it('requests a real generated week and polls the draft plan', async () => {
    apiFetch
      .mockResolvedValueOnce(new Response(JSON.stringify({ jobId: 'run-1' }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 'plan-1',
            blocks: [
              {
                id: 'block-1',
                weeks: [
                  {
                    id: 'generated-week',
                    workouts: [
                      {
                        id: 'workout-1',
                        title: 'Aerobic ride',
                        date: '2026-07-22T00:00:00.000Z',
                        durationSec: 3600,
                      },
                    ],
                  },
                ],
              },
            ],
          }),
          { status: 200 }
        )
      );

    const resultPromise = generateFirstWeekPreview(initialized, { pollMs: 1, timeoutMs: 100 });
    await vi.advanceTimersByTimeAsync(1);
    const result = await resultPromise;

    expect(result).toMatchObject([{ id: 'workout-1', duration: 60 }]);
    expect(apiFetch).toHaveBeenNthCalledWith(1, '/api/plans/generate-ai-week', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockId: 'block-1', weekId: 'week-1' }),
    });
    expect(apiFetch).toHaveBeenNthCalledWith(2, '/api/plans/plan-1');
  });

  it('maps durationSec from server plan detail responses', () => {
    const preview = extractFirstWeekPreview({
      ...initialized,
      plan: {
        ...initialized.plan!,
        blocks: [{ weeks: [{ workouts: [{ title: 'Run', durationSec: 2700 }] }] }],
      },
    });
    expect(preview[0]?.duration).toBe(45);
  });
});
