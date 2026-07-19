## MODIFIED Requirements

### Requirement: Four-tab authenticated navigation
When the user is authenticated, the system SHALL present bottom tabs labeled Today, Log, Coach, and More, where More hosts account/settings destinations (notifications, instance, open web, sign out) rather than remaining a permanent placeholder.

#### Scenario: Authenticated user sees tabs
- **WHEN** a valid session exists
- **THEN** the user can navigate among Today, Log, Coach, and More tabs

#### Scenario: More is account hub
- **WHEN** the authenticated user opens More
- **THEN** they can reach account glue actions required for the store candidate
