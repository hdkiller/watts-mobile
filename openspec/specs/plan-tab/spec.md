# plan-tab Specification

## Purpose
TBD - created by archiving change plan-tab-shell. Update Purpose after archive.
## Requirements
### Requirement: Plan tab in primary navigation
The soft-activated authenticated shell SHALL include a bottom tab labeled Plan, positioned between Today and Log.

#### Scenario: Soft-activated user sees Plan tab
- **WHEN** a valid session exists and soft activation is complete
- **THEN** the user can open the Plan tab from primary navigation

### Requirement: Training and Nutrition segments
The Plan tab SHALL present a segmented control with Training and Nutrition. Selecting a segment SHALL show that segment’s content without leaving the Plan tab.

#### Scenario: Switch to Nutrition
- **WHEN** the athlete selects Nutrition on Plan
- **THEN** the Nutrition segment content is visible and Training content is hidden

#### Scenario: Switch to Training
- **WHEN** the athlete selects Training on Plan
- **THEN** the Training segment content is visible

### Requirement: Active plan Training read shell
When an active training plan exists, the Training segment SHALL show at least: plan title (or equivalent identity), current phase or week context when available, and the current week’s planned workouts as a list. Session rows MAY show duration/TSS and structured-workout mini-charts when data exists. Tapping a session SHALL open the existing planned detail route.

#### Scenario: Active plan with week sessions
- **WHEN** the athlete opens Plan → Training and an active plan with upcoming sessions exists
- **THEN** they see plan identity/context and can open a listed planned workout detail

### Requirement: Empty plan Training state
When no active training plan exists, the Training segment SHALL show an honest empty state and a Create plan action entry point (full generator flow may be completed by a follow-on change).

#### Scenario: No active plan
- **WHEN** the athlete opens Plan → Training and there is no active plan
- **THEN** they see empty copy and a Create plan affordance

### Requirement: Nutrition segment placeholder until plan change
Until the nutrition-plan-on-plan-tab capability is implemented, the Nutrition segment SHALL show an honest placeholder (and MAY offer Open web to `/nutrition`) rather than fabricating a meal plan grid.

#### Scenario: Nutrition not yet implemented
- **WHEN** the athlete opens Plan → Nutrition before nutrition plan UI ships
- **THEN** they see honest placeholder copy and MUST NOT see a fake weekly meal grid

### Requirement: Upcoming remains separate
The Plan tab MUST NOT replace More → Upcoming. Upcoming planned list SHALL remain reachable from More.

#### Scenario: Upcoming still on More
- **WHEN** the soft-activated athlete opens More
- **THEN** Upcoming planned remains available as a separate destination from Plan

### Requirement: Web leftovers escape
The Plan Training shell SHALL expose Open web (or equivalent) for plan templates, public share, or Intervals publish rather than implying those actions are available natively in this change.

#### Scenario: Templates stay web
- **WHEN** the athlete needs plan templates or share/publish
- **THEN** the app directs them to Open web rather than a native template library

### Requirement: Create plan wires generator
When no active plan exists, the Plan → Training Create plan affordance SHALL open the shared plan generator flow and on successful activate SHALL return to Plan → Training showing the active plan.

#### Scenario: Create completes
- **WHEN** the athlete finishes generate → preview → activate from Plan
- **THEN** Plan → Training shows the new active plan without requiring the activation wizard

### Requirement: Generation progress on Training
While block/week/structure generation jobs started from Plan are in progress, the Training segment SHALL show honest in-progress UI and refresh when jobs complete or fail.

#### Scenario: Job failure visible
- **WHEN** a generate job fails
- **THEN** the athlete sees failure copy and can retry or Open web

### Requirement: Structure edit entry points
When an active plan exists, Plan → Training SHALL expose entry points to tune the selected week, move a workout, and edit blocks without requiring Open web for those actions.

#### Scenario: Edit week from Training
- **WHEN** the athlete opens week tune from Plan → Training
- **THEN** they can view and save week targets in-app

### Requirement: Adjust plan entry point
When an active plan exists, Plan → Training SHALL expose an Adjust plan (or equivalent) entry that reaches adapt, replan (when available), abandon, and start new actions.

#### Scenario: Active plan shows adjust entry
- **WHEN** the athlete opens Plan → Training with an active plan
- **THEN** they can open the adjust/adapt action set without leaving the Plan tab

