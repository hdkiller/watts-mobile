# activity-workout-map Specification

## Purpose
TBD - created by archiving change activity-workout-map. Update Purpose after archive.
## Requirements
### Requirement: Interactive route map on activity detail
The completed activity detail screen SHALL show an interactive map with the workout route when GPS coordinates are available. The map MUST support pan and zoom and MUST fit the camera to the route bounds when the route first loads. The system MUST NOT require opening web solely to see the route.

#### Scenario: GPS route present
- **WHEN** the activity has usable coordinates from streams `latlng` or a decoded `summaryPolyline`
- **THEN** the activity detail screen shows an interactive map with the route polyline fitted to the route bounds

#### Scenario: No GPS route
- **WHEN** streams and summary provide no usable coordinates
- **THEN** the activity detail screen omits the map section rather than inventing a route

### Requirement: Start and end markers
When a route is shown, the map SHALL mark the start and end of the route distinctly (green start and red end, matching web embedded map convention).

#### Scenario: Markers on route
- **WHEN** a route with at least two coordinate points is displayed
- **THEN** the map shows a start marker at the first point and an end marker at the last point

### Requirement: Coordinate source preference
The client SHALL prefer `streams.latlng` from `GET /api/workouts/:id/streams` (Bearer `workout:read`) and SHALL fall back to decoding `summaryPolyline` from the workout summary when `latlng` is absent or empty. The summary fetch MUST remain streams-off (`includeStreams=false`).

#### Scenario: Streams latlng used
- **WHEN** the streams response includes a non-empty `latlng` series
- **THEN** the map draws the route from those coordinates

#### Scenario: Polyline fallback
- **WHEN** `latlng` is unavailable but the workout summary includes `summaryPolyline`
- **THEN** the map draws the route from the decoded polyline

### Requirement: Map loading and reuse of streams fetch
Map data loading SHALL reuse the activity streams query used for charts when that query is already present, rather than issuing a duplicate streams request solely for the map. While coordinates are resolving, the map region MAY show a loading placeholder.

#### Scenario: Shared streams query
- **WHEN** activity detail loads charts and the map
- **THEN** both consume the same streams query/cache for coordinate and optional metric series

### Requirement: Explorer depth stays on web
The companion MUST NOT port the full map analysis explorer (lap/interval/climb/zone highlight chrome, chart scrub sync, or GPX export). Activity detail SHALL continue to offer Open web for that deeper map analysis.

#### Scenario: Open web for explorer
- **WHEN** the user chooses Open web from activity detail
- **THEN** the system browser can reach the instance workout (or map) URL for explorer depth beyond the in-app lite map

