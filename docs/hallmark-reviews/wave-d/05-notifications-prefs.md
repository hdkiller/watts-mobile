# Hallmark audit · Notifications prefs

- **Wave:** D
- **Pri:** P2
- **Route/file:** `app/(app)/(tabs)/more/settings/notifications.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Clear channel toggles with OS-denied callout and shared `Button` on retry. Loading uses a banned full-screen spinner; OS banner uses raw amber hex/classes instead of semantic/modify tokens; no stamp.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(app)/(tabs)/more/settings/notifications.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp referencing `docs/DESIGN.md`.

- **Tell** — `spinner instead of skeleton`
  - **Where** — `app/(app)/(tabs)/more/settings/notifications.tsx` ~L149–153
  - **Severity** — major
  - **Fix** — Skeleton matching the preference card + toggles; keep spinner only on in-flight save if needed.

- **Tell** — `design-system drift` (raw amber / hex)
  - **Where** — ~L173–185 (`border-amber-500`, `bg-amber-500/10`, `text-amber-400`, `tintColor="#f59e0b"`)
  - **Severity** — major
  - **Fix** — Map warning to `Colors.modify` / semantic tint (or documented warning tokens), not raw amber/hex.

## Minor

- **Tell** — duplicate title chrome
  - **Where** — Stack “Notification settings” + in-page “Push notifications” ~L117–166
  - **Severity** — minor
  - **Fix** — One title surface; let the other be muted intro only.

- **Tell** — `dishonest empty/error` (load error chrome)
  - **Where** — ~L154–160
  - **Severity** — minor
  - **Fix** — Wrap in `border-danger/40 bg-tint-error` even when using shared `Button`.

## Count

0 critical · 3 major · 2 minor

## What works

Preference rows are text-first; Switches use brand track; haptics on toggle success/error; `Button` for retry; OS-denied path offers Open Device Settings.
