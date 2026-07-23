## Context

Web dictation in coach-wattz `ChatInput.vue` records with `MediaRecorder`, POSTs multipart `audio` to `/api/chat/transcribe`, and appends `{ transcript }` into the composer. Mobile Coach already uses Bearer chat APIs for rooms/messages/upload but had no mic path. The transcribe endpoint previously used `getServerSession` only, which blocks PKCE tokens.

## Goals / Non-Goals

**Goals:**

- Web-parity dictation UX: mic → record/stop → server transcript → edit → send as normal text
- Reuse Gemini transcription + chat quota on the instance
- iOS/Android mic permissions with clear purpose strings
- Keep audio out of the message thread (transcript text only)

**Non-Goals:**

- TTS / reading coach replies aloud
- Sending raw audio as a chat attachment
- On-device / streaming speech recognition
- Background recording while the app is suspended

## Decisions

1. **Reuse `/api/chat/transcribe` instead of a new mobile endpoint**  
   Same product contract and quota as web. Only auth needed to change (`requireAuth` with `chat:write`).

2. **`expo-audio` + `RecordingPresets.HIGH_QUALITY` (`.m4a` / `audio/mp4`)**  
   Native Expo module with config plugin for mic permissions. `audio/mp4` is already allowed by the server. Disable background playback/recording plugin flags so we do not pull foreground-service / `UIBackgroundModes` for this feature.

3. **Composer paste, not auto-send**  
   Matches web: athlete reviews/edits the transcript, then taps send. Avoids accidental sends from noisy environments.

4. **Mic affordance always visible when writable**  
   Primary (brand) when composer is empty; ghost outline when text/attachments exist; red stop while recording; spinner while transcribing.

## Risks / Trade-offs

- **[Risk] Native rebuild required after `expo-audio`** → Document in `docs/native-modules.md`; Metro alone will not link the module.
- **[Risk] Permission denied** → Clear error copy; text chat and photo attach remain usable.
- **[Risk] Chat quota 429 on transcribe** → Surface server message via `friendlyError`; same bucket as chat.
- **[Trade-off] Full-clip then transcribe (not live STT)** → Slight latency after stop; consistent with web quality/cost model.

## Migration Plan

1. Deploy coach-wattz auth change for `/api/chat/transcribe` (session still works; Bearer newly works).
2. Ship mobile with `expo-audio` + mic UI after rebuilding the dev client / store binaries.
3. Update App Store / Play privacy answers for optional audio when submitting the next build that includes dictation.

## Open Questions

None for this slice — TTS and voice attachments remain deferred follow-ups.
