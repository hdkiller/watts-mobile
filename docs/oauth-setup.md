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

## Scopes requested (Phase 0/1 + v1.5 field writes)

```
profile:read
profile:write
workout:read
workout:write
health:read
health:write
nutrition:read
nutrition:write
recommendation:read
plan:read
plan:write
goal:read
goal:write
availability:read
availability:write
performance:read
chat:read
chat:write
offline_access
```

These match Coach Watts **REST** OAuth scope names (`recommendation:read`, `plan:read` / `plan:write` — not the MCP `recommendations:*` / `planning:*` names).

`goal:read` authorizes Bearer `GET /api/events` (race/life calendar countdown on Today). `goal:write` is required for activation goal lite. Re-consent on next login after scopes are added.

`plan:write` authorizes Bearer plan initialize / activate for the mobile activation wizard. `availability:read` / `availability:write` persist training days for plan lite.

`performance:read` authorizes Bearer `GET /api/performance/pmc` (Today Training Load & Form). Existing sessions need re-login after this scope is added.

`workout:read` also covers Monthly Progress (`GET /api/stats/monthly-comparison`, `GET /api/workouts/sports`).

`profile:read` / `profile:write` cover Athlete Profile AI reports (`GET /api/reports?type=ATHLETE_PROFILE`) and Sync (`POST /api/profile/generate`). If More → Athlete shows a permissions / re-login prompt for AI reports, **sign out and sign in again** so the token picks up those scopes.

`profile:write`, `nutrition:read`, `nutrition:write`, and `workout:write` (completed-workout AI analyze/regenerate) are in `REST_OAUTH_SCOPES` (no separate Official Mobile App allowlist). Re-consent on next login if the IdP requires incremental consent.

### Chat media upload (Bearer)

`POST /api/storage/upload` accepts Bearer tokens with **`chat:write`** (same scope as sending messages). Multipart field name: `file`. Response: `{ success, url, filename }`.

Smoke (replace token/instance):

```bash
curl -sS -X POST "$INSTANCE/api/storage/upload" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "file=@./meal.jpg;type=image/jpeg"
```

### Tool approval submit path

There is no separate approval HTTP endpoint. Mobile posts to `POST /api/chat/messages` with `chat:write`:

```json
{
  "roomId": "<roomId>",
  "messages": [
    {
      "id": "<client-id>",
      "role": "tool",
      "parts": [
        {
          "type": "tool-approval-response",
          "toolCallId": "<approvalId>",
          "approvalId": "<approvalId>",
          "approved": true,
          "reason": "User confirmed action."
        }
      ]
    }
  ]
}
```

Pending approvals arrive on assistant messages as `metadata.pendingApprovals` (and/or `tool-*-approval-requested` parts).

Tool result parts on assistant messages use the same AI SDK shapes as web chat (Bearer WS upserts and `GET /api/chat/messages` poll):

| `state` | Mobile treatment |
|---------|------------------|
| `approval-requested` | Approve/deny controls |
| `output-available` / `result` / completed with output | Success card (curated nutrition/recovery/wellness copy, else generic) |
| `output-error` / `error` / `failed` | Failure card |
| `output-denied` / `denied` | Denied card |

Curated companion tools (coach-wattz): nutrition `log_nutrition_meal`, `log_hydration_intake`, `patch_nutrition_items`, `delete_nutrition_item`, `delete_hydration`; recovery `record_wellness_event`, `update_wellness_event`, `delete_wellness_event`; wellness `get_wellness_metrics`, `get_wellness_events`. No Bearer gaps found for these part shapes.

## Deep links vs OAuth callback

`coachwatts://oauth/callback` is reserved for PKCE and is **not** rewritten by the product deep-link resolver. All other `coachwatts://…` paths (and https `https://coachwatts.com/go/…` when hosted) use the shared map in [deep-links.md](./deep-links.md).

## App → web session handoff

Instance **Open web** CTAs use a one-time Bearer→cookie bridge so athletes land signed in on the web app:

| Step | Endpoint | Auth |
|------|----------|------|
| Mint | `POST /api/auth/app-web-handoff` body `{ returnTo?: "/path" }` | Bearer (any valid companion token) |
| Consume | `GET /api/auth/app-web-handoff/consume?code=&returnTo=` | Public; single-use code (TTL ≤60s) |

Mobile helper: `openInstanceWeb(instanceUrl, path)` in `src/features/account/openInstanceWeb.ts`. On mint failure it opens the bare instance URL. Privacy / terms / support links stay direct (no handoff).

`returnTo` must be a same-origin relative path (`/…`); schemes, `//`, and `..` are rejected server-side.

## Verify

1. `pnpm start` → open simulator
2. Confirm instance URL → Continue
3. Sign in with Coach Watts → consent → return to app
4. More tab shows name/email from `/api/oauth/userinfo`
5. Sign out clears tokens; instance URL remains
