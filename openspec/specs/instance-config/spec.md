# instance-config Specification

## Purpose
TBD - created by archiving change phase-0-expo-oauth. Update Purpose after archive.
## Requirements
### Requirement: Capture instance base URL
On first launch (or when no instance is configured), the system SHALL require the user to provide a Coach Watts instance base URL before starting OAuth.

#### Scenario: First launch prompts for instance
- **WHEN** no instance URL is stored
- **THEN** the user is shown an instance setup screen and cannot start OAuth until a URL is saved

### Requirement: Default hosted instance
The system SHALL prefill a default hosted instance URL of `https://app.coachwatts.com` unless overridden by configuration.

#### Scenario: Prefill default
- **WHEN** the instance setup screen opens with no saved URL
- **THEN** the input is prefilled with the default hosted instance URL

### Requirement: Normalize and persist instance URL
The system SHALL normalize the instance URL (trim whitespace and trailing slash) and persist it for subsequent launches.

#### Scenario: Trailing slash removed
- **WHEN** the user saves `https://coach.example.com/`
- **THEN** the stored base URL is `https://coach.example.com`

### Requirement: Validate instance reachability
Before starting OAuth, the system SHALL validate that the instance base URL is reachable over the network and surface a clear error if validation fails.

#### Scenario: Unreachable instance
- **WHEN** the user saves an unreachable URL and attempts to continue
- **THEN** the system shows an error and does not open the OAuth browser flow

