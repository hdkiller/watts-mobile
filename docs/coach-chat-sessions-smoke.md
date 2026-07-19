# Coach sessions + media — device smoke

Manual checklist after deploying coach-wattz Bearer upload + a mobile **dev client rebuilt with** `expo-image-picker` linked (see [native-modules.md](./native-modules.md)).

**Prerequisite:** `ExpoImagePicker` present in `ios/Podfile.lock` (or Android equivalent) and a fresh `pnpm ios` / `pnpm android` install. If Coach crashes with `Cannot find native module 'ExponentImagePicker'`, rebuild — do not debug chat JS first.

1. **Idle > 15 minutes** — leave Coach, wait 15+ minutes (or age `lastMessageAt` on latest room), reopen Coach → new empty room / starters.
2. **Reuse** — send a message, leave Coach, return within 15 minutes → same room.
3. **Room list** — tap title → switch to an older room → messages load; **New** creates a fresh room.
4. **Deep link** — open `coachwatts://chat/<roomId>` → that room is active; bad id → notice + session policy.
5. **Photo meal log** — Log → **Log with photo** (or Coach → Photo) → capture/attach → send → Coach replies / nutrition confirmation; approve if prompted.
6. **Read-only** — open a legacy read-only room if available → composer disabled + New chat CTA.
7. **Permissions denied** — deny camera/library → text chat still works; error copy explains limitation.
