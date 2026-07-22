## Context

Coach Watts has an existing Stripe subscription implementation in `coach-wattz`: Stripe customer/subscription IDs live on `User`, webhooks project Stripe state into `subscriptionTier` / `subscriptionStatus`, and server entitlements gate paid behavior. The mobile app currently exposes no billing UI and authenticates with OAuth Bearer tokens rather than the cookie sessions used by the Stripe billing endpoints.

The product now needs store-native acquisition for athletes who sign up and activate entirely on iOS or Android. A RevenueCat account has been created. The app also supports arbitrary self-hosted instance URLs, while the Watt Mind App Store and Play products belong only to the hosted Coach Watts service.

## Goals / Non-Goals

**Goals:**

- Sell the existing Supporter and Pro tiers through Apple and Google monthly/annual subscriptions.
- Preserve access for existing Stripe, contributor, trial, and promotional-grant users.
- Make server entitlements authoritative across Stripe, Apple, and Google.
- Prevent accidental double subscriptions and show the correct management destination.
- Support purchase, restore, renewal, cancellation, grace, refund/revocation, and cross-device access.
- Keep store/release configuration, test evidence, and operational ownership documented.

**Non-Goals:**

- Processing store purchases on arbitrary self-hosted instances.
- Replacing Stripe Checkout or the Stripe Customer Portal for web subscribers.
- Native invoice history, card/payment-method editing, tax documents, refunds, or billing administration.
- Alternative billing, external purchase links, or region-specific steering programs in the first release.
- Trusting RevenueCat client state as authorization for server-side paid features.
- Building custom StoreKit 2 and Play Billing lifecycle backends while RevenueCat is the selected integration.

## Decisions

### 1. RevenueCat normalizes store commerce; Coach Watts remains the entitlement authority

The app uses `react-native-purchases` for catalog, purchase, restore, CustomerInfo, and management URLs. RevenueCat receives Apple/Google server notifications and sends normalized lifecycle events to `coach-wattz`. `coach-wattz` persists provider subscriptions and computes the canonical `FREE` / `SUPPORTER` / `PRO` entitlement used by APIs and mobile reads.

This avoids implementing two receipt-validation systems without moving authorization into a third-party client SDK. Direct StoreKit/Play Billing integration was considered and rejected for the first release because renewal, acknowledgment, refund, retry, upgrade, and notification handling would materially increase maintenance.

### 2. Use the Coach Watts user UUID as the RevenueCat App User ID

RevenueCat is configured only after Coach Watts authentication, using the stable server user UUID. Anonymous RevenueCat identities are not used for real purchases. The same identifier is used when tracking existing Stripe subscriptions, so one customer identity spans web, iOS, and Android.

On sign-out/account switch, the SDK must detach the prior identity before another account can purchase or restore. Restore-transfer behavior must be configured deliberately and tested; the initial policy is “transfer to the currently authenticated account,” with an audit event and support visibility.

### 3. Store purchase is hosted-instance-only

Purchase UI and RevenueCat production initialization are enabled only when the normalized instance is `https://coachwatts.com`. A self-hosted athlete may view the instance's canonical entitlement, but the app does not load Watt Mind offerings, present a store paywall, or attach a restored Watt Mind purchase to that instance.

This matches the existing self-hosted behavior where an instance without Stripe grants its own Pro entitlements and prevents Watt Mind from selling access it cannot fulfill on a third-party server.

### 4. Introduce provider-neutral subscription persistence

`coach-wattz` adds a subscription entity keyed by provider plus external subscription/original transaction identity. It stores user, provider, product, mapped tier, normalized and raw status, current period end, auto-renew state, environment, management metadata, and last processed event/version. Existing `User.subscriptionTier`, `subscriptionStatus`, and period fields may remain as a denormalized compatibility projection during migration; Stripe IDs remain provider-specific metadata rather than the canonical model.

Normalized state must represent active, canceled-but-entitled, grace/billing-retry, pending, on-hold/paused, expired, revoked/refunded, and contributor/manual access without discarding provider-native detail.

### 5. Product mapping mirrors current tiers

Apple uses one subscription group with Supporter monthly/annual at the Supporter service level and Pro monthly/annual at the higher Pro level. Google uses Supporter and Pro subscription products, each with monthly and annual auto-renewing base plans. RevenueCat exposes `supporter` and `pro` entitlements in one current offering.

The app always renders localized title, price, period, and offer eligibility from the store package. It does not hard-code the web USD/EUR price table. Store price parity versus commission-adjusted pricing is a commerce decision completed before product activation.

### 6. Existing paid provider suppresses a new purchase

Before showing purchasable packages, mobile reads the canonical subscription summary. An active Stripe, Apple, or Google subscription suppresses a new initial purchase and shows its provider-specific management action. Upgrades/downgrades within the same store use the store/RevenueCat product-change flow.

If asynchronous events nevertheless create overlapping active subscriptions, Coach Watts grants the highest valid tier, records the collision for support, and does not silently cancel either provider. The user is shown both management destinations until the conflict is resolved.

### 7. Purchase completion requires server reconciliation

After RevenueCat reports a purchase or restore, the app requests/awaits server reconciliation for the authenticated App User ID and refetches the canonical subscription summary. Premium server behavior is unlocked only from that response. Webhooks remain the durable lifecycle path; the foreground reconcile path removes user-visible webhook lag and must be idempotent.

The paired backend exposes `GET /api/subscriptions/me` with `profile:read` and `POST /api/subscriptions/reconcile` with `profile:write`. Reusing the Official Mobile App's existing profile scopes avoids a billing-only re-consent while preserving the read/write boundary; RevenueCat webhook ingestion is separately authenticated and is never authorized by a mobile Bearer token.

### 8. Secrets and environments remain separated

RevenueCat platform public SDK keys may be supplied to the app through EAS environment configuration. RevenueCat secret API keys, webhook authorization, Apple In-App Purchase keys, and Google service-account credentials remain server/RevenueCat-side and must never ship in the bundle or enter git.

Sandbox/test and production events are stored distinctly. Production UI remains feature-flagged off until paid agreements, store products, notification delivery, and backend reconciliation have passed their respective sandbox/internal-track tests.

## Risks / Trade-offs

- **[RevenueCat dependency and plan cost]** → Confirm webhook/server-notification features and pricing before implementation; record the selected plan in distribution task 018.
- **[Existing Stripe data may not map cleanly]** → Backfill by stable user ID and Stripe subscription ID, reconcile counts and tiers, and keep Stripe webhooks running during migration.
- **[Double billing across providers]** → Suppress offers for any canonical active provider, log collisions, and provide explicit provider management rather than attempting automatic cross-provider cancellation.
- **[Webhook delay or outage]** → Use a signed/idempotent webhook as the durable path plus an authenticated foreground reconciliation call after purchase/restore.
- **[Account switching can transfer a receipt]** → Require Coach Watts login before purchase, configure RevenueCat transfer behavior explicitly, detach SDK identity on logout, and test two Coach Watts accounts on one store account.
- **[Self-hosted ambiguity]** → Gate offerings and restore by canonical hosted origin; keep self-hosted entitlement calculation server-owned.
- **[Store review rejection]** → Use store-localized pricing/disclosures, restore and manage actions, approved products, review notes, and real sandbox/TestFlight/internal-track evidence.
- **[Status-model regression]** → Preserve provider-native raw status and existing denormalized fields during a staged migration; cover grace, retry, hold, refund, cancellation, and expiry in backend tests.

## Migration Plan

1. Confirm RevenueCat ownership, plan, team access, restore policy, and separate test/production credentials.
2. Complete Apple Paid Apps Agreement/tax/banking and Google merchant payments profile; create inactive/draft store products.
3. Add the provider-neutral backend model, product mapping, canonical summary, webhook/reconcile paths, idempotency, and tests without changing current Stripe entitlement output.
4. Connect Apple, Google, and Stripe to RevenueCat; backfill active Stripe subscriptions by Coach Watts user UUID; compare RevenueCat and database entitlement reports.
5. Add the native SDK and hosted-only feature behind a disabled production flag; rebuild development clients.
6. Validate purchases and full lifecycle in RevenueCat Test Store, Apple sandbox/TestFlight, and Google Internal Testing.
7. Enable the feature for internal users, then production after subscription products are approved with the store build.

Rollback hides the purchase/paywall entry and disables foreground purchase initiation while leaving store products, webhook ingestion, and already-purchased entitlements active. Existing subscribers must never lose access merely because the mobile acquisition UI is rolled back.

## Open Questions

- Will store prices match web list prices or target equal net proceeds after store fees?
- Which RevenueCat plan is selected, and does it include the required production webhooks at launch volume?
- ~~Does the Official Mobile App reuse existing scopes?~~ Decided: summary uses `profile:read`; foreground reconciliation uses `profile:write`.
- Should introductory trials be offered in stores, and how will trial eligibility interact with the existing Coach Watts trial and prior Stripe trials?
- Is “transfer to current authenticated account” the final restore policy, or should active receipts remain bound to their original Coach Watts account?
