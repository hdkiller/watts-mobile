# Store candidate checklist

Track chrome and metadata for TestFlight / Play internal tracks. Shipping workflow, outstanding tasks, and progress history live under [distribution.md](./distribution.md). Local Maestro footing lives in [e2e.md](./e2e.md); CI wiring is still open.

## Brand chrome

- [x] App display name: **Coach Watts** (`app.json` / `app.config.ts`)
- [x] Scheme: `coachwatts`
- [x] Icon + Android adaptive icons from Coach Watts web mark (`coach-wattz` `public/icon.png` → `assets/images/`)
- [x] Splash image + `#09090b` background (brand dark)
- [x] Android notification accent: `#00DC82` (brand green; was `#e11d48`) — **rebuild required** to pick up the `expo-notifications` plugin change (see [native-modules.md](./native-modules.md))
- [ ] **Device verify:** cold-start a dev-client or release build; confirm shield splash (not Expo placeholder) and home-screen icon on **iOS and Android**
- [ ] **Android push accent verify:** after rebuild, confirm notification small-icon tint is brand green

### Asset notes

| File | Role |
|------|------|
| `assets/images/icon.png` | 1024×1024 iOS / general icon |
| `assets/images/splash-icon.png` | Splash mark on brand dark |
| `assets/images/android-icon-foreground.png` | Adaptive foreground (transparent) |
| `assets/images/android-icon-background.png` | Adaptive background `#09090b` |
| `assets/images/android-icon-monochrome.png` | Android 13+ monochrome |
| `assets/images/favicon.png` | Web favicon |

Regenerate from web mark if branding updates:

```bash
# Source: ~/Develop/coach-wattz/public/media/logo.png (same mark as consent /public/icon.png)
# After changing assets/images/icon.png or splash, re-run native prebuild — `pnpm ios`
# alone does NOT refresh AppIcon.appiconset in an existing ios/ folder:
npx expo prebuild --platform ios --clean
pnpm ios
```

Local `pnpm ios` / `pnpm android` set `SENTRY_DISABLE_AUTO_UPLOAD=true` so missing upload auth does not fail the native build. Plugin config in `app.json` sets org `watt-mind` / project `coach-watts-app` (EU `de.sentry.io`). EAS store builds that upload symbols also need `SENTRY_AUTH_TOKEN`.

`ios/` is gitignored; a stale prebuild keeps the Expo chevron even when `assets/images/` is branded.

## Privacy / health

- [x] Questionnaire strings in [store-privacy-checklist.md](./store-privacy-checklist.md)
- [ ] Paste into App Store Connect / Play Console when submitting

### In-app legal / support (More → About)

Canonical marketing URLs (not instance-relative), confirmed in coach-wattz:

| Link | Constant | Destination |
|------|----------|-------------|
| Privacy policy | `PRIVACY_POLICY_URL` | `https://coachwatts.com/privacy` |
| Terms | `TERMS_OF_SERVICE_URL` | `https://coachwatts.com/terms` |
| Support | `SUPPORT_URL` | `mailto:support@coachwatts.com` |

Rows are gated on non-empty constants in `src/features/account/paths.ts`.

## Observability (Sentry)

- [x] Client init reads `EXPO_PUBLIC_SENTRY_DSN` (or `extra.sentryDsn`) — never commit real secrets
- [x] Release / dist / environment from env + EAS (`eas.json` profiles)
- [x] Root `ErrorBoundary` reports via `Sentry.captureException` (branded `ErrorFallback`)
- [x] Set EAS env: `EXPO_PUBLIC_SENTRY_DSN` for development/preview/production (org `watt-mind`, project `coach-watts-app`)
- [ ] Optional: `EXPO_PUBLIC_SENTRY_RELEASE`, `EXPO_PUBLIC_SENTRY_DIST` (environment already set per profile in `eas.json`)

See [.env.example](../.env.example).

## Account glue (More)

- [x] Instance URL visible
- [x] Notifications entry + system prefs / web
- [x] Open web + sign out
- [x] Recent activity + Upcoming preserved
- [x] About: version/build + privacy / terms / support (when URLs configured)
- [x] Settings → Export my data opens web Danger Zone
- [x] Settings → Delete account opens web Danger Zone (in-app path to account deletion)

## Deferred

- Maestro CI wiring (local footing in [e2e.md](./e2e.md))
- Store listing screenshots owner (marketing vs eng — open question in design)
- Separate branded binaries per self-hosted customer
