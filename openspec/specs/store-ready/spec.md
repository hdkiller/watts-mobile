# store-ready Specification

## Purpose
TBD - created by archiving change phase-3-store-polish. Update Purpose after archive.
## Requirements
### Requirement: Brand app icon and splash
The app SHALL ship Coach Watts branded icon and splash assets configured for iOS and Android store builds.

#### Scenario: Launch splash
- **WHEN** the user cold-starts a release/dev-client build
- **THEN** the splash uses Coach Watts branding (not a generic Expo placeholder)

### Requirement: Privacy and health data strings
The repository SHALL contain store-ready privacy/health usage strings (or a checklist of exact copy) covering OAuth identity, wellness check-in, **optional Health Sync upload of Apple Health / Health Connect metrics and workouts to the athlete’s Coach Watts instance when enabled**, notification data use, and **camera/photo library access for Coach chat attachments (including nutrition logging)**, without medical claims.

#### Scenario: Store questionnaire copy available
- **WHEN** preparing App Store / Play Console questionnaires
- **THEN** engineers can find the approved privacy/health strings in-repo, including Health Sync upload purpose text (distinct from Log-only prefill) and photo/camera purpose text for Coach

### Requirement: Release observability hooks
Release builds SHALL be able to initialize Sentry with configuration supplied via env/EAS secrets, without committing private secrets to git.

#### Scenario: Sentry config from env
- **WHEN** a release build has Sentry DSN configured via environment
- **THEN** the app initializes Sentry using that configuration

### Requirement: Photo permission purpose strings in app config
iOS/Android permission prompts for camera and photo library SHALL use Coach Watts purpose copy that states chat attachments / nutrition logging (not generic “access photos”).

#### Scenario: Permission dialog copy
- **WHEN** the OS shows a camera or photo-library permission prompt from Coach attach
- **THEN** the purpose string identifies Coach Watts chat / meal logging use

### Requirement: Account deletion path reachable in-app
The app SHALL provide a clear in-app path to account deletion via Settings → Delete account that opens the web Danger Zone (or equivalent) using Open web / session handoff when available, without requiring the athlete to discover deletion only outside the app.

#### Scenario: Delete account from Settings
- **WHEN** the authenticated user chooses Delete account in Settings
- **THEN** the app opens the instance web destination where account deletion is performed

### Requirement: Data export path reachable in-app
The app SHALL provide a clear in-app path to export personal data via Settings → Export my data that opens the web export destination using Open web / session handoff when available.

#### Scenario: Export from Settings
- **WHEN** the authenticated user chooses Export my data in Settings
- **THEN** the app opens the instance web destination where data export is available

### Requirement: Expanded health data disclosure for comprehensive sync
Store privacy disclosures (App Privacy / Data safety questionnaires and in-app copy) SHALL reflect the comprehensive Health Sync read set and background collection when Health Sync is enabled: heart-rate streams, steps and daily activity volume, distance, and — when workout sync is on — GPS route / location data from workouts, collected periodically in the background. Disclosures MUST state that sync is opt-in and that disabling it (or signing out) stops background collection.

#### Scenario: Route/location disclosed when workouts sync
- **WHEN** the store privacy copy describes Health Sync with workouts enabled
- **THEN** it discloses that workout GPS route / location data may be uploaded to the athlete's instance

#### Scenario: Background collection disclosed
- **WHEN** the App Privacy / Data safety form is completed for a build including comprehensive Health Sync
- **THEN** health/fitness and location categories are marked as collected in the background under an opt-in control

### Requirement: Health Sync privacy disclosure in-app
When presenting Health Sync enablement, the app SHALL disclose that enabling sync uploads health metrics and workout sessions to the athlete’s Coach Watts instance, that sync is optional, and that Coach Watts does not write data back to Apple Health or Health Connect.

#### Scenario: Enable copy discloses upload
- **WHEN** the athlete views the Sync to Coach Watts control before or while enabling it
- **THEN** on-screen copy states that data is uploaded to their Coach Watts instance when sync is on

