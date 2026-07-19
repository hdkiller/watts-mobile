# Tasks — App Chrome Essentials

## 1. Notification accent

- [ ] 1.1 Change `expo-notifications` plugin `color` in `app.json` from `#e11d48` to `#00DC82`
- [ ] 1.2 Rebuild dev client (config-plugin change; see `docs/native-modules.md`) and verify accent on an Android push

## 2. Branded error fallback

- [ ] 2.1 Build `src/components/ErrorFallback.tsx` (dark surface, wordmark/title, friendly copy, shared `Button` "Try again" wired to `retry`; dev-only error detail block)
- [ ] 2.2 Replace the `ErrorBoundary` re-export in `app/_layout.tsx` with a custom export rendering `ErrorFallback`; capture to Sentry once per error
- [ ] 2.3 Verify by throwing from a test route in dev and confirming branded fallback + retry

## 3. About and legal on More

- [ ] 3.1 Add version/build row to More using `expo-constants` ("v{version} ({build})")
- [ ] 3.2 Add privacy/terms/support URL constants to `src/features/account/paths.ts` (confirm canonical coachwatts.com paths with coach-wattz; leave empty until live)
- [ ] 3.3 Render Privacy policy / Terms / Support rows on More only when their URL constants are non-empty; open via `expo-web-browser` (mailto via `Linking` for support)

## 4. Device verification and bookkeeping

- [ ] 4.1 Cold-start iOS and Android dev-client/release builds; confirm brand splash and home-screen icon
- [ ] 4.2 Update `docs/store-checklist.md`: check device-verify item, record notification color fix and legal URL decisions
- [ ] 4.3 `npx tsc --noEmit` and `npm test` pass
