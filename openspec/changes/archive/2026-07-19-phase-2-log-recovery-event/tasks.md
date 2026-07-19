## 1. API + taxonomy

- [x] 1.1 Add `src/features/recovery` types matching journey POST/PATCH body and recovery-context list items
- [x] 1.2 Encode web-parity what-happened → `category` / `eventType` map (+ severity presets)
- [x] 1.3 Implement fetch active context, create, update, delete helpers via Bearer client

## 2. Log UI

- [x] 2.1 Split Log into wellness section + recovery section (or stack route for create/edit)
- [x] 2.2 Active-today chips/list with read-only imported vs editable manual
- [x] 2.3 Create form: options, severity, time presets, description, save
- [x] 2.4 Edit + delete with confirm for deletable journey events
- [x] 2.5 Loading / error / success states

## 3. Today affordance

- [x] 3.1 Add secondary Log event control near recovery strip
- [x] 3.2 Deep-link/navigate into recovery create without crowding primary CTAs

## 4. Verify + docs

- [x] 4.1 Unit tests for taxonomy map + payload builders
- [x] 4.2 Typecheck; manual smoke create → appear in active context → edit/delete
- [x] 4.3 Update product-baseline / implementation-plan checkboxes for recovery events
