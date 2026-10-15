---
description: "Task list for Pathfinder Character Resource Tracker feature implementation"
---

# Tasks: Pathfinder Character Resource Tracker

**Input**: Design documents from `/specs/001-character-resource-tracker/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`  
**Constitution Check**: 100% Client-Side (Vite `base: './'`), Offline-First, Mobile-First (≥360px, touch targets ≥44x44px), Strict TypeScript, Pure domain logic tested with Vitest.  

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`, `[US4]`)
- Exact file paths and constraints included in all tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, bundler configuration, and testing harness

- [X] T001 Initialize Vite project with React and TypeScript in `package.json`, `tsconfig.json` (`strict: true`), and `vite.config.ts` configured with `base: './'` for GitHub Pages static hosting
- [X] T002 [P] Configure Tailwind CSS and PostCSS in `tailwind.config.js`, `postcss.config.js`, and `src/index.css` with mobile responsive tokens and touch target utilities (`min-h-[44px] min-w-[44px]`)
- [X] T003 [P] Configure Vitest test runner and DOM testing environment in `vitest.config.ts`
- [X] T004 [P] Create HTML entry point in `index.html` with mobile viewport meta tag (`width=device-width, initial-scale=1.0, maximum-scale=1.0`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain types, storage layer, and root layout before user stories

**⚠️ CRITICAL**: Must be completed before user story implementation begins

- [X] T005 [P] Define core domain types and interfaces in `src/domain/types.ts` verbatim from `data-model.md` (`CharacterProfile`, `HealthRecord`, `ResourceCategory`, `UsageMode`, `ResourceItem`, `CharacterState`, `CharacterBackupPayload`)
- [X] T006 [P] Implement synchronous local storage wrapper in `src/storage/local-storage.ts` using key `'pathfinder_character_v1'` to persist and hydrate `CharacterState`
- [X] T007 [P] Implement client-side image processing utility in `src/storage/avatar-storage.ts` using native `FileReader` and `<canvas>` to resize to max 300x300 and compress to WebP/JPEG under 250KB
- [X] T008 Implement root application layout and React DOM mount in `src/main.tsx` and `src/App.tsx`

**Checkpoint**: Foundation ready - user story implementation can begin

---

## Phase 3: User Story 1 - Gestión de Perfil y Monitor de Salud en Tiempo Real (Priority: P1) 🎯 MVP

**Goal**: Permitir registrar/editar nombre (1..60 chars), nivel (1..20), clase (1..60), avatar local, y monitorear PG (máximos >= 1, actuales 0..maxHp, temporales >= 0) con controles rápidos de daño y curación.

**Independent Test**: Configurar personaje con 30 PG máximos y 5 PG temporales; aplicar 10 de daño rápido (verificando que temporales pasen a 0 y actuales a 25); aplicar curación de 10 (verificando que actuales lleguen a 30 sin desbordar).

### Tests for User Story 1 ⚠️

- [X] T009 [P] [US1] Unit tests in `tests/domain/health.test.ts` for pure calculation functions: `applyDamage` (absorbing `min(tempHp, amount)` first, remainder from `currentHp` bounded at 0) and `applyHealing` (capping strictly at `maxHp`)

### Implementation for User Story 1

- [X] T010 [P] [US1] Implement pure health calculation functions in `src/domain/health.ts` (`applyDamage`, `applyHealing`, `setTempHp`, `updateMaxHp`) adhering to constraints in `data-model.md`
- [X] T011 [P] [US1] Implement `CharacterHeader` component in `src/components/CharacterHeader.tsx` displaying name, level, class, and avatar with local file input and canvas thumbnail preview
- [X] T012 [US1] Implement `HealthTracker` component in `src/components/HealthTracker.tsx` displaying `currentHp`, `maxHp`, `tempHp` and quick action buttons (-1, -5, -10 daño; +1, +5, +10 curación) with touch hitboxes >= 44x44px
- [X] T013 [US1] Integrate `CharacterHeader` and `HealthTracker` into `src/App.tsx` with automatic persistence via `src/storage/local-storage.ts`

**Checkpoint**: User Story 1 fully functional and testable independently (MVP ready)

---

## Phase 4: User Story 2 - Rastreo Dinámico de Conjuros y Rasgos de Uso Limitado o Ilimitado (Priority: P2)

**Goal**: Registrar conjuros y rasgos/dotes clasificados como limitados (contador de usos máximos >= 1 y disponibles 0..maxUses) o ilimitados (pasivos/a voluntad), con botón rápido de gasto (-1) / recuperación (+1) y descripción desplegable de reglas (hasta 4000 caracteres).

**Independent Test**: Crear conjuro con 4 usos máximos y dote pasiva ilimitada; presionar botón rápido de gasto (-1) y comprobar 3/4; verificar que el elemento ilimitado no muestre botones de consumo pero despliegue su descripción de reglas.

### Tests for User Story 2 ⚠️

- [X] T014 [P] [US2] Unit tests in `tests/domain/resources.test.ts` for `spendResource` (`availableUses = max(0, availableUses - 1)`) and `restoreResource` (`availableUses = min(maxUses, availableUses + 1)`)

### Implementation for User Story 2

- [X] T015 [P] [US2] Implement pure resource mutation functions in `src/domain/resources.ts` (`spendResource`, `restoreResource`, `createResource`, `deleteResource`)
- [X] T016 [P] [US2] Implement `ResourceCard` component in `src/components/ResourceCard.tsx` with category badge ('spell' | 'feat_trait'), usage counters, spend/recover buttons (min 44x44px), and collapsible drawer for description (up to 4000 chars)
- [X] T017 [US2] Implement `ResourceList` component in `src/components/ResourceList.tsx` with category filter tabs (Todos, Conjuros, Rasgos/Dotes) and modal/form for adding a new resource
- [X] T018 [US2] Integrate `ResourceList` into `src/App.tsx` and connect resource updates to local storage persistence

**Checkpoint**: User Stories 1 AND 2 functional and testable independently

---

## Phase 5: User Story 3 - Descanso Largo para Restauración Masiva de Recursos (Priority: P3)

**Goal**: Proveer acción rápida de Descanso Largo que restablezca todos los recursos limitados a su valor máximo, restaure los PG actuales al valor de PG máximos y limpie los PG temporales a 0 tras confirmación modal.

**Independent Test**: Configurar recursos gastados (ej. 1/4 y 0/3), PG actuales reducidos (ej. 10/30) y 5 PG temporales; activar Descanso Largo y confirmar; validar que todos los recursos regresen a 4/4 y 3/3, los PG actuales a 30 y los PG temporales se reinicien a 0.

### Tests for User Story 3 ⚠️

- [X] T019 [P] [US3] Unit tests in `tests/domain/resources.test.ts` verifying that `applyLongRest` resets every limited resource's `availableUses` to `maxUses`, resets `currentHp` to `maxHp`, and clears `tempHp` to 0

### Implementation for User Story 3

- [X] T020 [P] [US3] Implement `applyLongRest` pure domain function in `src/domain/resources.ts` returning updated `CharacterState`
- [X] T021 [US3] Implement `LongRestModal` component in `src/components/LongRestModal.tsx` with accessible confirmation dialog and buttons (>= 44x44px)
- [X] T022 [US3] Connect Descanso Largo action button in `src/App.tsx` to trigger modal, execute `applyLongRest`, persist state, and display immediate visual feedback

**Checkpoint**: User Stories 1, 2, and 3 functional and testable independently

---

## Phase 6: User Story 4 - Respaldo, Portabilidad y Recuperación de Ficha (Priority: P4)

**Goal**: Permitir exportar la ficha completa en archivo JSON descargable e importar un archivo JSON existente con validación de esquema e integridad.

**Independent Test**: Exportar ficha completa a JSON; limpiar datos; reimportar el archivo y constatar recuperación idéntica del 100% de los datos (perfil, avatar, PG y recursos). Intentar importar JSON corrupto y constatar rechazo seguro.

### Tests for User Story 4 ⚠️

- [X] T023 [P] [US4] Unit tests in `tests/domain/backup.test.ts` validating `validateBackupPayload` with valid payloads and corrupt/tampered payloads (missing fields, invalid enums, out-of-bounds HP)

### Implementation for User Story 4

- [X] T024 [P] [US4] Implement JSON serialization and validation logic in `src/domain/backup.ts` conforming strictly to `contracts/character-backup.schema.json` with `schemaVersion: '1.0.0'`
- [X] T025 [US4] Implement `BackupModal` component in `src/components/BackupModal.tsx` with buttons to export JSON (triggering file download) and import JSON (via FileReader with error notification and overwrite confirmation)
- [X] T026 [US4] Wire backup actions into `src/App.tsx` header/navigation bar to allow switching or restoring characters seamlessly

**Checkpoint**: All user stories fully functional and testable independently

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Ergonomics audit, production build validation, and end-to-end verification

- [X] T027 [P] Mobile ergonomics and touch target audit across all interactive elements verifying `min-h-[44px] min-w-[44px]` and responsive layout at 360px viewport width in `src/index.css` and components
- [X] T028 [P] Verify GitHub Pages build compatibility by executing `npm run build` and checking relative asset paths in `dist/index.html`
- [X] T029 Execute full quickstart validation scenarios defined in `specs/001-character-resource-tracker/quickstart.md` and verify all tests pass via `npm run test:run`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - executes immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion - Independent MVP
- **User Story 2 (Phase 4)**: Depends on Foundational completion and `src/domain/types.ts`
- **User Story 3 (Phase 5)**: Depends on US1 and US2 components (resets resources and health tempHp)
- **User Story 4 (Phase 6)**: Depends on complete `CharacterState` structure from US1 and US2
- **Polish (Phase 7)**: Depends on completion of all user story phases

### User Story Dependencies

```text
[Phase 1: Setup] ──► [Phase 2: Foundational]
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
    [Phase 3: US1 (HP/Profile)]  [Phase 4: US2 (Spells/Feats)]
             │                           │
             └─────────────┬─────────────┘
                           ▼
                 [Phase 5: US3 (Long Rest)]
                           │
                           ▼
                 [Phase 6: US4 (JSON Backup)]
                           │
                           ▼
                 [Phase 7: Polish & Validation]
```

---

## Parallel Opportunities

- **Setup Phase**: T002, T003, T004 can execute in parallel after T001
- **Foundational Phase**: T005, T006, T007 can execute in parallel
- **US1 Tests & Impl**: T009 (tests), T010 (domain math), and T011 (header component) can execute in parallel
- **US2 Tests & Impl**: T014 (tests), T015 (domain resources), and T016 (resource card) can execute in parallel
- **US3 Tests & Impl**: T019 (tests) and T020 (domain long rest) can execute in parallel
- **US4 Tests & Impl**: T023 (tests) and T024 (domain backup validator) can execute in parallel
- **Polish Phase**: T027 and T028 can execute in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001 - T004)
2. Complete Phase 2: Foundational (T005 - T008)
3. Complete Phase 3: User Story 1 (T009 - T013)
4. **STOP and VALIDATE**: Verify character profile and health tracking work end-to-end on a 360px mobile view with `npm run test:run`. Deploy/demo viable MVP!

### Incremental Delivery

1. Foundation + US1 (MVP): Basic character sheet with live HP tracker
2. Add US2: Full tracking of Spells, Feats, and Traits with daily usage counters
3. Add US3: One-click Long Rest restoration
4. Add US4: Full JSON backup and restore capabilities across devices
5. Polish: Mobile ergonomics, build checks, and quickstart end-to-end verification
