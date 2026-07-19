import { describe, expect, it } from 'vitest';

import { heuristicCoachNote, mapWellnessOverview } from '../mapWellnessOverview';

describe('mapWellnessOverview', () => {
  it('maps metrics, 7-day bars, and AI coach note', () => {
    const overview = mapWellnessOverview({
      id: 'w1',
      date: '2026-07-18',
      hrv: 55,
      sleepHours: 7.2,
      restingHr: 48,
      recoveryScore: 70,
      readiness: 8,
      weight: 72.5,
      stress: 3,
      mood: 7,
      aiAnalysisJson: {
        executive_summary: 'Solid recovery day.',
      },
      trends: {
        hrv: {
          value: 55,
          history: [
            { date: '2026-07-12', value: 50 },
            { date: '2026-07-13', value: 52 },
            { date: '2026-07-14', value: 51 },
            { date: '2026-07-15', value: 53 },
            { date: '2026-07-16', value: 54 },
            { date: '2026-07-17', value: 49 },
            { date: '2026-07-18', value: 55 },
          ],
        },
        sleepHours: {
          value: 7.2,
          history: [
            { date: '2026-07-12', value: 7 },
            { date: '2026-07-18', value: 7.2 },
          ],
        },
        restingHr: {
          value: 48,
          history: [
            { date: '2026-07-17', value: 50 },
            { date: '2026-07-18', value: 48 },
          ],
        },
        recoveryScore: {
          value: 70,
          history: [
            { date: '2026-07-17', value: 60 },
            { date: '2026-07-18', value: 70 },
          ],
        },
      },
    });

    expect(overview).not.toBeNull();
    expect(overview!.date).toBe('2026-07-18');
    expect(overview!.coachNote).toBe('Solid recovery day.');
    expect(overview!.metrics.map((m) => m.key)).toEqual(
      expect.arrayContaining(['hrv', 'sleep', 'restingHr', 'recoveryScore', 'readiness'])
    );
    expect(overview!.barSeries.map((s) => s.key)).toEqual(
      expect.arrayContaining(['sleep', 'hrv', 'restingHr', 'recoveryScore'])
    );
    const hrv = overview!.metrics.find((m) => m.key === 'hrv');
    expect(hrv?.trendPercent).not.toBeNull();
  });

  it('omits null metrics and returns null for empty payload', () => {
    expect(mapWellnessOverview(null)).toBeNull();
    const overview = mapWellnessOverview({
      date: '2026-07-18',
      hrv: 40,
      trends: {},
    });
    expect(overview!.metrics.map((m) => m.key)).toEqual(['hrv']);
    expect(overview!.barSeries).toEqual([]);
  });
});

describe('heuristicCoachNote', () => {
  it('returns high-recovery guidance', () => {
    expect(
      heuristicCoachNote({
        recoveryScore: 80,
        hrv: null,
        sleepHours: null,
        restingHr: null,
        restingHrTrendPercent: null,
      })
    ).toMatch(/well recovered/i);
  });
});
