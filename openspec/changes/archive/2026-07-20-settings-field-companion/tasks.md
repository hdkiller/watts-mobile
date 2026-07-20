## 1. coach-wattz prerequisites

- [x] 1.1 Migrate `GET /api/settings/ai` to `requireAuth` + `profile:read` (session-or-Bearer; preserve response shape)
- [x] 1.2 Migrate `POST /api/settings/ai` to `requireAuth` + `profile:write` (session-or-Bearer; preserve validation/enums)
- [x] 1.3 Smoke Bearer GET/POST AI settings with Official Mobile App token for lite fields (`aiPersona`, `aiRequireToolApproval`)

## 2. Settings hub IA

- [x] 2.1 Restructure `settings/index` into General / Coach / Account sections per design
- [x] 2.2 Keep Notifications, Health Sync, Instance under General; wire Athlete metrics link under Account
- [x] 2.3 Add Account rows: Export my data, Delete account, Open web Profile Settings (Open web helper / handoff when available)
- [x] 2.4 Confirm More → Settings entry; avoid duplicating new prefs as top-level More rows

## 3. Units & locale

- [x] 3.1 Extend profile types/mappers for `distanceUnits`, `temperatureUnits`, `timezone` (weight units already present)
- [x] 3.2 Add Units & locale screen + route; load via `GET /api/profile`
- [x] 3.3 Save via `PATCH /api/profile`; searchable timezone picker (device zone highlighted)
- [x] 3.4 Invalidate profile/activity/today/nutrition queries on successful save
- [x] 3.5 Unit tests for mapping enums and display formatters respecting saved units

## 4. Coach identity lite

- [x] 4.1 Add AI settings API helpers (`GET`/`POST /api/settings/ai`) behind Bearer availability check
- [x] 4.2 Add Coach identity screen: nickname, persona enum, About me (`aiContext`), require-tool-approval toggle
- [x] 4.3 Save nickname/`aiContext` via `PATCH /api/profile`; persona/tool-approval via AI settings POST
- [x] 4.4 Honest fallback (Open web / hide persona controls) when AI settings Bearer unavailable
- [x] 4.5 Do not expose model tier, automation, or TTS controls

## 5. Docs and verify

- [x] 5.1 Record Settings field-companion decision in `docs/open-questions.md` + product-baseline Settings bullet
- [x] 5.2 Update store-checklist for in-app Export / Delete account paths
- [x] 5.3 Typecheck / lint; manual smoke Units save → activity distance; Coach persona save → chat; Export/Delete open web
