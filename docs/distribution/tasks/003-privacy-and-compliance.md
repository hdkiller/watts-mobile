# 003 — Privacy labels & compliance

**Area:** listing · **Priority:** high · **Status:** done

**Depends on:** [002](./002-app-store-connect-app.md)  
**Copy source:** [../../store-privacy-checklist.md](../../store-privacy-checklist.md)

## Goal

Complete App Store Connect privacy and compliance so review is not blocked on questionnaires.

## Steps

1. [x] Paste **App Privacy** / Nutrition Labels (11 types): Name, Email, Health, Fitness, Precise Location, Photos or Videos, Other User Content, User ID, Device ID, Crash Data, Performance Data — App Functionality (+ Analytics for Crash/Performance); linked to identity; **not used for tracking**. Published in ASC.
2. [x] Set privacy policy URL: `https://coachwatts.com/privacy`.
3. [x] Export compliance: set `ITSAppUsesNonExemptEncryption` = `false` in `app.json` → `ios.infoPlist` (standard HTTPS/TLS only; no proprietary crypto). Confirmed on next production build / upload questionnaire.
4. [x] Complete age rating questionnaire — result **9+** (most regions; Apple maps **12+** for Vietnam/Brazil); wellness topics yes; medical/treatment **none**; not a regulated medical device.
5. [x] Category **Health & Fitness**; subtitle **AI endurance coach**; content rights: third-party with necessary rights.
6. [x] Store description checked: companion positioning + explicit “not a medical device / no diagnosis” disclaimer ([004](./004-listing-metadata-assets.md)).

## Related (account-level)

- **DSA trader compliance** (Business → Complete Compliance Requirements): **Active** — trader; address from D‑U‑N‑S (Babati utca 26., Gödöllő 2100, Hungary); display contact `+36 302858822` / `deploy@watt-mind.com`.
- China ICP / Vietnam game license: N/A (not filing; not a game).
- App Accessibility showcase: intentionally **not** declared until features are verified on device.

## Done when

- Privacy nutrition labels published, policy URL set, export compliance key in Info.plist, and age rating saved in ASC. ✅
