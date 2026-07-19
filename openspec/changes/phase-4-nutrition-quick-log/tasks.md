## 1. Scopes and API

- [ ] 1.1 Confirm Official Mobile App allowlist includes `nutrition:read` / `nutrition:write` in coach-wattz
- [ ] 1.2 Confirm Bearer path for today’s nutrition GET + item POST; Bearer-enable hydration quick-add if needed
- [ ] 1.3 Add nutrition scopes to `src/auth/scopes.ts` (aligned with v1.5 profile:write set)
- [ ] 1.4 Add `src/features/nutrition` types, today fetch, item log, hydration helper, mappers
- [ ] 1.5 Wire TanStack Query for today nutrition + mutations

## 2. Log nutrition UI

- [ ] 2.1 Log tab nutrition section (or stack): today’s totals glance
- [ ] 2.2 Quick-log meal/macro form with empty/loading/error/success
- [ ] 2.3 Hydration quick-add
- [ ] 2.4 Open web escape for planning/grocery depth

## 3. Verify

- [ ] 3.1 Typecheck + unit tests for nutrition mappers
- [ ] 3.2 Manual smoke: log meal + water against local API
- [ ] 3.3 Update implementation-plan checklist when shipped
