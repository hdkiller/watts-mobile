## 1. Scopes and API

- [x] 1.1 Confirm Official Mobile App allowlist includes `nutrition:read` / `nutrition:write` in coach-wattz
- [x] 1.2 Confirm Bearer path for today’s nutrition GET + item POST; Bearer-enable hydration quick-add if needed
- [x] 1.3 Add nutrition scopes to `src/auth/scopes.ts` (aligned with v1.5 profile:write set)
- [x] 1.4 Add `src/features/nutrition` types, today fetch, item log, hydration helper, mappers
- [x] 1.5 Wire TanStack Query for today nutrition + mutations

## 2. Log nutrition UI

- [x] 2.1 Log tab nutrition section (or stack): today’s totals glance
- [x] 2.2 Quick-log meal/macro form with empty/loading/error/success
- [x] 2.3 Hydration quick-add
- [x] 2.4 Open web escape for planning/grocery depth

## 3. Verify

- [x] 3.1 Typecheck + unit tests for nutrition mappers
- [x] 3.2 Manual smoke: log meal + water against local API
- [x] 3.3 Update implementation-plan checklist when shipped

### Manual smoke (3.2) — leave unchecked until device run

1. Sign in with scopes including `nutrition:read` / `nutrition:write` (re-consent if needed).
2. Ensure local coach-wattz includes Bearer hydration fix (`fix/nutrition-hydration-bearer-oauth` or merged).
3. Open **Log** → Nutrition: empty/zero day or today’s totals load.
4. Log a meal (meal chip + calories/macros) → totals refresh; error path shows retryable message if API down.
5. Tap hydration chip (+250 / +500 / +750) → water total updates.
6. **Open web for planning** opens instance `/nutrition`.
