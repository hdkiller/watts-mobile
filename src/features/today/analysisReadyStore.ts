import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'watts.analysisReady.seen.v1';

/** In-memory cache so Today can hide a card immediately after dismiss. */
let memorySeen = new Set<string>();
let hydrated = false;

async function ensureHydrated(): Promise<void> {
  if (hydrated) return;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        memorySeen = new Set(parsed.filter((id): id is string => typeof id === 'string'));
      }
    }
  } catch {
    // Ignore corrupt storage — start fresh.
  }
  hydrated = true;
}

export async function loadSeenAnalysisIds(): Promise<Set<string>> {
  await ensureHydrated();
  return new Set(memorySeen);
}

export function isAnalysisSeenSync(activityId: string): boolean {
  return memorySeen.has(activityId);
}

export async function markAnalysisSeen(activityId: string): Promise<void> {
  await ensureHydrated();
  memorySeen.add(activityId);
  // Cap growth — keep most recent ~40 ids.
  const ids = [...memorySeen];
  if (ids.length > 40) {
    memorySeen = new Set(ids.slice(-40));
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...memorySeen]));
}

/** Test helper */
export function _resetAnalysisReadyStoreForTests(): void {
  memorySeen = new Set();
  hydrated = false;
}
