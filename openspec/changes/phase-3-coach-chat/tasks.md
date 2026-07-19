## 1. Backend / auth readiness (coach-wattz)

- [x] 1.1 Confirm Official Mobile App may request `chat:read` / `chat:write`
- [x] 1.2 Bearer (or equivalent) on `GET /api/websocket-token` for mobile clients
- [x] 1.3 Bearer on `GET /api/chat/rooms/[id]/state` (+ resume/retry with `chat:write`)
- [x] 1.4 Chat scopes already on mobile authorize scope list (`src/auth/scopes.ts`)

## 2. Coach data layer

- [ ] 2.1 Add `ai` + `@ai-sdk/react`; wire `useChat` + `DefaultChatTransport` + `expo/fetch` to `POST /api/chat/messages`
- [ ] 2.2 Hydrate history from `GET /api/chat/messages` into chat message state
- [ ] 2.3 WebSocket client: mint token, subscribe, merge `chat_assistant_text_delta` / upserts / turn status (mirror web)
- [ ] 2.4 Poll `GET /api/chat/messages` as degraded/safety net while turn active if WS unavailable
- [ ] 2.5 Context seed helper from Today/recovery cache (short, non-prescriptive)
- [ ] 2.6 Optional: room `state` + resume/retry helpers for turn recovery UX

## 3. Coach UI

- [ ] 3.1 Replace Coach placeholder with message list + composer over `useChat` messages/`parts`
- [ ] 3.2 Empty state with starter prompts
- [ ] 3.3 Loading / streaming / error / send-failure states (typing follows turn status)

## 4. Verify

- [ ] 4.1 Typecheck + unit tests for seed/mapper helpers
- [ ] 4.2 Manual smoke: open Coach → send → see **streaming** reply (WS path)
- [ ] 4.3 Manual smoke: WS unavailable → poll path still completes the turn
- [ ] 4.4 Update implementation-plan Phase 3 chat checkboxes + open-questions decision log
