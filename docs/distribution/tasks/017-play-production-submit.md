# 017 — Promote to Play production / review

**Area:** review · **Priority:** medium · **Status:** open

**Depends on:** [012](./012-play-data-safety-and-content.md), [013](./013-play-listing-assets.md), [016](./016-play-internal-test-smoke.md)

## Goal

Send the tested AAB through closed/open testing as needed, then production review.

## Steps

1. [ ] Promote build Internal → **Closed** (optional) → **Open** (optional) → **Production** per comfort level. First public release can go Internal → Production if policies allow and listing is complete.
2. [ ] Complete any remaining Play Console “Publishing overview” / “App content” checklist items (ads, Data safety, target audience, government apps, etc.).
3. [ ] Provide tester / review credentials if Google asks (same seeded athlete pattern as iOS [008](./008-reviewer-demo-account.md)).
4. [ ] Submit for production review.
5. [ ] Prepend outcome to [log.md](../log.md) (In review / Approved / Rejected + reason).
6. [ ] After first production signing: confirm [../../deep-links.md](../../deep-links.md) assetlinks includes Play **App signing** cert SHA-256.

## Done when

- App is live (or at least **Pending publication** / **In review**) and the outcome is logged.
