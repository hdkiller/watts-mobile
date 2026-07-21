import { describe, expect, it } from 'vitest';

import { buildMinimalFit, fitFilename } from '../buildMinimalFit';

describe('buildMinimalFit', () => {
  it('builds a FIT with header magic and trailing CRC', () => {
    const bytes = buildMinimalFit({
      platformSessionId: 's1',
      platform: 'healthkit',
      startedAt: '2026-07-20T08:00:00.000Z',
      endedAt: '2026-07-20T09:00:00.000Z',
      durationSec: 3600,
      sportType: 'running',
      title: 'Morning run',
    });
    expect(bytes.length).toBeGreaterThan(30);
    expect(String.fromCharCode(bytes[8]!, bytes[9]!, bytes[10]!, bytes[11]!)).toBe('.FIT');
    expect(fitFilename({
      platformSessionId: 's1',
      platform: 'healthkit',
      startedAt: '2026-07-20T08:00:00.000Z',
    })).toContain('.fit');
  });

  it('grows with an encoded heart-rate stream and stays a valid FIT', () => {
    const withoutHr = buildMinimalFit({
      platformSessionId: 's2',
      platform: 'healthkit',
      startedAt: '2026-07-20T08:00:00.000Z',
      endedAt: '2026-07-20T08:10:00.000Z',
      durationSec: 600,
      sportType: 'running',
    });
    const withHr = buildMinimalFit({
      platformSessionId: 's2',
      platform: 'healthkit',
      startedAt: '2026-07-20T08:00:00.000Z',
      endedAt: '2026-07-20T08:10:00.000Z',
      durationSec: 600,
      sportType: 'running',
      avgHeartRate: 140,
      maxHeartRate: 172,
      heartRateSamples: Array.from({ length: 60 }, (_, i) => ({
        t: new Date(Date.UTC(2026, 6, 20, 8, 0, i * 10)).toISOString(),
        bpm: 130 + (i % 40),
      })),
    });

    // Each record message adds bytes, so the HR file must be larger.
    expect(withHr.length).toBeGreaterThan(withoutHr.length);
    expect(String.fromCharCode(withHr[8]!, withHr[9]!, withHr[10]!, withHr[11]!)).toBe('.FIT');

    // Header declares data size; total = 14 (header) + data + 2 (CRC).
    const declaredData = new DataView(withHr.buffer).getUint32(4, true);
    expect(withHr.length).toBe(14 + declaredData + 2);
  });

  it('grows further with power + route + lap messages', () => {
    const withHr = buildMinimalFit({
      platformSessionId: 's3',
      platform: 'healthkit',
      startedAt: '2026-07-20T08:00:00.000Z',
      endedAt: '2026-07-20T08:10:00.000Z',
      durationSec: 600,
      sportType: 'cycling',
      avgHeartRate: 140,
      maxHeartRate: 172,
      heartRateSamples: [{ t: '2026-07-20T08:00:00.000Z', bpm: 140 }],
    });
    const rich = buildMinimalFit({
      platformSessionId: 's3',
      platform: 'healthkit',
      startedAt: '2026-07-20T08:00:00.000Z',
      endedAt: '2026-07-20T08:10:00.000Z',
      durationSec: 600,
      sportType: 'cycling',
      avgHeartRate: 140,
      maxHeartRate: 172,
      avgPower: 220,
      heartRateSamples: [{ t: '2026-07-20T08:00:00.000Z', bpm: 140 }],
      powerSamples: [{ t: '2026-07-20T08:00:00.000Z', watts: 220 }],
      routePoints: [
        { t: '2026-07-20T08:00:00.000Z', lat: 37.77, lon: -122.42 },
        { t: '2026-07-20T08:05:00.000Z', lat: 37.78, lon: -122.41 },
      ],
      laps: [
        {
          startedAt: '2026-07-20T08:00:00.000Z',
          endedAt: '2026-07-20T08:05:00.000Z',
          distanceMeters: 2000,
        },
      ],
    });
    expect(rich.length).toBeGreaterThan(withHr.length);
    expect(String.fromCharCode(rich[8]!, rich[9]!, rich[10]!, rich[11]!)).toBe('.FIT');
  });
});
