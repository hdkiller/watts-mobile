import { describe, expect, it } from 'vitest';

import {
  decodePolyline,
  decimatePoints,
  resolveActivityRouteCoordinates,
} from '../route';

describe('route utilities', () => {
  describe('decodePolyline', () => {
    it('decodes empty polyline to empty array', () => {
      expect(decodePolyline('')).toEqual([]);
    });

    it('decodes a simple coordinate pair', () => {
      // '_p~iF~ps|U' encodes lat: 38.5, lng: -120.2
      const pts = decodePolyline('_p~iF~ps|U');
      expect(pts.length).toBe(1);
      expect(pts[0]?.latitude).toBeCloseTo(38.5, 4);
      expect(pts[0]?.longitude).toBeCloseTo(-120.2, 4);
    });
  });

  describe('decimatePoints', () => {
    it('returns same array if under maxPoints limit', () => {
      const arr = [{ latitude: 1, longitude: 2 }, { latitude: 3, longitude: 4 }];
      expect(decimatePoints(arr, 5)).toEqual(arr);
    });

    it('decimates larger array to exactly maxPoints', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => ({
        latitude: i,
        longitude: i,
      }));
      const decimated = decimatePoints(arr, 500);
      expect(decimated.length).toBe(500);
      expect(decimated[0]).toEqual(arr[0]);
      expect(decimated[499]).toEqual(arr[999]);
    });
  });

  describe('resolveActivityRouteCoordinates', () => {
    it('prefers streamsLatLng when available', () => {
      const streams = [{ latitude: 10, longitude: 20 }];
      const poly = '_p~iF~ps|U';
      const resolved = resolveActivityRouteCoordinates(streams, poly);
      expect(resolved).toEqual(streams);
    });

    it('falls back to summaryPolyline when streamsLatLng is empty', () => {
      const poly = '_p~iF~ps|U';
      const resolved = resolveActivityRouteCoordinates(null, poly);
      expect(resolved.length).toBe(1);
      expect(resolved[0]?.latitude).toBeCloseTo(38.5, 4);
    });

    it('returns empty array when both are empty', () => {
      expect(resolveActivityRouteCoordinates(null, null)).toEqual([]);
    });
  });
});
