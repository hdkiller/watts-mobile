## ADDED Requirements

### Requirement: Notifications inbox list
The system SHALL provide a Notifications inbox (reachable from More) that loads the athlete’s notifications via `GET /api/notifications` using the authenticated Bearer API client.

#### Scenario: List loads
- **WHEN** the authenticated user opens Notifications
- **THEN** the app shows a list of notifications with title/body and read/unread state when provided by the API

#### Scenario: Empty inbox
- **WHEN** the API returns an empty list
- **THEN** the user sees an honest empty state (not a blank screen)

### Requirement: Mark notification read
The system SHALL mark a notification read via `PATCH /api/notifications/read` with the notification id when the user opens or explicitly marks that item.

#### Scenario: Mark one read
- **WHEN** the user opens an unread notification
- **THEN** the client requests mark-read for that id and the item appears read after success

### Requirement: Mark all read
The system SHALL support marking all notifications read when the API accepts `{ all: true }` (or equivalent) on the mark-read endpoint.

#### Scenario: Mark all
- **WHEN** the user chooses Mark all read and the request succeeds
- **THEN** unread indicators clear in the inbox list

### Requirement: Inbox loading and error states
The inbox SHALL show loading while fetching and a recoverable error state with retry on failure.

#### Scenario: Fetch error
- **WHEN** the notifications request fails
- **THEN** the user sees an error message and can retry
