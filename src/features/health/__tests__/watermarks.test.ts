import { beforeEach, describe, expect, it } from 'vitest';

import { LOOKBACK_DAYS, WATERMARK_OVERLAP_MS } from '../types';
import { _resetWatermarksForTests, resolveReadWindow } from '../watermarks';

describe('watermarks', () => {
  beforeEach(() => {
    _resetWatermarksForTests();
  });

  it('returns full lookback when no watermark', async () => {
    const window = await resolveReadWindow('wellness');
    expect(window.lookbackDays).toBe(LOOKBACK_DAYS);
    expect(window.from).toBeUndefined();
  });

  it('returns full lookback on fullResync', async () => {
    const window = await resolveReadWindow('wellness', { fullResync: true });
    expect(window.from).toBeUndefined();
    expect(window.lookbackDays).toBe(LOOKBACK_DAYS);
  });

  it('overlap constant is 6 hours', () => {
    expect(WATERMARK_OVERLAP_MS).toBe(6 * 60 * 60 * 1000);
  });
});
