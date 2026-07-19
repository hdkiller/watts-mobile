## Why

Athletes already hit Settings for push prefs, Health Sync, and instance — but units, coach identity, and store-facing account actions still require a web round-trip. Those few prefs change how the companion *reads and talks* every day; the rest of web Profile/Settings stays control-room and should not be ported.

## What Changes

- Formalize the **Settings hub** (More → Settings) as the home for field-companion preferences: Notifications, Health Sync, Instance (already in code), plus new Units & locale and Coach identity lite.
- Add **Units & locale**: distance (km/mi), weight (kg/lbs), temperature (°C/°F), timezone — load/save via existing `GET`/`PATCH /api/profile`.
- Add **Coach identity lite**: nickname, persona, short About me (`aiContext`), and require-tool-approval toggle — nickname/context via profile; persona/tool-approval via AI settings after Bearer migration.
- Add **Account** rows for Export my data and Delete account as **Open web** destinations (session handoff when available), not native destructive flows.
- Keep push prefs **separate** from web email Communication prefs (same athlete-facing labels where sensible; no unified email+push API in this change).
- Document the decision in `docs/open-questions.md` (metrics-only already decided; this extends Settings scope without reversing “no full Profile Settings”).

## Capabilities

### New Capabilities

- `settings-hub`: Settings stack IA — General / Coach / Account sections; entry from More; nesting of existing Notifications, Health Sync, Instance.
- `units-locale`: Edit distance, weight, temperature units and timezone on device.
- `coach-identity-settings`: Lite AI coach prefs (nickname, persona, About me, tool-approval default).

### Modified Capabilities

- `account-more`: More SHALL route account preferences through Settings (Notifications prefs entry, Instance visibility may live under Settings); Athlete metrics and Open web remain available.
- `athlete-profile-edit`: Clarify Open web still covers full Profile Settings; units editing moves to Settings → Units & locale (metrics screen stays weight/FTP/HR only).
- `store-ready`: Account delete/export MUST be reachable in-app (via Settings → Open web destinations).

## Impact

- **watts-mobile:** Extend `app/(app)/settings/*`; profile mapping for units/timezone; coach settings feature module; invalidate Today/activity/nutrition queries on unit change; docs/baseline + open-questions.
- **coach-wattz (required):** Migrate `GET`/`POST /api/settings/ai` from cookie session to `requireAuth` + `profile:read` / `profile:write` (mobile writes only the lite subset). Units/timezone/nickname/`aiContext` already on Bearer `PATCH /api/profile`. Export already Bearer (`GET /api/profile/export`); account delete stays web-session — mobile deep-links, does not call `DELETE /api/profile` natively in this change.
- **Out of scope:** Full Profile Settings (sport zones, availability, measurements history, nutrition macros, public presence, communication/email prefs editing), Connected Apps, Billing, Developer/API keys, Danger Zone bulk wipes, AI automation/model/TTS, unifying push+email preference APIs.
