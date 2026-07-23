## 1. coach-wattz API

- [x] 1.1 Switch `POST /api/events` to `requireAuth` with write scope (`goal:write` preferred; confirm Official Mobile App allowlist)
- [x] 1.2 Add/adjust unit tests for Bearer create (and session client still works)
- [x] 1.3 Document scope in coach-wattz mobile companion / OAuth notes if needed

## 2. Docs

- [x] 2.1 Update product-baseline / open-questions / implementation-plan: event **create** in-app; edit/delete stay web
- [x] 2.2 Update `docs/gaps/goals-events-mobile-vs-web.md` for event create + Bearer note
- [x] 2.3 Mirror IA note in coach-wattz `docs/06-plans/mobile-companion-app.md`

## 3. Mobile create UI & API

- [x] 3.1 Add `createEvent` client helper + types aligned to POST body
- [x] 3.2 Add `/(app)/events/new` route + stack registration
- [x] 3.3 Build lite create form (title, date, type, priority, optional location/description/startTime)
- [x] 3.4 Wire mutation; invalidate upcoming-events queries; navigate to event detail on success
- [x] 3.5 Add Create / Add affordances on Events list + empty state (keep Manage on web)

## 4. Verification

- [x] 4.1 Unit tests for event create mapping / validation if added
- [ ] 4.2 Manual: create race/life event; appears in list/Today glance; Manage on web still works
