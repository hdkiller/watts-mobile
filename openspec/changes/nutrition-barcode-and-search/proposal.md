## Why

Athletes logging meals in Coach Watts mobile currently rely on manual macro entry or AI photo estimation. Adding camera barcode scanning and global food database search gives athletes an instant, precise way to look up branded foods and packaged items by scanning a barcode or searching by name, reducing logging friction.

## What Changes

- Add typed food database search and barcode lookup client functions in `src/features/nutrition/api.ts` connecting to `GET /api/nutrition/search` and `GET /api/nutrition/barcode/{barcode}`.
- Create `BarcodeScannerModal.tsx` utilizing `expo-camera` with permissions handling, viewfinder overlay, haptic feedback (`hapticSuccess`), and error recovery when barcodes are not found.
- Introduce a "Search Database" tab / mode in `LogMealSheet.tsx` alongside "Quick Log" and "Photo Log".
- Implement a debounced search bar with loading states, empty result states, and barcode scan trigger.
- Add an interactive **Portion Calculator** component/view that dynamically scales macros based on gram weight or serving count before populating `LogMealSheet` quick-log fields.

## Capabilities

### New Capabilities
- `nutrition-barcode-scanner`: Camera-based barcode scanner sheet (`BarcodeScannerModal`) using `expo-camera` with permission fallback, viewfinder, and API integration.
- `nutrition-database-search`: Global food search and portion calculation UI inside `LogMealSheet` for querying food items, adjusting gram portion size, and populating meal log entries.

### Modified Capabilities
- `nutrition-quick-log`: Expand `LogMealSheet` with mode switching ("Quick Log", "Search Database", "Photo Log") and pre-filling quick-log form fields from food search or barcode scan results.

## Impact

- **Mobile UI:** `src/features/nutrition/LogMealSheet.tsx`, `src/features/nutrition/BarcodeScannerModal.tsx` (new), `src/features/nutrition/PortionCalculatorSheet.tsx` or inline section.
- **API Client:** `src/features/nutrition/api.ts` (added `searchFoodDatabase`, `lookupFoodBarcode`, `FoodItemResult`).
- **Dependencies:** Add `expo-camera` dependency.
- **APIs (backend):** `GET /api/nutrition/search`, `GET /api/nutrition/barcode/{barcode}`, `GET /api/nutrition/item/{key}`.
