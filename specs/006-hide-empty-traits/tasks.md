---
description: "Task list template for feature implementation"
---

# Tasks: Hide Empty Traits & Flexible Resource Editing

**Input**: Design documents from `/specs/006-hide-empty-traits/` (`spec.md`, `plan.md`, `data-model.md`, `contracts/ui-contracts.md`, `quickstart.md`)

**Prerequisites**: `plan.md`, `spec.md`, `data-model.md`, `contracts/ui-contracts.md`

**Constitution Principle V**: Todas las funciones de mutación y cálculo deben contar con pruebas unitarias exhaustivas en Vitest antes de su integración en la vista.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`, `[US4]`)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verificación de entorno de desarrollo y dependencias

- [X] T001 Verificar entorno de pruebas y compilación ejecutando `npm test` y `npx tsc --noEmit` en el repositorio

---

## Phase 2: Foundational (Blocking Domain Logic & Tests)

**Purpose**: Lógica pura de dominio y pruebas unitarias para actualización dual (actuales y máximos) requeridas por los modales y el estado

**⚠️ CRITICAL**: Base requerida para que las historias de usuario manipulen y persistan valores actuales y máximos de forma segura y tipada

- [X] T002 [P] Implementar pruebas unitarias para `updateSpellSlotValues` (validando invariantes `max >= 0`, `0 <= available <= max`) en `tests/domain/spells.test.ts`
- [X] T003 [P] Implementar pruebas unitarias para `updateResourceUses` (validando invariantes `maxUses >= 1`, `0 <= availableUses <= maxUses`) en `tests/domain/resources.test.ts`
- [X] T004 [P] Implementar función pura `updateSpellSlotValues(slots, level, rawAvailable, rawMax)` en `src/domain/spells.ts`
- [X] T005 [P] Implementar función pura `updateResourceUses(resources, id, rawAvailable, rawMax)` en `src/domain/resources.ts`
- [X] T006 Integrar handlers en `src/App.tsx` para coordinar `updateSpellSlotValues` y `updateResourceUses` con persistencia en LocalStorage y toasts descriptivos

**Checkpoint**: Dominio y tests unitarios en verde (`npm test`). Listos para implementar componentes de UI.

---

## Phase 3: User Story 1 - Ocultar información de rasgos en la cabecera cuando no hay rasgos con usos diarios (Priority: P1) 🎯 MVP

**Goal**: La cabecera del panel de Recursos Diarios oculta totalmente el contador y etiqueta de rasgos si no hay rasgos con usos limitados activos, mostrando únicamente magia, solo rasgos, ambos con separador `•`, o el mensaje neutral "Sin recursos diarios activos" si no hay recursos.

**Independent Test**: Cargar una ficha con solo conjuros activos (sin rasgos de uso limitado); verificar que la cabecera muestra únicamente `Magia: X/Y` sin `• Rasgos: 0/0`. Al no tener ni magia ni rasgos, verificar que muestra "Sin recursos diarios activos".

### Implementation for User Story 1

- [X] T007 [US1] Actualizar la lógica del subtítulo en `src/components/DailyResourcesTracker.tsx` para evaluar `hasActiveMagic` (`maxActiveLevel > 0`) y `hasActiveTraits` (`limitedTraits.length > 0`), renderizando la combinación exacta (`Magia: X/Y`, `Rasgos: A/B`, ambos con separador `•`, o "Sin recursos diarios activos")

**Checkpoint**: User Story 1 (MVP) completada. La cabecera nunca más muestra `Rasgos: 0/0` cuando no hay rasgos limitados.

---

## Phase 4: User Story 2 - Homogeneización de filas de recursos diarios (Solo Lápiz, sin botones -1/+1) (Priority: P2)

**Goal**: Limpiar las filas de rasgos en el panel de Recursos Diarios, eliminando los botones `-1` y `+1` y dejando únicamente el nombre del rasgo, el contador (`disponibles / máximos usos`) y el botón táctil de lápiz (`✏️`), logrando simetría total con las filas de espacios de magia.

**Independent Test**: Inspeccionar las filas de rasgos en el panel de Recursos Diarios con un personaje que tenga rasgos limitados activos. Verificar que no existe ningún botón `-1` ni `+1` y que el botón `✏️` está presente junto al contador de usos.

### Implementation for User Story 2

- [X] T008 [US2] Reestructurar las filas de rasgos en `src/components/DailyResourcesTracker.tsx`, eliminando los botones `-1` y `+1`, alineando el nombre del rasgo a la izquierda y el indicador numérico (`{available} / {max} usos`) junto al botón de lápiz (`✏️`) de 44x44px a la derecha

**Checkpoint**: User Story 2 completada. Las filas de rasgos y de magia comparten el mismo diseño despejado sin botones +/- en el panel diario.

---

## Phase 5: User Story 3 - Corrección y ajuste de valores actuales y máximos desde el modal de edición (Priority: P2)

**Goal**: Los modales de edición (abiertos mediante el lápiz `✏️`) para espacios de conjuros y rasgos permiten modificar tanto los valores actuales/disponibles como los valores máximos, permitiendo corregir errores de pulsación accidental sobre "Usar" o "Lanzar".

**Independent Test**: Gastar 1 espacio de magia de Nivel 1 o 1 uso de un rasgo. Pulsar el lápiz `✏️` de dicho recurso. Verificar que el modal presenta campos editables tanto para "Disponibles" como para "Máximos". Subir el valor disponible al valor previo y guardar; comprobar que el contador del recurso recupera su uso sin requerir Descanso Largo.

### Implementation for User Story 3

- [X] T009 [US3] Actualizar el modal de edición de espacios de conjuro en `src/components/DailyResourcesTracker.tsx` para incluir inputs para espacios disponibles y espacios máximos, invocando el handler de actualización dual al guardar
- [X] T010 [US3] Actualizar el modal de edición de rasgos en `src/components/DailyResourcesTracker.tsx` para incluir inputs para usos disponibles y usos máximos diarios, invocando el handler de actualización dual al guardar
- [X] T011 [US3] Actualizar el modal de edición de rasgos en `src/components/ResourceCard.tsx` y su propagación en `src/components/ResourceList.tsx` para soportar la edición dual de disponibles y máximos desde la tarjeta del catálogo
- [X] T012 [US3] Conectar las props de actualización dual en `src/App.tsx` para enlazar los componentes `DailyResourcesTracker`, `ResourceList` y `ResourceCard`

**Checkpoint**: User Story 3 completada. Los jugadores pueden rectificar inmediatamente cualquier gasto accidental editando el recurso con el lápiz.

---

## Phase 6: User Story 4 - Gasto de recursos centralizado en botones de acción directa en el catálogo (Priority: P3)

**Goal**: Centralizar el gasto de rasgos en el botón "Usar" (y conjuros en "Lanzar") en el catálogo de recursos con respuesta táctil y deshabilitación inmediata cuando los usos llegan a 0.

**Independent Test**: Localizar una tarjeta de rasgo en el catálogo con usos disponibles; pulsar "⚡ Usar" y comprobar que se descuenta 1 uso reactivamente en toda la aplicación. Al llegar a 0 usos, verificar que el botón se deshabilita impidiendo consumos negativos.

### Implementation for User Story 4

- [X] T013 [US4] Verificar y afinar en `src/components/ResourceCard.tsx` que las tarjetas de rasgos limitados posean el botón táctil accesible `⚡ Usar` (min 44px de alto), sin botones redundantes de +/- y con deshabilitación cuando `available === 0`

**Checkpoint**: User Story 4 completada. El flujo de juego queda unificado y limpio.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verificación final, regresiones, rendimiento y build de producción

- [X] T014 [P] Ejecutar la suite completa de pruebas unitarias con `npm test` verificando que todos los tests de dominio pasen en verde
- [X] T015 [P] Ejecutar comprobación de tipos con `npx tsc --noEmit` garantizando cero errores de TypeScript en modo estricto
- [X] T016 [P] Ejecutar compilación de producción con `npm run build` verificando compatibilidad de empaquetado para GitHub Pages
- [X] T017 Ejecutar los 6 escenarios de verificación manual documentados en `specs/006-hide-empty-traits/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias, arranca inmediatamente.
- **Foundational (Phase 2)**: Depende de Setup. Bloquea las historias de UI con edición dual.
- **User Story 1 (Phase 3)**: Depende de Phase 1 (no depende estrictamente de Phase 2, pero sigue el orden arquitectónico).
- **User Story 2 (Phase 4)**: Depende de Phase 3.
- **User Story 3 (Phase 5)**: Depende de Phase 2 (funciones de dominio y handlers de `App.tsx`).
- **User Story 4 (Phase 6)**: Depende de Phase 5.
- **Polish (Phase 7)**: Depende de todas las historias completadas.

### Parallel Opportunities

- **Fase 2**: Tests unitarios T002 y T003 pueden desarrollarse en paralelo con las funciones T004 y T005.
- **Fase 5**: Modales de edición T009 y T010 en `DailyResourcesTracker` pueden coordinarse con T011 en `ResourceCard`.
- **Fase 7**: T014 (`npm test`), T015 (`tsc --noEmit`) y T016 (`npm run build`) son independientes.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Completar Setup y Foundational (Phase 1 y 2).
2. Completar T007 (User Story 1).
3. **Validar MVP**: El resumen de recursos diarios oculta `Rasgos: 0/0` cuando no hay rasgos limitados.

### Incremental Delivery
1. Añadir User Story 2 (T008): Limpieza visual de filas en Recursos Diarios (solo lápiz, sin +/-).
2. Añadir User Story 3 (T009-T012): Modales de edición dual para rectificar gastos accidentales de magia y rasgos.
3. Añadir User Story 4 (T013): Verificación del botón "Usar" en el catálogo.
4. Pulido final (T014-T017): Tests, tipado, build y escenarios E2E de `quickstart.md`.
