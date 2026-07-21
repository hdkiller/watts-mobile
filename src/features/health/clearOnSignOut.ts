import { unregisterHealthSyncBackgroundTask } from './backgroundTask';
import { clearSyncLedger } from './ledger';
import { clearHealthSyncPreferences } from './syncPreferences';
import { clearWatermarks } from './watermarks';

/** Clear local Health Sync state on sign-out (ledger + preferences + watermarks + BG). */
export async function clearHealthSyncOnSignOut(): Promise<void> {
  try {
    await unregisterHealthSyncBackgroundTask();
  } catch {
    // ignore
  }
  await Promise.all([clearSyncLedger(), clearHealthSyncPreferences(), clearWatermarks()]);
}
