# UI Contracts: Shared Spell Slots & Documentation URL

**Feature**: `002-shared-spell-slots`  
**Date**: 2026-10-15  
**Status**: Complete  

## 1. Ergonomic Touch Layout & Viewport Rules

- **Viewport Base**: Móvil desde 360px (`w-full max-w-lg mx-auto`).
- **Hitboxes Táctiles**: Todos los botones de incremento/decremento de espacios por nivel, botones de gasto en tarjetas y botones de enlace exterior deben tener un área mínima de `44px × 44px`.

---

## 2. Component Event Contracts

### 2.1 Gestor de Espacios de Conjuro (`SpellSlotsTracker`)
- **Visualización**: Fila compacta o acordeón desplegable por cada nivel del 1 al 9.
  - Indicador de nivel: "Nivel 1", "Nivel 2", etc.
  - Contador: `available / max`.
  - Botones táctiles `+1` y `-1`.
  - Botón de edición de `max` (permite definir la cuota diaria del nivel).
- **Eventos**:
  - `onSpendSlot(level: number)`:
    - Descuenta 1 espacio disponible de dicho nivel (mínimo 0).
  - `onRestoreSlot(level: number)`:
    - Recupera 1 espacio disponible de dicho nivel (tope `max`).
  - `onUpdateMaxSlots(level: number, newMax: number)`:
    - Modifica los espacios máximos diarios para ese nivel (`newMax >= 0`).

### 2.2 Tarjeta de Conjuro / Rasgo (`ResourceCard`)
- **Comportamiento para Conjuros**:
  - Si `category === 'spell'` y `spellLevel >= 1`:
    - Muestra badge de nivel: `Nivel {spellLevel}`.
    - El contador de la tarjeta refleja `slots[spellLevel].available / slots[spellLevel].max`.
    - Al pulsar `-1`: dispara `onSpendSpellSlot(spellLevel)` sobre la reserva global.
    - Al pulsar `+1`: dispara `onRestoreSpellSlot(spellLevel)`.
    - Si `slots[spellLevel].available === 0`: el botón de gasto se deshabilita visualmente.
  - Si `category === 'spell'` y `spellLevel === 0`:
    - Muestra badge `Truco (Nivel 0) • Ilimitado` sin botones de consumo de espacios.
  - Si `category === 'feat_trait'`:
    - Mantiene contadores individuales de uso o modo ilimitado.
- **Enlace de Documentación Oficial**:
  - Si `resource.url` está definido y es válido:
    - Muestra botón / enlace táctil: `🌐 Ver reglas oficiales`.
    - Abre la URL en nueva pestaña segura: `window.open(url, '_blank', 'noopener,noreferrer')`.

### 2.3 Modal de Creación / Edición (`ResourceList`)
- Cuando `category === 'spell'`:
  - Muestra selector obligatorio de `Nivel de Conjuro` (0 a 9).
  - Si `spellLevel === 0`, el modo de uso se fija automáticamente a `Ilimitado`.
  - Si `spellLevel >= 1`, el campo `Usos máximos` se oculta (los usos son compartidos).
- Nuevo campo opcional `URL de documentación` (con validación de protocolo `http://` o `https://`).
