import { describe, expect, it } from 'vitest';

import { bucketStreamEnvelope, niceThreeTickDomain } from '../streamEnvelope';

describe('bucketStreamEnvelope', () => {
  it('preserves a spike inside the bucket envelope', () => {
    const points = Array.from({ length: 100 }, (_, x) => ({ x, y: x === 47 ? 756 : 180 }));
    const envelope = bucketStreamEnvelope(points, 10, 0, 99);

    expect(Math.max(...envelope.map((point) => point.max))).toBe(756);
    expect(envelope.find((point) => point.max === 756)?.mean).toBeGreaterThan(180);
  });

  it('never returns more buckets than input samples', () => {
    const points = [
      { x: 0, y: 10 },
      { x: 1, y: 20 },
      { x: 2, y: 30 },
    ];

    expect(bucketStreamEnvelope(points, 200)).toHaveLength(3);
  });

  it('computes min, max, and mean for each rendered column', () => {
    const envelope = bucketStreamEnvelope(
      [
        { x: 0, y: 2 },
        { x: 1, y: 8 },
        { x: 2, y: 5 },
        { x: 3, y: 15 },
      ],
      2,
      0,
      4,
    );

    expect(envelope).toEqual([
      { x: 0.5, min: 2, max: 8, mean: 5, count: 2 },
      { x: 2.5, min: 5, max: 15, mean: 10, count: 2 },
    ]);
  });
});

describe('niceThreeTickDomain', () => {
  it('returns clean independent power and heart-rate scales', () => {
    expect(niceThreeTickDomain(0, 756)).toEqual([0, 400, 800]);
    expect(niceThreeTickDomain(103, 182)).toEqual([100, 150, 200]);
  });
});
