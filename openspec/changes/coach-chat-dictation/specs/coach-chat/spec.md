## ADDED Requirements

### Requirement: Composer supports dictation
The Coach composer SHALL expose a microphone control that starts and stops voice dictation per `coach-chat-dictation`, alongside attach and send.

#### Scenario: Mic control visible
- **WHEN** the active room is writable and the athlete is not mid-send
- **THEN** the composer shows a dictate affordance in addition to attach and send

#### Scenario: Composer disabled while transcribing
- **WHEN** a voice note is being transcribed
- **THEN** the composer text field and send control are unavailable until transcription finishes or fails
