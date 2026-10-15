---
description: "Task list for Shared Spell Slots by Level & Documentation URL feature implementation"
---

# Tasks: Shared Spell Slots by Level & Documentation URL

**Input**: Design documents from `/specs/002-shared-spell-slots/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`  
**Constitution Check**: 100% Client-Side (Vite `base: './'`), Offline-First, Mobile-First (≥360px, touch targets ≥44x44px), Strict TypeScript, Pure domain logic tested with Vitest.  

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`, `[US4]`)
- Exact file paths and constraints included in all tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Update core domain types and storage defaults for spell slots and URLs

- [X] T001 Update domain types in `src/domain/types.ts` to include `SpellSlotLevel` (level 1..9, max >= 0, available 0..max), `SpellSlotsMap`, and update `ResourceItem` with `spellLevel?: number | null` (0..9) and `url?: string` (up to 500 chars)
- [X] T002 [P] Update local storage default character state and hydration in `src/storage/local-storage.ts` to initialize 9 spell slot levels (1..9 with level 1 defaulting to 3 max slots and others to 0)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pure domain calculations for spell slots before UI components

**⚠️ CRITICAL**: Must be completed before user story implementation begins

- [X] T003 [P] Unit tests in `tests/domain/spells.test.ts` for pure calculation functions: `spendSpellSlot` (`available = max(0, available - 1)`), `restoreSpellSlot` (`available = min(max, available + 1)`), `updateSpellSlotMax` (`max = max(0, newMax)`, `available = min(max, available)`), and `createDefaultSpellSlots`
- [X] T004 Implement pure spell slot calculation functions in `src/domain/spells.ts` (`spendSpellSlot`, `restoreSpellSlot`, `updateSpellSlotMax`, `createDefaultSpellSlots`)

**Checkpoint**: Foundation ready - user story implementation can begin

---

## Phase 3: User Story 1 - Gestión Centralizada de Espacios de Conjuro por Nivel (Priority: P1) 🎯 MVP

**Goal**: Configurar y consultar espacios de conjuros máximos y disponibles para cada nivel del 1 al 9 desde un panel dedicado con botones táctiles ergonómicos (≥44x44px).

**Independent Test**: Configurar 4 espacios de nivel 1 y 2 de nivel 2; gastar 1 espacio de nivel 1 en el panel global y verificar que pasa a 3/4 mientras nivel 2 se mantiene en 2/2.

### Implementation for User Story 1

- [X] T005 [P] [US1] Implement `SpellSlotsTracker` component in `src/components/SpellSlotsTracker.tsx` displaying levels 1 to 9 with touch buttons (+1, -1, editar max >= 44x44px) and collapsible view
- [X] T006 [US1] Integrate `SpellSlotsTracker` into `src/App.tsx` and connect slot state mutations to `src/storage/local-storage.ts`

**Checkpoint**: User Story 1 fully functional and testable independently (MVP ready)

---

## Phase 4: User Story 2 - Asignación de Nivel y Consumo Compartido en Conjuros (Priority: P2)

**Goal**: Al crear/editar un conjuro exigir nivel (0 a 9) y compartir los espacios de ese nivel entre todos los conjuros del mismo nivel, tratando el nivel 0 como ilimitado.

**Independent Test**: Crear 2 conjuros de nivel 1 ("Proyectil Mágico" y "Escudo") con 3 espacios globales de nivel 1; gastar 1 uso en "Proyectil Mágico" y constatar que ambas tarjetas muestren 2/3 disponibles.

### Tests for User Story 2 ⚠️

- [X] T007 [P] [US2] Unit tests in `tests/domain/resources.test.ts` verifying that creating a spell with `spellLevel: 0` sets `usageMode: 'unlimited'`, while `spellLevel >= 1` delegates availability to `spellSlots[spellLevel]`

### Implementation for User Story 2

- [X] T008 [P] [US2] Update `createResource` in `src/domain/resources.ts` to accept `spellLevel?: number | null` (0..9) and enforce `usageMode = 'unlimited'` when `spellLevel === 0`
- [X] T009 [P] [US2] Update `ResourceCard` component in `src/components/ResourceCard.tsx` to display spell level badge ("Nivel X" o "Truco") and bind spend/restore buttons for spells to the shared `spellSlots[spellLevel]` reserve
- [X] T010 [US2] Update `ResourceList` modal in `src/components/ResourceList.tsx` to require spell level selection (0..9) when category is 'spell', hiding individual max uses for spells
- [X] T011 [US2] Integrate shared spell slot consumption events from `ResourceList` into `src/App.tsx`

**Checkpoint**: User Stories 1 AND 2 functional and testable independently

---

## Phase 5: User Story 3 - Enlace a Documentación Oficial (URL) en Conjuros y Rasgos (Priority: P3)

**Goal**: Permitir registrar una URL opcional en cada recurso y abrir el compendio externo en una nueva pestaña segura (`target="_blank" rel="noopener noreferrer"`).

**Independent Test**: Crear un recurso con URL `https://aonprd.com/SpellDisplay.aspx?ItemName=Fireball`; verificar que aparece el botón "🌐 Ver reglas" y abre la página en una nueva pestaña.

### Tests for User Story 3 ⚠️

- [X] T012 [P] [US3] Unit tests in `tests/domain/resources.test.ts` verifying validation and storage of valid `http://` / `https://` URLs (up to 500 chars) and rejection of invalid formats

### Implementation for User Story 3

- [X] T013 [P] [US3] Add `url` input field with client-side pattern validation in `src/components/ResourceList.tsx`
- [X] T014 [P] [US3] Add external documentation link button with `rel="noopener noreferrer"` and touch hitbox >= 44x44px in `src/components/ResourceCard.tsx`

**Checkpoint**: User Stories 1, 2, and 3 functional and testable independently

---

## Phase 6: User Story 4 - Restauración en Descanso Largo y Portabilidad en Esquema JSON (Priority: P4)

**Goal**: El Descanso Largo restaura todos los espacios de conjuros de niveles 1 al 9 a sus valores máximos, y el esquema JSON se actualiza a v1.1.0 con soporte retrocompatible para fichas v1.0.0.

**Independent Test**: Gastar espacios de niveles 1 y 2, ejecutar Descanso Largo y verificar que vuelvan a su máximo. Exportar ficha a JSON v1.1.0 e importar una ficha antigua v1.0.0 verificando migración limpia.

### Tests for User Story 4 ⚠️

- [X] T015 [P] [US4] Unit tests in `tests/domain/resources.test.ts` verifying that `applyLongRest` restores all spell slot levels (1..9) to `max`
- [X] T016 [P] [US4] Unit tests in `tests/domain/backup.test.ts` verifying validation of schema `1.1.0` with `spellSlots` and `url`, and automatic migration of legacy schema `1.0.0`

### Implementation for User Story 4

- [X] T017 [P] [US4] Update `applyLongRest` in `src/domain/resources.ts` to reset all `spellSlots[level].available = spellSlots[level].max` alongside health and limited feats
- [X] T018 [P] [US4] Update `createBackupPayload` and `validateBackupPayload` in `src/domain/backup.ts` to support schema `1.1.0` with normalization/migration for `1.0.0`
- [X] T019 [US4] Update `BackupModal` in `src/components/BackupModal.tsx` and `src/App.tsx` to handle imported states with migrated spell slots and URLs

**Checkpoint**: All user stories fully functional and testable independently

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Ergonomics audit, production build validation, and end-to-end verification

- [X] T020 [P] Mobile ergonomics and touch target audit verifying all spell slot buttons and URL links meet `min-h-[44px] min-w-[44px]` at 360px viewport width in `src/index.css` and components
- [X] T021 [P] Verify GitHub Pages build compatibility by executing `npm run build` and checking clean static bundle generation in `dist/`
- [X] T022 Execute quickstart verification scenarios defined in `specs/002-shared-spell-slots/quickstart.md` and verify all tests pass via `npm run test:run`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - executes immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion - Independent MVP
- **User Story 2 (Phase 4)**: Depends on US1 (requires slots state to bind spell consumption)
- **User Story 3 (Phase 5)**: Can proceed in parallel with US2 on `ResourceCard` / `ResourceList`
- **User Story 4 (Phase 6)**: Depends on US1 and US2 (restores slots and migrates backups)
- **Polish (Phase 7)**: Depends on completion of all user story phases

### User Story Dependencies

```text
[Phase 1: Setup] ──► [Phase 2: Foundational]
                           │
                           ▼
                 [Phase 3: US1 (Spell Slots Panel)]
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
    [Phase 4: US2 (Shared Spells)] [Phase 5: US3 (Doc URL)]
             │                           │
             └─────────────┬─────────────┘
                           ▼
                 [Phase 6: US4 (Long Rest & JSON v1.1)]
                           │
                           ▼
                 [Phase 7: Polish & Validation]
```

---

## Parallel Opportunities

- **Setup Phase**: T001 and T002 can execute in parallel
- **Foundational Phase**: T003 (tests) and T004 (spells domain module)
- **US1 & US2**: Component implementation can proceed incrementally
- **US3 & US4**: T012, T013, T014 (URL feature) and T015, T016 (Backup/Rest tests) can run in parallel
- **Polish Phase**: T020 and T021 can execute in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001 - T002)
2. Complete Phase 2: Foundational (T003 - T004)
3. Complete Phase 3: User Story 1 (T005 - T006)
4. **STOP and VALIDATE**: Test Spell Slots panel independently with `npm run test:run`. Viable MVP!

### Incremental Delivery

1. Foundation + US1 (MVP): Panel de espacios de conjuro por nivel (1 al 9)
2. Add US2: Vinculación de conjuros a espacios compartidos por nivel
3. Add US3: Enlaces a documentación oficial externa en tarjetas
4. Add US4: Descanso largo integral y esquema JSON v1.1.0 retrocompatible
5. Polish: Auditoría táctil de 44px, build estático y validación end-to-end
