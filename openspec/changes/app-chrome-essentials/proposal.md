# App Chrome Essentials

## Why

The brand chrome baseline (icon, adaptive icons, splash, permission strings) is already configured in `app.json`, but an audit against standard mobile-app expectations found gaps that make store builds look unfinished: the Android notification accent is off-brand (`#e11d48` rose instead of Coach Watts green), a runtime crash falls through to Expo Router's default error screen, and the app exposes no version/build, privacy policy, or support links — the last two being store-review expectations.

## What Changes

- Android notification icon accent color changes from `#e11d48` to brand green (`#00DC82`) in `app.json`.
- Branded root error fallback: a Coach Watts-styled crash screen (dark surface, wordmark, friendly copy, "Try again" reload action) replacing the re-exported default Expo Router `ErrorBoundary`; errors still report to Sentry.
- More tab gains an About section: app version + build number (from `expo-constants`), Privacy policy and Terms links (opening the instance/marketing URLs in the browser), and a Support contact action.
- Device-verify pass for existing splash/icon assets (open checklist item in `docs/store-checklist.md`): cold-start on iOS and Android confirming brand splash and home-screen icon.

Privacy/terms URLs come from coach-wattz marketing pages — confirm canonical paths (e.g. `/privacy`, `/terms`) with the backend repo.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `store-ready`: brand chrome requirement extends to the notification accent color and a device-verified launch pass.
- `app-shell`: root shell SHALL render a branded error fallback with recovery action instead of the framework default.
- `account-more`: More SHALL surface app version/build and legal/support links.

## Impact

- `app.json` — notification plugin `color`.
- New `src/components/ErrorFallback.tsx` + export wiring in `app/_layout.tsx`.
- `app/(app)/(tabs)/more.tsx` — About rows (version via `expo-constants`, legal links via `expo-web-browser`).
- `docs/store-checklist.md` — check off device-verify once done; record legal URL decisions.
- No new dependencies (`expo-constants`, `expo-web-browser` already installed).
