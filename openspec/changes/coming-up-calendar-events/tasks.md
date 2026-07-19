## 1. coach-wattz prerequisites

- [x] 1.1 Confirm Bearer scope for `GET /api/events` (`goal:read` vs dedicated scope) against `REST_OAUTH_SCOPES` / Official Mobile App
- [x] 1.2 Migrate `server/api/events/index.get.ts` (and any needed `[id].get`) from `getServerSession` to `requireAuth` with chosen scope
- [x] 1.3 Smoke Bearer list events; document scope in watts-mobile oauth-setup notes

## 2. Mobile data layer

- [x] 2.1 Add confirmed event-read scope to `COMPANION_SCOPES` if missing
- [x] 2.2 Add event types + mapper (title, date, optional type/priority, local days-until)
- [x] 2.3 Add TanStack Query hook for `GET /api/events` (upcoming filter client-side)
- [x] 2.4 Unit tests for countdown / past-event exclusion

## 3. Today + Upcoming UI

- [x] 3.1 Add next-event countdown on Today below decision CTAs (omit when none)
- [x] 3.2 Optional quiet next-event line in Coming up strip (planned rows remain primary)
- [x] 3.3 Add small Events section on Upcoming list when events exist
- [x] 3.4 Open web escape for event authoring/depth; no in-app create/edit

## 4. Docs and verify

- [x] 4.1 Update product-baseline Coming up note + open-questions #19 decision log
- [x] 4.2 Typecheck / lint touched files; manual smoke with an upcoming race event
