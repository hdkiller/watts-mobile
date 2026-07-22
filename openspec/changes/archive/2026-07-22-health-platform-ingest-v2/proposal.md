## Why

`health-platform-ingest` shipped opt-in wellness + workout sync, but the first pass is deliberately thin: workouts upload as **summary-only FIT** (no time series), the wellness set omits daily **activity volume** (steps/distance/active energy from the ring, not just workout totals), sleep duration was computed inconsistently across platforms, every pass **re-reads the full lookback window** instead of syncing incrementally, and background sync is a best-effort `BGProcessingTask` with **no change-driven trigger**. For an endurance-coaching backend, a workout with only duration + sport + calories cannot be analyzed the way a Garmin/Whoop upload can — no HR zones, no decoupling, no pace/power curve.

This change makes ingestion **comprehensive and correct**: rich workout streams, an expanded objective metric set, cross-platform parity, incremental watermark sync, and reliable change-driven background delivery — while keeping the same opt-in, always-push, ledger-backed model.

## What Changes

- **Workout time-series streams:** upload the readable per-session streams — heart rate (**shipped in this change**), plus power, cadence, speed, and GPS route (`ExerciseRoute` / `HKWorkoutRoute`) as available — encoded into FIT `record` messages, with lap messages when the platform exposes them. Summary-only remains the graceful fallback when no stream exists.
- **Expanded wellness metric set:** add daily **steps** (shipped), daily **distance**, **active/total energy** from the activity ring, plus **exercise minutes** and **floors climbed** where available. Continue to omit fields with no sample; never invent subjective values.
- **Cross-platform parity & correctness:** sleep duration means **time asleep** on both platforms (Health Connect `SLEEPING`/stage buckets, not in-bed session merge; shipped), consistent unit normalization (kJ→kcal, km/mi→m), and honest stage attribution.
- **Incremental sync (watermark):** persist a per-source, per-kind watermark; each pass reads/pushes only data changed since the last success and backfills the full window only on first enable or explicit "Resync all". Cuts redundant reads and `POST /api/wellness` churn.
- **Change-driven background sync:** Android registers Health Connect **change notifications** (+ periodic WorkManager fallback); iOS registers **HealthKit background delivery / observer queries** alongside `BGAppRefresh`. Background remains best-effort; foreground + ledger retry stay the correctness backstop.
- **Stronger workout dedup:** carry the stable `platformSessionId` into FIT metadata and rely on backend idempotency keyed on it (coach-wattz follow-up), so re-uploads across passes, app reinstalls, and multi-device do not create duplicates. Presence-match against `GET /api/workouts` remains the client-side first line.

## Delivered in this change (code) vs. forward work

- **Delivered now:** workout **heart-rate** streams (both platforms → FIT `record` + session avg/max HR), daily **steps** + HealthKit **total calories**, Health Connect **sleep = time asleep** with correct stage mapping, expanded read permissions (HR, steps, distance) on both platforms.
- **Forward work (tasks below):** power/cadence/speed/GPS route + laps, remaining daily-activity metrics, watermark incremental sync, change-driven background delivery, backend `platformSessionId` idempotency.

## Capabilities

### Modified Capabilities

- `health-platform-sync`: extend the sync contract to cover workout time-series streams, the expanded objective metric set, cross-platform parity, incremental watermark reads, and change-driven background delivery.
- `store-ready`: privacy disclosure must reflect the broader read set (HR stream, steps, distance, route/GPS when workouts on) and background collection.

## Impact

- **Mobile:** `src/features/health/readers/*` (stream extraction), `buildMinimalFit.ts` (record/lap/route encoding), `orchestrator.ts` (watermark), `backgroundTask.ts` (change-driven registration), `syncPermissions.ts` + `app.json` (expanded read scopes). **Native rebuild required** — new HealthKit read types and Health Connect permissions, plus iOS background-delivery entitlement wiring.
- **APIs (existing coach-wattz):** `POST /api/workouts/upload-fit` receives richer FIT (no contract change); `POST /api/wellness` receives new metric fields (`steps`, `distanceMeters`, `exerciseMinutes`, `floors`) — confirm backend accepts/ignores unknown fields; **new backend follow-up:** idempotency on `platformSessionId` (extends [issues/063](../../../../docs/issues/063.md)).
- **Privacy / store:** update `docs/store-privacy-checklist.md` for GPS/route + activity data and background collection; App Privacy / Data safety re-review.
- **Non-goals:** continuous ECG, clinical interpretation, writing back to HealthKit/Health Connect, replacing web Connected Apps OAuth, nutrition from health platforms.
