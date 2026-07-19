# Store candidate checklist

Track chrome and metadata for TestFlight / Play internal tracks. E2E automation is deferred.

## Brand chrome

- [x] App display name: **Coach Watts** (`app.json` / `app.config.ts`)
- [x] Scheme: `coachwatts`
- [x] Icon + Android adaptive icons from Coach Watts web mark (`coach-wattz` `public/icon.png` → `assets/images/`)
- [x] Splash image + `#09090b` background (brand dark)
- [ ] **Device verify:** cold-start a dev-client or release build; confirm shield splash (not Expo placeholder) and home-screen icon

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
# Source: ~/Develop/coach-wattz/public/icon.png → assets/images/* (see phase-3-store-polish)
```

## Privacy / health

- [x] Questionnaire strings in [store-privacy-checklist.md](./store-privacy-checklist.md)
- [ ] Paste into App Store Connect / Play Console when submitting

## Observability (Sentry)

- [x] Client init reads `EXPO_PUBLIC_SENTRY_DSN` (or `extra.sentryDsn`) — never commit real secrets
- [x] Release / dist / environment from env + EAS (`eas.json` profiles)
- [ ] Set EAS secret / env: `EXPO_PUBLIC_SENTRY_DSN` for preview/production builds
- [ ] Optional: `EXPO_PUBLIC_SENTRY_RELEASE`, `EXPO_PUBLIC_SENTRY_DIST`, `EXPO_PUBLIC_SENTRY_ENVIRONMENT`

See [.env.example](../.env.example).

## Account glue (More)

- [x] Instance URL visible
- [x] Notifications entry + system prefs / web
- [x] Open web + sign out
- [x] Recent activity + Upcoming preserved

## Deferred

- Maestro / Detox E2E
- Store listing screenshots owner (marketing vs eng — open question in design)
- Separate branded binaries per self-hosted customer
