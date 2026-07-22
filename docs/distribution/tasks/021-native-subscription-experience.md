# 021 — Native subscription experience

**Area:** app · **Priority:** high · **Status:** in-progress

## Goal

Add hosted Coach Watts Subscription & Billing status, purchase, restore, and provider management to the Expo app without moving billing administration or entitlement logic onto the client.

**Depends on:** RevenueCat/store mapping (018–019) · backend contracts (020)

## Steps

1. [ ] Install `react-native-purchases` (custom UI; no `react-native-purchases-ui`), then rebuild both development clients per [native-modules.md](../../native-modules.md). Android debug build passed 2026-07-22; iOS RevenueCat pods compile but the existing widget/app link fails on `SwiftUICore`, so both-client completion remains open.
2. [ ] Add iOS/Android RevenueCat public SDK keys through environment/EAS configuration; confirm no private key ships in the bundle.
3. [x] Configure RevenueCat only after hosted authentication with Coach Watts UUID; detach the prior identity on logout/account switch.
4. [x] Add typed subscription summary/reconcile API client, query state, and canonical entitlement invalidation.
5. [x] Add Settings → Subscription & Billing with current tier, status, paid-through date, owning provider, and management action.
6. [x] Add localized Supporter/Pro monthly/annual packages and required renewal/Terms/Privacy disclosures.
7. [x] Implement purchase with canceled, pending, unavailable, failed, and server-confirming states; never unlock from client state alone.
8. [x] Implement Restore Purchases and provider-specific Manage Subscription for Apple, Google, and Stripe/web.
9. [x] Suppress packages for an active paid provider; surface overlapping-provider resolution without silently canceling either subscription.
10. [x] Gate purchase/restore to `https://coachwatts.com`; self-hosted instances show only instance-owned canonical entitlement information.
11. [ ] Add unit/component/integration coverage for free, each provider, grace/canceled-paid-through, collision, offline, identity switch, and self-hosted states.

## Done when

- A hosted free athlete can complete or restore a store purchase and sees the server-confirmed tier; existing paid users avoid duplicate acquisition; self-hosted users never see Watt Mind commerce.
