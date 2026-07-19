## 1. Scopes and API

- [x] 1.1 Confirm Official Mobile App allowlist includes `profile:write` in coach-wattz
- [x] 1.2 Add `profile:write` (and keep alignment with v1.5 nutrition scopes when those land) to `src/auth/scopes.ts`
- [x] 1.3 Add `src/features/profile` types, GET/PATCH helpers, form mappers
- [x] 1.4 Wire TanStack Query for profile load + save mutation

## 2. Athlete UI

- [x] 2.1 More → Athlete entry
- [x] 2.2 Athlete form: weight, FTP, max HR, LTHR with loading/error/save states
- [x] 2.3 Open web escape for full Profile Settings
- [x] 2.4 Refresh More/profile display after successful save

## 3. Verify

- [x] 3.1 Typecheck + unit tests for profile mappers
- [ ] 3.2 Manual smoke: load metrics, save FTP/weight against local IdP
  - Sign in against local coach-wattz (`http://localhost:3099`) so the token includes `profile:write` (re-login if scopes were expanded after an older session)
  - More → Athlete: confirm weight, FTP, max HR, LTHR load
  - Change FTP and/or weight; Save metrics → success toast/copy; reopen screen and confirm values stuck
  - Open web Profile Settings → lands on `/profile/settings`
  - Force a bad value / offline briefly → error retained with form values
- [x] 3.3 Update implementation-plan checklist when shipped
