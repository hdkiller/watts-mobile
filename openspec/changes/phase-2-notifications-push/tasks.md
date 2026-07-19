## 1. Backend readiness (coach-wattz)

- [ ] 1.1 Switch `GET /api/notifications` and `PATCH /api/notifications/read` to `requireAuth` (Bearer)
- [ ] 1.2 Implement `POST /api/mobile/devices` (Expo token upsert) and document body shape
- [ ] 1.3 Add at least one push send hook for an initial event type (e.g. `RECOMMENDATION_READY`)

## 2. Notifications data + inbox UI

- [ ] 2.1 Add `src/features/notifications` types, list fetch, mark-read helpers
- [ ] 2.2 Wire TanStack Query on Notifications screen (More stack)
- [ ] 2.3 Build list UI with empty / loading / error + mark one / mark all

## 3. Push registration

- [ ] 3.1 Add Expo Notifications permission + token acquisition after auth
- [ ] 3.2 Register token via device endpoint; graceful handling if 404
- [ ] 3.3 Clear local registration state on sign-out; unregister if API exists

## 4. Push handling stubs

- [ ] 4.1 Handle notification response opens with `path` or type→default route
- [ ] 4.2 Recognize initial event types; navigate to Today/Coach/inbox stubs
- [ ] 4.3 Define foreground presentation behavior without navigation crashes

## 5. Verify

- [ ] 5.1 Typecheck + unit tests for mappers/resolvers
- [ ] 5.2 Manual device smoke: inbox + register + one push open
- [ ] 5.3 Update `docs/implementation-plan.md` Phase 2 checkboxes
