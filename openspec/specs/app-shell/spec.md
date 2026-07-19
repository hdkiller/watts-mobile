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
When the user is authenticated, the system SHALL present bottom tabs labeled Today, Log, Coach, and More as placeholder screens suitable for later feature work.

#### Scenario: Authenticated user sees tabs
- **WHEN** a valid session exists
- **THEN** the user can navigate among Today, Log, Coach, and More tabs

### Requirement: Open web escape hatch
The authenticated More (or Settings) surface SHALL offer an action that opens the configured Coach Watts instance in the system browser.

#### Scenario: Open web from More
- **WHEN** the authenticated user chooses Open web
- **THEN** the system opens the instance base URL in the system browser

### Requirement: Brand theme tokens
The system SHALL apply Coach Watts brand colors (primary green and dark-friendly neutrals) via NativeWind or equivalent theme configuration.

#### Scenario: Primary actions use brand green
- **WHEN** primary buttons render on auth or shell screens
- **THEN** they use the Coach Watts primary green token

