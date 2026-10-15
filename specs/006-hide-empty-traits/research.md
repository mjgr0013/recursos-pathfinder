# Architectural & Implementation Research: Hide Empty Traits & Flexible Resource Editing

**Feature Branch**: `006-hide-empty-traits`
**Date**: 2026-10-15

## Decisions & Technical Rationales

### 1. Visibilidad Condicional en la Cabecera de Recursos Diarios

- **Decisión**: Derivar la visibilidad de los contadores en la cabecera directamente de `maxActiveLevel > 0` (para Magia) y `limitedTraits.length > 0` (para Rasgos).
- **Lógica de renderizado**:
  - Si `maxActiveLevel > 0` y `limitedTraits.length > 0`: Mostrar `Magia: X/Y • Rasgos: A/B`.
  - Si `maxActiveLevel > 0` y `limitedTraits.length === 0`: Mostrar únicamente `Magia: X/Y`.
  - Si `maxActiveLevel === 0` y `limitedTraits.length > 0`: Mostrar únicamente `Rasgos: A/B`.
  - Si `maxActiveLevel === 0` y `limitedTraits.length === 0`: Mostrar el texto neutral `Sin recursos diarios activos`.
- **Alternativas consideradas**:
  - *Dejar "Rasgos: 0/0"*: Rechazado expresamente por el usuario; satura innecesariamente la interfaz móvil en personajes sin rasgos de uso limitado.
  - *Ocultar completamente el subtítulo si no hay recursos*: Rechazado; dejaría la cabecera vacía bajo el título, lo cual desconcierta visualmente. Un mensaje explícito ("Sin recursos diarios activos") comunica claridad.

### 2. Homogeneización de Filas de Rasgos en `DailyResourcesTracker`

- **Decisión**: Eliminar los botones interactivos `-1` y `+1` de las tarjetas de rasgos en el panel de `DailyResourcesTracker`, replicando la estructura limpia utilizada en los espacios de magia:
  - Lado izquierdo: Nombre del rasgo (`text-xs font-black text-amber-200 truncate`).
  - Lado derecho:
    - Indicador numérico: `{available} <span className="text-xs text-slate-500 font-bold">/ {max} usos</span>` (con resaltado en `rose-400` si está agotado).
    - Botón de edición táctil (lápiz `✏️`) con dimensiones accesibles (40x40px / min 44px touch container).
- **Rationale**:
  - Evita duplicación de controles de gasto. El gasto se realiza a través de las acciones principales de combate en el catálogo ("Usar" / "Lanzar"), y el restablecimiento general se ejecuta con el "Descanso Largo".
  - Logra coherencia estética y espacial idéntica entre la sección de Magia y la sección de Rasgos.

### 3. Edición Dual en Modales de Espacios y Rasgos (Disponibles y Máximos)

- **Decisión**: Extender los formularios de edición de espacios de conjuros y de rasgos de uso limitado para que incluyan dos campos numéricos editables:
  1. **Disponibles / Actuales**: Permite corregir cualquier pulsación involuntaria sobre "Usar" o "Lanzar".
  2. **Máximos**: Permite alterar el tope del recurso por progresión de nivel o bonificadores.
- **Validación e Invariantes**:
  - Para espacios de conjuro:
    - `max >= 0`
    - `available = Math.max(0, Math.min(max, available))`
  - Para rasgos limitados:
    - `maxUses >= 1`
    - `availableUses = Math.max(0, Math.min(maxUses, availableUses))`
- **Funciones de dominio puras (Constitution Principle V)**:
  - Crear `updateSpellSlotValues(slots: SpellSlotsMap, level: number, newAvailable: number, newMax: number): SpellSlotsMap` en `src/domain/spells.ts`.
  - Crear `updateResourceUses(resources: ResourceItem[], id: string, newAvailable: number, newMax: number): ResourceItem[]` en `src/domain/resources.ts`.
  - Mantener compatibilidad hacia atrás o sustituir `updateSpellSlotMax` y `updateResourceMaxUses` según convenga.

### 4. Gasto Centralizado en el Botón "Usar" del Catálogo

- **Decisión**: Mantener el botón destacado `⚡ Usar` en las tarjetas de rasgos (`ResourceCard.tsx`), el cual descuenta un uso mediante `onSpend(resource.id)` y se deshabilita cuando `availableUses === 0`.
- **Modal de edición en `ResourceCard`**: También se actualizará para incluir los dos campos (disponibles y máximos), manteniendo la misma experiencia si el usuario decide editar desde la tarjeta en el catálogo o desde el panel unificado de recursos diarios.

### 5. Testing y Verificación Desacoplada

- **Decisión**: Desarrollar suites de pruebas unitarias en `tests/domain/spells.test.ts` y `tests/domain/resources.test.ts` para verificar:
  - Corrección de límites (`available` no negativo, no superior a `max`).
  - Ajuste automático si el usuario eleva o reduce el máximo por debajo del actual.
  - Rectificación manual de usos tras gasto accidental.
