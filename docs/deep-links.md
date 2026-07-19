# Deep links (scheme + universal links)

Custom scheme `coachwatts` is already used for OAuth (`coachwatts://oauth/callback`). Product deep links share the same scheme and a single resolver used by Expo Router (`app/+native-intent.ts`) and push handling (`resolvePushNavigation`).

## Path map (canonical)

Paths are path-only. Scheme form: `coachwatts://today`. HTTPS form: `https://coachwatts.com/go/today` (prefix `/go` avoids colliding with Nuxt web routes).

| External path | Expo Router | Notes |
|---------------|-------------|--------|
| `/today` | `/(app)/(tabs)/today` | Today tab |
| `/today/recommendation` | `/(app)/(tabs)/today` | Recommendation context on Today |
| `/recommendations/:id` | `/(app)/(tabs)/today` | Alias until a dedicated detail route exists |
| `/planned/:id` | `/(app)/planned/:id` | Planned workout detail |
| `/activities` | `/(app)/activity` | Recent activity list |
| `/activities/:id` | `/(app)/activity/:id` | Activity summary |
| `/upcoming` | `/(app)/upcoming` | Upcoming planned list |
| `/coach` | `/(app)/(tabs)/coach` | Coach tab |
| `/chat` / `/chat/:roomId` | `/(app)/(tabs)/coach` | Alias; multi-room later |
| `/notifications` | `/(app)/notifications` | Inbox (stub until Phase 2 push) |
| `/log` | `/(app)/(tabs)/log` | Optional convenience |
| `/oauth/callback` | — | Handled by expo-auth-session; **not** rewritten |

Source of truth in code: [`src/linking/pathMap.ts`](../src/linking/pathMap.ts), resolver [`src/linking/resolveDeepLink.ts`](../src/linking/resolveDeepLink.ts).

## Push payload alignment

Prefer `data.path` matching the table above. Optional `data.url` is accepted. If neither is set, `data.type` falls back to:

| `data.type` | Default path |
|-------------|--------------|
| `RECOMMENDATION_READY` | `/today` |
| `WORKOUT_ANALYSIS_READY` | `/activities` |
| `SYNC_COMPLETED` | `/today` |
| `COACH_MESSAGE` | `/coach` |

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
| App ID | `<Apple Team ID>.com.coachwatts.mobile` |

Example body:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.coachwatts.mobile",
        "paths": ["/go", "/go/*"]
      }
    ]
  }
}
```

Replace `TEAMID` with the Apple Developer Team ID used for App Store / provisioning.

### Android Digital Asset Links

| Item | Value |
|------|--------|
| URL | `https://coachwatts.com/.well-known/assetlinks.json` |
| Package | `com.coachwatts.mobile` |
| Fingerprints | SHA-256 of **upload** and **App Signing** certs (Play Console → App signing) |

Example body:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.coachwatts.mobile",
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
