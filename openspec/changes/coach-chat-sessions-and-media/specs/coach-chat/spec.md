## MODIFIED Requirements

### Requirement: Coach tab conversation surface
The Coach tab SHALL present a threaded conversation for the athlete’s **active** chat room (selected via session policy, room list, or explicit target) with a message list and composer.

#### Scenario: Open Coach tab
- **WHEN** the authenticated user opens Coach
- **THEN** they see messages for the active room (or an empty conversation state) and can type a message

### Requirement: Load rooms and messages via Bearer chat API
The system SHALL load rooms via `GET /api/chat/rooms` and messages via `GET /api/chat/messages` using Bearer auth with `chat:read`, and SHALL select the active room according to `coach-chat-sessions` (not always `rooms[0]` without idle checks).

#### Scenario: Messages load
- **WHEN** an active room id is known
- **THEN** the client fetches messages for that room and renders them in order

### Requirement: Send message
Sending from the composer SHALL call `POST /api/chat/messages` with `chat:write` (text and/or file parts) and then refresh or append the thread so the user sees their message and eventual coach reply.

#### Scenario: Successful send
- **WHEN** the user sends a non-empty text message or attachments
- **THEN** the message is posted to the API and appears in the thread

### Requirement: Seed with today and recovery context
The system SHALL include short today/recovery context when starting or seeding a conversation in an **empty** active room, without inventing training prescriptions on the client.

#### Scenario: Seed from Today cache
- **WHEN** Today data includes a recommendation or recovery summary and the user starts chat from an empty room (including a newly auto-created room)
- **THEN** the first send or seed includes a brief context derived from that data

## ADDED Requirements

### Requirement: Composer supports attachments
The Coach composer SHALL expose an attach control that adds photos per `coach-chat-media` alongside text input.

#### Scenario: Attach control visible
- **WHEN** the active room is writable
- **THEN** the composer shows an attach affordance in addition to send
