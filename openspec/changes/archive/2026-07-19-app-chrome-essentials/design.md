# Design — App Chrome Essentials

## Context

`app.json` already carries the full icon/splash/permission chrome; the `expo-notifications` plugin sets `color: "#e11d48"` (used as the Android small-icon accent), which predates the brand tokens. `app/_layout.tsx` re-exports Expo Router's default `ErrorBoundary`, giving crashes a framework-styled screen. More shows identity, nav rows, Open web, Sign out, and a caption-style instance line — no version, no legal links. `src/sentry.ts` initializes from env.

## Goals / Non-Goals

**Goals:**
- Every OS-rendered surface (notification accent, crash screen) reads as Coach Watts.
- Store-review must-haves reachable in-app: version/build, privacy policy, terms, support.

**Non-Goals:**
- No More-tab restructure (sections/icons — docs/issues/015.md stays separate; About rows append to the current layout and migrate when 015 lands).
- No in-app notification preference toggles (docs/issues/016.md) and no rate-app prompt.
- No new splash/icon artwork — assets are done; this only verifies them on device.
- No in-app legal text rendering — links open the web pages.

## Decisions

1. **Notification accent = brand green.** `#00DC82` matches `Colors.brand`; Android tints the monochrome small icon with it. Alternative (keep rose as an "alert" color) rejected — pushes are coach guidance, not alarms, and rose appears nowhere else in the brand.
2. **Custom `ErrorBoundary` export, not a wrapper component.** Expo Router picks up an exported `ErrorBoundary` from the root layout; exporting our own (rendering `ErrorFallback` with the error + `retry` prop) is the idiomatic hook and covers all routes. `ErrorFallback` uses existing tokens + shared `Button` ("Try again" calls `retry`), shows a short generic message (never the raw stack), and calls `Sentry.captureException` on mount guarded against double-reporting.
3. **Version from `expo-constants`.** `Constants.expoConfig.version` + native build number displayed as "v0.1.0 (12)" in a muted About row; no runtime update-check.
4. **Legal links against the marketing site, not the instance.** Privacy/terms describe the product, so default to the canonical coachwatts.com pages via constants in `src/features/account/paths.ts`; self-hosted instances still get correct product-level policies. Support = `mailto:` link or web support page — confirm with coach-wattz. Alternative (instance-relative paths) rejected: self-hosted instances won't host legal pages.

## Risks / Trade-offs

- [Legal URLs not live yet on coach-wattz] → gate rows behind non-empty constants so a missing page never ships a dead link; track in store checklist.
- [Custom ErrorBoundary hides useful dev detail] → in `__DEV__`, render the error message + stack below the branded chrome.

## Open Questions

- Canonical privacy/terms/support URLs on coachwatts.com (coach-wattz repo owns them).
