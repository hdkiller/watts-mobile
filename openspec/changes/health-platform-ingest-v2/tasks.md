## 1. Correctness & parity (shipped in this change)

- [x] 1.1 Health Connect sleep = time asleep (sum LIGHT/DEEP/REM/SLEEPING; in-bed merge only as stage-less fallback); stop counting generic SLEEPING as awake
- [x] 1.2 Normalize workout energy (kJ→kcal) and distance (km/mi→m) at the reader edge
- [x] 1.3 HealthKit `totalCaloriesBurned` = active + basal for parity with Health Connect

## 2. Workout heart-rate streams (shipped in this change)

- [x] 2.1 Extract HR series per workout — HealthKit (`HKQuantityTypeIdentifierHeartRate` in window) and Health Connect (`HeartRateRecord.samples`)
- [x] 2.2 Shared `summarizeHeartRate` — clean, average/max from full stream, even-stride downsample to `MAX_HR_SAMPLES`, keep final sample
- [x] 2.3 Encode FIT `record` messages (timestamp + heart_rate) and session `avg_heart_rate` / `max_heart_rate`
- [x] 2.4 Add HR read scopes — HealthKit read type + Android `health.READ_HEART_RATE`

## 3. Daily activity metrics (steps shipped; rest forward)

- [x] 3.1 Steps — read (HealthKit `StepCount` sum, Health Connect `Steps` sum), map to `steps`, add to `sampleHasMetrics`, add read scopes (`READ_STEPS`)
- [x] 3.2 Daily distance from the activity ring (not just workout distance) → `distanceMeters`
- [x] 3.3 Exercise minutes / active minutes → `exerciseMinutes`
- [x] 3.4 Floors climbed → `floors`
- [x] 3.5 Confirm `POST /api/wellness` accepts/ignores the new fields; add backend schema follow-up if rejected

## 4. Remaining workout streams (forward)

- [x] 4.1 Power stream (HealthKit cycling/running power; Health Connect `PowerRecord`) → FIT `record.power` + session `avg_power`
- [x] 4.2 Cadence stream → FIT `record.cadence`
- [x] 4.3 Speed stream → FIT `record.speed`
- [x] 4.4 GPS route (HealthKit `HKWorkoutRoute`; Health Connect `ExerciseRoute`) → FIT `record` lat/long semicircles; gate read behind workouts sub-toggle
- [x] 4.5 Lap / split messages (FIT global 19) when the platform exposes laps
- [x] 4.6 Add read scopes + Android permissions for each new stream; native rebuild

## 5. Incremental watermark sync (forward)

- [x] 5.1 Persist per-source, per-kind watermark alongside sync preferences
- [x] 5.2 Read from `lastReadThrough - overlap` forward; full backfill on first enable / explicit resync / cleared state
- [x] 5.3 Skip re-push of unchanged already-synced items via ledger content fingerprint; keep current+previous day always re-read
- [x] 5.4 "Resync all" affordance in Settings → Health Sync history

## 6. Change-driven background delivery (forward)

- [x] 6.1 Android: register Health Connect changes subscription + periodic WorkManager fallback; coalesce per Play policy
- [x] 6.2 iOS: enable HealthKit background delivery + `HKObserverQuery`; wire entitlement; pair with `BGAppRefresh`
- [x] 6.3 Unregister all background triggers on disable / sign-out
- [x] 6.4 Verify degradation to foreground-only when entitlement/background unavailable

## 7. Dedup & backend (forward)

- [x] 7.1 Keep `platformSessionId` in FIT metadata (already sent); confirm coach-wattz idempotency keyed on `(source, platformSessionId)` — extend issue 063
- [x] 7.2 Ledger stores `remoteWorkoutId` on upload/match so repeated passes converge

## 8. Privacy, store & verification

- [x] 8.1 Update `docs/store-privacy-checklist.md` for expanded reads (HR, steps, distance) and background collection
- [x] 8.2 Update store copy again for GPS/route once §4.4 lands; complete App Privacy / Data safety background + location declarations
- [ ] 8.3 Rebuild dev clients after native scope/entitlement changes; smoke Health Sync on iOS + Android
- [ ] 8.4 Manual verify: workout with HR uploads a FIT that Coach Watts analyzes with zones/curve; steps appear on the instance; incremental pass does not re-push unchanged days

## 9. Audit remediation

- [x] 9.1 Clear or isolate health-sync state on every account / instance transition, including auth failure
- [x] 9.2 Prevent watermarks from advancing past failed or queued records; keep current + previous wellness day in the read window
- [x] 9.3 Treat FIT upload as queued until the workout is remotely confirmed; validate HTTP-200 result bodies and support safe retry
- [x] 9.4 Align emitted FIT record streams on a common timeline and preserve route altitude / accumulated distance when derivable
- [x] 9.5 Use platform aggregate/statistics APIs for daily cumulative metrics instead of summing capped raw samples
- [x] 9.6 Validate the complete Android data permission set and declare cadence permissions
- [x] 9.7 Strengthen workout matching with exact platform external ID plus sport/duration compatibility; make backend ingestion idempotent
- [x] 9.8 Restore change-driven registrations on launch, surface pass errors to background scheduling, and remove temporary FIT files
- [x] 9.9 Persist steps, distance, exercise minutes, and floors as first-class coach-wattz wellness fields; clean related docs
