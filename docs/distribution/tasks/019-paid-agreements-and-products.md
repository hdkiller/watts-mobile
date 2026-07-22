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

## Apple catalog (draft) — created 2026-07-22

Subscription group **Coach Watts** · Group ID `22257011` · App Apple ID `6793247809`

| Reference | Product ID | Apple ID | Duration | Base price (USD) | EN display / description | Status |
|-----------|------------|----------|----------|------------------|--------------------------|--------|
| Pro Monthly | `coachwatts_pro_monthly` | `6793680130` | 1 month | $14.99 | Pro Monthly / Full Pro access with adaptive coaching insights. | Prepare for Submission |
| Pro Annual | `coachwatts_pro_annual` | `6793680902` | 1 year | $119.00 | Pro Annual / Full Pro access billed once per year. | Prepare for Submission |
| Supporter Monthly | `coachwatts_supporter_monthly` | `6793681933` | 1 month | $8.99 | Supporter Monthly / Core coaching tools and daily guidance. | Prepare for Submission |
| Supporter Annual | `coachwatts_supporter_annual` | `6793682172` | 1 year | $89.99 | Supporter Annual / Core coaching tools billed once per year. | Prepare for Submission |

- Availability: all countries/regions for each product (annual = 1 Year Upfront; not Monthly-with-12-Month-Commitment).
- Group localization EN (U.S.): display name **Coach Watts** (use app name).
- Service levels still need a manual fix in ASC: put **both Pro** products at level **1** and **both Supporter** at level **2** (currently listed 1–4 in creation order).
- Review screenshot / notes and grace period still open. Keep draft until Paid Apps + tax/banking clear and tasks 020/021 are ready.

## Steps

1. [ ] Apple Account Holder accepts the current Paid Apps Agreement (blocked on legal-entity verification as of 2026-07-22; Free Apps = Verifying; Paid Apps not yet listed).
2. [ ] Complete/verify Apple tax and banking information for Watt Mind Kft.; record status only, not financial details.
   - **Blocked:** Tax/Banking UI is not available until Paid Apps opens after entity verification.
   - **Banking intent (when unlocked):** Revolut Business EUR payout IBAN for Watt Mind Kft. (documented in private org notes; do not commit full IBAN here).
   - **Tax:** W-8BEN-E needs Watt Mind adószám / EU VAT ID — not yet recorded in-repo; confirm with accountant/Billingo before filing.
3. [ ] Evaluate/enroll in the App Store Small Business Program if eligible.
4. [~] Google Play payments profile linked (2026-07-23): Watt Mind Kft. org profile `3878-8777-9292` (Play); public merchant website `https://coachwatts.com`, support `support@coachwatts.com`, statement name `CoachWatts`, category Internet/Network/Digital Media. Still open: add payout bank account; optional 15% service-fee account-group enrollment.
5. [x] Decide monthly/annual store pricing, regional availability, annual discount, and whether prices match web or target comparable net proceeds. (Parity with web list: Pro $14.99 / $119.00, Supporter $8.99 / $89.99; all countries.)
6. [ ] Decide introductory trial/offer policy and cross-provider trial eligibility with the existing Coach Watts trial/Stripe history.
7. [~] Create the Apple subscription group, four products, localizations, price schedule, and availability. Remaining: service levels (Pro=1, Supporter=2), grace period, review screenshot/notes.
8. [ ] Create Google Supporter/Pro subscriptions with monthly/annual base plans, regional prices, grace/account-hold/resubscribe configuration, benefits, and tax/compliance metadata.
   - **Blocked (2026-07-23):** Play Console requires uploading an APK/AAB before the Create subscription UI unlocks (draft app `4976128188579826786` has no artifact yet).
9. [x] Map Apple products in RevenueCat task 018 and document one product → tier/period mapping (2026-07-22). Google base plans still open.
10. [ ] Keep products inactive/draft until task 020 backend authority and task 021 app experience are ready for end-to-end testing.

## Done when

- Paid-commerce agreements/payment profiles are active and both stores have localized, priced, unambiguous Supporter/Pro monthly/annual products ready to test/submit.

