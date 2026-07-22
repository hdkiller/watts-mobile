## ADDED Requirements

### Requirement: Paid commerce agreements are active
Store subscription release readiness SHALL require an active Apple Paid Apps Agreement with required tax/banking information and an active Google Play merchant payments profile for Watt Mind Kft.

#### Scenario: Commerce readiness audit
- **WHEN** a release owner evaluates whether store subscriptions can be submitted
- **THEN** the distribution checklist records both stores' paid-commerce agreements/payment profiles as active without storing financial credentials in git

### Requirement: Store subscription catalogs map to canonical tiers
App Store Connect and Google Play Console SHALL contain approved/draft subscription products for Supporter and Pro monthly/annual access that map unambiguously through RevenueCat to Coach Watts tiers.

#### Scenario: Product mapping review
- **WHEN** release owners compare Apple, Google, RevenueCat, Stripe, and Coach Watts configuration
- **THEN** every purchasable product has one documented tier/period mapping and no reused or ambiguous identifier

### Requirement: Server notifications and secrets are production-ready
Production launch SHALL require Apple/Google server notifications connected through RevenueCat, authenticated RevenueCat-to-Coach-Watts lifecycle delivery, and environment-separated credentials stored outside git.

#### Scenario: Notification readiness check
- **WHEN** sandbox and production notification endpoints are tested
- **THEN** verified events reach the correct environment exactly once logically and committed configuration contains no private store, service-account, or RevenueCat secret

### Requirement: Subscription disclosures and management pass store policy
The app SHALL present localized price/period, recurring-renewal terms, Terms, Privacy, Restore Purchases, and provider-specific subscription management in the submitted build.

#### Scenario: Reviewer opens subscription screen
- **WHEN** App Review or Play review navigates to Subscription & Billing
- **THEN** the reviewer can inspect the offer terms, complete a store-native test purchase, restore it, and reach the appropriate management action

### Requirement: Subscription lifecycle is tested on store builds
Release readiness SHALL include successful Apple sandbox/TestFlight and Google Internal Testing evidence for purchase, restore, renewal, cancellation, grace/billing issue, refund/revocation, account switching, and existing Stripe access.

#### Scenario: Store subscription release gate
- **WHEN** the release owner marks subscription testing complete
- **THEN** the distribution task records evidence for both platforms and no unresolved test permits duplicate billing or client-only entitlement unlock

