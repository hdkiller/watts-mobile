# 020 — Provider-neutral subscription backend

**Area:** backend · **Priority:** high · **Status:** in-progress

## Goal

Make `coach-wattz` the authoritative entitlement source across Stripe, Apple, and Google, with RevenueCat lifecycle normalization and safe mobile reconciliation.

**Repository:** `~/Develop/coach-wattz`

**OpenSpec detail:** [`design.md`](../../../openspec/changes/store-subscriptions-revenuecat/design.md) and [`tasks.md`](../../../openspec/changes/store-subscriptions-revenuecat/tasks.md)

## Steps

1. [x] Add provider-neutral subscription persistence with provider/external identity, product/tier, normalized/raw state, entitlement end, auto-renew, environment, and event-version metadata.
2. [x] Backfill/preserve current Stripe subscriptions without changing existing user entitlements during migration.
3. [x] Extend canonical entitlement calculation/tests for store states, grace/paid-through, expiry, refund/revocation, contributor/trial/promotion, and overlapping providers.
4. [x] Add strict Apple/Google/Stripe product-to-tier mapping; unknown production products fail closed and alert.
5. [x] Add authenticated/idempotent RevenueCat webhook handling with sandbox/production separation and stale/out-of-order protection.
6. [x] Define and document Official Mobile App Bearer contracts for canonical subscription summary and foreground reconciliation.
7. [x] Return owning provider/management metadata and collision state without exposing secrets.
8. [ ] Import/track active Stripe subscriptions in RevenueCat by stable Coach Watts UUID; keep new Stripe webhook/checkout changes synchronized.
9. [x] Add audit/operations visibility and reconciliation tooling for mapping failures, webhook health, customer lookup, refunds/revocations, and collisions.
10. [ ] Verify provider events cannot unlock paid API behavior without validated canonical server state.

## Done when

- Apple/Google/Stripe lifecycle produces the same server entitlement semantics; existing Stripe access is preserved; mobile can read/reconcile safely with Bearer auth; duplicated/stale/invalid events are covered by tests.
