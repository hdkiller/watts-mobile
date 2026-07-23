## 1. Commerce decisions and account readiness

- [~] 1.1 Record non-secret identifiers in distribution docs (done in [018](../../../docs/distribution/tasks/018-revenuecat-project.md)); still open: Watt Mind owner/team, selected plan, production webhook availability, restore-transfer policy
- [ ] 1.2 Decide Apple/Google monthly and annual Supporter/Pro pricing, introductory-trial policy, and parity versus Stripe
- [ ] 1.3 Accept the Apple Paid Apps Agreement and complete required Watt Mind Kft. tax/banking information
- [ ] 1.4 Confirm/create the Google Play organization merchant payments profile and payout/tax readiness
- [x] 1.5 Decide the Official Mobile App authorization contract for subscription status and foreground reconciliation in `coach-wattz`

## 2. Provider-neutral backend foundation (`coach-wattz`)

- [x] 2.1 Add provider-neutral subscription persistence with provider/external identity, product, tier, normalized/raw status, entitlement end, auto-renew, environment, and event-version fields
- [x] 2.2 Preserve/backfill current Stripe user subscription fields into the new model while keeping existing entitlement output unchanged
- [x] 2.3 Extend canonical entitlement calculation/tests for Apple, Google, Stripe, contributor, trial, promotional grant, grace, expiry, refund/revocation, and overlapping providers
- [x] 2.4 Add one documented product-ID-to-tier mapping for Stripe, Apple, and Google; fail closed on unknown production products
- [x] 2.5 Add verified, idempotent RevenueCat webhook ingestion with sandbox/production separation and stale/out-of-order event protection
- [x] 2.6 Add Bearer-authenticated subscription summary and foreground reconciliation contracts for the Official Mobile App
- [x] 2.7 Return provider-specific management metadata and collision state without exposing provider secrets
- [x] 2.8 Add audit/diagnostic visibility for lifecycle transitions, rejected webhooks, mapping failures, and double-provider collisions

## 3. RevenueCat and store catalog configuration

- [x] 3.1 Add Apple app configuration to RevenueCat for `com.coachwatts.app` and store private credentials outside git (IAP key in RC; local V2 secret in gitignored `.env` / MCP). Play app `app95807dc9bd` + product mapping done 2026-07-23; Play service-account JSON in RC still open.
- [x] 3.2 Create RevenueCat `supporter` and `pro` entitlements, current offering, and monthly/annual package mappings (Apple + Play products; Test Store retained on `$rc_*`)
- [ ] 3.3 Create one App Store subscription group with Supporter/Pro monthly/annual products, service levels, localizations, prices, grace period, and review metadata
- [x] 3.4 Create Google Play Supporter/Pro subscriptions with monthly/annual auto-renewing base plans, regional prices, grace/account-hold settings, and required disclosures (draft catalog 2026-07-23; Activate + benefits still open)
- [ ] 3.5 Connect Apple and Google platform server notifications to RevenueCat for sandbox and production
- [ ] 3.6 Connect existing Stripe Billing to RevenueCat and import/backfill active subscriptions under the matching Coach Watts user UUID
- [ ] 3.7 Update the existing Stripe activation/webhook path to track new subscriptions in RevenueCat and verify reconciliation counts against Coach Watts

## 4. Mobile RevenueCat foundation

- [ ] 4.1 Install `react-native-purchases` (and `react-native-purchases-ui` only if the chosen UI uses RevenueCat components), document the native rebuild, and rebuild iOS/Android dev clients
- [x] 4.2 Add environment-separated RevenueCat public platform key configuration without committing private keys
- [x] 4.3 Configure RevenueCat only for authenticated hosted users with Coach Watts user UUID as App User ID; detach identity on logout/account change
- [x] 4.4 Add subscription summary/reconcile API types, query keys, fetchers, and invalidation helpers against the documented backend contract
- [x] 4.5 Add store offering/customer-info adapter state with hosted-only gating and no hard-coded localized prices
- [x] 4.6 Add unit tests for hosted/self-hosted gating, identity changes, product mapping adapters, and canonical-summary precedence

## 5. Subscription and billing experience

- [x] 5.1 Add More / Settings → Subscription & Billing route and current tier/provider/status summary
- [x] 5.2 Add Supporter/Pro monthly/annual offering UI with localized store terms, renewal disclosure, Terms, and Privacy
- [x] 5.3 Implement purchase flow with canceled, pending, unavailable, failed, and server-confirming states
- [x] 5.4 Reconcile/refetch canonical entitlements after purchase and refresh subscription-gated queries only after server confirmation
- [x] 5.5 Add Restore Purchases with empty, transferred, successful, and delayed-confirmation outcomes
- [x] 5.6 Add provider-specific Manage Subscription behavior for Apple, Google Play, and Stripe/web
- [x] 5.7 Suppress purchase packages for an existing active provider and display actionable collision information if multiple providers are active
- [x] 5.8 Ensure self-hosted instances show only instance-owned entitlement information with no Watt Mind purchase/restore actions
- [ ] 5.9 Add component/integration tests for free, Stripe, Apple, Google, canceled-paid-through, grace, collision, offline, and self-hosted views

## 6. Lifecycle and security verification

- [ ] 6.1 Test RevenueCat Test Store purchase, restore, identity switch, webhook duplication, stale events, and foreground reconciliation
- [ ] 6.2 Verify unauthorized/invalid webhook requests cannot mutate subscription state and no private RevenueCat/store credentials enter the app bundle or git
- [ ] 6.3 Verify an existing Stripe subscriber retains the same tier on mobile and is not offered a duplicate store purchase
- [ ] 6.4 Verify cancellation keeps paid-through access and expiry/refund/revocation recomputes entitlement from remaining valid sources
- [ ] 6.5 Verify overlap handling grants the highest valid tier, reports both providers, and never silently cancels a subscription

## 7. Store build testing and review

- [ ] 7.1 Validate Apple sandbox/TestFlight purchase, upgrade/downgrade, restore, renewal, cancellation, billing retry/grace, refund/revocation, reinstall, and account switch
- [ ] 7.2 Validate Google Internal Testing purchase, plan change, pending payment, acknowledgment, restore, renewal, cancellation, grace/account hold, pause, refund/revocation, reinstall, and account switch
- [ ] 7.3 Add Maestro/manual smoke coverage for opening billing, purchasing/restoring in the supported test environment, managing by provider, and self-hosted suppression
- [ ] 7.4 Add subscription product review notes/screenshots and submit IAP products with the matching iOS/Android builds
- [ ] 7.5 Record TestFlight/Play Internal evidence and review outcomes in distribution tasks/log; resolve any store policy feedback before production enablement

## 8. Documentation and rollout

- [x] 8.1 Update product baseline, implementation plan, open questions/decisions, OpenSpec context, native-module guidance, and store/privacy copy for narrow native billing scope
- [ ] 8.2 Maintain distribution tasks 018–022 and prepend dated log entries as RevenueCat, agreements, products, integration, testing, and review milestones land
- [x] 8.3 Add an operations runbook for product mappings, webhook health, reconciliation, customer lookup, collision support, refunds/revocations, and provider ownership
- [ ] 8.4 Launch behind a production feature flag after both stores and backend are ready; verify rollback hides acquisition without revoking existing subscribers
