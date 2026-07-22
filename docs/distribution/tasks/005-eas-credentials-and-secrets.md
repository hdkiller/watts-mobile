# 005 — iOS signing & production env (local)

**Area:** build · **Priority:** high · **Status:** open

**Depends on:** [001](./001-apple-developer-account.md)

## Preference

**iOS store / TestFlight binaries are built on a Mac with Xcode** (local Archive → App Store Connect). Do **not** use EAS cloud (`eas build` / `eas submit`) for iOS unless explicitly chosen later as a fallback.

EAS project env may still hold shared secrets for optional CI/fallback profiles. That does **not** imply EAS is the iOS or Android store release path.

## Goal

Watt Mind Apple signing works in Xcode, and local production env is set without committing secrets or enabling e2e auth.

## Steps

1. [ ] On the release Mac: Xcode signed into an Apple ID on the Watt Mind team (`42K8S6866N`); Admin `hdkiller@gmail.com` is fine for day-to-day.
2. [ ] Confirm local `.env` (gitignored) for store builds has:
   - `EXPO_PUBLIC_SENTRY_DSN` (same project: Sentry org `watt-mind` / `coach-watts-app`)
   - Hosted OAuth fallbacks already in `app.json` `extra` (`https://coachwatts.com` + production client id) — or set explicit `EXPO_PUBLIC_*` if preferred
   - **No** `EXPO_PUBLIC_E2E_AUTH` or fixture tokens ([../../e2e.md](../../e2e.md))
3. [ ] Optional Sentry symbol upload for Release archives: `SENTRY_AUTH_TOKEN` in the shell / Xcode scheme env (not git). Local `pnpm ios` already sets `SENTRY_DISABLE_AUTO_UPLOAD=true`; turn upload on only for intentional store archives if desired.
4. [x] EAS project env `EXPO_PUBLIC_SENTRY_DSN` already set on development/preview/production (optional CI/fallback only). Local iOS/Android store builds need `.env` correct at prebuild time.
5. [ ] Document secret *names* (not values) in [log.md](../log.md) when the local release env is confirmed.

## Profiles (`eas.json`) — optional / Android-oriented

| Profile | Use |
|---------|-----|
| `development` | Dev client (optional EAS path) |
| `preview` | Optional GitHub sideload APK helper (`pnpm release:android:github -- --local`) |
| `production` | Not the default store path — iOS [006](./006-ios-production-build.md), Android [015](./015-android-production-build.md) |
| `e2e` | Fixture auth only — never store / TestFlight |

User-facing version bumps: `pnpm release:patch` (release-it). See [../../distribution.md](../../distribution.md)#version-releases-release-it.

## Done when

- Xcode can sign `com.coachwatts.app` (+ widget) for Watt Mind; local production env has Sentry DSN and no e2e flags.
