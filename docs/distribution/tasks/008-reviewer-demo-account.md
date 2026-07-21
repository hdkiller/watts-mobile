# 008 — Reviewer demo account & notes

**Area:** review · **Priority:** high · **Status:** in progress

**Depends on:** hosted **Sign in with Apple** enabled for Guideline 4.8 ([sign-in-with-apple](../../../openspec/changes/sign-in-with-apple/) / coach-wattz)  
**Related:** [../../issues/056.md](../../issues/056.md) (day-one empty surfaces look broken)

## Goal

Apple reviewers can sign in via **Sign in with Apple** (no dedicated Google demo account).

## Decision (2026-07-21)

- **No dedicated Google demo account** for App Review.
- Reviewers use **Sign in with Apple** with a **reviewer Apple ID** on `/oauth/login`.
- ASC Sign-In Information username/password are placeholders only (not Coach Watts credentials).

## How login works (no Coach Watts password)

1. Reviewer taps Sign in in the app  
2. System browser opens Coach Watts `/oauth/login`  
3. They choose **Sign in with Apple** (Google exists but is not used for review demo)  
4. Browser returns via `coachwatts://oauth/callback` (PKCE)

## Steps

1. [x] Decide review path: SIWA with reviewer Apple ID (no Google demo).
2. [ ] Confirm hosted IdP shows Sign in with Apple after Dokploy deploy + smoke.
3. [ ] Optionally soften empty first-run UX ([056](../../issues/056.md)) — new SIWA accounts start empty.
4. [x] App Review notes + Sign-In Information placeholders in ASC 0.1.1 (contact Laszlo Racz / `deploy@watt-mind.com` / `+36302858822`).
5. [ ] Smoke once on TestFlight: PKCE → Safari → SIWA → authenticated shell ([007](./007-testflight-smoke.md)).

### ASC notes template

```
Sign-in uses OAuth 2.0 + PKCE in the system browser (no in-app password form).
Default instance: https://coachwatts.com
IMPORTANT: Do not use the Sign-In Information username/password fields as Coach Watts credentials. Tap Sign in → Safari → Sign in with Apple using a reviewer Apple ID → return via coachwatts://oauth/callback.
Google is also offered but no demo Google account is provided.
HealthKit / camera / notifications are optional. Delete account: More → Settings.
Not a medical device / no diagnosis.
Guideline 4.8: Sign in with Apple is offered on the IdP login page alongside Google.
```

Sign-In Information placeholders: username `Sign in with Apple` / password `Use reviewer Apple ID (no password demo)`.

## Done when

- ASC notes + placeholders saved; hosted SIWA live; TestFlight smoke of SIWA path succeeds.
