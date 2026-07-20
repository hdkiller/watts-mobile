# 008 — Reviewer demo account & notes

**Area:** review · **Priority:** high · **Status:** open

**Depends on:** production athlete that can sign in via OAuth  
**Related:** [../../issues/056.md](../../issues/056.md) (day-one empty surfaces look broken)

## Goal

Apple reviewers can sign in and see a working companion, not an empty shell.

## Steps

1. [ ] Create a dedicated hosted athlete (or reuse a staging-like prod user) for App Review only.
2. [ ] Seed enough data: recommendation and/or planned workout, recent wellness, at least one chat-capable context, notifications optional.
3. [ ] Store credentials in team password manager — **not in git**. ASC “App Review Information” holds the username/password for Apple.
4. [ ] Draft App Review notes covering:
   - Instance: use default `https://coachwatts.com` (or state if instance picker must stay on hosted).
   - Sign-in: OAuth in system browser; return to app via `coachwatts://oauth/callback`.
   - HealthKit / camera / notifications: optional; deny and continue.
   - Account deletion: More → Settings → Delete account → web Danger Zone.
   - Not a medical device; wellness is training context.
5. [ ] Paste notes into ASC when submitting ([009](./009-submit-for-review.md)).

## Done when

- Credentials + notes ready; smoke-tested once with those credentials on TestFlight ([007](./007-testflight-smoke.md)).
