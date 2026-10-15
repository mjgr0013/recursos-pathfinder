# UI Contracts: Unified Daily Resources & Dynamic Spell Slots

**Feature**: `003-unified-daily-resources`  
**Date**: 2026-10-15  
**Status**: Complete  

## 1. Ergonomic Touch Layout Principles

- **Ubicación en Pantalla**: El panel `DailyResourcesTracker` se sitúa en la parte superior del cuerpo principal, inmediatamente debajo del monitor de puntos de vida (`HealthTracker`) y antes del catálogo general (`ResourceList`).
- **Hitboxes Táctiles**: Todos los botones de incremento/decremento (`+1`, `-1`), botones de edición (`✏️`) y botones de habilitación de nivel cumplen con el estándar mínimo de `44px × 44px`.

---

## 2. Component Event Contracts

### 2.1 Panel Unificado de Recursos Diarios (`DailyResourcesTracker`)
- **Props**:
  - `spellSlots: SpellSlotsMap`
  - `resources: ResourceItem[]`
  - `onSpendSlot: (level: number) => void`
  - `onRestoreSlot: (level: number) => void`
  - `onUpdateMaxSlots: (level: number, newMax: number) => void`
  - `onSpendResource: (id: string) => void`
  - `onRestoreResource: (id: string) => void`
  - `onUpdateResourceMaxUses: (id: string, newMax: number) => void`

### 2.2 Subsección: Espacios de Magia (Dinámica)
- Solo renderiza filas para los niveles `1 <= lvl <= maxActiveLevel`.
- Si `maxActiveLevel < 9`, ofrece un botón táctil minimalista: `➕ Habilitar Nivel {maxActiveLevel + 1}`.
- Cada nivel muestra:
  - Etiqueta `Niv {lvl}`
  - Contador `available / max`
  - Botón `-1` (deshabilitado si `available === 0`)
  - Botón `+1` (deshabilitado si `available === max`)
  - Botón `✏️` para editar espacios máximos.

### 2.3 Subsección: Rasgos y Dotes (Usos Diarios)
- Filtra `resources.filter(r => r.category === 'feat_trait' && r.usageMode === 'limited')`.
- Si no hay ninguno, muestra mensaje discreto: *"Sin rasgos de uso limitado registrados"*.
- Cada rasgo muestra:
  - Nombre del rasgo (ej. *Canalizar Energía*)
  - Contador `availableUses / maxUses`
  - Botón `-1` y botón `+1`
  - Botón `✏️` para ajustar sus usos máximos.
