# Hallmark audit · Coach dictation / media chrome

- **Wave:** B
- **Pri:** P1
- **Route/file:** UI usage in `src/features/coach/CoachChat.tsx` (logic in `dictation.ts` / `useCoachDictation` — not visual)
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal
- **Design system:** docs/DESIGN.md
- **Stamp:** none (covered under [12-coach-chat.md](./12-coach-chat.md))

## Coverage note

Composer, attach sheet, pending thumbnails, tool/approval chrome, and stamp debt are already punched in **12-coach-chat**. This file only records dictation/media-specific deltas.

## Critical

_(none unique)_

## Major

- **Tell:** `design-system drift` — recording affordance uses raw `bg-red-500` / white glyph hex  
  **Where:** `CoachChat.tsx` ~613–638 (`bg-red-500`; recording tint `'#ffffff'`)  
  **Severity:** major  
  **Fix:** Use `bg-danger` / `Colors.danger` + `text-text-primary` (or ink-on-danger if contrast requires a tokenized on-danger ink) — no raw red-500 / `#ffffff`.

## Minor

- **Tell:** Empty-composer mic fills brand, competing with Send as dual primary  
  **Where:** ~613–618 (`composerEmpty ? 'bg-brand' : …`)  
  **Severity:** minor  
  **Fix:** Keep mic as outline/secondary until recording; reserve brand fill for Send (and recording → danger).

## Notes (already in 12-coach-chat)

- Attach sheet hand-rolled rows, attachment remove hit target, upload overlay spinner, emoji mic/stop fallbacks, Resume/Retry bypass `Button`.
- Composer controls are 44pt (`h-11 w-11`) — good.
- Inline dictate/transcribe spinner is an allowed in-place wait.

**Counts:** 0 critical · 1 major · 1 minor _(unique to dictation/media; do not double-count 12-coach-chat)_
