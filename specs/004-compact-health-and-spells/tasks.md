---
description: "Task list for Compact Health Controls & Non-Caster Magic Toggle feature implementation"
---

# Tasks: Compact Health Controls & Non-Caster Magic Toggle

**Input**: Design documents from `/specs/004-compact-health-and-spells/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`  
**Constitution Check**: 100% Client-Side (Vite `base: './'`), Offline-First, Mobile-First (≥360px, touch targets ≥44x44px), Strict TypeScript, Pure domain logic tested with Vitest.  

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Exact file paths and constraints included in all tasks

---

## Phase 1: Setup & Foundational

**Purpose**: Pure domain calculation functions and unit tests for strictly derived spell levels

- [X] T001 Implement `getHighestSpellLevel` in `src/domain/spells.ts` returning strictly the highest `spellLevel` among spells with `spellLevel >= 1`, or 0 if none exist
- [X] T002 [P] Unit tests in `tests/domain/spells.test.ts` for `getHighestSpellLevel` verifying returns 0 for empty list, 0 for level 0 cantrips only, and exact highest level for leveled spells

---

## Phase 2: User Story 1 - Espacios de Magia Derivados Estrictamente del Conjuro más Alto (Priority: P1) 🎯 MVP

**Goal**: Mostrar 0 espacios de magia por defecto para no lanzadores y derivar los niveles visibles (1 a N) de forma estricta a partir del conjuro más alto registrado, eliminando cualquier botón de adición manual.

**Independent Test**: Iniciar ficha sin conjuros y verificar que no aparece ningún espacio de magia. Crear un conjuro de nivel 2 y constatar que aparezcan exactamente los niveles 1 y 2. Eliminarlo y comprobar que la magia vuelva a desaparecer.

### Implementation for User Story 1

- [X] T003 [P] [US1] Update `DailyResourcesTracker` in `src/components/DailyResourcesTracker.tsx` to use `getHighestSpellLevel`: if 0, render 0 spell slots (omit magic section completely); if N >= 1, render strictly levels 1 to N; remove all manual level adding buttons (`+ Niv {N+1}`)
- [X] T004 [US1] Connect dynamic spell visibility and slot updates cleanly in `src/App.tsx` ensuring reactive expansion when spells are added and contraction when removed

**Checkpoint**: User Story 1 fully functional and testable independently (MVP ready)

---

## Phase 3: User Story 2 - Modo Compacto y Plegado del Monitor de Salud (Priority: P2)

**Goal**: Permitir plegar la botonera de combate del monitor de salud en un solo toque, dejando visible únicamente los PG actuales y máximos para ahorrar espacio fuera de combate.

**Independent Test**: En el monitor de salud, pulsar "▲ Plegar"; verificar que se oculten todos los botones de daño y curación rápida, dejando visible únicamente la barra con `actual / max PG`. Pulsar "▼ Controles" y comprobar que reaparece la botonera completa.

### Implementation for User Story 2

- [X] T005 [P] [US2] Implement compact collapsible view in `src/components/HealthTracker.tsx` with a toggle button `▲ Plegar / ▼ Controles` (hitbox >= 44x44px) that displays only current/max HP and hides the damage/healing button bar
- [X] T006 [US2] Add LocalStorage persistence for `isCompact` view preference under `pathfinder_ui_prefs_v1` in `src/components/HealthTracker.tsx`

**Checkpoint**: User Stories 1 AND 2 functional and testable independently

---

## Phase 4: User Story 3 - Preselección Contextual de Categoría al Añadir Recursos (Priority: P3)

**Goal**: Preseleccionar automáticamente la categoría "Conjuro" al pulsar "+ Añadir" desde la pestaña de Conjuros, y "Rasgo / Dote" desde la pestaña de Rasgos.

**Independent Test**: Seleccionar pestaña "Conjuros" y pulsar "+ Añadir", verificar que el formulario se abre con "Conjuro" seleccionado. Seleccionar pestaña "Rasgos" y pulsar "+ Añadir", verificar que se abre con "Rasgo / Dote" seleccionado.

### Implementation for User Story 3

- [X] T007 [P] [US3] Update `ResourceList` in `src/components/ResourceList.tsx` to preselect `category: 'spell'` when the active tab is "Conjuros" and `category: 'feat_trait'` when the active tab is "Rasgos/Dotes"

**Checkpoint**: All user stories fully functional and testable independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Ergonomics audit, production build validation, and end-to-end verification

- [X] T008 [P] Mobile ergonomics audit verifying all toggle buttons meet `min-h-[44px] min-w-[44px]` at 360px viewport width in `src/index.css` and components
- [X] T009 [P] Verify GitHub Pages build compatibility by executing `npm run build` and checking clean static bundle generation in `dist/`
- [X] T010 Execute quickstart verification scenarios defined in `specs/004-compact-health-and-spells/quickstart.md` and verify all tests pass via `npm run test:run`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup & Foundational (Phase 1)**: No dependencies - executes immediately
- **User Story 1 (Phase 2)**: Depends on Phase 1 completion - Independent MVP
- **User Story 2 (Phase 3)**: Independent component (`HealthTracker`) - can run in parallel with US1
- **User Story 3 (Phase 4)**: Independent component (`ResourceList`) - can run in parallel with US1/US2
- **Polish (Phase 5)**: Depends on completion of all user story phases

### Parallel Opportunities

- T001 and T002 can execute in parallel
- T003 (DailyResourcesTracker), T005 (HealthTracker), and T007 (ResourceList) affect different files and can be developed in parallel
- T008 and T009 can execute in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup & Tests (T001 - T002)
2. Complete Phase 2: User Story 1 (T003 - T004)
3. **STOP and VALIDATE**: Verify that characters without spells have 0 magic slots shown and manual buttons are gone. Viable MVP!

### Incremental Delivery

1. Foundation + US1 (MVP): Espacios de magia estrictamente derivados del conjuro más alto (cero magia para no lanzadores)
2. Add US2: Modo compacto plegable de salud fuera de combate
3. Add US3: Preselección contextual en el modal de creación de recursos
4. Polish: Auditoría táctil de 44px, build estático y validación end-to-end
