import { describe, expect, it } from 'vitest';

import type { ActivityTerrainPoint } from '../chartTypes';
import { bucketTerrainProfile, deriveTerrainAnalysis } from '../climbs';

function point(
  sourceIndex: number,
  distanceM: number,
  altitudeM: number,
  timeSec: number,
): ActivityTerrainPoint {
  return {
    sourceIndex,
    distanceM,
    altitudeM,
    timeSec,
    gradePct: null,
    watts: 220,
    heartrate: 150,
    cadence: 78,
    tempC: 20,
  };
}

function tenClimbProfile(): ActivityTerrainPoint[] {
  const points: ActivityTerrainPoint[] = [];
  let distanceM = 0;
  let altitudeM = 100;
  let timeSec = 0;
  let index = 0;
  points.push(point(index++, distanceM, altitudeM, timeSec));
  for (let climb = 0; climb < 10; climb += 1) {
    for (let step = 0; step < 20; step += 1) {
      distanceM += 100;
      altitudeM += 6;
      timeSec += 10;
      points.push(point(index++, distanceM, altitudeM, timeSec));
    }
    for (let step = 0; step < 10; step += 1) {
      distanceM += 100;
      altitudeM -= 12;
      timeSec += 8;
      points.push(point(index++, distanceM, altitudeM, timeSec));
    }
  }
  return points;
}

describe('deriveTerrainAnalysis', () => {
  it('recovers ten sustained climbs from a synthetic profile', () => {
    const analysis = deriveTerrainAnalysis(tenClimbProfile());

    expect(analysis.climbs).toHaveLength(10);
    expect(analysis.climbs.every((climb) => climb.gainM >= 100)).toBe(true);
    expect(analysis.climbs.every((climb) => climb.averageGradePct >= 3)).toBe(true);
    expect(analysis.climbs[0]).toMatchObject({
      category: 'Cat 4',
      averageWatts: 220,
      averageHeartrate: 150,
      averageCadence: 78,
      averageTempC: 20,
    });
  });

  it('returns no climbs for a flat profile', () => {
    const points = Array.from({ length: 100 }, (_, index) =>
      point(index, index * 100, 120, index * 10),
    );

    expect(deriveTerrainAnalysis(points).climbs).toEqual([]);
  });

  it('keeps a climb together across a dip smaller than the 25 metre drawdown', () => {
    const points: ActivityTerrainPoint[] = [];
    let distanceM = 0;
    let altitudeM = 100;
    let timeSec = 0;
    let index = 0;
    points.push(point(index++, distanceM, altitudeM, timeSec));
    for (let step = 0; step < 14; step += 1) {
      distanceM += 100;
      altitudeM += 6;
      timeSec += 10;
      points.push(point(index++, distanceM, altitudeM, timeSec));
    }
    for (let step = 0; step < 3; step += 1) {
      distanceM += 100;
      altitudeM -= 5;
      timeSec += 10;
      points.push(point(index++, distanceM, altitudeM, timeSec));
    }
    for (let step = 0; step < 13; step += 1) {
      distanceM += 100;
      altitudeM += 6;
      timeSec += 10;
      points.push(point(index++, distanceM, altitudeM, timeSec));
    }

    const analysis = deriveTerrainAnalysis(points);
    expect(analysis.climbs).toHaveLength(1);
    expect(analysis.climbs[0]?.lengthM).toBe(3_000);
    expect(analysis.climbs[0]?.gainM).toBeGreaterThan(140);
  });

  it('fills every requested terrain column for a sparse profile', () => {
    const profile = deriveTerrainAnalysis([
      point(0, 0, 100, 0),
      point(1, 500, 125, 50),
      point(2, 1_000, 110, 100),
    ]).profile;

    const columns = bucketTerrainProfile(profile, 8);
    expect(columns).toHaveLength(8);
    expect(columns.map((column) => column.columnIndex)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(columns.every((column) => Number.isFinite(column.maxAltitudeM))).toBe(true);
  });
});
