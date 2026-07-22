# app-shell Specification

## Purpose
TBD - created by archiving change phase-0-expo-oauth. Update Purpose after archive.
## Requirements
### Requirement: Expo Router application shell
The system SHALL provide an Expo Router + TypeScript application at the repository root with a root layout that mounts theme, Query provider, and auth session hydration.

#### Scenario: Cold start loads app shell
- **WHEN** the user launches the app
- **THEN** the Expo Router root layout initializes and navigates according to auth/instance state

### Requirement: Four-tab authenticated navigation
When the user is authenticated **and soft-activated** (per activation-onboarding status), the system SHALL present bottom tabs labeled Today, Log, Coach, and More, where More hosts account/settings destinations (notifications, instance, open web, sign out) rather than remaining a permanent placeholder. When the user is authenticated but soft activation is incomplete, the system SHALL present the activation wizard instead of the four-tab shell as the primary navigation.

#### Scenario: Soft-activated user sees tabs
- **WHEN** a valid session exists and soft activation is complete
- **THEN** the user can navigate among Today, Log, Coach, and More tabs

#### Scenario: Incomplete activation sees wizard
- **WHEN** a valid session exists and soft activation is incomplete
- **THEN** the app presents the activation wizard stack rather than the four tabs as the home experience

#### Scenario: More is account hub
- **WHEN** the soft-activated authenticated user opens More
- **THEN** they can reach account glue actions required for the store candidate

### Requirement: Open web escape hatch
The authenticated More (or Settings) surface SHALL offer an action that opens the configured Coach Watts instance in the system browser via the app→web session handoff when available (mint consume URL), falling back to the bare instance base URL if handoff mint fails.

#### Scenario: Open web from More
- **WHEN** the authenticated user chooses Open web
- **THEN** the system opens a handoff consume URL for the instance (or the instance base URL on handoff failure) in the system browser

#### Scenario: Open web lands signed in when handoff succeeds
- **WHEN** handoff mint and consume succeed
- **THEN** the browser session is authenticated as the same athlete without a second interactive login

### Requirement: Brand theme tokens
The system SHALL apply Coach Watts brand colors (primary green and dark-friendly neutrals) via NativeWind or equivalent theme configuration.

#### Scenario: Primary actions use brand green
- **WHEN** primary buttons render on auth or shell screens
- **THEN** they use the Coach Watts primary green token

