# 008 — Reviewer demo account & notes

**Area:** review · **Priority:** high · **Status:** in progress

**Depends on:** hosted **Sign in with Apple** enabled for Guideline 4.8 ([sign-in-with-apple](../../../openspec/changes/sign-in-with-apple/) / coach-wattz)  
**Related:** [../../issues/056.md](../../issues/056.md) (day-one empty surfaces look broken)

## Goal

- **Apple:** reviewers sign in via **Sign in with Apple** (no ASC password demo).
- **Play:** reviewers use a dedicated **Google** demo Gmail via OAuth (credentials in Play Sign in details; password only in password manager — never git).

## Decision (2026-07-21)

### Apple (ASC)

- No dedicated Google demo for App Review.
- Reviewers use **Sign in with Apple** with a **reviewer Apple ID** on `/oauth/login`.
- ASC Sign-In Information username/password are placeholders only (not Coach Watts credentials).

### Play Console

- Dedicated Google account: **`coachwatts.play.review@gmail.com`**
- Password: password manager only (not committed).
- Play Sign in details updated 2026-07-21 (name: “Reviewer demo athlete”) with OAuth instructions.
- Still needed: seed this Google identity as an athlete on `https://coachwatts.com` (sign in once with Google so the account exists on the IdP).

## How login works (no Coach Watts password)

### Apple

1. Reviewer taps Sign in in the app  
2. System browser opens Coach Watts `/oauth/login`  
3. They choose **Sign in with Apple**  
4. Browser returns via `coachwatts://oauth/callback` (PKCE)

### Play / Android

1. Reviewer taps Sign in in the app  
2. System browser opens Coach Watts `/oauth/login`  
3. They choose **Google** and use the Gmail credentials from Play Sign in details  
4. Browser returns via `coachwatts://oauth/callback` (PKCE)

## Steps

1. [x] Decide Apple review path: SIWA with reviewer Apple ID.
2. [x] Create Play Google demo Gmail + save credentials in Play Sign in details (`coachwatts.play.review@gmail.com`).
3. [ ] Seed the Play Gmail as an athlete on hosted `coachwatts.com` (one Google OAuth login).
4. [ ] Confirm hosted IdP shows Sign in with Apple after Dokploy deploy + smoke.
5. [ ] Optionally soften empty first-run UX ([056](../../issues/056.md)) — new SIWA accounts start empty.
6. [x] App Review notes + Sign-In Information placeholders in ASC 0.1.1 (contact Laszlo Racz / `deploy@watt-mind.com` / `+36302858822`).
7. [ ] Smoke once on TestFlight: PKCE → Safari → SIWA → authenticated shell ([007](./007-testflight-smoke.md)).
8. [ ] Smoke once on Play internal test: PKCE → Chrome Custom Tabs → Google demo → authenticated shell ([016](./016-play-internal-test-smoke.md)).

### ASC notes template

```
Sign-in uses OAuth 2.0 + PKCE in the system browser (no in-app password form).
Default instance: https://coachwatts.com
IMPORTANT: Do not use the Sign-In Information username/password fields as Coach Watts credentials. Tap Sign in → Safari → Sign in with Apple using a reviewer Apple ID → return via coachwatts://oauth/callback.
Google is also offered on the IdP; Play reviewers use a separate Google demo account documented in Play Console Sign in details.
HealthKit / camera / notifications are optional. Delete account: More → Settings.
Not a medical device / no diagnosis.
Guideline 4.8: Sign in with Apple is offered on the IdP login page alongside Google.
```

Sign-In Information placeholders: username `Sign in with Apple` / password `Use reviewer Apple ID (no password demo)`.

### Play Sign in notes (saved in Console)

```
OAuth only (no in-app password). Default instance https://coachwatts.com. Tap Sign in → system browser → Google → use the Gmail credentials above → return via coachwatts://oauth/callback. Optional: Health Connect, camera, notifications. Delete account: More → Settings. Not a medical device.
```

## Done when

- ASC notes + placeholders saved; hosted SIWA live; TestFlight SIWA smoke succeeds.
- Play Sign in details have the Google demo email; athlete seeded on hosted instance; Play internal-test smoke succeeds.
