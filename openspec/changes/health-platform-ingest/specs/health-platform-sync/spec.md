## ADDED Requirements

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
