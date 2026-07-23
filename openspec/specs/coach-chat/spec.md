# coach-chat Specification

## Purpose
TBD - created by archiving change phase-3-coach-chat. Update Purpose after archive.
## Requirements
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
The system SHALL include short today/recovery context when starting or seeding a conversation in an **empty** active room, without inventing training prescriptions on the client.

#### Scenario: Seed from Today cache
- **WHEN** Today data includes a recommendation or recovery summary and the user starts chat from an empty room (including a newly auto-created room)
- **THEN** the first send or seed includes a brief context derived from that data

### Requirement: Composer supports attachments
The Coach composer SHALL expose an attach control that adds photos per `coach-chat-media` alongside text input.

#### Scenario: Attach control visible
- **WHEN** the active room is writable
- **THEN** the composer shows an attach affordance in addition to send

### Requirement: Composer supports dictation
The Coach composer SHALL expose a microphone control that starts and stops voice dictation (record → `POST /api/chat/transcribe` → append transcript into the composer). Audio MUST NOT be sent as a chat attachment; the athlete MUST explicitly send after reviewing the transcript.

#### Scenario: Mic control visible
- **WHEN** the active room is writable and the athlete is not mid-send
- **THEN** the composer shows a dictate affordance in addition to attach and send

#### Scenario: Successful dictation
- **WHEN** the athlete records a voice note and stops
- **THEN** the transcript is appended into the composer for review before send

### Requirement: Seed from session detail handoff
In addition to Today/recovery seed for empty rooms, the Coach surface SHALL accept session handoff context from planned or activity detail (`session-coach-handoff`) and include a short non-prescriptive session seed when starting or sending the first discuss turn from that handoff. The system MUST NOT invent prescriptions beyond server-provided session fields.

#### Scenario: Session handoff seeds discuss turn
- **WHEN** Coach is opened with session handoff parameters and the user sends the discuss prompt
- **THEN** the outbound message includes brief session context derived from that planned or completed workout

#### Scenario: Today seed still works
- **WHEN** Coach is opened from Today Discuss without session handoff
- **THEN** existing Today/recovery seeding behavior remains available for empty rooms

