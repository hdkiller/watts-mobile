## Context

Today (`app/(app)/(tabs)/today.tsx`) is a single scroll: greeting → recommendation/empty → planned card → optional recovery metrics → unlabeled recovery chips → Accept / View workout → quiet “Log recovery event”. Upcoming planned and recent activity already exist as stack screens with TanStack Query hooks (`useUpcomingPlannedQuery`, `useRecentActivityQuery`) reachable from More. Product decided Coming up on Today is **planned workouts only** for now; separate race/life calendar events come later.

## Goals / Non-Goals

**Goals:**

- Name and frame Active Recovery Context so athletes understand why chips matter
- Add thin **Coming up** (planned) and **Recently** teasers below primary CTAs
- Prefer planned-as-hero when no recommendation but today’s planned exists; keep web escape for generate
- Preserve one above-the-fold decision composition (glances are secondary, below CTAs)

**Non-Goals:**

- Race/life calendar events on Coming up
- Full calendar / week heatmap / CTL
- AI Daily Coach Check-In questionnaire
- Real Analyze Readiness / generate recommendation Bearer CTA
- Duplicating wellness form on Today
- New BFF endpoints (`/api/mobile/today` still deferred)

## Decisions

1. **Reuse existing queries as-is**
   - Coming up: `useUpcomingPlannedQuery` (same cache as Upcoming screen); slice client-side to 2–3 rows for the teaser (prefer sessions after today when today’s planned is already in the hero; otherwise include next upcoming including today if not shown above).
   - Recently: `useRecentActivityQuery`; slice to 1–2 rows.
   - Rationale: no new API; prefetch benefits from shared keys; avoids fan-out BFF.

2. **Layout order (top → bottom)**
   - Greeting / date
   - Decision hero: recommendation **or** planned-only hero **or** honest empty + Open web
   - Today’s planned summary (when recommendation present and planned exists)
   - Optional compact recovery metrics (sleep/HRV/feel) if already on payload
   - Named **Active Recovery Context** band (header, helper, chips/empty, Log event / Check in / History)
   - Primary CTAs (Accept, View workout details) when applicable
   - **Coming up** strip → See all → `/(app)/upcoming`
   - **Recently** teaser → See all → `/(app)/activity`
   - Rationale: decision + context stay above the fold; glances are secondary.

3. **Active Recovery Context actions**
   - **Log event** → `/(app)/recovery-event` (existing)
   - **Check in** → `/(app)/(tabs)/log?section=wellness` with Log scrolling to Daily wellness when `section=wellness` (or `section=recovery` for History)
   - **History** → quiet link to `/(app)/(tabs)/log?section=recovery` (recovery section on Log). Optional secondary “Open web” only if instance recovery URL is already a known pattern; do not invent paths.
   - Rationale: writes stay Log-first; Today does not duplicate forms.

4. **Planned-only empty / hero**
   - No recommendation + planned today → treat planned block as the hero decision surface (title/meta + View details CTA; skip/complete only if already wired — do not invent new compliance APIs this change).
   - No recommendation + no planned → empty copy + Retry + Open web (instance home), not a fake generate button.
   - Rationale: matches decided open-question #13; generate stays on web.

5. **Component shape**
   - Prefer small presentational pieces under `src/features/today/` (e.g. `ActiveRecoveryBand`, `ComingUpStrip`, `RecentlyTeaser`) so `today.tsx` stays readable; reuse `formatActivityDate` / `formatDuration` from activity mappers.
   - Match existing NativeWind patterns (zinc borders, brand accents, secondary text links).

6. **Docs**
   - Record planned-now / events-later in `docs/open-questions.md` decision log (and a table row if a new question was open).

## Risks / Trade-offs

- **[Risk] Extra queries on Today cold start** → Mitigation: reuse cached upcoming/recent keys; teasers fail soft (hide or short empty line) without blocking the hero.
- **[Risk] Today feels like a dashboard** → Mitigation: hard cap teaser counts (2–3 / 1–2); no cards-as-stats; glances below CTAs only.
- **[Risk] Upcoming includes today’s planned twice** → Mitigation: filter teaser rows so today’s planned id (when shown in hero) is excluded from Coming up.
- **[Risk] Log scroll-to-section flaky** → Mitigation: if scroll fails, navigating to Log tab alone still satisfies Check in / History.

## Migration Plan

- Pure UI/client change; ship with app OTA / next build.
- No schema or API migration. Rollback = revert Today composition.

## Open Questions

- Exact web path for recovery history (if any) — defer; History → Log recovery section is sufficient for P0.
- Planned complete/skip CTAs on planned-only hero — only if already available; otherwise View details + Open web remain enough for this change.
