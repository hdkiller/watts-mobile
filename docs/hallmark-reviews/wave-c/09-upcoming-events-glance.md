# Hallmark audit · Upcoming events glance
- **Wave:** C
- **Date:** 2026-07-24
- **Design system:** docs/DESIGN.md
- **Stamp:** missing
- **Surface:** `src/features/today/UpcomingEventsGlance.tsx`

## Verdict
Lean, semantic, companion-appropriate teaser (date tile + hairline rows + See all). Needs stamp and stronger press/a11y consistency with stamped list surfaces.

## Critical
_None._

## Major

1. **Tell:** missing system reference  
   **Where:** `src/features/today/UpcomingEventsGlance.tsx:1`  
   **Severity:** major  
   **Fix:** Stamp glance + DESIGN.md.

2. **Tell:** press / a11y drift  
   **Where:** `src/features/today/UpcomingEventsGlance.tsx:46-51` (`EventGlanceRow` — no `hitSlop`; opacity-only press)  
   **Severity:** major  
   **Fix:** `AnimatedPressable` + `hitSlop={8}`; keep role/label (already present).

## Minor

1. **Tell:** chevron glyph improvisation  
   **Where:** `src/features/today/UpcomingEventsGlance.tsx:77` (`›` text)  
   **Severity:** minor  
   **Fix:** Use `AppSymbol` `chevron.right` like `NutritionGlance` for cross-platform consistency.

2. **Tell:** press feedback via `active:opacity-*`  
   **Where:** `src/features/today/UpcomingEventsGlance.tsx:27`, `49`  
   **Severity:** minor  
   **Fix:** Drop when moving to `AnimatedPressable`.

## Notes (not findings)
- Tokens are semantic throughout — no raw zinc/hex.
- Returns `null` when empty/error — appropriate for an embedded glance (avoids empty dashboard chrome on Today).
- Section kicker matches DESIGN (`tracking-widest`).
- Date tile uses card/border neutrals — correct.

## Count
**0 critical · 2 major · 2 minor**
