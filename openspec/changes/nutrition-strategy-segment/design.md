## Context

Web's Strategy tab composes four reads — `strategy`, `extended-wave`, `active-feed`, `upcoming-plan` — into a dense desktop dashboard: `MultiDayEnergyChart.vue` (365 lines), `LiveEnergyChart.vue`, `FuelStateHeader.vue`, `ActiveFuelingFeed.vue`, `UpcomingFuelingFeed.vue`, plus a hydration debt card with a reset action.

Mobile already consumes `upcoming-plan`, but only to extract a single next-window line via `pickNextFuelingWindow`. The three other endpoints are untouched. Mobile also already renders fuel state in places (`fuelState: 1 | 2 | 3` is carried in `NutritionDayTotals`) without ever explaining it.

The temptation is to port the web dashboard. That would be wrong: it is a wide multi-column layout with legend-heavy charts, built for a screen that mobile does not have.

## Goals / Non-Goals

**Goals:**

- The athlete can answer "where do I stand right now" — fuel state, hydration debt, what to eat next.
- A readable multi-day energy horizon on a phone screen.
- Hydration reset when the server prompts for a flush.
- Honest empty and tracking-off states.

**Non-Goals:**

- Porting the web charts or their legends verbatim.
- `simulate-impact` ("what if I eat this") — a separate interaction with its own design questions.
- Nutrition history and trend scores (`analyze-all`, `/api/scores/nutrition-trends`).
- Duplicating Today's fuel glance; Today stays the decision surface, Strategy is the explanation.

## Decisions

### 1. Strategy is a segment inside Plan → Nutrition, not a new tab

Plan → Nutrition already has a segment control at the Plan tab level (Training | Nutrition). Adding a second-level Strategy | Plan control inside the Nutrition segment mirrors web's tab shape without spending a bottom-tab slot or a new route.

### 2. Horizon chart is rebuilt for phone, not ported

Take the data, leave the chart. Reuse the existing `src/features/activity/charts` primitives and the `StrategySparkline` / `StructureProfile` precedent: one series, minimal axis furniture, targets implied by shading rather than a legend. If a faithful reading of the horizon needs more than a phone can show, the segment offers the existing web escape rather than a cramped copy.

### 3. Fuel state gets explained, not just displayed

Mobile already carries `fuelState` and shows it as a number-derived label. Strategy is where 1 / 2 / 3 becomes Eco / Steady / Performance with the reason behind it, reusing the `NutritionMacroExplainSheet` pattern already established for macro targets.

### 4. Hydration reset only when the server prompts it

Web gates the reset button on `strategy.showHydrationFlushPrompt`. Mobile does the same — an always-visible reset invites athletes to zero a debt they should be drinking off instead.

### 5. Four reads, independently degradable

The segment issues four independent queries. One failing must not blank the segment; each block shows its own honest error, matching web's `loadErrors` partial-load alert rather than an all-or-nothing screen.

## Risks / Trade-offs

- [Risk] `extended-wave` payload too large for mobile → Mitigation: confirm size in task 1.2; narrow the default horizon, or request a mobile-shaped range.
- [Risk] Chart illegible at phone width → Mitigation: decision 2; if a faithful read is impossible, link out rather than ship a misleading chart.
- [Risk] Duplicating Today's fuel glance → Mitigation: Today decides, Strategy explains; no new next-window widget.
- [Risk] Four reads on segment open costing battery and data → Mitigation: fetch on segment focus, not on Plan tab mount; standard query caching.
- [Risk] Athletes reading hydration debt as a target to zero out → Mitigation: keep the server's advice copy verbatim; do not invent encouragement.

## Migration Plan

Additive. The existing Plan → Nutrition content becomes the Plan segment; nothing is removed. Tracking-off behaviour is unchanged and now covers both segments.

## Open Questions

Resolved:
- Default horizon length on mobile — **3 days ahead** (matches web Strategy; keeps payload smaller than 7).
- `active-feed` vs Today’s next-window — Strategy shows recommendation / suggested intake / recent absorption; empty copy points to Today for the decision glance (no duplicated CTA).
- Fuel-state explanation — labels from strategy matrix; explain-sheet copy mirrors web WeeklyFuelingGrid (not inventing target math). Hydration advice uses server `hydrationAdvice` / flush prompt.
