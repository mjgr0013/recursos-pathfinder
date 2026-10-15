---
description: "Task list for Unified Daily Resources & Dynamic Spell Slots feature implementation"
---

# Tasks: Unified Daily Resources & Dynamic Spell Slots

**Input**: Design documents from `/specs/003-unified-daily-resources/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`  
**Constitution Check**: 100% Client-Side (Vite `base: './'`), Offline-First, Mobile-First (≥360px, touch targets ≥44x44px), Strict TypeScript, Pure domain logic tested with Vitest.  

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Exact file paths and constraints included in all tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Pure domain calculation functions for dynamic spell levels and trait max uses

- [X] T001 Implement `getMaxActiveSpellLevel` calculation in `src/domain/spells.ts` deriving the highest visible level (1..9) from registered spells and configured slot maximums
- [X] T002 [P] Implement `getLimitedTraits` and `updateResourceMaxUses` in `src/domain/resources.ts` ensuring `newMax >= 1` and clamping `availableUses = min(newMax, availableUses)`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Exhaustive unit tests for domain calculations in Vitest before UI development

**⚠️ CRITICAL**: Must be completed before user story implementation begins

- [X] T003 [P] Unit tests in `tests/domain/spells.test.ts` for `getMaxActiveSpellLevel` with empty lists, mixed spell levels (e.g. max level 3), and slot configurations
- [X] T004 [P] Unit tests in `tests/domain/resources.test.ts` for `getLimitedTraits` (filtering only limited traits) and `updateResourceMaxUses` (expanding and reducing max uses)

**Checkpoint**: Foundation ready - user story implementation can begin

---

## Phase 3: User Story 1 - Visualización Dinámica de Espacios de Conjuro según Nivel Activo (Priority: P1) 🎯 MVP

**Goal**: Renderizar dinámicamente los espacios de conjuros mostrando solo hasta el nivel más alto activo (ocultando niveles superiores innecesarios) y permitir desbloquear el siguiente nivel con un solo toque.

**Independent Test**: Configurar un personaje con conjuros hasta nivel 2; verificar que solo se rendericen los niveles 1 y 2. Pulsar `➕ Habilitar Nivel 3` o añadir un conjuro de nivel 3 y constatar que se expanda automáticamente a 3 niveles.

### Implementation for User Story 1

- [X] T005 [P] [US1] Implement dynamic spell level rendering in `src/components/DailyResourcesTracker.tsx` displaying only levels 1 through `maxActiveSpellLevel` with clean compact styling
- [X] T006 [US1] Add manual level expansion button (`➕ Habilitar Nivel {N+1}`) in `src/components/DailyResourcesTracker.tsx` allowing players to pre-configure slots for upcoming spell levels

**Checkpoint**: User Story 1 fully functional and testable independently (MVP ready)

---

## Phase 4: User Story 2 - Panel Unificado de Recursos Diarios (Espacios y Rasgos Limitados) (Priority: P2)

**Goal**: Agrupar en un único bloque visual superior ("Recursos Diarios") los espacios de conjuros dinámicos y la lista de rasgos con usos limitados diarios finitos, excluyendo los rasgos ilimitados.

**Independent Test**: Crear 1 conjuro de nivel 1 y 2 rasgos limitados ("Canalizar Energía" y "Furia Bárbara"); comprobar que ambos aparezcan juntos en el panel superior unificado con sus contadores respectivos y botones de consumo (-1/+1).

### Implementation for User Story 2

- [X] T007 [P] [US2] Implement the unified daily resources container component `DailyResourcesTracker` in `src/components/DailyResourcesTracker.tsx` grouping dynamic spell slots and limited traits side by side with touch targets >= 44x44px
- [X] T008 [US2] Replace detached `SpellSlotsTracker` with `DailyResourcesTracker` in `src/App.tsx`, wiring slot actions and trait consumption events to the unified dashboard

**Checkpoint**: User Stories 1 AND 2 functional and testable independently

---

## Phase 5: User Story 3 - Edición y Ajuste Rápido de Usos Máximos de Rasgos (Priority: P3)

**Goal**: Permitir la edición rápida de usos máximos para cualquier rasgo limitado desde el panel unificado y su tarjeta de catálogo, preservando los usos consumidos.

**Independent Test**: Tener un rasgo limitado con 2/4 usos; editar sus usos máximos a 5 y verificar que el contador se actualice a 2/5; ejecutar Descanso Largo y constatar que se recargue a 5/5.

### Implementation for User Story 3

- [X] T009 [P] [US3] Implement quick max uses edit dialog (`✏️`) for limited traits directly within `src/components/DailyResourcesTracker.tsx`
- [X] T010 [US3] Add quick edit max uses button to `ResourceCard` in `src/components/ResourceCard.tsx` and wire `onUpdateResourceMaxUses` handler in `src/App.tsx`

**Checkpoint**: All user stories fully functional and testable independently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Ergonomics audit, production build validation, and end-to-end verification

- [X] T011 [P] Mobile ergonomics audit across `DailyResourcesTracker` verifying no horizontal scroll and hitboxes >= 44x44px at 360px viewport width in `src/index.css` and components
- [X] T012 [P] Verify GitHub Pages build compatibility by executing `npm run build` and checking clean static bundle generation in `dist/`
- [X] T013 Execute quickstart verification scenarios defined in `specs/003-unified-daily-resources/quickstart.md` and verify all tests pass via `npm run test:run`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - executes immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion - Independent MVP
- **User Story 2 (Phase 4)**: Depends on US1 (embeds dynamic slots inside unified tracker)
- **User Story 3 (Phase 5)**: Depends on US2 (adds editing capabilities to unified tracker)
- **Polish (Phase 6)**: Depends on completion of all user story phases

### User Story Dependencies

```text
[Phase 1: Setup] ──► [Phase 2: Foundational]
                           │
                           ▼
                 [Phase 3: US1 (Dynamic Spell Levels)]
                           │
                           ▼
                 [Phase 4: US2 (Unified Daily Resources)]
                           │
                           ▼
                 [Phase 5: US3 (Trait Max Uses Editor)]
                           │
                           ▼
                 [Phase 6: Polish & Validation]
```

---

## Parallel Opportunities

- **Setup Phase**: T001 and T002 can execute in parallel
- **Foundational Phase**: T003 (tests spells) and T004 (tests resources) can execute in parallel
- **US1 & US2**: Component implementation can proceed incrementally
- **US3**: T009 and T010 can execute in parallel
- **Polish Phase**: T011 and T012 can execute in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001 - T002)
2. Complete Phase 2: Foundational (T003 - T004)
3. Complete Phase 3: User Story 1 (T005 - T006)
4. **STOP and VALIDATE**: Test dynamic spell slots with `npm run test:run`. Viable MVP!

### Incremental Delivery

1. Foundation + US1 (MVP): Espacios de conjuro dinámicos según el nivel más alto
2. Add US2: Panel unificado agrupando magia y rasgos de uso limitado en un solo bloque
3. Add US3: Ajuste rápido de usos máximos para rasgos finitos
4. Polish: Auditoría táctil de 44px, build estático y validación end-to-end
