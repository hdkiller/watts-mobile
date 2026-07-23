## 1. Backend auth

- [x] 1.1 Switch coach-wattz `POST /api/chat/transcribe` to `requireAuth` with `chat:write` (session + Bearer)

## 2. Mobile recording stack

- [x] 2.1 Install `expo-audio` and configure the config plugin (mic permission; no background audio)
- [x] 2.2 Add iOS/Android mic purpose strings and note rebuild in `docs/native-modules.md`
- [x] 2.3 Update store privacy checklist for optional audio dictation

## 3. Composer UX + API

- [x] 3.1 Add Bearer `transcribeChatAudio` multipart client
- [x] 3.2 Implement record/stop → transcribe → append-transcript hook
- [x] 3.3 Add mic control to Coach composer with recording/transcribing states and errors
- [x] 3.4 Unit-test transcript append helper and 429 friendly-error mapping

## 4. Verification

- [x] 4.1 Typecheck / unit tests for changed modules
- [ ] 4.2 Manual device check after native rebuild (permission prompt, dictate → edit → send)
