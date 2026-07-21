## Context

`health-platform-ingest` (v1) established the pipeline: readers → mapper → orchestrator → uploaders, with a ledger and opt-in toggles. v1 explicitly deferred stream-level workout data ("summary FIT; enrich streams as a fast follow-up"), a full daily-activity metric set, and incremental/change-driven sync. This change is that follow-up. It reuses every v1 seam; no re-architecture.

## Goals / Non-Goals

**Goals:**

- Upload analyzable workouts: HR (done), power, cadence, speed, GPS route, laps.
- Expand objective wellness to daily activity volume (steps done; distance, active/total energy, exercise minutes, floors).
- Cross-platform metric parity and honest correctness (sleep = time asleep; unit normalization).
- Incremental watermark sync; full backfill only on first enable / manual resync.
- Change-driven + reliable background delivery per platform.
- Backend-friendly dedup via stable `platformSessionId`.

**Non-Goals:**

- Continuous ECG / clinical claims.
- Write-back to HealthKit / Health Connect.
- Replacing web Connected Apps OAuth.
- Perfect iOS real-time background (best-effort remains).

## Decisions

### D1 — FIT record stream encoding

- Add FIT `record` (global 20) messages: `timestamp` (253) + `heart_rate` (3) now; `power` (7), `cadence` (4), `speed` (6), `position_lat`/`position_long` (0/1, semicircles) as those streams land.
- Session summary carries `avg_heart_rate` (16) / `max_heart_rate` (17) now; extend with `avg_power`, `total_ascent`, etc. as streams are added.
- **Downsample** each stream to a cap (HR: `MAX_HR_SAMPLES = 1200`) with even stride, always retaining the final sample, so FIT files stay small and upload reliably on cellular. Avg/max are computed from the **full** stream before downsampling.
- Emit `record` messages between FileId and Session so parsers see the time series before the summary. Lap messages (global 19) added when the platform exposes laps/splits.

Alternative rejected: upload raw JSON streams to a new endpoint — the analysis pipeline consumes FIT; reuse `upload-fit`.

### D2 — Stream sources per platform

| Stream | HealthKit | Health Connect |
|--------|-----------|----------------|
| Heart rate | `HKQuantityTypeIdentifierHeartRate` in workout window | `HeartRateRecord.samples` in session window |
| Power | `HKQuantityTypeIdentifierCyclingPower` / `RunningPower` | `PowerRecord` |
| Cadence | running/cycling cadence identifiers | `CyclingPedalingCadence` / `StepsCadence` |
| Speed | `HKQuantityTypeIdentifierRunningSpeed` / distance-derived | `SpeedRecord` |
| Route (GPS) | `HKWorkoutRoute` → `CLLocation` series | `ExerciseSession.route` / `ExerciseRoute` |

Each requires its own read permission (HealthKit read types + Android `health.READ_*`), requested when workouts sync is enabled. Route/GPS is the most privacy-sensitive — gate its read behind the workouts sub-toggle and disclose explicitly.

### D3 — Cross-platform parity

- **Sleep duration = time asleep.** Health Connect: sum LIGHT+DEEP+REM+SLEEPING stage durations; fall back to in-bed interval merge only when a session has no stages. HealthKit already sums asleep stages. AWAKE (stage 1) is the only awake bucket; OUT_OF_BED is excluded.
- **Units normalized at the reader edge:** energy → kcal, distance → meters, HRV mapped to `hrv` (RMSSD) vs `hrvSdnn` (SDNN) by platform — never mixed.

### D4 — Incremental watermark sync

- Persist `{ source, kind, lastReadThrough }` watermarks (AsyncStorage, alongside prefs).
- Each pass reads `[max(lastReadThrough - overlap, windowStart), now]` with a small overlap (e.g. 6h) to catch late-arriving/edited samples; pushes only days/sessions whose content changed vs the ledger fingerprint.
- First enable, "Resync all", or a ledger cleared on sign-out → full lookback backfill.
- Wellness for the current + previous day is always re-read (metrics still settle), matching v1's short resync window.

### D5 — Change-driven background delivery

- **Android:** register a Health Connect changes subscription (changes token) and a periodic WorkManager job as fallback; a change notification wakes a sync pass. Respect Play background/battery policy — coalesce, no tight polling.
- **iOS:** enable HealthKit **background delivery** for the synced types and an `HKObserverQuery`; pair with `BGAppRefresh`. Requires the background-delivery entitlement and a rebuild. All best-effort; foreground + Settings retry remain authoritative.

### D6 — Workout dedup by session id

- FIT metadata already carries `platformSessionId`. Backend follow-up: idempotent create keyed on `(source, platformSessionId)` so repeated uploads (new pass, reinstall, second device) converge to one workout. Client keeps presence-match against `GET /api/workouts` as the first filter and stores `remoteWorkoutId` in the ledger on success/match.

### D7 — Privacy

- No metric values in analytics (unchanged from v1).
- GPS route is location data — disclosed distinctly in store copy; only read when workouts sync is on.
- Background collection disclosed for App Privacy / Data safety.

## Risks / Trade-offs

- **[Risk] FIT size on long activities** → downsample streams; cap samples; avg/max from full data.
- **[Risk] iOS background-delivery entitlement / review** → gate behind rebuild; degrade to foreground if unavailable.
- **[Risk] GPS privacy sensitivity / store scrutiny** → explicit disclosure, workouts-gated, opt-in.
- **[Risk] Backend not yet idempotent on session id** → client presence-match still prevents most dupes; ship independently.
- **[Risk] Unknown wellness fields rejected by backend** → confirm `POST /api/wellness` ignores unknown keys before enabling new metrics.

## Migration Plan

1. Land correctness + HR streams + steps (this change's code) behind the existing opt-in toggle — no new user surface.
2. Add remaining streams/metrics incrementally; each new read type ships with a rebuild + store-copy update.
3. Enable change-driven background delivery after entitlement wiring and a dev-client smoke.
4. Backend `platformSessionId` idempotency lands independently; client already sends it.

## Open Questions

1. Does `POST /api/wellness` silently accept unknown metric keys (`steps`, `distanceMeters`, `exerciseMinutes`, `floors`), or is a backend schema change required first?
2. GPS/route: upload full route in FIT, or a reduced polyline? (Analysis needs vs. payload size / privacy.)
3. iOS background-delivery entitlement availability under the current provisioning profile.
