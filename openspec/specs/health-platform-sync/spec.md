# health-platform-sync Specification

## Purpose
TBD - created by archiving change health-platform-ingest-v2. Update Purpose after archive.
## Requirements
### Requirement: Workout time-series streams uploaded
When workout sync is enabled and a platform exposes per-session time-series data (heart rate, and where available power, cadence, speed, and GPS route), the app SHALL extract those streams and encode them into the uploaded FIT so Coach Watts can analyze zones and curves rather than a summary only. The session summary SHALL carry aggregate values (average and maximum heart rate at minimum) derived from the full stream. When no stream is readable, the app SHALL still upload a valid summary-only FIT.

#### Scenario: Heart-rate stream encoded
- **WHEN** a HealthKit or Health Connect workout has heart-rate samples in its time window
- **THEN** the uploaded FIT includes `record` messages carrying the heart-rate series and the session carries average and maximum heart rate

#### Scenario: Summary-only fallback
- **WHEN** a workout has no readable time-series stream
- **THEN** the app uploads a valid FIT with the session summary and no `record` messages, and the item is still marked synced

#### Scenario: Stream bounded for upload
- **WHEN** a workout stream contains more samples than the per-stream cap
- **THEN** the app downsamples the encoded series to at most the cap while computing aggregate values from the full stream and retaining the final sample

### Requirement: Expanded objective wellness metric set
When wellness sync is enabled, the app SHALL read and upload daily activity-volume metrics in addition to the v1 set — steps, and where available daily distance, active/total energy from the activity ring, exercise minutes, and floors climbed — omitting any metric with no sample. Subjective values MUST NOT be synthesized from health-platform data.

#### Scenario: Steps uploaded
- **WHEN** a day has a step count on-device
- **THEN** the wellness payload for that date includes `steps`

#### Scenario: Missing activity metric omitted
- **WHEN** a day has steps but no floors-climbed sample
- **THEN** the client omits the floors field rather than sending zero

### Requirement: Cross-platform metric parity
The app SHALL produce comparable metric semantics across HealthKit and Health Connect. Sleep duration SHALL represent time asleep on both platforms (summing asleep stages rather than in-bed session span, with in-bed span used only as a fallback when a session has no stages). Energy SHALL be normalized to kilocalories and distance to meters regardless of source unit. HRV SHALL be mapped to `hrv` (RMSSD) or `hrvSdnn` (SDNN) by platform and never mixed.

#### Scenario: Sleep is time asleep on Android
- **WHEN** a Health Connect sleep session reports awake periods interleaved with asleep stages
- **THEN** `sleepSecs` reflects only the asleep stage durations, not the full in-bed span

#### Scenario: Generic asleep not counted as awake
- **WHEN** a Health Connect sleep stage is the generic SLEEPING type
- **THEN** its duration counts toward time asleep and MUST NOT be added to awake time

### Requirement: Incremental watermark sync
When sync is enabled, the app SHALL sync incrementally using a persisted per-source, per-kind watermark, reading and pushing only data changed since the last successful sync (with a small overlap window to catch late or edited samples). A full lookback backfill SHALL run only on first enable, on an explicit resync request, or when local sync state has been cleared.

#### Scenario: Incremental pass after a prior success
- **WHEN** a sync pass runs after a previous successful sync
- **THEN** the app reads from the last watermark (minus the overlap) forward and does not re-push unchanged already-synced items

#### Scenario: Full backfill on first enable
- **WHEN** the athlete enables sync for the first time or requests a full resync
- **THEN** the app reads and pushes the entire lookback window

### Requirement: Change-driven background sync
When sync is enabled, the app SHALL register platform-appropriate change-driven background triggers (Health Connect change notifications on Android; HealthKit background delivery / observer queries on iOS) in addition to periodic background tasks, and SHALL unregister them when sync is disabled. Background delivery remains best-effort and MUST NOT be required for correctness; missed runs are recoverable via foreground sync and Settings retry.

#### Scenario: Change notification triggers a pass
- **WHEN** the platform reports new health data while sync is enabled and background triggers are registered
- **THEN** the app attempts a sync pass for the changed data

#### Scenario: Disable removes background triggers
- **WHEN** the athlete disables sync
- **THEN** the app unregisters both change-driven and periodic background triggers

### Requirement: Workout dedup by platform session id
The app SHALL include the stable platform session identifier in workout upload metadata and SHALL avoid creating duplicate remote workouts across repeated sync passes, app reinstalls, or multiple devices. Client-side presence matching against existing Coach Watts workouts remains the first filter; backend idempotency keyed on the platform session id is the durable guarantee (tracked as a backend dependency).

#### Scenario: Re-upload does not duplicate
- **WHEN** the same platform workout is processed again in a later pass and was already uploaded
- **THEN** the app does not create a second remote workout and the ledger reflects the existing `remoteWorkoutId`

### Requirement: Health Sync upload is opt-in
The companion SHALL keep automatic Health Connect / HealthKit upload disabled until the athlete explicitly enables “Sync to Coach Watts” on the Health Sync settings screen. Granting read permission for Log prefill alone MUST NOT enable upload.

#### Scenario: Prefill permission without sync
- **WHEN** the athlete has granted health read permission but has not enabled Sync to Coach Watts
- **THEN** the app MUST NOT upload health samples to Coach Watts

#### Scenario: Enable sync
- **WHEN** the athlete enables Sync to Coach Watts and required permissions are granted
- **THEN** the app begins automatic sync using the wellness and workout pipelines defined in this capability

### Requirement: Wellness metrics synced to Coach Watts
When sync is enabled, the app SHALL read available objective daily metrics from Health Connect (Android) or HealthKit (iOS) and upload them with `POST /api/wellness` (`health:write`) for the athlete’s local calendar dates in the lookback window. The v1 metric set SHALL include sleep duration and stages when available, resting heart rate, HRV (mapped to `hrv` and/or `hrvSdnn` by platform), weight, body fat, SpO₂, respiration, VO₂ max, and calorie fields when present. Subjective fields (mood, stress, fatigue, soreness, notes) MUST NOT be invented from health platform data.

#### Scenario: Sleep and RHR upload
- **WHEN** sync is enabled and last night’s sleep plus resting HR samples exist on-device
- **THEN** the client POSTs a wellness payload for that date including sleep fields and `restingHr`, with platform provenance in `rawJson`

#### Scenario: Missing optional metrics omitted
- **WHEN** a day has sleep but no SpO₂ sample
- **THEN** the client omits `spO2` rather than sending a placeholder zero

### Requirement: Client always pushes mapped wellness
When producing a wellness upload for a date with at least one mapped metric, the client SHALL POST to Coach Watts even if another integration may already have data for that date. The client MUST NOT skip uploads based on web wearable presence. Merge and source precedence are owned by the Coach Watts backend.

#### Scenario: Push despite existing wearable day
- **WHEN** sync runs for a date that may already have Whoop or Garmin wellness on the server
- **THEN** the client still POSTs the Health Connect / HealthKit mapped payload for that date

### Requirement: Automatic and background sync
When sync is enabled and the athlete is authenticated, the app SHALL run sync on foreground/app-active transitions and SHALL register best-effort background sync appropriate to the platform. Background delivery MUST NOT be required for correctness; failed or missed background runs SHALL be recoverable via foreground sync and Settings retry.

#### Scenario: Foreground sync
- **WHEN** the app becomes active with sync enabled
- **THEN** the orchestrator attempts a sync pass for due wellness dates and workout sessions

#### Scenario: Background registration follows toggle
- **WHEN** the athlete enables Sync to Coach Watts
- **THEN** the app registers background sync hooks for the current platform

#### Scenario: Disable stops background work
- **WHEN** the athlete disables Sync to Coach Watts
- **THEN** the app unregisters background sync hooks and MUST NOT perform further automatic uploads

### Requirement: Workout sync is a separate sub-toggle
Workout upload SHALL be controlled by a **Sync workouts** sub-toggle under Sync to Coach Watts. The sub-toggle SHALL default to ON when the athlete first enables the master sync toggle, and MAY be turned off while master sync remains on. When master sync is off, workout upload MUST NOT run regardless of the sub-toggle. When master is on and Sync workouts is off, wellness sync SHALL continue and workout discovery/upload MUST NOT run.

#### Scenario: Workouts off, wellness on
- **WHEN** Sync to Coach Watts is on and Sync workouts is off
- **THEN** the app syncs wellness metrics and MUST NOT upload platform workouts

#### Scenario: Workouts default on with master
- **WHEN** the athlete enables Sync to Coach Watts for the first time
- **THEN** Sync workouts defaults to on

#### Scenario: Master off disables workouts
- **WHEN** Sync to Coach Watts is off
- **THEN** the app MUST NOT upload platform workouts even if Sync workouts was previously on

### Requirement: Workout sessions uploaded via FIT
When master sync and Sync workouts are both enabled, the app SHALL discover recent exercise sessions from Health Connect / HealthKit, upload sessions that are not confirmed present in Coach Watts via `POST /api/workouts/upload-fit` (`workout:write`), and include metadata identifying the platform session id and source. Workouts already matched to a Coach Watts workout MUST NOT be re-uploaded.

#### Scenario: New on-device workout
- **WHEN** master sync and Sync workouts are enabled, a Health Connect / HealthKit workout exists in the lookback window, and no matching Coach Watts workout is found
- **THEN** the client builds a FIT upload and posts it with `workout:write`

#### Scenario: Already present remotely
- **WHEN** a platform workout matches an existing Coach Watts workout by the presence heuristic
- **THEN** the client marks the item synced and does not upload again

### Requirement: Provenance preserved
Wellness and workout uploads SHALL include provenance suitable for backend reprocessing (`rawJson` / FIT metadata) identifying `health_connect` or `healthkit` as the source and retaining platform sample or session identifiers when available.

#### Scenario: Wellness rawJson source
- **WHEN** a wellness day is uploaded from HealthKit
- **THEN** `rawJson` includes a source marker of `healthkit` (or equivalent agreed key)

### Requirement: No health metric analytics
The app MUST NOT send health metric values (sleep hours, HRV, weight, etc.) to crash analytics or product analytics. Sync telemetry MAY include non-PII status enums and counts only.

#### Scenario: Sync failure logging
- **WHEN** a sync item fails
- **THEN** diagnostics may record kind/status/error class without metric values

