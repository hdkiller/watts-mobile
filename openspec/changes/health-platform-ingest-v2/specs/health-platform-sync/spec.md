## ADDED Requirements

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
