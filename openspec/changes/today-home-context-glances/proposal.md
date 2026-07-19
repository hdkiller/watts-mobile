## Why

Today already carries the morning decision (recommendation + planned), but recovery context is unlabeled chip noise, and “what’s next / what did I just do” forces a detour through More. Athletes need a named Active Recovery Context band plus thin planned-workout and recent-activity glances below the CTAs — without turning Today into a dashboard.

## What Changes

- **Named Active Recovery Context band** on Today: header, helper copy, existing chips, empty state, secondary actions (Log event → recovery-event route; Check in → Log tab; quiet History link)
- **Coming up strip**: teaser of upcoming **planned workouts only** (reuse `useUpcomingPlannedQuery`); ~2–3 next sessions or next ~3–7 days; “See all” → `/(app)/upcoming`
- **Recently teaser**: 1–2 recent activity rows + “See all” → `/(app)/activity`
- **Strengthen planned-only empty state** when there is no recommendation but today’s planned workout exists (hero stays the planned session; web escape for generate remains, no real Analyze Readiness generate CTA)
- **Docs**: record decision that Coming up = planned workouts for now; separate race/life calendar events later
- **Explicit non-goals this change:** calendar/life events on Coming up; AI Daily Coach Check-In questionnaire; Analyze Readiness Bearer generate; full calendar / week heatmap; duplicating the wellness form on Today

## Capabilities

### New Capabilities

- _(none — composition changes live under existing Today / upcoming / recent surfaces)_

### Modified Capabilities

- `today-home`: Named Active Recovery Context band; Coming up + Recently glances below CTAs; stronger no-recommendation / planned-hero empty handling; keep one above-the-fold decision composition
- `upcoming-planned`: Today may surface a thin planned-only teaser that deep-links into the existing Upcoming list (same query contract)
- `recent-activity`: Today may surface a thin recent teaser that deep-links into the existing Recent activity list (same query contract)

## Impact

- **watts-mobile:** `app/(app)/(tabs)/today.tsx` (primary), optional small presentational components under `src/features/today/` or reuse activity row helpers; Log tab deep-link/scroll for Check in if straightforward; `docs/open-questions.md` (+ baseline IA note if needed)
- **Reuse:** `useUpcomingPlannedQuery`, `useRecentActivityQuery`, `useActiveRecoveryQuery`, existing `/(app)/upcoming` and `/(app)/activity` routes
- **coach-wattz:** no new endpoints required; planned list + workouts list + recovery-context already Bearer-enabled
- **Out of scope:** race/life calendar events, readiness generate, AI check-in questionnaire, dashboard chrome
