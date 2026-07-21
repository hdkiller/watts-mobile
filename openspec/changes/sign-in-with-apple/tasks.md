## 1. Apple Developer setup (Watt Mind team)

- [x] 1.1 Enable Sign in with Apple on App ID `com.coachwatts.app` (and related identifiers if required)
- [x] 1.2 Create Services ID for web Auth.js callback; register return URL(s) for hosted `https://coachwatts.com` (plus local/dev if used)
- [x] 1.3 Create Sign in with Apple key (`.p8`); record Key ID, Team ID, Services ID / client id in password manager — never commit the key
- [x] 1.4 Document secret names for coach-wattz deploy (e.g. `APPLE_ID` / `APPLE_TEAM_ID` / `APPLE_KEY_ID` / `APPLE_PRIVATE_KEY`) in ops notes or coach-wattz auth docs

## 2. coach-wattz Auth.js provider

- [x] 2.1 Add Apple provider to `server/api/auth/[...].ts` (Auth.js), gated on secrets present
- [x] 2.2 Confirm account create/link behavior for Apple `sub` + email (including Hide My Email / missing email on return visits) matches Google linking policy
- [ ] 2.3 Smoke Auth.js Apple callback on staging/hosted before enabling UI in production

## 3. IdP login UI

- [x] 3.1 Add Sign in with Apple control to `/oauth/login` with prominence comparable to Google (prefer Apple first)
- [x] 3.2 Add Sign in with Apple to web `/login` and `/join` (or equivalent) where Google is offered
- [ ] 3.3 Verify loading / error toasts match existing provider UX; Cancel still aborts OAuth

## 4. Mobile companion verification

- [ ] 4.1 Smoke TestFlight/dev-client: PKCE → Safari `/oauth/login` → Sign in with Apple → tokens → authenticated shell
- [ ] 4.2 Regression: same path with Google still works
- [x] 4.3 Confirm no watts-mobile PKCE client/scope/redirect changes are required; only fix if a real bug appears

## 5. App Review & distribution docs

- [x] 5.1 Update [docs/distribution/tasks/008-reviewer-demo-account.md](../../docs/distribution/tasks/008-reviewer-demo-account.md) for SIWA + Google demo options (no Coach Watts-native password)
- [x] 5.2 Refresh ASC App Review notes: system browser OAuth, Sign in with Apple available, demo credential instructions, `coachwatts://oauth/callback`
- [x] 5.3 Prepend dated entry to [docs/distribution/log.md](../../docs/distribution/log.md); note Guideline 4.8 mitigation
- [x] 5.4 Optionally update coach-wattz oauth-provider / authentication docs for Apple provider operators

## 6. Close-out

- [x] 6.1 Decide App Review demo account: **SIWA with reviewer Apple ID** (no dedicated Google demo); ASC placeholders + notes updated
- [x] 6.2 Mark related open questions (if any) in [docs/open-questions.md](../../docs/open-questions.md) as decided
