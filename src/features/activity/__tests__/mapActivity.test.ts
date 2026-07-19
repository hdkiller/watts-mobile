import { describe, expect, it } from 'vitest';

import {
  formatDistanceMeters,
  formatDuration,
  formatIntensityFactor,
  mapActivityAnalysis,
  mapCoachInstructions,
  mapPlannedDetail,
  mapPlannedStructure,
  mapWorkoutListItem,
  mapWorkoutStatus,
  mapWorkoutSummary,
  mapWorkoutSummaryMetrics,
  mapZoneSummary,
  stepIntensity,
  zoneIndexFromBandName,
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
    expect(mapPlannedStructure(null)).toEqual({ steps: [], isStrength: false });
    expect(mapPlannedStructure({})).toEqual({ steps: [], isStrength: false });
  });

  it('maps steps with name, duration, and intensity when present', () => {
    const { steps, isStrength } = mapPlannedStructure({
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

    expect(isStrength).toBe(false);
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
    expect(mapPlannedStructure({ description: 'Do 5x5' })).toEqual({
      steps: [],
      isStrength: false,
    });
  });

  it('maps strength blocks with setRows prescriptions', () => {
    const { steps, isStrength } = mapPlannedStructure({
      blocks: [
        {
          type: 'warmup',
          title: 'Warm-up',
          steps: [
            {
              name: 'Band Pull-Aparts',
              prescriptionMode: 'reps',
              setRows: [
                { value: '15', loadValue: '', restOverride: '45s' },
                { value: '15', loadValue: '', restOverride: '' },
              ],
            },
          ],
        },
        {
          type: 'single_exercise',
          title: 'Main lifts',
          steps: [
            {
              name: 'Back Squat',
              prescriptionMode: 'reps',
              defaultRest: '90s',
              setRows: [
                { value: '5', loadValue: '80kg' },
                { value: '5', loadValue: '85kg' },
                { value: '5', loadValue: '90kg' },
              ],
            },
            {
              name: 'Split Squat',
              prescriptionMode: 'reps_per_side',
              setRows: [
                { value: '8', loadValue: '20kg' },
                { value: '8', loadValue: '20kg' },
              ],
            },
          ],
        },
      ],
    });

    expect(isStrength).toBe(true);
    expect(steps.map((s) => s.name)).toEqual([
      'Warm-up',
      'Band Pull-Aparts',
      'Main lifts',
      'Back Squat',
      'Split Squat',
    ]);
    expect(steps.find((s) => s.name === 'Band Pull-Aparts')?.intensityLabel).toBe(
      '2×15 · 45s rest'
    );
    expect(steps.find((s) => s.name === 'Back Squat')?.intensityLabel).toBe(
      '3×5 · 80kg, 85kg, 90kg · 90s rest'
    );
    expect(steps.find((s) => s.name === 'Split Squat')?.intensityLabel).toBe(
      '2×8/side · 20kg'
    );
  });

  it('falls back to legacy exercises when blocks are absent', () => {
    const { steps, isStrength } = mapPlannedStructure({
      exercises: [
        { name: 'Deadlift', sets: 3, reps: '5', weight: '100kg', rest: '2m' },
      ],
    });
    expect(isStrength).toBe(true);
    expect(steps).toEqual([
      {
        name: 'Deadlift',
        durationSec: null,
        intensityLabel: '3×5 · 100kg · 2m rest',
      },
    ]);
  });

  it('prefers blocks over exercises when both exist', () => {
    const { steps, isStrength } = mapPlannedStructure({
      blocks: [
        {
          type: 'single_exercise',
          steps: [
            {
              name: 'From Blocks',
              setRows: [{ value: '5' }, { value: '5' }],
            },
          ],
        },
      ],
      exercises: [{ name: 'From Exercises', sets: 4, reps: '8' }],
    });
    expect(isStrength).toBe(true);
    expect(steps.map((s) => s.name)).toEqual(['From Blocks']);
    expect(steps.some((s) => s.name === 'From Exercises')).toBe(false);
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
    expect(detail.structureIsStrength).toBe(false);
  });

  it('marks strength structure on detail', () => {
    const detail = mapPlannedDetail({
      id: 'p-strength',
      title: 'Gym',
      type: 'WeightTraining',
      structuredWorkout: {
        blocks: [
          {
            type: 'single_exercise',
            steps: [{ name: 'Bench', setRows: [{ value: '5' }, { value: '5' }, { value: '5' }] }],
          },
        ],
      },
    });
    expect(detail.structureIsStrength).toBe(true);
    expect(detail.structureSteps[0]?.name).toBe('Bench');
    expect(detail.structureSteps[0]?.intensityLabel).toBe('3×5');
  });

  it('maps intensity, status, coach cues, and zones when present', () => {
    const detail = mapPlannedDetail({
      id: 'p2',
      title: 'Threshold',
      workIntensity: 0.88,
      completionStatus: 'PENDING',
      syncStatus: 'SYNCED',
      structuredWorkout: {
        coachInstructions: 'Stay smooth on the climbs.',
        zoneProfileSnapshot: {
          power: {
            ranges: [
              { name: 'Z2', min: 150, max: 200 },
              { name: 'Z4', min: 250, max: 300 },
            ],
          },
        },
        steps: [{ name: 'Main', durationSeconds: 1200 }],
      },
    });
    expect(detail.workIntensityLabel).toBe('IF 0.88');
    expect(detail.completionLabel).toBe('Pending');
    expect(detail.syncLabel).toBe('Synced');
    expect(detail.coachInstructions).toBe('Stay smooth on the climbs.');
    expect(detail.zoneSummary).toEqual({
      channelLabel: 'Power',
      bands: [
        { name: 'Z2', rangeLabel: '150 W–200 W' },
        { name: 'Z4', rangeLabel: '250 W–300 W' },
      ],
    });
  });

  it('omits enrichment when fields are absent', () => {
    const detail = mapPlannedDetail({ id: 'p3', title: 'Easy' });
    expect(detail.workIntensityLabel).toBeNull();
    expect(detail.completionLabel).toBeNull();
    expect(detail.syncLabel).toBeNull();
    expect(detail.coachInstructions).toBeNull();
    expect(detail.zoneSummary).toBeNull();
    expect(detail.structureSteps).toEqual([]);
    expect(detail.structureIsStrength).toBe(false);
  });
});

describe('mapWorkoutSummaryMetrics', () => {
  it('maps present metrics and skips absent ones', () => {
    const metrics = mapWorkoutSummaryMetrics({
      id: 'w1',
      distanceMeters: 32450,
      averageWatts: 210.4,
      normalizedPower: 225.2,
      averageHr: 148.6,
      elevationGain: 412.2,
      intensity: 0.79,
    });
    expect(metrics).toEqual([
      { key: 'distance', label: 'Distance', value: '32.5 km' },
      { key: 'avgPower', label: 'Avg power', value: '210 W' },
      { key: 'np', label: 'NP', value: '225 W' },
      { key: 'avgHr', label: 'Avg HR', value: '149 bpm' },
      { key: 'elevation', label: 'Elevation', value: '412 m' },
      { key: 'intensity', label: 'Intensity', value: 'IF 0.79' },
    ]);
  });

  it('returns empty array when no metrics present', () => {
    expect(mapWorkoutSummaryMetrics({ id: 'w2' })).toEqual([]);
  });

  it('does not invent zeros for null metric fields', () => {
    expect(
      mapWorkoutSummaryMetrics({
        id: 'w3',
        distanceMeters: null,
        averageWatts: 0,
        intensity: 3,
      })
    ).toEqual([]);
  });
});

describe('mapWorkoutSummary', () => {
  it('includes metrics on the summary view model', () => {
    const summary = mapWorkoutSummary({
      id: 'w4',
      title: 'Lunch ride',
      distanceMeters: 500,
      averageWatts: 180,
      aiAnalysisStatus: 'COMPLETED',
    });
    expect(summary.metrics).toEqual([
      { key: 'distance', label: 'Distance', value: '500 m' },
      { key: 'avgPower', label: 'Avg power', value: '180 W' },
    ]);
    expect(summary.analysis.phase).toBe('ready');
  });
});

describe('mapActivityAnalysis', () => {
  it('maps structured JSON, scores, and caps lists', () => {
    const analysis = mapActivityAnalysis({
      id: 'w5',
      aiAnalysisStatus: 'COMPLETED',
      overallScore: 8,
      technicalScore: 7,
      aiAnalysisJson: {
        executive_summary: 'Solid sweet-spot ride.',
        sections: [
          {
            title: 'Pacing',
            status: 'good',
            analysis_points: ['Even effort', 'Held target', 'Extra 1', 'Extra 2', 'Extra 3'],
          },
        ],
        recommendations: [
          { title: 'Recover well', description: 'Easy spin tomorrow.', priority: 'high' },
        ],
        strengths: ['Consistency'],
        weaknesses: ['Late fade'],
      },
    });
    expect(analysis.phase).toBe('ready');
    expect(analysis.executiveSummary).toBe('Solid sweet-spot ride.');
    expect(analysis.scores.map((s) => s.key)).toEqual(['overall', 'technical']);
    expect(analysis.sections[0]?.points).toHaveLength(4);
    expect(analysis.recommendations[0]?.title).toBe('Recover well');
    expect(analysis.hasContent).toBe(true);
  });

  it('falls back to markdown when JSON summary missing', () => {
    const analysis = mapActivityAnalysis({
      id: 'w6',
      aiAnalysisStatus: 'COMPLETED',
      aiAnalysis: 'Legacy markdown write-up.',
    });
    expect(analysis.markdownFallback).toBe('Legacy markdown write-up.');
    expect(analysis.hasContent).toBe(true);
  });

  it('marks analyzing and empty not_started states', () => {
    expect(mapActivityAnalysis({ id: 'w7', aiAnalysisStatus: 'PROCESSING' }).phase).toBe(
      'analyzing'
    );
    const idle = mapActivityAnalysis({ id: 'w8', aiAnalysisStatus: 'NOT_STARTED' });
    expect(idle.phase).toBe('not_started');
    expect(idle.hasContent).toBe(false);
  });
});

describe('formatIntensityFactor / formatDistanceMeters', () => {
  it('formats IF in a sensible band only', () => {
    expect(formatIntensityFactor(0.85)).toBe('IF 0.85');
    expect(formatIntensityFactor(0.05)).toBeNull();
    expect(formatIntensityFactor(2.5)).toBeNull();
    expect(formatIntensityFactor(null)).toBeNull();
  });

  it('formats distance in m or km', () => {
    expect(formatDistanceMeters(800)).toBe('800 m');
    expect(formatDistanceMeters(1500)).toBe('1.5 km');
  });

  it('formats distance in miles when preferred', () => {
    expect(formatDistanceMeters(1609.344, 'Miles')).toBe('1.0 mi');
    expect(formatDistanceMeters(50, 'Miles')).toBe('164 ft');
  });
});

describe('mapCoachInstructions', () => {
  it('returns trimmed string and truncates long cues', () => {
    expect(mapCoachInstructions({ coachInstructions: '  Keep cadence high.  ' })).toBe(
      'Keep cadence high.'
    );
    const long = 'x'.repeat(450);
    const mapped = mapCoachInstructions({ coachInstructions: long });
    expect(mapped?.endsWith('…')).toBe(true);
    expect(mapped?.length).toBe(400);
  });

  it('ignores non-string coachInstructions', () => {
    expect(mapCoachInstructions({ coachInstructions: { text: 'nope' } })).toBeNull();
    expect(mapCoachInstructions(null)).toBeNull();
  });
});

describe('mapZoneSummary', () => {
  it('prefers power over heart rate', () => {
    const summary = mapZoneSummary({
      zoneProfileSnapshot: {
        power: { ranges: [{ min: 100, max: 150 }] },
        heartRate: { ranges: [{ min: 120, max: 140 }] },
      },
    });
    expect(summary?.channelLabel).toBe('Power');
    expect(summary?.bands[0]?.name).toBe('Z1');
  });

  it('returns null when snapshot is empty', () => {
    expect(mapZoneSummary({ zoneProfileSnapshot: {} })).toBeNull();
    expect(mapZoneSummary({})).toBeNull();
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

describe('stepIntensity', () => {
  it('parses Z<n> labels', () => {
    expect(stepIntensity({ intensityLabel: 'Z2' })).toEqual({
      zoneIndex: 1,
      fraction: expect.any(Number),
    });
    expect(stepIntensity({ intensityLabel: 'z5' }).zoneIndex).toBe(4);
    expect(stepIntensity({ intensityLabel: 'Z 3 Steady' }).zoneIndex).toBe(2);
  });

  it('parses %FTP and bare percent labels', () => {
    expect(stepIntensity({ intensityLabel: '85% FTP' })).toMatchObject({
      zoneIndex: 2,
      fraction: expect.any(Number),
    });
    expect(stepIntensity({ intensityLabel: '95%' }).zoneIndex).toBe(3);
    expect(stepIntensity({ intensityLabel: '110% FTP' }).zoneIndex).toBe(4);
  });

  it('parses named zones', () => {
    expect(stepIntensity({ intensityLabel: 'Tempo' }).zoneIndex).toBe(2);
    expect(stepIntensity({ intensityLabel: 'Threshold' }).zoneIndex).toBe(3);
    expect(stepIntensity({ intensityLabel: 'Endurance' }).zoneIndex).toBe(1);
    expect(stepIntensity({ intensityLabel: 'Sweet Spot' }).zoneIndex).toBe(2);
  });

  it('returns empty for unparseable or absent labels', () => {
    expect(stepIntensity({ intensityLabel: '150 W' })).toEqual({});
    expect(stepIntensity({ intensityLabel: 'RPE 7' })).toEqual({});
    expect(stepIntensity({ intensityLabel: '250–280 W' })).toEqual({});
    expect(stepIntensity({ intensityLabel: null })).toEqual({});
    expect(stepIntensity({})).toEqual({});
  });
});

describe('zoneIndexFromBandName', () => {
  it('prefers Z labels over fallback index', () => {
    expect(zoneIndexFromBandName('Z4', 0)).toBe(3);
    expect(zoneIndexFromBandName('Zone 2', 0)).toBe(1);
    expect(zoneIndexFromBandName('Endurance', 5)).toBe(1);
    expect(zoneIndexFromBandName('Custom', 2)).toBe(2);
  });
});
