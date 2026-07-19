# API findings — phase-4-athlete-profile-edit

Checked in coach-wattz (`~/Develop/coach-wattz`) on 2026-07-19.

## Endpoints

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| `GET` | `/api/profile` | Bearer `profile:read` | Returns `{ connected, profile }` with `weight` (kg), `weightUnits`, effective FTP/HR from default sport settings |
| `PATCH` | `/api/profile` | Bearer `profile:write` | Body may include `weight`, `weightUnits`, `ftp`, `maxHr`, `lthr`; returns `{ success, profile }` |

Weight: DB stores kg. When `weightUnits` is `Pounds`, PATCH treats `weight` as display pounds and converts server-side (`LBS_TO_KG = 0.45359237`).

## Official Mobile App allowlist

- There is **no separate per-app scope allowlist** beyond `REST_OAUTH_SCOPES` in `server/utils/oauth/scopes.ts`.
- `profile:write` is already listed in `REST_OAUTH_SCOPES` (alongside `nutrition:read` / `nutrition:write`).
- Official Mobile App (`isOfficial` + public PKCE client) may request any valid REST scope; authorize validates via `validateRestOAuthScopes`.
- Mobile companion must include `profile:write` in the authorize request (`COMPANION_SCOPES`) so tokens minted after re-login carry write access.

## Web escape

Full Profile Settings: `/profile/settings` on the instance origin.
