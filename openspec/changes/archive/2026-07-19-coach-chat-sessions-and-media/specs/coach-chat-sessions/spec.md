## ADDED Requirements

### Requirement: Session open policy matches web
When Coach opens without an explicit room target, the system SHALL reuse the most recently active room if its activity timestamp (`index` / `lastMessageAt`) is within 15 minutes; otherwise it SHALL create a new room via `POST /api/chat/rooms` with `chat:write`.

#### Scenario: Reuse recent room
- **WHEN** the user opens Coach with no room target and the newest room’s last activity is ≤ 15 minutes ago
- **THEN** that room is selected and its messages load

#### Scenario: Auto-create after idle
- **WHEN** the user opens Coach with no room target and the newest room’s last activity is > 15 minutes ago
- **THEN** the client creates a new room and presents an empty conversation (with starter prompts)

#### Scenario: No rooms exist
- **WHEN** the user opens Coach and the rooms list is empty
- **THEN** the client creates a new room

### Requirement: Explicit room target overrides policy
An explicit room id from a deep link or in-app navigation SHALL select that room when it exists, bypassing the 15-minute auto-create rule.

#### Scenario: Open specific room
- **WHEN** Coach is opened with a valid target `roomId`
- **THEN** that room is selected regardless of idle time

#### Scenario: Missing room target
- **WHEN** Coach is opened with a `roomId` that is not in the athlete’s rooms
- **THEN** the user sees an error and the session open policy runs as fallback

### Requirement: Room list and switch
The Coach surface SHALL provide a room list showing the athlete’s chats and allow switching the active room.

#### Scenario: Browse rooms
- **WHEN** the user opens the room list
- **THEN** they see rooms from `GET /api/chat/rooms` ordered by recent activity

#### Scenario: Switch room
- **WHEN** the user selects a room from the list
- **THEN** the thread loads that room’s messages and subsequent sends use that `roomId`

### Requirement: Create new chat
The Coach surface SHALL let the user explicitly create a new chat via `POST /api/chat/rooms` and switch to it.

#### Scenario: New chat control
- **WHEN** the user taps New chat
- **THEN** a new room is created and becomes the active conversation

### Requirement: Read-only room guard
When the active room is marked read-only, the system SHALL prevent sending and attaching and offer a path to start a new chat.

#### Scenario: Read-only active room
- **WHEN** the selected room has `isReadOnly` true
- **THEN** the composer and attach actions are disabled and the user can start a new chat
