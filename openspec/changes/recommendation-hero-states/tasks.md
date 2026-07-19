# Tasks — Recommendation Hero States

## 1. Tokens and mapping

- [x] 1.1 Add rest and modify accent tokens to `src/theme/colors.ts` + `tailwind.config.js`; document in `docs/DESIGN.md`
- [x] 1.2 Add `heroToneForAction(action)` and confidence normalization/bucketing helpers to `src/features/today/mapTodayPayload.ts` with unit tests (known actions, unknown fallback, ≤1 vs percent confidence)

## 2. Hero UI

- [x] 2.1 Apply tone to the hero card: accent border, kicker/action label color, faint background tint per action category
- [x] 2.2 Replace the confidence sentence with the three-dot strength indicator (hidden when confidence is null)
- [x] 2.3 Replace the accepted text line + Accept button with the confirmed CTA row (checkmark + "Accepted — view workout" linking to planned detail; plain confirmed row when no planned workout)

## 3. Verification

- [x] 3.1 `npx tsc --noEmit` and `npm test` pass
- [ ] 3.2 Manual pass: train/rest/modify payloads render distinct hero tones; accepting swaps the CTA to the confirmed state and links to the workout
