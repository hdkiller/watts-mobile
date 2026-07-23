# Hallmark audit · Room list sheet
- **Wave:** B
- **Pri:** P1
- **Route/file:** `src/features/coach/RoomListSheet.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Critical

_(none)_

## Major

- **Tell:** `missing system reference` (no Hallmark stamp)  
  **Where:** `RoomListSheet.tsx` L1  
  **Severity:** major  
  **Fix:** Stamp after pass.

- **Tell:** `spinner instead of skeleton`  
  **Where:** ~86–89  
  **Severity:** major  
  **Fix:** List-row skeletons (`ListSkeleton` / 3 room cards).

- **Tell:** Hand-rolled “New chat” primary bypasses shared `Button`  
  **Where:** ~79–84  
  **Severity:** major  
  **Fix:** `<Button label="New chat" onPress={onCreate} />`.

- **Tell:** `hit target undersized` (Refresh / Done text links, no `hitSlop`)  
  **Where:** ~70–75  
  **Severity:** major  
  **Fix:** `hitSlop={8}` (or higher) on both; prefer `AnimatedPressable`.

## Minor

- **Tell:** Prefer `AnimatedPressable` for Refresh / Done / room rows / New chat  
  **Where:** ~70–84, ~102–121  
  **Severity:** minor  
  **Fix:** Animated press throughout.

- **Tell:** Room cards are fine; active state brand border OK — avoid adding more chrome  
  **Where:** ~102–121  
  **Severity:** minor  
  **Fix:** Keep as-is once press feedback is standardized.

## Notes

- Empty state (“No chats yet.”) is honest.
- Preview fallbacks (“Conversation” / “No messages yet”) avoid dishonest empties — good.
- Brand CTA correctly uses `text-ink` on `bg-brand`.
- Overall a disciplined list sheet once spinner/Button/hitSlop are fixed.

**Counts:** 0 critical · 4 major · 2 minor
