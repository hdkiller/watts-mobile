# Hallmark audit · Coach tab / chat
- **Wave:** B
- **Pri:** P0
- **Route/file:** `app/(app)/(tabs)/coach.tsx` + `src/features/coach/CoachChat.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Critical

_(none)_

## Major

- **Tell:** `missing system reference` (no Hallmark stamp)  
  **Where:** `coach.tsx` / `CoachChat.tsx` L1  
  **Severity:** major  
  **Fix:** Stamp on `CoachChat.tsx` (composed surface).

- **Tell:** `design-system drift` (tool domain glyphs use raw hex tints; approval shell raw amber)  
  **Where:** `domainGlyph` ~65–77 (`#34d399`, `#fb7185`, `#a5b4fc`, …); approval card ~201 (`border-amber-700/60 bg-amber-950/40`, `text-amber-100`); icon tints `#94a3b8` / `#f87171` / `#ffffff` ~122–127, ~634  
  **Severity:** major  
  **Fix:** Drive accents from theme tokens (`brand`, `recovery`, `modify`, `danger`, `text-muted`); approval via `bg-modify/10 border-modify/40` or card + modify text.

- **Tell:** Hand-rolled Approve / Deny (and New / Resume / Retry) bypass shared `Button`  
  **Where:** Approve/Deny ~215–226; New ~454–459; recover ~534–549  
  **Severity:** major  
  **Fix:** Use `Button` / compact button variants for approvals; keep icon composer controls as sized pressables.

- **Tell:** Tool domain accent borders use raw emerald/rose/indigo/sky palette  
  **Where:** `domainAccentBorder` ~80–92  
  **Severity:** major  
  **Fix:** Single `border-border` + status tint, or semantic domain tokens if added to DESIGN.

## Minor

- **Tell:** Prefer `AnimatedPressable` for header room switcher, New, starters, attach sheet rows  
  **Where:** ~427–459, ~490–501, AttachSheet ~260–279  
  **Severity:** minor  
  **Fix:** Animated press + `hitSlop` on text-only controls.

- **Tell:** Empty starter prompt stack is card-heavy (OK for empty chat; watch density)  
  **Where:** ~488–502  
  **Severity:** minor  
  **Fix:** Keep 3 starters max; avoid nested chrome.

- **Tell:** Attachment remove control is 20×20 (hitSlop helps)  
  **Where:** ~566–574  
  **Severity:** minor  
  **Fix:** Confirm effective ≥44pt with hitSlop; enlarge hit box if needed.

- **Tell:** Inline tool `ActivityIndicator` OK for in-progress; upload overlay spinner OK  
  **Where:** `ToolProgressChip` ~101; upload ~562–564; send/dictate ~625–653  
  **Severity:** minor  
  **Fix:** No change required unless replacing with subtle pulse — not a full-screen spinner violation (`CoachChatSkeleton` covers cold load).

## Notes

- User bubbles correctly use `text-ink` on `bg-brand` (contrast rule).
- Cold load skeleton + honest empty copy are on-system.
- Composer controls are 44pt (`h-11 w-11`) — good hit targets.
- Route shell `coach.tsx` is thin and fine.

**Counts:** 0 critical · 4 major · 4 minor
