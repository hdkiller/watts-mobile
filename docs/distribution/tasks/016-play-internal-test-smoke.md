# 016 — Play internal test smoke

**Area:** qa · **Priority:** medium · **Status:** open

**Depends on:** [015](./015-android-production-build.md)

## Goal

Prove the release AAB is reviewable on Android (same bar as TestFlight smoke).

## Smoke script

1. [ ] Install from Internal testing link; cold start → branded splash/icon.
2. [ ] Sign in via PKCE against `https://coachwatts.com` (Chrome Custom Tabs / system browser).
3. [ ] Today / Log / Coach / More core paths (seeded account — share demo with iOS [008](./008-reviewer-demo-account.md) or create Android-specific if needed).
4. [ ] Health Connect: deny still usable; grant path prefills sleep/weight only when implemented.
5. [ ] Camera/photos: deny still usable for text chat.
6. [ ] More → About: privacy / terms / support; Settings → Delete account / Export open web Danger Zone.
7. [ ] Offline: friendly copy, not raw network errors only.
8. [ ] Optional: `adb` deep link `https://coachwatts.com/go/…` once assetlinks fingerprints are live.

## Done when

- No known store-blocker on the AAB you will promote toward production.
