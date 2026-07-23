# Hallmark audit · Connected Apps

- **Wave:** D
- **Pri:** P1
- **Route/file:** `app/(app)/connected-apps.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Clear phone-vs-server pipes story with web handoff CTAs. Loading uses spinner-in-card; status dots use emerald/amber; Health Sync row repeats More’s icon circle; no stamp.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(app)/connected-apps.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp referencing `docs/DESIGN.md`.

- **Tell** — `spinner instead of skeleton`
  - **Where** — ~L193–197 (and header small spinner ~L188–190)
  - **Severity** — major
  - **Fix** — List skeleton for curated provider rows; keep tiny inline spinner only for background refetch.

- **Tell** — `design-system drift` (emerald/amber dots)
  - **Where** — `StatusDot` ~L48–56
  - **Severity** — major
  - **Fix** — `bg-success` / `bg-modify` / muted semantic tokens.

## Minor

- **Tell** — `decorative icon noise`
  - **Where** — Health Sync row circle ~L171–173
  - **Severity** — minor
  - **Fix** — Text + chevron only (status already in detail).

- **Tell** — one-off compact action buttons
  - **Where** — `ProviderRow` ~L91–100
  - **Severity** — minor
  - **Fix** — Align with brand text link or a shared compact `Button` pattern if one exists.

## Count

0 critical · 3 major · 2 minor

## What works

Honest intro copy; error path offers web + Try again via `Button`; Manage-all brand link; section headers match type scale; Health Sync deep link.
