## 1. Log section deep-link (Check in / History)

- [x] 1.1 Accept optional `section` search param on Log tab (`wellness` | `recovery`) and scroll/focus the matching section when present
- [x] 1.2 Ensure navigating to Log without `section` keeps current behavior

## 2. Today presentational pieces

- [x] 2.1 Add Active Recovery Context band component (header, helper, chips/empty, Log event / Check in / History secondary actions)
- [x] 2.2 Add Coming up strip component (2–3 planned rows from `useUpcomingPlannedQuery`, exclude today’s planned id when already in hero, See all → Upcoming)
- [x] 2.3 Add Recently teaser component (1–2 rows from `useRecentActivityQuery`, See all → Recent activity)

## 3. Today screen composition

- [x] 3.1 Restructure `today.tsx`: decision hero → planned (when with rec) → recovery metrics → Active Recovery Context → CTAs → Coming up → Recently
- [x] 3.2 Strengthen planned-only hero when no recommendation but planned exists; empty + Retry + Open web when neither
- [x] 3.3 Wire pull-to-refresh to also refetch upcoming + recent queries
- [x] 3.4 Soft-fail glances (quiet empty / omit dense chrome) so hero never blocks on teaser errors

## 4. Docs

- [x] 4.1 Record in `docs/open-questions.md`: Coming up on Today = planned workouts for now; separate calendar/life events later
- [x] 4.2 Lightly update product-baseline Today IA note if it still describes unlabeled chips-only recovery

## 5. Verify

- [x] 5.1 Typecheck / lint touched files; confirm no Analyze Readiness generate CTA or AI check-in questionnaire was added
