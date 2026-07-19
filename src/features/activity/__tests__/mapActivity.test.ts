import { describe, expect, it } from 'vitest';

import {
  formatDuration,
  mapPlannedDetail,
  mapPlannedStructure,
  mapWorkoutListItem,
  mapWorkoutStatus,
} from '../mapActivity';

describe('mapWorkoutStatus', () => {
  it('maps COMPLETED to Ready', () => {
    expect(mapWorkoutStatus({ aiAnalysisStatus: 'COMPLETED' })).toEqual({
      kind: 'ready',
      label: 'Ready',
    });
  });

  it('maps PROCESSING and PENDING to Processing…', () => {
    expect(mapWorkoutStatus({ aiAnalysisStatus: 'PROCESSING' }).label).toBe('Processing…');
    expect(mapWorkoutStatus({ aiAnalysisStatus: 'PENDING' }).kind).toBe('processing');
  });

  it('maps FAILED honestly', () => {
    expect(mapWorkoutStatus({ aiAnalysisStatus: 'FAILED' })).toEqual({
      kind: 'failed',
      label: 'Analysis failed',
    });
  });

  it('maps NOT_STARTED and unknowns to Uploaded without inventing sync progress', () => {
    expect(mapWorkoutStatus({ aiAnalysisStatus: 'NOT_STARTED' }).label).toBe('Uploaded');
    expect(mapWorkoutStatus({}).label).toBe('Uploaded');
    expect(mapWorkoutStatus({ aiAnalysisStatus: 'WEIRD_STATE' }).label).toBe('Uploaded');
  });
});

describe('mapWorkoutListItem', () => {
  it('maps core list fields', () => {
    const item = mapWorkoutListItem({
      id: 'w1',
      title: 'Morning ride',
      date: '2026-07-18T08:00:00.000Z',
      type: 'Ride',
      durationSec: 3600,
      tss: 72.4,
      aiAnalysisStatus: 'COMPLETED',
    });
    expect(item).toMatchObject({
      id: 'w1',
      title: 'Morning ride',
      type: 'Ride',
      durationSec: 3600,
      tss: 72.4,
      status: { kind: 'ready', label: 'Ready' },
    });
  });
});

describe('mapPlannedStructure', () => {
  it('returns empty when structure is absent', () => {
    expect(mapPlannedStructure(null)).toEqual([]);
    expect(mapPlannedStructure({})).toEqual([]);
  });

  it('maps steps with name, duration, and intensity when present', () => {
    const steps = mapPlannedStructure({
      steps: [
        { name: 'Warm-up', durationSeconds: 600, power: { value: 150 } },
        { type: 'Interval', durationSeconds: 300, rpe: 7 },
        {
          name: 'Main set',
          reps: 3,
          steps: [{ name: 'On', durationSeconds: 120, power: { range: { min: 250, max: 280 } } }],
        },
      ],
    });

    expect(steps[0]).toMatchObject({
      name: 'Warm-up',
      durationSec: 600,
      intensityLabel: '150 W',
    });
    expect(steps[1]).toMatchObject({
      name: 'Interval',
      durationSec: 300,
      intensityLabel: 'RPE 7',
    });
    expect(steps.some((s) => s.name.includes('×3'))).toBe(true);
    expect(steps.some((s) => s.intensityLabel === '250–280 W')).toBe(true);
  });

  it('does not invent intervals from description-only payloads', () => {
    expect(mapPlannedStructure({ description: 'Do 5x5' })).toEqual([]);
  });
});

describe('mapPlannedDetail', () => {
  it('includes structure steps from structuredWorkout', () => {
    const detail = mapPlannedDetail({
      id: 'p1',
      title: 'Sweet Spot',
      type: 'Ride',
      durationSec: 5400,
      tss: 90,
      description: 'Steady',
      structuredWorkout: { steps: [{ name: 'SS', durationSeconds: 1200 }] },
    });
    expect(detail.structureSteps).toHaveLength(1);
    expect(detail.structureSteps[0]?.name).toBe('SS');
  });
});

describe('formatDuration', () => {
  it('formats minutes and hours', () => {
    expect(formatDuration(1800)).toBe('30 min');
    expect(formatDuration(7200)).toBe('2h');
    expect(formatDuration(5400)).toBe('1h 30m');
    expect(formatDuration(null)).toBeNull();
  });
});
