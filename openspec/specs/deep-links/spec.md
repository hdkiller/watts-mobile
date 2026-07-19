# deep-links Specification

## Purpose
TBD - created by archiving change phase-3-deep-links. Update Purpose after archive.
## Requirements
### Requirement: Custom scheme route map
The system SHALL resolve `coachwatts://` paths (other than OAuth callback) to Expo Router screens for Today, planned/recommendation detail, activity summary, Coach, and Notifications.

#### Scenario: Open Today via scheme
- **WHEN** the app receives `coachwatts://today`
- **THEN** navigation lands on the Today tab

#### Scenario: Open notifications via scheme
- **WHEN** the app receives `coachwatts://notifications`
- **THEN** navigation lands on the notifications inbox

### Requirement: Cold start and warm start
The system SHALL handle deep links both when the app is already running and when the link cold-starts the app.

#### Scenario: Cold start link
- **WHEN** the app is launched from a deep link
- **THEN** after auth/instance hydration, the user lands on the linked screen (or login with return path preserved)

### Requirement: Auth-preserving return path
If a deep link arrives while the user is logged out, the system SHALL preserve the intended path and navigate there after successful login.

#### Scenario: Login then resume
- **WHEN** a logged-out user opens `coachwatts://coach` and then completes login
- **THEN** the app navigates to the Coach tab

### Requirement: Shared resolver with push paths
Push notification `data.path` values SHALL use the same route resolver as custom-scheme deep links.

#### Scenario: Push path uses resolver
- **WHEN** a push includes `data.path` `/activities/123`
- **THEN** the app opens the activity summary for id `123` via the shared resolver

### Requirement: Document host association dependencies
The change SHALL document coach-wattz/hosting requirements for Apple App Site Association and Android Digital Asset Links so https universal links can be enabled without inventing paths later.

#### Scenario: Association contract documented
- **WHEN** implementers read the deep-links design/docs update
- **THEN** they can see required paths, app identifiers, and hosting locations for AASA/assetlinks

