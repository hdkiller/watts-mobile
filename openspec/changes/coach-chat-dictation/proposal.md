## Why

Web Coach chat already lets athletes dictate into the composer via record → `POST /api/chat/transcribe` → paste transcript. Mobile Coach is text + photo only, so field athletes cannot dictate the way they do on web. Closing that gap keeps the companion loop parity for the most common hands-busy use case.

## What Changes

- Add a microphone control on the Coach composer that records a short voice note on device
- Upload audio to the existing coach-wattz `POST /api/chat/transcribe` endpoint with Bearer auth and append the transcript into the composer (athlete reviews before send)
- **coach-wattz:** switch `/api/chat/transcribe` from session-only auth to `requireAuth` so OAuth Bearer (mobile PKCE) works
- Add `expo-audio`, microphone permission strings, and store/privacy disclosure for optional audio dictation
- Document native rebuild requirement after adding the audio module

## Capabilities

### New Capabilities

- `coach-chat-dictation`: Record → transcribe → composer paste for Coach chat (STT only)

### Modified Capabilities

- `coach-chat`: Composer exposes a dictation control alongside attach/send
- `store-ready`: Microphone / audio use disclosed for Coach dictation

## Impact

- **watts-mobile:** `src/features/coach/*` (composer UI, transcribe client, dictation hook), `app.json` / `expo-audio`, `docs/native-modules.md`, `docs/store-privacy-checklist.md`
- **coach-wattz (required):** Bearer-capable auth on `POST /api/chat/transcribe` (`requireAuth` + `chat:write`); Gemini Flash transcription and chat quota unchanged
- **Out of scope:** TTS / speak replies, voice attachments in the thread, live streaming STT, voice/TTS settings UI
