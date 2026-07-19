## Why

Coach chat is the third tab of the daily loop: short Q&A seeded with today + recovery, without opening the web control room. Notifications/push can land in parallel; chat is the next athlete-facing surface after Log. v1 must feel stellar (live streaming), not a poll-only stub.

## What Changes

- Coach tab threaded chat UI on **`@ai-sdk/react`** (`useChat` + `DefaultChatTransport` + `expo/fetch`), aligned with web’s AI SDK UI model
- Seed first turn / context with today recommendation + recovery when available
- Starter prompts for empty rooms
- Load rooms/messages and send via existing chat HTTP APIs (`chat:read` / `chat:write`)
- Delivery: **Bearer WebSocket** for live deltas (primary); poll `GET /api/chat/messages` as degraded/safety net only
- Request `chat:read` and `chat:write` in the OAuth scope set
- **coach-wattz (done 2026-07-19):** Bearer on `websocket-token`, room `state`, resume/retry; `chat:*` in public scopes / Official Mobile App

## Capabilities

### New Capabilities

- `coach-chat`: Coach tab UI, `@ai-sdk/react` client, rooms/messages, WS streaming + poll fallback, starter prompts, today/recovery seeding

### Modified Capabilities

- `oauth-pkce`: Add chat scopes to the authorize request once product confirms them for the Official Mobile App client

## Impact

- **watts-mobile:** Coach tab + `src/features/coach/`; `@ai-sdk/react` / `ai` deps; WS client; scope list update
- **coach-wattz:** Chat REST + WS token + room state + resume/retry Bearer-ready; mobile implements client
- **Out of scope:** Full web chat tooling, coaching teams, voice, E2E, deep-link host files (see `phase-3-deep-links`)
