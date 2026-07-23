# Hallmark audit · Subscription & Billing

- **Wave:** A
- **Pri:** P1
- **Route/file:** `app/(app)/(tabs)/more/settings/subscription.tsx` (+ logic under `src/features/subscriptions/` — no separate UI components)
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Hosted/self-hosted gating and restore honesty are product-correct, but the screen invents a non-system `border-warning` token, hand-rolls purchase/restore CTAs, and uses spinners instead of skeletons for status/offerings. `src/features/subscriptions/` is API/hooks only — all UI lives in this route file.

## Critical

- **Tell** — `raw palette / non-semantic token` (`design-system drift`)
  - **Where** — `app/(app)/(tabs)/more/settings/subscription.tsx` ~L123 (`border-warning`)
  - **Severity** — critical
  - **Fix** — Use a DESIGN.md token (e.g. `border-modify` / `border-danger/40` + tint) — `warning` is not in the semantic palette / Tailwind theme.

## Major

- **Tell** — `missing system reference`
  - **Where** — `subscription.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp with `design-system: docs/DESIGN.md`.

- **Tell** — `spinner instead of skeleton`
  - **Where** — `subscription.tsx` ~L99, L147
  - **Severity** — major
  - **Fix** — Skeleton the Current access card and plan package rows while summary/offerings load.

- **Tell** — `design-system drift` (one-off buttons)
  - **Where** — `subscription.tsx` ~L113–115, L149–157, L166–168
  - **Severity** — major
  - **Fix** — Route purchase / restore / manage actions through shared `Button` variants (no hand-rolled bordered Pressables).

- **Tell** — `dishonest empty/error` (brand/copy)
  - **Where** — `subscription.tsx` ~L132 (“Watt Mind store purchases…”)
  - **Severity** — major
  - **Fix** — Say “Coach Watts” / store purchases — do not ship the “Watt Mind” misnomer.

## Minor

- **Tell** — `design-system drift` (type scale)
  - **Where** — `subscription.tsx` ~L105 (`text-3xl font-bold`), ~L145 (`text-xl font-bold`)
  - **Severity** — minor
  - **Fix** — Align to type scale (`text-2xl font-semibold` for primary title; section headers per DESIGN).

- **Tell** — `dishonest empty/error` (error chrome)
  - **Where** — `subscription.tsx` ~L100–102
  - **Severity** — minor
  - **Fix** — Tinted error card + Retry for summary load failure.

- **Tell** — `design-system drift` (hit targets)
  - **Where** — `subscription.tsx` ~L113–115, L174–175
  - **Severity** — minor
  - **Fix** — Add `hitSlop={8}` (or shared Button) on Manage / Terms / Privacy pressables.

## Count

1 critical · 4 major · 3 minor

## What works

Semantic `bg-surface` / `bg-card` / `text-text-*` elsewhere; empty offerings copy is honest; collision and acquisition-suppressed states explain themselves; legal links brand-colored; no decorative icon noise; restore messaging distinguishes canceled/pending/not found.
