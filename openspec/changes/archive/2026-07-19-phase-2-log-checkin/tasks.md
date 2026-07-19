## 1. Backend readiness

- [x] 1.1 Confirm `POST /api/wellness` supports Bearer `health:write`
- [x] 1.2 Switch `POST /api/checkin/answer` to `requireAuth` + `health:write`

## 2. Log data layer

- [x] 2.1 Add `src/features/log` types + wellness payload mapper
- [x] 2.2 Add fetch today’s wellness + save mutation helpers
- [x] 2.3 Wire TanStack Query/mutation on Log tab

## 3. Log UI

- [x] 3.1 Replace Log placeholder with form fields + Save
- [x] 3.2 Prefill from today’s wellness when present
- [x] 3.3 Success / error states; link back to Today

## 4. Verify

- [x] 4.1 Typecheck + unit tests still pass
- [x] 4.2 Update `docs/implementation-plan.md` Phase 2 checkboxes
