# Hallmark audit · Nutrition settings

- **Wave:** D
- **Pri:** P1
- **Route/file:** `app/(app)/(tabs)/more/settings/nutrition.tsx` + `src/features/nutrition/NutritionSettingsForm.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none (route + form)

## Summary

Large web-parity form is mostly semantic and uses shared `Button` for save. Route shell still full-screen-spins and hand-rolls Retry; neither file stamps the design system.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `nutrition.tsx` + `NutritionSettingsForm.tsx` (no stamps)
  - **Severity** — major
  - **Fix** — Stamp route (and form if treated as designed-as-app surface) with `docs/DESIGN.md`.

- **Tell** — `spinner instead of skeleton`
  - **Where** — `nutrition.tsx` ~L27–30
  - **Severity** — major
  - **Fix** — Skeleton approximating SectionCards / sticky save row.

- **Tell** — one-off button style
  - **Where** — `nutrition.tsx` ~L36–44 (hand-rolled `bg-brand-action` Retry `Pressable`)
  - **Severity** — major
  - **Fix** — Use shared `Button` primary (loading via `isFetching`).

- **Tell** — `dishonest empty/error` (error not tinted; uses primary text)
  - **Where** — `nutrition.tsx` ~L31–45
  - **Severity** — major
  - **Fix** — `border-danger/40 bg-tint-error` + friendly copy + `Button` Retry.

## Minor

- **Tell** — success color inconsistency
  - **Where** — `NutritionSettingsForm.tsx` ~L349–350 (`text-brand` success)
  - **Severity** — minor
  - **Fix** — Prefer `text-green-400` / `text-success` for confirmations per DESIGN States.

- **Tell** — first-viewport density
  - **Where** — form opens with save bar + many SectionCards
  - **Severity** — minor
  - **Fix** — Keep tracking toggle + one primary section above the fold; collapse advanced blocks.

## Count

0 critical · 4 major · 2 minor

## What works

Form tokens (`bg-card`, borders, chips with `text-ink` on brand); inline save spinner OK; dirty/unsaved honesty; web-scope disclaimer; multi-select chips stay readable.
