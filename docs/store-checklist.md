# Store candidate checklist

Track chrome and metadata for TestFlight / Play internal tracks. Shipping workflow, **release-it versioning**, outstanding tasks, and progress history live under [distribution.md](./distribution.md) (**iOS = local Xcode Archive**, **Android = local Gradle AAB**, not EAS). Maestro footing + CI gate: [e2e.md](./e2e.md), [`.github/workflows/e2e-smoke.yml`](../.github/workflows/e2e-smoke.yml).

## Brand chrome

- [x] App display name: **Coach Watts** (`app.json` / `app.config.ts`)
- [x] Scheme: `coachwatts`
- [x] Icon + Android adaptive icons from Coach Watts web mark (`coach-wattz` `public/icon.png` → `assets/images/`)
- [x] Splash image + `#09090b` background (brand dark)
- [x] Android notification accent: `#00DC82` (brand green; was `#e11d48`) — **rebuild required** to pick up the `expo-notifications` plugin change (see [native-modules.md](./native-modules.md))
- [ ] **Device verify:** cold-start a dev-client or release build; confirm shield splash (not Expo placeholder) and home-screen icon on **iOS and Android**
- [ ] **Android push accent verify:** after rebuild, confirm notification small-icon tint is brand green
- [ ] **ASC screenshots (marketing):** upload iPhone set on version 0.1.1 after TestFlight — [distribution/tasks/004-listing-metadata-assets.md](./distribution/tasks/004-listing-metadata-assets.md)

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

Local `pnpm ios` / `pnpm android` set `SENTRY_DISABLE_AUTO_UPLOAD=true` so missing upload auth does not fail the native build. EAS `development` / `preview` profiles set the same flag (covers `eas build --local` and GitHub sideload APKs). Plugin config in `app.json` sets org `watt-mind` / project `coach-watts-app` (EU `de.sentry.io`). Production EAS builds that upload symbols also need `SENTRY_AUTH_TOKEN`.

`ios/` is gitignored; a stale prebuild keeps the Expo chevron even when `assets/images/` is branded.

## Privacy / health

- [x] Questionnaire strings in [store-privacy-checklist.md](./store-privacy-checklist.md)
- [x] Paste into App Store Connect (App Privacy published; see [distribution/tasks/003-privacy-and-compliance.md](./distribution/tasks/003-privacy-and-compliance.md))
- [ ] Paste into Play Console Data safety when submitting (→ [distribution/tasks/012-play-data-safety-and-content.md](./distribution/tasks/012-play-data-safety-and-content.md))

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

## Hosted subscriptions (planned)

OpenSpec: [`store-subscriptions-revenuecat`](../openspec/changes/store-subscriptions-revenuecat/proposal.md) · distribution [tasks 018–022](./distribution/tasks.md).

- [x] RevenueCat account created
- [~] RevenueCat project IDs + Apple catalog/`supporter`/`pro` mapping recorded ([018](./distribution/tasks/018-revenuecat-project.md)); ownership/plan/restore + Google/Stripe still open
- [ ] Apple Paid Apps Agreement + tax/banking active; Google merchant payments profile active
- [~] Apple Supporter/Pro monthly/annual products drafted + mapped in RevenueCat; Google products + ASC service levels / Paid Apps still open
- [ ] `coach-wattz` provider-neutral entitlement lifecycle + Stripe backfill + Bearer reconciliation ready
- [ ] Settings → Subscription & Billing shows canonical tier/provider and hosted-only purchase/restore/manage
- [ ] Localized price/period, auto-renew terms, Terms, Privacy, Restore, and provider management visible in review build
- [ ] Apple sandbox/TestFlight and Google Internal Testing lifecycle matrices complete
- [ ] Store privacy/data-safety declarations updated for purchase history / RevenueCat processing

The free store candidate is not blocked by this section. Keep production acquisition hidden until every subscription release gate passes.

## Deferred

- Maestro full companion suite in CI (smoke gate wired in [e2e.md](./e2e.md) / `e2e-smoke.yml`; expand when local suite is boring)
- Store listing screenshots owner (marketing vs eng) — tracked under [distribution/tasks/004](./distribution/tasks/004-listing-metadata-assets.md) + [013](./distribution/tasks/013-play-listing-assets.md); optional polish [023](./distribution/tasks/023-store-page-stellar-polish.md)
- Separate branded binaries per self-hosted customer
