# UI Contracts: Cast Button Action & Clean Slot Controls

**Feature**: `005-cast-button-and-clean-slots`  
**Date**: 2026-10-15  
**Status**: Complete  

## 1. Ergonomic Touch Layout & Hitbox Standards

- **Hitbox Mínimo**: Todos los botones de acción ("Lanzar", "Usar", "✏️") deben tener un área táctil mínima de `44px × 44px`.

---

## 2. Component Event Contracts

### 2.1 Tarjeta de Recurso (`ResourceCard`)
- **Sección de Acción Principal**:
  - En lugar de botones `+1` / `-1`, se renderiza:
    - Indicador numérico: `disp / máx` (para que el jugador consulte su saldo).
    - Botón de acción:
      - Si es conjuro con `spellLevel >= 1`: botón `✨ Lanzar` (púrpura). Deshabilitado como `Sin espacios` si `available === 0`.
      - Si es rasgo con `usageMode === 'limited'`: botón `⚡ Usar` (o `Lanzar`, ámbar). Deshabilitado como `Sin usos` si `available === 0`.
      - Si es truco (nivel 0): botón `✨ Lanzar (A voluntad)` (esmeralda/azul).
- **Feedback Táctil**: Al pulsar, activa una breve animación visual de escala (`active:scale-95 duration-75`) y destello.

### 2.2 Filas de Espacios de Magia (`DailyResourcesTracker`)
- Cada nivel activo de conjuro muestra:
  - `[ 🔮 Niv {lvl} ]`
  - Contador: `{slot.available} / {slot.max} espacios`
  - Botón: `[ ✏️ ]` (editar capacidad máxima).
  - Suprimidos definitivamente los botones `-1` y `+1` en las filas de espacios de magia.

### 2.3 Modal de Datos (`BackupModal`)
- Al pulsar "Sí, reiniciar":
  - Ejecuta `onResetCharacter()`.
  - Ejecuta inmediatamente `onClose()`.
