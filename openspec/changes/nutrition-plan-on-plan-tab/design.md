## Context

Web `/nutrition` Plan tab is `WeeklyPlanDashboard`: week nav, generate draft, grocery, day drawer with window meals and done/skip/replace. Mobile already has nutrition settings, quick-log, Today fuel glances, and Athlete nutrition glance. Plan tab shell reserved a Nutrition segment placeholder.

## Goals / Non-Goals

**Goals:**

- Weekly plan grid/list with training context when available.
- Generate draft for week; regenerate missing / single day.
- Per-meal complete, skip, unlock, replace (recommendation pick).
- Grocery list aggregation with range (24h/48h/7d or API-supported set).
- Tracking-off and empty honesty.

**Non-Goals:**

- Full Strategy tab energy-horizon charts (optional later; not required).
- Nutrition settings editor (already Settings → Nutrition).
- Replacing Log quick-log/photo flows.
- Training generator work.

## Decisions

### 1. Plan Nutrition ≠ Log

Log stays capture. Plan Nutrition is the planning board. Deep links from grocery/meal actions may open Log only when logging intake for a window.

### 2. Day drawer as sheet

Match web day drawer with a bottom sheet: windows, meal actions, regenerate missing — navigate to existing nutrition day/log routes when a full day timeline already exists.

### 3. Grocery requires locked meals

Empty grocery when no planned meals is honest (“Generate a meal plan first”), not an error.

### 4. Replace uses existing recommendation modal pattern

Port the minimum of web MealRecommendationModal: pick → lock meal API.

## Risks / Trade-offs

- [Risk] Large weekly payloads on mobile → Mitigation: week-scoped fetch; skeleton rows.
- [Risk] Tracking off confusion → Mitigation: CTA to Settings → Nutrition, hide generate.
- [Risk] Duplicate fuel UI with Today → Mitigation: Today stays decision/glance; Plan owns week plan.

## Migration Plan

Replace placeholder in Plan Nutrition segment. No data migration.

## Open Questions

- Whether Strategy-tab feeds (active fueling / multi-day energy) are in v1 or deferred — default defer.
- Exact grocery range enum supported by API.
