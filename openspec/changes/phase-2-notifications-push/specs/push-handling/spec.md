## ADDED Requirements

### Requirement: Handle notification response opens
When the user opens the app from a push notification, the system SHALL read the notification `data` payload and navigate using `path` when present, or a type-based default route stub.

#### Scenario: Path provided
- **WHEN** a notification includes `data.path` of `/today`
- **THEN** the app navigates to the Today tab (or equivalent stub until deep-links finalize)

#### Scenario: Type fallback
- **WHEN** `data.type` is `RECOMMENDATION_READY` and no path is present
- **THEN** the app navigates to Today

### Requirement: Supported initial event types
The client SHALL recognize at least: `RECOMMENDATION_READY`, `WORKOUT_ANALYSIS_READY`, `SYNC_COMPLETED`, and `COACH_MESSAGE` for routing defaults.

#### Scenario: Coach message type
- **WHEN** `data.type` is `COACH_MESSAGE`
- **THEN** the app navigates to the Coach tab or chat stub

### Requirement: Foreground presentation policy
When a push arrives while the app is foregrounded, the system SHALL present or surface the notification in a way that does not corrupt navigation state (banner/in-app affordance acceptable).

#### Scenario: Foreground receipt
- **WHEN** a push arrives in the foreground
- **THEN** the user can discover it (system banner or inbox refresh) without an uncaught error
