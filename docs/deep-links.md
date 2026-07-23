# Deep links (scheme + universal links)

Custom scheme `coachwatts` is already used for OAuth (`coachwatts://oauth/callback`). Product deep links share the same scheme and a single resolver used by Expo Router (`app/+native-intent.ts`) and push handling (`resolvePushNavigation`).

## Path map (canonical)

Paths are path-only. Scheme form: `coachwatts://today`. HTTPS form: `https://coachwatts.com/go/today` (prefix `/go` avoids colliding with Nuxt web routes).

| External path | Expo Router | Notes |
|---------------|-------------|--------|
| `/today` | `/(app)/(tabs)/today` | Today tab |
| `/today/recommendation` | `/(app)/(tabs)/today` | Recommendation context on Today |
| `/recommendations/:id` | `/(app)/(tabs)/today` | Alias until a dedicated detail route exists |
| `/planned/:id` | `/(app)/planned/:id` | Planned workout detail (root stack — Back to opener) |
| `/activities` | `/(app)/activity` | Recent activity list (root stack) |
| `/activities/:id` | `/(app)/activity/:id` | Activity summary (root stack) |
| `/upcoming` | `/(app)/upcoming` | Upcoming planned list (root stack) |
| `/events` | `/(app)/events` | Upcoming race/life events list (root stack) |
| `/events/:id` | `/(app)/events/:id` | Lite read-only event detail (root stack) |
| `/coach` | `/(app)/(tabs)/coach` | Coach tab (session policy picks/creates room) |
| `/chat` | `/(app)/(tabs)/coach` | Alias for Coach tab |
| `/chat/:roomId` | `/(app)/(tabs)/coach?roomId=` | Opens that chat room when it exists |
| `/notifications` | `/(app)/(tabs)/more/notifications` | Inbox (More stack) |
| `/log` | `/(app)/(tabs)/log` | Optional convenience |
| `/more` | `/(app)/(tabs)/more` | More tab root |
| `/oauth/callback` | — | Handled by expo-auth-session; **not** rewritten |

Source of truth in code: [`src/linking/pathMap.ts`](../src/linking/pathMap.ts), resolver [`src/linking/resolveDeepLink.ts`](../src/linking/resolveDeepLink.ts).

## Push payload alignment

**Channel taxonomy (what to send, when, vs email/inbox):**  
`~/Develop/watts-marketing/knowledge/push/inventory.md`  
(Email twin: `~/Develop/watts-marketing/knowledge/email/inventory.md`.)

Prefer `data.path` matching the table above. Optional `data.url` is accepted. If neither is set, `data.type` falls back to:

| `data.type` | Default path |
|-------------|--------------|
| `RECOMMENDATION_READY` | `/today` |
| `WORKOUT_ANALYSIS_READY` | `/activities` |
| `SYNC_COMPLETED` | `/today` |
| `COACH_MESSAGE` | `/coach` |

Inbox `link` values must resolve through the same map (or dual-write a mobile-safe path). Web-only links such as `/` or `/workouts/:id` dead-end on mobile — see push inventory.

Example Expo push data:

```json
{
  "type": "WORKOUT_ANALYSIS_READY",
  "path": "/activities/clr123"
}
```

`phase-2-notifications-push` should call `resolvePushNavigation(data)` and `router.push(href)` — do not invent a second map.

## Auth return path

If a product link arrives while logged out, `+native-intent` stores the resolved href and login completes via `AuthenticatedEntry`, which consumes the pending path. OAuth callback never writes a return path.

## App config stubs (this repo)

Already in [`app.json`](../app.json):

- iOS `associatedDomains`: `applinks:coachwatts.com`
- Android `intentFilters`: https `coachwatts.com` + `pathPrefix` `/go` with `autoVerify: true`

Rebuild the native binary after changing these (dev client / EAS). Scheme-only links work without host association.

---

## coach-wattz / hosting requirements (tasks 3.1–3.2)

Universal Links / App Links will **not** open the app until these are live. Scheme + push still work.

### Apple App Site Association

| Item | Value |
|------|--------|
| URL | `https://coachwatts.com/.well-known/apple-app-site-association` (no file extension) |
| Content-Type | `application/json` |
| HTTPS | Required; no redirects on the AASA URL |
| App ID | `42K8S6866N.com.coachwatts.app` (Watt Mind Kft. Team ID) |

Example body:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "42K8S6866N.com.coachwatts.app",
        "paths": ["/go", "/go/*"]
      }
    ]
  }
}
```

### Android Digital Asset Links

| Item | Value |
|------|--------|
| URL | `https://coachwatts.com/.well-known/assetlinks.json` |
| Package | `com.coachwatts.app` |
| Fingerprints | SHA-256 of **upload** and **App Signing** certs (Play Console → App signing) |

Example body:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.coachwatts.app",
      "sha256_cert_fingerprints": ["AA:BB:…"]
    }
  }
]
```

### Path contract for https links

Publish athlete-facing https links under `/go/*` only, mirroring the canonical path map (`/go/today`, `/go/activities/:id`, …).

### Smoke (device) — blocked until hosts deploy

When AASA + assetlinks are live:

1. iOS: Notes/Safari open `https://coachwatts.com/go/today` → Coach Watts
2. Android: `adb shell am start -a android.intent.action.VIEW -d 'https://coachwatts.com/go/coach'`
3. Confirm logged-out → login → lands on linked screen

## Manual scheme smoke (task 4.1)

```bash
xcrun simctl openurl booted 'coachwatts://today'
xcrun simctl openurl booted 'coachwatts://notifications'
xcrun simctl openurl booted 'coachwatts://coach'
xcrun simctl openurl booted 'coachwatts://activities/<id>'
adb shell am start -a android.intent.action.VIEW -d 'coachwatts://today'
```

Also verify: cold start while logged out with `coachwatts://coach` → sign in → Coach tab.

Unit coverage: `pnpm test` (`src/linking/__tests__/resolveDeepLink.test.ts`).
