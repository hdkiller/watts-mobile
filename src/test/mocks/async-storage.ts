import { vi } from 'vitest';

const storage = new Map<string, string>();

const mockAsyncStorage = {
  getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
  setItem: vi.fn(async (key: string, value: string) => {
    storage.set(key, value);
  }),
  removeItem: vi.fn(async (key: string) => {
    storage.delete(key);
  }),
  clear: vi.fn(async () => {
    storage.clear();
  }),
  getAllKeys: vi.fn(async () => Array.from(storage.keys())),
  multiGet: vi.fn(async (keys: string[]) => keys.map((k) => [k, storage.get(k) ?? null])),
  multiSet: vi.fn(async (keyValuePairs: [string, string][]) => {
    for (const [k, v] of keyValuePairs) {
      storage.set(k, v);
    }
  }),
  multiRemove: vi.fn(async (keys: string[]) => {
    for (const k of keys) {
      storage.delete(k);
    }
  }),
};

export default mockAsyncStorage;
