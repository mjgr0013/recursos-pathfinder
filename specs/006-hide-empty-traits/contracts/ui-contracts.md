# UI Contracts: Hide Empty Traits & Flexible Resource Editing

**Feature**: `006-hide-empty-traits`
**Date**: 2026-10-15
**Status**: Draft

## 1. Ergonomic Touch Layout & Hitbox Standards

- **Hitbox Mínimo**: Todo botón interactivo (lápiz `✏️`, acción `Usar`, botones de modal) DEBE cumplir un área táctil mínima de `44px × 44px`.
- **Adaptabilidad 360px**: Las filas de recursos diarios y los modales deben fluir adecuadamente en pantallas estrechas sin desbordamientos horizontales.

---

## 2. Component Interface & Rendering Contracts

### 2.1 Cabecera de `DailyResourcesTracker`

```typescript
const hasActiveMagic = maxActiveLevel > 0;
const hasActiveTraits = limitedTraits.length > 0;
```

- **Condición de Subtítulo**:
  - Si `hasActiveMagic && hasActiveTraits`:
    `<p>Magia: {avail}/{max} • Rasgos: {avail}/{max}</p>`
  - Si `hasActiveMagic && !hasActiveTraits`:
    `<p>Magia: {avail}/{max}</p>`
  - Si `!hasActiveMagic && hasActiveTraits`:
    `<p>Rasgos: {avail}/{max}</p>`
  - Si `!hasActiveMagic && !hasActiveTraits`:
    `<p>Sin recursos diarios activos</p>`

### 2.2 Filas de Rasgos Diarios en `DailyResourcesTracker`

- Estructura simétrica a las filas de espacios de conjuros:
  - **Izquierda**: Nombre del rasgo (`text-amber-200 font-bold truncate`).
  - **Derecha**:
    - Conteo: `{available} / {max} usos` (resaltado `text-rose-400` si está en 0).
    - Botón de edición: `[ ✏️ ]` (`touch-btn w-10 h-10 bg-slate-800 ...`).
  - **Eliminación**: No existen botones de `-1` ni `+1` en la fila.

### 2.3 Modales de Edición Dual (Espacios de Magia y Rasgos)

#### Modal de Espacios de Conjuro (`DailyResourcesTracker`)
- **Inputs**:
  1. `Disponibles` (`min={0}`, `max={maxVal}`): campo numérico para rectificar espacios gastados por error.
  2. `Máximos` (`min={0}`): campo numérico para configurar espacios totales del nivel.
- **Acción Guardar**: Invoca `onUpdateSlotValues(level, available, max)`.

#### Modal de Rasgos Limitados (`DailyResourcesTracker` y `ResourceCard`)
- **Inputs**:
  1. `Disponibles` (`min={0}`, `max={maxVal}`): campo numérico para rectificar usos consumidos por error.
  2. `Máximos` (`min={1}`): campo numérico para configurar usos diarios totales.
- **Acción Guardar**: Invoca `onUpdateResourceUses(id, available, max)`.

### 2.4 Tarjeta de Catálogo (`ResourceCard`)
- **Sección de Acción**:
  - Conteo numérico con botón lápiz `[✏️]`.
  - Botón de acción directa `⚡ Usar` (min 44px de alto). Deshabilitado si `available === 0`.
  - Ausencia absoluta de botones `-1` o `+1`.
