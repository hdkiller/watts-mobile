# 019 — Paid agreements, pricing, and store subscription products

**Area:** commerce · **Priority:** high · **Status:** open

## Goal

Make Watt Mind Kft. eligible to receive store subscription proceeds and create review-ready Supporter/Pro monthly and annual products on both stores.

**Depends on:** Apple/Play organization accounts (001, 010–011) · RevenueCat ownership decision (018)

## Product model

| Tier | Apple | Google Play | RevenueCat |
|------|-------|-------------|------------|
| Supporter monthly/annual | One subscription group; two products at Supporter service level | `Supporter` subscription; monthly/annual auto-renewing base plans | `supporter` entitlement/packages |
| Pro monthly/annual | Same group; two products at higher Pro service level | `Pro` subscription; monthly/annual auto-renewing base plans | `pro` entitlement/packages |

Final immutable product/base-plan IDs and prices belong in this file after creation; never guess them in application code.

## Steps

1. [ ] Apple Account Holder accepts the current Paid Apps Agreement (recorded as “New” on 2026-07-21).
2. [ ] Complete/verify Apple tax and banking information for Watt Mind Kft.; record status only, not financial details.
3. [ ] Evaluate/enroll in the App Store Small Business Program if eligible.
4. [ ] Confirm/create the Google Play organization merchant payments profile, tax/payout readiness, and public merchant/support details.
5. [ ] Decide monthly/annual store pricing, regional availability, annual discount, and whether prices match web or target comparable net proceeds.
6. [ ] Decide introductory trial/offer policy and cross-provider trial eligibility with the existing Coach Watts trial/Stripe history.
7. [ ] Create the Apple subscription group, four products, service levels, localizations, price schedule, availability, grace period, and review metadata/screenshot placeholders.
8. [ ] Create Google Supporter/Pro subscriptions with monthly/annual base plans, regional prices, grace/account-hold/resubscribe configuration, benefits, and tax/compliance metadata.
9. [ ] Map all products/base plans in RevenueCat task 018 and document one product → tier/period mapping.
10. [ ] Keep products inactive/draft until task 020 backend authority and task 021 app experience are ready for end-to-end testing.

## Done when

- Paid-commerce agreements/payment profiles are active and both stores have localized, priced, unambiguous Supporter/Pro monthly/annual products ready to test/submit.

