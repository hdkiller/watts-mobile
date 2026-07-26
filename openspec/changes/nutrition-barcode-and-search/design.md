# Design: Barcode Scanner & Nutrition Database Search

## Architecture Overview

```
+-----------------------------------------------------------------------+
|                           LogMealSheet                                |
|  +-----------------------------------------------------------------+  |
|  | Mode Selector: [ Quick Log | Search Database | Photo Log ]      |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  [ Search Database Mode ]                                             |
|   +-------------------------------------------------------------+     |
|   | Search input (debounced 300ms)  [ Camera Barcode Icon ]     |     |
|   +-------------------------------------------------------------+     |
|   | Results List: FoodItemResult cards                          |     |
|   |   - Name, Brand, Calories, Carbs/Protein/Fat pills          |     |
|   +-------------------------------------------------------------+     |
|                                                                       |
|  [ Portion Calculator (Modal / Inline Card) ]                         |
|   - Gram weight input (default: serving_size_g or 100g)              |
|   - Live calculated calories & macros: macro = (per100g * g) / 100    |
|   - [ Apply to Meal ] -> pre-fills LogMealSheet form & saves          |
+-----------------------------------------------------------------------+
        |                                       |
        v                                       v
+-----------------------+              +-----------------------+
|  BarcodeScannerModal  |              |    api.ts Client      |
|  (expo-camera)        | ------------>| searchFoodDatabase()  |
|  - Viewfinder overlay |              | lookupFoodBarcode()   |
|  - Haptics            |              +-----------------------+
+-----------------------+                         |
                                                  v
                                       +-----------------------+
                                       |   coach-wattz API     |
                                       | /api/nutrition/search |
                                       | /api/nutrition/barcode|
                                       +-----------------------+
```

## Detailed Component Specifications

### 1. Data Types (`src/features/nutrition/api.ts`)
```ts
export interface FoodItemResult {
  name: string;
  brand?: string;
  barcode?: string;
  serving_size_g?: number;
  serving_description?: string;
  nutrients_per_100g: {
    calories_kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g?: number;
    sugar_g?: number;
    sodium_mg?: number;
  };
}
```

### 2. Barcode Camera Scanner (`src/features/nutrition/BarcodeScannerModal.tsx`)
- Standard modal overlay over camera view.
- Permission state managed via `useCameraPermissions()`.
- Fallback permission screen with explanation and retry button.
- Lock ref to prevent multiple barcode events firing simultaneously while lookup API is pending.
- Play `hapticSuccess()` on successful lookup, `hapticError()` on missing barcode.

### 3. Food Database Search & Portion Calculator (`LogMealSheet.tsx`)
- Debounced search state (300ms delay).
- Quick portion calculator modal or expandable card when an item is selected from Search or Barcode Scan.
- Math formula:
  `scaledMacro = (nutrients_per_100g * grams) / 100`
- Prefill `NutritionQuickLogForm`:
  - `name`: `${item.brand ? `${item.brand} ` : ''}${item.name}`
  - `calories`: `${calculatedCalories}`
  - `protein`: `${calculatedProtein}`
  - `carbs`: `${calculatedCarbs}`
  - `fat`: `${calculatedFat}`
