## Why

Open web escape hatches open the instance URL in a browser with no auth handoff. The companion holds OAuth Bearer tokens; the web app needs a cookie session — so athletes often hit a second login. That breaks the “field → web for depth” loop we rely on for plan architect, explorer, settings, and other non-goals.

## What Changes

- Add a coach-wattz **one-time app→web handoff**: Bearer-authenticated mint of a short-lived code, plus a browser consume URL that creates a web session cookie and redirects.
- Mobile **Open web** (instance destinations) goes through that handoff before opening the browser; external legal/support links stay unchanged.
- On handoff failure, fall back to opening the bare URL (honest degradation) rather than blocking the escape hatch.
- Document the contract in open questions / oauth docs; no change to PKCE login itself.

## Capabilities

### New Capabilities
- `app-web-session-handoff`: Mint + consume one-time codes that bridge companion Bearer auth into a Coach Watts web cookie session for Open web destinations.

### Modified Capabilities
- `app-shell`: Open web from More MUST use session handoff when available (not a bare instance URL alone).
- `account-more`: Account Open web action uses the shared handoff helper.

## Impact

- **coach-wattz (required):** New API + consume route; creates Auth.js/`Session` rows and sets `next-auth.session-token` (or `__Secure-…` on HTTPS). Uses existing `requireAuth` / Bearer validation. Likely `VerificationToken` (or small table) for single-use codes.
- **watts-mobile:** Shared `openInstanceWeb(path?)` helper; wire More, Today empty, activity/planned detail, nutrition, calendar/events, athlete settings Open web CTAs. No new native modules.
- **Security:** Code TTL ~60s, single-use, same-origin `returnTo` only; never put access tokens in the URL.
- **Self-hosted:** Works per instance URL already configured in the app.
