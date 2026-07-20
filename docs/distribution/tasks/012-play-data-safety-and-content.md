# 012 — Play Data safety & content ratings

**Area:** listing · **Priority:** medium · **Status:** open

**Depends on:** [011](./011-play-console-app.md)  
**Copy source:** [../../store-privacy-checklist.md](../../store-privacy-checklist.md)

## Goal

Complete Google Play Data safety, content rating, and target-audience forms without medical claims.

## Steps

1. [ ] **Data safety** form: map categories from the privacy checklist (account info, health & fitness wellness + optional Health Connect prefill, messages, photos optional, device IDs for push, crash diagnostics via Sentry). Declare collection, sharing (usually to your backend / processors), encryption in transit, deletion path.
2. [ ] Privacy policy URL: `https://coachwatts.com/privacy`.
3. [ ] **Content rating** questionnaire (IARC) — endurance coaching companion, not a medical device.
4. [ ] Target audience / news / COVID / Data safety ads declarations as applicable (expect: no ads).
5. [ ] Health Connect permissions: declare sleep + weight read consistent with `app.json` / Health Connect usage (prefill only).
6. [ ] Store listing text later ([013](./013-play-listing-assets.md)) must match Data safety (no diagnosis language).

## Done when

- Data safety, content rating, and required policy declarations saved with no blocking incomplete sections.
