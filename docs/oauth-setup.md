# OAuth setup for the companion app

The mobile app is a **public** native client: Authorization Code + PKCE (S256), **no client secret** in the binary.

## Register the client (coach-wattz)

Prefer the dedicated CLI (public + trusted + multi-redirect, supports `--prod`):

```bash
cd ~/Develop/coach-wattz

# Local / development DB
pnpm cw:cli oauth create-mobile-app --owner-email hdkiller@gmail.com

# Production DB (requires explicit confirmation)
pnpm cw:cli oauth create-mobile-app --owner-email hdkiller@gmail.com --prod --confirm-prod
```

Flags set by the command:

| Field | Value |
|-------|--------|
| name | `Official Mobile App` |
| isPublicClient | `true` |
| isTrusted | `true` |
| registrationType | `manual` |

Re-run with `--force` to update redirect URIs or flags if the app already exists.

### Registered client IDs (official companion)

| Environment | Client ID |
|-------------|-----------|
| Production (`https://coachwatts.com`) | `1c2dbf4d-51b8-4902-85e6-e4f2f48c70d9` |
| Local / development DB (`http://localhost:3099`) | `cc24aade-5a1a-42ec-af2c-7fe60923e3c2` |

The client id must match the **instance** you authenticate against (prod vs local). Workspace `.env` defaults to local; both pairs are documented there.

### Redirect URIs to allow

Add every URI you will use in development and production:

| Runtime | Typical redirect |
|---------|------------------|
| Dev build / standalone | `coachwatts://oauth/callback` |
| Expo Go | Printed on the Sign in screen (`AuthSession.makeRedirectUri`) — often `exp://…/--/oauth/callback` |

The Sign in screen always shows the **current** redirect URI for the running binary.

`coachwatts://oauth/callback` is registered by default. After the first Expo Go session, add the printed URI:

```bash
pnpm cw:cli oauth create-mobile-app \
  --owner-email hdkiller@gmail.com \
  --force \
  --redirect-uri 'exp://YOUR-HOST:PORT/--/oauth/callback'
# add --prod --confirm-prod when updating production
```

## Env

Local workspace default (`.env` / `.env.example`):

```bash
EXPO_PUBLIC_DEFAULT_INSTANCE_URL=http://localhost:3099
EXPO_PUBLIC_OAUTH_CLIENT_ID=cc24aade-5a1a-42ec-af2c-7fe60923e3c2
```

Production (live site is `https://coachwatts.com`, not `app.coachwatts.com`):

```bash
EXPO_PUBLIC_DEFAULT_INSTANCE_URL=https://coachwatts.com
EXPO_PUBLIC_OAUTH_CLIENT_ID=1c2dbf4d-51b8-4902-85e6-e4f2f48c70d9
```

Release builds fall back to production via `app.json` `extra` when env vars are unset.

Note: iOS Simulator can reach `localhost`; physical devices need your machine’s LAN IP.

## Scopes requested (Phase 0/1)

```
profile:read
workout:read
health:read
health:write
recommendation:read
plan:read
chat:read
chat:write
offline_access
```

These match Coach Watts **REST** OAuth scope names (`recommendation:read`, `plan:read` — not the MCP `recommendations:*` / `planning:*` names).

## Verify

1. `pnpm start` → open simulator
2. Confirm instance URL → Continue
3. Sign in with Coach Watts → consent → return to app
4. More tab shows name/email from `/api/oauth/userinfo`
5. Sign out clears tokens; instance URL remains
