## Why

Coach Watts already sells Supporter and Pro subscriptions on the web, but athletes who activate entirely on mobile cannot subscribe with their App Store or Google Play account. A RevenueCat account now exists, so the mobile app can add store-native purchasing without building and operating separate StoreKit and Play Billing lifecycle systems.

## What Changes

- Add native Supporter and Pro subscription purchase flows on iOS and Android, with monthly and annual products supplied by the active store.
- Use RevenueCat to normalize Apple App Store and Google Play purchases, restore state, management URLs, and lifecycle events.
- Keep Coach Watts server entitlements authoritative: RevenueCat events synchronize provider-neutral subscription records, and mobile refetches the canonical `FREE` / `SUPPORTER` / `PRO` entitlement after purchase or restore.
- Import or track existing Stripe subscriptions in the same RevenueCat customer identity so web subscribers keep mobile access and are not prompted into duplicate subscriptions.
- Add current-plan, purchase, restore, and provider-specific management UI under More / Settings, plus upgrade entry points from eligible locked features.
- Offer store purchasing only for the hosted `https://coachwatts.com` instance. Self-hosted instances retain their existing instance-owned entitlement behavior and do not attach Watt Mind store purchases.
- Add paid-app agreements, tax/banking setup, store product catalogs, server notifications, sandbox/internal testing, and IAP review steps to distribution readiness.
- **BREAKING:** Billing is no longer an absolute native-mobile non-goal. Full invoice history, payment-method editing, tax administration, and Stripe portal functionality remain web/provider-managed.

## Capabilities

### New Capabilities

- `store-subscriptions`: Hosted-instance subscription catalog, purchase, restore, current-plan display, duplicate-purchase prevention, and provider-specific management on iOS and Android.
- `subscription-entitlements`: RevenueCat/Stripe lifecycle synchronization into authoritative Coach Watts entitlements, including provider identity, expiry/grace handling, idempotency, and mobile Bearer reads.

### Modified Capabilities

- `settings-hub`: Add native Subscription & Billing status/actions while keeping invoices, payment-method administration, and other control-room billing depth out of the app.
- `store-ready`: Extend release readiness to cover paid-app agreements, store subscription products, server notifications, IAP disclosures, sandbox/internal-track validation, and review submission.

## Impact

- **Mobile:** new native dependency (`react-native-purchases`, optionally RevenueCat UI), a dev-client/binary rebuild, subscription feature state/UI, TanStack Query integration, restore/manage actions, and hosted-instance gating.
- **coach-wattz (required):** provider-neutral subscription persistence and reconciliation; RevenueCat webhook verification/idempotency; Stripe-to-RevenueCat tracking; product-to-tier mapping; Bearer-readable subscription/entitlement status; server-side duplicate-provider policy.
- **External systems:** RevenueCat project, App Store Connect subscription group/products and server notifications, Google Play subscriptions/base plans and service credentials, existing Stripe products/subscriptions.
- **Product/docs:** billing becomes a narrow native capability for subscription acquisition and status; web remains the control room for billing administration.
- **Security/operations:** RevenueCat private keys and webhook authorization remain server-side; only platform public SDK keys ship in the app; sandbox and production data stay distinguishable.
