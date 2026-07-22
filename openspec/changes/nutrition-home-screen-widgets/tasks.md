## 1. Snapshot Contract and Mapping

- [ ] 1.1 Define the versioned nutrition widget snapshot/state types with only approved privacy-safe fields
- [ ] 1.2 Implement the pure day/next-window snapshot mapper, including clamped progress, fuel-state labels, stale detection, and past-window fallback
- [ ] 1.3 Add unit tests for ready, empty, no-target, disabled, signed-out, stale, over-target, and past-fueling-window snapshots

## 2. Widget Components

- [ ] 2.1 Implement `NutritionTodayWidget` small and medium layouts with ready and non-data states
- [ ] 2.2 Implement `HydrationWidget` small layout and its in-app Add water handoff
- [ ] 2.3 Implement `NextFuelWidget` medium layout with future-window and Daily fuel fallback states
- [ ] 2.4 Implement `PhotoFoodLogWidget` small action layout with a camera-first app handoff
- [ ] 2.5 Add semantic accessibility labels and verify light, dark, and tinted rendering without color-only meaning

## 3. App Sync and Privacy Lifecycle

- [ ] 3.1 Implement a no-op-safe iOS `syncNutritionWidgets` coordinator that updates the three data snapshots and Photo Food Log eligibility state
- [ ] 3.2 Trigger widget sync after successful nutrition/next-window reads and after refreshed totals from meal or hydration writes
- [ ] 3.3 Refresh from usable cached data on app foreground without replacing a valid snapshot after an API error
- [ ] 3.4 Clear all nutrition widget values before sign-out, account/instance switch, and nutrition-tracking disable completes
- [ ] 3.5 Add integration tests for sync triggers, partial query arrival, failed refresh preservation, and identity-boundary clearing

## 4. Navigation Handoffs

- [ ] 4.1 Add canonical deep-link resolution for nutrition summary, meal log, camera-first photo log, and hydration quick-add query parameters
- [ ] 4.2 Add a one-shot `action=photo` intent that mounts Log Meal, launches camera once, and safely handles permission denial or cancellation
- [ ] 4.3 Wire whole-widget URLs and stable widget interaction targets to the canonical Log destinations
- [ ] 4.4 Add resolver/flow tests for warm start, cold start, camera cancel/denial, logged-out return path, and disabled-tracking handoffs
- [ ] 4.5 Update `docs/deep-links.md` with the new nutrition widget paths and manual scheme smoke commands

## 5. Native Configuration and Verification

- [ ] 5.1 Add the four widget declarations and supported families to the existing `expo-widgets` configuration without changing the current bundle/App Group identifiers
- [ ] 5.2 Run TypeScript, unit, lint/format, and OpenSpec strict validation checks
- [ ] 5.3 Rebuild the iOS native project per `docs/native-modules.md` and verify app plus widget-extension signing/App Group access in Xcode
- [ ] 5.4 Exercise all widget states and tap destinations on the smallest supported iPhone in light, dark, tinted, larger Dynamic Type, cold-start, signed-out, camera-denied, and camera-cancelled conditions
- [ ] 5.5 Record the native build/store impact in the distribution task/log documents when a TestFlight-capable binary is produced

## 6. Follow-up Decisions

- [ ] 6.1 Decide and record whether v1 needs an explicit Hide nutrition on widgets privacy preference
- [ ] 6.2 Create separate follow-up scope for Android widget parity after validating the Expo Android widget path
- [ ] 6.3 Evaluate accessory Lock Screen families only after home-screen widget usage and feedback are available
