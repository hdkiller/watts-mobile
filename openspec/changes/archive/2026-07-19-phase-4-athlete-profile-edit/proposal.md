## Why

Athletes need to adjust core training metrics (weight, FTP, HR thresholds) from the field without opening the full web Profile Settings. Product baseline now treats a focused athlete-metrics editor as explicit v1.5 scope after the store candidate.

## What Changes

- More → **Athlete** screen to view and edit weight, FTP, max HR, and LTHR
- Load via `GET /api/profile` (`profile:read`); save via `PATCH /api/profile` (`profile:write`)
- Add `profile:write` to companion OAuth scopes
- Unit display for weight when profile returns units; Open web for everything else (integrations, zones per sport, AI athlete profile, billing)
- Empty/loading/error + save success/failure states

## Capabilities

### New Capabilities

- `athlete-profile-edit`: More → Athlete metrics editor (weight, FTP, max HR, LTHR) with Bearer profile APIs

### Modified Capabilities

- `oauth-pkce`: Companion authorization MUST request `profile:write` in addition to existing scopes

## Impact

- **watts-mobile:** `src/auth/scopes.ts`; More → Athlete route; `src/features/profile/` (or similar)
- **coach-wattz:** `GET/PATCH /api/profile` already Bearer-scoped; confirm Official Mobile App allowlist includes `profile:write`
- **Out of scope:** Full Profile Settings tabs, sport-zone editors, AI profile generate, public athlete page, email prefs, integrations
