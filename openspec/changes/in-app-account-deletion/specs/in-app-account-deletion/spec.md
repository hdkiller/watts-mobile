## ADDED Requirements

### Requirement: Native In-App Account Deletion Confirmation
The system SHALL present an explicit native confirmation dialog when an athlete initiates account deletion from the app settings screen.

#### Scenario: Athlete opens delete account confirmation
- **WHEN** athlete taps "Delete account" in Settings
- **THEN** system displays a native warning modal detailing permanent data removal with Cancel and Confirm options

### Requirement: Authenticated Handoff to Account Deletion
The system SHALL ensure that opening the account deletion web page opens directly into an authenticated session without requiring manual credential re-entry.

#### Scenario: Athlete confirms deletion via web handoff
- **WHEN** athlete confirms "Delete account" and proceeds to web handoff
- **THEN** system launches the browser to `/settings/danger` with an active authenticated handoff session

### Requirement: Local Session Purge Upon Account Deletion
The system SHALL purge all stored tokens, local caches, and device state upon account deletion confirmation.

#### Scenario: Deletion confirmation purges client state
- **WHEN** account deletion is confirmed
- **THEN** system revokes tokens, clears SecureStore, wipes QueryClient cache, and navigates to the login screen
