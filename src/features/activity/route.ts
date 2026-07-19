/**
 * Decodes a Google encoded polyline string into an array of coordinates.
 */
export function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }
  return points;
}

/**
 * Decimates points to a maximum count by uniform downsampling.
 */
export function decimatePoints<T>(points: T[], maxPoints = 500): T[] {
  const n = points.length;
  if (n <= maxPoints) return points;
  const out: T[] = [];
  for (let i = 0; i < maxPoints; i++) {
    const idx = Math.floor((i * (n - 1)) / (maxPoints - 1));
    out.push(points[idx]!);
  }
  return out;
}

/**
 * Resolves activity route coordinates by preferring the raw streams latlng
 * and falling back to the decoded summary polyline if present.
 */
export function resolveActivityRouteCoordinates(
  streamsLatLng: { latitude: number; longitude: number }[] | null | undefined,
  summaryPolyline: string | null | undefined
): { latitude: number; longitude: number }[] {
  if (streamsLatLng && streamsLatLng.length > 0) {
    return decimatePoints(streamsLatLng, 500);
  }
  if (summaryPolyline) {
    const decoded = decodePolyline(summaryPolyline);
    return decimatePoints(decoded, 500);
  }
  return [];
}
