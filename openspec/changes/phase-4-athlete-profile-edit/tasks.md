## 1. Scopes and API

- [ ] 1.1 Confirm Official Mobile App allowlist includes `profile:write` in coach-wattz
- [ ] 1.2 Add `profile:write` (and keep alignment with v1.5 nutrition scopes when those land) to `src/auth/scopes.ts`
- [ ] 1.3 Add `src/features/profile` types, GET/PATCH helpers, form mappers
- [ ] 1.4 Wire TanStack Query for profile load + save mutation

## 2. Athlete UI

- [ ] 2.1 More → Athlete entry
- [ ] 2.2 Athlete form: weight, FTP, max HR, LTHR with loading/error/save states
- [ ] 2.3 Open web escape for full Profile Settings
- [ ] 2.4 Refresh More/profile display after successful save

## 3. Verify

- [ ] 3.1 Typecheck + unit tests for profile mappers
- [ ] 3.2 Manual smoke: load metrics, save FTP/weight against local IdP
- [ ] 3.3 Update implementation-plan checklist when shipped
