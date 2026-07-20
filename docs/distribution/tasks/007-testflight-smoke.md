# 007 — TestFlight smoke

**Area:** qa · **Priority:** high · **Status:** open

**Depends on:** [006](./006-ios-production-build.md)

## Goal

Prove the release binary is reviewable: auth works against production, core tabs work, store-required paths exist, no debug login plumbing.

## Smoke script

On a physical device or recent simulator with the TestFlight build:

1. [ ] Cold start → branded splash + sign-in (no OAuth redirect URI / `pnpm cw:cli` in release UI).
2. [ ] Sign in against hosted instance (`https://coachwatts.com`) via PKCE.
3. [ ] Today: recommendation and/or planned hero loads (use seeded account — see [008](./008-reviewer-demo-account.md)).
4. [ ] Log: open check-in path; deny HealthKit still usable.
5. [ ] Coach: open chat; optional deny camera still usable.
6. [ ] More → About: version/build, privacy, terms, support.
7. [ ] Settings → Delete account / Export my data open web Danger Zone (handoff or browser).
8. [ ] Airplane mode: friendly offline copy (no raw `Network request failed` as the only UX).
9. [ ] Optional: push permission prompt copy is coaching-related; deep link `/go/*` if AASA is live.

## Done when

- Failures logged as issues or fixed; no known store-blocker on the binary you will submit.
