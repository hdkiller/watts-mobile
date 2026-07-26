# nutrition-barcode-and-search Specification

## Requirements

### Requirement: Global Food Database Search
The system SHALL let athletes search the global food database by text query via `GET /api/nutrition/search?q={query}&limit={limit}` with Bearer `nutrition:read`.

#### Scenario: Successful food search
- **WHEN** the user types a search query in the Log Meal database search tab
- **THEN** matching food items with brand, calories, and macro breakdown per 100g are displayed

#### Scenario: Empty search results
- **WHEN** no food items match the search query
- **THEN** an empty state is displayed prompting the user to check spelling or try scanning a barcode

### Requirement: Barcode Camera Scanning
The system SHALL support camera barcode scanning via `BarcodeScannerModal` using `expo-camera` to lookup items via `GET /api/nutrition/barcode/{barcode}`.

#### Scenario: Permission request & fallback
- **WHEN** the user opens the barcode scanner
- **THEN** camera permission status is checked, and a permission request or fallback UI is presented if permission is not granted

#### Scenario: Valid barcode detection
- **WHEN** a valid barcode is scanned and matched in the backend database
- **THEN** the app triggers success haptics (`hapticSuccess`) and presents the item in the portion calculator

#### Scenario: Barcode not found
- **WHEN** a scanned barcode is not present in the global food database
- **THEN** error haptics (`hapticError`) fire and a clear notification is displayed offering manual search

### Requirement: Portion Calculator & Form Population
The system SHALL provide a portion calculator to dynamically scale `nutrients_per_100g` by gram weight (`macro = (nutrients_per_100g * grams) / 100`) and pre-fill `LogMealSheet` quick-log fields.

#### Scenario: Portion scaling
- **WHEN** the user adjusts the gram weight or serving size
- **THEN** total calories and macro values update live and populate the meal entry form for immediate save
