# Research & Technical Decisions: Shared Spell Slots by Level & Documentation URL

**Feature**: `002-shared-spell-slots`  
**Date**: 2026-10-15  
**Status**: Resolved  

## Research Topics & Decisions

---

### 1. Modelado de Espacios de Conjuro Compartidos (Spell Slots)

- **Contexto**: En Pathfinder, los lanzadores de conjuros tienen una cuota diaria de espacios (slots) por nivel (niveles 1 al 9). Cualquier conjuro de nivel N que se lance consume un espacio de dicha reserva.
- **Decisión**: Estructura de registro tipada en el estado del personaje:
  ```typescript
  export interface SpellSlotLevel {
    level: number;       // 1 a 9
    max: number;         // Espacios máximos diarios (>= 0)
    available: number;   // Espacios disponibles actuales (0..max)
  }
  export type SpellSlotsMap = Record<number, SpellSlotLevel>;
  ```
  - Los 9 niveles (1 al 9) se inicializan siempre en la ficha.
  - Para los conjuros de nivel 0 (trucos/cantrips), no consumen espacios (`usageMode: 'unlimited'`).
  - Para conjuros de nivel 1 a 9, el gasto y la recuperación se delegan en la función de dominio pura `spendSpellSlot` y `restoreSpellSlot`.
- **Razón**: Permite acceso $O(1)$ por nivel, tipado estricto, cálculos matemáticos desacoplados testeables con Vitest y total consistencia con las reglas oficiales.
- **Alternativas consideradas**:
  - *Mantener contadores individuales y sincronizarlos mediante efectos*: Propenso a condiciones de carrera y desincronización de estado; viola el principio de única fuente de verdad.

---

### 2. Campo URL y Apertura Segura de Enlaces Externos

- **Contexto**: Se solicita un campo opcional `url` en cada recurso para enlazar a compendios o reglas oficiales (Archives of Nethys, d20pfsrd, etc.).
- **Decisión**:
  - Atributo `url?: string` en `ResourceItem` (longitud máxima 500 caracteres).
  - Validación con expresión regular o constructor `URL` nativo para permitir exclusivamente protocolos seguros (`http:` o `https:`).
  - Renderizado en `ResourceCard` mediante enlace semántico:
    `<a href={resource.url} target="_blank" rel="noopener noreferrer" className="touch-btn ...">`
- **Razón**: Máxima seguridad web (previene ataques de tab-nabbing mediante `noopener,noreferrer`), no requiere librerías externas y ofrece experiencia nativa al usuario en móviles.

---

### 3. Retrocompatibilidad y Migración de Esquema JSON (v1.0.0 a v1.1.0)

- **Contexto**: Las fichas exportadas con la versión `1.0.0` no contienen la propiedad `spellSlots` ni los campos `spellLevel` o `url` en sus recursos.
- **Decisión**: Actualización semántica a `schemaVersion: '1.1.0'` con migración automática:
  - El validador en `src/domain/backup.ts` acepta tanto `1.0.0` como `1.1.0`.
  - Al detectar `1.0.0`, la función normalizadora genera los 9 niveles de `spellSlots` (con `max: 0, available: 0`, salvo si hay conjuros existentes que asigna espacios iniciales básicos) y asigna `spellLevel: 1` a conjuros preexistentes sin nivel definido.
- **Razón**: Cumple con el principio de soberanía y no pérdida de datos del usuario, asegurando que ninguna ficha previamente guardada quede inutilizada.

---

### 4. Ergonomía Táctil y Visualización en Móviles (≥360px)

- **Contexto**: El jugador debe poder consultar y ajustar los espacios de magia y lanzar conjuros rápidamente en la mesa de juego con una sola mano.
- **Decisión**:
  - Incorporar un panel colapsable / carrusel de espacios de conjuro (`SpellSlotsTracker`) en la parte superior de la lista de conjuros.
  - Cada nivel de conjuro activo muestra un contador visual rápido y botones de incremento y decremento con hitbox mínimo de `44x44px`.
  - Cada tarjeta de conjuro de nivel N muestra claramente su nivel ("Nivel 1") y cuántos espacios de nivel N quedan disponibles en la reserva global.
- **Razón**: Evita la fatiga visual, minimiza toques en pantalla y previene errores al lanzar hechizos durante el combate.
