## Context

Phase 0–2 Log are done. coach-wattz has `GET /api/notifications` and `PATCH /api/notifications/read` but they use session cookies today. `POST /api/mobile/devices` and Expo push send hooks are planned only. Mobile already uses scheme `coachwatts` for OAuth.

## Goals / Non-Goals

**Goals:**
- Inbox that lists and marks notifications read via Bearer
- Register Expo push token with the active instance after login
- Receive at least one push type on a physical device / simulator path and open a meaningful stub route
- Keep business logic (what to push, when) on the server

**Non-Goals:**
- Full universal-link / AASA hosting (Phase 3 deep-links)
- Offline check-in queue hardening
- Rich notification preferences UI beyond a simple entry (store-polish can deepen prefs)
- Implementing Expo push send infrastructure inside watts-mobile

## Decisions

1. **Reuse `/api/notifications` rather than a mobile-only inbox API**  
   Matches product baseline. Mobile waits on Bearer migration (`requireAuth`).

2. **New `POST /api/mobile/devices` for Expo tokens**  
   Body conceptually: `{ token, platform: 'ios'|'android', appVersion? }`. Idempotent upsert per user+token. Unregister on sign-out when possible (`DELETE` or re-register cleared — prefer DELETE if server adds it; otherwise overwrite on next login).

3. **Initial push event types** (server taxonomy):  
   `RECOMMENDATION_READY`, `WORKOUT_ANALYSIS_READY`, `SYNC_COMPLETED`, `COACH_MESSAGE`.  
   Client maps `data.type` + optional `data.path` to a stub navigator until deep-links change lands.

4. **Permission UX**  
   Request notification permission after authenticated shell is ready (not during OAuth). Soft-deny: inbox still works; show gentle enable CTA in inbox/More.

5. **Unread indicator**  
   Derive from inbox query (unread count) rather than inventing a separate badge API unless server already exposes one.

## Risks / Trade-offs

- [Notifications still session-only] → Spec mobile against Bearer; pair PR in coach-wattz before apply completes.
- [No device API yet] → Mobile can acquire Expo token early but must no-op register until endpoint ships; feature-flag or graceful 404.
- [Push without deep-links] → Stub routes OK; avoid dead “opened app to home with no context” when `path` present.
- [Android vs iOS permission differences] → Use Expo Notifications abstractions; test both before Phase 2 exit.

## Migration Plan

1. coach-wattz: Bearer on notifications + device register + one send hook  
2. watts-mobile: inbox → registration → push handler stubs  
3. Verify on device against local then hosted instance  
4. Deep-link polish follows in `phase-3-deep-links`

## Open Questions

- Exact JSON shape for `POST /api/mobile/devices` (confirm in coach-wattz when implementing)
- Whether mark-read stays `PATCH /api/notifications/read` with `{ id }` / `{ all: true }`
- Project Expo push credentials (EAS) ownership and secrets location (not in git)
