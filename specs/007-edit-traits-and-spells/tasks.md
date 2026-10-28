---
description: "Task list for feature 007-edit-traits-and-spells implementation"
---

# Tasks: Edición de Rasgos y Conjuros, Botón Ver Más y Ancho Completo en Recursos Diarios

**Input**: Design documents from `/specs/007-edit-traits-and-spells/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/ui-contracts.md`, `quickstart.md`)

**Prerequisites**: `plan.md`, `spec.md`, `data-model.md`, `contracts/ui-contracts.md`

**Constitution Principle V**: Todas las funciones de mutación y cálculo deben contar con pruebas unitarias exhaustivas en Vitest antes de su integración en la vista.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verificación de entorno de desarrollo y dependencias

- [X] T001 Verificar entorno de pruebas y compilación inicial ejecutando `npm test` y `npx tsc --noEmit` en el repositorio

---

## Phase 2: Foundational (Blocking Domain Logic & Tests)

**Purpose**: Lógica pura de dominio y pruebas unitarias para actualización de detalles de recursos (`url` y `description`) requeridas por el estado y el modal

**⚠️ CRITICAL**: Base requerida para que las historias de usuario manipulen y persistan la URL y la descripción de los recursos de forma segura y tipada

- [X] T002 [P] Implementar pruebas unitarias para `updateResourceDetails` (validando URL con protocolo `http:` o `https:`, normalización de URL vacía a `undefined`, límite de 4000 caracteres en descripción e inmutabilidad de los demás campos de `ResourceItem`) en `tests/domain/resources.test.ts`
- [X] T003 [P] Implementar la interfaz `UpdateResourceDetailsInput` y la función pura `updateResourceDetails(resources, id, details)` en `src/domain/resources.ts`
- [X] T004 Conectar el handler `handleUpdateResourceDetails` en `src/App.tsx` coordinando `updateResourceDetails` con persistencia en LocalStorage y notificación reactiva tipo toast ("Detalles actualizados")

**Checkpoint**: Dominio y tests unitarios en verde (`npm test`). Listos para implementar componentes de UI.

---

## Phase 3: User Story 1 - Edición de URL y Descripción en Modal (Priority: P1) 🎯 MVP

**Goal**: Permitir a los jugadores editar la URL de compendio y el texto descriptivo de cualquier conjuro o rasgo existente mediante un diálogo modal accesible, sin tener que eliminar ni recrear el recurso.

**Independent Test**: Abrir la tarjeta de cualquier conjuro o rasgo existente, pulsar el botón de edición `✏️`, modificar la URL y el texto de la descripción, pulsar "Guardar Cambios" y verificar que la tarjeta refleja inmediatamente los nuevos datos y estos persisten tras recargar el navegador.

### Implementation for User Story 1

- [X] T005 [US1] Añadir prop `onUpdateResourceDetails` en la interfaz `ResourceListProps` y propagarla al renderizar cada `ResourceCard` en `src/components/ResourceList.tsx`
- [X] T006 [US1] Crear el modal de edición de detalles (con inputs para URL y descripción, validación de protocolo `http://` o `https://`, límites de longitud y botones Guardar/Cancelar) e integrar el botón disparador de edición `✏️` en la barra de acciones de la tarjeta en `src/components/ResourceCard.tsx`
- [X] T007 [US1] Conectar la prop `onUpdateResourceDetails` en la invocación de `ResourceList` dentro de `src/App.tsx`

**Checkpoint**: User Story 1 (MVP) completada. La URL y la descripción de cualquier recurso pueden editarse y guardarse en modal persistiendo en LocalStorage.

---

## Phase 4: User Story 2 - Botón de Enlace Externo Compacto con Etiqueta "Ver más" (Priority: P2)

**Goal**: Reducir las dimensiones del botón de acceso al compendio oficial en la tarjeta de recurso y cambiar su etiqueta de "Reglas Oficiales" a "Ver más", optimizando el espacio horizontal en pantallas móviles sin perder el área táctil mínima de 44x44px.

**Independent Test**: Visualizar una tarjeta de recurso con URL configurada y verificar que muestra el botón compacto con la etiqueta "Ver más" y abre el enlace en una pestaña nueva al pulsarse.

### Implementation for User Story 2

- [X] T008 [US2] Actualizar el botón de enlace oficial en `src/components/ResourceCard.tsx` reemplazando la etiqueta de texto por "Ver más", reduciendo su tamaño a estilo compacto (`text-[10px] px-1.5 py-0.5 rounded`) y asegurando el área táctil mínima de 44x44px mediante la clase `.touch-btn`

**Checkpoint**: User Story 2 completada. El botón de enlace externo es compacto, muestra "Ver más" y optimiza el layout horizontal.

---

## Phase 5: User Story 3 - Ancho Completo (100%) para Elementos de Recursos Diarios (Priority: P3)

**Goal**: Asegurar que cada caja contenedora de recursos diarios (espacios de magia por nivel y rasgos limitados) ocupe estrictamente el 100% del ancho disponible de su columna de rejilla (`w-full`), independientemente de la longitud de su texto o nombre.

**Independent Test**: Desplegar el panel de Recursos Diarios con un rasgo de nombre corto (ej. "Ira") y verificar que su contenedor ocupa exactamente el 100% del ancho disponible de su columna alineándose perfectamente con las demás tarjetas.

### Implementation for User Story 3

- [X] T009 [US3] Añadir la clase `w-full` a los contenedores flex de filas de espacios de magia (Nivel 1..9) en `src/components/DailyResourcesTracker.tsx`
- [X] T010 [US3] Añadir la clase `w-full` a los contenedores flex de filas de rasgos limitados en `src/components/DailyResourcesTracker.tsx`

**Checkpoint**: User Story 3 completada. Todas las filas en la sección de Recursos Diarios se expanden al 100% del ancho disponible de su celda de forma simétrica.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificación final, regresiones, tipado estricto y build de producción

- [X] T011 [P] Ejecutar la suite completa de pruebas unitarias en `tests/domain/` con `npm test` verificando que todos los tests pasen en verde
- [X] T012 [P] Ejecutar comprobación de tipos estricta con `npx tsc --noEmit` asegurando cero errores de compilación
- [X] T013 [P] Ejecutar compilación de producción con `npm run build` validando la generación limpia del bundle estático
- [X] T014 Ejecutar los 8 escenarios de validación interactivos documentados en `specs/007-edit-traits-and-spells/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias, arranca inmediatamente.
- **Foundational (Phase 2)**: Depende de Setup. Bloquea las historias de UI con edición de detalles (US1).
- **User Stories (Phase 3+)**:
  - **User Story 1 (P1)**: Depende de Foundational (Phase 2).
  - **User Story 2 (P2)**: Puede desarrollarse de forma independiente o sobre `ResourceCard.tsx`.
  - **User Story 3 (P3)**: Independiente de US1 y US2, opera exclusivamente sobre `DailyResourcesTracker.tsx`.
- **Polish (Phase 6)**: Depende de la finalización de las historias de usuario seleccionadas.

### Parallel Opportunities

- `T002` (Tests en `tests/domain/resources.test.ts`) y `T003` (Implementación en `src/domain/resources.ts`) pueden implementarse en flujo TDD.
- `T009` y `T010` (US3 en `DailyResourcesTracker.tsx`) pueden desarrollarse en paralelo con US1 y US2 (`ResourceCard.tsx`).
- `T011`, `T012` y `T013` (Polish) pueden ejecutarse en paralelo.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Setup (T001) y Foundational (T002, T003, T004).
2. Completar User Story 1 (T005, T006, T007).
3. **Validar MVP**: Probar edición de URL y descripción en el modal y confirmar persistencia en LocalStorage.

### Incremental Delivery

1. Setup + Foundational → Base de dominio testeada y lista.
2. Añadir User Story 1 → MVP operativo de edición en modal.
3. Añadir User Story 2 → Botón "Ver más" compacto listo.
4. Añadir User Story 3 → Filas al 100% de ancho en Recursos Diarios.
5. Validación y Polish final → Tests, tipado, build y verificación manual rápida.
