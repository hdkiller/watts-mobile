# coach-chat Specification

## Purpose
TBD - created by archiving change phase-3-coach-chat. Update Purpose after archive.
## Requirements
### Requirement: Coach tab conversation surface
The Coach tab SHALL present a threaded conversation for the athlete’s default chat room with a message list and composer.

#### Scenario: Open Coach tab
- **WHEN** the authenticated user opens Coach
- **THEN** they see messages for the default room (or an empty conversation state) and can type a message

### Requirement: Load rooms and messages via Bearer chat API
The system SHALL load rooms via `GET /api/chat/rooms` and messages via `GET /api/chat/messages` using Bearer auth with `chat:read`.

#### Scenario: Messages load
- **WHEN** a default room id is known
- **THEN** the client fetches messages for that room and renders them in order

### Requirement: Send message
Sending from the composer SHALL call `POST /api/chat/messages` with `chat:write` and then refresh or append the thread so the user sees their message and eventual coach reply.

#### Scenario: Successful send
- **WHEN** the user sends a non-empty message
- **THEN** the message is posted to the API and appears in the thread

### Requirement: Poll while turn in flight
Until a Bearer-capable realtime channel is available, the system SHALL poll for new messages while a coach turn is expected, then stop or back off when idle.

#### Scenario: Poll during pending reply
- **WHEN** the user has just sent a message and a reply is pending
- **THEN** the client periodically re-fetches messages until a reply arrives or a timeout/backoff limit is reached

### Requirement: Starter prompts
When the conversation is empty, the Coach tab SHALL offer starter prompts that populate or send a useful first question.

#### Scenario: Tap starter prompt
- **WHEN** the room has no messages and the user taps a starter prompt
- **THEN** the composer is filled or the prompt is sent as a message

### Requirement: Seed with today and recovery context
The system SHALL include short today/recovery context when starting or seeding a conversation, without inventing training prescriptions on the client.

#### Scenario: Seed from Today cache
- **WHEN** Today data includes a recommendation or recovery summary and the user starts chat from an empty room
- **THEN** the first send or seed includes a brief context derived from that data

