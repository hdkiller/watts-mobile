## 1. coach-wattz Bearer mutations

- [x] 1.1 Audit activity-recommendation accept / rest-skip / dismiss paths used by web Today
- [x] 1.2 Switch accept handler to `requireAuth` (Bearer + scopes); session still works
- [x] 1.3 Verify planned-workout detail works with Bearer `workout:read` (list already did)

## 2. Today data layer (watts-mobile)

- [x] 2.1 Add `src/features/today` types + `mapTodayPayload`
- [x] 2.2 Add TanStack Query hook for `GET /api/recommendations/today`
- [x] 2.3 Add accept mutation helper against Bearer-capable endpoint

## 3. Today UI

- [x] 3.1 Replace Today placeholder with hero, planned block, recovery strip, CTAs
- [x] 3.2 Add loading skeleton, empty, and error states + pull-to-refresh
- [x] 3.3 Add planned workout detail stack screen
- [x] 3.4 Wire Accept CTA; disable when not applicable; refresh after success

## 4. Verify

- [x] 4.1 Typecheck watts-mobile
- [x] 4.2 Bearer smoke: local `GET /api/recommendations/today` → 204 empty (handled in client); simulator consent still manual
- [x] 4.3 Update `docs/implementation-plan.md` Phase 1 checkboxes + note coach-wattz Bearer fix
