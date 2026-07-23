# 013 — Play Store listing assets

**Area:** listing · **Priority:** medium · **Status:** open

**Depends on:** [011](./011-play-console-app.md); screenshots need a **release / Internal testing** AAB ([015](./015-android-production-build.md))

## Goal

Fill the main store listing Google requires for testing tracks and production. Companion positioning; **no medical claims**.

## Required before production (marketing + eng)

| Asset | Spec / source | Status |
|-------|----------------|--------|
| Short description | Companion positioning; no diagnosis language | [ ] |
| Full description | Reuse ASC voice + “not a medical device” disclaimer ([store-privacy-checklist.md](../../store-privacy-checklist.md)) | [ ] |
| App icon 512×512 | From Coach Watts mark / `assets/images/icon.png` pipeline | [ ] |
| Feature graphic 1024×500 | Real hero (not a stretched logo); marketing owns design | [ ] |
| Phone screenshots | From **release / Internal** build; same story arc as Apple ([004](./004-listing-metadata-assets.md)): Today → Log → Coach → More | [ ] |
| Contact / support | Align with `support@coachwatts.com` | [ ] |

Skip tablet screenshots for v1 (phone-first; don’t claim tablet support).

### Handoff checklist

```
[ ] Decide screenshot / feature-graphic owner (marketing vs eng) — same decision as Apple [004]
[ ] Internal/release AAB installed
[ ] Short + full description pasted; matches Data safety (no diagnosis language) — [012](./012-play-data-safety-and-content.md)
[ ] Icon 512×512 + feature graphic 1024×500 uploaded
[ ] Phone screenshots uploaded; brand treatment matches Apple set
[ ] Contact email / support verified
[ ] Tell eng when done → unlock [017](./017-play-production-submit.md)
```

## Steps (tracking)

1. [ ] Short description + full description (companion positioning; **no medical claims**).
2. [ ] App icon 512×512 (from Coach Watts mark / `assets/images/icon.png` pipeline).
3. [ ] Feature graphic 1024×500 (marketing or eng — open owner, same as iOS screenshots).
4. [ ] Phone screenshots from a **release/internal-test** build (required sizes per Play Console).
5. [ ] Optional: tablet screenshots only if we claim tablet support (v1 phone-first — skip).
6. [ ] Contact email / support — align with `support@coachwatts.com` / watt-mind ops.
7. [ ] Cross-check listing copy against Data safety ([012](./012-play-data-safety-and-content.md)).

## Done when

- Main store listing has required graphics + text for the locales we ship (EN-US first).
