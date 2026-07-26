import { describe, expect, it } from 'vitest';

import {
  buildStructureChartBlocks,
  flattenStepsForChart,
  hasStructuredWorkoutPreviewData,
  heightFractionFromIntensity,
  resolveStepChartIntensity,
  unitsLookLikePercentFtp,
  zoneIndexFromIntensity,
  type ChartTargetRefs,
} from '../structureIntensity';

const refs: ChartTargetRefs = { ftp: 250, lthr: 160, maxHr: 190, thresholdPace: 0 };
const noFtp: ChartTargetRefs = { ftp: 0, lthr: 0, maxHr: 0, thresholdPace: 0 };

describe('hasStructuredWorkoutPreviewData', () => {
  it('treats intervals as previewable', () => {
    expect(hasStructuredWorkoutPreviewData({ intervals: [{ name: 'A' }] })).toBe(true);
    expect(hasStructuredWorkoutPreviewData({ steps: [{ name: 'A' }] })).toBe(true);
    expect(hasStructuredWorkoutPreviewData({})).toBe(false);
  });
});

describe('unitsLookLikePercentFtp', () => {
  it('detects percent FTP units', () => {
    expect(unitsLookLikePercentFtp('%FTP')).toBe(true);
    expect(unitsLookLikePercentFtp('%')).toBe(true);
    expect(unitsLookLikePercentFtp('percent_ftp')).toBe(true);
  });

  it('rejects zone and watt units', () => {
    expect(unitsLookLikePercentFtp('power_zone')).toBe(false);
    expect(unitsLookLikePercentFtp('watts')).toBe(false);
    expect(unitsLookLikePercentFtp(null)).toBe(false);
  });
});

describe('resolveStepChartIntensity', () => {
  it('resolves %FTP power targets', () => {
    expect(
      resolveStepChartIntensity({ power: { value: 85, units: '%FTP' } }, 'power', refs),
    ).toBeCloseTo(0.85);
  });

  it('resolves absolute watts with FTP', () => {
    expect(
      resolveStepChartIntensity({ power: { value: 200, units: 'w' } }, 'power', refs),
    ).toBeCloseTo(0.8);
  });

  it('returns 0 for absolute watts without FTP', () => {
    expect(resolveStepChartIntensity({ power: { value: 200, units: 'w' } }, 'power', noFtp)).toBe(
      0,
    );
  });

  it('resolves HR zone via snapshot mid / LTHR', () => {
    const snapshot = {
      heartRate: {
        ranges: [
          { min: 100, max: 120 },
          { min: 141, max: 150 },
        ],
      },
    };
    expect(
      resolveStepChartIntensity(
        { heartRate: { value: 2, units: 'hr_zone' } },
        'hr',
        refs,
        snapshot,
      ),
    ).toBeCloseTo(145.5 / 160);
  });
});

describe('buildStructureChartBlocks', () => {
  it('colors %FTP steps and leaves watts-without-FTP neutral', () => {
    const blocks = buildStructureChartBlocks(
      {
        steps: [
          { name: 'WU', durationSeconds: 300, type: 'Warmup', power: { value: 55, units: '%FTP' } },
          { name: 'SS', durationSeconds: 600, power: { value: 88, units: '%FTP' } },
          { name: 'Hard', durationSeconds: 300, power: { value: 280, units: 'w' } },
        ],
      },
      noFtp,
    );
    expect(blocks).toHaveLength(3);
    expect(blocks[0]!.zoneIndex).toBe(0); // 55% → Z1
    expect(blocks[1]!.zoneIndex).toBe(2); // 88% → Z3
    expect(blocks[2]!.intensity).toBeNull();
    expect(blocks[2]!.zoneIndex).toBeNull();
  });

  it('colors absolute watts when FTP is available', () => {
    const blocks = buildStructureChartBlocks(
      {
        steps: [
          { name: 'A', durationSeconds: 300, power: { value: 150, units: 'w' } },
          { name: 'B', durationSeconds: 300, power: { value: 250, units: 'w' } },
        ],
      },
      refs,
    );
    expect(blocks[0]!.zoneIndex).not.toBeNull();
    expect(blocks[1]!.zoneIndex).not.toBeNull();
    expect(blocks[1]!.intensity).toBeCloseTo(1);
  });

  it('expands repeats into chart bars', () => {
    const flat = flattenStepsForChart([
      {
        reps: 3,
        steps: [
          { name: 'On', durationSeconds: 60, power: { value: 100, units: '%FTP' } },
          { name: 'Off', durationSeconds: 60, type: 'Rest' },
        ],
      },
    ]);
    expect(flat).toHaveLength(6);

    const blocks = buildStructureChartBlocks(
      {
        steps: [
          {
            reps: 3,
            steps: [
              { name: 'On', durationSeconds: 60, power: { value: 100, units: '%FTP' } },
              { name: 'Off', durationSeconds: 60, type: 'Rest' },
            ],
          },
        ],
      },
      refs,
    );
    expect(blocks).toHaveLength(6);
  });

  it('captures ramp ranges', () => {
    const blocks = buildStructureChartBlocks(
      {
        steps: [
          {
            name: 'Ramp',
            durationSeconds: 600,
            ramp: true,
            power: { range: { start: 50, end: 90 }, units: '%FTP', ramp: true },
          },
          {
            name: 'Steady',
            durationSeconds: 300,
            power: { value: 70, units: '%FTP' },
          },
        ],
      },
      refs,
    );
    expect(blocks[0]!.ramp).toEqual({ start: 0.5, end: 0.9 });
    expect(blocks[1]!.ramp).toBeNull();
  });

  it('returns empty for strength structure', () => {
    expect(
      buildStructureChartBlocks({
        blocks: [{ type: 'single_exercise', steps: [{ name: 'Squat' }] }],
      }),
    ).toEqual([]);
  });
});

describe('zoneIndexFromIntensity / heightFraction', () => {
  it('maps coggan-style bands', () => {
    expect(zoneIndexFromIntensity(0.5)).toBe(0);
    expect(zoneIndexFromIntensity(0.7)).toBe(1);
    expect(zoneIndexFromIntensity(0.88)).toBe(2);
    expect(zoneIndexFromIntensity(1.0)).toBe(3);
  });

  it('scales height with 120% cap', () => {
    expect(heightFractionFromIntensity(null)).toBe(0.45);
    expect(heightFractionFromIntensity(1.2)).toBe(1);
    expect(heightFractionFromIntensity(0.6)).toBeCloseTo(0.5);
  });
});
