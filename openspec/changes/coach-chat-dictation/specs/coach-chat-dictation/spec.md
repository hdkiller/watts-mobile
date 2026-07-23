## ADDED Requirements

### Requirement: Dictate into the Coach composer
The Coach surface SHALL let the athlete record a voice note, upload it to `POST /api/chat/transcribe` with Bearer `chat:write`, and append the returned transcript into the composer text. The system MUST NOT send the audio as a chat attachment or auto-send the transcript without an explicit send action.

#### Scenario: Successful dictation
- **WHEN** the athlete taps the mic control, records a short voice note, and stops
- **THEN** the app uploads the recording for transcription and appends the transcript into the composer for review

#### Scenario: Permission denied
- **WHEN** microphone permission is denied
- **THEN** the app shows an error explaining that microphone access is required for dictation and leaves text/photo chat usable

#### Scenario: Transcription failure or quota
- **WHEN** transcription fails or the instance returns a chat quota error
- **THEN** the app shows an actionable error and does not clear existing composer text
