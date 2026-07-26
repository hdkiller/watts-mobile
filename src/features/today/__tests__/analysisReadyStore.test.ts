import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  _resetAnalysisReadyStoreForTests,
  isAnalysisSeenSync,
  loadSeenAnalysisIds,
  markAnalysisSeen,
} from '../analysisReadyStore';

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

describe('analysisReadyStore', () => {
  beforeEach(() => {
    _resetAnalysisReadyStoreForTests();
    vi.clearAllMocks();
  });

  it('loads empty set by default', async () => {
    const ids = await loadSeenAnalysisIds();
    expect(ids.size).toBe(0);
    expect(isAnalysisSeenSync('act-1')).toBe(false);
  });

  it('marks analysis as seen, updates memory sync, and persists', async () => {
    await markAnalysisSeen('act-1');
    expect(isAnalysisSeenSync('act-1')).toBe(true);

    const ids = await loadSeenAnalysisIds();
    expect(ids.has('act-1')).toBe(true);
  });

  it('caps memory and storage growth to 40 items', async () => {
    for (let i = 1; i <= 50; i++) {
      await markAnalysisSeen(`act-${i}`);
    }

    const ids = await loadSeenAnalysisIds();
    expect(ids.size).toBe(40);
    expect(ids.has('act-1')).toBe(false);
    expect(ids.has('act-11')).toBe(true);
    expect(ids.has('act-50')).toBe(true);
  });
});
