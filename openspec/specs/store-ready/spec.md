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
The repository SHALL contain store-ready privacy/health usage strings (or a checklist of exact copy) covering OAuth identity, wellness check-in, notification data use, and **camera/photo library access for Coach chat attachments (including nutrition logging)**, without medical claims.

#### Scenario: Store questionnaire copy available
- **WHEN** preparing App Store / Play Console questionnaires
- **THEN** engineers can find the approved privacy/health strings in-repo, including photo/camera purpose text for Coach

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

