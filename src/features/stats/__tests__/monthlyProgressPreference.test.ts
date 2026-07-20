import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = new Map<string, string>();

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      storage.set(key, value);
    }),
  },
}));

describe('monthlyProgressPreference', () => {
  beforeEach(async () => {
    storage.clear();
    vi.resetModules();
    const mod = await import('../monthlyProgressPreference');
    mod._resetMonthlyProgressMetricForTests();
  });

  it('defaults to tss and persists selection', async () => {
    const mod = await import('../monthlyProgressPreference');
    expect(mod.getMonthlyProgressMetricSync()).toBe('tss');

    await mod.setMonthlyProgressMetric('distance');
    expect(mod.getMonthlyProgressMetricSync()).toBe('distance');
    expect(mod.monthlyMetricLabel('distance')).toBe('Distance');

    mod._resetMonthlyProgressMetricForTests();
    const loaded = await mod.loadMonthlyProgressMetric();
    expect(loaded).toBe('distance');
  });
});
