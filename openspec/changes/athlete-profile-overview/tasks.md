## 1. coach-wattz Bearer enablement (dependency)

- [x] 1.1 Migrate `GET /api/reports` and `GET /api/reports/[id]` to `requireAuth` + documented read scope (prefer `report:read`)
- [x] 1.2 Migrate `POST /api/profile/generate` to `requireAuth` + documented write scope; preserve quota 429 behavior
- [x] 1.3 Allow the new scope(s) on the mobile public OAuth client; document in `docs/oauth-setup.md` / open-questions

## 2. Mobile profile identity + HR overview (Phase A)

- [x] 2.1 Extend profile types/mappers for name, country, dob/age, resting HR (from profile and/or dashboard)
- [x] 2.2 Build identity header + Max HR / Resting HR / LTHR readouts on Athlete screen
- [x] 2.3 Open web → `{instance}/profile/athlete` (keep settings escape for full Profile Settings)
- [x] 2.4 Update More entry label/subtitle to Athlete profile (not metrics-only)

## 3. AI report read (Phase B)

- [x] 3.1 Add `report:read` (or agreed scope) to `COMPANION_SCOPES`
- [x] 3.2 Fetcher + types for latest `ATHLETE_PROFILE` report (`analysisJson` executive summary + scores)
- [x] 3.3 Render summary + score chips; empty / 403 / unavailable states with Open web fallback
- [x] 3.4 Unit tests for report → UI model mapping

## 4. Sync regenerate (Phase C)

- [x] 4.1 Sync control calling `POST /api/profile/generate` when Bearer-ready; hide/replace when not
- [x] 4.2 Poll latest report until COMPLETED/FAILED/timeout; generating UI
- [x] 4.3 Handle 429 quota with honest message + Open web
- [x] 4.4 Refresh overview content after successful generation

## 5. Docs and verification

- [x] 5.1 Record backend dependency + scope decisions in `docs/open-questions.md`
- [x] 5.2 Manual QA: identity/HR without report, completed report, Sync happy path, 429, missing scope re-auth, Open web, metrics edit still works
- [x] 5.3 Confirm Training Load / Wellness modules are not duplicated on Athlete (stay on Today changes)
