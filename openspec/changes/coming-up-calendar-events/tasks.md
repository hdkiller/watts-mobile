## 1. coach-wattz prerequisites

- [ ] 1.1 Confirm Bearer scope for `GET /api/events` (`goal:read` vs dedicated scope) against `REST_OAUTH_SCOPES` / Official Mobile App
- [ ] 1.2 Migrate `server/api/events/index.get.ts` (and any needed `[id].get`) from `getServerSession` to `requireAuth` with chosen scope
- [ ] 1.3 Smoke Bearer list events; document scope in watts-mobile oauth-setup notes

## 2. Mobile data layer

- [ ] 2.1 Add confirmed event-read scope to `COMPANION_SCOPES` if missing
- [ ] 2.2 Add event types + mapper (title, date, optional type/priority, local days-until)
- [ ] 2.3 Add TanStack Query hook for `GET /api/events` (upcoming filter client-side)
- [ ] 2.4 Unit tests for countdown / past-event exclusion

## 3. Today + Upcoming UI

- [ ] 3.1 Add next-event countdown on Today below decision CTAs (omit when none)
- [ ] 3.2 Optional quiet next-event line in Coming up strip (planned rows remain primary)
- [ ] 3.3 Add small Events section on Upcoming list when events exist
- [ ] 3.4 Open web escape for event authoring/depth; no in-app create/edit

## 4. Docs and verify

- [ ] 4.1 Update product-baseline Coming up note + open-questions #19 decision log
- [ ] 4.2 Typecheck / lint touched files; manual smoke with an upcoming race event
