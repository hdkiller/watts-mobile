import { beforeEach, describe, expect, it, vi } from 'vitest';

import { recordBackgroundSyncFailure } from '../backgroundTask';
import { _resetSyncLedgerForTests, loadSyncLedger } from '../ledger';
import { localDateYmd } from '../mapToWellnessPayload';

vi.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  return {
    default: {
      getItem: vi.fn(async (key: string) => store[key] ?? null),
      setItem: vi.fn(async (key: string, val: string) => {
        store[key] = val;
      }),
      removeItem: vi.fn(async (key: string) => {
        delete store[key];
      }),
      clear: vi.fn(async () => {
        store = {};
      }),
    },
  };
});

describe('backgroundTask error reporting', () => {
  beforeEach(() => {
    _resetSyncLedgerForTests();
  });

  it('records failed background sync runs in syncLedger with error reason', async () => {
    const errorReason = 'Permission denied reading HealthKit wellness samples';
    await recordBackgroundSyncFailure(errorReason);

    const ledger = await loadSyncLedger();
    const today = localDateYmd(new Date());
    const item = ledger.find((i) => i.id === `wellness:${today}`);

    expect(item).toBeDefined();
    expect(item?.status).toBe('failed');
    expect(item?.lastError).toBe(errorReason);
  });
});
