import { mergeWorkoutStreams } from './readers/workoutStreams';
import { fitSportCode } from './sportTypes';
import type { PlatformWorkoutSession } from './types';

/**
 * FIT activity file: FileId + optional record stream + optional laps + Session + Activity.
 * Encodes summary plus available time series (HR, power, cadence, speed, GPS).
 */

const FIT_EPOCH_OFFSET_S = 631065600; // seconds between Unix epoch and FIT epoch (1989-12-31)

function crc16(data: Uint8Array, crc = 0): number {
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]! << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc & 0xffff;
}

function u16(n: number): Uint8Array {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, n >>> 0, true);
  return b;
}

function u32(n: number): Uint8Array {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n >>> 0, true);
  return b;
}

function i32(n: number): Uint8Array {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setInt32(0, n | 0, true);
  return b;
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const len = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(len);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

function fitTimestamp(iso: string): number {
  const unix = Math.floor(new Date(iso).getTime() / 1000);
  return Math.max(0, unix - FIT_EPOCH_OFFSET_S);
}

const FIT_UINT8_INVALID = 0xff;
const FIT_UINT16_INVALID = 0xffff;
const FIT_UINT32_INVALID = 0xffffffff;
const FIT_SINT32_INVALID = 0x7fffffff;

function u8(n: number): Uint8Array {
  return new Uint8Array([n & 0xff]);
}

function hrByte(bpm: number | undefined): number {
  if (bpm == null || !Number.isFinite(bpm) || bpm <= 0) return FIT_UINT8_INVALID;
  return Math.min(254, Math.round(bpm));
}

function powerU16(watts: number | undefined): number {
  if (watts == null || !Number.isFinite(watts) || watts < 0) return FIT_UINT16_INVALID;
  return Math.min(FIT_UINT16_INVALID - 1, Math.round(watts));
}

function cadenceByte(rpm: number | undefined): number {
  if (rpm == null || !Number.isFinite(rpm) || rpm < 0) return FIT_UINT8_INVALID;
  return Math.min(254, Math.round(rpm));
}

/** FIT speed: uint16, scale 1000 → m/s */
function speedU16(mps: number | undefined): number {
  if (mps == null || !Number.isFinite(mps) || mps < 0) return FIT_UINT16_INVALID;
  return Math.min(FIT_UINT16_INVALID - 1, Math.round(mps * 1000));
}

/** FIT altitude: uint16, scale 5, offset 500 → meters. */
function altitudeU16(meters: number | undefined): number {
  if (meters == null || !Number.isFinite(meters)) return FIT_UINT16_INVALID;
  return Math.min(FIT_UINT16_INVALID - 1, Math.max(0, Math.round((meters + 500) * 5)));
}

/** FIT accumulated distance: uint32, scale 100 → meters. */
function distanceU32(meters: number | undefined): number {
  if (meters == null || !Number.isFinite(meters) || meters < 0) return FIT_UINT32_INVALID;
  return Math.min(FIT_UINT32_INVALID - 1, Math.round(meters * 100));
}

function average(values: (number | undefined)[]): number | undefined {
  const valid = values.filter((value): value is number => value != null && Number.isFinite(value));
  if (!valid.length) return undefined;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function maximum(values: (number | undefined)[]): number | undefined {
  const valid = values.filter((value): value is number => value != null && Number.isFinite(value));
  return valid.length ? Math.max(...valid) : undefined;
}

function totalAscentMeters(session: PlatformWorkoutSession): number | undefined {
  const route = [...(session.routePoints ?? [])]
    .filter((point) => point.altitudeMeters != null && Number.isFinite(point.altitudeMeters))
    .sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime());
  if (route.length < 2) return undefined;
  let ascent = 0;
  for (let index = 1; index < route.length; index++) {
    const delta = route[index]!.altitudeMeters! - route[index - 1]!.altitudeMeters!;
    if (delta > 0) ascent += delta;
  }
  return ascent;
}

/** Degrees → FIT semicircles (sint32). */
function toSemicircles(degrees: number | undefined): number {
  if (degrees == null || !Number.isFinite(degrees)) return FIT_SINT32_INVALID;
  return Math.round(degrees * (2147483648 / 180));
}

function defMessage(
  localNum: number,
  globalMsg: number,
  fields: { defNum: number; size: number; baseType: number }[]
): Uint8Array {
  const header = new Uint8Array([0x40 | (localNum & 0x0f)]);
  const reserved = new Uint8Array([0]);
  const arch = new Uint8Array([0]); // little endian
  const global = u16(globalMsg);
  const fieldCount = new Uint8Array([fields.length]);
  const fieldDefs = concat(
    ...fields.map((f) => new Uint8Array([f.defNum, f.size, f.baseType]))
  );
  return concat(header, reserved, arch, global, fieldCount, fieldDefs);
}

function dataMessage(localNum: number, payload: Uint8Array): Uint8Array {
  return concat(new Uint8Array([localNum & 0x0f]), payload);
}

export function buildMinimalFit(session: PlatformWorkoutSession): Uint8Array {
  const startFit = fitTimestamp(session.startedAt);
  const endIso = session.endedAt ?? session.startedAt;
  const endFit = fitTimestamp(endIso);
  const duration =
    session.durationSec ??
    Math.max(0, Math.floor(new Date(endIso).getTime() / 1000 - new Date(session.startedAt).getTime() / 1000));
  const sport = fitSportCode(session.sportType);

  // File Id (global 0)
  const fileIdDef = defMessage(0, 0, [
    { defNum: 0, size: 1, baseType: 0x00 }, // type enum
    { defNum: 1, size: 2, baseType: 0x84 }, // manufacturer uint16
    { defNum: 2, size: 2, baseType: 0x84 }, // product uint16
    { defNum: 4, size: 4, baseType: 0x86 }, // time_created uint32
  ]);
  const fileIdData = dataMessage(
    0,
    concat(new Uint8Array([4]), u16(255), u16(0), u32(startFit))
  );

  const merged = mergeWorkoutStreams({
    heartRate: session.heartRateSamples,
    power: session.powerSamples,
    cadence: session.cadenceSamples,
    speed: session.speedSamples,
    route: session.routePoints,
  });

  const hasStream = merged.length > 0;
  const hasHeartRate = merged.some((point) => point.bpm != null);
  const hasCadence = merged.some((point) => point.rpm != null);
  const hasSpeed = merged.some((point) => point.mps != null);
  const hasPower = merged.some((point) => point.watts != null);
  const hasRoute = merged.some((point) => point.lat != null && point.lon != null);
  const hasAltitude = merged.some((point) => point.altitudeMeters != null);
  const hasDistance = merged.some((point) => point.distanceMeters != null);
  // Record (global 20): timestamp + HR + cadence + speed + power + lat/lon
  const recordDef = hasStream
    ? defMessage(3, 20, [
        { defNum: 253, size: 4, baseType: 0x86 },
        ...(hasHeartRate ? [{ defNum: 3, size: 1, baseType: 0x02 }] : []),
        ...(hasCadence ? [{ defNum: 4, size: 1, baseType: 0x02 }] : []),
        ...(hasSpeed ? [{ defNum: 6, size: 2, baseType: 0x84 }] : []),
        ...(hasPower ? [{ defNum: 7, size: 2, baseType: 0x84 }] : []),
        ...(hasRoute
          ? [
              { defNum: 0, size: 4, baseType: 0x85 },
              { defNum: 1, size: 4, baseType: 0x85 },
            ]
          : []),
        ...(hasAltitude ? [{ defNum: 2, size: 2, baseType: 0x84 }] : []),
        ...(hasDistance ? [{ defNum: 5, size: 4, baseType: 0x86 }] : []),
      ])
    : new Uint8Array(0);
  const recordData = hasStream
    ? concat(
        ...merged.map((s) =>
          dataMessage(
            3,
            concat(
              u32(Math.max(0, Math.floor(s.t / 1000) - FIT_EPOCH_OFFSET_S)),
              ...(hasHeartRate ? [u8(hrByte(s.bpm))] : []),
              ...(hasCadence ? [u8(cadenceByte(s.rpm))] : []),
              ...(hasSpeed ? [u16(speedU16(s.mps))] : []),
              ...(hasPower ? [u16(powerU16(s.watts))] : []),
              ...(hasRoute
                ? [i32(toSemicircles(s.lat)), i32(toSemicircles(s.lon))]
                : []),
              ...(hasAltitude ? [u16(altitudeU16(s.altitudeMeters))] : []),
              ...(hasDistance ? [u32(distanceU32(s.distanceMeters))] : [])
            )
          )
        )
      )
    : new Uint8Array(0);

  // Lap (global 19) when platform exposed splits
  const laps = session.laps ?? [];
  const lapDef = laps.length
    ? defMessage(4, 19, [
        { defNum: 253, size: 4, baseType: 0x86 }, // timestamp
        { defNum: 2, size: 4, baseType: 0x86 }, // start_time
        { defNum: 7, size: 4, baseType: 0x86 }, // total_elapsed_time (uint32, scale 1000)
        { defNum: 8, size: 4, baseType: 0x86 }, // total_timer_time (uint32, scale 1000)
        { defNum: 9, size: 4, baseType: 0x86 }, // total_distance
      ])
    : new Uint8Array(0);
  const lapData = laps.length
    ? concat(
        ...laps.map((lap) => {
          const lapStart = fitTimestamp(lap.startedAt);
          const lapEnd = fitTimestamp(lap.endedAt);
          const lapDurMs = Math.max(
            0,
            Math.round(
              (new Date(lap.endedAt).getTime() - new Date(lap.startedAt).getTime())
            )
          );
          const dist =
            lap.distanceMeters != null && lap.distanceMeters >= 0
              ? Math.min(Math.round(lap.distanceMeters * 100), FIT_UINT32_INVALID - 1)
              : FIT_UINT32_INVALID;
          return dataMessage(
            4,
            concat(u32(lapEnd), u32(lapStart), u32(lapDurMs), u32(lapDurMs), u32(dist))
          );
        })
      )
    : new Uint8Array(0);

  // Session (global 18)
  const sessionDef = defMessage(1, 18, [
    { defNum: 253, size: 4, baseType: 0x86 }, // timestamp
    { defNum: 2, size: 4, baseType: 0x86 }, // start_time
    { defNum: 7, size: 4, baseType: 0x86 }, // total_elapsed_time (uint32, scale 1000)
    { defNum: 8, size: 4, baseType: 0x86 }, // total_timer_time (uint32, scale 1000)
    { defNum: 9, size: 4, baseType: 0x86 }, // total_distance
    { defNum: 11, size: 2, baseType: 0x84 }, // total_calories
    { defNum: 16, size: 1, baseType: 0x02 }, // avg_heart_rate
    { defNum: 17, size: 1, baseType: 0x02 }, // max_heart_rate
    { defNum: 20, size: 2, baseType: 0x84 }, // avg_power
    { defNum: 21, size: 2, baseType: 0x84 }, // max_power
    { defNum: 18, size: 1, baseType: 0x02 }, // avg_cadence
    { defNum: 19, size: 1, baseType: 0x02 }, // max_cadence
    { defNum: 14, size: 2, baseType: 0x84 }, // avg_speed
    { defNum: 15, size: 2, baseType: 0x84 }, // max_speed
    { defNum: 22, size: 2, baseType: 0x84 }, // total_ascent
    { defNum: 5, size: 1, baseType: 0x00 }, // sport enum
  ]);
  const elapsedScaled = Math.round(duration * 1000);
  const derivedDistance = merged.at(-1)?.distanceMeters;
  const totalDistance = session.distanceMeters ?? derivedDistance;
  const distanceScaled =
    totalDistance != null && totalDistance >= 0
      ? Math.min(Math.round(totalDistance * 100), FIT_UINT32_INVALID - 1)
      : FIT_UINT32_INVALID;
  const calories =
    session.activeCalories != null && session.activeCalories >= 0
      ? Math.min(Math.round(session.activeCalories), FIT_UINT16_INVALID - 1)
      : FIT_UINT16_INVALID;
  const sessionData = dataMessage(
    1,
    concat(
      u32(endFit),
      u32(startFit),
      u32(elapsedScaled),
      u32(elapsedScaled),
      u32(distanceScaled),
      u16(calories),
      u8(hrByte(session.avgHeartRate)),
      u8(hrByte(session.maxHeartRate)),
      u16(powerU16(session.avgPower ?? average(session.powerSamples?.map((s) => s.watts) ?? []))),
      u16(powerU16(maximum(session.powerSamples?.map((s) => s.watts) ?? []))),
      u8(cadenceByte(average(session.cadenceSamples?.map((s) => s.rpm) ?? []))),
      u8(cadenceByte(maximum(session.cadenceSamples?.map((s) => s.rpm) ?? []))),
      u16(speedU16(average(session.speedSamples?.map((s) => s.mps) ?? []))),
      u16(speedU16(maximum(session.speedSamples?.map((s) => s.mps) ?? []))),
      u16(powerU16(totalAscentMeters(session))),
      new Uint8Array([sport])
    )
  );

  // Activity (global 34)
  const activityDef = defMessage(2, 34, [
    { defNum: 253, size: 4, baseType: 0x86 }, // timestamp
    { defNum: 0, size: 4, baseType: 0x86 }, // total_timer_time (uint32, scale 1000)
    { defNum: 1, size: 2, baseType: 0x84 }, // num_sessions
    { defNum: 2, size: 1, baseType: 0x00 },
    { defNum: 3, size: 1, baseType: 0x00 },
    { defNum: 4, size: 1, baseType: 0x00 },
  ]);
  const activityData = dataMessage(
    2,
    concat(
      u32(endFit),
      u32(elapsedScaled),
      u16(1),
      new Uint8Array([0]),
      new Uint8Array([0]),
      new Uint8Array([0])
    )
  );

  const dataRecords = concat(
    fileIdDef,
    fileIdData,
    recordDef,
    recordData,
    lapDef,
    lapData,
    sessionDef,
    sessionData,
    activityDef,
    activityData
  );

  const headerSize = 14;
  const header = new Uint8Array(headerSize);
  header[0] = headerSize;
  header[1] = 0x10;
  header[2] = 0x2d;
  header[3] = 0x08;
  new DataView(header.buffer).setUint32(4, dataRecords.length, true);
  header[8] = 0x2e;
  header[9] = 0x46;
  header[10] = 0x49;
  header[11] = 0x54;
  const headerCrc = crc16(header.subarray(0, 12));
  new DataView(header.buffer).setUint16(12, headerCrc, true);

  const body = concat(header, dataRecords);
  const fileCrc = crc16(body);
  return concat(body, u16(fileCrc));
}

export function fitFilename(session: PlatformWorkoutSession): string {
  const stamp = session.startedAt.replace(/[:.]/g, '-');
  return `health-${session.platform}-${stamp}.fit`;
}
