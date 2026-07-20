# 003 — Privacy labels & compliance

**Area:** listing · **Priority:** high · **Status:** open

**Depends on:** [002](./002-app-store-connect-app.md)  
**Copy source:** [../../store-privacy-checklist.md](../../store-privacy-checklist.md)

## Goal

Complete App Store Connect privacy and compliance so review is not blocked on questionnaires.

## Steps

1. [ ] Paste **App Privacy** / Nutrition Labels using the data-types table in the privacy checklist (OAuth identity, health/fitness wellness + optional HealthKit prefill, chat content, photos optional, push token, Sentry diagnostics).
2. [ ] Set privacy policy URL: `https://coachwatts.com/privacy`.
3. [ ] Answer export compliance (standard HTTPS/TLS → typically no non-exempt encryption; confirm current Apple wording).
4. [ ] Complete age rating questionnaire (no medical device claims).
5. [ ] Confirm HealthKit usage matches declared purpose (sleep + weight **read** for check-in prefill only; no write).
6. [ ] Double-check store description drafts later ([004](./004-listing-metadata-assets.md)) avoid diagnosis / “medical advice” language.

## Done when

- Privacy, policy URL, export compliance, and age rating are saved in ASC.
