export type StreamZoneDef = {
  name: string;
  min: number;
  max: number;
};

/** Raw `GET /api/workouts/:id/streams` body (subset we care about). */
export type WorkoutStreamsApi = {
  time?: number[] | null;
  watts?: number[] | null;
  heartrate?: number[] | null;
  altitude?: number[] | null;
  distance?: number[] | null;
  cadence?: number[] | null;
  velocity?: number[] | null;
  grade?: number[] | null;
  temp?: number[] | null;
  latlng?: [number, number][] | null;
  hrZoneTimes?: number[] | null;
  powerZoneTimes?: number[] | null;
  hrZones?: StreamZoneDef[] | null;
  powerZones?: StreamZoneDef[] | null;
  dataSource?: string | null;
};

export type PowerCurvePointApi = {
  duration?: number;
  durationLabel?: string;
  power?: number;
};

export type PowerCurveApi = {
  hasPowerData?: boolean;
  powerCurve?: PowerCurvePointApi[] | null;
  summary?: {
    peak5s?: number | null;
    peak1min?: number | null;
    peak5min?: number | null;
    peak20min?: number | null;
    estimatedFTP?: number | null;
    currentFTP?: number | null;
  } | null;
  message?: string;
};

export type ChartPoint = {
  x: number;
  y: number;
};

export type StreamSeries = {
  key: string;
  label: string;
  unit: string;
  /** Series with different display units can opt into one meaningful shared scale. */
  scaleGroup?: string;
  color: string;
  points: ChartPoint[];
};

export type ActivityTerrainPoint = {
  sourceIndex: number;
  timeSec: number;
  distanceM: number;
  altitudeM: number;
  gradePct: number | null;
  watts: number | null;
  heartrate: number | null;
  cadence: number | null;
  tempC: number | null;
};

export type ActivityTerrainStreams = {
  points: ActivityTerrainPoint[];
};

export type ZoneBar = {
  key: string;
  label: string;
  detail: string;
  minutes: number;
  fraction: number;
};

export type ActivityStreamCharts = {
  series: StreamSeries[];
  /** Elapsed seconds for x-axis extent */
  durationSec: number;
  zones: {
    channelLabel: string;
    bars: ZoneBar[];
  } | null;
  latlng?: { latitude: number; longitude: number }[] | null;
  terrain: ActivityTerrainStreams | null;
};

export type PowerCurveCharts = {
  points: { label: string; power: number }[];
  peak20min: number | null;
};
