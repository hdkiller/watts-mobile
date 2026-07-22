# 018 — RevenueCat project and ownership

**Area:** account · **Priority:** high · **Status:** in-progress

## Goal

Establish a production-owned RevenueCat project that can normalize Apple App Store, Google Play, and existing Stripe subscriptions for hosted Coach Watts users.

**OpenSpec:** [`store-subscriptions-revenuecat`](../../../openspec/changes/store-subscriptions-revenuecat/proposal.md)

## Decisions already landed

| Choice | Detail |
|--------|--------|
| Subscription service | RevenueCat |
| Coach Watts authority | Server-computed entitlements remain authoritative |
| App User ID | Stable Coach Watts user UUID; no anonymous real purchases |
| Instance scope | Hosted `https://coachwatts.com` only |
| Existing Stripe | Track/import under the same RevenueCat user identity |

## Steps

1. [x] Create RevenueCat account (2026-07-22).
2. [ ] Create/confirm the production project under a durable Watt Mind Kft. owner identity; invite day-to-day admins individually.
3. [ ] Record non-secret RevenueCat project/app identifiers and dashboard ownership here; keep API keys out of git.
4. [ ] Select a RevenueCat plan that supports the required production webhook/server-notification workflow and record the commercial owner.
5. [ ] Decide and record restore-transfer behavior for one store account used with multiple Coach Watts accounts.
6. [ ] Add Apple app config for bundle `com.coachwatts.app` with required App Store credentials stored only in RevenueCat/password manager.
7. [ ] Add Google app config for package `com.coachwatts.app` with required Play credentials stored only in RevenueCat/password manager.
8. [ ] Connect Stripe Billing for existing Coach Watts products/subscriptions.
9. [ ] Create RevenueCat `supporter` / `pro` entitlements and a current offering with monthly/annual packages after task 019 product IDs exist.
10. [ ] Configure separate test/sandbox and production notification/integration paths; verify environments cannot cross.

## Security

- Public platform SDK keys may be supplied through EAS environment configuration when task 021 begins.
- RevenueCat secret keys, webhook authorization values, Apple IAP keys, Google service-account JSON, and Stripe credentials never enter git or the app bundle.
- Do not paste credentials or full secret-bearing dashboard screenshots into this task/log.

## Done when

- Watt Mind owns the RevenueCat project; team access/plan/restore policy are recorded; Apple, Google, and Stripe configurations are connected; entitlements/offerings map unambiguously to Coach Watts tiers.

