## 1. Backend readiness (coach-wattz)

- [x] 1.1 Switch `GET /api/notifications` and `PATCH /api/notifications/read` to `requireAuth` (Bearer)
- [x] 1.2 Implement `POST /api/mobile/devices` (Expo token upsert) and document body shape
- [x] 1.3 Add at least one push send hook for an initial event type (e.g. `RECOMMENDATION_READY`)

## 2. Notifications data + inbox UI

- [x] 2.1 Add `src/features/notifications` types, list fetch, mark-read helpers
- [x] 2.2 Wire TanStack Query on Notifications screen (More stack)
- [x] 2.3 Build list UI with empty / loading / error + mark one / mark all

## 3. Push registration

- [x] 3.1 Add Expo Notifications permission + token acquisition after auth
- [x] 3.2 Register token via device endpoint; graceful handling if 404
- [x] 3.3 Clear local registration state on sign-out; unregister if API exists

## 4. Push handling stubs

- [x] 4.1 Handle notification response opens with `path` or type→default route
- [x] 4.2 Recognize initial event types; navigate to Today/Coach/inbox stubs
- [x] 4.3 Define foreground presentation behavior without navigation crashes

## 5. Verify

- [x] 5.1 Typecheck + unit tests for mappers/resolvers
- [ ] 5.2 Manual device smoke: inbox + register + one push open
- [x] 5.3 Update `docs/implementation-plan.md` Phase 2 checkboxes

### Manual smoke steps (5.2 — leave unchecked until run on device)

1. Sign in against local coach-wattz (`http://localhost:3099`) with a token that includes `profile:read` + `profile:write` (re-login if scopes were expanded).
2. Open **More → Notifications** — list loads (empty or with rows); pull-to-refresh works.
3. Accept the OS notification permission prompt after login (not during OAuth).
4. Confirm `POST /api/mobile/devices` succeeds (server logs / DB `MobilePushDevice` row for your Expo token).
5. Trigger a `RECOMMENDATION_READY` push (or send a test Expo push with `data: { type: 'RECOMMENDATION_READY' }` / `path: '/today'`).
6. Tap the notification — app opens Today (or the path stub); foreground receipt shows a banner without crashing.
7. Sign out — local token cleared; `DELETE /api/mobile/devices` attempted.
