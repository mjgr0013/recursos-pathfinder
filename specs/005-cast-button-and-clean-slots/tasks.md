---
description: "Task list for Cast Button Action & Clean Slot Controls feature implementation"
---

# Tasks: Cast Button Action & Clean Slot Controls

**Input**: Design documents from `/specs/005-cast-button-and-clean-slots/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`  
**Constitution Check**: 100% Client-Side (Vite `base: './'`), Offline-First, Mobile-First (≥360px, touch targets ≥44x44px), Strict TypeScript, Pure domain logic tested with Vitest.  

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Exact file paths and constraints included in all tasks

---

## Phase 1: User Story 1 - Botón de Acción "Lanzar" en Conjuros y Rasgos (Priority: P1) 🎯 MVP

**Goal**: Eliminar los botones aritméticos (+/-) en las tarjetas de recursos y añadir un botón táctil destacado "Lanzar" (o "Usar") que consuma el uso/espacio en un solo toque y se deshabilite cuando no queden disponibles.

**Independent Test**: Observar la tarjeta de un conjuro de nivel 1 con 3/3 espacios; verificar que muestre el botón "✨ Lanzar" y no haya botones +/-; pulsar "Lanzar" y comprobar que descuente 1 espacio a 2/3. Gastar todos los espacios y verificar que el botón pase a estar deshabilitado ("Sin espacios").

### Implementation for User Story 1

- [X] T001 [P] [US1] Update `ResourceCard` in `src/components/ResourceCard.tsx` to remove the +/- buttons and replace them with a prominent tactile button: "✨ Lanzar" for leveled spells (púrpura, disabled as "Sin espacios" when slot count is 0), "⚡ Usar" for limited traits (ámbar, disabled as "Sin usos" when count is 0), and "✨ Lanzar" for cantrips
- [X] T002 [US1] Ensure `ResourceCard` action handlers in `src/components/ResourceCard.tsx` cleanly invoke `onSpendSpellSlot` for leveled spells and `onSpend` for limited traits with tactile scale feedback (`active:scale-95`)

**Checkpoint**: User Story 1 fully functional and testable independently (MVP ready)

---

## Phase 2: User Story 2 - Simplificación de Espacios de Magia en Recursos Diarios (Priority: P2)

**Goal**: Eliminar los botones redundantes de sumar y restar (+/-) de las filas de espacios de magia en el panel de recursos diarios, conservando únicamente la visualización y el botón de edición (✏️).

**Independent Test**: Abrir la sección de magia en recursos diarios; comprobar que cada nivel activo solo muestre el nivel, el contador `disp / max` y el botón `✏️`, sin ningún botón de -1 o +1.

### Implementation for User Story 2

- [X] T003 [P] [US2] Update `DailyResourcesTracker` in `src/components/DailyResourcesTracker.tsx` to remove the `-1` and `+1` buttons from each dynamic spell slot row, retaining strictly the level label, `available / max` counter, and the edit button `✏️`

**Checkpoint**: User Stories 1 AND 2 functional and testable independently

---

## Phase 3: User Story 3 - Cierre Automático del Modal al Crear Ficha Nueva en Blanco (Priority: P3)

**Goal**: Cerrar automáticamente el modal de datos al confirmar "Crear ficha nueva en blanco", devolviendo al usuario a la página principal de inmediato.

**Independent Test**: Abrir modal de datos, pulsar "Crear ficha nueva en blanco" y confirmar ("Sí, reiniciar"); verificar que el modal se cierre automáticamente y la página principal muestre la ficha en blanco reiniciada con la notificación toast.

### Implementation for User Story 3

- [X] T004 [P] [US3] Update `BackupModal` in `src/components/BackupModal.tsx` so confirming "Sí, reiniciar" immediately executes `onResetCharacter()` and `onClose()`, returning the user to the main page

**Checkpoint**: All user stories fully functional and testable independently

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Ergonomics audit, production build validation, and end-to-end verification

- [X] T005 [P] Mobile ergonomics audit verifying all "Lanzar" buttons meet `min-h-[44px] min-w-[44px]` at 360px viewport width in `src/index.css` and components
- [X] T006 [P] Verify GitHub Pages build compatibility by executing `npm run build` and checking clean static bundle generation in `dist/`
- [X] T007 Execute quickstart verification scenarios defined in `specs/005-cast-button-and-clean-slots/quickstart.md` and verify all tests pass via `npm run test:run`

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Story 1 (Phase 1)**: Can execute immediately on `ResourceCard.tsx` - Independent MVP
- **User Story 2 (Phase 2)**: Can execute in parallel on `DailyResourcesTracker.tsx`
- **User Story 3 (Phase 3)**: Can execute in parallel on `BackupModal.tsx`
- **Polish (Phase 4)**: Depends on completion of all user story phases

### Parallel Opportunities

- T001/T002 (`ResourceCard.tsx`), T003 (`DailyResourcesTracker.tsx`), and T004 (`BackupModal.tsx`) affect different files and can be executed in parallel.
- T005 and T006 can execute in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: User Story 1 (T001 - T002)
2. **STOP and VALIDATE**: Verify that spells and traits have the direct "Lanzar" / "Usar" action button without +/-. Viable MVP!

### Incremental Delivery

1. US1 (MVP): Botón directo "Lanzar" en tarjetas de recursos
2. Add US2: Filas de espacios de magia simplificadas sin botones redundantes +/-
3. Add US3: Cierre automático del modal al reiniciar ficha
4. Polish: Auditoría táctil de 44px, build estático y validación end-to-end
