## 1. coach-wattz prerequisites

- [x] 1.1 Add REST OAuth scope `plan:write` to `REST_OAUTH_SCOPES` / Official Mobile App allowlist docs; document alongside `goal:write`
- [x] 1.2 Convert `POST /api/plans/initialize` and `POST /api/plans/:id/activate` from session-only to `requireAuth` + `plan:write`
- [x] 1.3 Spike availability write path for plan lite; add Bearer `availability:read`/`availability:write` if slots are persisted separately (or document initialize-only availability)
- [x] 1.4 Extend `onboarding-status` (shared types + resolver) with consent/goal/plan/insight flags and soft vs full activation (`softActivated`, `fullyActivated`, `connectLater` behavior preserved)
- [x] 1.5 Ensure insight/first-value can be marked from mobile after plan week reveal (extend complete/first-value API if needed)
- [x] 1.6 Align web conversion-plan docs so soft vs full activation matches mobile baseline

## 2. Mobile scopes + activation foundation

- [x] 2.1 Add `goal:write`, `plan:write`, and availability scopes (if used) to `COMPANION_SCOPES` / oauth-setup docs
- [x] 2.2 Create `src/features/activation/` module: types, `fetchOnboardingStatus`, soft/full helpers, analytics event names (no health values)
- [x] 2.3 Add `app/(activation)/` route group (no tabs) with stack layout
- [x] 2.4 Gate authenticated app shell: incomplete soft activation → activation wizard; soft-activated → tabs

## 3. Consent + auth entry

- [x] 3.1 Auth screen: Create account + Sign in both start PKCE; copy distinguishes new vs returning
- [x] 3.2 Native consent screen: terms/privacy/health; submit `POST /api/user/consent` with current policy versions
- [x] 3.3 Block wizard progress until consent succeeds; handle outdated policy version errors honestly

## 4. Goal lite

- [x] 4.1 Implement goals API client (`GET`/`POST`/`PATCH`) under `src/features/goals/`
- [x] 4.2 Activation goal step: type picker + minimal fields + create primary goal
- [x] 4.3 Optional AI suggest/accept when Bearer suggest API works; hide control when unavailable
- [x] 4.4 Ongoing lite edit entry from More → Athlete (or Goals row) with Open web for deep tools

## 5. Plan lite

- [x] 5.1 Implement plan lite API client (initialize, preview fetch, activate) under `src/features/plans/`
- [x] 5.2 Plan lite form: availability + volume + preferred activity types (curated set)
- [x] 5.3 Initialize progress/waiting UI; first-week preview from returned/refreshed plan
- [x] 5.4 Activate confirmation → activate API → advance to insight; provisional copy when no data
- [x] 5.5 Open web escape for adapt/replan/architect; degrade on older instances (401/404)

## 6. First insight + connect last

- [x] 6.1 First-insight screen: week/planned summary; optional Analyze Readiness with thin-biometric honesty; mark insight viewed
- [x] 6.2 Connect-last screen: Health Sync primary CTA, Connected Apps lite secondary, Skip/Later → soft-activated tabs
- [x] 6.3 Wire `connectLater` / Finish-setup persistence via server flags

## 7. Today Finish-setup + polish

- [x] 7.1 Soft-activated Today: Finish-setup card replaces stacked empty glances as primary incomplete surface
- [x] 7.2 Dismiss Finish-setup when fully activated; keep resume path to connect step
- [x] 7.3 Emit activation funnel analytics events; verify no metric values logged
- [x] 7.4 Unit tests for activation status helpers / goal+plan mappers where pure
- [x] 7.5 Update `docs/oauth-setup.md`, issue 056 status notes, and implementation-plan Phase 5 checkboxes as slices land
- [x] 7.6 Manual verify: empty fixture user soft-activates on device without web; Skip connect enters tabs; Health Sync path improves data → full activation
