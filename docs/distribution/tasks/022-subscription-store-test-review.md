# 022 — Subscription store testing and review

**Area:** review · **Priority:** high · **Status:** open

## Goal

Prove the complete subscription lifecycle on store-signed builds and submit Apple/Google products with policy-compliant app UX and review instructions.

**Depends on:** 018–021 · iOS/Android production build tracks (006–007, 015–016)

## Apple matrix

1. [ ] Sandbox/TestFlight initial Supporter/Pro monthly/annual purchase.
2. [ ] Upgrade, downgrade/crossgrade, cancellation with paid-through access, renewal, billing retry/grace, expiry, refund/revocation.
3. [ ] Restore after reinstall/new device and restore while a different Coach Watts account is signed in.
4. [ ] Existing Stripe subscriber retains access and cannot accidentally double-subscribe.
5. [ ] Subscription screen shows localized price/period, auto-renew terms, Terms, Privacy, Restore, and Manage.
6. [ ] Submit subscription products/review screenshots with the matching app build and reviewer notes.

## Google Play matrix

7. [ ] Internal Testing initial Supporter/Pro monthly/annual purchase and required acknowledgment through the selected integration.
8. [ ] Plan change, pending payment, renewal, cancellation, grace/account hold, pause, expiry, refund/revocation.
9. [ ] Restore after reinstall/new device and account-switch behavior.
10. [ ] Existing Stripe subscriber retains access and cannot accidentally double-subscribe.
11. [ ] Subscription screen exposes an easy Play subscription-management route and required disclosures.
12. [ ] Activate/submit products with the matching AAB and review declarations.

## Shared release gates

13. [ ] Duplicate/out-of-order/invalid lifecycle events do not double-grant or regress entitlement.
14. [ ] Store success plus delayed webhook shows “confirming” and foreground reconciliation completes without repurchase.
15. [ ] Self-hosted instances cannot purchase or restore Watt Mind products.
16. [ ] Store privacy/data-safety declarations include purchase history/RevenueCat processing and exclude raw payment credentials.
17. [ ] Prepend TestFlight/Internal/submission/review milestones to [log.md](../log.md), including version/build and result (no credentials).

## Done when

- Both store matrices pass on review-equivalent builds, products are approved/active with the intended rollout, and no unresolved issue permits duplicate billing or client-only paid access.

