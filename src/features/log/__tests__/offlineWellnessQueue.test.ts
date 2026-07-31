import { beforeEach, describe, expect, it, vi } from 'vitest';

import { onlineManager } from '@tanstack/react-query';

import { saveWellnessCheckin } from '../api';
import {
  clearPendingWellnessCheckin,
  enqueueWellnessCheckin,
  flushPendingWellnessCheckin,
  loadPendingWellnessCheckin,
} from '../offlineWellnessQueue';

vi.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    default: {
      getItem: vi.fn(async (key: string) => store.get(key) ?? null),
      setItem: vi.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: vi.fn(async (key: string) => {
        store.delete(key);
      }),
    },
  };
});

vi.mock('@tanstack/react-query', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
  return {
    ...actual,
    onlineManager: {
      isOnline: vi.fn(() => true),
      subscribe: vi.fn(() => () => {}),
    },
  };
});

vi.mock('../api', () => ({
  saveWellnessCheckin: vi.fn(async () => undefined),
}));

describe('offlineWellnessQueue', () => {
  beforeEach(async () => {
    await clearPendingWellnessCheckin();
    vi.mocked(saveWellnessCheckin).mockClear();
    vi.mocked(onlineManager.isOnline).mockReturnValue(true);
  });

  it('enqueues and loads a pending check-in', async () => {
    await enqueueWellnessCheckin({ date: '2026-07-20', mood: 4 });
    const pending = await loadPendingWellnessCheckin();
    expect(pending?.payload).toEqual({ date: '2026-07-20', mood: 4 });
    expect(pending?.queuedAt).toEqual(expect.any(Number));
  });

  it('flushes when online and clears the queue', async () => {
    await enqueueWellnessCheckin({ date: '2026-07-20', sleepHours: 7.5 });
    const synced = await flushPendingWellnessCheckin();
    expect(synced).toBe(true);
    expect(saveWellnessCheckin).toHaveBeenCalledWith({ date: '2026-07-20', sleepHours: 7.5 });
    expect(await loadPendingWellnessCheckin()).toBeNull();
  });

  it('skips flush while offline', async () => {
    vi.mocked(onlineManager.isOnline).mockReturnValue(false);
    await enqueueWellnessCheckin({ date: '2026-07-20', mood: 3 });
    expect(await flushPendingWellnessCheckin()).toBe(false);
    expect(saveWellnessCheckin).not.toHaveBeenCalled();
    expect(await loadPendingWellnessCheckin()).not.toBeNull();
  });

  it('does not drop a newer check-in queued while a flush is in flight', async () => {
    await enqueueWellnessCheckin({ date: '2026-07-20', mood: 2 });

    // Simulate the athlete saving a new check-in while the POST for the
    // first one is still in flight: swap the "in-flight" payload into
    // storage for a newer one mid-flush, before clear-if-unchanged runs.
    vi.mocked(saveWellnessCheckin).mockImplementationOnce(async () => {
      await enqueueWellnessCheckin({ date: '2026-07-21', mood: 5 });
    });

    const synced = await flushPendingWellnessCheckin();
    expect(synced).toBe(true);

    // The newer, queued-during-flush check-in must survive the flush's clear.
    const remaining = await loadPendingWellnessCheckin();
    expect(remaining?.payload).toEqual({ date: '2026-07-21', mood: 5 });
  });
});
