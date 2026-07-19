## Context

Chat HTTP APIs exist with `chat:read` / `chat:write` via `requireAuth`. Assistant generation is durable (`ChatTurn` + in-app runner). Live tokens arrive via WebSocket (`/api/websocket` + `GET /api/websocket-token`). Polling `GET /api/chat/messages` is the documented fallback. Web client already uses AI SDK UI (`@ai-sdk/vue` `Chat` + `DefaultChatTransport`) and merges WS deltas into message state.

**coach-wattz backend readiness (2026-07-19):** Bearer path landed. `GET /api/websocket-token` uses `requireAuth` (session, API key, or Bearer). Room `state` is Bearer + `chat:read`. Resume/retry turns are Bearer + `chat:write`. `chat:*` documented in public scopes; Official Mobile App public-client / consent labels updated. Durable-turn architecture unchanged (POST still only emits transient `data-chat-turn`).

## Goals / Non-Goals

**Goals:**
- Stellar Coach tab from v1: threaded chat with live token streaming parity with web feel
- Client stack aligned with web: `@ai-sdk/react` + `DefaultChatTransport` + `expo/fetch`
- Seed context from today’s recommendation + recovery when available
- Starter prompts when the room is empty
- Polling as degraded/safety-net mode only when WS is unavailable

**Non-Goals:**
- Full web chat feature parity (tools, attachments gallery, coaching team inbox)
- Voice / multimodal
- Inventing a separate SSE protocol on the client
- Request-bound HTTP token streaming that reverts the durable-turn architecture (unless a future reconnect design lands)

## Decisions

1. **Client: `@ai-sdk/react`**  
   Use `useChat` + `DefaultChatTransport` targeting `POST /api/chat/messages` (same contract as web). Hydrate history via `GET /api/chat/messages` into chat message state. Render `UIMessage` `parts` (text first in v1). Do not use Gifted Chat / Stream Chat as the message brain.

2. **Realtime: Bearer WebSocket first-class**  
   Mint token via `GET /api/websocket-token` with Bearer, connect `/api/websocket`, apply `chat_assistant_text_delta` / `chat_message_upsert` / turn status into `useChat` messages (mirror `chat.vue`). Use `GET /api/chat/rooms/[id]/state` (`chat:read`) for turn awareness. Resume/retry available with `chat:write` when needed.

3. **Degraded mode: poll**  
   If WS is down or token mint fails, poll `GET /api/chat/messages` while a turn is active. Not the target UX for store candidate; streaming via WS is the bar.

4. **Scopes**  
   Request `chat:read` and `chat:write` in PKCE authorize (already in `src/auth/scopes.ts`). coach-wattz accepts them for Official Mobile App / REST OAuth scopes.

5. **Seeding**  
   Prefer server-side room/context if an API exists; otherwise client prepends a short system/user context blurb derived from Today query cache (recommendation action + recovery summary) on first send — never invent training advice client-side.

6. **Starter prompts**  
   Static, brand-aligned prompts (e.g. “Why this recommendation?”, “How should I adjust if I’m sore?”) that fill the composer or send immediately.

7. **Rooms**  
   Use existing `GET/POST /api/chat/rooms`; default to the athlete’s primary/self room. Do not build multi-room management UI in v1 beyond picking the default room.

## Risks / Trade-offs

- [Mobile networks + WS] → Keep poll safety net; do not invent SSE as a third protocol.
- [Seeding too aggressive] → Keep seed short; don’t dump full planned workout JSON into chat.
- [Local OAuth client] → Dev/TestFlight must use Official Mobile App (public client) with chat scopes consented; recreate via `oauth:create-system-app --official --public-client` if needed.

## Open Questions

- Whether modify-recommendation UX should deep-link into chat (related open question #3)
