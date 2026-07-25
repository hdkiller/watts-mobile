## Why

Web `/nutrition` is two tabs: **Strategy** and **Plan**. Mobile shipped the Plan half and none of the Strategy half. Four server capabilities the web leans on have no mobile consumer at all: `GET /api/nutrition/strategy` (fuel state, hydration debt and status, hydration advice, flush prompt), `GET /api/nutrition/extended-wave` (multi-day glycogen and energy horizon), `GET /api/nutrition/active-feed` (what to eat right now), and `POST /api/nutrition/hydration-reset`.

The consequence is that mobile answers "what did I eat" and "what should I eat this week" but not "where do I stand". Today shows a next-window one-liner derived from `upcoming-plan`; the athlete never sees accumulated hydration debt, never sees the fueling periodization state that drives their targets, and never sees the energy horizon that explains why tomorrow's targets look the way they do. That state is most useful on a phone, mid-day, away from a desk — which is the surface that currently lacks it.

`nutrition-plan-on-plan-tab` explicitly deferred this ("Full Strategy tab energy-horizon charts (optional later; not required)"). This change picks it up.

## What Changes

- Add a Strategy segment to Plan → Nutrition alongside the existing Plan content, so Plan → Nutrition mirrors web's two-tab shape.
- Surface fuel state and hydration standing from `GET /api/nutrition/strategy`: current fuel state, hydration debt, hydration status, and the advice copy tied to it.
- Offer hydration reset via `POST /api/nutrition/hydration-reset` when the server sets the flush prompt.
- Render a multi-day energy horizon from `GET /api/nutrition/extended-wave`, sized and simplified for phone rather than ported from the web chart.
- Show the active fueling feed from `GET /api/nutrition/active-feed` — what to eat now, in context of the current or imminent session.
- Gate the whole segment on nutrition tracking being enabled, consistent with the existing Plan → Nutrition behaviour.

## Capabilities

### New Capabilities

- `nutrition-strategy`: Fuel state, hydration standing, active fueling feed, and multi-day energy horizon on mobile.

### Modified Capabilities

- `plan-tab`: Plan → Nutrition gains a Strategy / Plan split rather than being plan-only.

## Impact

- **Mobile:** new `src/features/nutrition` strategy API + hooks and mappers; strategy segment UI; a compact horizon chart reusing the existing chart primitives in `src/features/activity/charts`; segment control inside Plan → Nutrition.
- **coach-wattz:** Confirm Bearer + `nutrition:read` / `nutrition:write` on `strategy`, `extended-wave`, `active-feed`, and `hydration-reset`. Confirm the `extended-wave` payload size for a 7-day horizon — this is the largest nutrition response mobile would fetch, and it may need a narrower default range or a mobile-shaped variant.
- **Sequencing:** Last of the four. It is the least load-bearing — reading, not doing — and it benefits from `nutrition-log-item-edit` landing first so the state it displays is trustworthy.
- **Related backlog (coach-wattz, not this repo):** `server/api/nutrition/estimate-photo.post.ts` has no web caller; photo meal logging exists only on mobile. Worth a web-side change so the capability is not mobile-only.
